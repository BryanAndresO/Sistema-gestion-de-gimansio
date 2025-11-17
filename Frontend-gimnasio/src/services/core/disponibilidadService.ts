import axios from './axiosConfig';

export interface DisponibilidadDTO {
  idClase: number;
  nombreClase: string;
  horario: string;
  cupoTotal: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  disponible: boolean;
  puedeReservar: boolean;
}

export const disponibilidadService = {
  verificarDisponibilidad: async (idClase: number): Promise<DisponibilidadDTO> => {
    const response = await axios.get(`/disponibilidad/clase/${idClase}`);
    return response.data.data || response.data;
  },

  obtenerDisponibilidadClases: async (): Promise<DisponibilidadDTO[]> => {
    const response = await axios.get('/disponibilidad/clases');
    return response.data.data || response.data;
  },

  obtenerClasesConCuposDisponibles: async (): Promise<DisponibilidadDTO[]> => {
    const response = await axios.get('/disponibilidad/clases/disponibles');
    return response.data.data || response.data;
  },
};

