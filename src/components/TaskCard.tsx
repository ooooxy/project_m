import React from 'react';
import { useStore } from '../store/useStore';
import { getTaskTypeColor } from '../utils/dateUtils';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const { teamMembers } = useStore();
  const assignee = teamMembers.find((m) => m.id === task.assigneeId);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="card p-4 hover:shadow-md transition-shadow cursor-move opacity-90 hover:opacity-100"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
          {task.type === 'design' ? '设计' : task.type === 'dev' ? '开发' : '测试'}
        </span>
      </div>
      <h4 className="font-medium text-slate-900 mb-2">{task.title}</h4>
      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex items-center">
        {assignee && (
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: assignee.color }}
            >
              {assignee.avatar}
            </div>
            <span className="text-xs text-slate-600">{assignee.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};