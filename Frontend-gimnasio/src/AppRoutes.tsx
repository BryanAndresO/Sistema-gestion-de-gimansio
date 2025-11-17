import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './utils/constants';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { Pricing } from './pages/public/Pricing';
import { NotFound } from './pages/public/NotFound';
import { Register } from './pages/auth/Register';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/user/Dashboard';
import { Profile } from './pages/user/Profile';
import { Settings } from './pages/user/Settings';
import { Notifications } from './pages/user/Notifications';
import { CatalogoClases } from './pages/clases/CatalogoClases';
import { DetalleClase } from './pages/clases/DetalleClase';
import { HorarioSemanal } from './pages/clases/HorarioSemanal';
import { MisReservas } from './pages/reservas/MisReservas';
import { NuevaReserva } from './pages/reservas/NuevaReserva';
import { NuevaReservaAdmin } from './pages/reservas/NuevaReservaAdmin';
import { HistorialReservas } from './pages/reservas/HistorialReservas';
import { CrearUsuarioAdmin } from './pages/admin/CrearUsuarioAdmin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { GestionUsuarios } from './pages/admin/GestionUsuarios';
import { GestionClases } from './pages/admin/GestionClases';
import { GestionarClases } from './pages/admin/GestionarClases';
import { GestionEntrenadores } from './pages/admin/GestionEntrenadores';
import { GestionarEntrenadores } from './pages/admin/GestionarEntrenadores';
import { GestionReservas } from './pages/admin/GestionReservas';
import { Reportes } from './pages/admin/Reportes';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { authService } from './services/core/authService';

// Componente para redirigir usuarios autenticados lejos de las páginas de autenticación
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (authService.isAuthenticated()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path={ROUTES.CONTACT} element={<Contact />} />
      <Route path={ROUTES.PRICING} element={<Pricing />} />
      
      {/* Rutas de autenticación (solo para usuarios no autenticados) */}
      <Route 
        path={ROUTES.REGISTER} 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path={ROUTES.LOGIN} 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route 
          path={ROUTES.DASHBOARD}
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <MainLayout>
              <Settings />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.NOTIFICATIONS}
          element={
            <MainLayout>
              <Notifications />
            </MainLayout>
          }
        />

        {/* Páginas de clases */}
        <Route
          path={ROUTES.CLASES}
          element={
            <MainLayout>
              <CatalogoClases />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.CLASES_DETALLE}
          element={
            <MainLayout>
              <DetalleClase />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.HORARIO_SEMANAL}
          element={
            <MainLayout>
              <HorarioSemanal />
            </MainLayout>
          }
        />

        {/* Páginas de reservas */}
        <Route
          path={ROUTES.RESERVAS}
          element={
            <MainLayout>
              <MisReservas />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.NUEVA_RESERVA}
          element={
            <MainLayout>
              <NuevaReserva />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.NUEVA_RESERVA_ADMIN}
          element={
            <MainLayout>
              <NuevaReservaAdmin />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.HISTORIAL_RESERVAS}
          element={
            <MainLayout>
              <HistorialReservas />
            </MainLayout>
          }
        />

        {/* Páginas de administración */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_USUARIOS}
          element={
            <MainLayout>
              <GestionUsuarios />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_CREAR_USUARIO}
          element={
            <MainLayout>
              <CrearUsuarioAdmin />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_CLASES}
          element={
            <MainLayout>
              <GestionClases />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_GESTIONAR_CLASES}
          element={
            <MainLayout>
              <GestionarClases />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_ENTRENADORES}
          element={
            <MainLayout>
              <GestionEntrenadores />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_GESTIONAR_ENTRENADORES}
          element={
            <MainLayout>
              <GestionarEntrenadores />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_RESERVAS}
          element={
            <MainLayout>
              <GestionReservas />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.ADMIN_REPORTES}
          element={
            <MainLayout>
              <Reportes />
            </MainLayout>
          }
        />
      </Route>

      {/* Ruta por defecto */}
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
};
