import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdmin } from "../../../shared/utils/roleUtils";

/**
 * Componente para proteger rutas que solo pueden acceder administradores
 * 
 * Características:
 * - Redirige a login si no está autenticado
 * - Redirige a landing si no es administrador
 * - Permite acceso solo a usuarios con rol "administrador" o "admin"
 * 
 * @param {React.ReactNode} children - Componentes hijos a renderizar si el acceso es permitido
 * 
 * @example
 * <Route
 *   path="/admin/gestionUsuarios"
 *   element={
 *     <AdminRoute>
 *       <GestionUsuarios />
 *     </AdminRoute>
 *   }
 * />
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Log de debugging (puede deshabilitarse en producción)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [AdminRoute] Verificando acceso:', { 
      isAuthenticated: isAuthenticated(), 
      user: user,
      userRole: user?.rol || user?.role 
    });
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [AdminRoute] Usuario no autenticado, redirigiendo a login');
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de administrador
  if (!user || !isAdmin(user)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [AdminRoute] Usuario no es administrador, redirigiendo a landing');
    }
    return <Navigate to="/" replace />;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [AdminRoute] Acceso permitido');
  }

  return children;
};

export default AdminRoute;
