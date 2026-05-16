import api, { ApiResponse } from './index';
import type { UserStory } from '../types';

export const storiesApi = {
  getAll: async (): Promise<ApiResponse<UserStory[]>> => {
    return api.get('/api/stories');
  },

  getById: async (id: string): Promise<ApiResponse<UserStory>> => {
    return api.get(`/api/stories/${id}`);
  },

  create: async (data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UserStory>> => {
    return api.post('/api/stories', data);
  },

  update: async (id: string, data: Partial<UserStory>): Promise<ApiResponse<UserStory>> => {
    return api.put(`/api/stories/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/stories/${id}`);
  },
};