
import type { User } from '../types';

const API_BASE_URL = 'http://localhost:3001';

/**
 * 检查是否启用模拟登录模式
 * 通过环境变量 VITE_USE_MOCK_LOGIN 控制
 */
export const isMockLoginEnabled = (): boolean => {
  const env = (import.meta as unknown as { env: { VITE_USE_MOCK_LOGIN?: string } }).env || {};
  return env.VITE_USE_MOCK_LOGIN === 'true';
};

/**
 * 从后端获取飞书授权 URL
 */
export const getFeishuAuthUrl = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/feishu/url`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取授权URL失败');
    }
    
    localStorage.setItem('feishu_auth_state', data.state);
    return data.authUrl;
  } catch (error) {
    console.error('获取飞书授权URL失败:', error);
    throw error;
  }
};

/**
 * 检查后端是否配置了飞书应用
 */
export const isFeishuConfigured = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/feishu/url`);
    const data = await response.json();
    return data.success && !!data.authUrl;
  } catch {
    return false;
  }
};

/**
 * 模拟登录 - 用于演示，在没有真实飞书应用时可以使用
 */
export const mockLogin = (): User => {
  return {
    id: 'mock_user_1',
    name: '演示用户',
    email: 'demo@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    feishuUserId: 'mock_feishu_id',
    isAuthenticated: true,
  };
};

/**
 * 处理飞书回调 - 通过后端获取用户信息
 */
export const handleFeishuCallback = async (code: string, state: string): Promise<User> => {
  const savedState = localStorage.getItem('feishu_auth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }
  localStorage.removeItem('feishu_auth_state');

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/feishu/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || '登录失败');
    }

    return data.user;
  } catch (error) {
    console.error('Feishu auth error:', error);
    throw new Error('登录失败');
  }
};


