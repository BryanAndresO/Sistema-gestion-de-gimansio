import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { ClaseCard } from '../../components/clases/ClaseCard';
import { ClaseFiltros } from '../../components/clases/ClaseFiltros';
import type { FiltrosClase } from '../../components/clases/ClaseFiltros';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { claseService } from '../../services/core/claseService';
import type { ClaseDTO } from '../../services/core/claseService';
import { ReservaConfirmModal } from '../../components/reservas/ReservaConfirmModal';
import { reservaService } from '../../services/core/reservaService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { toast } from 'react-toastify';
import type { TypeOptions } from 'react-toastify';
import { AxiosError } from 'axios';

interface User {
  idUsuario: number;
  nombre: string;
  rol: string;
}

export const CatalogoClases: React.FC = () => {
  const [clases, setClases] = useState<ClaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseDTO | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [reservasUsuario, setReservasUsuario] = useState<number[]>([]);
  const [user] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

  const cargarReservasUsuario = useCallback(async () => {
    try {
      if (!user?.idUsuario) return;
      const reservas = await reservaService.obtenerReservasConfirmadas(user.idUsuario);
      const idsClasesReservadas = reservas.map(reserva => reserva.idClase);
      setReservasUsuario(idsClasesReservadas);
    } catch (error) {
      console.error('Error al cargar reservas del usuario:', error);
      setReservasUsuario([]);
    }
  }, [user]);

  const cargarClases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await claseService.obtenerClasesDisponibles();
      setClases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar las clases:', error);
      toast.error('Error al cargar las clases');
      setClases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClases();
    if (user?.idUsuario) {
      cargarReservasUsuario();
    }
  }, [user, cargarClases, cargarReservasUsuario]);

  const handleFiltrar = async (filtros: FiltrosClase) => {
    try {
      setLoading(true);
      let data: ClaseDTO[] = [];
      
      if (filtros.nombre) {
        data = await claseService.buscarPorNombre(filtros.nombre);
      } else if (filtros.fechaInicio && filtros.fechaFin) {
        data = await claseService.obtenerPorRangoFechas(filtros.fechaInicio, filtros.fechaFin);
      } else {
        data = await claseService.obtenerClasesDisponibles();
      }
      
      setClases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al filtrar las clases:', error);
      toast.error('Error al filtrar las clases');
      setClases([]);
    } finally {
      setLoading(false);
    }
  };

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
      await reservaService.crearReserva(user.idUsuario, claseSeleccionada.idClase);
      toast.success('Reserva confirmada exitosamente');
      setShowConfirmModal(false);
      setClaseSeleccionada(null);
      cargarClases(); // Recargar para actualizar cupos
      cargarReservasUsuario(); // Recargar reservas del usuario
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setReservando(false);
    }
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Catálogo de Clases' }]} />
      <h1 className="text-3xl font-bold mb-6">Catálogo de Clases</h1>

      <ClaseFiltros onFiltrar={handleFiltrar} />

      {loading ? (
        <Loading fullScreen />
      ) : clases.length === 0 ? (
        <EmptyState
          title="No hay clases disponibles"
          message="No se encontraron clases con los filtros aplicados"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((clase) => (
            <ClaseCard
              key={clase.idClase}
              clase={clase}
              onReservar={handleReservar}
              yaReservado={reservasUsuario.includes(clase.idClase)}
            />
          ))}
        </div>
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
};

