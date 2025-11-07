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
  const { isAuthenticated, user } = useAuth();

  // Log de debugging (puede deshabilitarse en producción)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [EmployeeRoute] Verificando acceso:', { 
      isAuthenticated: isAuthenticated(), 
      user: user,
      userRole: user?.rol || user?.role 
    });
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [EmployeeRoute] Usuario no autenticado, redirigiendo a login');
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de admin o empleado usando roleUtils
  if (!user || !isAdminOrEmployee(user)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [EmployeeRoute] Usuario sin permisos, redirigiendo a landing');
    }
    return <Navigate to="/" replace />;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [EmployeeRoute] Acceso permitido');
  }

  return children;
};

export default EmployeeRoute;