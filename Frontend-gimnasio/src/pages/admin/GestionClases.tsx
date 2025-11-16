import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useApi, useApiMutation } from '../../hooks/useApi';

interface Clase {
  idClase: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  cupo: number;
  horario: string;
  idEntrenador: number;
  nombreEntrenador?: string;
  activo: boolean;
}

export const GestionClases: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClase, setEditingClase] = useState<Clase | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracionMinutos: 60,
    cupo: 20,
    horario: '',
    idEntrenador: 0,
    activo: true,
  });

  const { data: clasesData, loading, refetch } = useApi<Clase[]>('/admin/clases');
  const { data: entrenadoresData } = useApi<any[]>('/admin/entrenadores');
  const { mutate: createClase, loading: creating } = useApiMutation();
  const { mutate: updateClase, loading: updating } = useApiMutation();
  const { mutate: deleteClase, loading: deleting } = useApiMutation();

  const clases = clasesData || [];
  const entrenadores = entrenadoresData || [];

  const handleOpenModal = (clase?: Clase) => {
    if (clase) {
      setEditingClase(clase);
      setFormData({
        nombre: clase.nombre,
        descripcion: clase.descripcion,
        duracionMinutos: clase.duracionMinutos,
        cupo: clase.cupo,
        horario: clase.horario,
        idEntrenador: clase.idEntrenador,
        activo: clase.activo,
      });
    } else {
      setEditingClase(null);
      setFormData({
        nombre: '',
        descripcion: '',
        duracionMinutos: 60,
        cupo: 20,
        horario: new Date().toISOString().slice(0, 16),
        idEntrenador: 0,
        activo: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClase(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClase) {
        await updateClase(`/admin/clases/${editingClase.idClase}`, {
          method: 'PUT',
          data: formData,
        });
      } else {
        await createClase('/admin/clases', {
          method: 'POST',
          data: formData,
        });
      }

      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error al guardar clase:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      try {
        await deleteClase(`/admin/clases/${id}`, {
          method: 'DELETE',
        });
        refetch();
      } catch (error) {
        console.error('Error al eliminar clase:', error);
      }
    }
  };

  const columns = [
    { key: 'idClase', header: 'ID', render: (value: number) => `#${value}` },
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción', render: (value: string) => value || 'N/A' },
    { key: 'duracionMinutos', header: 'Duración', render: (value: number) => `${value} min` },
    { key: 'cupo', header: 'Capacidad', render: (value: number) => `${value} personas` },
    { key: 'nombreEntrenador', header: 'Entrenador', render: (value: string) => value || 'Sin asignar' },
    {
      key: 'activo',
      header: 'Estado',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: any, row: Clase) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleOpenModal(row)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.idClase)} disabled={deleting}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Gestión de Clases' }]} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Clases</h1>
          <p className="text-gray-600 mt-1">Administra las clases del gimnasio</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Nueva Clase</Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <Card>
          <Table data={clases} columns={columns} />
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClase ? 'Editar Clase' : 'Nueva Clase'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              placeholder="Ej: Yoga, Spinning, CrossFit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción de la clase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
            <Input
              type="datetime-local"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrenador</label>
            <select
              value={formData.idEntrenador}
              onChange={(e) => setFormData({ ...formData, idEntrenador: parseInt(e.target.value) })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Seleccionar entrenador</option>
              {entrenadores.map((entrenador) => (
                <option key={entrenador.idEntrenador} value={entrenador.idEntrenador}>
                  {entrenador.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
              <Input
                type="number"
                value={formData.duracionMinutos}
                onChange={(e) => setFormData({ ...formData, duracionMinutos: parseInt(e.target.value) })}
                required
                min={15}
                max={180}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <Input
                type="number"
                value={formData.cupo}
                onChange={(e) => setFormData({ ...formData, cupo: parseInt(e.target.value) })}
                required
                min={1}
                max={100}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
              Clase activa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? 'Guardando...' : editingClase ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
