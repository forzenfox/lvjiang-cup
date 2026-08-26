import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Toaster, toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Trophy,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getActiveFormat,
  listFormats,
  createFormat,
  updateFormat,
  deleteFormat,
  activateFormat,
  deactivateFormat,
  generateSlots,
  type ResolvedActiveFormat,
} from '@/services/formatService';
import {
  BUILTIN_DEFAULT_FORMAT,
  validateFormat,
  buildSwissColumns,
  buildEliminationStages,
  resolveBo,
  type BoFormat,
  type FormatConfig,
  type StageType,
  type SwissBoRule,
} from '@/lib/format';
import type { FormatRecord } from '@/api/format';

// ==================== 表单常量 ====================

/** 瑞士轮队伍数选项（PRD 2.2.2：偶数，结构合法性由校验兜底） */
const SWISS_TEAM_OPTIONS = [4, 8, 16, 32];
/** 淘汰赛队伍数选项（必须为 2 的幂） */
const ELIMINATION_TEAM_OPTIONS = [2, 4, 8, 16];
/** 瑞士轮晋级阈值选项（本期对称：淘汰阈值 = 晋级阈值） */
const THRESHOLD_OPTIONS = [2, 3];

/** 淘汰赛各级默认名称（从决赛倒推：决赛 / 半决赛 / 八强赛 / 十六强赛…） */
function defaultRoundNames(teamCount: number): string[] {
  const levels = Math.log2(teamCount);
  const fromFinal = ['决赛', '半决赛', '八强赛', '十六强赛'];
  return Array.from({ length: levels }, (_, i) => fromFinal[levels - 1 - i] ?? `第${i + 1}轮`);
}

/**
 * 表单赛段草稿（拍平 swiss / elimination 类型字段，便于受控编辑）
 * 提交时由 buildFormatConfig 组装回 FormatConfig
 */
interface StageDraft {
  type: StageType;
  name: string;
  teamCount: number;
  /** 瑞士轮：晋级阈值（淘汰阈值联动对称） */
  winThreshold: number;
  /** 瑞士轮：BO 规则 */
  boRule: SwissBoRule;
  /** 淘汰赛：各级名称（行数 = log2(teamCount)） */
  roundNames: string[];
  /** 淘汰赛：各级统一 BO */
  boFormat: BoFormat;
}

function createSwissDraft(): StageDraft {
  return {
    type: 'swiss',
    name: '瑞士轮',
    teamCount: 16,
    winThreshold: 3,
    boRule: 'auto',
    roundNames: [],
    boFormat: 'BO3',
  };
}

function createEliminationDraft(): StageDraft {
  return {
    type: 'elimination',
    name: '淘汰赛',
    teamCount: 8,
    winThreshold: 3,
    boRule: 'auto',
    roundNames: defaultRoundNames(8),
    boFormat: 'BO5',
  };
}

/** 从已保存配置还原表单草稿 */
function draftFromConfig(config: FormatConfig): StageDraft[] {
  return config.stages.map(stage => ({
    type: stage.type,
    name: stage.name,
    teamCount: stage.teamCount,
    winThreshold: stage.type === 'swiss' ? stage.winThreshold : 3,
    boRule: stage.type === 'swiss' ? stage.boRule : 'auto',
    roundNames: stage.type === 'elimination' ? [...stage.roundNames] : [],
    boFormat: stage.type === 'elimination' ? stage.boFormat : 'BO3',
  }));
}

/** 将表单草稿组装为 FormatConfig（补齐 advanceToStage / 对称淘汰阈值等推导字段） */
function buildFormatConfig(name: string, drafts: StageDraft[]): FormatConfig {
  return {
    version: 1,
    name,
    stages: drafts.map((draft, index) => {
      const isLast = index === drafts.length - 1;
      if (draft.type === 'swiss') {
        return {
          type: 'swiss' as const,
          name: draft.name,
          teamCount: draft.teamCount,
          winThreshold: draft.winThreshold,
          lossThreshold: draft.winThreshold, // 本期对称阈值
          boRule: draft.boRule,
          advanceToStage: isLast ? null : index + 1,
        };
      }
      return {
        type: 'elimination' as const,
        name: draft.name,
        teamCount: draft.teamCount,
        advanceToStage: null,
        roundNames: draft.roundNames,
        boFormat: draft.boFormat,
      };
    }),
  };
}

