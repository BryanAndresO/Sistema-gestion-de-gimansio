import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ClaseDTO } from '../../services/core/claseService';
import { claseService } from '../../services/core/claseService';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { DisponibilidadBadge } from '../../components/clases/DisponibilidadBadge';
import { ReservaConfirmModal } from '../../components/reservas/ReservaConfirmModal';
import { reservaService } from '../../services/core/reservaService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface User {
  idUsuario: number;
  nombre: string;
  rol: string;
}

export const DetalleClase: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clase, setClase] = useState<ClaseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [user] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

  const cargarClase = useCallback(async () => {
    try {
      setLoading(true);
      const data = await claseService.obtenerPorId(Number(id));
      setClase(data);
    } catch (error) {
      console.error('Error al cargar la clase:', error);
      toast.error('Error al cargar la clase');
      navigate('/clases');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      cargarClase();
    }
  }, [id, cargarClase]);

  const handleReservar = () => {
    if (clase) {
      setShowConfirmModal(true);
    }
  };

  const confirmarReserva = async () => {
    if (!clase || !user) return;

    try {
      setReservando(true);
      await reservaService.crearReserva(user.idUsuario, clase.idClase);
      toast.success('Reserva confirmada exitosamente');
      setShowConfirmModal(false);
      setTimeout(() => navigate('/reservas'), 1500);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!clase) {
    return (
      <>
        <EmptyState
          title="Clase no encontrada"
          message="La clase que buscas no existe"
          actionLabel="Volver al catálogo"
          onAction={() => navigate('/clases')}
        />
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Clases', path: '/clases' },
          { label: clase.nombre },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title={clase.nombre}>
            {clase.descripcion && (
              <p className="text-gray-600 mb-4">{clase.descripcion}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-32">Horario:</span>
                <span>{formatDateTime(clase.horario)}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-32">Duración:</span>
                <span>{clase.duracionMinutos} minutos</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-32">Entrenador:</span>
                <span>{clase.nombreEntrenador}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-32">Especialidad:</span>
                <span>{clase.especialidadEntrenador}</span>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Disponibilidad">
            <div className="space-y-4">
              <DisponibilidadBadge
                cuposDisponibles={clase.cuposDisponibles}
                cupoTotal={clase.cupo}
                disponible={clase.cuposDisponibles > 0}
              />

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  {clase.cuposDisponibles > 0
                    ? `Hay ${clase.cuposDisponibles} cupos disponibles. ¡Reserva tu lugar ahora!`
                    : 'Lo sentimos, no hay cupos disponibles para esta clase.'}
                </p>

                {clase.cuposDisponibles > 0 && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleReservar}
                  >
                    Reservar Clase
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ReservaConfirmModal
        isOpen={showConfirmModal}
        clase={clase}
        onConfirm={confirmarReserva}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={reservando}
      />
    </>
  );
};

