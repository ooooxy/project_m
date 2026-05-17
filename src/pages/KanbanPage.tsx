import React, { useMemo, useState, useEffect } from 'react';
import { useStories } from '../hooks/useStories';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { StoryCard } from '../components/StoryCard';
import { TaskCard } from '../components/TaskCard';
import type { StoryStage, Task, UserStory } from '../types';

interface StoryColumn {
  id: StoryStage;
  title: string;
  color: string;
}

interface TaskColumn {
  id: Task['status'];
  title: string;
  color: string;
}

const storyColumns: StoryColumn[] = [
  { id: 'requirements', title: '需求', color: 'bg-slate-500' },
  { id: 'design', title: '设计', color: 'bg-purple-500' },
  { id: 'development', title: '开发', color: 'bg-blue-500' },
  { id: 'integration', title: '联调', color: 'bg-cyan-500' },
  { id: 'testing', title: '测试', color: 'bg-amber-500' },
  { id: 'acceptance', title: '验收', color: 'bg-orange-500' },
  { id: 'release', title: '发布', color: 'bg-green-600' },
];

const taskColumns: TaskColumn[] = [
  { id: 'todo', title: '待办', color: 'bg-slate-500' },
  { id: 'in-progress', title: '进行中', color: 'bg-blue-500' },
  { id: 'review', title: '待评审', color: 'bg-yellow-500' },
  { id: 'blocked', title: '阻塞/求助', color: 'bg-red-500' },
  { id: 'done', title: '已完成', color: 'bg-green-500' },
];

const getStoryStage = (story: UserStory): StoryStage => (story.stage ?? 'requirements') as StoryStage;

