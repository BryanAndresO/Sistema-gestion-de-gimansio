import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { useApi } from '../../hooks/useApi';

interface ReporteGeneral {
  totalUsuarios: number;
  totalClases: number;
  totalReservas: number;
  reservasHoy: number;
  usuariosActivos: number;
  clasesActivas: number;
}

interface UserData {
  nombre: string;
}

export const AdminDashboard: React.FC = () => {
  const [userData] = useState<UserData | null>(() => {
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      return JSON.parse(userDataStr);
    }
    return null;
  });
  const { data: reporteData, loading, error } = useApi<ReporteGeneral>('/admin/reportes/general');

  const reporte = reporteData;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin' }, { label: 'Dashboard' }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {userData?.nombre}</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">Algunas estadísticas no están disponibles temporalmente.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-blue-600">{reporte?.totalUsuarios || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Activos: {reporte?.usuariosActivos || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clases</p>
              <p className="text-3xl font-bold text-green-600">{reporte?.totalClases || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Activas: {reporte?.clasesActivas || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reservas</p>
              <p className="text-3xl font-bold text-purple-600">{reporte?.totalReservas || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Hoy: {reporte?.reservasHoy || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Acciones Rápidas">
          <div className="space-y-3">
            <a
              href="/admin/usuarios"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Gestionar Usuarios</h3>
              <p className="text-sm text-gray-600 mt-1">Ver, editar y administrar usuarios del sistema</p>
            </a>
            <a
              href="/admin/clases"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Gestionar Clases</h3>
              <p className="text-sm text-gray-600 mt-1">Crear, modificar y programar clases</p>
            </a>
            <a
              href="/admin/entrenadores"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Gestionar Entrenadores</h3>
              <p className="text-sm text-gray-600 mt-1">Administrar el equipo de entrenadores</p>
            </a>
          </div>
        </Card>

        <Card title="Actividad Reciente">
          <p className="text-gray-600">No hay actividad reciente</p>
        </Card>
      </div>
    </div>
  );
};
