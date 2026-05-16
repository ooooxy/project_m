
import React, { useState } from 'react';
import { LogIn, LogOut, User, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { mockLogin, getFeishuAuthUrl, isFeishuConfigured, isMockLoginEnabled } from '../utils/feishuAuth';

export const AuthButton: React.FC = () => {
  const { user, isAuthenticated, logout, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (isMockLoginEnabled()) {
        const mockUser = mockLogin();
        login(mockUser);
      } else if (await isFeishuConfigured()) {
        const authUrl = await getFeishuAuthUrl();
        window.location.href = authUrl;
      } else {
        const mockUser = mockLogin();
        login(mockUser);
      }
    } catch {
      const mockUser = mockLogin();
      login(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader size={18} className="animate-spin" /> : <LogIn size={18} />}
        <span>{loading ? '登录中...' : '登录'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        {!user?.avatar && (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
            <User size={18} />
          </div>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut size={18} />
        <span className="hidden md:inline">登出</span>
      </button>
    </div>
  );
};
