import React, { useState, useEffect } from 'react';
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
import { Toast } from '../../components/common/Toast';
import type { ToastType } from '../../components/common/Toast';

export const CatalogoClases: React.FC = () => {
  const [clases, setClases] = useState<ClaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseDTO | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [reservasUsuario, setReservasUsuario] = useState<number[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });
  const [user] = useLocalStorage<any>(STORAGE_KEYS.USER, null);

  useEffect(() => {
    cargarClases();
    if (user?.idUsuario) {
      cargarReservasUsuario();
    }
  }, [user]);

  const cargarClases = async () => {
    try {
      setLoading(true);
      const data = await claseService.obtenerClasesDisponibles();
      setClases(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarToast('Error al cargar las clases', 'error');
      setClases([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarReservasUsuario = async () => {
    try {
      if (!user?.idUsuario) return;
      const reservas = await reservaService.obtenerReservasConfirmadas(user.idUsuario);
      // Extraer los IDs de las clases que ya tienen reserva
      const idsClasesReservadas = reservas.map(reserva => reserva.idClase);
      setReservasUsuario(idsClasesReservadas);
    } catch (error) {
      console.error('Error al cargar reservas del usuario:', error);
      setReservasUsuario([]);
    }
  };

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
      mostrarToast('Error al filtrar las clases', 'error');
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
      mostrarToast('Reserva confirmada exitosamente', 'success');
      setShowConfirmModal(false);
      setClaseSeleccionada(null);
      cargarClases(); // Recargar para actualizar cupos
      cargarReservasUsuario(); // Recargar reservas del usuario
    } catch (error: any) {
      mostrarToast(error.response?.data?.message || 'Error al crear la reserva', 'error');
    } finally {
      setReservando(false);
    }
  };

  const mostrarToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), 3000);
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

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </>
  );
};

