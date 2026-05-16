
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useTasks } from '../hooks/useTasks';
import { getRoleLabel } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';

const COLORS = [
  '#8b5cf6', '#059669', '#ea580c', '#dc2626',
  '#2563eb', '#0891b2', '#7c3aed', '#d97706'
];

export const TeamPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // 使用 API Hooks
  const { teamMembers, loading: teamLoading, fetchTeamMembers, createMember, deleteMember } = useTeam();
  const { tasks, loading: tasksLoading, fetchTasks } = useTasks();
  
  // 加载数据
  useEffect(() => {
    fetchTeamMembers();
    fetchTasks();
  }, [fetchTeamMembers, fetchTasks]);
  
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'frontend' as const,
    color: COLORS[0],
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const avatar = newMember.name.charAt(0).toUpperCase();
      await createMember({
        ...newMember,
        avatar,
      });
      setNewMember({ name: '', role: 'frontend', color: COLORS[0] });
      setShowForm(false);
      fetchTeamMembers(); // 重新加载数据
    } catch (error) {
      console.error('添加团队成员失败:', error);
    }
  }, [newMember, createMember, fetchTeamMembers]);
  
  const handleDeleteMember = useCallback(async (memberId: string) => {
    try {
      await deleteMember(memberId);
      fetchTeamMembers(); // 重新加载数据
    } catch (error) {
      console.error('删除团队成员失败:', error);
    }
  }, [deleteMember, fetchTeamMembers]);

  const getMemberStats = useCallback((memberId: string) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === memberId);
    const doneTasks = memberTasks.filter((t) => t.status === 'done').length;
    const inProgressTasks = memberTasks.filter((t) => t.status === 'in-progress').length;
    return {
      total: memberTasks.length,
      done: doneTasks,
      inProgress: inProgressTasks,
    };
  }, [tasks]);
  
  const isLoading = teamLoading || tasksLoading;

  return (
    <div className="p-6">
      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-slate-600 text-sm">加载中...</div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        {isAuthenticated ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center space-x-2 ml-auto"
          >
            <Plus size={20} />
            <span>添加成员</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 text-slate-400 bg-slate-100 rounded-lg ml-auto">
            <Lock size={18} />
            <span>登录后编辑</span>
          </div>
        )}
      </div>

      {showForm && isAuthenticated && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">添加团队成员</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
              <input
                type="text"
                className="input"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">角色</label>
                <select
                  className="select"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                >
                  <option value="uiux">UI/UX 设计</option>
                  <option value="frontend">前端开发</option>
                  <option value="backend">后端开发</option>
                  <option value="test">测试工程师</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">颜色</label>
                <div className="flex space-x-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewMember({ ...newMember, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newMember.color === color ? 'border-slate-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn btn-primary">保存</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const stats = getMemberStats(member.id);

          return (
            <div key={member.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-slate-500">{getRoleLabel(member.role)}</p>
                  </div>
                </div>
                {isAuthenticated ? (
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <div className="p-2 text-slate-300">
                    <Lock size={20} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
                  <div className="text-xs text-slate-500">总 Todo</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{stats.done}</div>
                  <div className="text-xs text-green-600">已完成</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
                  <div className="text-xs text-blue-600">进行中</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">工作负载</span>
                  <span className="text-slate-700 font-medium">
                    {stats.total > 0 ? `${Math.round((stats.done / stats.total) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
