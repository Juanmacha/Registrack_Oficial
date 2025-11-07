import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isClient } from "../../../shared/utils/roleUtils";

/**
 * Componente para proteger rutas que solo pueden acceder clientes
 * 
 * Características:
 * - Redirige a login si no está autenticado
 * - Redirige a landing si no es cliente
 * - Permite acceso solo a usuarios con rol "cliente"
 * 
 * @param {React.ReactNode} children - Componentes hijos a renderizar si el acceso es permitido
 * 
 * @example
 * <Route
 *   path="/cliente/misprocesos"
 *   element={
 *     <ClientRoute>
 *       <MisProcesos />
 *     </ClientRoute>
 *   }
 * />
 */
const ClientRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Log de debugging (puede deshabilitarse en producción)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [ClientRoute] Verificando acceso:', { 
      isAuthenticated: isAuthenticated(), 
      user: user,
      userRole: user?.rol || user?.role 
    });
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [ClientRoute] Usuario no autenticado, redirigiendo a login');
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de cliente
  if (!user || !isClient(user)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [ClientRoute] Usuario no es cliente, redirigiendo a landing');
    }
    return <Navigate to="/" replace />;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [ClientRoute] Acceso permitido');
  }

  return children;
};

export default ClientRoute;

