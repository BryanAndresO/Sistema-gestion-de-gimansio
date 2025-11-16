<<<<<<< HEAD
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, USER_ROLES } from '../../utils/constants';
=======
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES, STORAGE_KEYS } from '../../utils/constants';
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
import { classNames } from '../../utils/helpers';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { authService } from '../../services/core/authService';
import { toast } from 'react-toastify';

interface UserData {
  rol: string;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
<<<<<<< HEAD
  const navigate = useNavigate();
  const [user] = useLocalStorage<any>(STORAGE_KEYS.USER, null);

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada correctamente');
    navigate(ROUTES.LOGIN);
  };
=======
  const [userData, setUserData] = useState<UserData | null>(null);
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b

  useEffect(() => {
    const userDataStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userDataStr) {
      try {
        setUserData(JSON.parse(userDataStr));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const isAdmin = userData?.rol === 'ADMIN';

  const userMenuItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { path: ROUTES.CLASES, label: 'Clases', icon: '🏋️' },
    { path: ROUTES.RESERVAS, label: 'Mis Reservas', icon: '📅' },
    { path: ROUTES.PROFILE, label: 'Perfil', icon: '👤' },
    { path: ROUTES.SETTINGS, label: 'Configuración', icon: '⚙️' },
  ];

<<<<<<< HEAD
  const isAdmin = user?.rol === USER_ROLES.ADMIN;

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col h-full">
      {/* Información del usuario */}
      {user && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {(user.nombre || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.nombre || user.email}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menú de navegación */}
      <nav className="flex-1">
=======
  const adminMenuItems = [
    { path: ROUTES.ADMIN_DASHBOARD, label: 'Panel Admin', icon: '🎯' },
    { path: ROUTES.ADMIN_USUARIOS, label: 'Usuarios', icon: '👥' },
    { path: ROUTES.ADMIN_CLASES, label: 'Clases', icon: '🏋️' },
    { path: ROUTES.ADMIN_ENTRENADORES, label: 'Entrenadores', icon: '💪' },
    { path: ROUTES.ADMIN_RESERVAS, label: 'Reservas', icon: '📅' },
    { path: ROUTES.ADMIN_REPORTES, label: 'Reportes', icon: '📊' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside className="w-64 bg-white shadow-md p-4">
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-600 uppercase font-semibold">
          {isAdmin ? 'Administrador' : 'Usuario'}
        </p>
      </div>

      <nav>
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={classNames(
                  'flex items-center px-4 py-2 rounded-lg transition-colors',
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

<<<<<<< HEAD
      {/* Botón de cerrar sesión */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <span className="mr-2">🚪</span>
          Cerrar Sesión
        </button>
      </div>
=======
      {isAdmin && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="mr-2">👤</span>
            Vista de Usuario
          </Link>
        </div>
      )}
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
    </aside>
  );
};

