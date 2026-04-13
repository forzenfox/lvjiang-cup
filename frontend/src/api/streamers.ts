import apiClient from './axios';
import type { Streamer, CreateStreamerRequest, UpdateStreamerRequest } from './types';

export const streamersApi = {
  async getAll(): Promise<Streamer[]> {
    const response = await apiClient.get('/streamers');
    return response.data.data;
  },

  async getById(id: string): Promise<Streamer> {
    const response = await apiClient.get(`/streamers/${id}`);
    return response.data.data;
  },

  async create(data: CreateStreamerRequest): Promise<Streamer> {
    const response = await apiClient.post('/streamers', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateStreamerRequest): Promise<Streamer> {
    const response = await apiClient.patch(`/streamers/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/streamers/${id}`);
  },
};

export default streamersApi;