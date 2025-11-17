import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';

interface User {
  rol: string;
}

export const usePermissions = () => {
  const [user] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

  const isAdmin = user?.rol === USER_ROLES.ADMIN;
  const isUser = user?.rol === USER_ROLES.USER || !user?.rol;
  const isAuthenticated = !!user;

  return {
    isAdmin,
    isUser,
    isAuthenticated,
    user,
  };
};

