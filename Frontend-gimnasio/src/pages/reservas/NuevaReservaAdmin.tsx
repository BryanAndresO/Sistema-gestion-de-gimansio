import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ClaseCard } from '../../components/clases/ClaseCard';
import { ReservaConfirmModal } from '../../components/reservas/ReservaConfirmModal';
import type { ClaseDTO } from '../../services/core/claseService';
import type { UsuarioDTO } from '../../services/core/usuarioService';
import { claseService } from '../../services/core/claseService';
import { reservaService } from '../../services/core/reservaService';
import { usuarioService } from '../../services/core/usuarioService';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export const NuevaReservaAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [clases, setClases] = useState<ClaseDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseDTO | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioDTO | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

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
      const [clasesData, usuariosData] = await Promise.all([
        claseService.obtenerClasesDisponibles(),
        usuarioService.listarUsuarios(),
      ]);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
      setUsuarios(usuariosArray);
      setUsuariosFiltrados(usuariosArray);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      toast.error('Error al cargar los datos');
      setUsuarios([]);
      setUsuariosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuarios = async (termino: string) => {
    if (!termino.trim()) {
      setUsuariosFiltrados(Array.isArray(usuarios) ? usuarios : []);
      return;
    }

    setBuscandoUsuarios(true);
    try {
      const resultados = await usuarioService.buscarUsuarios(termino);
      setUsuariosFiltrados(Array.isArray(resultados) ? resultados : []);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      setUsuariosFiltrados([]);
    } finally {
      setBuscandoUsuarios(false);
    }
  };

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaUsuario(valor);
    buscarUsuarios(valor);
  };

  const handleReservar = (idClase: number) => {
    if (!usuarioSeleccionado) {
      toast.error('Por favor, selecciona un usuario primero');
      return;
    }

    const clase = clases.find(c => c.idClase === idClase);
    if (clase) {
      setClaseSeleccionada(clase);
      setShowConfirmModal(true);
    }
  };

  const confirmarReserva = async () => {
    if (!claseSeleccionada || !usuarioSeleccionado || !usuarioSeleccionado.idUsuario) return;

    try {
      setReservando(true);
      await reservaService.crearReserva(usuarioSeleccionado.idUsuario, claseSeleccionada.idClase);
      toast.success(`Reserva creada exitosamente para ${usuarioSeleccionado.nombre}`);
      setShowConfirmModal(false);
      setClaseSeleccionada(null);
      // Recargar clases para actualizar disponibilidad
      cargarDatos();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setReservando(false);
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
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reservas', path: '/reservas' },
          { label: 'Nueva Reserva (Admin)' },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">Nueva Reserva - Administrador</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de selección de usuario */}
        <div className="lg:col-span-1">
          <Card title="Seleccionar Usuario">
            <div className="space-y-4">
              <Input
                label="Buscar Usuario"
                placeholder="Nombre o correo..."
                value={busquedaUsuario}
                onChange={handleBusquedaChange}
                helperText="Busca por nombre o correo electrónico"
              />

              {buscandoUsuarios ? (
                <div className="text-center py-4">
                  <Loading />
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <EmptyState
                  title="No se encontraron usuarios"
                  message="Intenta con otro término de búsqueda"
                />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {usuariosFiltrados.map((usuario) => (
                    <button
                      key={usuario.idUsuario}
                      onClick={() => setUsuarioSeleccionado(usuario)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        usuarioSeleccionado?.idUsuario === usuario.idUsuario
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{usuario.nombre}</div>
                      <div className="text-sm text-gray-600">{usuario.correo}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {usuario.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {usuarioSeleccionado && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Usuario seleccionado:</p>
                  <p className="text-blue-700">{usuarioSeleccionado.nombre}</p>
                  <p className="text-xs text-blue-600">{usuarioSeleccionado.correo}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Panel de clases */}
        <div className="lg:col-span-2">
          {clases.length === 0 ? (
            <EmptyState
              title="No hay clases disponibles"
              message="No hay clases disponibles para reservar en este momento"
            />
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                {usuarioSeleccionado
                  ? `Selecciona una clase para reservar para ${usuarioSeleccionado.nombre}`
                  : 'Primero selecciona un usuario para hacer la reserva'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clases.map((clase) => (
                  <ClaseCard
                    key={clase.idClase}
                    clase={clase}
                    onReservar={handleReservar}
                    disabled={!usuarioSeleccionado}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ReservaConfirmModal
        isOpen={showConfirmModal}
        clase={claseSeleccionada}
        onConfirm={confirmarReserva}
        onCancel={() => {
          setShowConfirmModal(false);
          setClaseSeleccionada(null);
        }}
        isLoading={reservando}
        usuarioNombre={usuarioSeleccionado?.nombre}
      />
    </>
  );
};

