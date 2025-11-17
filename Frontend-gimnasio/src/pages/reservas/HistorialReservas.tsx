import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { ReservaTimeline } from '../../components/reservas/ReservaTimeline';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import type { ReservaDTO } from '../../services/core/reservaService';
import { reservaService } from '../../services/core/reservaService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';

interface User {
  idUsuario: number;
}

export const HistorialReservas: React.FC = () => {
  const [reservas, setReservas] = useState<ReservaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

  const cargarHistorial = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reservaService.obtenerHistorial(Number(user?.idUsuario));
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar el historial:', error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.idUsuario) {
      cargarHistorial();
    }
  }, [user, cargarHistorial]);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reservas', path: '/reservas' },
          { label: 'Historial' },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">Historial de Reservas</h1>

      {loading ? (
        <Loading fullScreen />
      ) : reservas.length === 0 ? (
        <EmptyState
          title="No hay historial"
          message="No tienes reservas canceladas o completadas"
        />
      ) : (
        <ReservaTimeline reservas={reservas} />
      )}
    </>
  );
};

