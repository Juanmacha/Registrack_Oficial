import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Landing from '../features/landing/landing';
import Login from '../features/auth/pages/login';
import Register from '../features/auth/pages/register';
import Profile from '../features/auth/pages/profile';
import ForgotPassword from '../features/auth/pages/forgotPassword';
import ResetPassword from '../features/auth/pages/resetPassword';
import CodigoRecuperacion from '../features/auth/pages/codigoRecuperacion';
import ApiTest from '../components/ApiTest';

import Dashboard from '../features/dashboard/pages/dashAdmin/dashboard';
import Pagos from '../features/dashboard/pages/pagos/pagos';
import Calendario from '../features/dashboard/pages/gestionCitas/calendario';
import GestionClientes from '../features/dashboard/pages/gestionClientes/gestionClientes';
import GestionUsuarios from '../features/dashboard/pages/gestionUsuarios/gestionUsuarios';
import GestionVentasServiciosProceso from '../features/dashboard/pages/gestionVentasServicios/ventasServiciosProceso';
import GestionVentasServiciosFin from '../features/dashboard/pages/gestionVentasServicios/ventasServiciosFin';
import Roles from '../features/dashboard/pages/gestionRoles/roles';
import Empleados from '../features/dashboard/pages/gestionEmpleados/empleados';
import Servicios from '../features/dashboard/pages/gestionVentasServicios/gestionServicios';
import MisProcesos from '../features/dashboard/pages/misProcesos/MisProcesos'
import Ayuda from '../features/landing/pages/ayuda';

import AuthLayout from '../features/auth/components/authLayout';
import AdminRoute from '../features/auth/components/adminRoute';
import EmployeeRoute from '../features/auth/components/employeeRoute';
import ClientRoute from '../features/auth/components/clientRoute';
import ProfileRedirect from '../features/auth/components/ProfileRedirect';

// Layout general para admin
import AdminLayout from '../features/dashboard/layouts/adminLayouts';

// Nuevas páginas de servicios
import Busqueda from '../features/landing/pages/busqueda';
import Certificacion from '../features/landing/pages/certificacion';
import Renovacion from '../features/landing/pages/renovacion';
import Ampliacion from '../features/landing/pages/ampliacion';
import Cesion from '../features/landing/pages/cesionMarca';
import Oposicion from '../features/landing/pages/presentacionOposicion';
import EditarProfile from '../features/auth/pages/editProfile';

//Formularios
import FormularioBase from '../shared/layouts/FormularioBase'
import FormularioNuevoPropietario from '../shared/components/formularioCesiondeMarca';
import FormularioBusqueda from '../shared/components/formularioBusqueda';
import FormularioAmpliacion from '../shared/components/formularioAmpliacion';
import FormularioCertificacion from '../shared/components/formularioCertificacion';
import FormularioOposicion from '../shared/components/formularioOposicion';
import FormularioRespuestaOposicion from '../shared/components/formularioRespuesta';
import FormularioRenovacion from '../shared/components/formularioRenovacion';
import CrearSolicitudPage from '../features/landing/pages/CrearSolicitudPage';

