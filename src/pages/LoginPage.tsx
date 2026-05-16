import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { handleFeishuCallback, mockLogin, isFeishuConfigured, getFeishuAuthUrl, isMockLoginEnabled } from '../utils/feishuAuth';

type LoginStatus = 'loading' | 'success' | 'error' | 'idle';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<string>('');
  const [feishuEnabled, setFeishuEnabled] = useState(false);

  useEffect(() => {
    const checkFeishuConfig = async () => {
      setFeishuEnabled(await isFeishuConfigured());
    };
    checkFeishuConfig();
  }, []);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      setStatus('loading');
      const processLogin = async () => {
        try {
          const user = await handleFeishuCallback(code, state);
          login(user);
          setStatus('success');
        } catch (err) {
          setStatus('error');
          setError(err instanceof Error ? err.message : '登录失败');
        }
      };
      processLogin();
    }
  }, [searchParams, login]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleLogin = async () => {
    setStatus('loading');
    try {
      if (isMockLoginEnabled()) {
        setTimeout(() => {
          const user = mockLogin();
          login(user);
          setStatus('success');
        }, 500);
      } else if (feishuEnabled) {
        const authUrl = await getFeishuAuthUrl();
        window.location.href = authUrl;
      } else {
        setTimeout(() => {
          const user = mockLogin();
          login(user);
          setStatus('success');
        }, 500);
      }
    } catch {
      setTimeout(() => {
        const user = mockLogin();
        login(user);
        setStatus('success');
      }, 500);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <Loader className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">正在登录...</h2>
            <p className="text-gray-500">请稍候</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">登录成功!</h2>
            <p className="text-gray-500">正在跳转到首页...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">登录失败</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => setStatus('idle')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              重新登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来</h2>
          <p className="text-gray-500 mb-8">请登录以访问系统</p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <LogIn size={20} />
            <span>{isMockLoginEnabled() ? '模拟登录' : (feishuEnabled ? '飞书登录' : '模拟登录')}</span>
          </button>
          
          {isMockLoginEnabled() && (
            <p className="text-sm text-gray-400 mt-4">
              当前处于开发模式，使用模拟登录
            </p>
          )}
          {!isMockLoginEnabled() && !feishuEnabled && (
            <p className="text-sm text-gray-400 mt-4">
              当前使用模拟登录，配置飞书应用后可使用真实登录
            </p>
          )}
        </div>
      </div>
    </div>
  );
};