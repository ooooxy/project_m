import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useStories } from '../hooks/useStories';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { TaskBar } from '../components/TaskBar';
import { GANTT_CHART_CONFIG } from '../constants';
import type { Task, UserStory } from '../types';

export const GanttPage: React.FC = () => {
  const { stories, loading: storiesLoading, fetchStories } = useStories();
  const { tasks, loading: tasksLoading, fetchTasks } = useTasks();
  const { teamMembers, loading: teamLoading, fetchTeamMembers } = useTeam();

  useEffect(() => {
    fetchStories();
    fetchTasks();
    fetchTeamMembers();
  }, [fetchStories, fetchTasks, fetchTeamMembers]);

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

  const totalDays = 14;
  const { rowHeight, leftPanelWidth, minDayWidth } = GANTT_CHART_CONFIG;

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

    sorted.forEach((task) => {
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
      row.forEach((task) => {
        result.push({ ...task, row: rowIndex });
      });
    });

    return result;
  };

  const dateLabels = useMemo(() => {
    const labels: Date[] = [];
    const current = new Date(viewStartDate);
    for (let i = 0; i < totalDays; i++) {
      labels.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return labels;
  }, [viewStartDate]);

  const storiesWithVisibleTasks = useMemo(() => {
    return stories.filter((story: UserStory) => tasks.some((task) => task.userStoryId === story.id));
  }, [stories, tasks]);

  const todayDayIndex = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - viewStartDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days >= 0 && days < totalDays) {
      return days;
    }
    return -1;
  }, [viewStartDate]);

  const isLoading = storiesLoading || tasksLoading || teamLoading;

  return (
    <div className="p-4 h-[calc(100vh-80px)]">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-slate-600 text-sm">加载中...</div>
          </div>
        </div>
      )}

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
            <div className="flex">
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

              <div className="flex-1">
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

            {storiesWithVisibleTasks.length > 0 ? (
              <div className="relative">
                {todayDayIndex >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0 border-l border-primary-500 border-dashed z-50"
                    style={{ left: `calc(${leftPanelWidth}px + 32px + (100% - ${leftPanelWidth}px - 64px) * (${todayDayIndex} + 0.5) / ${totalDays})` }}
                    title="今天"
                  />
                )}

                {storiesWithVisibleTasks.map((story: UserStory) => {
                  const storyTasks = tasks.filter((task) => task.userStoryId === story.id && isTaskInView(task));
                  const arrangedTasks = arrangeTasks(storyTasks);
                  const rowCount = arrangedTasks.length > 0
                    ? Math.max(...arrangedTasks.map((t) => t.row)) + 1
                    : 1;

                  return (
                    <div key={story.id} className="flex border-b border-slate-100">
                      <div
                        className="flex-shrink-0 bg-slate-50 border-r border-slate-100 px-3 flex items-center"
                        style={{ width: '224px', height: `${rowCount * rowHeight}px` }}
                      >
                        <div className="text-sm font-medium text-slate-700 truncate">{story.title}</div>
                      </div>

                      <div className="flex-1 relative" style={{ height: `${rowCount * rowHeight}px`, paddingLeft: '32px', paddingRight: '32px' }}>
                        {arrangedTasks.map((task) => {
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
    </div>
  );
};

