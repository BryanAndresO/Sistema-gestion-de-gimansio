import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MainLayout } from '../../components/layout/MainLayout';
import { authService } from '../../services/core/authService';
import { toast } from 'react-toastify';

interface FieldErrors {
  correo?: string;
  contrasena?: string;
}

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    if (error) {
      setError('');
    }
  };

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
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
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({
        ...prev,
        [name === 'email' ? 'correo' : 'contrasena']: error,
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
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError) errors.correo = emailError;
    if (passwordError) errors.contrasena = passwordError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // Llamar al servicio de autenticación
      await authService.login(formData.email, formData.password);

      // Mostrar mensaje de éxito
      toast.success('¡Bienvenido de nuevo!');

      // Redirigir al dashboard
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      let errorMessage = 'No se pudo iniciar sesión. Intenta de nuevo.';

      if (err.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (err.response.status === 401) {
          errorMessage = 'Correo o contraseña incorrectos';
        } else if (err.response.status === 400) {
          // Manejar errores de validación del backend
          if (err.response.data?.errors) {
            setFieldErrors(err.response.data.errors);
            errorMessage = 'Por favor, corrige los errores en el formulario';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.response.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
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
      console.error('Error en el inicio de sesión:', err);
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
              Iniciar sesión
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              O{' '}
              <Link to={ROUTES.REGISTER} className="font-medium text-blue-600 hover:text-blue-500">
                regístrate si no tienes una cuenta
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
                  autoComplete="current-password"
                  required
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.contrasena}
                  helperText={!fieldErrors.contrasena ? "Ingresa tu contraseña" : undefined}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </a>
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
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
