import { useState, useEffect, useRef } from 'react';
import { conectarRecomendaciones, type RecomendacionDTO, esHeartbeat } from '../services/core/recomendacionService';

/**
 * Hook para manejar recomendaciones en tiempo real mediante SSE
 * Evita duplicados por claseId y mantiene el estado de las recomendaciones
 */
export const useRecomendaciones = () => {
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeConnectionRef = useRef<(() => void) | null>(null);
  const clasesIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Función para manejar cada mensaje recibido
    const handleMensaje = (recomendacion: RecomendacionDTO) => {
      // Ignorar heartbeats
      if (esHeartbeat(recomendacion)) {
        console.log('Heartbeat ignorado en hook:', recomendacion.timestamp);
        return;
      }

      // Evitar duplicados por claseId
      if (clasesIdsRef.current.has(recomendacion.claseId)) {
        console.log('Recomendación duplicada ignorada:', recomendacion.claseId);
        return;
      }

      // Agregar claseId al set de clases ya procesadas
      clasesIdsRef.current.add(recomendacion.claseId);

      // Agregar la recomendación al estado
      setRecomendaciones((prev) => {
        // Verificar nuevamente en el estado para evitar duplicados en actualizaciones concurrentes
        const existe = prev.some((r) => r.claseId === recomendacion.claseId);
        if (!existe) {
          console.log('Nueva recomendación agregada:', recomendacion);
          return [...prev, recomendacion];
        }
        return prev;
      });
    };

    // Función para manejar errores de conexión
    const handleError = (errorEvent: Event) => {
      console.error('Error en SSE:', errorEvent);
      setError('Error de conexión con el servidor de recomendaciones');
      setIsConnected(false);
    };

    // Función para manejar apertura de conexión
    const handleOpen = () => {
      console.log('Conexión SSE establecida');
      setIsConnected(true);
      setError(null);
    };

    // Función para manejar cierre de conexión
    const handleClose = () => {
      console.log('Conexión SSE cerrada');
      setIsConnected(false);
    };

    // Conectar al SSE
    const close = conectarRecomendaciones({
      onMensaje: handleMensaje,
      onError: handleError,
      onOpen: handleOpen,
      onClose: handleClose,
    });

    // Guardar la función de cierre
    closeConnectionRef.current = close;

    // Cleanup: cerrar conexión al desmontar el componente
    return () => {
      if (closeConnectionRef.current) {
        closeConnectionRef.current();
        closeConnectionRef.current = null;
      }
      // Limpiar referencias
      clasesIdsRef.current.clear();
    };
  }, []); // Array vacío para que solo se ejecute una vez al montar

  // Función para limpiar recomendaciones manualmente
  const limpiarRecomendaciones = () => {
    setRecomendaciones([]);
    clasesIdsRef.current.clear();
  };

  // Función para reconectar manualmente
  const reconectar = () => {
    if (closeConnectionRef.current) {
      closeConnectionRef.current();
    }
    setError(null);
    // El useEffect se ejecutará nuevamente si cambiamos alguna dependencia
    // Por ahora, simplemente cerramos y dejamos que se reconecte automáticamente
    // o el usuario puede recargar la página
  };

  return {
    recomendaciones,
    isConnected,
    error,
    limpiarRecomendaciones,
    reconectar,
  };
};

