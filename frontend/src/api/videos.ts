import apiClient from './axios';
import type { ApiResponse } from './types';

export interface Video {
  id: string;
  bvid: string;
  page: number;
  bilibiliTitle?: string;
  customTitle?: string;
  title: string;
  coverUrl?: string;
  order: number;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVideoRequest {
  url: string;
  customTitle?: string;
  order?: number;
  isEnabled?: boolean;
}

export interface UpdateVideoRequest extends Partial<Omit<CreateVideoRequest, 'url'>> {
  id: string;
  url?: string;
}

export interface GetVideosParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isEnabled?: boolean;
}

export interface PaginatedVideoData {
  list: Video[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getVideos(params?: GetVideosParams): Promise<PaginatedVideoData> {
  const response = await apiClient.get<ApiResponse<PaginatedVideoData>>('/videos', { params });
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取视频列表失败');
  }

  return responseData.data;
}

export async function getAdminVideos(params?: GetVideosParams): Promise<PaginatedVideoData> {
  const response = await apiClient.get<ApiResponse<PaginatedVideoData>>('/admin/videos', { params });
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取视频列表失败');
  }

  return responseData.data;
}

export async function getVideo(id: string): Promise<Video> {
  const response = await apiClient.get<ApiResponse<Video>>(`/videos/${id}`);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取视频信息失败');
  }

  return responseData.data;
}

export async function createVideo(data: CreateVideoRequest): Promise<Video> {
  const response = await apiClient.post<ApiResponse<Video>>('/admin/videos', data);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '创建视频失败');
  }

  return responseData.data;
}

export async function updateVideo(data: UpdateVideoRequest): Promise<Video> {
  const { id, ...updateData } = data;
  const response = await apiClient.put<ApiResponse<Video>>(`/admin/videos/${id}`, updateData);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新视频失败');
  }

  return responseData.data;
}

export async function deleteVideo(id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/videos/${id}`);
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '删除视频失败');
  }
}

export async function toggleVideoEnabled(id: string, isEnabled: boolean): Promise<Video> {
  const response = await apiClient.put<ApiResponse<Video>>(`/admin/videos/${id}`, { isEnabled });
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '切换视频状态失败');
  }

  return responseData.data;
}

export async function reorderVideos(orderedIds: string[]): Promise<void> {
  const response = await apiClient.put<ApiResponse<void>>('/admin/videos/sort', { orderedIds });
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '排序视频失败');
  }
}

export default {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoEnabled,
  reorderVideos,
};