// ==================== 结构摘要（内置卡片与实时预览共用） ====================

interface FormatSummary {
  /** 每轮 / 每级明细行 */
  detailLines: string[];
  /** 每段合计行 */
  stageLines: string[];
  /** 合计槽位数 */
  totalSlots: number;
}

/** 基于视图模型推导函数生成结构摘要（PRD 2.2.2 实时预览） */
function summarizeFormat(config: FormatConfig): FormatSummary {
  const detailLines: string[] = [];
  const stageLines: string[] = [];
  let totalSlots = 0;

  for (const stage of config.stages) {
    if (stage.type === 'swiss') {
      const columns = buildSwissColumns(stage);
      let stageMatches = 0;
      for (const column of columns) {
        const matchRecords = column.records.filter(record => record.type === 'matches');
        if (matchRecords.length === 0) continue;
        stageMatches += matchRecords.reduce((sum, record) => sum + record.matchCount, 0);
        const parts = matchRecords.map(
          record =>
            `${record.record}×${record.matchCount}场（${resolveBo(
              record.record,
              stage.winThreshold,
              stage.lossThreshold,
              stage.boRule
            )}）`
        );
        detailLines.push(`${column.name}：${parts.join('、')}`);
      }
      stageLines.push(`${stage.name}合计：${columns.length - 1} 轮 · ${stageMatches} 场`);
      totalSlots += stageMatches;
    } else {
      const viewModel = buildEliminationStages(stage);
      for (const stageInfo of viewModel.stages) {
        detailLines.push(`${stageInfo.name}：${stageInfo.matchCount}场（${stage.boFormat}）`);
      }
      stageLines.push(`${stage.name}合计：${viewModel.games.length} 场`);
      totalSlots += viewModel.games.length;
    }
  }

  return { detailLines, stageLines, totalSlots };
}

/** 内置默认配置的结构摘要（模块级常量，只读展示） */
const BUILTIN_SUMMARY = summarizeFormat(BUILTIN_DEFAULT_FORMAT);

// ==================== 页面组件 ====================

/**
 * 管理后台 - 赛制配置页（PRD 2.2.2 / 技术设计方案 §7.5）
 *
 * 功能：
 * - 列表区：内置默认配置卡片（置顶只读）+ 用户配置列表（激活 / 停用 / 删除 / 编辑）
 * - 新建/编辑表单：赛段序列编辑器（按赛段类型动态渲染字段）+ 实时预览与校验
 * - 应用并生成：激活 → 二次确认（含预计场次数）→ 生成槽位（幂等）
 */