// Componentes de prueba
import TestSincronizacion from '../components/TestSincronizacion';
import TestSimple from '../components/TestSimple';
import TestApiConnection from '../components/TestApiConnection';
import TestForgotPassword from '../components/TestForgotPassword';
import TestAuthIntegration from '../components/TestAuthIntegration';
import TestConnection from '../components/TestConnection';
import TestAuthState from '../components/TestAuthState';
import SolicitudesCitas from '../features/dashboard/pages/solicitudesCitas/SolicitudesCitas';
import SolicitudesCitasApi from '../features/dashboard/pages/solicitudesCitas/SolicitudesCitasApi';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/api-test" element={<ApiTest />} />

      {/* Páginas individuales de servicios */}
      <Route path="/pages/cesion-marca" element={<Cesion />} />
      <Route path="/pages/presentacion-oposicion" element={<Oposicion />} />
      <Route path="/pages/renovacion" element={<Renovacion />} />
      <Route path="/pages/busqueda" element={<Busqueda />} />
      <Route path="/pages/certificacion" element={<Certificacion />} />
      <Route path="/pages/ampliacion" element={<Ampliacion />} />
      <Route path="/ayuda" element={<Ayuda />} />

      {/* Layout para autenticación */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/codigoRecuperacion" element={<CodigoRecuperacion />} />
      </Route>

      {/* ✅ RUTAS PROTEGIDAS PARA CLIENTES */}
      <Route
        path="/cliente"
        element={
          <ClientRoute>
            <div className="min-h-screen bg-gray-50">
              <Outlet />
            </div>
          </ClientRoute>
        }
      >
        <Route path="misprocesos" element={<MisProcesos />} />
        <Route path="profile" element={<Profile />} />
        <Route path="editProfile" element={<EditarProfile />} />
      </Route>

      {/* ✅ RUTAS PROTEGIDAS PARA ADMIN Y EMPLEADOS */}
      <Route
        path="/admin"
        element={
          <EmployeeRoute>
            <AdminLayout />
          </EmployeeRoute>
        }
      >
        {/* ✅ Rutas accesibles para admin Y empleado */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="ventasServiciosProceso" element={<GestionVentasServiciosProceso />} />
        <Route path="ventasServiciosFin" element={<GestionVentasServiciosFin />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="gestionClientes" element={<GestionClientes />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="solicitudesCitas" element={<SolicitudesCitas />} />
        <Route path="solicitudesCitas-api" element={<SolicitudesCitasApi />} />
        <Route path="profile" element={<Profile />} />

        {/* ✅ Rutas SOLO para administradores (protección anidada) */}
        <Route element={<AdminRoute><Outlet /></AdminRoute>}>
          <Route path="gestionUsuarios" element={<GestionUsuarios />} />
          <Route path="roles" element={<Roles />} />
          <Route path="empleados" element={<Empleados />} />
        </Route>
      </Route>

      {/* ✅ Redirecciones para compatibilidad con URLs antiguas */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/misprocesos" element={<Navigate to="/cliente/misprocesos" replace />} />
      <Route path="/profile" element={<ProfileRedirect />} />
      <Route path="/editProfile" element={<Navigate to="/cliente/editProfile" replace />} />

      {/* Formularios anidados bajo un layout base */}
      <Route path="/formulario" element={<FormularioBase />}>
        <Route path="cesion" element={<FormularioNuevoPropietario />} />
        <Route path="busqueda" element={<FormularioBusqueda/>} />
        <Route path="ampliacion" element={<FormularioAmpliacion/>} />
        <Route path="renovacion" element={<FormularioRenovacion/>} />
        <Route path="certificacion" element={<FormularioCertificacion/>} />
        <Route path="oposicion" element={<FormularioOposicion/>} />
        <Route path="respuesta" element={<FormularioRespuestaOposicion/>} />
        
      </Route>

      <Route path="/crear-solicitud/:servicioId" element={<CrearSolicitudPage />} />

      {/* Rutas de prueba para sincronización */}
      <Route path="/test-sync" element={<TestSincronizacion />} />
      <Route path="/test-simple" element={<TestSimple />} />
      <Route path="/test-api" element={<TestApiConnection />} />
      <Route path="/test-forgot-password" element={<TestForgotPassword />} />
      <Route path="/test-auth" element={<TestAuthIntegration />} />
      <Route path="/test-connection" element={<TestConnection />} />
      <Route path="/test-auth-state" element={<TestAuthState />} />

      {/* Redirecciones para compatibilidad con URLs antiguas */}
      <Route path="/pages/cesionMarca" element={<Navigate to="/pages/cesion-marca" replace />} />
      <Route path="/pages/presentacionOposicion" element={<Navigate to="/pages/presentacion-oposicion" replace />} />

      {/* Ruta catch-all para URLs no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );
};

export default AppRoutes;
