import React from 'react';
import type { StoryStage, UserStory } from '../types';

interface StoryCardProps {
  story: UserStory;
  selected: boolean;
  blockedCount: number;
  reviewCount: number;
  onSelect: (storyId: string) => void;
  onDragStart: (e: React.DragEvent, storyId: string) => void;
  onBadgeClick: (storyId: string, status: 'blocked' | 'review') => void;
}

const getPriorityLabel = (priority: UserStory['priority']) => {
  if (priority === 'high') return '高';
  if (priority === 'medium') return '中';
  return '低';
};

const getPriorityClass = (priority: UserStory['priority']) => {
  if (priority === 'high') return 'bg-red-100 text-red-700';
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-700';
  return 'bg-slate-200 text-slate-700';
};

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  selected,
  blockedCount,
  reviewCount,
  onSelect,
  onDragStart,
  onBadgeClick,
}) => {
  const stage = (story.stage ?? 'requirements') as StoryStage;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, story.id)}
      onClick={() => onSelect(story.id)}
      className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
      }`}
      data-stage={stage}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(story.priority)}`}>
          优先级 {getPriorityLabel(story.priority)}
        </span>
        <div className="flex items-center gap-2">
          {blockedCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBadgeClick(story.id, 'blocked');
              }}
              className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              阻塞 {blockedCount}
            </button>
          )}
          {reviewCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBadgeClick(story.id, 'review');
              }}
              className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
            >
              待评审 {reviewCount}
            </button>
          )}
        </div>
      </div>
      <h4 className="font-medium text-slate-900 line-clamp-2">{story.title}</h4>
    </div>
  );
};

