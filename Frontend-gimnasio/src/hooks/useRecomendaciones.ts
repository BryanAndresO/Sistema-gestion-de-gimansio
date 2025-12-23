import { useState, useEffect, useRef } from 'react';
import { conectarRecomendaciones, type RecomendacionDTO } from '../services/core/recomendacionService';

/**
 * Hook para manejar recomendaciones en tiempo real mediante SSE
 * Implementado con reconexión automática robusta y manejo de errores experto
 */
export const useRecomendaciones = () => {
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usandoPolling, setUsandoPolling] = useState(false);
  const closeConnectionRef = useRef<(() => void) | null>(null);
  const clasesIdsRef = useRef<Set<string>>(new Set());
  const pollingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    // Función para manejar cada mensaje recibido
    const handleMensaje = (recomendacion: RecomendacionDTO) => {
      // Evitar duplicados por claseId
      if (recomendacion.claseId === 'heartbeat') {
        console.log('Heartbeat recibido - conexión activa');
        return;
      }

      if (clasesIdsRef.current.has(recomendacion.claseId)) {
        console.log('Recomendación duplicada ignorada:', recomendacion.claseId);
        return;
      }

      // Agregar claseId al set de clases ya procesadas
      clasesIdsRef.current.add(recomendacion.claseId);

      // Agregar la recomendación al estado
      setRecomendaciones((prev) => {
        const existe = prev.some((r) => r.claseId === recomendacion.claseId);
        if (existe) {
          return prev;
        }
        return [...prev, recomendacion];
      });

      // Resetear contador de reconexiones exitosas
      reconnectAttemptsRef.current = 0;
    };

    // Función para manejar errores con reconexión exponencial
    const handleError = (errorEvent: Event) => {
      console.error('Error en SSE:', errorEvent);
      setIsConnected(false);
      
      // Implementar reconexión exponencial backoff
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current++;
      
      setError(`Error de conexión. Reintentando en ${delay/1000}s... (Intento ${reconnectAttemptsRef.current})`);
      
      // Limpiar timeout anterior
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Programar reconexión
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log(`Intentando reconexión SSE #${reconnectAttemptsRef.current}`);
        setError(null);
        conectarSSE();
      }, delay);
    };

    // Función para manejar apertura de conexión
    const handleOpen = () => {
      console.log('Conexión SSE establecida');
      setIsConnected(true);
      setError(null);
      setUsandoPolling(false);
      
      // Limpiar timeout de reconexión si existe
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    // Función para manejar cierre de conexión
    const handleClose = () => {
      console.log('Conexión SSE cerrada');
      setIsConnected(false);
      
      // No hacer polling inmediatamente, esperar al manejo de errores
    };

    // Función para conectar SSE
    const conectarSSE = () => {
      // Cerrar conexión existente
      if (closeConnectionRef.current) {
        closeConnectionRef.current();
      }
      
      const close = conectarRecomendaciones({
        onMensaje: handleMensaje,
        onError: handleError,
        onOpen: handleOpen,
        onClose: handleClose,
      });

      closeConnectionRef.current = close;
    };

    // Iniciar conexión
    conectarSSE();

    // Cleanup al desmontar
    return () => {
      if (closeConnectionRef.current) {
        closeConnectionRef.current();
        closeConnectionRef.current = null;
      }
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      clasesIdsRef.current.clear();
    };
  }, []); // Sin dependencias para evitar reconexiones infinitas

  // Función para limpiar recomendaciones manualmente
  const limpiarRecomendaciones = () => {
    setRecomendaciones([]);
    clasesIdsRef.current.clear();
  };

  // Función para reconectar manualmente
  const reconectar = () => {
    reconnectAttemptsRef.current = 0;
    setError(null);
    
    if (closeConnectionRef.current) {
      closeConnectionRef.current();
    }
    
    // Forzar reconexión inmediata
    setTimeout(() => {
      if (closeConnectionRef.current) {
        closeConnectionRef.current();
      }
    }, 100);
  };

  return {
    recomendaciones,
    isConnected,
    error,
    usandoPolling,
    limpiarRecomendaciones,
    reconectar,
  };
};

