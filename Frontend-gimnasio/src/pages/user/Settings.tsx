import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/common/Button';
import { usuarioService } from '../../services/core/usuarioService';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notificacionesEmail: true,
    recordatoriosClases: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Cargar configuración guardada
    const savedSettings = usuarioService.obtenerConfiguracion();
    setSettings(savedSettings);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usuarioService.actualizarConfiguracion(settings);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Configuración' }]} />
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      
      <Card title="Preferencias">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="notificacionesEmail"
                checked={settings.notificacionesEmail}
                onChange={handleChange}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Notificaciones por email</span>
            </label>
            <p className="text-sm text-gray-500 ml-6 mt-1">
              Recibe notificaciones importantes por correo electrónico
            </p>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="recordatoriosClases"
                checked={settings.recordatoriosClases}
                onChange={handleChange}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Recordatorios de clases</span>
            </label>
            <p className="text-sm text-gray-500 ml-6 mt-1">
              Recibe recordatorios antes de tus clases programadas
            </p>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Preferencias'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
