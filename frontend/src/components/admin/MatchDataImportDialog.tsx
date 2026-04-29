import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, Loader2, Download } from 'lucide-react';
import { Button } from '../ui/button';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { matchDataService } from '@/services/matchDataService';
import { downloadMatchDataErrorReport } from '@/api/matchData';
import type {
  ImportMatchDataResponse,
  MultiGameImportResponse,
  SingleGameImportResult,
  GameNumberWarning,
} from '@/types/matchData';
import { toast } from 'sonner';
import { trackAdminImportStart, trackAdminImportSuccess } from '@/utils/tracking';

interface MatchDataImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: ImportMatchDataResponse) => void;
  matchId: string;
}

interface ImportErrorDetail {
  row: number;
  nickname: string;
  side: string;
  type: string;
  message: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['xlsx', 'xls'];

/**
 * 判断导入结果是否为多局导入响应
 */
const isMultiGameResponse = (
  result: ImportMatchDataResponse | MultiGameImportResponse
): result is MultiGameImportResponse => {
  return (
    result !== null &&
    typeof result === 'object' &&
    'results' in result &&
    Array.isArray((result as MultiGameImportResponse).results)
  );
};

const MatchDataImportDialog: React.FC<MatchDataImportDialogProps> = ({
  open,
  onClose,
  onSuccess,
  matchId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ImportErrorDetail[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<ImportMatchDataResponse | null>(null);
  const [multiGameResults, setMultiGameResults] = useState<SingleGameImportResult[] | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [dryRunSuccess, setDryRunSuccess] = useState(false);
  const [isDryRunPreview, setIsDryRunPreview] = useState(false); // 区分预检预览与实际导入

  // 局数不一致告警状态
  const [warnings, setWarnings] = useState<GameNumberWarning[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  /**
   * 清理导入相关的业务状态（文件、预览、错误、告警等）
   * 不清理 UI 交互状态（dragging、uploading、downloadingReport）
   */
  const clearImportState = useCallback(() => {
    setFile(null);
    setPreview(null);
    setMultiGameResults(null);
    setErrorDetails([]);
    setValidationErrors([]);
    setError(null);
    setWarnings([]);
    setShowWarningDialog(false);
    setDryRunSuccess(false);
    setIsDryRunPreview(false);
  }, []);

  /**
   * 清除文件及相关状态（文件选择/拖拽时使用）
   */
  const clearFileState = useCallback(() => {
    clearImportState();
  }, [clearImportState]);

  /**
   * 重置所有状态到初始值（关闭对话框时使用）
   */
  const resetState = useCallback(() => {
    clearImportState();
    setDragging(false);
    setUploading(false);
    setDownloadingReport(false);
  }, [clearImportState]);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return '仅支持 .xlsx 或 .xls 格式的 Excel 文件';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '文件大小不能超过 10MB';
    }
    return null;
  };

  /**
   * 处理文件验证并重置相关状态
   * 用于统一处理文件选择和拖拽上传的文件处理逻辑
   */
  const processFileAndResetStates = useCallback((newFile: File | null) => {
    if (!newFile) return;

    const validationError = validateFile(newFile);
    if (validationError) {
      setError(validationError);
      setErrorDetails([]);
      setValidationErrors([]);
      return;
    }

    setFile(newFile);
    setPreview(null);
    setMultiGameResults(null);
    setError(null);
    setErrorDetails([]);
    setValidationErrors([]);
    setWarnings([]);
    setShowWarningDialog(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    processFileAndResetStates(selectedFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    processFileAndResetStates(droppedFile);
  }, [processFileAndResetStates]);

  const parseErrorDetails = (err: any): ImportErrorDetail[] => {
    // Try to extract error details from different response formats
    const details = err.details?.failedPlayers || err.failedPlayers || [];
    return details.map((d: any) => ({
      row: d.row || 0,
      nickname: d.nickname || '未知选手',
      side: d.side || 'unknown',
      type: d.type || 'parse_error',
      message: d.message || d.reason || '未知错误',
    }));
  };

  /**
   * 从错误响应中提取验证错误列表
   */
  const parseValidationErrors = (err: any): string[] => {
    // 优先从 errors 数组获取验证错误
    if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
      return err.errors;
    }
    // 其次从 response.data.errors 获取
    if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
      return err.response.data.errors;
    }
    return [];
  };

  /**
   * 处理导入成功后的结果展示
   */
  const handleImportSuccess = (
    result: ImportMatchDataResponse | MultiGameImportResponse,
    toastId: string | number,
    isDryRun?: boolean
  ) => {
    if (isMultiGameResponse(result)) {
      // 多局导入结果
      setMultiGameResults(result.results);
      if (!isDryRun) {
        setIsDryRunPreview(false); // 清除预检标记，显示导入结果
      }

      // 预检模式下 imported 固定为 false，不能用其判断失败
      // 应基于 failedPlayers 和 errorDetails 判断
      const hasFailed = result.results.some(
        r =>
          (r.failedPlayers && r.failedPlayers.length > 0) ||
          (r.errorDetails && r.errorDetails.length > 0)
      );
      const allSuccess = result.results.every(
        r =>
          !(r.failedPlayers && r.failedPlayers.length > 0) &&
          !(r.errorDetails && r.errorDetails.length > 0)
      );

      if (allSuccess) {
        toast.success(isDryRun ? '预检通过，可执行实际导入' : `成功导入 ${result.totalGames} 局数据，请预览确认`, { id: toastId });
      } else if (hasFailed) {
        toast.warning(isDryRun ? '预检发现部分局数存在问题，请查看详情' : `导入完成，部分局数导入失败，请查看详情`, {
          id: toastId,
          duration: 5000,
        });
      } else {
        toast.success(isDryRun ? '预检通过，可执行实际导入' : '数据导入成功，请预览确认', { id: toastId });
      }

      // 跟踪导入成功事件（使用第一局的数据）
      const firstResult = result.results[0];
      if (firstResult) {
        trackAdminImportSuccess(matchId, firstResult.gameNumber, firstResult.playerCount);
      }
    } else {
      // 单局导入结果（兼容旧格式）
      setPreview(result);
      if (!isDryRun) {
        setIsDryRunPreview(false); // 清除预检标记
      }

      // 检查是否为覆盖导入
      if (result.overwritten) {
        toast.warning(`数据已导入并覆盖第 ${result.gameNumber} 局的原有数据，请预览确认`, {
          id: toastId,
          duration: 5000,
        });
      } else if (result.failedCount && result.failedCount > 0) {
        const errors = parseErrorDetails(result);
        setErrorDetails(errors);
        toast.warning(`数据已导入，但 ${result.failedCount} 个选手匹配失败，请查看详情`, {
          id: toastId,
          duration: 5000,
        });
      } else {
        toast.success('数据导入成功，请预览确认', { id: toastId });
      }

      // 跟踪导入成功事件
      trackAdminImportSuccess(matchId, result.gameNumber, result.playerCount);
    }
  };

  /**
   * 执行实际导入（带 confirmWarnings）
   */
  const executeImport = async (options?: { dryRun?: boolean; confirmWarnings?: boolean }) => {
    if (!file) return;

    // 跟踪导入开始事件
    trackAdminImportStart(matchId, file.name);

    setUploading(true);
    setError(null);
    setErrorDetails([]);
    setValidationErrors([]);
    const toastId = toast.loading(options?.dryRun ? '正在预检比赛数据...' : '正在导入比赛数据...');

    try {
      const result = await matchDataService.importMatchData(matchId, file, options);

      // dryRun 模式：检查是否有告警
      const multiGameResult = result as MultiGameImportResponse;
      const hasWarnings =
        options?.dryRun && multiGameResult.warnings && multiGameResult.warnings.length > 0;
      if (hasWarnings) {
        setWarnings(multiGameResult.warnings ?? []);
        setShowWarningDialog(true);
        toast.dismiss(toastId);
        setUploading(false);
        return;
      }

      // 预检模式成功：标记 dryRunSuccess，展示预览结果，不实际导入
      if (options?.dryRun) {
        setDryRunSuccess(true);
        setIsDryRunPreview(true); // 标记为预检预览
        handleImportSuccess(result, toastId, true);
        setUploading(false);
        return;
      }

      // 正式导入成功
      handleImportSuccess(result, toastId, false);

      // 导入成功后清除文件
      setFile(null);
    } catch (err: any) {
      // 校验失败时清除文件
      clearFileState();

      // Try to extract error details from the response
      const responseDetails = err.response?.data;
      let errorMessage = err.message || '导入失败，请重试';

      // 首先尝试提取验证错误列表
      const validationErrs = parseValidationErrors(err.response?.data || err);
      if (validationErrs.length > 0) {
        setValidationErrors(validationErrs);
        errorMessage = responseDetails?.message || `验证失败：发现 ${validationErrs.length} 个问题`;
      } else if (responseDetails) {
        const details = parseErrorDetails(responseDetails);
        if (details.length > 0) {
          setErrorDetails(details);
          errorMessage = responseDetails.message || `导入失败：${details.length} 个错误`;
        } else if (responseDetails.message) {
          errorMessage = responseDetails.message;
        }
      }

      setError(errorMessage);
      toast.error('数据导入失败', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  /**
   * 处理导入按钮点击（先 dryRun 预检）
   */
  const handleImport = async () => {
    if (!file) return;
    // 先进行 dryRun 预检
    await executeImport({ dryRun: true });
  };

  /**
   * 用户确认告警后继续导入
   */
  const handleConfirmWarnings = async () => {
    setShowWarningDialog(false);
    setWarnings([]);
    await executeImport({ confirmWarnings: true });
  };

  /**
   * 用户取消告警，清除文件
   */
  const handleCancelWarnings = () => {
    setShowWarningDialog(false);
    setWarnings([]);
    clearFileState();
  };

  const handleDownloadErrorReport = async () => {
    if (errorDetails.length === 0 && validationErrors.length === 0) return;

    setDownloadingReport(true);
    try {
      // 合并两种错误类型
      const reportData = [
        ...validationErrors.map((msg, idx) => ({
          row: idx + 1,
          nickname: '-',
          side: '-',
          type: 'validation_error',
          message: msg,
        })),
        ...errorDetails,
      ];
      const blob = await downloadMatchDataErrorReport(reportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `对战数据导入错误报告_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('错误报告已下载');
    } catch {
      toast.error('下载错误报告失败');
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleConfirm = async () => {
    // 如果 dryRun 预检成功，执行实际导入
    if (dryRunSuccess) {
      setDryRunSuccess(false);
      setIsDryRunPreview(false); // 清除预检标记
      await executeImport(); // 不传回调，导入后不自动关闭
      return;
    }

    // 兼容旧格式：单局导入直接确认并关闭
    if (preview) {
      onSuccess(preview);
      handleClose();
    } else if (multiGameResults) {
      // 多局导入完成后，无论成功还是失败都允许关闭弹框
      const result: ImportMatchDataResponse = {
        imported: multiGameResults.every(r => r.imported),
        gameNumber: multiGameResults[0]?.gameNumber || 1,
        playerCount: multiGameResults.reduce((sum, r) => sum + r.playerCount, 0),
      };
      onSuccess(result);
      handleClose();
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const hasErrors = errorDetails.length > 0 || validationErrors.length > 0;
  const hasResult = preview !== null || (multiGameResults !== null && multiGameResults.length > 0);

  /**
   * 检查单个导入结果是否失败
   */
  const isResultFailed = (result: SingleGameImportResult): boolean => {
    return (
      (result.failedPlayers && result.failedPlayers.length > 0) ||
      (result.errorDetails && result.errorDetails.length > 0)
    );
  };

  /**
   * 检查预检是否有错误（预检模式下 imported 固定为 false，不应作为错误判断依据）
   */
  const hasDryRunErrors =
    isDryRunPreview && multiGameResults?.some(isResultFailed);

  /**
   * 获取多局导入结果容器的样式类名
   */
  const getResultsContainerClassName = (): string => {
    if (isDryRunPreview && hasDryRunErrors) {
      return 'bg-red-500/10 border-red-500/20';
    }
    if (isDryRunPreview) {
      return 'bg-blue-500/10 border-blue-500/20';
    }
    return 'bg-green-500/10 border-green-500/20';
  };

  /**
   * 获取多局导入结果标题的样式类名
   */
  const getResultsTitleClassName = (): string => {
    if (isDryRunPreview && hasDryRunErrors) {
      return 'text-red-400';
    }
    if (isDryRunPreview) {
      return 'text-blue-400';
    }
    return 'text-green-400';
  };

  /**
   * 获取单个结果卡片的样式类名
   */
  const getResultCardClassName = (result: SingleGameImportResult): string => {
    if (isDryRunPreview) {
      return 'bg-blue-500/10 border border-blue-500/20';
    }
    if (result.imported) {
      return result.overwritten
        ? 'bg-amber-500/10 border border-amber-500/20'
        : 'bg-gray-800/50 border border-gray-700';
    }
    return 'bg-red-500/10 border border-red-500/20';
  };

  /**
   * 渲染错误报告下载按钮
   */
  const renderErrorReportDownloadButton = (): React.ReactNode => (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownloadErrorReport}
      disabled={downloadingReport}
      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
    >
      <Download className="w-4 h-4 mr-2" />
      {downloadingReport ? '下载中...' : '下载错误报告'}
    </Button>
  );

  /**
   * 渲染操作按钮（根据当前状态显示不同的按钮）
   */
  const renderActionButton = (): React.ReactNode => {
    // 错误状态
    if (hasErrors) {
      return (
        <Button
          onClick={handleClose}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white"
        >
          关闭
        </Button>
      );
    }

    // 单局预览状态（兼容旧格式）
    if (preview) {
      return (
        <Button
          onClick={handleConfirm}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
        >
          确认导入
        </Button>
      );
    }

    // 预检状态
    if (isDryRunPreview) {
      if (hasDryRunErrors) {
        return (
          <Button
            onClick={() => {
              clearFileState();
            }}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white"
          >
            返回修改
          </Button>
        );
      }
      return (
        <Button
          onClick={handleConfirm}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
        >
          继续导入
        </Button>
      );
    }

    // 多局导入完成状态
    if (multiGameResults) {
      return (
        <Button
          onClick={handleConfirm}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
        >
          完成
        </Button>
      );
    }

    // 默认上传状态
    return (
      <Button
        onClick={handleImport}
        disabled={!file || uploading}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            导入中...
          </>
        ) : (
          '开始导入'
        )}
      </Button>
    );
  };

  return (
    <>
      <Modal visible={open} onClose={handleClose} title="导入比赛数据" className="max-w-2xl">
        <div className="space-y-4">
          {/* 导入说明 */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200">
                <p className="font-medium mb-1">导入说明</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-300/80">
                  <li>支持 .xlsx 和 .xls 格式的 Excel 文件</li>
                  <li>文件大小不超过 10MB</li>
                  <li>导入后将覆盖该局的现有数据</li>
                  <li>请确保 Excel 格式符合模板要求</li>
                  <li>如需模板，请在对战列表中点击对应对战的「下载模板」按钮</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 文件上传区域 */}
          {!hasResult && !hasErrors && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      clearFileState();
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                    aria-label="移除文件"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 mb-2">
                    拖拽文件到此处，或
                    <label className="text-blue-400 hover:text-blue-300 cursor-pointer mx-1">
                      点击选择
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-gray-500 text-sm">支持 .xlsx/.xls 格式，大小不超过 10MB</p>
                </>
              )}
            </div>
          )}

          {/* 单局导入预览（兼容旧格式） */}
          {preview && (
            <div
              className={`p-4 border rounded-lg ${
                preview.overwritten
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-green-500/10 border-green-500/20'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                {preview.overwritten && (
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <h4
                  className={`font-medium ${
                    preview.overwritten ? 'text-amber-400' : 'text-green-400'
                  }`}
                >
                  {preview.overwritten ? '覆盖导入预览' : '导入预览'}
                </h4>
              </div>
              {preview.overwritten && (
                <p className="text-sm text-amber-300 mb-3 ml-8">
                  检测到第 {preview.gameNumber} 局已有数据，本次导入已覆盖原有数据
                </p>
              )}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">导入局数:</span>
                  <span className="text-white ml-2">第 {preview.gameNumber} 局</span>
                </div>
                <div>
                  <span className="text-gray-400">选手数据:</span>
                  <span className="text-white ml-2">{preview.playerCount} 条</span>
                </div>
                <div>
                  <span className="text-gray-400">失败数:</span>
                  <span
                    className={preview.failedCount ? 'text-yellow-400 ml-2' : 'text-green-400 ml-2'}
                  >
                    {preview.failedCount || 0} 条
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 多局导入结果展示 */}
          {multiGameResults && multiGameResults.length > 0 && (
            <div className={`p-4 border rounded-lg ${getResultsContainerClassName()}`}>
              <h4 className={`font-medium mb-3 ${getResultsTitleClassName()}`}>
                {isDryRunPreview ? '预检结果' : '导入结果'}
              </h4>
              {isDryRunPreview && !hasDryRunErrors && (
                <p className="text-sm text-gray-400 mb-3">
                  以下数据验证通过，点击"继续导入"将执行实际导入
                </p>
              )}
              {isDryRunPreview && hasDryRunErrors && (
                <p className="text-sm text-red-300 mb-3">预检发现以下问题，请修正后重新上传</p>
              )}
              <div className="space-y-2">
                {multiGameResults.map(result => (
                  <div
                    key={result.gameNumber}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm ${getResultCardClassName(result)}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">第 {result.gameNumber} 局</span>
                      {isDryRunPreview ? (
                        result.failedPlayers && result.failedPlayers.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-red-400 font-medium">预检失败</span>
                            {result.failedPlayers.slice(0, 2).map((fp, idx) => (
                              <span key={idx} className="text-red-300 text-xs">
                                第{fp.row}行 - {fp.message}
                              </span>
                            ))}
                            {result.failedPlayers.length > 2 && (
                              <span className="text-red-300 text-xs">
                                ...及其他 {result.failedPlayers.length - 2} 个错误
                              </span>
                            )}
                          </div>
                        ) : result.errorDetails && result.errorDetails.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-red-400 font-medium">预检失败</span>
                            <span className="text-red-300 text-xs">{result.errorDetails[0]}</span>
                            {result.errorDetails.length > 1 && (
                              <span className="text-red-300 text-xs">
                                ...及其他 {result.errorDetails.length - 1} 个错误
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-blue-400">
                            {result.playerCount} 名选手数据
                          </span>
                        )
                      ) : result.imported ? (
                        <span className="text-green-400">
                          {result.playerCount} 名选手数据
                          {result.overwritten ? '（覆盖已有数据）' : ''}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-red-400">{result.error || '导入失败'}</span>
                          {result.errorDetails && result.errorDetails.length > 0 && (
                            <span className="text-red-300 text-xs">{result.errorDetails[0]}</span>
                          )}
                          {result.failedPlayers && result.failedPlayers.length > 0 && (
                            <span className="text-red-300 text-xs">
                              {result.failedPlayers[0].message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {isDryRunPreview ? (
                      <span className="text-blue-400 text-xs">待导入</span>
                    ) : result.imported ? (
                      <span className="text-green-400 text-xs">
                        {result.failedCount && result.failedCount > 0
                          ? `${result.failedCount} 个失败`
                          : '成功'}
                      </span>
                    ) : (
                      <span className="text-red-400 text-xs">失败</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 验证错误列表 */}
          {validationErrors.length > 0 && (
            <div className="border border-red-500/30 rounded-lg">
              <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">
                    验证错误：发现 {validationErrors.length} 个问题
                  </span>
                </div>
                {renderErrorReportDownloadButton()}
              </div>
              <div className="max-h-64 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {validationErrors.map((errMsg, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-400 flex-shrink-0">•</span>
                      <span className="text-gray-300">{errMsg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 选手匹配错误列表 */}
          {errorDetails.length > 0 && (
            <div className="border border-red-500/30 rounded-lg">
              <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">
                    导入失败：{errorDetails.length} 个错误
                  </span>
                </div>
                {renderErrorReportDownloadButton()}
              </div>
              <div className="max-h-64 overflow-y-auto p-4">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="text-left py-2 px-2">行号</th>
                      <th className="text-left py-2 px-2">选手昵称</th>
                      <th className="text-left py-2 px-2">阵营</th>
                      <th className="text-left py-2 px-2">错误类型</th>
                      <th className="text-left py-2 px-2">错误信息</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorDetails.map((err, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-white/5">
                        <td className="py-2 px-2 text-gray-400">{err.row}</td>
                        <td className="py-2 px-2 text-white">{err.nickname}</td>
                        <td className="py-2 px-2">
                          <span className={err.side === 'red' ? 'text-red-400' : 'text-blue-400'}>
                            {err.side === 'red' ? '红方' : '蓝方'}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-yellow-400">
                            {err.type === 'player_not_found' && '选手未找到'}
                            {err.type === 'team_mismatch' && '战队不匹配'}
                            {err.type === 'data_validation' && '数据验证失败'}
                            {err.type === 'parse_error' && '解析错误'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-300">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && !hasErrors && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleClose} disabled={uploading}>
              取消
            </Button>
            {renderActionButton()}
          </div>
        </div>
      </Modal>

      {/* 局数不一致告警确认对话框 */}
      <ConfirmDialog
        isOpen={showWarningDialog}
        title="局数不一致告警"
        onConfirm={handleConfirmWarnings}
        onCancel={handleCancelWarnings}
        confirmText="继续导入"
        cancelText="取消"
      >
        <div className="space-y-3">
          <p className="text-gray-300">检测到以下局数不一致的情况：</p>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{warning.message}</span>
              </li>
            ))}
          </ul>
          <p className="text-gray-400 text-sm">是否确认继续导入？</p>
        </div>
      </ConfirmDialog>
    </>
  );
};

export default MatchDataImportDialog;
