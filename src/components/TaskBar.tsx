import React, { useState } from 'react';
import type { Task, TeamMember } from '../types';
import { formatDate } from '../utils/dateUtils';
import { GANTT_CHART_CONFIG } from '../constants';

interface TaskBarProps {
  task: Task;
  assignee: TeamMember | undefined;
  position: { left: number; width: number };
  row: number;
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'todo': return '待办';
    case 'in-progress': return '进行中';
    case 'review': return '待评审';
    case 'done': return '已完成';
    default: return status;
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case 'design': return '设计';
    case 'dev': return '开发';
    case 'test': return '测试';
    default: return type;
  }
};

export const TaskBar: React.FC<TaskBarProps> = ({ task, assignee, position, row }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const taskRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (taskRef.current) {
      const rect = taskRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const statusColors = {
    done: 'bg-green-500 hover:bg-green-600',
    'in-progress': 'bg-blue-500 hover:bg-blue-600',
    review: 'bg-amber-500 hover:bg-amber-600',
    todo: 'bg-slate-400 hover:bg-slate-500',
  };

  const statusBadgeColors = {
    done: 'bg-green-600',
    'in-progress': 'bg-blue-600',
    review: 'bg-amber-600',
    todo: 'bg-slate-600',
  };

  const typeIcons = {
    design: '🎨',
    dev: '💻',
    test: '✅',
  };

  const { rowHeight, taskHeight } = GANTT_CHART_CONFIG;
  const topOffset = (rowHeight - taskHeight) / 2;

  return (
    <div
      className="relative"
      style={{
        position: 'absolute',
        top: `${row * rowHeight + topOffset}px`,
        left: `${position.left}%`,
        minWidth: '32px',
        width: `${Math.max(position.width, 8)}%`,
        zIndex: 20 + row,
      }}
    >
      <div
        ref={taskRef}
        className={`h-7 rounded-lg px-2.5 py-1 text-xs text-white font-medium shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${statusColors[task.status as keyof typeof statusColors] || statusColors.todo}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={task.title}
      >
        <div className="flex items-center justify-start gap-1.5 w-full h-full overflow-hidden">
          <span className="flex-shrink-0">{typeIcons[task.type as keyof typeof typeIcons]}</span>
          <span className="truncate flex-1 font-medium">{task.title}</span>
          {assignee && (
            <span 
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow-sm"
              style={{ backgroundColor: assignee.color }}
              title={assignee.name}
            >
              {assignee.avatar}
            </span>
          )}
        </div>
      </div>
      
      {isHovered && (
        <div
          className="w-64 bg-slate-900 text-white rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 1000,
            marginTop: '-8px',
          }}
        >
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700">
            {assignee && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: assignee.color }}
              >
                {assignee.avatar}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{task.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{assignee?.name || '未分配'}</p>
            </div>
          </div>
          
          {task.description && (
            <p className="text-xs text-slate-300 mb-3 line-clamp-2">{task.description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">状态</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeColors[task.status as keyof typeof statusBadgeColors]}`}>
                {getStatusText(task.status)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">类型</span>
              <span className="text-slate-300">{getTypeText(task.type)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">时间</span>
              <span className="text-slate-300">
                {formatDate(task.startDate)} - {formatDate(task.endDate)}
              </span>
            </div>
          </div>
          
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"
          />
        </div>
      )}
    </div>
  );
};