import { useState, useEffect, useRef } from 'react';
import { conectarRecomendaciones, type RecomendacionDTO } from '../services/core/recomendacionService';

/**
 * Hook para manejar recomendaciones en tiempo real mediante SSE
 * Evita duplicados por claseId y mantiene el estado de las recomendaciones
 */
export const useRecomendaciones = () => {
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Key to force re-creation of the SSE connection when needed
  const [connectKey, setConnectKey] = useState(0);
  const closeConnectionRef = useRef<(() => void) | null>(null);
  const clasesIdsRef = useRef<Set<string>>(new Set());
  // Heartbeat and reconnection helpers
  const lastMessageRef = useRef<number>(Date.now());
  const reconnectionAttemptsRef = useRef<number>(0);
  const reconnectionTimerRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const isManualDisconnectRef = useRef(false);

  useEffect(() => {
    // Helpers para reconexión
    const clearReconnectTimer = () => {
      if (reconnectionTimerRef.current !== null) {
        clearTimeout(reconnectionTimerRef.current);
        reconnectionTimerRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (isManualDisconnectRef.current) return; // no reconectar si fue desconexión manual
      reconnectionAttemptsRef.current += 1;
      const attempts = reconnectionAttemptsRef.current;
      // Exponencial: 3s, 6s, 12s, 24s... cap 60s
      const delay = Math.min(60000, 3000 * Math.pow(2, attempts - 1));
      console.warn('SSE: programando reintento en', delay, 'ms (intento', attempts, ')');
      clearReconnectTimer();
      reconnectionTimerRef.current = window.setTimeout(() => {
        setConnectKey((k) => k + 1);
      }, delay);
    };

    const isAuthError = (e: any) => {
      const status = e?.status || e?.target?.status || e?.currentTarget?.status;
      return status === 401 || status === 403;
    };

    // Función para manejar cada mensaje recibido
    const handleMensaje = (recomendacion: RecomendacionDTO) => {
      // actualizar heartbeat
      lastMessageRef.current = Date.now();
      // reiniciar contador de intentos
      reconnectionAttemptsRef.current = 0;

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
        if (existe) {
          return prev;
        }
        return [...prev, recomendacion];
      });
    };

    // Función para manejar errores
    const handleError = (errorEvent: Event | any) => {
      console.error('Error en SSE:', errorEvent);

      if (isAuthError(errorEvent)) {
        setError('Autenticación expirada. Por favor, vuelva a iniciar sesión.');
        setIsConnected(false);
        // No intentamos reconectar automáticamente en caso de error de autenticación
        return;
      }

      setError('Error de conexión con el servidor de recomendaciones');
      setIsConnected(false);

      // Intentar reconectar con backoff
      scheduleReconnect();
    };

    // Función para manejar apertura de conexión
    const handleOpen = () => {
      console.log('Conexión SSE establecida');
      setIsConnected(true);
      setError(null);
      reconnectionAttemptsRef.current = 0;
      clearReconnectTimer();
      lastMessageRef.current = Date.now();

      // Empezar checker de heartbeat (si no existe)
      if (heartbeatIntervalRef.current === null) {
        heartbeatIntervalRef.current = window.setInterval(() => {
          if (Date.now() - lastMessageRef.current > 45000) {
            console.warn('No se recibió heartbeat en 45s — forzando reconexión');
            // Forzamos reconexión
            if (closeConnectionRef.current) {
              try {
                closeConnectionRef.current();
              } catch (e) {
                console.warn('Error cerrando conexión antes de reconectar', e);
              }
              closeConnectionRef.current = null;
            }
            setConnectKey((k) => k + 1);
          }
        }, 10000);
      }
    };

    // Función para manejar cierre de conexión
    const handleClose = () => {
      console.log('Conexión SSE cerrada');
      setIsConnected(false);
      if (!isManualDisconnectRef.current) {
        // programar reconexión si no fue por cierre manual
        scheduleReconnect();
      }
    };

    // Conectar al SSE
    isManualDisconnectRef.current = false;
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
      const currentClasesIdsRef = clasesIdsRef.current;
      const cleanupClasesIds = () => currentClasesIdsRef.clear();

      // Marcar como desconexión manual para evitar reintentos automáticos durante desmontaje
      isManualDisconnectRef.current = true;

      if (closeConnectionRef.current) {
        try {
          closeConnectionRef.current();
        } catch (e) {
          console.warn('Error cerrando SSE en cleanup', e);
        }
        closeConnectionRef.current = null;
      }

      cleanupClasesIds();

      // limpiar timers
      if (heartbeatIntervalRef.current !== null) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (reconnectionTimerRef.current !== null) {
        clearTimeout(reconnectionTimerRef.current);
        reconnectionTimerRef.current = null;
      }
    };
  }, [connectKey]); // re-ejecutar cuando connectKey cambie (forzar reconexión)

  // Función para limpiar recomendaciones manualmente
  const limpiarRecomendaciones = () => {
    setRecomendaciones([]);
    clasesIdsRef.current.clear();
  };

  // Función para reconectar manualmente
  const reconectar = () => {
    // Usuario pidió reconectar → no es una desconexión manual permanente
    isManualDisconnectRef.current = false;

    if (closeConnectionRef.current) {
      try {
        closeConnectionRef.current();
      } catch (e) {
        console.warn('Error cerrando conexión antes de reconectar', e);
      }
      closeConnectionRef.current = null;
    }

    setError(null);
    reconnectionAttemptsRef.current = 0;
    // Forzamos recrear la conexión
    setConnectKey((k) => k + 1);
  };

  return {
    recomendaciones,
    isConnected,
    error,
    limpiarRecomendaciones,
    reconectar,
  };
};

