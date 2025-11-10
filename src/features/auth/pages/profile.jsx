import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import ClientNavbar from "../components/ClientNavbar";
import ProfileContent from "../components/ProfileContent";

const ViewProfile = () => {
  const { user: usuario, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    </div>
  );
  
  if (!usuario) return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar perfil</h2>
        <p className="text-gray-600 mb-4">No se pudo cargar la información del usuario</p>
        <button 
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Ir al Login
        </button>
      </div>
    </div>
  );

  // Determinar el rol del usuario
  const userRole = usuario?.rol?.nombre || usuario?.role || 'cliente';
  const isClient = userRole === 'cliente';
  
  // Verificar si estamos en la ruta de admin (que ya tiene el layout)
  const isAdminRoute = location.pathname === '/admin/profile';

  // Renderizar layout según el rol
  if (isClient) {
    // Layout para clientes (sin sidebar de admin)
    return (
      <div className="min-h-screen bg-gray-100">
        <ClientNavbar title="Mi Perfil" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ProfileContent />
        </div>
      </div>
    );
  }

  // Para administradores y empleados, si estamos en /admin/profile,
  // el AdminLayout ya maneja el sidebar, solo renderizamos el contenido
  if (isAdminRoute) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileContent />
      </div>
    );
  }

  // Fallback: si no es cliente ni está en /admin/profile, renderizar layout completo
  // (esto no debería ocurrir, pero por si acaso)
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileContent />
      </div>
    </div>
  );
};

export default ViewProfile;