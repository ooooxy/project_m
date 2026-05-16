import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '../types';

interface Column {
  id: Task['status'];
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: 'todo', title: '待办', color: 'bg-slate-500' },
  { id: 'in-progress', title: '进行中', color: 'bg-blue-500' },
  { id: 'review', title: '待评审', color: 'bg-yellow-500' },
  { id: 'done', title: '已完成', color: 'bg-green-500' },
];

export const KanbanPage: React.FC = () => {
  const { tasks, loading, fetchTasks, updateTaskStatus } = useTasks();
  
  // 加载数据
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((t) => t.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId) {
      try {
        await updateTaskStatus(draggedTaskId, columnId);
        fetchTasks(); // 重新加载数据
      } catch (error) {
        console.error('更新任务状态失败:', error);
      }
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="p-6">
      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-slate-600 text-sm">加载中...</div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`bg-slate-100 rounded-xl p-4 transition-all ${
              dragOverColumn === column.id ? 'ring-2 ring-primary-400 ring-opacity-50 bg-primary-50' : ''
            }`}
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-slate-700">{column.title}</h3>
              <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">
                {getTasksByStatus(column.id).length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};