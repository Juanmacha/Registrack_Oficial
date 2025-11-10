import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { BiArrowBack } from "react-icons/bi";
import { useAuth } from "../../../shared/contexts/authContext";
import alertService from "../../../utils/alertService.js";

const ClientNavbar = ({ title = "Mi Perfil", showBackButton = false }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  const handleVerPerfil = () => {
    setMenuAbierto(false);
    navigate("/cliente/profile");
  };

  const handleCerrarSesion = async () => {
    setMenuAbierto(false);
    
    const result = await alertService.logoutConfirm();
    
    if (result.isConfirmed) {
      logout();
      await alertService.success("Sesión cerrada", "Has cerrado sesión correctamente.");
      navigate("/login");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Cierre del menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Lado izquierdo */}
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <BiArrowBack className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>

          {/* Lado derecho - Menú de usuario */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              aria-expanded={menuAbierto}
              className="flex items-center space-x-3 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition duration-200"
            >
              <CgProfile className="w-6 h-6 text-gray-700" />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.nombre || user?.firstName || 'Usuario'}
              </span>
            </button>

            {menuAbierto && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.nombre || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Usuario'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.correo || user?.email || ''}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleVerPerfil}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    Ver perfil
                  </button>
                  <button
                    onClick={handleCerrarSesion}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientNavbar;
