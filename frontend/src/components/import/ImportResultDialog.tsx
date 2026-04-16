import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Download, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import Modal from '../ui/Modal';
import { downloadErrorReport } from '@/api/teams-import';
import type { ImportResult } from '@/api/teams-import';

interface ImportResultDialogProps {
  open: boolean;
  onClose: () => void;
  result: ImportResult | null;
}

export const ImportResultDialog: React.FC<ImportResultDialogProps> = ({
  open,
  onClose,
  result,
}) => {
  if (!result) return null;

  const hasErrors = result.errors && result.errors.length > 0;
  const isSuccess = result.failed === 0 && result.total > 0;

  const handleDownloadErrorReport = async () => {
    if (!result.errors) return;
    try {
      const blob = await downloadErrorReport(result.errors);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `驴酱杯_导入错误报告_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download error report:', err);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={open} onClose={handleClose} title="导入结果">
      <div className="space-y-4">
        {isSuccess ? (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium">导入成功</p>
                <div className="mt-2 text-sm text-green-200/80 space-y-1">
                  <p>新增战队: {result.created} 支</p>
                  <p>覆盖战队: {result.updated} 支</p>
                  <p>总处理: {result.total} 支</p>
                </div>
              </div>
            </div>
          </div>
        ) : hasErrors ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">导入失败</p>
                <div className="mt-2 text-sm text-red-200/80 space-y-1">
                  <p>失败: {result.failed} 条</p>
                  <p>成功: {result.total - result.failed} 条</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-medium">部分成功</p>
                <div className="mt-2 text-sm text-yellow-200/80 space-y-1">
                  <p>新增: {result.created} 支</p>
                  <p>覆盖: {result.updated} 支</p>
                  <p>失败: {result.failed} 支</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {result.externalUrlItems && result.externalUrlItems.length > 0 && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium mb-1">外链URL项</p>
                <p className="text-sm text-blue-200/80">
                  以下URL为外部链接，请手动上传到图床后更新：
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-200/80 max-h-32 overflow-y-auto">
                  {result.externalUrlItems.map((item, idx) => (
                    <li key={idx} className="break-all">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-400 font-medium">行号</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-medium">战队</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-medium">位置</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-medium">字段</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-medium">错误</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {result.errors?.map((error, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/50">
                    <td className="px-3 py-2 text-gray-300">{error.row || '-'}</td>
                    <td className="px-3 py-2 text-gray-300">{error.teamName || '-'}</td>
                    <td className="px-3 py-2 text-gray-300">{error.position || '-'}</td>
                    <td className="px-3 py-2 text-gray-300">{error.field}</td>
                    <td className="px-3 py-2 text-red-400">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <div>
            {hasErrors && (
              <Button
                variant="outline"
                onClick={handleDownloadErrorReport}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                下载错误报告
              </Button>
            )}
          </div>
          <Button onClick={handleClose}>关闭</Button>
        </div>
      </div>
    </Modal>
  );
};
