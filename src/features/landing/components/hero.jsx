// Hero.jsx
import React, { useState, useEffect } from "react";
import { FaBalanceScale, FaMedal, FaRocket, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { mockDataService } from "../../../utils/mockDataService.js";
import authData from '../../auth/services/authData';
import alertService from '../../../utils/alertService.js';
import { useAuth } from '../../../shared/contexts/authContext.jsx';

// Formularios y Modal
import FormularioBaseModal from "../../../shared/layouts/FormularioBase";
import FormularioBusqueda from "../../../shared/components/formularioBusqueda";
import FormularioCertificacion from "../../../shared/components/formularioCertificacion";
import FormularioRenovacion from "../../../shared/components/formularioRenovacion";
import FormularioOposicion from "../../../shared/components/formularioOposicion";
import FormularioCesion from "../../../shared/components/formularioCesiondeMarca";
import FormularioAmpliacion from "../../../shared/components/formularioAmpliacion";
import FormularioRespuesta from "../../../shared/components/formularioRespuesta";
import ModalAgendarCita from './ModalAgendarCita';
import ServiceModal from './ServiceModal';

// Constantes
const FORMULARIOS_POR_SERVICIO = {
  "Búsqueda de Antecedentes": FormularioBusqueda,
  "Certificación de Marca": FormularioCertificacion,
  "Renovación de Marca": FormularioRenovacion,
  "Presentación de Oposición": FormularioOposicion,
  "Cesión de Marca": FormularioCesion,
  "Ampliación de Alcance": FormularioAmpliacion,
  "Respuesta a Oposición": FormularioRespuesta
};

// Componente para las características del hero
const HeroFeatures = () => (
  <div className="space-y-4 text-base text-gray-700 mb-6">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <FaBalanceScale className="text-blue-700 text-sm" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 mb-1 text-base">Soporte legal completo:</h3>
        <p className="text-gray-700 text-base">
          Contamos con abogados especializados en propiedad intelectual que te asesoran desde
          el inicio hasta la obtención del certificado.
        </p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <FaMedal className="text-blue-700 text-sm" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 mb-1 text-base">Más de 12 años de experiencia:</h3>
        <p className="text-gray-700 text-base">
          Hemos ayudado a cientos de emprendedores y empresas en Colombia a proteger
          sus marcas con éxito.
        </p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <FaRocket className="text-blue-700 text-sm" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 mb-1 text-base">Trámites 100% en línea:</h3>
        <p className="text-gray-700 text-base">
          Ahorra tiempo y evita desplazamientos. Todo el proceso es digital, ágil y con
          atención personalizada.
        </p>
      </div>
    </div>
  </div>
);

// Componente para el video del hero
const HeroVideo = () => (
  <div className="flex-1 flex justify-center items-center h-[400px] md:h-[500px]">
    <video
      src="/images/Whisk_cauajgm4ymzhyjjkltawzjetndazzc1hn2y3lwe.mp4"
      alt="Video Registrack"
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
    />
  </div>
);


// Componente para la tarjeta de servicio
const ServicioCard = ({ servicio, onSaberMas, onAdquirir, formularioDisponible }) => (
  <div className="bg-gray-100 rounded-xl shadow-md transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center overflow-hidden">
    <img
      src={servicio.landing_data?.imagen || "/images/certificacion.jpg"}
      alt={servicio.landing_data?.titulo || servicio.nombre}
      className="w-full h-48 object-cover"
      onError={e => { e.target.src = "/images/certificacion.jpg"; }}
    />
    <div className="p-6">
      <h3 className="text-xl title-secondary text-[#275FAA] mb-2">
        {servicio.landing_data?.titulo || servicio.nombre}
      </h3>
      <p className="text-gray-600 text-sm mb-4 text-body">
        {servicio.landing_data?.resumen || servicio.descripcion_corta}
      </p>
      <div className="flex flex-row gap-2 justify-center mt-2">
        <button
          onClick={() => onSaberMas(servicio)}
          className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-md btn-text shadow-sm hover:bg-[#163366] transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Saber más
        </button>
        <button
          onClick={() => onAdquirir(servicio)}
          className={`px-3 py-1.5 text-sm rounded-md btn-text shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400 ${formularioDisponible
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          disabled={!formularioDisponible}
        >
          Adquirir Servicio
        </button>
      </div>
    </div>
  </div>
);

// Componente para la sección de servicios
const ServiciosSection = ({ servicios, loading, onSaberMas, onAdquirir }) => (
  <section id="servicios" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-screen-xl mx-auto">
      <h2 className="text-4xl title-primary text-center mb-12 text-[#275FAA]">
        Nuestros Servicios
      </h2>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio) => (
            <ServicioCard
              key={servicio.id}
              servicio={servicio}
              onSaberMas={onSaberMas}
              onAdquirir={onAdquirir}
              formularioDisponible={!!FORMULARIOS_POR_SERVICIO[servicio.nombre]}
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

// Hook personalizado para manejar servicios
const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        console.log('🔧 [Hero] Cargando servicios desde la API...');
        
        // Importar el servicio API dinámicamente
        const { default: serviciosApiService } = await import('../../dashboard/pages/gestionVentasServicios/services/serviciosApiService');
        const todos = await serviciosApiService.getServicios();
        const serviciosVisibles = todos.filter(s => s.visible_en_landing);
        
        console.log('✅ [Hero] Servicios cargados desde API:', serviciosVisibles.length);
        console.log('🔍 [Hero] Servicios visibles:', serviciosVisibles.map(s => ({ id: s.id, nombre: s.nombre, visible: s.visible_en_landing })));
        
        setServicios(serviciosVisibles);
        setLoading(false);
      } catch (error) {
        console.error('❌ [Hero] Error cargando servicios desde API, usando mock:', error);
        
        // Fallback a datos mock en caso de error
        const todos = mockDataService.getServices();
        const serviciosVisibles = todos.filter(s => s.visible_en_landing);
        console.log('🔄 [Hero] Usando servicios mock:', serviciosVisibles.length);
        setServicios(serviciosVisibles);
        setLoading(false);
      }
    };

    cargar();
    window.addEventListener('focus', cargar);

    const onStorage = (e) => {
      if (e.key === 'servicios_management') cargar();
    };
    window.addEventListener('storage', onStorage);
    
    const onServiciosUpdated = () => {
      console.log('🔄 [Hero] Servicios actualizados, recargando...');
      cargar();
    };
    window.addEventListener('servicios_updated', onServiciosUpdated);

    return () => {
      window.removeEventListener('focus', cargar);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('servicios_updated', onServiciosUpdated);
    };
  }, []);

  return { servicios, loading };
};

// Hook personalizado para manejar el modal
const useModal = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [tituloModal, setTituloModal] = useState("");

  const abrirModal = (servicio) => {
    console.log('🔧 [Hero] abrirModal llamado con servicio:', servicio);
    const FormularioComponente = FORMULARIOS_POR_SERVICIO[servicio.nombre];
    console.log('🔧 [Hero] FormularioComponente para', servicio.nombre, ':', FormularioComponente);

    if (!FormularioComponente) {
      console.error('🔧 [Hero] No se encontró formulario para:', servicio.nombre);
      alert("Este servicio aún no tiene un formulario habilitado.");
      return false;
    }

    console.log('🔧 [Hero] Abriendo modal...');
    setServicioSeleccionado(servicio);
    setTituloModal(`Solicitud de ${servicio.nombre}`);
    setModalAbierto(true);
    return true;
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setServicioSeleccionado(null);
    setTituloModal("");
  };

  return { modalAbierto, servicioSeleccionado, tituloModal, abrirModal, cerrarModal };
};

// Componente principal Hero
const Hero = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { servicios, loading } = useServicios();
  const { modalAbierto, servicioSeleccionado, tituloModal, abrirModal, cerrarModal } = useModal();
  const [modalCitaOpen, setModalCitaOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleGuardarOrden = async (formData) => {
    try {
      console.log('🔧 [Hero] Guardando orden de servicio:', formData);
      
      // Obtener el usuario actual
      const user = authData.getUser && typeof authData.getUser === 'function'
        ? authData.getUser()
        : JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        await alertService.error("Error", "No se pudo obtener la información del usuario.");
        return;
      }

      // Crear la orden usando el servicio de ventas
      const ordenData = {
        ...formData,
        cliente: user.nombres + ' ' + user.apellidos,
        clienteId: user.id,
        email: user.email, // Agregar email para que aparezca en Mis Procesos
        fechaCreacion: new Date().toISOString(),
        estado: 'En revisión',
        encargado: 'Sin asignar'
      };

      // Usar el servicio de ventas para crear la orden
      const { crearVenta } = await import('../../dashboard/pages/gestionVentasServicios/services/ventasService');
      await crearVenta(ordenData);
      
      await alertService.success(
        "¡Orden creada!",
        "La orden de servicio se ha creado correctamente y aparecerá en 'Mis Procesos'.",
        { confirmButtonText: "Entendido" }
      );
      
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar la orden:', error);
      await alertService.error(
        "Error",
        "No se pudo crear la orden de servicio. Inténtalo de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    }
  };

  const handleAdquirir = async (servicio) => {
    const user = authData.getUser && typeof authData.getUser === 'function'
      ? authData.getUser()
      : JSON.parse(localStorage.getItem('user'));

    if (!user) {
      localStorage.setItem('postLoginRedirect', window.location.pathname);
      await alertService.warning(
        "¡Atención!",
        "Debes estar logueado para realizar esta opción.",
        { confirmButtonText: "Entiendo", showCancelButton: false }
      );
      navigate('/login');
      return;
    }

    if (user.rol && user.rol.toLowerCase() === 'admin') {
      await alertService.warning(
        "¡Atención!",
        "Esta acción solo está disponible para clientes.",
        { confirmButtonText: "Entiendo", showCancelButton: false }
      );
      return;
    }

    abrirModal(servicio);
  };

  const handleSaberMas = (servicio) => {
    setSelectedService(servicio);
    setServiceModalOpen(true);
  };

  const handleAgendarCitaClick = async () => {
    console.log('🔧 [Hero] handleAgendarCitaClick llamado');
    console.log('🔧 [Hero] Usuario del contexto:', user);
    console.log('🔧 [Hero] isAuthenticated:', isAuthenticated());
    
    if (!user || !isAuthenticated()) {
      console.log('🔧 [Hero] Usuario no autenticado, redirigiendo al login');
      localStorage.setItem('postLoginRedirect', window.location.pathname);
      await alertService.warning(
        "¡Atención!",
        "Debes estar logueado para realizar esta opción.",
        { confirmButtonText: "Entiendo", showCancelButton: false }
      );
      navigate('/login');
      return;
    }

    // Verificar si es administrador
    if (user.role && user.role.toLowerCase() === 'administrador') {
      await alertService.warning(
        "¡Atención!",
        "Esta acción solo está disponible para clientes.",
        { confirmButtonText: "Entiendo", showCancelButton: false }
      );
      return;
    }

    console.log('🔧 [Hero] Usuario autenticado como cliente, abriendo modal de cita');
    setModalCitaOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans pt-5">
      {/* Hero Section */}
      <header className="bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16 min-h-[420px]">
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl text-left title-primary bg-gradient-to-r from-[#083874] to-[#F3D273] bg-clip-text text-transparent mb-6">
              Certimarcas
            </h1>
            <p className="text-lg text-gray-700 mb-6 text-left text-body">
              ¿Tienes una gran idea? Nosotros la protegemos. En Registrack te
              ayudamos a registrar tu marca de forma fácil, rápida y sin enredos
              legales. ¡Haz que tu marca sea solo tuya, hoy!
            </p>
            <HeroFeatures />
            <div className="w-full text-left pt-2 flex flex-col sm:flex-row gap-3">
              <a href="#nosotros">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-md text-base hover:bg-blue-700 transition btn-text w-full sm:w-auto">
                  Conocer más
                </button>
              </a>
              <button
                className="bg-blue-50 text-blue-600 px-6 py-3 rounded-md text-base hover:bg-blue-100 border border-blue-200 transition btn-text w-full sm:w-auto"
                style={{ minWidth: 0 }}
                onClick={handleAgendarCitaClick}
              >
                No te quedes con dudas, agenda tu cita
              </button>
            </div>
          </div>
          <HeroVideo />
        </div>
      </header>

      {/* Quiénes somos Section */}
      <section className="bg-[#275FAA] py-16 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl title-primary mb-6 text-left text-[#275FAA]">
                  ¿Quiénes somos?
                </h2>
                <p className="text-base md:text-lg text-gray-700 mb-4 text-body">
                  En{" "}
                  <span className="text-body-medium text-[#275FAA]">Registrack</span>,
                  somos el equipo que te brinda la tranquilidad y la certeza de
                  tener tu marca protegida. Con más de 12 años de experiencia en
                  Propiedad Industrial, nos dedicamos a ser tu aliado estratégico en
                  Medellín y a nivel internacional.
                </p>
                <p className="text-base md:text-lg text-gray-700 mb-4 text-body">
                  Nos mueve tu éxito. Nos apasiona proteger la identidad de tu
                  negocio y asegurar su crecimiento. Elegirnos significa contar con
                  la experiencia, el rigor legal y el compromiso de un equipo que
                  valora tu marca tanto como tú.
                </p>
                <blockquote className="border-l-4 border-[#275FAA] pl-4 italic text-gray-600 bg-gray-50 py-3 rounded-r-lg text-body">
                  En Registrack, somos tu respaldo confiable.
                </blockquote>
              </div>
              <div className="flex justify-center">
                <img
                  src="/images/trato.jpeg"
                  alt="Asesoría personalizada"
                  className="w-full max-w-2xl h-auto object-contain animate-bounce-subtle"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiciosSection
        servicios={servicios}
        loading={loading}
        onSaberMas={handleSaberMas}
        onAdquirir={handleAdquirir}
      />

      {/* Modal */}
      {modalAbierto && servicioSeleccionado && (
        (() => {
          console.log('🔧 [Hero] Renderizando modal para servicio:', servicioSeleccionado.nombre);
          const FormularioComponente = FORMULARIOS_POR_SERVICIO[servicioSeleccionado.nombre];
          console.log('🔧 [Hero] FormularioComponente encontrado:', FormularioComponente);
          
          if (FormularioComponente) {
            return (
              <FormularioComponente
                isOpen={modalAbierto}
                onClose={cerrarModal}
                onGuardar={handleGuardarOrden}
              />
            );
          } else {
            console.error('🔧 [Hero] No se encontró formulario para:', servicioSeleccionado.nombre);
            return null;
          }
        })()
      )}
      <ModalAgendarCita isOpen={modalCitaOpen} onClose={() => setModalCitaOpen(false)} />
      
      {/* Modal de Servicio */}
      <ServiceModal
        isOpen={serviceModalOpen}
        onClose={() => {
          setServiceModalOpen(false);
          setSelectedService(null);
        }}
        servicio={selectedService}
      />
    </div>
  );
};

export default Hero;