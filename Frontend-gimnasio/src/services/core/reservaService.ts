import axios from './axiosConfig';
import { toast } from 'react-toastify';

export interface ReservaDTO {
  idReserva: number;
  fechaReserva: string;
  estado: string;
  idUsuario: number;
  nombreUsuario?: string;
  correoUsuario?: string;
  idClase: number;
  nombreClase?: string;
  horarioClase?: string;
  duracionMinutos?: number;
  // Información del entrenador
  idEntrenador?: number;
  nombreEntrenador?: string;
  especialidadEntrenador?: string;
}

export const reservaService = {
  crearReserva: async (idUsuario: number, idClase: number): Promise<ReservaDTO> => {
    try {
      const response = await axios.post(
        '/reservas',
        { idUsuario, idClase }
      );
      toast.success('Reserva creada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  },

  cancelarReserva: async (idReserva: number, idUsuario: number): Promise<ReservaDTO> => {
    try {
      const response = await axios.post(
        `/reservas/${idReserva}/cancelar`,
        { idUsuario }
      );
      toast.success('Reserva cancelada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      throw error;
    }
  },

  obtenerReservasPorUsuario: async (idUsuario: number): Promise<ReservaDTO[]> => {
    try {
      const response = await axios.get(`/reservas/usuario/${idUsuario}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
      throw error;
    }
  },

  obtenerReservasConfirmadas: async (idUsuario: number): Promise<ReservaDTO[]> => {
    const response = await axios.get(`/reservas/usuario/${idUsuario}/confirmadas`);
    return response.data.data || response.data;
  },

  obtenerHistorial: async (idUsuario: number): Promise<ReservaDTO[]> => {
    const response = await axios.get(`/reservas/usuario/${idUsuario}/historial`);
    return response.data.data || response.data;
  },

  obtenerPorId: async (idReserva: number): Promise<ReservaDTO> => {
    const response = await axios.get(`/reservas/${idReserva}`);
    return response.data.data || response.data;
  },
};

