import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import { useApi, useApiMutation } from '../../hooks/useApi';

interface Reserva {
  idReserva: number;
  nombreUsuario: string;
  correoUsuario: string;
  nombreClase: string;
  horarioClase: string;
  estado: string;
  fechaReserva: string;
}

export const GestionReservas: React.FC = () => {
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  // Endpoint de admin para listar todas las reservas
  const { data: reservasData, loading, refetch } = useApi<Reserva[]>('/admin/reservas');
  const { mutate: cambiarEstado, loading: cambiando } = useApiMutation();

  const reservas = reservasData || [];

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await cambiarEstado(`/admin/reservas/${id}/estado`, {
        method: 'PATCH',
        data: { estado: nuevoEstado },
      });
      refetch();
    } catch (error) {
      console.error('Error al cambiar estado de reserva:', error);
    }
  };

  const reservasFiltradas = reservas.filter(reserva => {
    const matchEstado = filtroEstado === 'TODAS' || reserva.estado === filtroEstado;
    const matchBusqueda = busqueda === '' ||
      reserva.nombreUsuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      reserva.correoUsuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      reserva.nombreClase.toLowerCase().includes(busqueda.toLowerCase());

    return matchEstado && matchBusqueda;
  });

  const columns = [
    { key: 'idReserva', header: 'ID', render: (value: number) => `#${value}` },
    { key: 'nombreUsuario', header: 'Usuario' },
    { key: 'correoUsuario', header: 'Correo' },
    { key: 'nombreClase', header: 'Clase' },
    {
      key: 'horarioClase',
      header: 'Horario',
      render: (value: string) => new Date(value).toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value: string) => {
        const colors: Record<string, string> = {
          'CONFIRMADA': 'bg-green-100 text-green-800',
          'CANCELADA': 'bg-red-100 text-red-800',
          'PENDIENTE': 'bg-yellow-100 text-yellow-800',
          'COMPLETADA': 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'fechaReserva',
      header: 'Fecha Reserva',
      render: (value: string) => new Date(value).toLocaleDateString('es-ES')
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: any, row: Reserva) => (
        <div className="flex gap-2">
          {row.estado === 'PENDIENTE' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCambiarEstado(row.idReserva, 'CONFIRMADA')}
                disabled={cambiando}
              >
                Confirmar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleCambiarEstado(row.idReserva, 'CANCELADA')}
                disabled={cambiando}
              >
                Cancelar
              </Button>
            </>
          )}
          {row.estado === 'CONFIRMADA' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCambiarEstado(row.idReserva, 'COMPLETADA')}
              disabled={cambiando}
            >
              Completar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Gestión de Reservas' }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
        <p className="text-gray-600 mt-1">Administra todas las reservas del sistema</p>
      </div>

      <Card>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por usuario, correo o clase..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="md:w-48">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="COMPLETADA">Completadas</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {busqueda || filtroEstado !== 'TODAS'
                ? 'No se encontraron reservas con los filtros aplicados'
                : 'No hay reservas en el sistema'}
            </p>
          </div>
        ) : (
          <Table data={reservasFiltradas} columns={columns} />
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Reservas</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{reservas.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {reservas.filter(r => r.estado === 'PENDIENTE').length}
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Confirmadas</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {reservas.filter(r => r.estado === 'CONFIRMADA').length}
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Completadas</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {reservas.filter(r => r.estado === 'COMPLETADA').length}
          </p>
        </Card>
      </div>
    </div>
  );
};
