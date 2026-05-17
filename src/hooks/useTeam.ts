import { useState, useCallback } from 'react';
import type { TeamMember } from '../types';
import { teamApi } from '../api/team';

export const useTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await teamApi.getAll();
      if (response.success && response.data) {
        setTeamMembers(response.data);
      }
    } catch (err) {
      setError('获取团队成员失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = useCallback(async (data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await teamApi.create(data);
      if (!response.data) throw new Error('创建团队成员失败');
      const newMember = response.data;
      setTeamMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateMember = useCallback(async (id: string, data: Partial<TeamMember>) => {
    try {
      const response = await teamApi.update(id, data);
      if (!response.data) throw new Error('更新团队成员失败');
      const updated = response.data;
      setTeamMembers(prev => prev.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    try {
      const response = await teamApi.delete(id);
      if (!response.success) throw new Error('删除团队成员失败');
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  return {
    teamMembers,
    loading,
    error,
    fetchTeamMembers,
    createMember,
    updateMember,
    deleteMember,
  };
};
