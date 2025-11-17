import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { adminEntrenadorService, type EntrenadorAdminDTO } from '../../services/core/adminEntrenadorService';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';

export const GestionarEntrenadores: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [entrenadores, setEntrenadores] = useState<EntrenadorAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntrenador, setEditingEntrenador] = useState<EntrenadorAdminDTO | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    certificaciones: '',
    activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const especialidadesComunes = [
    'Fuerza',
    'Cardio',
    'Yoga',
    'Pilates',
    'Crossfit',
    'Spinning',
    'Boxing',
    'Natación',
    'Danza',
    'Funcional',
  ];

  useEffect(() => {
    if (!isAdmin) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate(ROUTES.DASHBOARD);
      return;
    }
    cargarEntrenadores();
  }, [isAdmin, navigate]);

  const cargarEntrenadores = async () => {
    try {
      setLoading(true);
      const data = await adminEntrenadorService.listarTodos();
      setEntrenadores(data);
    } catch (error) {
      console.error('Error al cargar los entrenadores:', error);
      toast.error('Error al cargar los entrenadores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entrenador?: EntrenadorAdminDTO) => {
    if (entrenador) {
      setEditingEntrenador(entrenador);
      setFormData({
        nombre: entrenador.nombre,
        especialidad: entrenador.especialidad,
        certificaciones: entrenador.certificaciones || '',
        activo: entrenador.activo ?? true,
      });
    } else {
      setEditingEntrenador(null);
      setFormData({
        nombre: '',
        especialidad: '',
        certificaciones: '',
        activo: true,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntrenador(null);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

    if (!formData.especialidad.trim()) {
      newErrors.especialidad = 'La especialidad es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const entrenadorData: EntrenadorAdminDTO = {
        nombre: formData.nombre,
        especialidad: formData.especialidad,
        certificaciones: formData.certificaciones,
        activo: formData.activo,
      };

      if (editingEntrenador?.idEntrenador) {
        await adminEntrenadorService.actualizar(editingEntrenador.idEntrenador, entrenadorData);
      } else {
        await adminEntrenadorService.crear(entrenadorData);
      }

      handleCloseModal();
      cargarEntrenadores();
    } catch (error) {
      console.error('Error al guardar entrenador:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este entrenador?')) {
      return;
    }

    try {
      await adminEntrenadorService.eliminar(id);
      cargarEntrenadores();
    } catch (error) {
      console.error('Error al eliminar entrenador:', error);
    }
  };

  const handleToggleActivo = async (id: number, activo: boolean) => {
    try {
      if (activo) {
        await adminEntrenadorService.desactivar(id);
      } else {
        await adminEntrenadorService.activar(id);
      }
      cargarEntrenadores();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Gestionar Entrenadores' }]} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar Entrenadores</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nuevo Entrenador
        </Button>
      </div>

      {entrenadores.length === 0 ? (
        <EmptyState
          title="No hay entrenadores"
          message="Crea tu primer entrenador para comenzar"
          actionLabel="Crear Entrenador"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entrenadores.map((entrenador) => (
            <Card key={entrenador.idEntrenador} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{entrenador.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {entrenador.especialidad}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  entrenador.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {entrenador.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {entrenador.certificaciones && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {entrenador.certificaciones}
                </p>
              )}

              {entrenador.totalClases !== undefined && (
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Clases:</span> {entrenador.totalClases}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(entrenador)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  variant={entrenador.activo ? "danger" : "primary"}
                  size="sm"
                  onClick={() => handleToggleActivo(entrenador.idEntrenador!, !entrenador.activo)}
                  className="flex-1"
                >
                  {entrenador.activo ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleEliminar(entrenador.idEntrenador!)}
                  className="flex-1"
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear/editar entrenador */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingEntrenador ? 'Editar Entrenador' : 'Nuevo Entrenador'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleChange}
              list="especialidades-list"
              placeholder="Ej: Fuerza, Cardio, Yoga..."
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.especialidad ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <datalist id="especialidades-list">
              {especialidadesComunes.map((esp) => (
                <option key={esp} value={esp} />
              ))}
            </datalist>
            {errors.especialidad && (
              <p className="mt-1 text-sm text-red-600">{errors.especialidad}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Escribe la especialidad o selecciona de la lista de sugerencias
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificaciones
            </label>
            <textarea
              name="certificaciones"
              value={formData.certificaciones}
              onChange={handleChange}
              rows={3}
              placeholder="Ej: Certificado ISSA, Licencia en Educación Física..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Entrenador activo</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando...' : editingEntrenador ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