const AdminFormatConfig: React.FC = () => {
  // —— 列表数据 ——
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<FormatRecord[]>([]);
  const [activeFormat, setActiveFormat] = useState<ResolvedActiveFormat | null>(null);

  // —— 表单状态 ——
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [stages, setStages] = useState<StageDraft[]>([]);
  const [saving, setSaving] = useState(false);

  // —— 列表操作状态 ——
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // —— 确认框状态 ——
  const [generateTarget, setGenerateTarget] = useState<FormatRecord | null>(null);
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormatRecord | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [active, formatRecords] = await Promise.all([getActiveFormat(), listFormats()]);
      setActiveFormat(active);
      setRecords(formatRecords);
    } catch (error) {
      console.error('Failed to load format configs:', error);
      toast.error('加载赛制配置失败');
    } finally {
      setLoading(false);
    }
  };

  // ==================== 表单派生数据（实时校验与预览） ====================

  const draftConfig = useMemo(() => buildFormatConfig(name, stages), [name, stages]);

  const errors = useMemo(() => {
    const list = validateFormat(draftConfig);
    if (!name.trim()) {
      list.unshift('配置名称不能为空');
    }
    return list;
  }, [draftConfig, name]);

  const previewSummary = useMemo(
    () => (errors.length === 0 ? summarizeFormat(draftConfig) : null),
    [errors, draftConfig]
  );

  // ==================== 表单操作 ====================

  const handleNew = () => {
    setEditingId(null);
    setName('');
    setStages([createSwissDraft()]);
    setFormOpen(true);
  };

  const handleEdit = (record: FormatRecord) => {
    setEditingId(record.id);
    setName(record.config.name);
    setStages(draftFromConfig(record.config));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setName('');
    setStages([]);
  };

  const updateStage = (index: number, patch: Partial<StageDraft>) => {
    setStages(prev => prev.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)));
  };

  /** 类型切换：重置为该类型默认草稿（字段结构不同，直接替换最直观） */
  const handleTypeChange = (index: number, type: string) => {
    setStages(prev =>
      prev.map((stage, i) =>
        i === index ? (type === 'swiss' ? createSwissDraft() : createEliminationDraft()) : stage
      )
    );
  };

  /** 淘汰赛队伍数变化：按 log2(teamCount) 重建各级名称输入行（默认名） */
  const handleEliminationTeamCountChange = (index: number, value: string) => {
    const teamCount = Number(value);
    updateStage(index, { teamCount, roundNames: defaultRoundNames(teamCount) });
  };

  const addStage = () => {
    setStages(prev => [...prev, createSwissDraft()]);
  };

  const removeStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (errors.length > 0 || saving) return;
    setSaving(true);
    try {
      const config = buildFormatConfig(name.trim(), stages);
      if (editingId) {
        await updateFormat(editingId, config);
        toast.success('赛制配置已更新');
      } else {
        await createFormat(config, config.name);
        toast.success('赛制配置已保存');
      }
      closeForm();
      await loadData();
    } catch (error) {
      // 后端校验失败时展示后端返回的错误信息
      toast.error(error instanceof Error ? error.message : '保存赛制配置失败');
    } finally {
      setSaving(false);
    }
  };

  // ==================== 列表操作 ====================

  /** 仅激活（不生成赛程） */
  const handleActivate = async (record: FormatRecord) => {
    setActionLoadingId(record.id);
    try {
      await activateFormat(record.id);
      toast.success(`已激活配置「${record.name}」`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '激活赛制配置失败');
    } finally {
      setActionLoadingId(null);
    }
  };

  /** 激活并生成：激活成功后弹出二次确认框（含预计场次数） */
  const handleActivateAndGenerate = async (record: FormatRecord) => {
    setActionLoadingId(record.id);
    try {
      await activateFormat(record.id);
      setGenerateTarget(record);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '激活赛制配置失败');
    } finally {
      setActionLoadingId(null);
    }
    loadData(); // 激活后刷新生效状态（不阻塞确认框交互）
  };

  /** 确认生成：调用幂等生成接口，toast 展示 created / skipped */
  const handleConfirmGenerate = async () => {
    if (!generateTarget) return;
    setGenerating(true);
    try {
      const result = await generateSlots(generateTarget.id);
      toast.success(`赛程生成完成：新建 ${result.created} 场，跳过 ${result.skipped} 场`);
      setGenerateTarget(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '生成赛程失败');
    } finally {
      setGenerating(false);
    }
  };

  /** 停用全部配置（切回内置默认） */
  const handleDeactivate = async () => {
    try {
      await deactivateFormat();
      toast.success('已切回内置默认配置');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '切回默认配置失败');
    }
  };

  /** 确认删除（已激活配置由后端拒绝并 toast 错误） */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFormat(deleteTarget.id);
      toast.success('赛制配置已删除');
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除赛制配置失败');
      setDeleteTarget(null);
    }
  };

  // ==================== 渲染 ====================

  const builtinIsActive = activeFormat?.source === 'builtin';

  return (
    <AdminLayout>
      <Toaster position="top-right" theme="dark" />

      <div className="space-y-6">
        {/* 标题区 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <SlidersHorizontal className="w-8 h-8 text-blue-500" />
              赛制配置
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              配置赛段序列（瑞士轮 / 单败淘汰），保存后可激活并一键生成赛程槽位
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button data-testid="new-format-button" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" /> 新建赛制
            </Button>
          </div>
        </div>

        {/* 当前生效状态 */}
        <div
          data-testid="active-format-banner"
          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-blue-500/30 bg-blue-500/10"
        >
          <CheckCircle className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-300">当前生效：</span>
          <span data-testid="active-format-name" className="text-sm font-semibold text-white">
            {activeFormat?.config.name ?? '加载中...'}
          </span>
        </div>

        {/* 列表区 */}
        {loading && records.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            加载中...
          </div>
        ) : (
          <div className="space-y-4">
            {/* 内置默认配置卡片（置顶、只读） */}
            <Card data-testid="builtin-format-card" className="bg-[#0F172A] border-white/10 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                      内置默认
                    </span>
                    {builtinIsActive && (
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-600/30 text-blue-400">
                        当前生效
                      </span>
                    )}
                  </div>
                  <h3 className="text-white text-lg font-semibold mt-2">
                    {BUILTIN_DEFAULT_FORMAT.name}
                  </h3>
                </div>
                <span className="text-xs text-gray-500">只读 · 不可编辑</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-400">
                {BUILTIN_SUMMARY.stageLines.map(line => (
                  <div key={line}>{line}</div>
                ))}
                <div className="text-gray-300">合计槽位：{BUILTIN_SUMMARY.totalSlots} 场</div>
              </div>
            </Card>

            {/* 用户配置列表 */}
            {records.map(record => {
              const summary = summarizeFormat(record.config);
              return (
                <Card
                  key={record.id}
                  data-testid={`format-record-${record.id}`}
                  className="bg-[#0F172A] border-white/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white text-lg font-semibold truncate">{record.name}</h3>
                        {record.isActive && (
                          <span className="px-2 py-0.5 text-xs rounded bg-blue-600/30 text-blue-400">
                            当前生效
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        创建时间：
                        {record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-gray-400">
                        {summary.stageLines.map(line => (
                          <div key={line}>{line}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {!record.isActive && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            data-testid={`activate-format-${record.id}`}
                            onClick={() => handleActivate(record)}
                            disabled={actionLoadingId === record.id}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            激活
                          </Button>
                          <Button
                            size="sm"
                            data-testid={`activate-generate-${record.id}`}
                            onClick={() => handleActivateAndGenerate(record)}
                            disabled={actionLoadingId === record.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {actionLoadingId === record.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            激活并生成
                          </Button>
                        </>
                      )}
                      {record.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`deactivate-format-${record.id}`}
                          onClick={handleDeactivate}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          停用
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`edit-format-${record.id}`}
                        onClick={() => handleEdit(record)}
                        aria-label="编辑"
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`delete-format-${record.id}`}
                        onClick={() => setDeleteTarget(record)}
                        aria-label="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* 新建 / 编辑表单（赛段序列编辑器） */}
        {formOpen && (
          <Card className="bg-[#0F172A] border-white/10 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingId ? '编辑赛制' : '新建赛制'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeForm} aria-label="关闭表单">
                <X className="w-5 h-5 text-gray-400" />
              </Button>
            </div>

            {/* 配置名称 */}
            <Input
              data-testid="format-name-input"
              label="配置名称"
              placeholder="如：第三届 16队瑞士轮+8强"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            {/* 赛段列表 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#94A3B8]">赛段列表（顺序即赛程先后）</h3>
                <Button
                  size="sm"
                  variant="outline"
                  data-testid="add-stage-button"
                  onClick={addStage}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> 添加赛段
                </Button>
              </div>

              {stages.map((stage, index) => (
                <Card
                  key={index}
                  data-testid={`stage-card-${index}`}
                  className="bg-white/5 border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                      {stage.type === 'swiss' ? (
                        <Calendar className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      )}
                      赛段 {index + 1} · {stage.type === 'swiss' ? '瑞士轮' : '单败淘汰'}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      data-testid={`remove-stage-${index}`}
                      onClick={() => removeStage(index)}
                      aria-label="删除赛段"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 赛段类型 */}
                    <Select
                      data-testid={`stage-${index}-type`}
                      label="赛段类型"
                      value={stage.type}
                      onChange={value => handleTypeChange(index, value)}
                      options={[
                        { value: 'swiss', label: '瑞士轮' },
                        { value: 'elimination', label: '单败淘汰' },
                      ]}
                    />

                    {/* 队伍数（按类型给出合法选项） */}
                    {stage.type === 'swiss' ? (
                      <Select
                        data-testid={`stage-${index}-team-count`}
                        label="队伍数"
                        value={String(stage.teamCount)}
                        onChange={value => updateStage(index, { teamCount: Number(value) })}
                        options={SWISS_TEAM_OPTIONS.map(count => ({
                          value: String(count),
                          label: `${count} 队`,
                        }))}
                      />
                    ) : (
                      <Select
                        data-testid={`stage-${index}-team-count`}
                        label="队伍数（2 的幂）"
                        value={String(stage.teamCount)}
                        onChange={value => handleEliminationTeamCountChange(index, value)}
                        options={ELIMINATION_TEAM_OPTIONS.map(count => ({
                          value: String(count),
                          label: `${count} 队`,
                        }))}
                      />
                    )}

                    {/* 类型特有字段 */}
                    {stage.type === 'swiss' ? (
                      <>
                        <Select
                          data-testid={`stage-${index}-threshold`}
                          label="晋级阈值（淘汰阈值对称联动）"
                          value={String(stage.winThreshold)}
                          onChange={value => updateStage(index, { winThreshold: Number(value) })}
                          options={THRESHOLD_OPTIONS.map(threshold => ({
                            value: String(threshold),
                            label: `${threshold} 胜晋级 / ${threshold} 败淘汰`,
                          }))}
                        />
                        <Select
                          data-testid={`stage-${index}-bo-rule`}
                          label="BO 规则"
                          value={stage.boRule}
                          onChange={value => updateStage(index, { boRule: value as SwissBoRule })}
                          options={[
                            { value: 'auto', label: '自动（决定性比赛 BO3）' },
                            { value: 'all-bo1', label: '全 BO1' },
                            { value: 'all-bo3', label: '全 BO3' },
                          ]}
                        />
                      </>
                    ) : (
                      <Select
                        data-testid={`stage-${index}-bo-format`}
                        label="BO 格式"
                        value={stage.boFormat}
                        onChange={value => updateStage(index, { boFormat: value as BoFormat })}
                        options={[
                          { value: 'BO1', label: 'BO1' },
                          { value: 'BO3', label: 'BO3' },
                          { value: 'BO5', label: 'BO5' },
                        ]}
                      />
                    )}
                  </div>

                  {/* 淘汰赛：各级名称（行数 = log2(teamCount)） */}
                  {stage.type === 'elimination' && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-[#94A3B8]">
                        各级名称（从首轮到决赛，共 {stage.roundNames.length} 级）
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {stage.roundNames.map((roundName, roundIndex) => (
                          <Input
                            key={roundIndex}
                            data-testid={`stage-${index}-round-name-${roundIndex}`}
                            label={`第 ${roundIndex + 1} 级名称`}
                            value={roundName}
                            onChange={e =>
                              updateStage(index, {
                                roundNames: stage.roundNames.map((item, i) =>
                                  i === roundIndex ? e.target.value : item
                                ),
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* 实时预览：校验错误或结构摘要 */}
            <div
              data-testid="format-preview"
              className="rounded-lg border border-gray-700 bg-gray-900/50 p-4"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-3">实时预览</h3>
              {errors.length > 0 ? (
                <div data-testid="format-errors" className="space-y-1">
                  {errors.map(error => (
                    <div
                      key={error}
                      data-testid="format-error-item"
                      className="flex items-center gap-2 text-sm text-red-400"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  ))}
                </div>
              ) : previewSummary ? (
                <div className="space-y-1 text-sm">
                  {previewSummary.detailLines.map(line => (
                    <div key={line} className="text-gray-400">
                      {line}
                    </div>
                  ))}
                  {previewSummary.stageLines.map(line => (
                    <div key={line} className="text-gray-300 font-medium">
                      {line}
                    </div>
                  ))}
                  <div className="text-blue-400 font-medium pt-1">
                    合计槽位：{previewSummary.totalSlots} 场
                  </div>
                </div>
              ) : null}
            </div>

            {/* 表单操作 */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={closeForm} disabled={saving}>
                取消
              </Button>
              <Button
                data-testid="save-format-button"
                onClick={handleSave}
                disabled={saving || errors.length > 0}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingId ? '保存修改' : '保存配置'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* 激活并生成 - 二次确认框（含预计场次数预览） */}
      <ConfirmDialog
        isOpen={generateTarget !== null}
        title="激活并生成赛程"
        message={
          generateTarget
            ? `将按「${generateTarget.name}」生成比赛槽位，预计共 ${summarizeFormat(generateTarget.config).totalSlots} 场（已存在会跳过，不覆盖已有比赛数据）。`
            : ''
        }
        confirmText={generating ? '生成中...' : '确认生成'}
        cancelText="取消"
        onConfirm={handleConfirmGenerate}
        onCancel={() => setGenerateTarget(null)}
      />

      {/* 删除确认框 */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="确认删除赛制配置？"
        message={
          deleteTarget
            ? `此操作将永久删除「${deleteTarget.name}」，无法恢复。已激活的配置需先停用。`
            : ''
        }
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
};

export default AdminFormatConfig;
