import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import Modal from '../ui/Modal';
import { importMatchData } from '@/api/matchData';
import type { ImportMatchDataResponse } from '@/types/matchData';
import { toast } from 'sonner';
import { trackAdminImportStart, trackAdminImportSuccess } from '@/utils/tracking';

interface MatchDataImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: ImportMatchDataResponse) => void;
  matchId: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['xlsx', 'xls'];

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
  const [preview, setPreview] = useState<ImportMatchDataResponse | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(selectedFile);
      setPreview(null);
      setError(null);
    }
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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(droppedFile);
      setPreview(null);
      setError(null);
    }
  }, []);

  const handleImport = async () => {
    if (!file) return;

    // 跟踪导入开始事件
    trackAdminImportStart(matchId, file.name);

    setUploading(true);
    setError(null);
    const toastId = toast.loading('正在解析并导入比赛数据...');

    try {
      const result = await importMatchData(matchId, file);
      setPreview(result);
      toast.success('数据导入成功，请预览确认', { id: toastId });

      // 跟踪导入成功事件
      trackAdminImportSuccess(matchId, result.gameNumber, result.playerCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败，请重试');
      toast.error('数据导入失败', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onSuccess(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setDragging(false);
    setPreview(null);
    onClose();
  };

  return (
    <Modal visible={open} onClose={handleClose} title="导入比赛数据" className="max-w-2xl">
      <div className="space-y-4">
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
              </ul>
            </div>
          </div>
        </div>

        {!preview && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
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
                  <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
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

        {preview && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="text-green-400 font-medium mb-2">导入预览</h4>
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
                <span className="text-gray-400">状态:</span>
                <span className="text-green-400 ml-2">成功</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} disabled={uploading}>
            取消
          </Button>
          {preview ? (
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white"
            >
              确认导入
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MatchDataImportDialog;
