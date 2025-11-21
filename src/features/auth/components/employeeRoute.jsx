import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdminOrEmployee } from "../../../shared/utils/roleUtils";

/**
 * Componente para proteger rutas que pueden acceder administradores y empleados
 * 
 * Características:
 * - Redirige a login si no está autenticado
 * - Redirige a landing si no es admin o empleado
 * - Permite acceso a usuarios con rol "administrador", "admin", "empleado" o "employee"
 * 
 * @param {React.ReactNode} children - Componentes hijos a renderizar si el acceso es permitido
 * 
 * @example
 * <Route
 *   path="/admin/dashboard"
 *   element={
 *     <EmployeeRoute>
 *       <Dashboard />
 *     </EmployeeRoute>
 *   }
 * />
 */
const EmployeeRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Log de debugging (puede deshabilitarse en producción)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [EmployeeRoute] Verificando acceso:', { 
      loading,
      isAuthenticated: isAuthenticated(), 
      user: user,
      userRole: user?.rol || user?.role 
    });
  }

  // Esperar a que termine la carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [EmployeeRoute] Usuario no autenticado, redirigiendo a login');
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar que exista el usuario
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [EmployeeRoute] Usuario no encontrado, redirigiendo a login');
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de admin o empleado usando roleUtils
  if (!isAdminOrEmployee(user)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [EmployeeRoute] Usuario sin permisos, redirigiendo a landing');
      console.log('❌ [EmployeeRoute] Detalles del usuario:', {
        user,
        rol: user?.rol,
        id_rol: user?.id_rol || user?.rol?.id,
        nombre: user?.rol?.nombre || user?.rol
      });
    }
    return <Navigate to="/" replace />;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [EmployeeRoute] Acceso permitido');
  }

  return children;
};

export default EmployeeRoute;