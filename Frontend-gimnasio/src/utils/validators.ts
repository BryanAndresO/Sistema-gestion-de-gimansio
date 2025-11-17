// Validadores para formularios

export const validators = {
  /**
   * Valida si un email tiene formato válido
   */
  email: (value: string): boolean => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
    return emailRegex.test(value);
  },

  /**
   * Valida si una cadena no está vacía
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Valida si una cadena tiene longitud mínima
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Valida si una cadena tiene longitud máxima
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Valida si una cadena tiene longitud entre min y max
   */
  lengthBetween: (value: string, min: number, max: number): boolean => {
    return value.length >= min && value.length <= max;
  },

  /**
   * Valida si una contraseña cumple con los requisitos
   */
  password: (value: string): boolean => {
    return value.length >= 6 && value.length <= 50;
  },

  /**
   * Valida si una contraseña es fuerte (mayúscula, minúscula, número)
   */
  strongPassword: (value: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    return value.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
  },

  /**
   * Valida si dos contraseñas coinciden
   */
  passwordsMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },

  /**
   * Valida si contiene solo letras y espacios
   */
  onlyLetters: (value: string): boolean => {
    const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return lettersRegex.test(value);
  },

  /**
   * Valida si contiene solo números
   */
  onlyNumbers: (value: string): boolean => {
    const numbersRegex = /^\d+$/;
    return numbersRegex.test(value);
  },

  /**
   * Valida si es un número válido
   */
  isNumber: (value: string | number): boolean => {
    return !isNaN(Number(value));
  },

  /**
   * Valida si es un número positivo
   */
  isPositiveNumber: (value: string | number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },
};

/**
 * Función helper para validar un campo con múltiples validadores
 */
export const validateField = (
  value: string,
  rules: Array<(val: string) => boolean | { validator: (val: string, ...args: unknown[]) => boolean; args?: unknown[] }>
): string | null => {
  for (const rule of rules) {
    if (typeof rule === 'function') {
      if (!rule(value)) {
        return 'Campo inválido';
      }
    } else {
      const { validator, args = [] } = rule;
      if (!validator(value, ...args)) {
        return 'Campo inválido';
      }
    }
  }
  return null;
};

