import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, VALIDATION } from '../../utils/constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MainLayout } from '../../components/layout/MainLayout';
import { authService } from '../../services/core/authService';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

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
    const { name } = e.target;
    let { value } = e.target;

    if (name === 'nombre') {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    const fieldName = name === 'email' ? 'correo' : name === 'password' ? 'contrasena' : name;
    if (fieldErrors[fieldName as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }

    if ((name === 'password' || name === 'confirmPassword') && formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }

    if (error) setError('');
  };

  const validateField = (name: string, value: string, allData?: typeof formData): string | null => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < VALIDATION.MIN_NAME_LENGTH) return `El nombre debe tener al menos ${VALIDATION.MIN_NAME_LENGTH} caracteres`;
        if (value.length > VALIDATION.MAX_NAME_LENGTH) return `El nombre no puede tener más de ${VALIDATION.MAX_NAME_LENGTH} caracteres`;
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) return 'El nombre solo puede contener letras y espacios';
        return null;

      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El correo debe tener un formato válido (ejemplo: usuario@dominio.com)';
        return null;

      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < VALIDATION.MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`;
        if (value.length > VALIDATION.MAX_PASSWORD_LENGTH) return `La contraseña no puede tener más de ${VALIDATION.MAX_PASSWORD_LENGTH} caracteres`;
        return null;

      case 'confirmPassword':
        if (!value) return 'Debes confirmar tu contraseña';
        if (allData && value !== allData.password) return 'Las contraseñas no coinciden';
        return null;

      default:
        return null;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name === 'email' ? 'correo' : name === 'password' ? 'contrasena' : name;
    const error = validateField(name, value, formData);
    if (error) setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

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
      await authService.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
      });

      toast.success('¡Cuenta creada con éxito! Por favor inicia sesión.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      const axiosError = err as AxiosError;
      let errorMessage = 'No se pudo completar el registro. Intenta de nuevo.';
      if (axiosError.response) {
        if (axiosError.response.status === 409) {
          errorMessage = 'Este correo electrónico ya está registrado. ¿Olvidaste tu contraseña?';
        }
      }
      setError(errorMessage);
      console.error('Error en el registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="flex justify-center items-center h-[575px] mx-auto md:mx-0">

       <div
      className="hidden md:block w-1/2 h-full bg-cover bg-center"
      style={{ backgroundImage: "url('/codefit.jpg')" }}
    />
        {/* Columna derecha: formulario */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-300/50 h-full">
        <div className="w-full max-w-[500px] space-y-8 p-8 bg-gray-400">

            {/* Título y subtítulo */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Crear una cuenta</h2>
              <p className="mt-2 text-sm text-gray-600">
                O{' '}
                <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500">
                  inicia sesión si ya tienes una cuenta
                </Link>
              </p>
            </div>

            {/* Mensaje de error */}
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

            {/* Formulario */}
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />

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
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />

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
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />

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
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-4 shadow-md hover:shadow-lg transition"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};
