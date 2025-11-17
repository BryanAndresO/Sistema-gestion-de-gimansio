// Funciones helper generales

/**
 * Obtiene un valor del localStorage de forma segura
 * Maneja tanto strings planos (como JWT tokens) como objetos JSON
 */
export const getFromStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    // Si el item comienza con '{' o '[', probablemente es JSON
    if (item.startsWith('{') || item.startsWith('[')) {
      try {
        return JSON.parse(item) as T;
      } catch {
        // Si falla el parsing, devolver el string tal cual
        return item as T;
      }
    }

    // Para JWT tokens y otros strings planos, devolver directamente
    return item as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Guarda un valor en el localStorage de forma segura
 */
export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

/**
 * Elimina un valor del localStorage
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
};

/**
 * Debounce function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<F>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Verifica si un objeto está vacío
 */
export const isEmpty = (obj: object | null | undefined): boolean => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Copia profunda de un objeto
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Combina clases CSS de forma condicional
 */
export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Genera un ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Verifica si estamos en desarrollo
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * Verifica si estamos en producción
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * Maneja errores de forma consistente
 */
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ha ocurrido un error inesperado';
};

/**
 * Sleep function para delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Formatea bytes a formato legible
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

