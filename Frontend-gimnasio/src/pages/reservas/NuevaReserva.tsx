import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { ClaseCard } from '../../components/clases/ClaseCard';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ReservaConfirmModal } from '../../components/reservas/ReservaConfirmModal';
import type { ClaseDTO } from '../../services/core/claseService';
import { claseService } from '../../services/core/claseService';
import { reservaService } from '../../services/core/reservaService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface User {
  idUsuario: number;
  nombre: string;
  rol: string;
}

export const NuevaReserva: React.FC = () => {
  const navigate = useNavigate();
  const [clases, setClases] = useState<ClaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseDTO | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [user] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

  const cargarClasesDisponibles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await claseService.obtenerClasesDisponibles();
      setClases(data);
    } catch (error) {
      console.error('Error al cargar las clases:', error);
      toast.error('Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClasesDisponibles();
  }, [cargarClasesDisponibles]);

  const handleReservar = (idClase: number) => {
    const clase = clases.find(c => c.idClase === idClase);
    if (clase) {
      setClaseSeleccionada(clase);
      setShowConfirmModal(true);
    }
  };

  const confirmarReserva = async () => {
    if (!claseSeleccionada || !user) return;

    try {
      setReservando(true);
      await reservaService.crearReserva(Number(user.idUsuario), claseSeleccionada.idClase);
      toast.success('Reserva creada exitosamente');
      setShowConfirmModal(false);
      setClaseSeleccionada(null);
      setTimeout(() => navigate('/reservas'), 1500);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setReservando(false);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reservas', path: '/reservas' },
          { label: 'Nueva Reserva' },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">Nueva Reserva</h1>

      {loading ? (
        <Loading fullScreen />
      ) : clases.length === 0 ? (
        <EmptyState
          title="No hay clases disponibles"
          message="No hay clases disponibles para reservar en este momento"
          actionLabel="Volver al Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Selecciona una clase para hacer tu reserva
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clases.map((clase) => (
              <ClaseCard
                key={clase.idClase}
                clase={clase}
                onReservar={handleReservar}
              />
            ))}
          </div>
        </>
      )}

      <ReservaConfirmModal
        isOpen={showConfirmModal}
        clase={claseSeleccionada}
        onConfirm={confirmarReserva}
        onCancel={() => {
          setShowConfirmModal(false);
          setClaseSeleccionada(null);
        }}
        isLoading={reservando}
      />
    </>
  );

