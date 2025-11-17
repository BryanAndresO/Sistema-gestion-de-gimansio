import axios, { AxiosError } from 'axios';
import { STORAGE_KEYS } from '../../utils/constants';
import { toast } from 'react-toastify';

interface LoginResponse {
  token: string;
  user: {
    id?: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: string;
}

interface User {
  idUsuario: number;
  email: string;
  correo: string;
  nombre: string;
  rol: string;
}

export const authService = {
  // Login de usuario
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post('/auth/login', {
        correo: email,
        contrasena: password,
      });

      // El backend devuelve: { success: true, data: { accessToken, refreshToken, correo, nombre, rol, idUsuario } }
      const responseData = response.data?.data || response.data;

      console.log('Login response:', responseData);

      if (responseData && responseData.accessToken) {
        // Guardar el token en localStorage (como string simple, no JSON)
        localStorage.setItem(STORAGE_KEYS.TOKEN, responseData.accessToken);

        // Guardar información del usuario (como JSON)
        const user: User = {
          idUsuario: responseData.idUsuario,
          email: responseData.correo,
          correo: responseData.correo,
          nombre: responseData.nombre,
          rol: responseData.rol,
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        console.log('Token guardado:', savedToken ? 'Sí' : 'No');
        
        // El token se agregará automáticamente por el interceptor de axios
        
        return {
          token: responseData.accessToken,
          user: user,
        };
      }
      
      throw new Error('No se recibió un token válido');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Error en el inicio de sesión';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Registro de usuario
  register: async (userData: RegisterData): Promise<void> => {
    try {
      // Mapear los campos del frontend a los que espera el backend
      await axios.post('/auth/register', {
        nombre: userData.nombre,
        correo: userData.email,
        contrasena: userData.password,
        // El rol es opcional, el backend asignará 'USER' por defecto
      });
      // No mostrar toast aquí, se mostrará en el componente
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Error en el registro';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // El interceptor de axios manejará automáticamente la ausencia del token
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
  },

  // Obtener el token
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Obtener información del usuario actual
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  // Inicializar la autenticación (se debe llamar al cargar la app)
  init: (): void => {
    // El token se agregará automáticamente por el interceptor de axios
    // No es necesario configurar manualmente aquí
  },
};

// Inicializar la autenticación al cargar el módulo
authService.init();
