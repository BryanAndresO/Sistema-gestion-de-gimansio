import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
<<<<<<< HEAD
import { Loading } from '../../components/common/Loading';
import { usePermissions } from '../../hooks/usePermissions';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { reservaService } from '../../services/core/reservaService';
import { useState, useEffect } from 'react';
import type { ReservaDTO } from '../../services/core/reservaService';

export const Dashboard: React.FC = () => {
  const { isAdmin, user } = usePermissions();
  const [reservasActivas, setReservasActivas] = useState<ReservaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !isAdmin) {
      // Para usuarios normales, cargar sus reservas
      cargarReservasUsuario();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const cargarReservasUsuario = async () => {
    try {
      setLoading(true);
      // Necesitamos el ID del usuario, por ahora usamos el correo para buscar
      // Esto debería mejorarse cuando tengamos el ID en el token
      const reservas = await reservaService.obtenerReservasConfirmadas(0); // Necesitamos el ID real
      setReservasActivas(Array.isArray(reservas) ? reservas : []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setReservasActivas([]);
    } finally {
      setLoading(false);
    }
  };
=======
import { Button } from '../../components/common/Button';
import { STORAGE_KEYS, ROUTES } from '../../utils/constants';

interface UserData {
  correo: string;
  nombre: string;
  rol: string;
}

export const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
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

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
<<<<<<< HEAD
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {isAdmin ? (
        // Vista de Administrador
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">-</div>
                <div className="text-gray-600">Total Reservas</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">-</div>
                <div className="text-gray-600">Usuarios Activos</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">-</div>
                <div className="text-gray-600">Clases Programadas</div>
              </div>
            </Card>
=======

      {userData && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Bienvenido, {userData.nombre}</h1>
          <p className="text-gray-600 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {userData.rol}
            </span>
            <span className="ml-2">{userData.correo}</span>
          </p>
        </div>
      )}

      {isAdmin && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Panel de Administración Disponible</h3>
              <p className="text-sm text-blue-700 mt-1">Accede al panel de administración para gestionar el sistema</p>
            </div>
            <Button onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}>
              Ir al Panel Admin
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-gray-600">Reservas Activas</div>
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
          </div>

<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card title="Acciones Rápidas">
              <div className="space-y-2">
                <Link
                  to={ROUTES.ADMIN_CREAR_USUARIO}
                  className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  Crear Usuario Admin
                </Link>
                <Link
                  to={ROUTES.NUEVA_RESERVA_ADMIN}
                  className="block px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  Reservar Clase para Usuario
                </Link>
                <Link
                  to={ROUTES.ADMIN_GESTIONAR_CLASES}
                  className="block px-4 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                >
                  Gestionar Clases
                </Link>
                <Link
                  to={ROUTES.ADMIN_GESTIONAR_ENTRENADORES}
                  className="block px-4 py-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
                >
                  Gestionar Entrenadores
                </Link>
              </div>
            </Card>
            <Card title="Actividad Reciente">
              <p className="text-gray-600">No hay actividad reciente</p>
            </Card>
          </div>
        </>
      ) : (
        // Vista de Usuario
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{reservasActivas.length}</div>
                <div className="text-gray-600">Reservas Activas</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-gray-600">Clases Completadas</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">-</div>
                <div className="text-gray-600">Próximas Clases</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card title="Mis Reservas">
              {reservasActivas.length > 0 ? (
                <div className="space-y-2">
                  {reservasActivas.slice(0, 5).map((reserva) => (
                    <div key={reserva.idReserva} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium">{reserva.nombreClase}</p>
                      <p className="text-sm text-gray-600">{reserva.horarioClase}</p>
                    </div>
                  ))}
                  <Link
                    to={ROUTES.RESERVAS}
                    className="block text-center text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Ver todas las reservas →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No tienes reservas activas</p>
                  <Link
                    to={ROUTES.CLASES}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Explorar Clases
                  </Link>
                </div>
              )}
            </Card>
            <Card title="Acciones Rápidas">
              <div className="space-y-2">
                <Link
                  to={ROUTES.CLASES}
                  className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  Ver Catálogo de Clases
                </Link>
                <Link
                  to={ROUTES.NUEVA_RESERVA}
                  className="block px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  Nueva Reserva
                </Link>
                <Link
                  to={ROUTES.HISTORIAL_RESERVAS}
                  className="block px-4 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                >
                  Ver Historial
                </Link>
              </div>
            </Card>
          </div>

          <Card title="Actividad Reciente">
            <p className="text-gray-600">No hay actividad reciente</p>
          </Card>
        </>
      )}
=======
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Acciones Rápidas">
          <div className="space-y-3">
            <button
              onClick={() => navigate(ROUTES.NUEVA_RESERVA)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Nueva Reserva</h3>
              <p className="text-sm text-gray-600 mt-1">Reserva tu próxima clase</p>
            </button>
            <button
              onClick={() => navigate(ROUTES.CLASES)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Ver Clases</h3>
              <p className="text-sm text-gray-600 mt-1">Explora nuestro catálogo de clases</p>
            </button>
            <button
              onClick={() => navigate(ROUTES.HORARIO_SEMANAL)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Horario Semanal</h3>
              <p className="text-sm text-gray-600 mt-1">Consulta los horarios disponibles</p>
            </button>
          </div>
        </Card>

        <Card title="Actividad Reciente">
          <p className="text-gray-600">No hay actividad reciente</p>
        </Card>
      </div>
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
    </div>
  );
};
