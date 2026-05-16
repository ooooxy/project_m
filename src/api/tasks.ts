import api, { ApiResponse } from './index';
import type { Task } from '../types';

export interface TaskQueryParams {
  userStoryId?: string;
  assigneeId?: string;
  status?: Task['status'];
}

export const tasksApi = {
  getAll: async (params?: TaskQueryParams): Promise<ApiResponse<Task[]>> => {
    const queryParams: Record<string, string> = {};
    if (params?.userStoryId) {
      queryParams.userStoryId = params.userStoryId;
    }
    if (params?.assigneeId) {
      queryParams.assigneeId = params.assigneeId;
    }
    if (params?.status) {
      queryParams.status = params.status;
    }
    return api.get('/api/tasks', Object.keys(queryParams).length > 0 ? queryParams : undefined);
  },

  getById: async (id: string): Promise<ApiResponse<Task>> => {
    return api.get(`/api/tasks/${id}`);
  },

  create: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> => {
    return api.post('/api/tasks', data);
  },

  update: async (id: string, data: Partial<Task>): Promise<ApiResponse<Task>> => {
    return api.put(`/api/tasks/${id}`, data);
  },

  updateStatus: async (id: string, status: Task['status']): Promise<ApiResponse<{ id: string; status: Task['status']; updatedAt: string }>> => {
    return api.patch(`/api/tasks/${id}/status`, { status });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/tasks/${id}`);
  },
};