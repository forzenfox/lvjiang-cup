import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import FormatConfigPage from './FormatConfig';
import {
  getActiveFormat,
  listFormats,
  createFormat,
  activateFormat,
  generateSlots,
} from '@/services/formatService';
import { BUILTIN_DEFAULT_FORMAT, type FormatConfig } from '@/lib/format';
import type { FormatRecord } from '@/api/format';

// 全量套件高负载下 userEvent 交互耗时上升，放宽单测超时（默认 5000ms 易抖动）
const TEST_TIMEOUT = 20000;

// —— Mock 赛制配置服务（页面唯一数据源）——
vi.mock('@/services/formatService', () => ({
  getActiveFormat: vi.fn(),
  listFormats: vi.fn(),
  createFormat: vi.fn(),
  updateFormat: vi.fn(),
  deleteFormat: vi.fn(),
  activateFormat: vi.fn(),
  deactivateFormat: vi.fn(),
  generateSlots: vi.fn(),
}));

// —— Mock AdminLayout 依赖 ——
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    user: { username: 'admin', role: 'admin' },
    loading: false,
  }),
}));

vi.mock('@/utils/unifiedCache', () => ({
  unifiedCache: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
    clearAll: vi.fn(),
    clearByPrefix: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    isEnabled: vi.fn(() => true),
  },
  disableFrontendCache: vi.fn(),
  enableFrontendCache: vi.fn(),
}));

// —— Mock sonner（便于断言 toast 内容）——
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    info: vi.fn(),
  },
  Toaster: () => null,
}));

/** 8 队 2 胜制 + 4 强淘汰（PRD AC-002 场景：瑞士轮 10 场 + 淘汰赛 3 场） */
const eightTeamFormat: FormatConfig = {
  version: 1,
  name: '8队瑞士轮（2胜制）+ 4强',
  stages: [
    {
      type: 'swiss',
      name: '瑞士轮',
      teamCount: 8,
      winThreshold: 2,
      lossThreshold: 2,
      boRule: 'auto',
      advanceToStage: 1,
    },
    {
      type: 'elimination',
      name: '淘汰赛',
      teamCount: 4,
      advanceToStage: null,
      roundNames: ['半决赛', '决赛'],
      boFormat: 'BO3',
    },
  ],
};

const mockRecords: FormatRecord[] = [
  {
    id: 'fmt-8',
    name: '8队瑞士轮（2胜制）+ 4强',
    config: eightTeamFormat,
    isActive: false,
    createdAt: '2026-08-01T10:00:00Z',
  },
];

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/admin/format-config']}>
      <FormatConfigPage />
    </MemoryRouter>
  );
};

