import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../landing/components/landingNavbar';
import Hero from './components/hero';
import SolicitudCitaLanding from './components/SolicitudCitaLanding';
import Footer from './components/footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useAuth } from '../../shared/contexts/authContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirigir a administradores y empleados al dashboard
    if (user && (user.role === "Administrador" || user.role === "Empleado")) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

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