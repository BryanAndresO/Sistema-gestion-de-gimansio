import axios from './axiosConfig';
import { toast } from 'react-toastify';

export interface EntrenadorAdminDTO {
  idEntrenador?: number;
  nombre: string;
  especialidad: string;
  certificaciones?: string;
  activo: boolean;
  totalClases?: number;
  clasesActivas?: number;
}

export interface CreateEntrenadorData {
  nombre: string;
  especialidad: string;
  certificaciones?: string;
  activo?: boolean;
}

export interface UpdateEntrenadorData {
  nombre?: string;
  especialidad?: string;
  certificaciones?: string;
  activo?: boolean;
}

export const adminEntrenadorService = {
  // Listar todos los entrenadores
  listarEntrenadores: async (): Promise<EntrenadorAdminDTO[]> => {
    try {
      const response = await axios.get('/admin/entrenadores');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al listar entrenadores:', error);
      throw error;
    }
  },

  // Obtener entrenador por ID
  obtenerPorId: async (id: number): Promise<EntrenadorAdminDTO> => {
    try {
      const response = await axios.get(`/admin/entrenadores/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener entrenador:', error);
      throw error;
    }
  },

  // Crear entrenador
  crearEntrenador: async (datos: CreateEntrenadorData): Promise<EntrenadorAdminDTO> => {
    try {
      const response = await axios.post('/admin/entrenadores', datos);
      toast.success('Entrenador creado correctamente');
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear el entrenador';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Actualizar entrenador
  actualizarEntrenador: async (id: number, datos: UpdateEntrenadorData): Promise<EntrenadorAdminDTO> => {
    try {
      const response = await axios.put(`/admin/entrenadores/${id}`, datos);
      toast.success('Entrenador actualizado correctamente');
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el entrenador';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Eliminar entrenador
  eliminarEntrenador: async (id: number): Promise<void> => {
    try {
      await axios.delete(`/admin/entrenadores/${id}`);
      toast.success('Entrenador eliminado correctamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el entrenador';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Buscar entrenadores por nombre
  buscarEntrenadores: async (nombre: string): Promise<EntrenadorAdminDTO[]> => {
    try {
      const response = await axios.get(`/admin/entrenadores/buscar?nombre=${encodeURIComponent(nombre)}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al buscar entrenadores:', error);
      throw error;
    }
  },

  // Buscar entrenadores por especialidad
  buscarPorEspecialidad: async (especialidad: string): Promise<EntrenadorAdminDTO[]> => {
    try {
      const response = await axios.get(`/admin/entrenadores/especialidad/${encodeURIComponent(especialidad)}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al buscar entrenadores por especialidad:', error);
      throw error;
    }
  },

  // Activar/desactivar entrenador
  toggleEstado: async (id: number): Promise<EntrenadorAdminDTO> => {
    try {
      const response = await axios.patch(`/admin/entrenadores/${id}/toggle-estado`);
      toast.success('Estado del entrenador actualizado');
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar el estado del entrenador';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Desactivar entrenador
  desactivar: async (id: number): Promise<void> => {
    try {
      await axios.patch(`/admin/entrenadores/${id}/desactivar`);
      toast.success('Entrenador desactivado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al desactivar el entrenador';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Activar entrenador
  activar: async (id: number): Promise<void> => {
    try {
      await axios.patch(`/admin/entrenadores/${id}/activar`);
      toast.success('Entrenador activado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al activar el entrenador';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Aliases para compatibilidad con GestionarEntrenadores.tsx
  listarTodos: async (): Promise<EntrenadorAdminDTO[]> => {
    return adminEntrenadorService.listarEntrenadores();
  },

  crear: async (datos: EntrenadorAdminDTO): Promise<EntrenadorAdminDTO> => {
    return adminEntrenadorService.crearEntrenador(datos);
  },

  actualizar: async (id: number, datos: EntrenadorAdminDTO): Promise<EntrenadorAdminDTO> => {
    return adminEntrenadorService.actualizarEntrenador(id, datos);
  },

  eliminar: async (id: number): Promise<void> => {
    return adminEntrenadorService.eliminarEntrenador(id);
  },
};