describe('FormatConfig 赛制配置页', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActiveFormat).mockResolvedValue({
      source: 'builtin',
      id: null,
      config: BUILTIN_DEFAULT_FORMAT,
    });
    vi.mocked(listFormats).mockResolvedValue([...mockRecords]);
    vi.mocked(createFormat).mockResolvedValue({
      id: 'fmt-new',
      name: '新配置',
      config: eightTeamFormat,
      isActive: false,
      createdAt: '2026-08-26T10:00:00Z',
    });
    vi.mocked(activateFormat).mockResolvedValue(undefined);
    vi.mocked(generateSlots).mockResolvedValue({
      created: 13,
      skipped: 0,
      total: 13,
    });
  });

  it(
    '初始渲染显示内置默认卡片、当前生效配置与用户配置列表',
    async () => {
      renderPage();

      // 内置默认卡片：置顶、只读、标注"内置默认"、含结构摘要与生效状态
      const builtinCard = await screen.findByTestId('builtin-format-card');
      expect(within(builtinCard).getByText('内置默认')).toBeInTheDocument();
      expect(within(builtinCard).getByText('默认赛制（16队瑞士轮 + 8强单败）')).toBeInTheDocument();
      expect(within(builtinCard).getByText(/33 场/)).toBeInTheDocument();
      expect(within(builtinCard).getByText('当前生效')).toBeInTheDocument();

      // 页面顶部生效状态展示
      expect(screen.getByTestId('active-format-name')).toHaveTextContent(
        '默认赛制（16队瑞士轮 + 8强单败）'
      );

      // 用户配置列表：名称展示
      const record = await screen.findByTestId('format-record-fmt-8');
      expect(within(record).getByText('8队瑞士轮（2胜制）+ 4强')).toBeInTheDocument();
    },
    TEST_TIMEOUT
  );

  it(
    '新建表单选 8 队 2 胜：预览显示 3 轮与 10 场，保存调用 createFormat',
    async () => {
      const user = userEvent.setup();
      renderPage();

      await screen.findByTestId('builtin-format-card');
      await user.click(screen.getByTestId('new-format-button'));

      await user.type(screen.getByTestId('format-name-input'), '8队测试配置');
      await user.selectOptions(screen.getByTestId('stage-0-team-count'), '8');
      await user.selectOptions(screen.getByTestId('stage-0-threshold'), '2');

      // 实时预览：瑞士轮 3 轮共 10 场（PRD 6.3 推导）
      const preview = await screen.findByTestId('format-preview');
      expect(within(preview).getByText('瑞士轮合计：3 轮 · 10 场')).toBeInTheDocument();
      expect(within(preview).getByText('合计槽位：10 场')).toBeInTheDocument();

      await user.click(screen.getByTestId('save-format-button'));

      await waitFor(() => expect(createFormat).toHaveBeenCalledTimes(1));
      const [config] = vi.mocked(createFormat).mock.calls[0];
      expect(config.name).toBe('8队测试配置');
      expect(config.stages[0]).toMatchObject({
        type: 'swiss',
        teamCount: 8,
        winThreshold: 2,
        lossThreshold: 2,
      });

      // 保存成功后表单关闭
      await waitFor(() =>
        expect(screen.queryByTestId('format-name-input')).not.toBeInTheDocument()
      );
    },
    TEST_TIMEOUT
  );

  it(
    '瑞士轮 8 队 3 胜（结构性非法）：显示校验错误并禁用保存',
    async () => {
      const user = userEvent.setup();
      renderPage();

      await screen.findByTestId('builtin-format-card');
      await user.click(screen.getByTestId('new-format-button'));

      await user.type(screen.getByTestId('format-name-input'), '非法配置');
      await user.selectOptions(screen.getByTestId('stage-0-team-count'), '8');
      // 晋级阈值保持默认 3（8 队 3 胜制：第 4 轮 2-1 组仅 3 队，奇数无法配对）

      expect(await screen.findByTestId('format-errors')).toBeInTheDocument();
      // 8 队 3 胜：第 4 轮 2-1 / 1-2 组与第 5 轮 2-2 组均为奇数无法配对
      expect(screen.getAllByText(/奇数/).length).toBeGreaterThan(0);
      expect(screen.getByTestId('save-format-button')).toBeDisabled();
      expect(createFormat).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT
  );

  it(
    '淘汰赛队伍数超出瑞士轮晋级名额：显示赛段衔接错误并禁用保存',
    async () => {
      const user = userEvent.setup();
      renderPage();

      await screen.findByTestId('builtin-format-card');
      await user.click(screen.getByTestId('new-format-button'));

      await user.type(screen.getByTestId('format-name-input'), '衔接非法配置');
      await user.selectOptions(screen.getByTestId('stage-0-team-count'), '8');
      await user.selectOptions(screen.getByTestId('stage-0-threshold'), '2');
      await user.click(screen.getByTestId('add-stage-button'));
      await user.selectOptions(screen.getByTestId('stage-1-type'), 'elimination');
      // 淘汰赛默认 8 队 > 瑞士轮 8 队的晋级供给 4 队

      expect(await screen.findByText(/超出上一赛段可供给的 4 队/)).toBeInTheDocument();
      expect(screen.getByTestId('save-format-button')).toBeDisabled();
      expect(createFormat).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT
  );

  it(
    '激活并生成：先 activateFormat，确认框含预计场次，确认后调用 generateSlots 并 toast 结果',
    async () => {
      const user = userEvent.setup();
      renderPage();

      const record = await screen.findByTestId('format-record-fmt-8');
      await user.click(within(record).getByTestId('activate-generate-fmt-8'));

      await waitFor(() => expect(activateFormat).toHaveBeenCalledWith('fmt-8'));

      // 二次确认框：预计场次预览（8队2胜：瑞士轮 10 + 淘汰赛 3 = 13 场）
      const dialog = await screen.findByRole('alertdialog');
      expect(within(dialog).getByText(/预计共 13 场/)).toBeInTheDocument();
      expect(within(dialog).getByText(/已存在会跳过/)).toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: '确认生成' }));

      await waitFor(() => expect(generateSlots).toHaveBeenCalledWith('fmt-8'));
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('新建 13 场'))
      );
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('跳过 0 场'))
      );
    },
    TEST_TIMEOUT
  );
});
