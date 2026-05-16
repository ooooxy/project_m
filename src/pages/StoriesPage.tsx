import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Plus, Trash2, X, Check, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getPriorityColor, formatDate } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';
import { useStories } from '../hooks/useStories';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { TaskBar } from '../components/TaskBar';
import { GANTT_CHART_CONFIG } from '../constants';
import type { UserStory, Task } from '../types';

interface NewStoryFormProps {
  onSubmit: (story: { title: string; priority: 'low' | 'medium' | 'high' }) => void;
  onCancel: () => void;
}

const NewStoryForm: React.FC<NewStoryFormProps> = React.memo(({
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({ title, priority });
    
    setTitle('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 border-2 border-primary-300 bg-primary-50">
      <div className="space-y-3">
        <textarea
          ref={titleInputRef as any}
          placeholder="用户故事"
          className="input w-full"
          rows={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            className="select text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Check size={16} />
            <span>创建</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </form>
  );
});

interface NewTaskFormProps {
  userStoryId: string;
  teamMembers: any[];
  type: 'design' | 'dev' | 'test';
  creatorId: string;
  onSubmit: (task: { title: string; description: string; userStoryId: string; creatorId: string; assigneeId: string; type: 'design' | 'dev' | 'test'; startDate: string; endDate: string }) => void;
  onCancel: () => void;
  onDelete?: (taskId: string) => void;
  editingTask?: Task | null;
}

const NewTaskForm: React.FC<NewTaskFormProps> = React.memo(({
  userStoryId,
  teamMembers,
  type,
  creatorId,
  onSubmit,
  onCancel,
  onDelete,
  editingTask,
}) => {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [assigneeId, setAssigneeId] = useState(editingTask?.assigneeId || creatorId);
  const [startDate, setStartDate] = useState(editingTask?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(editingTask?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入任务标题');
      return;
    }
    if (!assigneeId) {
      alert('请选择负责人');
      return;
    }
    if (!startDate) {
      alert('请选择开始日期');
      return;
    }
    if (!endDate) {
      alert('请选择截止日期');
      return;
    }
    
    onSubmit({ title, description, userStoryId, creatorId, assigneeId, type, startDate, endDate });
    
    setTitle('');
    setDescription('');
    setAssigneeId(creatorId);
  };

  const handleDelete = () => {
    if (onDelete && editingTask) {
      onDelete(editingTask.id);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'design': return '设计';
      case 'dev': return '开发';
      case 'test': return '测试';
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-900">{editingTask ? '编辑' : '新建'}{getTypeLabel()}任务</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">任务标题</label>
              <input
                ref={titleInputRef}
                type="text"
                placeholder="输入任务标题"
                className="input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">任务描述</label>
              <textarea
                placeholder="输入任务描述（可选）"
                className="input w-full resize-none"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">负责人</label>
              <select
                className="select w-full"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">选择负责人</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">开始日期</label>
                <input
                  type="date"
                  className="input w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">截止日期</label>
                <input
                  type="date"
                  className="input w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-2 pt-1">
              {editingTask && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Check size={14} />
                <span>{editingTask ? '保存' : '创建'}</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

interface ColumnConfig {
  type: 'design' | 'dev' | 'test';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const columnConfigs: ColumnConfig[] = [
  { type: 'design', label: '设计', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { type: 'dev', label: '开发', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { type: 'test', label: '测试', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
];

const StoryCard: React.FC<{ story: UserStory; isSelected?: boolean; onClick?: () => void }> = ({ story, isSelected, onClick }) => {
  return (
    <div 
      className={`card p-3 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-slate-50'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}>
              {story.priority === 'high' ? '高优先级' : story.priority === 'medium' ? '中优先级' : '低优先级'}
            </span>
          </div>
          <h4 className="font-medium text-slate-900 mb-2">{story.title}</h4>
          <div className="text-xs text-slate-400">
            创建于 {formatDate(story.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoriesPage: React.FC = () => {
  const { user } = useStore();
  const { isAuthenticated } = useAuth();
  
  // 使用 API Hooks
  const { stories, loading: storiesLoading, fetchStories, createStory } = useStories();
  const { tasks, loading: tasksLoading, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const { teamMembers, loading: teamLoading, fetchTeamMembers } = useTeam();
  
  // 加载数据
  useEffect(() => {
    fetchStories();
    fetchTasks();
    fetchTeamMembers();
  }, [fetchStories, fetchTasks, fetchTeamMembers]);
  
  const currentUserId = user?.id || teamMembers[0]?.id || '';
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addingTaskType, setAddingTaskType] = useState<'design' | 'dev' | 'test'>('dev');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUnsplitExpanded, setIsUnsplitExpanded] = useState(true);
  const [isSplitExpanded, setIsSplitExpanded] = useState(true);
  const [isGanttExpanded, setIsGanttExpanded] = useState(true);
  
  const [viewStartDate, setViewStartDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    now.setDate(now.getDate() + diff);
    return now;
  });

  const viewEndDate = useMemo(() => {
    const end = new Date(viewStartDate);
    end.setDate(end.getDate() + 13);
    return end;
  }, [viewStartDate]);



  const handlePrev = () => {
    const newStart = new Date(viewStartDate);
    newStart.setDate(newStart.getDate() - 14);
    setViewStartDate(newStart);
  };

  const handleNext = () => {
    const newStart = new Date(viewStartDate);
    newStart.setDate(newStart.getDate() + 14);
    setViewStartDate(newStart);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    today.setDate(today.getDate() + diff);
    setViewStartDate(today);
  };

  const getISOWeekInfo = (date: Date): { year: number; week: number } => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const year = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year, week };
  };

  const weekRange = useMemo(() => {
    const startInfo = getISOWeekInfo(viewStartDate);
    const endDate = new Date(viewStartDate);
    endDate.setDate(endDate.getDate() + 13);
    const endInfo = getISOWeekInfo(endDate);
    return `${startInfo.year}W${startInfo.week} - ${endInfo.year}W${endInfo.week}`;
  }, [viewStartDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const handleSubmit = useCallback((story: { title: string; priority: 'low' | 'medium' | 'high' }) => {
    const data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'> = {
      title: story.title,
      priority: story.priority,
    };
    createStory(data).then(() => {
      setIsAddingStory(false);
      fetchStories(); // 重新加载数据
    }).catch((error) => {
      console.error('创建故事失败:', error);
    });
  }, [createStory, fetchStories]);

  const handleCancel = useCallback(() => {
    setIsAddingStory(false);
  }, []);

  const handleTaskSubmit = useCallback(async (task: { title: string; description: string; userStoryId: string; creatorId: string; assigneeId: string; type: 'design' | 'dev' | 'test'; startDate: string; endDate: string }) => {
    console.log('handleTaskSubmit called with:', task);
    
    if (!task.userStoryId) {
      console.error('缺少用户故事ID');
      alert('请先选择一个用户故事');
      return;
    }
    
    if (!task.creatorId) {
      console.error('缺少创建者ID');
      alert('创建者信息缺失');
      return;
    }
    
    try {
      if (editingTask) {
        console.log('更新任务:', editingTask.id);
        await updateTask(editingTask.id, {
          title: task.title,
          description: task.description,
          assigneeId: task.assigneeId,
          type: task.type,
          startDate: task.startDate,
          endDate: task.endDate,
        });
      } else {
        console.log('创建任务:', task);
        await createTask({
          title: task.title,
          description: task.description,
          userStoryId: task.userStoryId,
          creatorId: task.creatorId,
          assigneeId: task.assigneeId,
          type: task.type,
          startDate: task.startDate,
          endDate: task.endDate,
          status: 'todo',
          dependsOn: [],
        });
      }
      setIsAddingTask(false);
      setEditingTask(null);
      fetchTasks();
      console.log('任务处理成功');
    } catch (error) {
      console.error('处理任务失败:', error);
      alert('创建任务失败: ' + (error as Error).message);
    }
  }, [createTask, updateTask, editingTask, fetchTasks]);

  const handleTaskCancel = useCallback(() => {
    setIsAddingTask(false);
    setAddingTaskType('dev');
    setEditingTask(null);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setAddingTaskType(task.type);
    setIsAddingTask(true);
  }, []);

  const getTaskCountForStory = useCallback((storyId: string) => {
    const storyTasks = tasks.filter((t) => t.userStoryId === storyId);
    const doneTasks = storyTasks.filter((t) => t.status === 'done').length;
    return { total: storyTasks.length, done: doneTasks };
  }, [tasks]);

  const storiesWithNoTasks = stories.filter((story) => {
    const taskCount = getTaskCountForStory(story.id);
    return taskCount.total === 0;
  });

  const storiesWithTasks = stories.filter((story) => {
    const taskCount = getTaskCountForStory(story.id);
    return taskCount.total > 0;
  });

  const selectedStory = stories.find((s) => s.id === selectedStoryId);
  const selectedStoryTasks = tasks.filter((t) => t.userStoryId === selectedStoryId);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'design': return 'bg-purple-100 border-purple-300';
      case 'dev': return 'bg-blue-100 border-blue-300';
      case 'test': return 'bg-orange-100 border-orange-300';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-200';
      case 'in-progress': return 'bg-blue-200';
      case 'review': return 'bg-yellow-200';
      default: return 'bg-slate-200';
    }
  };

  const getTasksByType = (type: 'design' | 'dev' | 'test') => {
    return [...selectedStoryTasks]
      .filter(task => task.type === type)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const visibleTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  const totalDays = 14;
  const { rowHeight, leftPanelWidth, minDayWidth } = GANTT_CHART_CONFIG;

  const isTaskInView = (task: Task) => {
    const taskStart = new Date(task.startDate).getTime();
    const taskEnd = new Date(task.endDate).getTime();
    const viewEnd = viewEndDate.getTime();
    const viewStart = viewStartDate.getTime();
    return taskStart <= viewEnd && taskEnd >= viewStart;
  };

  const getTaskPosition = (task: Task) => {
    const start = new Date(task.startDate + 'T00:00:00');
    const end = new Date(task.endDate + 'T00:00:00');
    
    const viewStart = new Date(viewStartDate);
    viewStart.setHours(0, 0, 0, 0);
    
    const viewEnd = new Date(viewEndDate);
    viewEnd.setHours(0, 0, 0, 0);
    
    const taskStart = Math.max(start.getTime(), viewStart.getTime());
    const taskEnd = Math.min(end.getTime(), viewEnd.getTime());
    
    if (taskEnd <= viewStart.getTime() || taskStart >= viewEnd.getTime()) {
      return { left: -100, width: 0 };
    }
    
    const left = Math.floor((taskStart - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    const width = Math.max(Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1, 1);
    
    return { left: (left / totalDays) * 100, width: Math.min((width / totalDays) * 100, 100) };
  };

  interface TaskWithRow extends Task {
    row: number;
  }

  const arrangeTasks = (tasksToArrange: Task[]): TaskWithRow[] => {
    if (tasksToArrange.length === 0) return [];

    const sorted = [...tasksToArrange].sort((a, b) => {
      const startCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (startCompare !== 0) return startCompare;
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });

    const rows: Task[][] = [];

    const viewStart = new Date(viewStartDate);
    viewStart.setHours(0, 0, 0, 0);
    const viewEnd = new Date(viewEndDate);
    viewEnd.setHours(0, 0, 0, 0);

    sorted.forEach(task => {
      const taskStart = new Date(task.startDate).getTime();
      const taskEnd = new Date(task.endDate).getTime();
      
      let placed = false;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let canPlace = true;
        
        for (const existingTask of row) {
          const existingStart = new Date(existingTask.startDate).getTime();
          const existingEnd = new Date(existingTask.endDate).getTime();
          
          const adjustedTaskStart = Math.max(taskStart, viewStart.getTime());
          const adjustedTaskEnd = Math.min(taskEnd, viewEnd.getTime());
          const adjustedExistingStart = Math.max(existingStart, viewStart.getTime());
          const adjustedExistingEnd = Math.min(existingEnd, viewEnd.getTime());
          
          if (adjustedTaskStart < adjustedExistingEnd && adjustedTaskEnd > adjustedExistingStart) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          row.push(task);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        rows.push([task]);
      }
    });

    const result: TaskWithRow[] = [];
    rows.forEach((row, rowIndex) => {
      row.forEach(task => {
        result.push({ ...task, row: rowIndex });
      });
    });

    return result;
  };

  const getDateLabels = () => {
    const labels = [];
    const current = new Date(viewStartDate);
    for (let i = 0; i < totalDays; i++) {
      labels.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return labels;
  };

  const dateLabels = getDateLabels();

  const storiesWithVisibleTasks = stories.filter((story: UserStory) => 
    visibleTasks.some(task => task.userStoryId === story.id)
  );

  const todayDayIndex = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - viewStartDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days >= 0 && days < totalDays) {
      return days;
    }
    return -1;
  }, [viewStartDate, totalDays]);

  // 更新删除任务的处理函数
  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      fetchTasks(); // 重新加载数据
    } catch (error) {
      console.error('删除任务失败:', error);
    }
  }, [deleteTask, fetchTasks]);

  const isLoading = storiesLoading || tasksLoading || teamLoading;

  return (
    <div className="p-4 h-[calc(100vh-80px)]">
      {/* 加载状态 */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-slate-600 text-sm">加载中...</div>
          </div>
        </div>
      )}
      
      {/* 甘特图组件 */}
      <div className="mb-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible">
        <div 
          className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 cursor-pointer"
          onClick={() => setIsGanttExpanded(!isGanttExpanded)}
        >
          <div className="flex items-center space-x-2">
            {isGanttExpanded ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
            <h3 className="font-semibold text-slate-700">项目时间线</h3>
            <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full">
              {tasks.length} 个任务
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-slate-400" />
              <span className="text-xs text-slate-600">待办</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-xs text-slate-600">进行中</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-xs text-slate-600">待评审</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-xs text-slate-600">已完成</span>
            </div>
          </div>
        </div>
        
        {isGanttExpanded && (
          <div className="card overflow-x-auto relative overflow-hidden" style={{ borderRadius: '0 0 10px 10px', boxShadow: 'none', boxSizing: 'border-box' }}>
            {/* 头部行 */}
            <div className="flex">
              {/* 左侧头部 */}
              <div className="w-48 flex-shrink-0 bg-white border-r border-slate-200 px-3 flex flex-col justify-center">
                <div className="text-xs font-semibold text-slate-600 mb-2">{weekRange}</div>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                  aria-label="回到今日"
                >
                  <span>回到今日</span>
                </button>
              </div>
              
              {/* 右侧头部 */}
              <div className="flex-1">
                {/* 月份标题行 */}
                <div className="flex bg-gradient-to-b from-slate-50 to-white">
                  <div className="w-8 bg-white border-r border-slate-200" />
                  {dateLabels.map((date, i) => {
                    const isFirstDayOfMonth = date.getDate() === 1;
                    const isFirstDay = i === 0;
                    
                    let monthLabel = '';
                    if (isFirstDay || isFirstDayOfMonth) {
                      const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
                      monthLabel = `${date.getFullYear()}年${months[date.getMonth()]}`;
                    }
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 text-center py-2 border-l border-slate-100"
                        style={{ minWidth: `${minDayWidth}px` }}
                      >
                        {monthLabel && (
                          <div className="text-xs font-semibold text-slate-600">
                            {monthLabel}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="w-8 bg-white border-l border-slate-200" />
                </div>
                
                {/* 日期行 */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={handlePrev}
                    className="flex-shrink-0 flex items-center justify-center w-8 bg-white border-r border-slate-200 hover:bg-slate-50 transition-colors"
                    aria-label="上14天"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {dateLabels.map((date, i) => {
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
                    
                    return (
                      <div
                        key={i}
                        className={`flex-1 text-center border-l border-slate-100 transition-all ${
                          isToday(date)
                            ? 'bg-primary-500 text-white'
                            : isWeekend
                              ? 'text-slate-400 bg-slate-50/50'
                              : 'text-slate-600'
                        }`}
                        style={{ minWidth: `${minDayWidth}px` }}
                      >
                        <div className={`text-xs ${isToday(date) ? 'font-bold' : ''} py-1`}>
                          {date.getDate()}
                        </div>
                        <div className={`text-[10px] opacity-70 pb-1 ${isToday(date) ? 'text-white/70' : ''}`}>
                          {weekDays[dayOfWeek]}
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={handleNext}
                    className="flex-shrink-0 flex items-center justify-center w-8 bg-white border-l border-slate-200 hover:bg-slate-50 transition-colors"
                    aria-label="下14天"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 任务行 */}
            {storiesWithVisibleTasks.length > 0 ? (
              <div className="relative">
                {todayDayIndex >= 0 && (
                  <div className="absolute top-0 bottom-0 w-0 border-l border-primary-500 border-dashed z-50"
                    style={{ left: `calc(${leftPanelWidth}px + 32px + (100% - ${leftPanelWidth}px - 64px) * (${todayDayIndex} + 0.5) / ${totalDays})` }}
                    title="今天"
                  />
                )}
                
                {storiesWithVisibleTasks.map((story: UserStory) => {
                  const storyTasks = visibleTasks.filter(task => task.userStoryId === story.id && isTaskInView(task));
                  const arrangedTasks = arrangeTasks(storyTasks);
                  const rowCount = arrangedTasks.length > 0 
                    ? Math.max(...arrangedTasks.map(t => t.row)) + 1 
                    : 1;
                  
                  return (
                    <div key={story.id} className="flex border-b border-slate-100">
                      {/* 左侧用户故事 */}
                      <div 
                        className="flex-shrink-0 bg-slate-50 border-r border-slate-100 px-3 flex items-center"
                        style={{ width: '224px', height: `${rowCount * rowHeight}px` }}
                      >
                        <div className="text-sm font-medium text-slate-700 truncate">{story.title}</div>
                      </div>
                      
                      {/* 右侧任务区域 */}
                      <div className="flex-1 relative" style={{ height: `${rowCount * rowHeight}px`, paddingLeft: '32px', paddingRight: '32px' }}>
                        {arrangedTasks.map(task => {
                          const position = getTaskPosition(task);
                          const assignee = teamMembers.find((m) => m.id === task.assigneeId);

                          return (
                            <TaskBar
                              key={task.id}
                              task={task}
                              assignee={assignee}
                              position={position}
                              row={task.row}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <div className="text-4xl mb-3">📅</div>
                <div>此时间段内没有任务</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex h-full gap-4">
        {/* 左侧：用户故事列表 */}
        <div className="w-2/5 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* 固定的标题栏 */}
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setIsUnsplitExpanded(!isUnsplitExpanded)}
            >
              {isUnsplitExpanded ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <h3 className="font-semibold text-slate-700">未拆分 Todo</h3>
              <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">
                {storiesWithNoTasks.length}
              </span>
            </div>
          </div>

          {/* 列表内容 */}
          <div className="overflow-y-auto flex-1">
            {/* 未拆分 Todo 列表 */}
            {isUnsplitExpanded && (
              <div className="space-y-2 p-3">
                {isAuthenticated && (
                  isAddingStory ? (
                    <NewStoryForm
                      onSubmit={handleSubmit}
                      onCancel={handleCancel}
                    />
                  ) : (
                    <button
                      onClick={() => setIsAddingStory(true)}
                      className="w-full h-14 card flex items-center justify-center gap-2 bg-primary-50 border-2 border-dashed border-primary-300 rounded-lg hover:bg-primary-100 hover:border-primary-400 transition-colors"
                    >
                      <Plus size={18} className="text-primary-600" />
                      <span className="text-primary-600 font-medium">新建故事</span>
                    </button>
                  )
                )}
                {storiesWithNoTasks.length === 0 && !isAddingStory ? (
                  <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg">
                    暂无未拆分的故事
                  </div>
                ) : (
                  storiesWithNoTasks.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      isSelected={selectedStoryId === story.id}
                      onClick={() => setSelectedStoryId(story.id)}
                    />
                  ))
                )}
              </div>
            )}

            {/* 已拆分 Todo 标题（不悬浮） */}
            <div className="border-t border-slate-100 px-3 py-2.5 bg-slate-50/50">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setIsSplitExpanded(!isSplitExpanded)}
              >
                {isSplitExpanded ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <h3 className="font-semibold text-slate-700">已拆分 Todo</h3>
                <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                  {storiesWithTasks.length}
                </span>
              </div>
            </div>

            {/* 已拆分 Todo 列表 */}
            {isSplitExpanded && (
              <div className="space-y-2 p-3 pb-3">
                {storiesWithTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">
                    暂无已拆分的故事
                  </div>
                ) : (
                  storiesWithTasks.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      isSelected={selectedStoryId === story.id}
                      onClick={() => setSelectedStoryId(story.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：任务拆分视图 */}
        <div className="w-3/5 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-sm relative">
          {selectedStory ? (
            <div className="p-4">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-slate-900">{selectedStory.title}</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {columnConfigs.map((column) => {
                  const tasks = getTasksByType(column.type);

                  return (
                    <div key={column.type} className={`rounded-xl border ${column.borderColor} ${column.bgColor} flex flex-col h-full`}>
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 flex-shrink-0">
                        <h3 className={`font-semibold ${column.color}`}>
                          {column.label}
                          <span className="ml-2 text-xs bg-white px-2 py-0.5 rounded-full text-slate-600">
                            {tasks.length}
                          </span>
                        </h3>
                        {isAuthenticated && (
                          <button
                            onClick={() => {
                              setAddingTaskType(column.type);
                              setIsAddingTask(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>

                      <div className="p-2 space-y-2 overflow-y-auto flex-1">
                        {tasks.length === 0 ? (
                          <div className="text-center py-4 text-slate-400 text-sm">
                            暂无{column.label}任务
                          </div>
                        ) : (
                          tasks.map((task) => {
                            const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                            
                            return (
                              <div
                                key={task.id}
                                className={`p-2.5 rounded-lg border ${getTypeColor(task.type)} group h-24 cursor-pointer hover:shadow-md transition-shadow`}
                                style={{ borderLeft: `3px solid ${getStatusColor(task.status)}` }}
                                onClick={() => handleEditTask(task)}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="text-sm font-medium text-slate-900 line-clamp-1 flex-1 mr-1.5">{task.title}</h4>
                                  {assignee && (
                                    <div 
                                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                                      style={{ backgroundColor: assignee.color }}
                                      title={assignee.name}
                                    >
                                      {assignee.avatar}
                                    </div>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-xs text-slate-500 line-clamp-1 mb-1.5 leading-relaxed">{task.description}</p>
                                )}
                                <div className="flex items-center text-xs text-slate-400">
                                  <Calendar size={9} className="mr-1" />
                                  <span>{formatDate(task.startDate)} ~ {formatDate(task.endDate)}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center text-slate-400">
                <div className="text-lg mb-2">选择一个用户故事</div>
                <p>点击左侧的用户故事卡片查看详情</p>
              </div>
            </div>
          )}
          
          {isAddingTask && selectedStory && (
            <NewTaskForm
              userStoryId={selectedStory.id}
              teamMembers={teamMembers}
              type={addingTaskType}
              creatorId={currentUserId}
              onSubmit={handleTaskSubmit}
              onCancel={handleTaskCancel}
              onDelete={handleDeleteTask}
              editingTask={editingTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};
