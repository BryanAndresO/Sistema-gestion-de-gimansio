// Constantes de la aplicación

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Claves para el almacenamiento local
export const STORAGE_KEYS = {
  TOKEN: 'gimnasio_token',
  REFRESH_TOKEN: 'gimnasio_refresh_token',
  USER: 'gimnasio_user',
  THEME: 'gimnasio_theme',
} as const;

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  CLASES: '/clases',
  CLASES_DETALLE: '/clases/:id',
  HORARIO_SEMANAL: '/clases/horario',
  RESERVAS: '/reservas',
  NUEVA_RESERVA: '/reservas/nueva',
  NUEVA_RESERVA_ADMIN: '/reservas/nueva-admin',
  HISTORIAL_RESERVAS: '/reservas/historial',
<<<<<<< HEAD
  ADMIN_CREAR_USUARIO: '/admin/crear-usuario',
  ADMIN_GESTIONAR_CLASES: '/admin/clases',
  ADMIN_GESTIONAR_ENTRENADORES: '/admin/entrenadores',
=======
  // Rutas de Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_CLASES: '/admin/clases',
  ADMIN_ENTRENADORES: '/admin/entrenadores',
  ADMIN_RESERVAS: '/admin/reservas',
  ADMIN_REPORTES: '/admin/reportes',
  ADMIN_CONFIGURACION: '/admin/configuracion',
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const RESERVA_STATUS = {
  CONFIRMADA: 'CONFIRMADA',
  CANCELADA: 'CANCELADA',
  COMPLETADA: 'COMPLETADA',
} as const;


export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50],
} as const;

export const DATE_FORMATS = {
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm:ss',
  DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
  DISPLAY_DATE: 'dd/MM/yyyy',
  DISPLAY_DATETIME: 'dd/MM/yyyy HH:mm',
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 120,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 120,
} as const;

