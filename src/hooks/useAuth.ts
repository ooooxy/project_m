
import { useStore } from '../store/useStore';

export const useAuth = () => {
  const { user, login, logout } = useStore();
  const isAuthenticated = user?.isAuthenticated ?? false;

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};
