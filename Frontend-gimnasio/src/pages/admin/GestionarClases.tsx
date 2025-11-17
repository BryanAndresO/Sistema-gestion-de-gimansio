import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { adminClaseService, type ClaseAdminDTO } from '../../services/core/adminClaseService';
import { adminEntrenadorService, type EntrenadorAdminDTO } from '../../services/core/adminEntrenadorService';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';

export const GestionarClases: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [clases, setClases] = useState<ClaseAdminDTO[]>([]);
  const [entrenadores, setEntrenadores] = useState<EntrenadorAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClase, setEditingClase] = useState<ClaseAdminDTO | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    horario: '',
    cupo: 10,
    duracionMinutos: 60,
    idEntrenador: 0,
    activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate(ROUTES.DASHBOARD);
      return;
    }
    cargarDatos();
  }, [isAdmin, navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [clasesData, entrenadoresData] = await Promise.all([
        adminClaseService.listarTodas(),
        adminEntrenadorService.listarActivos(),
      ]);
      setClases(clasesData);
      setEntrenadores(entrenadoresData);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (clase?: ClaseAdminDTO) => {
    if (clase) {
      setEditingClase(clase);
      // Convertir LocalDateTime a formato para input datetime-local
      const horarioDate = new Date(clase.horario);
      const horarioISO = horarioDate.toISOString().slice(0, 16);
      setFormData({
        nombre: clase.nombre,
        descripcion: clase.descripcion || '',
        horario: horarioISO,
        cupo: clase.cupo,
        duracionMinutos: clase.duracionMinutos || 60,
        idEntrenador: clase.idEntrenador,
        activo: clase.activo ?? true,
      });
    } else {
      setEditingClase(null);
      setFormData({
        nombre: '',
        descripcion: '',
        horario: '',
        cupo: 10,
        duracionMinutos: 60,
        idEntrenador: entrenadores[0]?.idEntrenador || 0,
        activo: true,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClase(null);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cupo' || name === 'duracionMinutos' || name === 'idEntrenador'
        ? parseInt(value) || 0
        : name === 'activo'
        ? value === 'true'
        : value,
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

    if (!formData.horario) {
      newErrors.horario = 'El horario es obligatorio';
    } else {
      const horarioDate = new Date(formData.horario);
      if (horarioDate < new Date()) {
        newErrors.horario = 'El horario debe ser en el futuro';
      }
    }

    if (formData.cupo < 1) {
      newErrors.cupo = 'El cupo debe ser al menos 1';
    }

    if (formData.duracionMinutos < 15) {
      newErrors.duracionMinutos = 'La duración mínima es 15 minutos';
    }

    if (!formData.idEntrenador || formData.idEntrenador === 0) {
      newErrors.idEntrenador = 'Debes seleccionar un entrenador';
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
      const claseData: ClaseAdminDTO = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        horario: new Date(formData.horario).toISOString(),
        cupo: formData.cupo,
        duracionMinutos: formData.duracionMinutos,
        idEntrenador: formData.idEntrenador,
        activo: formData.activo,
      };

      if (editingClase?.idClase) {
        await adminClaseService.actualizar(editingClase.idClase, claseData);
      } else {
        await adminClaseService.crear(claseData);
      }

      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar clase:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      return;
    }

    try {
      await adminClaseService.eliminar(id);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar clase:', error);
    }
  };

  const handleToggleActivo = async (id: number, activo: boolean) => {
    try {
      if (activo) {
        await adminClaseService.desactivar(id);
      } else {
        await adminClaseService.activar(id);
      }
      cargarDatos();
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
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Gestionar Clases' }]} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar Clases</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nueva Clase
        </Button>
      </div>

      {clases.length === 0 ? (
        <EmptyState
          title="No hay clases"
          message="Crea tu primera clase para comenzar"
          actionLabel="Crear Clase"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((clase) => (
            <Card key={clase.idClase} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{clase.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDateTime(clase.horario)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  clase.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {clase.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {clase.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2">{clase.descripcion}</p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Entrenador:</span> {clase.nombreEntrenador}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Cupo:</span> {clase.cuposDisponibles || 0}/{clase.cupo}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Duración:</span> {clase.duracionMinutos} min
                </p>
                {clase.reservasConfirmadas !== undefined && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reservas:</span> {clase.reservasConfirmadas}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(clase)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  variant={clase.activo ? "danger" : "primary"}
                  size="sm"
                  onClick={() => handleToggleActivo(clase.idClase!, !clase.activo)}
                  className="flex-1"
                >
                  {clase.activo ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleEliminar(clase.idClase!)}
                  className="flex-1"
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear/editar clase */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingClase ? 'Editar Clase' : 'Nueva Clase'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la Clase"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Input
            label="Fecha y Hora"
            name="horario"
            type="datetime-local"
            value={formData.horario}
            onChange={handleChange}
            error={errors.horario}
            required
            helperText="Selecciona la fecha y hora de la clase"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cupo Máximo"
              name="cupo"
              type="number"
              min="1"
              value={formData.cupo.toString()}
              onChange={handleChange}
              error={errors.cupo}
              required
            />

            <Input
              label="Duración (minutos)"
              name="duracionMinutos"
              type="number"
              min="15"
              step="15"
              value={formData.duracionMinutos.toString()}
              onChange={handleChange}
              error={errors.duracionMinutos}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entrenador <span className="text-red-500">*</span>
            </label>
            <select
              name="idEntrenador"
              value={formData.idEntrenador}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.idEntrenador ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="0">Selecciona un entrenador</option>
              {entrenadores.map((entrenador) => (
                <option key={entrenador.idEntrenador} value={entrenador.idEntrenador}>
                  {entrenador.nombre} - {entrenador.especialidad}
                </option>
              ))}
            </select>
            {errors.idEntrenador && (
              <p className="mt-1 text-sm text-red-600">{errors.idEntrenador}</p>
            )}
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
              <span className="text-sm text-gray-700">Clase activa</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando...' : editingClase ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

