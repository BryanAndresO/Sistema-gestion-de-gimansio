import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export interface UsuarioDTO {
  idUsuario?: number;
  nombre: string;
  correo: string;
  telefono?: string; // Campo opcional, puede no existir en el backend
  rol?: string;
  activo?: boolean;
}

export interface UpdateProfileData {
  nombre?: string;
  correo?: string;
  telefono?: string; // Campo opcional
}

export interface UpdateSettingsData {
  notificacionesEmail?: boolean;
  recordatoriosClases?: boolean;
}

export const usuarioService = {
  // Obtener usuario por correo (usuario actual)
  obtenerPorCorreo: async (correo: string): Promise<UsuarioDTO> => {
    try {
      const response = await axios.get(`/admin/usuarios/correo/${correo}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  obtenerPorId: async (id: number): Promise<UsuarioDTO> => {
    try {
      const response = await axios.get(`/admin/usuarios/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  // Actualizar perfil del usuario
  actualizarPerfil: async (id: number, datos: UpdateProfileData): Promise<UsuarioDTO> => {
    try {
      // El backend espera un objeto Usuario completo, pero solo actualizamos los campos permitidos
      const updateData = {
        nombre: datos.nombre,
        correo: datos.correo,
        // telefono no existe en el modelo Usuario del backend, se omite
      };
      const response = await axios.put(`/admin/usuarios/${id}`, updateData);
      toast.success('Perfil actualizado correctamente');
      return response.data.data || response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Error al actualizar el perfil';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Actualizar configuración (por ahora solo guardamos en localStorage)
  actualizarConfiguracion: async (configuracion: UpdateSettingsData): Promise<void> => {
    try {
      // Por ahora guardamos en localStorage hasta que tengamos un endpoint en el backend
      localStorage.setItem('user_settings', JSON.stringify(configuracion));
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      toast.error('Error al guardar la configuración');
      throw error;
    }
  },

  // Obtener configuración guardada
  obtenerConfiguracion: (): UpdateSettingsData => {
    try {
      const config = localStorage.getItem('user_settings');
      return config ? JSON.parse(config) : {
        notificacionesEmail: true,
        recordatoriosClases: true,
      };
    } catch (error) {
      console.error('Error al obtener la configuración:', error);
      return {
        notificacionesEmail: true,
        recordatoriosClases: true,
      };
    }
  },

  // Listar todos los usuarios (solo para admins)
  listarUsuarios: async (): Promise<UsuarioDTO[]> => {
    try {
      const response = await axios.get('/admin/usuarios');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw error;
    }
  },

  // Buscar usuarios por nombre
  buscarUsuarios: async (nombre: string): Promise<UsuarioDTO[]> => {
    try {
      const response = await axios.get(`/admin/usuarios/buscar?nombre=${encodeURIComponent(nombre)}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  },
};

