import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import LandingNavbar from '../landing/components/landingNavbar';
import Hero from './components/hero';
import SolicitudCitaLanding from './components/SolicitudCitaLanding';
import Footer from './components/footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useAuth } from '../../shared/contexts/authContext';
import { tieneRolAdministrativo } from '../../shared/utils/roleUtils.js';

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const hasRedirected = useRef(false); // Evitar múltiples redirecciones
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  useEffect(() => {
    // No hacer nada si está cargando o ya redirigimos
    if (loading || hasRedirected.current) {
      return;
    }

    // Solo redirigir si el usuario está autenticado y tiene rol administrativo
    // Y no estamos ya en una ruta administrativa
    if (user && tieneRolAdministrativo(user)) {
      // Evitar redirección si ya estamos en una ruta administrativa
      if (location.pathname.startsWith('/admin')) {
        return;
      }

      console.log('🔄 [Landing] Usuario con rol administrativo detectado, redirigiendo a dashboard');
      hasRedirected.current = true;
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // Efecto para manejar la visibilidad del botón flotante basado en el scroll
  useEffect(() => {
    const handleScroll = () => {
      const serviciosSection = document.getElementById('servicios');
      if (serviciosSection) {
        const rect = serviciosSection.getBoundingClientRect();
        // El botón se oculta cuando la sección servicios está por encima del viewport
        // o cuando el usuario ha scrolleado más allá de la sección
        const isPastServicios = rect.bottom < window.innerHeight / 2;
        setIsButtonVisible(!isPastServicios);
      }
    };

    // Verificar estado inicial
    handleScroll();

    // Agregar listener de scroll
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      <LandingNavbar />

      {/* Botón flotante de adquirir servicios */}
      {isButtonVisible && (
        <div className="fixed top-24 right-6 z-40">
          <ScrollLink
            to="servicios"
            smooth={true}
            duration={500}
            offset={-110}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 no-underline"
          >
            <span>Adquiere tus servicios aquí</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </ScrollLink>
        </div>
      )}

      <div>
        <Hero />
        <Footer />
      </div>
      {/* Copyright Section */}
      <footer className="bg-gray-800 text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Registrack. Todos los derechos reservados.
          </p>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
};

export default Landing;