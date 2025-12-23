import React from 'react';
import { useRecomendaciones } from '../../hooks/useRecomendaciones'; // Importa el hook personalizado para las recomendaciones.
import { Card } from '../common/Card'; // Componente genérico para tarjetas de UI.
import { formatRelativeTime } from '../../utils/formatters'; // Utilidad para formatear tiempos de forma legible.

/**
 * Componente funcional de React `RecomendacionesLive`.
 * Este componente es responsable de renderizar las recomendaciones en tiempo real
 * utilizando la funcionalidad Server-Sent Events (SSE) a través del hook `useRecomendaciones`.
 * Muestra el estado de la conexión, los errores y la lista de recomendaciones con estilos
 * y iconos basados en su prioridad.
 */
export const RecomendacionesLive: React.FC = () => {
  // Consume el hook `useRecomendaciones` para obtener las recomendaciones, el estado de la conexión y los errores.
  const { recomendaciones, isConnected, error } = useRecomendaciones();

  // Función auxiliar para determinar las clases CSS de color de fondo y texto
  // basándose en la prioridad de la recomendación. Esto permite una representación visual
  // rápida del tipo de alerta (éxito, advertencia, error, información).
  const getColorPorPrioridad = (prioridad?: number): string => {
    switch (prioridad) {
      case 1: // Prioridad alta (ej. cupo disponible) -> Verde
        return 'bg-green-50 border-green-200 text-green-800';
      case 2: // Prioridad media (ej. cambio de horario) -> Amarillo
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 3: // Prioridad baja (ej. clase llena) -> Rojo
        return 'bg-red-50 border-red-200 text-red-800';
      default: // Prioridad por defecto o no definida -> Azul
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Función auxiliar para obtener un icono representativo basado en la prioridad de la recomendación.
  // Los iconos son caracteres Unicode simples para una fácil integración.
  const getIconoPorPrioridad = (prioridad?: number): string => {
    switch (prioridad) {
      case 1: // Verde -> Checkmark
        return '✓';
      case 2: // Amarillo -> Flecha de giro
        return '↻';
      case 3: // Rojo -> Cruz
        return '✕';
      default: // Azul -> Información
        return 'ℹ';
    }
  };

  return (
    // El componente se envuelve en una Card para mantener un estilo consistente en la UI.
    <Card title="Recomendaciones en Tiempo Real" className="mb-6">
      {/* Indicador visual del estado de la conexión SSE (conectado/desconectado) */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Recomendaciones en Tiempo Real
        </h3>
        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Conectado' : 'Desconectado'} {/* Texto del estado de conexión. */}
          </span>
        </div>
      </div>

      {/* Muestra un mensaje de error si existe una falla en la conexión SSE */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Renderiza un mensaje cuando no hay recomendaciones disponibles */}
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
        // Si hay recomendaciones, las itera y renderiza cada una.
        <div className="space-y-3">
          {recomendaciones.map((recomendacion, index) => (
            <div
              // La clave única se genera a partir de claseId y el índice para asegurar unicidad y optimizar renders.
              key={`${recomendacion.claseId}-${index}`}
              // Aplica estilos dinámicos basados en la prioridad de la recomendación.
              className={`p-4 rounded-lg border-2 ${getColorPorPrioridad(
                recomendacion.prioridad
              )} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold">
                      {getIconoPorPrioridad(recomendacion.prioridad)} {/* Muestra el icono según la prioridad. */}
                    </span>
                    <h4 className="font-semibold">
                      {recomendacion.mensaje} {/* Muestra el mensaje de la recomendación. */}
                    </h4>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Clase:</span>{' '}
                      {recomendacion.nombreClase || recomendacion.claseId} {/* Muestra el nombre de la clase o su ID si el nombre no está disponible. */}
                    </p>
                    {recomendacion.timestamp && (
                      <p>
                        <span className="font-medium">Hora:</span>{' '}
                        {formatRelativeTime(recomendacion.timestamp)} {/* Formatea y muestra el tiempo relativo. */}
                      </p>
                    )}
                    {recomendacion.prioridad && (
                      <p>
                        <span className="font-medium">Prioridad:</span>{' '}
                        {recomendacion.prioridad} {/* Muestra la prioridad numérica. */}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección de información adicional al pie de la tarjeta, si hay recomendaciones. */}
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
