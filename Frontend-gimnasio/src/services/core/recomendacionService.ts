/**
 * Servicio para conectarse al endpoint SSE de recomendaciones
 * Implementa EventSource para recibir eventos en tiempo real
 */

import { STORAGE_KEYS, API_BASE_URL } from '../../utils/constants';

export interface RecomendacionDTO {
  claseId: string;
  nombreClase?: string; // Nuevo campo para el nombre de la clase
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
 * Convierte un timestamp que puede venir como array [año, mes, día, hora, minuto, segundo]
 * o como string ISO a un string ISO estándar
 */
const convertirTimestamp = (timestamp: unknown): string => {
  if (!timestamp) {
    return new Date().toISOString();
  }

  // Si ya es un string ISO, devolverlo
  if (typeof timestamp === 'string') {
    return timestamp;
  }

  // Si es un array [año, mes, día, hora, minuto, segundo, nanosegundo]
  if (Array.isArray(timestamp) && timestamp.length >= 6) {
    const [year, month, day, hour, minute, second] = timestamp;
    // Los meses en Java LocalDateTime van de 1-12, pero Date usa 0-11
    const date = new Date(year, month - 1, day, hour, minute, second || 0);
    return date.toISOString();
  }

  // Si es un objeto con propiedades como 'year', 'monthValue', 'dayOfMonth', etc.
  // Esta es la serialización más probable para LocalDateTime en Spring Boot por defecto.
  if (typeof timestamp === 'object' && timestamp !== null &&
      'year' in timestamp && 'monthValue' in timestamp && 'dayOfMonth' in timestamp) {
    const { year, monthValue, dayOfMonth, hour = 0, minute = 0, second = 0 } = timestamp as {
      year: number; monthValue: number; dayOfMonth: number; hour?: number; minute?: number; second?: number; };
    // Se extraen los valores y se ajusta el mes.
    const date = new Date(year, monthValue - 1, dayOfMonth, hour, minute, second);
    return date.toISOString();
  }

  // Finalmente, si no se pudo convertir, retornar una fecha ISO actual
  return new Date().toISOString();};

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
  const eventSource = new EventSource(streamUrl, {
    withCredentials: true // Importante para CORS
  });

  console.log('EventSource creado con withCredentials:', true);

  // Manejar mensajes recibidos
  eventSource.onmessage = (event: MessageEvent) => {
    try {
      // El backend ahora envía RecomendacionDTO directamente
      const recomendacion: RecomendacionDTO = JSON.parse(event.data);
      
      // Normalizar el timestamp si viene en formato array
      if (recomendacion.timestamp) {
        recomendacion.timestamp = convertirTimestamp(recomendacion.timestamp);
      } else {
        recomendacion.timestamp = new Date().toISOString();
      }
      
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
