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

  // Función para obtener el color según la prioridad
  const getColorPorPrioridad = (prioridad?: number): string => {
    switch (prioridad) {
      case 1: // CUPO_DISPONIBLE - Alta prioridad
        return 'bg-green-50 border-green-200 text-green-800';
      case 2: // CAMBIO_HORARIO - Media prioridad
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 3: // CLASE_LLENA - Baja prioridad
        return 'bg-red-50 border-red-200 text-red-800';
      default: // Sin prioridad o prioridad 4+
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Función para obtener el icono según la prioridad
  const getIconoPorPrioridad = (prioridad?: number): string => {
    switch (prioridad) {
      case 1: // CUPO_DISPONIBLE
        return '✓';
      case 2: // CAMBIO_HORARIO
        return '↻';
      case 3: // CLASE_LLENA
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <Card title="Recomendaciones en Tiempo Real" className="mb-6">
      {/* Estado de conexión */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Lista de recomendaciones */}
      {recomendaciones.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            No hay recomendaciones en este momento
          </p>
          <p className="mt-2 text-sm text-gray-400">
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
                    {recomendacion.prioridad && (
                      <p>
                        <span className="font-medium">Prioridad:</span>{' '}
                        {recomendacion.prioridad}
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

