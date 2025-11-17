import React from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { useApi } from '../../hooks/useApi';

interface Reporte {
  totalUsuarios: number;
  totalClases: number;
  totalReservas: number;
  reservasHoy: number;
}

export const Reportes: React.FC = () => {
  const { data: reporteData, loading } = useApi<Reporte>('/admin/reportes/general');

  const reporte = reporteData || {};

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Reportes' }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Visualiza métricas y reportes del gimnasio</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <h3 className="text-sm font-medium text-gray-600">Total Usuarios</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{reporte.totalUsuarios || 0}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-600">Total Clases</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{reporte.totalClases || 0}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-600">Total Reservas</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{reporte.totalReservas || 0}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-600">Reservas Hoy</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{reporte.reservasHoy || 0}</p>
            </Card>
          </div>

          <Card title="Actividad Semanal">
            <p className="text-gray-600">Gráfico de actividad próximamente...</p>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Clases Más Populares">
              <p className="text-gray-600">Ranking de clases próximamente...</p>
            </Card>

            <Card title="Horarios Pico">
              <p className="text-gray-600">Análisis de horarios próximamente...</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
