import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { ReservaCard } from '../../components/reservas/ReservaCard';
import { ReservaCancelModal } from '../../components/reservas/ReservaCancelModal';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import type { ReservaDTO } from '../../services/core/reservaService';
import { reservaService } from '../../services/core/reservaService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { toast } from 'react-toastify';
import { Button } from '../../components/common/Button';
import { AxiosError } from 'axios';
import { RecomendacionesLive } from '../../components/recomendaciones/RecomendacionesLive';

interface User {
  idUsuario: number;
  nombre: string;
  rol: string;
}

export const MisReservas: React.FC = () => {
  const [reservas, setReservas] = useState<ReservaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservaACancelar, setReservaACancelar] = useState<ReservaDTO | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [user] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

  const cargarReservas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reservaService.obtenerReservasConfirmadas(Number(user?.idUsuario));
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
      toast.error('Error al cargar las reservas');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.idUsuario) {
      cargarReservas();
    }
  }, [user, cargarReservas]);

  const handleCancelar = (idReserva: number) => {
    const reserva = reservas.find(r => r.idReserva === idReserva);
    if (reserva) {
      setReservaACancelar(reserva);
      setShowCancelModal(true);
    }
  };

  const confirmarCancelacion = async () => {
    if (!reservaACancelar || !user) return;

    try {
      setCancelando(true);
      await reservaService.cancelarReserva(reservaACancelar.idReserva, Number(user.idUsuario));
      toast.success('Reserva cancelada exitosamente');
      setShowCancelModal(false);
      setReservaACancelar(null);
      cargarReservas();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setCancelando(false);
    }
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Mis Reservas' }]} />
      
      <RecomendacionesLive />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Reservas</h1>
        <Button variant="primary" onClick={() => window.location.href = '/clases'}>
          Nueva Reserva
        </Button>
      </div>

      {loading ? (
        <Loading fullScreen />
      ) : reservas.length === 0 ? (
        <EmptyState
          title="No tienes reservas"
          message="No tienes reservas confirmadas en este momento"
          actionLabel="Ver Clases Disponibles"
          onAction={() => window.location.href = '/clases'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservas.map((reserva) => (
            <ReservaCard
              key={reserva.idReserva}
              reserva={reserva}
              onCancelar={handleCancelar}
            />
          ))}
        </div>
      )}

      <ReservaCancelModal
        isOpen={showCancelModal}
        reserva={reservaACancelar}
        onConfirm={confirmarCancelacion}
        onCancel={() => {
          setShowCancelModal(false);
          setReservaACancelar(null);
        }}
        isLoading={cancelando}
      />
    </>
  );
};

