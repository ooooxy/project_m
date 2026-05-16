import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, User, TeamMember, UserStory, Task, ViewType } from '../types';

interface StoreActions {
  setActiveView: (view: ViewType) => void;
  login: (user: User) => void;
  logout: () => void;
  setTeamMembers: (members: TeamMember[]) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  setUserStories: (stories: UserStory[]) => void;
  addUserStory: (story: UserStory) => void;
  updateUserStory: (id: string, updates: Partial<UserStory>) => void;
  removeUserStory: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  removeTask: (id: string) => void;
}

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set) => ({
      user: null,
      teamMembers: [],
      userStories: [],
      tasks: [],
      activeView: 'kanban',

      setActiveView: (view) => set({ activeView: view }),

      login: (user) => set({ user }),

      logout: () => set({ user: null }),

      setTeamMembers: (members) => set({ teamMembers: members }),

      addTeamMember: (member) =>
        set((state) => ({
          teamMembers: [...state.teamMembers, member],
        })),

      removeTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        })),

      setUserStories: (stories) => set({ userStories: stories }),

      addUserStory: (story) =>
        set((state) => ({
          userStories: [...state.userStories, story],
        })),

      updateUserStory: (id, updates) =>
        set((state) => ({
          userStories: state.userStories.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      removeUserStory: (id) =>
        set((state) => ({
          userStories: state.userStories.filter((s) => s.id !== id),
          tasks: state.tasks.filter((t) => t.userStoryId !== id),
        })),

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      updateTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'workflow-manager-storage',
    }
  )
);