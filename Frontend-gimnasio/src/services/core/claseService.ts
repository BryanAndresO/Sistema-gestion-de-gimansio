import axios from './axiosConfig';

export interface ClaseDTO {
  idClase: number;
  nombre: string;
  descripcion?: string;
  horario: string;
  cupo: number;
  cuposDisponibles: number;
  duracionMinutos: number;
  activo: boolean;
  idEntrenador: number;
  nombreEntrenador: string;
  especialidadEntrenador: string;
}

export const claseService = {
  obtenerClasesDisponibles: async (): Promise<ClaseDTO[]> => {
    const response = await axios.get('/clases');
    return response.data.data || response.data;
  },

  obtenerClasesProximas: async (): Promise<ClaseDTO[]> => {
    const response = await axios.get('/clases/proximas');
    return response.data.data || response.data;
  },

  obtenerClasesActivas: async (): Promise<ClaseDTO[]> => {
    const response = await axios.get('/clases/activas');
    return response.data.data || response.data;
  },

  obtenerPorId: async (id: number): Promise<ClaseDTO> => {
    const response = await axios.get(`/clases/${id}`);
    return response.data.data || response.data;
  },

  buscarPorNombre: async (nombre: string): Promise<ClaseDTO[]> => {
    const response = await axios.get('/clases/buscar', {
      params: { nombre },
    });
    return response.data.data || response.data;
  },

  obtenerPorEntrenador: async (idEntrenador: number): Promise<ClaseDTO[]> => {
    const response = await axios.get(`/clases/entrenador/${idEntrenador}`);
    return response.data.data || response.data;
  },

  obtenerPorRangoFechas: async (inicio: string, fin: string): Promise<ClaseDTO[]> => {
    const response = await axios.get('/clases/rango-fechas', {
      params: { inicio, fin },
    });
    return response.data.data || response.data;
  },
};