export const KanbanPage: React.FC = () => {
  const { stories, loading: storiesLoading, fetchStories, updateStory } = useStories();
  const { tasks, loading: tasksLoading, fetchTasks, createTask, updateTask } = useTasks();
  const { teamMembers, loading: teamLoading, fetchTeamMembers } = useTeam();

  const loading = storiesLoading || tasksLoading || teamLoading;

  useEffect(() => {
    fetchStories();
    fetchTasks();
    fetchTeamMembers();
  }, [fetchStories, fetchTasks, fetchTeamMembers]);

  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  useEffect(() => {
    if (teamMembers.length === 0) return;
    const saved = localStorage.getItem('workflow_current_member_id');
    const initial = saved && teamMembers.some((m) => m.id === saved) ? saved : teamMembers[0].id;
    setCurrentMemberId((prev) => prev ?? initial);
  }, [teamMembers]);

  useEffect(() => {
    if (!currentMemberId) return;
    localStorage.setItem('workflow_current_member_id', currentMemberId);
  }, [currentMemberId]);

  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [taskStatusFilter, setTaskStatusFilter] = useState<Task['status'] | null>(null);

  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);
  const [dragOverStoryColumn, setDragOverStoryColumn] = useState<StoryStage | null>(null);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskColumn, setDragOverTaskColumn] = useState<Task['status'] | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'create' | 'createAndClaim'>('create');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftType, setDraftType] = useState<Task['type']>('dev');

  const selectedStory = useMemo(() => stories.find((s) => s.id === selectedStoryId) ?? null, [stories, selectedStoryId]);

  const tasksForSelectedStory = useMemo(() => {
    if (!selectedStoryId) return null;
    return tasks.filter((t) => t.userStoryId === selectedStoryId);
  }, [tasks, selectedStoryId]);

  const visibleTasks = useMemo(() => {
    const base = selectedStoryId ? tasks.filter((t) => t.userStoryId === selectedStoryId) : tasks;
    if (!taskStatusFilter) return base;
    return base.filter((t) => t.status === taskStatusFilter);
  }, [tasks, selectedStoryId, taskStatusFilter]);

  const getStoriesByStage = (stage: StoryStage) => stories.filter((s) => getStoryStage(s) === stage);
  const getTasksByStatus = (status: Task['status']) => visibleTasks.filter((t) => t.status === status);

  const getStoryTaskCounts = (storyId: string) => {
    const storyTasks = tasks.filter((t) => t.userStoryId === storyId);
    return {
      blocked: storyTasks.filter((t) => t.status === 'blocked').length,
      review: storyTasks.filter((t) => t.status === 'review').length,
    };
  };

  const handleSelectStory = (storyId: string) => {
    setTaskStatusFilter(null);
    setSelectedStoryId((prev) => (prev === storyId ? null : storyId));
  };

  const handleStoryBadgeClick = (storyId: string, status: 'blocked' | 'review') => {
    setSelectedStoryId(storyId);
    setTaskStatusFilter(status);
  };

  const handleStoryDragStart = (e: React.DragEvent, storyId: string) => {
    setDraggedStoryId(storyId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStoryDragOver = (e: React.DragEvent, columnId: StoryStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStoryColumn(columnId);
  };

  const handleStoryDrop = async (e: React.DragEvent, columnId: StoryStage) => {
    e.preventDefault();
    if (!draggedStoryId) return;
    try {
      await updateStory(draggedStoryId, { stage: columnId });
    } catch (error) {
      console.error('更新需求节点失败:', error);
    } finally {
      setDraggedStoryId(null);
      setDragOverStoryColumn(null);
    }
  };

  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e: React.DragEvent, columnId: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTaskColumn(columnId);
  };

  const handleTaskDrop = async (e: React.DragEvent, columnId: Task['status']) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    const assigneeId = columnId === 'in-progress' ? (currentMemberId ?? task?.assigneeId) : task?.assigneeId;
    try {
      await updateTask(draggedTaskId, { status: columnId, assigneeId });
    } catch (error) {
      console.error('更新任务状态失败:', error);
    } finally {
      setDraggedTaskId(null);
      setDragOverTaskColumn(null);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const assigneeId = currentMemberId ?? task?.assigneeId;
    if (!assigneeId) return;
    try {
      await updateTask(taskId, { status: 'in-progress', assigneeId });
    } catch (error) {
      console.error('认领任务失败:', error);
    }
  };

  const openCreateModal = (mode: 'create' | 'createAndClaim') => {
    setCreateMode(mode);
    setDraftTitle('');
    setDraftDescription('');
    setDraftType('dev');
    setCreateModalOpen(true);
  };

  const submitCreateTask = async () => {
    if (!currentMemberId) return;
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const status: Task['status'] = createMode === 'createAndClaim' ? 'in-progress' : 'todo';
    const assigneeId = createMode === 'createAndClaim' ? currentMemberId : undefined;

    try {
      await createTask({
        title: draftTitle.trim(),
        description: draftDescription.trim(),
        userStoryId: selectedStoryId ?? undefined,
        creatorId: currentMemberId,
        assigneeId,
        status,
        type: draftType,
        startDate,
        endDate,
        dependsOn: [],
      });
      setCreateModalOpen(false);
    } catch (error) {
      console.error('创建任务失败:', error);
    }
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
      
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">看板</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">当前成员</span>
          <select
            value={currentMemberId ?? ''}
            onChange={(e) => setCurrentMemberId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
            disabled={teamMembers.length === 0}
          >
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">需求看板</h3>
          {selectedStory && (
            <button
              type="button"
              onClick={() => setSelectedStoryId(null)}
              className="text-sm text-primary-700 hover:text-primary-800"
            >
              取消选中
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="flex flex-nowrap gap-4 min-w-max pb-2">
            {storyColumns.map((column) => (
              <div
                key={column.id}
                onDragOver={(e) => handleStoryDragOver(e, column.id)}
                onDrop={(e) => handleStoryDrop(e, column.id)}
                onDragLeave={() => setDragOverStoryColumn(null)}
                className={`bg-slate-100 rounded-xl p-4 transition-all w-64 flex-shrink-0 ${
                  dragOverStoryColumn === column.id ? 'ring-2 ring-primary-400 ring-opacity-50 bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h4 className="font-semibold text-slate-700 text-sm">{column.title}</h4>
                  <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">
                    {getStoriesByStage(column.id).length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[160px]">
                  {getStoriesByStage(column.id).map((story) => {
                    const counts = getStoryTaskCounts(story.id);
                    return (
                      <StoryCard
                        key={story.id}
                        story={story}
                        selected={selectedStoryId === story.id}
                        blockedCount={counts.blocked}
                        reviewCount={counts.review}
                        onSelect={handleSelectStory}
                        onDragStart={handleStoryDragStart}
                        onBadgeClick={handleStoryBadgeClick}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-700">任务看板</h3>
            {selectedStory && (
              <span className="text-sm text-slate-500">
                当前需求：{selectedStory.title}
              </span>
            )}
            {taskStatusFilter && (
              <button
                type="button"
                onClick={() => setTaskStatusFilter(null)}
                className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              >
                清除状态筛选
              </button>
            )}
          </div>
          {selectedStory && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCreateModal('create')}
                className="text-sm px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                创建任务
              </button>
              <button
                type="button"
                onClick={() => openCreateModal('createAndClaim')}
                className="text-sm px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                创建并认领
              </button>
            </div>
          )}
        </div>

        {selectedStoryId && tasksForSelectedStory && tasksForSelectedStory.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <div className="text-slate-700 font-medium mb-2">该需求暂无任务</div>
            <div className="text-sm text-slate-500 mb-6">为该需求创建任务后，团队成员可以在下方看板中认领与推进</div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openCreateModal('create')}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                创建任务
              </button>
              <button
                type="button"
                onClick={() => openCreateModal('createAndClaim')}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                创建并认领
              </button>
            </div>
          </div>
        ) : taskStatusFilter ? (
          <div className="grid grid-cols-1 gap-6">
            {taskColumns
              .filter((c) => c.id === taskStatusFilter)
              .map((column) => (
                <div
                  key={column.id}
                  onDragOver={(e) => handleTaskDragOver(e, column.id)}
                  onDrop={(e) => handleTaskDrop(e, column.id)}
                  onDragLeave={() => setDragOverTaskColumn(null)}
                  className={`bg-slate-100 rounded-xl p-4 transition-all ${
                    dragOverTaskColumn === column.id ? 'ring-2 ring-primary-400 ring-opacity-50 bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h4 className="font-semibold text-slate-700 text-sm">{column.title}</h4>
                    <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">
                      {getTasksByStatus(column.id).length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {getTasksByStatus(column.id).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        teamMembers={teamMembers}
                        onDragStart={handleTaskDragStart}
                        onClaim={handleClaimTask}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex flex-nowrap gap-6 min-w-max pb-2">
              {taskColumns.map((column) => (
                <div
                  key={column.id}
                  onDragOver={(e) => handleTaskDragOver(e, column.id)}
                  onDrop={(e) => handleTaskDrop(e, column.id)}
                  onDragLeave={() => setDragOverTaskColumn(null)}
                  className={`bg-slate-100 rounded-xl p-4 transition-all w-72 flex-shrink-0 ${
                    dragOverTaskColumn === column.id ? 'ring-2 ring-primary-400 ring-opacity-50 bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h4 className="font-semibold text-slate-700 text-sm">{column.title}</h4>
                    <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">
                      {getTasksByStatus(column.id).length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {getTasksByStatus(column.id).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        teamMembers={teamMembers}
                        onDragStart={handleTaskDragStart}
                        onClaim={handleClaimTask}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {createMode === 'createAndClaim' ? '创建并认领任务' : '创建任务'}
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                关闭
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">标题</label>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  placeholder="请输入任务标题"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">描述</label>
                <textarea
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 min-h-[96px]"
                  placeholder="请输入任务描述"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">类型</label>
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as Task['type'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="dev">开发</option>
                  <option value="design">设计</option>
                  <option value="test">测试</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitCreateTask}
                disabled={!draftTitle.trim()}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
