import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { CgProfile } from "react-icons/cg";
import { useAuth } from "../../../shared/contexts/authContext";
import alertService from "../../../utils/alertService.js";
import { useNotification } from "../../../shared/contexts/NotificationContext";

const ACTIVE_CLASSES = "text-blue-700 font-semibold border-b-2 border-blue-700 bg-transparent";
const INACTIVE_CLASSES = "text-gray-700 border-transparent hover:text-blue-700 bg-transparent";

const NavBarLanding = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Usar el contexto de autenticación unificado con verificación de seguridad
  const authContext = useAuth();
  const { user, logout: contextLogout } = authContext || { user: null, logout: () => {} };
  const { success: showSuccessToast } = useNotification();
  const isLanding = location.pathname === "/";

  const handleLogout = async () => {
    setUserMenuAbierto(false);
    const result = await alertService.logoutConfirm();
    if (result.isConfirmed) {
      // Mostrar toast de éxito
      showSuccessToast(
        "¡Sesión cerrada!",
        "Tu sesión se ha cerrado exitosamente.",
        { duration: 3000 }
      );
      
      // Esperar un momento para que el toast se muestre, luego hacer logout
      setTimeout(() => {
        contextLogout();
        navigate("/login");
      }, 500);
    }
  };

  const handleVerPerfil = () => {
    setUserMenuAbierto(false);
    navigate("/profile");
  };

  // Cierre del menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper para estado activo en Links
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-container w-full bg-white fixed top-0 left-0 z-50">
      <div className="max-w-screen-xl mx-auto h-24 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        {/* Columna izquierda: Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <img
              src="/images/logoNombre.png"
              alt="Logo"
              className="navbar-logo h-16 sm:h-20 w-auto object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Columna central: Opciones centradas */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="navbar-menu flex gap-6 lg:gap-10 text-lg font-open-sans">
            {!user ? (
              <>
                <ScrollLink
                  to="nosotros"
                  smooth={true}
                  duration={500}
                  offset={-110}
                  spy={true}
                  activeClass={ACTIVE_CLASSES}
                  className={`navbar-link cursor-pointer text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                >
                  Nosotros
                </ScrollLink>
                <ScrollLink
                  to="servicios"
                  smooth={true}
                  duration={500}
                  offset={-110}
                  spy={true}
                  activeClass={ACTIVE_CLASSES}
                  className={`navbar-link cursor-pointer text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                >
                  Servicios
                </ScrollLink>
                <ScrollLink
                  to="footer"
                  smooth={true}
                  duration={500}
                  offset={-110}
                  spy={true}
                  activeClass={ACTIVE_CLASSES}
                  className={`navbar-link cursor-pointer text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                >
                  Contáctanos
                </ScrollLink>
                <Link
                  to="/ayuda"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${isActive("/ayuda") ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                >
                  Ayuda
                </Link>
              </>
            ) : (
              <>
                {isLanding ? (
                  <ScrollLink
                    to="servicios"
                    smooth={true}
                    duration={500}
                    offset={-110}
                    spy={true}
                    activeClass={ACTIVE_CLASSES}
                    className={`cursor-pointer text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                  >
                    Servicios
                  </ScrollLink>
                ) : (
                  <Link
                    to="/"
                    className={`text-lg px-2 py-1 no-underline border-b-2 transition ${INACTIVE_CLASSES}`}
                    onClick={() => {
                      // Navegar a la landing y luego hacer scroll a servicios
                      navigate('/');
                      setTimeout(() => {
                        const element = document.getElementById('servicios');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    Servicios
                  </Link>
                )}
                <Link
                  to="/"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${INACTIVE_CLASSES}`}
                  onClick={() => {
                    // Navegar a la landing y luego hacer scroll a footer
                    navigate('/');
                    setTimeout(() => {
                      const element = document.getElementById('footer');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  Contáctanos
                </Link>
                <Link
                  to="/misprocesos"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${isActive("/misprocesos") ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                >
                  Mis procesos
                </Link>
                <Link
                  to="/ayuda"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${isActive("/ayuda") ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                >
                  Ayuda
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Columna derecha: Botones de sesión o perfil */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          {!user ? (
            <>
              <Link
                to="/login"
                className="no-underline px-5 py-2 text-sm bg-white text-blue-600 rounded-md transition hover:bg-blue-50 btn-text"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="no-underline px-5 py-2 text-sm bg-blue-700 text-white rounded-md transition hover:bg-blue-800 btn-text"
              >
                Regístrate
              </Link>
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuAbierto(!userMenuAbierto)}
                aria-expanded={userMenuAbierto}
                className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition duration-200"
              >
                <CgProfile className="w-7 h-7 text-gray-700" />
              </button>
              {userMenuAbierto && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden"
                  role="menu"
                >
                  <button
                    onClick={handleVerPerfil}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 transition"
                  >
                    Ver perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 transition"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón hamburguesa */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Menú desplegable para móviles */}
        {menuAbierto && (
          <div className="md:hidden absolute top-24 left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 z-40">
            {!user ? (
              <>
                <ScrollLink
                  to="nosotros"
                  smooth={true}
                  duration={500}
                  offset={-110}
                  onClick={() => setMenuAbierto(false)}
                  spy={true}
                  activeClass={ACTIVE_CLASSES}
                  className={`text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                >
                  Nosotros
                </ScrollLink>
                <ScrollLink
                  to="servicios"
                  smooth={true}
                  duration={500}
                  offset={-110}
                  onClick={() => setMenuAbierto(false)}
                  spy={true}
                  activeClass={ACTIVE_CLASSES}
                  className={`text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                >
                  Servicios
                </ScrollLink>
                <ScrollLink
                  to="footer"
                  smooth={true}
                  duration={500}
                  offset={-110}
                  onClick={() => setMenuAbierto(false)}
                  spy={true}
                  activeClass={ACTIVE_CLASSES}
                  className={`text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                >
                  Contáctanos
                </ScrollLink>
                <Link
                  to="/ayuda"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${isActive("/ayuda") ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                  onClick={() => setMenuAbierto(false)}
                >
                  Ayuda
                </Link>
                <div className="flex flex-col items-center gap-4 mt-4 w-full px-6">
                  <Link
                    to="/login"
                    className="w-full text-center no-underline px-6 py-2 text-sm bg-white text-blue-600 rounded-md transition hover:bg-blue-50 btn-text"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center no-underline px-6 py-2 text-sm bg-blue-700 text-white rounded-md transition hover:bg-blue-800 btn-text"
                  onClick={() => setMenuAbierto(false)}
                >
                  Regístrate
                </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${isActive("/") ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                  onClick={() => setMenuAbierto(false)}
                >
                  Servicios
                </Link>
                {isLanding ? (
                  <ScrollLink
                    to="servicios"
                    smooth={true}
                    duration={500}
                    offset={-110}
                    onClick={() => setMenuAbierto(false)}
                    spy={true}
                    activeClass={ACTIVE_CLASSES}
                    className={`text-lg no-underline px-2 py-1 border-b-2 transition ${INACTIVE_CLASSES}`}
                  >
                    Servicios
                  </ScrollLink>
                ) : (
                  <Link
                    to="/"
                    className={`text-lg px-2 py-1 no-underline border-b-2 transition ${INACTIVE_CLASSES}`}
                    onClick={() => {
                      setMenuAbierto(false);
                      // Navegar a la landing y luego hacer scroll a servicios
                      navigate('/');
                      setTimeout(() => {
                        const element = document.getElementById('servicios');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    Servicios
                  </Link>
                )}
                <Link
                  to="/"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${INACTIVE_CLASSES}`}
                  onClick={() => {
                    setMenuAbierto(false);
                    // Navegar a la landing y luego hacer scroll a footer
                    navigate('/');
                    setTimeout(() => {
                      const element = document.getElementById('footer');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  Contáctanos
                </Link>
                <Link
                  to="/misprocesos"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${isActive("/misprocesos") ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                  onClick={() => setMenuAbierto(false)}
                >
                  Mis procesos
                </Link>
                <Link
                  to="/ayuda"
                  className={`text-lg px-2 py-1 no-underline border-b-2 transition ${isActive("/ayuda") ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                  onClick={() => setMenuAbierto(false)}
                >
                  Ayuda
                </Link>
                <div className="flex flex-col items-center gap-4 mt-4 w-full px-6">
                  <Link
                    to="/profile"
                    className="w-full text-center text-blue-700 font-semibold"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuAbierto(false);
                    }}
                    className="w-full text-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBarLanding;
