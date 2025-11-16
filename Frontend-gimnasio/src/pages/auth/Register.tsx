import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, VALIDATION } from '../../utils/constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MainLayout } from '../../components/layout/MainLayout';
import { authService } from '../../services/core/authService';
import { toast } from 'react-toastify';

interface FieldErrors {
  nombre?: string;
  correo?: string;
  contrasena?: string;
  confirmPassword?: string;
}

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    const fieldName = name === 'email' ? 'correo' : name === 'password' ? 'contrasena' : name;
    if (fieldErrors[fieldName as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
    // Si se cambia la contraseña, validar también la confirmación
    if (name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: 'Las contraseñas no coinciden',
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: undefined,
        }));
      }
    }
    // Si se cambia la confirmación, validar que coincida
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: 'Las contraseñas no coinciden',
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: undefined,
        }));
      }
    }
    if (error) {
      setError('');
    }
  };

  const validateField = (name: string, value: string, allData?: typeof formData): string | null => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          return 'El nombre es obligatorio';
        }
        if (value.trim().length < VALIDATION.MIN_NAME_LENGTH) {
          return `El nombre debe tener al menos ${VALIDATION.MIN_NAME_LENGTH} caracteres`;
        }
        if (value.length > VALIDATION.MAX_NAME_LENGTH) {
          return `El nombre no puede tener más de ${VALIDATION.MAX_NAME_LENGTH} caracteres`;
        }
        return null;
      case 'email':
        if (!value.trim()) {
          return 'El correo electrónico es obligatorio';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'El correo debe tener un formato válido (ejemplo: usuario@dominio.com)';
        }
        return null;
      case 'password':
        if (!value) {
          return 'La contraseña es obligatoria';
        }
        if (value.length < VALIDATION.MIN_PASSWORD_LENGTH) {
          return `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`;
        }
        if (value.length > VALIDATION.MAX_PASSWORD_LENGTH) {
          return `La contraseña no puede tener más de ${VALIDATION.MAX_PASSWORD_LENGTH} caracteres`;
        }
        return null;
      case 'confirmPassword':
        if (!value) {
          return 'Debes confirmar tu contraseña';
        }
        if (allData && value !== allData.password) {
          return 'Las contraseñas no coinciden';
        }
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name === 'email' ? 'correo' : name === 'password' ? 'contrasena' : name;
    const error = validateField(name, value, formData);
    if (error) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Validación de todos los campos
    const errors: FieldErrors = {};
    const nombreError = validateField('nombre', formData.nombre);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword, formData);

    if (nombreError) errors.nombre = nombreError;
    if (emailError) errors.correo = emailError;
    if (passwordError) errors.contrasena = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
<<<<<<< HEAD
      // Llamar al servicio de autenticación para registrar al usuario
      await authService.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
      });
      
      // Mostrar mensaje de éxito
      toast.success('¡Cuenta creada con éxito! Por favor inicia sesión.');
      
      // Redirigir a la página de inicio de sesión
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      let errorMessage = 'No se pudo completar el registro. Intenta de nuevo.';
      
      if (err.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (err.response.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (err.response.status === 400) {
          // Manejar errores de validación del backend
          if (err.response.data?.errors) {
            setFieldErrors(err.response.data.errors);
            errorMessage = 'Datos inválidos. Por favor, verifica la información ingresada.';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = 'Datos inválidos. Por favor, verifica la información ingresada.';
          }
        } else if (err.response.status === 409) {
          errorMessage = 'Este correo electrónico ya está registrado. ¿Olvidaste tu contraseña?';
        } else if (err.response.status >= 500) {
          errorMessage = 'Error en el servidor. Por favor, inténtalo más tarde.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        errorMessage = 'No se recibió respuesta del servidor. Verifica tu conexión.';
      }
      
      setError(errorMessage);
=======
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.email,
          contrasena: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }
      
      // Redirigir al dashboard después del registro exitoso
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el usuario. Por favor, inténtalo de nuevo.');
>>>>>>> e39eae1eec38d0310bcdb8123965bf6706f0af2b
      console.error('Error en el registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Crear una cuenta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              O{' '}
              <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500">
                inicia sesión si ya tienes una cuenta
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.nombre}
                  helperText={!fieldErrors.nombre ? `Ingresa tu nombre completo (entre ${VALIDATION.MIN_NAME_LENGTH} y ${VALIDATION.MAX_NAME_LENGTH} caracteres)` : undefined}
                />
              </div>
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.correo}
                  helperText={!fieldErrors.correo ? "Ingresa tu correo electrónico (ejemplo: usuario@dominio.com)" : undefined}
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.contrasena}
                  helperText={!fieldErrors.contrasena ? `Mínimo ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres` : undefined}
                />
              </div>
              <div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.confirmPassword}
                  helperText={!fieldErrors.confirmPassword ? "Repite tu contraseña para confirmar" : undefined}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};