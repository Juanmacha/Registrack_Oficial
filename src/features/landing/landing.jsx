import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  return (
    <div>
      <LandingNavbar />
      <div>
        <Hero />
        <Footer />
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default Landing;