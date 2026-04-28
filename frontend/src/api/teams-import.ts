import apiClient from './axios';
import type { ApiResponse } from './types';

export interface ImportError {
  row: number;
  teamName: string;
  position: string;
  field: string;
  message: string;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors?: ImportError[];
  externalUrlItems?: string[];
  successLabel?: string;
  unitLabel?: string;
  errorDownloadFn?: (errors: ImportError[]) => Promise<Blob>;
  errorReportFileName?: string;
}

export async function downloadTemplate(): Promise<Blob> {
  const response = await apiClient.get<Blob>('/admin/teams/import/template', {
    responseType: 'blob',
  });
  return response.data;
}

export async function refreshTemplate(): Promise<Blob> {
  const response = await apiClient.get<Blob>('/admin/teams/import/template/refresh', {
    responseType: 'blob',
  });
  return response.data;
}

export async function importTeams(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<ImportResult>>(
    '/admin/teams/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '导入失败');
  }

  return response.data.data;
}

export async function downloadErrorReport(errors: ImportError[]): Promise<Blob> {
  const response = await apiClient.post<Blob>(
    '/admin/teams/import/error-report',
    { errors },
    {
      responseType: 'blob',
    }
  );
  return response.data;
}

export default {
  downloadTemplate,
  refreshTemplate,
  importTeams,
  downloadErrorReport,
};
