import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserPlus,
  FaSignInAlt,
  FaShoppingCart,
  FaEye,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaHome,
  FaUser,
  FaCreditCard,
  FaFileAlt,
  FaClock,
  FaQuestionCircle,
  FaPlay
} from 'react-icons/fa';
import TutorialModal from '../components/TutorialModal';
import LandingNavbar from '../components/landingNavbar';
import Footer from '../components/footer';
import ScrollToTopButton from '../components/ScrollToTopButton';

const Ayuda = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tutorialSteps = [
    {
      id: 'registro',
      title: 'Registro de Usuario',
      icon: <FaUserPlus className="text-blue-600" />,
      steps: [
        {
          step: 1,
          title: 'Acceder al formulario',
          description: 'Haz clic en "Regístrate" en la barra de navegación',
          image: '/images/registrarseboton.png',
          tip: 'Asegúrate de estar en la página principal para encontrar el botón de registro.'
        },
        {
          step: 2,
          title: 'Completar información personal',
          description: 'Llena todos los campos requeridos: nombre, email, contraseña',
          image: '/images/Registrousuarionuevo.png',
          tip: 'Usa una contraseña segura con al menos 8 caracteres, Puede incluir mayúsculas, minúsculas y números.'
        },
        {
          step: 3,
          title: 'Confirmación de registro',
          description: 'Haz clic en el botón "Registrarse". Verás una alerta de éxito y serás redirigido al inicio de sesión.',
          image: '/images/Registrousuarionuevolleno.png',
          tip: 'Espera unos segundos después de registrarte para que se complete la redirección automáticamente.'
        }

      ]
    },
    {
      id: 'login',
      title: 'Iniciar Sesión',
      icon: <FaSignInAlt className="text-green-600" />,
      steps: [
        {
          step: 1,
          title: 'Acceder al login',
          description: 'Haz clic en "Iniciar Sesión" en la barra de navegación',
          image: '/images/iniciarsesionboton.png',
          tip: 'Si no tienes cuenta, primero regístrate usando el botón "Regístrate".'
        },
        {
          step: 2,
          title: 'Ingresar credenciales',
          description: 'Introduce tu email y contraseña registrados',
          image: '/images/llenarcredenciales.png',
          tip: 'Si olvidaste tu contraseña, usa la opción "¿Olvidaste tu contraseña?" para recuperarla.'
        },
        {
          step: 3,
          title: 'Acceder al sistema ya logeado',
          description: 'Una vez autenticado, serás redirigido al panel principal y podras adquirir servicios',
          image: '/images/iniciarsesionclick.png',
          tip: 'Mantén tu sesión activa para evitar tener que volver a iniciar sesión frecuentemente.'
        }
      ]
    },
    {
      id: 'servicios',
      title: 'Adquirir Servicios',
      icon: <FaShoppingCart className="text-orange-600" />,
      steps: [
        {
          step: 1,
          title: 'Explorar servicios',
          description: 'Navega por la sección "Servicios" para ver las opciones disponibles. Cada servicio tiene dos botones: uno para adquirirlo directamente y otro para obtener más información.',
          image: '/images/servicios.PNG',
          tip: 'Si tienes dudas, haz clic en "Saber más" para ver una descripción detallada antes de iniciar el proceso.'
        },
        {
          step: 2,
          title: 'Seleccionar servicio',
          description: 'Elige el servicio que necesitas (búsqueda, renovación, oposición, etc.)',
          image: '/images/servicios.PNG',
          tip: 'Si no estás seguro, comienza con una búsqueda de disponibilidad de marca.'
        },
        {
          step: 3,
          title: 'Completar formulario',
          description: 'Llena el formulario con los datos de tu marca o solicitud',
          image: '/images/formularionuevo.png',
          tip: 'Ten preparados los documentos de tu marca (logo, descripción, etc.) antes de comenzar.'
        },
        {
          step: 4,
          title: 'Revisar y confirmar',
          description: 'Verifica toda la información ingresada antes de enviar la solicitud. Al confirmar, serás redirigido automáticamente a la pasarela de pago.',
          tip: 'Asegúrate de tener un método de pago disponible para completar el proceso sin interrupciones.'
        }

      ]
    },
    {
      id: 'seguimiento',
      title: 'Seguimiento de Procesos',
      icon: <FaEye className="text-purple-600" />,
      steps: [
        {
          step: 1,
          title: 'Acceder a mis procesos',
          description: 'Ve a "Mis procesos" en el menú principal',
          image: '/images/misprocesos.png',
          tip: 'Esta sección solo está disponible después de iniciar sesión.'
        },
        {
          step: 2,
          title: 'Ver estado actual',
          description: 'Consulta el estado de cada uno de tus servicios',
          image: '/images/estadosmisprocesos.PNG',
          tip: 'Los estados se actualizan automáticamente. Puedes ver el historial completo de cada proceso.'
        },
        {
          step: 3,
          title: 'Recibir actualizaciones',
          description: 'Recibe notificaciones sobre el progreso de tus solicitudes',
          image: '/images/actualizaciondeprocesos.PNG',
          tip: 'Recibiras alertas por email sobre actualizaciones importantes.'
        }
      ]
    }
  ];

  const faqData = [
    {
      question: '¿Cómo puedo recuperar mi contraseña?',
      answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de login. Recibirás un enlace por email para restablecer tu contraseña.'
    },
    {
      question: '¿Cuánto tiempo toma procesar una solicitud?',
      answer: 'Los tiempos varían según el tipo de servicio. Las búsquedas pueden tomar 2-3 días, mientras que renovaciones y oposiciones pueden tomar 1-2 semanas.'
    },
    {
      question: '¿Qué documentos necesito para registrar una marca?',
      answer: 'Necesitarás: 1) Logo de la marca en alta resolución, 2) Descripción detallada del producto/servicio, 3) Información del solicitante.'
    },
    {
      question: '¿Cómo sé si mi marca está disponible?',
      answer: 'Nuestro servicio de búsqueda verifica en la base de datos oficial si el nombre está disponible para registro.'
    }
  ];

  const handleTutorialClick = (tutorial) => {
    setSelectedTutorial(tutorial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTutorial(null);
  };

  const renderTutorialSection = (tutorial) => (
    <div key={tutorial.id} className="mb-12 bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="mr-4 text-3xl">
            {tutorial.icon}
          </div>
          <h3 className="text-2xl font-semibold text-[#275FAA]">{tutorial.title}</h3>
        </div>
        <button
          onClick={() => handleTutorialClick(tutorial)}
          className="flex items-center px-6 py-3 bg-[#275FAA] text-white rounded-lg hover:bg-[#163366] transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <FaPlay className="mr-2" size={16} />
          Ver Tutorial
        </button>
      </div>

      <div className="space-y-4">
        {tutorial.steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
            <div className="flex-shrink-0 w-10 h-10 bg-[#275FAA] text-white rounded-full flex items-center justify-center font-semibold">
              {step.step}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">{step.title}</h4>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
      <h3 className="text-2xl font-semibold text-[#275FAA] mb-8 flex items-center">
        <FaQuestionCircle className="mr-3 text-[#275FAA]" size={24} />
        Preguntas Frecuentes
      </h3>

      <div className="space-y-6">
        {faqData.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-800 mb-3 text-lg">{faq.question}</h4>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <Link
        to="/register"
        className="bg-gray-100 rounded-xl shadow-md transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center p-6 no-underline"
      >
        <FaUserPlus className="text-3xl mx-auto mb-4 text-[#275FAA]" />
        <h4 className="font-semibold text-[#275FAA] mb-2 no-underline">Registrarse</h4>
        <p className="text-gray-600 text-sm no-underline">Crea tu cuenta para acceder a todos los servicios</p>
      </Link>

      <Link
        to="/login"
        className="bg-gray-100 rounded-xl shadow-md transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center p-6 no-underline"
      >
        <FaSignInAlt className="text-3xl mx-auto mb-4 text-[#275FAA]" />
        <h4 className="font-semibold text-[#275FAA] mb-2 no-underline">Iniciar Sesión</h4>
        <p className="text-gray-600 text-sm no-underline">Accede a tu cuenta para gestionar tus procesos</p>
      </Link>

      <Link
        to="/#servicios"
        className="bg-gray-100 rounded-xl shadow-md transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center p-6 no-underline"
      >
        <FaShoppingCart className="text-3xl mx-auto mb-4 text-[#275FAA]" />
        <h4 className="font-semibold text-[#275FAA] mb-2 no-underline">Ver Servicios</h4>
        <p className="text-gray-600 text-sm no-underline">Explora todos los servicios disponibles</p>
      </Link>

      <Link
        to="/misprocesos"
        className="bg-gray-100 rounded-xl shadow-md transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl text-center p-6 no-underline"
      >
        <FaEye className="text-3xl mx-auto mb-4 text-[#275FAA]" />
        <h4 className="font-semibold text-[#275FAA] mb-2 no-underline">Mis Procesos</h4>
        <p className="text-gray-600 text-sm no-underline">Revisa el estado de tus solicitudes</p>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <LandingNavbar />
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-24 py-20 pt-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#083874] to-[#F3D273] bg-clip-text text-transparent mb-6 no-underline">
            Centro de Ayuda
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto no-underline">
            Aprende a usar nuestra plataforma paso a paso. Encuentra todo lo que necesitas para gestionar tus marcas y servicios de manera eficiente.
          </p>
        </div>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Tutorial Sections */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#275FAA]">
            Guía Completa de Uso
          </h2>

          {tutorialSteps.map(tutorial => renderTutorialSection(tutorial))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          {renderFAQ()}
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tutorialData={selectedTutorial}
      />
    </div>
  );
};

export default Ayuda; 