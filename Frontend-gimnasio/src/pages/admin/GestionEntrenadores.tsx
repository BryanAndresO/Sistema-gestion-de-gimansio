import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useApi, useApiMutation } from '../../hooks/useApi';

interface Entrenador {
  idEntrenador: number;
  nombre: string;
  especialidad: string;
  telefono: string;
  correo: string;
  activo: boolean;
}

export const GestionEntrenadores: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntrenador, setEditingEntrenador] = useState<Entrenador | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    telefono: '',
    correo: '',
    activo: true,
  });

  const { data: entrenadoresData, loading, refetch } = useApi<Entrenador[]>('/admin/entrenadores');
  const { mutate: createEntrenador, loading: creating } = useApiMutation();
  const { mutate: updateEntrenador, loading: updating } = useApiMutation();
  const { mutate: deleteEntrenador, loading: deleting } = useApiMutation();

  const entrenadores = entrenadoresData || [];

  const handleOpenModal = (entrenador?: Entrenador) => {
    if (entrenador) {
      setEditingEntrenador(entrenador);
      setFormData({
        nombre: entrenador.nombre,
        especialidad: entrenador.especialidad,
        telefono: entrenador.telefono,
        correo: entrenador.correo,
        activo: entrenador.activo,
      });
    } else {
      setEditingEntrenador(null);
      setFormData({
        nombre: '',
        especialidad: '',
        telefono: '',
        correo: '',
        activo: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntrenador(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEntrenador) {
        await updateEntrenador(`/admin/entrenadores/${editingEntrenador.idEntrenador}`, {
          method: 'PUT',
          data: formData,
        });
      } else {
        await createEntrenador('/admin/entrenadores', {
          method: 'POST',
          data: formData,
        });
      }

      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error al guardar entrenador:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este entrenador?')) {
      try {
        await deleteEntrenador(`/admin/entrenadores/${id}`, {
          method: 'DELETE',
        });
        refetch();
      } catch (error) {
        console.error('Error al eliminar entrenador:', error);
      }
    }
  };

  const columns = [
    { key: 'idEntrenador', header: 'ID', render: (value: number) => `#${value}` },
    { key: 'nombre', header: 'Nombre' },
    { key: 'especialidad', header: 'Especialidad' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'correo', header: 'Correo' },
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
      render: (_: any, row: Entrenador) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleOpenModal(row)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.idEntrenador)} disabled={deleting}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Gestión de Entrenadores' }]} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Entrenadores</h1>
          <p className="text-gray-600 mt-1">Administra el equipo de entrenadores</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Nuevo Entrenador</Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <Card>
          <Table data={entrenadores} columns={columns} />
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEntrenador ? 'Editar Entrenador' : 'Nuevo Entrenador'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              placeholder="Nombre del entrenador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
            <Input
              value={formData.especialidad}
              onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
              required
              placeholder="Ej: Yoga, Crossfit, Personal Training"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <Input
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
              placeholder="Número de contacto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <Input
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
              placeholder="entrenador@ejemplo.com"
            />
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
              Entrenador activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? 'Guardando...' : editingEntrenador ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
