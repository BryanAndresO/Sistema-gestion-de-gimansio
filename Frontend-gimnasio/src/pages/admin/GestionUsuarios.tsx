import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useApi, useApiMutation } from '../../hooks/useApi';

interface Usuario {
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: 'USER' | 'ADMIN';
  activo: boolean;
}

export const GestionUsuarios: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: 'USER' as 'USER' | 'ADMIN',
    activo: true,
  });

  const { data: usuariosData, loading, refetch } = useApi<Usuario[]>('/admin/usuarios');
  const { mutate: createUser, loading: creating } = useApiMutation();
  const { mutate: updateUser, loading: updating } = useApiMutation();
  const { mutate: deleteUser, loading: deleting } = useApiMutation();

  const usuarios = usuariosData || [];

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({
        nombre: usuario.nombre,
        correo: usuario.correo,
        contrasena: '',
        rol: usuario.rol,
        activo: usuario.activo,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        correo: '',
        contrasena: '',
        rol: 'USER',
        activo: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      correo: '',
      contrasena: '',
      rol: 'USER',
      activo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Actualizar usuario
        const updateData: any = {
          nombre: formData.nombre,
          rol: formData.rol,
          activo: formData.activo,
        };

        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.contrasena) {
          updateData.contrasena = formData.contrasena;
        }

        await updateUser(`/admin/usuarios/${editingUser.idUsuario}`, {
          method: 'PUT',
          data: updateData,
        });
      } else {
        // Crear nuevo usuario
        await createUser('/admin/usuarios', {
          method: 'POST',
          data: formData,
        });
      }

      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(`/admin/usuarios/${id}`, {
          method: 'DELETE',
        });
        refetch();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const handleToggleActive = async (usuario: Usuario) => {
    try {
      await updateUser(`/admin/usuarios/${usuario.idUsuario}`, {
        method: 'PUT',
        data: {
          nombre: usuario.nombre,
          rol: usuario.rol,
          activo: !usuario.activo,
        },
      });
      refetch();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const columns = [
    { key: 'idUsuario', header: 'ID', render: (value: number) => `#${value}` },
    { key: 'nombre', header: 'Nombre' },
    { key: 'correo', header: 'Correo' },
    {
      key: 'rol',
      header: 'Rol',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          value === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (value: boolean, row: Usuario) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Activo' : 'Inactivo'}
        </button>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: any, row: Usuario) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenModal(row)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.idUsuario)}
            disabled={deleting}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Gestión de Usuarios' },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          Nuevo Usuario
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <Card>
          <Table data={usuarios} columns={columns} />
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <Input
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
              disabled={!!editingUser}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {editingUser && '(dejar en blanco para no cambiar)'}
            </label>
            <Input
              type="password"
              value={formData.contrasena}
              onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
              required={!editingUser}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'USER' | 'ADMIN' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
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
              Usuario activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
