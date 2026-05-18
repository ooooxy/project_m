
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  feishuUserId: string;
  isAuthenticated: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'uiux' | 'frontend' | 'backend' | 'test';
  avatar: string;
  color: string;
}

export type StoryStage =
  | 'requirements'
  | 'design'
  | 'development'
  | 'integration'
  | 'testing'
  | 'acceptance'
  | 'release';

export interface UserStory {
  id: string;
  title: string;
  kind?: 'story' | 'defect';
  priority: 'low' | 'medium' | 'high';
  stage?: StoryStage;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  userStoryId?: string;
  creatorId: string;
  assigneeId?: string;
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
  type: 'design' | 'dev' | 'test';
  startDate: string;
  endDate: string;
  dependsOn: string[];
}

export type ViewType = 'kanban' | 'stories' | 'gantt' | 'team';

export interface AppState {
  user: User | null;
  teamMembers: TeamMember[];
  userStories: UserStory[];
  tasks: Task[];
  activeView: ViewType;
}
