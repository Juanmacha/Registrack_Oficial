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
  const { isAuthenticated, user, loading } = useAuth();

  // Log de debugging (puede deshabilitarse en producción)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [ClientRoute] Verificando acceso:', { 
      loading,
      isAuthenticated: isAuthenticated(), 
      user: user,
      userRole: user?.rol?.nombre || user?.rol || user?.role,
      userRolObject: user?.rol
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
      console.log('❌ [ClientRoute] Usuario no autenticado, redirigiendo a login');
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar que exista el usuario
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [ClientRoute] Usuario no encontrado, redirigiendo a login');
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de cliente
  const isUserClient = isClient(user);
  if (!isUserClient) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [ClientRoute] Usuario no es cliente:', {
        userRole: user?.rol?.nombre || user?.rol || user?.role,
        isClientResult: isUserClient,
        userRolObject: user?.rol
      });
      console.log('❌ [ClientRoute] Redirigiendo a landing');
    }
    return <Navigate to="/" replace />;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [ClientRoute] Acceso permitido para cliente');
  }

  return children;
};

export default ClientRoute;

