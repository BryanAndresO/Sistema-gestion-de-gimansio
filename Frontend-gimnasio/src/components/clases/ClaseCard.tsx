import React from 'react';
import { Link } from 'react-router-dom';
import type { ClaseDTO } from '../../services/core/claseService';
import { formatDateTime } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface ClaseCardProps {
  clase: ClaseDTO;
  onReservar?: (id: number) => void;
  disabled?: boolean;
  yaReservado?: boolean;
}

export const ClaseCard: React.FC<ClaseCardProps> = ({ clase, onReservar, disabled = false, yaReservado = false }) => {
  const cuposDisponibles = clase.cuposDisponibles || 0;
  const estaDisponible = cuposDisponibles > 0;

  // Verificar si la fecha ya pasó
  const fechaClase = new Date(clase.horario);
  const ahora = new Date();
  const esFechaPasada = fechaClase < ahora;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold mb-2">{clase.nombre}</h3>
          {clase.descripcion && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{clase.descripcion}</p>
          )}
          
          <div className="space-y-1 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">Horario:</span>
              <span className="ml-2">{formatDateTime(clase.horario)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">Entrenador:</span>
              <span className="ml-2">{clase.nombreEntrenador}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">Duración:</span>
              <span className="ml-2">{clase.duracionMinutos} minutos</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              estaDisponible 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {cuposDisponibles} cupos disponibles
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Link to={`/clases/${clase.idClase}`} className="flex-1">
            <Button variant="outline" fullWidth size="sm">
              Ver Detalles
            </Button>
          </Link>

          {/* Mostrar diferentes estados del botón */}
          {yaReservado ? (
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              disabled
            >
              ✓ Ya Reservado
            </Button>
          ) : esFechaPasada ? (
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              disabled
            >
              Fecha Pasada
            </Button>
          ) : !estaDisponible ? (
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              disabled
            >
              Sin Cupos
            </Button>
          ) : onReservar ? (
            <Button
              variant="primary"
              fullWidth
              size="sm"
              onClick={() => onReservar(clase.idClase)}
              disabled={disabled}
            >
              Reservar
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

