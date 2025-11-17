import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../services/core/authService';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../utils/constants';
import axios from '../../services/core/axiosConfig';

export const CrearUsuarioAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
    rol: 'ADMIN',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Si no es admin, redirigir
  React.useEffect(() => {
    if (!isAdmin) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAdmin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Crear usuario usando el endpoint de admin
      const token = authService.getToken();
      if (!token) {
        throw new Error('No estás autenticado');
      }

      await axios.post('/admin/usuarios', {
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.password,
        rol: formData.rol,
        activo: true,
      });

      toast.success(`Usuario ${formData.rol} creado exitosamente`);
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el usuario';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Crear Usuario Admin' }]} />
      <h1 className="text-3xl font-bold mb-6">Crear Usuario Administrador</h1>

      <Card title="Información del Usuario">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ADMIN">Administrador</option>
              <option value="USER">Usuario</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona el rol del usuario. Los administradores pueden gestionar clases y reservas.
            </p>
          </div>

          <Input
            label="Nombre Completo"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />

          <Input
            label="Correo Electrónico"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            error={errors.correo}
            required
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText="Mínimo 6 caracteres"
            required
          />

          <Input
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(ROUTES.DASHBOARD)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};

