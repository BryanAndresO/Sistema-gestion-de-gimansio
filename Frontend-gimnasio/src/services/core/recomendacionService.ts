/**
 * Servicio para conectarse al endpoint SSE de recomendaciones
 * Implementa EventSource para recibir eventos en tiempo real
 */

import { STORAGE_KEYS, API_BASE_URL } from '../../utils/constants';

export interface RecomendacionDTO {
  claseId: string;
  mensaje: string;
  prioridad?: number;
  timestamp: string;
}

export interface ConectarRecomendacionesOptions {
  onMensaje: (recomendacion: RecomendacionDTO) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Conecta al endpoint SSE de recomendaciones
 * Nota: EventSource no soporta headers personalizados, por lo que si el backend
 * requiere autenticación, debería usar cookies o query parameters.
 * @param options - Callbacks para manejar mensajes, errores, apertura y cierre
 * @returns Función para cerrar la conexión SSE
 */
export const conectarRecomendaciones = (
  options: ConectarRecomendacionesOptions
): (() => void) => {
  const { onMensaje, onError, onOpen, onClose } = options;

  // Obtener la URL base del backend (ya incluye /api)
  // API_BASE_URL viene de constants.ts y usa VITE_API_BASE_URL del .env
  const apiBaseUrl = API_BASE_URL;
  
  // Intentar obtener el token para autenticación (si el backend lo requiere como query param)
  // Nota: EventSource no soporta headers, así que si necesitas autenticación,
  // el backend debe aceptar el token como query parameter o usar cookies
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const streamUrl = token 
    ? `${apiBaseUrl}/recomendaciones/stream?token=${encodeURIComponent(token)}`
    : `${apiBaseUrl}/recomendaciones/stream`;

  // Crear EventSource para SSE
  // EventSource automáticamente incluye cookies si withCredentials está habilitado
  const eventSource = new EventSource(streamUrl);

  // Manejar mensajes recibidos
  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const recomendacion: RecomendacionDTO = JSON.parse(event.data);
      onMensaje(recomendacion);
    } catch (error) {
      console.error('Error al parsear mensaje SSE:', error);
      console.log('Datos recibidos:', event.data);
    }
  };

  // Manejar errores
  eventSource.onerror = (error: Event) => {
    console.error('Error en conexión SSE:', error);
    if (onError) {
      onError(error);
    }
    
    // Si el estado es CLOSED, intentar reconectar después de un delay
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('Conexión SSE cerrada. Intentando reconectar...');
      // El EventSource puede intentar reconectar automáticamente
      // pero si queremos control manual, cerramos y dejamos que el hook maneje la reconexión
    }
  };

  // Manejar apertura de conexión
  eventSource.onopen = () => {
    console.log('Conexión SSE abierta');
    if (onOpen) {
      onOpen();
    }
  };

  // Función para cerrar la conexión
  const close = () => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
      console.log('Conexión SSE cerrada');
      if (onClose) {
        onClose();
      }
    }
  };

  return close;
};

