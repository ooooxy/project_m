import { useState, useCallback } from 'react';
import type { UserStory } from '../types';
import { storiesApi } from '../api/stories';

export const useStories = () => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await storiesApi.getAll();
      if (response.success && response.data) {
        setStories(response.data);
      }
    } catch (err) {
      setError('获取用户故事失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = useCallback(async (data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await storiesApi.create(data);
      if (!response.data) throw new Error('创建用户故事失败');
      const newStory = response.data;
      setStories(prev => [...prev, newStory]);
      return newStory;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateStory = useCallback(async (id: string, data: Partial<UserStory>) => {
    try {
      const response = await storiesApi.update(id, data);
      if (!response.data) throw new Error('更新用户故事失败');
      const updated = response.data;
      setStories(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const deleteStory = useCallback(async (id: string) => {
    try {
      const response = await storiesApi.delete(id);
      if (!response.success) throw new Error('删除用户故事失败');
      setStories(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  return {
    stories,
    loading,
    error,
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
  };
};
