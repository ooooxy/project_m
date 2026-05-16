
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const getDaysBetween = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getProgress = (start: string, end: string): number => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (now < startDate) return 0;
  if (now > endDate) return 100;

  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.round((elapsed / total) * 100);
};

export const getTaskTypeColor = (type: string): string => {
  switch (type) {
    case 'design':
      return 'bg-purple-100 text-purple-700';
    case 'dev':
      return 'bg-blue-100 text-blue-700';
    case 'test':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'uiux':
      return 'UI/UX';
    case 'frontend':
      return '前端';
    case 'backend':
      return '后端';
    case 'test':
      return '测试';
    default:
      return role;
  }
};
