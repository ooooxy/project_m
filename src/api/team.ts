import api, { ApiResponse } from './index';
import type { TeamMember } from '../types';

export const teamApi = {
  getAll: async (): Promise<ApiResponse<TeamMember[]>> => {
    return api.get('/api/team');
  },

  getById: async (id: string): Promise<ApiResponse<TeamMember>> => {
    return api.get(`/api/team/${id}`);
  },

  create: async (data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TeamMember>> => {
    return api.post('/api/team', data);
  },

  update: async (id: string, data: Partial<TeamMember>): Promise<ApiResponse<TeamMember>> => {
    return api.put(`/api/team/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/team/${id}`);
  },
};