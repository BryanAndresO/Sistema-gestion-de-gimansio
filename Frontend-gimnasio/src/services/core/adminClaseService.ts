import axios from './axiosConfig';
import { toast } from 'react-toastify';

export interface ClaseAdminDTO {
  idClase?: number;
  nombre: string;
  descripcion?: string;
  horario: string;
  cupo: number;
  cuposDisponibles?: number;
  duracionMinutos: number;
  activo: boolean;
  idEntrenador: number;
  nombreEntrenador?: string;
  especialidadEntrenador?: string;
}

export const adminClaseService = {
  // Listar todas las clases
  listarTodas: async (): Promise<ClaseAdminDTO[]> => {
    try {
      const response = await axios.get('/admin/clases');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al listar clases:', error);
      throw error;
    }
  },

  // Listar clases activas
  listarActivas: async (): Promise<ClaseAdminDTO[]> => {
    try {
      const response = await axios.get('/admin/clases/activas');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al listar clases activas:', error);
      throw error;
    }
  },

  // Obtener clase por ID
  obtenerPorId: async (id: number): Promise<ClaseAdminDTO> => {
    try {
      const response = await axios.get(`/admin/clases/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener clase:', error);
      throw error;
    }
  },

  // Crear nueva clase
  crear: async (clase: ClaseAdminDTO): Promise<ClaseAdminDTO> => {
    try {
      const response = await axios.post('/admin/clases', clase);
      toast.success('Clase creada exitosamente');
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la clase';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Actualizar clase
  actualizar: async (id: number, clase: ClaseAdminDTO): Promise<ClaseAdminDTO> => {
    try {
      const response = await axios.put(`/admin/clases/${id}`, clase);
      toast.success('Clase actualizada exitosamente');
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar la clase';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Eliminar clase
  eliminar: async (id: number): Promise<void> => {
    try {
      await axios.delete(`/admin/clases/${id}`);
      toast.success('Clase eliminada exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar la clase';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Desactivar clase
  desactivar: async (id: number): Promise<void> => {
    try {
      await axios.patch(`/admin/clases/${id}/desactivar`);
      toast.success('Clase desactivada exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al desactivar la clase';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Activar clase
  activar: async (id: number): Promise<void> => {
    try {
      await axios.patch(`/admin/clases/${id}/activar`);
      toast.success('Clase activada exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al activar la clase';
      toast.error(errorMessage);
      throw error;
    }
  },
};
