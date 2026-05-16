import { useState, useCallback } from 'react';
import type { Task } from '../types';
import { tasksApi, TaskQueryParams } from '../api/tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (params?: TaskQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tasksApi.getAll(params);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      setError('获取任务失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await tasksApi.create(data);
      if (response.success && response.data) {
        const newTask = response.data;
        setTasks(prev => [...prev, newTask]);
        return newTask;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    try {
      const response = await tasksApi.update(id, data);
      if (response.success && response.data) {
        const updated = response.data;
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        return updated;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: Task['status']) => {
    try {
      const response = await tasksApi.updateStatus(id, status);
      if (response.success && response.data) {
        const data = response.data;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: data.status, updatedAt: data.updatedAt } : t));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const response = await tasksApi.delete(id);
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
};