import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdminOrEmployee, isClient } from "../../../shared/utils/roleUtils";

/**
 * Componente de redirección inteligente para la ruta /profile
 * Redirige al perfil correcto según el rol del usuario:
 * - Admin/Empleado → /admin/profile
 * - Cliente → /cliente/profile
 * - No autenticado → /login
 */
const ProfileRedirect = () => {
  const { user, loading } = useAuth();
  
  // Esperar a que se cargue el usuario
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
  
  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirigir según el rol
  if (isAdminOrEmployee(user)) {
    return <Navigate to="/admin/profile" replace />;
  }
  
  if (isClient(user)) {
    return <Navigate to="/cliente/profile" replace />;
  }
  
  // Por defecto, redirigir a landing
  return <Navigate to="/" replace />;
};

export default ProfileRedirect;

