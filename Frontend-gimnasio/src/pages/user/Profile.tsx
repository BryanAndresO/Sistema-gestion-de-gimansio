import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { usuarioService } from '../../services/core/usuarioService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { toast } from 'react-toastify';

interface User {
  idUsuario: number;
  nombre: string;
  email: string;
  rol: string;
}

export const Profile: React.FC = () => {
  const [user, setUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const cargarPerfil = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const usuario = await usuarioService.obtenerPorCorreo(user.email);
      setUserId(usuario.idUsuario || null);
      // Cargar teléfono desde localStorage si existe
      const telefonoLocal = localStorage.getItem('user_telefono');
      setFormData({
        nombre: usuario.nombre || '',
        correo: usuario.correo || '',
        telefono: telefonoLocal || '',
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('No se pudo identificar el usuario');
      return;
    }

    setSaving(true);
    try {
      const usuarioActualizado = await usuarioService.actualizarPerfil(userId, {
        nombre: formData.nombre,
        correo: formData.correo,
        // telefono se guarda localmente ya que el backend no lo soporta
      });

      // Guardar teléfono localmente
      if (formData.telefono) {
        localStorage.setItem('user_telefono', formData.telefono);
      }

      // Actualizar el usuario en localStorage
      const updatedUser = {
        ...user,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.correo,
      };
      setUser(updatedUser as User);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Perfil' }]} />
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      
      <Card title="Información Personal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            required
            helperText="El email no se puede cambiar"
            disabled
            className="bg-gray-50"
          />
          <Input
            label="Teléfono (Opcional)"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ej: 0991234567"
            helperText="Este campo se guardará localmente (el backend no lo soporta aún)"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
