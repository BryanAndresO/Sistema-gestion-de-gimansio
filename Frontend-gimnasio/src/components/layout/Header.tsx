import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { authService } from '../../services/core/authService';
import { toast } from 'react-toastify';

export const Header: React.FC = () => {
  const [user] = useLocalStorage<any>(STORAGE_KEYS.USER, null);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada correctamente');
    navigate(ROUTES.LOGIN);
  };

  const getRoleBadge = (rol?: string) => {
    if (!rol) return null;
    const isAdmin = rol === USER_ROLES.ADMIN;
    return (
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        isAdmin 
          ? 'bg-purple-100 text-purple-700' 
          : 'bg-blue-100 text-blue-700'
      }`}>
        {isAdmin ? 'Admin' : 'Usuario'}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-16xl mx-auto px-4 sm:px-4 lg:px-4">
        <div className="flex justify-between items-center h-16">
       <Link to={ROUTES.HOME} className="flex items-center text-2xl font-bold text-blue-600 gap-2">
  <img src="/pesa.png" alt="Gym Icon" className="h-6 w-6" />
  CODEFIT
</Link>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={ROUTES.DASHBOARD} className="text-gray-700 hover:text-blue-600">
                  Inicio
                </Link>
                <div className="flex items-center text-sm text-gray-600">
                  <span>{user.nombre || user.email}</span>
                  {getRoleBadge(user.rol)}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="text-gray-700 hover:text-blue-600">
                  Iniciar Sesión
                </Link>
                <Link to={ROUTES.REGISTER} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

