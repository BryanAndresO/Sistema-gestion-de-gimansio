import React from 'react';
import { useRecomendaciones } from '../../hooks/useRecomendaciones';
import { Card } from '../common/Card';
import { formatRelativeTime } from '../../utils/formatters';

/**
 * Componente que muestra recomendaciones en tiempo real mediante SSE
 * Se actualiza automáticamente sin necesidad de refrescar la página
 */
export const RecomendacionesLive: React.FC = () => {
  const { recomendaciones, isConnected, error } = useRecomendaciones();

  // Función para obtener el mensaje según el tipo de evento
  const getMensajePorTipo = (tipo: string): string => {
    switch (tipo) {
      case 'CUPO_DISPONIBLE':
        return '¡Cupo disponible!';
      case 'CLASE_LLENA':
        return 'Clase llena';
      case 'CAMBIO_HORARIO':
        return 'Cambio de horario';
      default:
        return 'Nueva recomendación';
    }
  };

  // Función para obtener el color según el tipo de evento
  const getColorPorTipo = (tipo: string): string => {
    switch (tipo) {
      case 'CUPO_DISPONIBLE':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'CLASE_LLENA':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'CAMBIO_HORARIO':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Función para obtener el icono según el tipo de evento
  const getIconoPorTipo = (tipo: string): string => {
    switch (tipo) {
      case 'CUPO_DISPONIBLE':
        return '✓';
      case 'CLASE_LLENA':
        return '✕';
      case 'CAMBIO_HORARIO':
        return '↻';
      default:
        return 'ℹ';
    }
  };

  return (
    <Card title="Recomendaciones en Tiempo Real" className="mb-6">
      {/* Indicador de estado de conexión */}
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}
          title={isConnected ? 'Conectado' : 'Desconectado'}
        />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Lista de recomendaciones */}
      {recomendaciones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay recomendaciones en este momento</p>
          <p className="text-sm mt-2">
            Las recomendaciones aparecerán aquí cuando estén disponibles
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recomendaciones.map((recomendacion, index) => (
            <div
              key={`${recomendacion.claseId}-${index}`}
              className={`p-4 rounded-lg border-2 ${getColorPorPrioridad(
                recomendacion.prioridad
              )} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold">
                      {getIconoPorPrioridad(recomendacion.prioridad)}
                    </span>
                    <h4 className="font-semibold">
                      {recomendacion.mensaje}
                    </h4>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Clase ID:</span>{' '}
                      {recomendacion.claseId}
                    </p>
                    {recomendacion.timestamp && (
                      <p>
                        <span className="font-medium">Hora:</span>{' '}
                        {formatRelativeTime(recomendacion.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {recomendaciones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {recomendaciones.length} recomendación
            {recomendaciones.length !== 1 ? 'es' : ''} recibida
            {recomendaciones.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </Card>
  );
};

