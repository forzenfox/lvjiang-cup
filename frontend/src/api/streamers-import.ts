import apiClient from './axios';
import type { ApiResponse } from './types';

export interface StreamerImportError {
  row: number;
  nickname: string;
  field: string;
  message: string;
}

export interface StreamerImportResult {
  total: number;
  created: number;
  failed: number;
  errors?: StreamerImportError[];
  externalUrlItems?: string[];
}

export async function downloadStreamerTemplate(): Promise<Blob> {
  const response = await apiClient.get<Blob>('/admin/streamers/import/template', {
    responseType: 'blob',
  });
  return response.data;
}

export async function importStreamers(file: File): Promise<StreamerImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<StreamerImportResult>>(
    '/admin/streamers/import',
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

export async function downloadStreamerErrorReport(errors: StreamerImportError[]): Promise<Blob> {
  const response = await apiClient.post<Blob>(
    '/admin/streamers/import/error-report',
    { errors },
    {
      responseType: 'blob',
    }
  );
  return response.data;
}

export default {
  downloadStreamerTemplate,
  importStreamers,
  downloadStreamerErrorReport,
};
