// Hero.jsx
import React, { useState, useEffect } from "react";
import { FaBalanceScale, FaMedal, FaRocket, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { mockDataService } from "../../../utils/mockDataService.js";
import alertService from '../../../utils/alertService.js';
import { useAuth } from '../../../shared/contexts/authContext.jsx';
import { normalizeRole } from '../../../shared/utils/roleUtils.js';
import solicitudesApiService from '../../../features/dashboard/pages/gestionVentasServicios/services/solicitudesApiService.js';
import DemoPasarelaPagoModal from './DemoPasarelaPagoModal';

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
  "Respuesta a Oposición": FormularioRespuesta,
  // Variaciones de nombres para compatibilidad
  "Búsqueda de Marca": FormularioBusqueda,
  "Certificación": FormularioCertificacion,
  "Renovación": FormularioRenovacion,
  "Oposición": FormularioOposicion,
  "Oposición de Marca": FormularioOposicion,
  "Cesión": FormularioCesion,
  "Ampliación": FormularioAmpliacion,
  "Ampliación de Marca": FormularioAmpliacion,
  "Respuesta": FormularioRespuesta,
  "Respuesta de Oposición": FormularioRespuesta
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
const ServicioCard = ({ servicio, onSaberMas, onAdquirir, formularioDisponible }) => {
  console.log('🔧 [ServicioCard] Renderizando card para:', servicio.nombre, 'formularioDisponible:', formularioDisponible);
  
  const handleClickAdquirir = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔧 [ServicioCard] Click en "Adquirir Servicio" para:', servicio.nombre);
    console.log('🔧 [ServicioCard] formularioDisponible:', formularioDisponible);
    console.log('🔧 [ServicioCard] onAdquirir es función:', typeof onAdquirir === 'function');
    
    if (!formularioDisponible) {
      console.warn('⚠️ [ServicioCard] Formulario no disponible para:', servicio.nombre);
      return;
    }
    
    if (typeof onAdquirir === 'function') {
      console.log('✅ [ServicioCard] Llamando a onAdquirir...');
      onAdquirir(servicio);
    } else {
      console.error('❌ [ServicioCard] onAdquirir no es una función!');
    }
  };
  
  return (
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
            onClick={handleClickAdquirir}
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
};

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
        console.log('📋 [Hero] Nombres exactos de servicios:', serviciosVisibles.map(s => s.nombre));
        console.log('📋 [Hero] Claves disponibles en FORMULARIOS_POR_SERVICIO:', Object.keys(FORMULARIOS_POR_SERVICIO));
        
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
    console.log('🔧 [Hero] Nombre del servicio:', servicio.nombre);
    console.log('🔧 [Hero] Claves disponibles en FORMULARIOS_POR_SERVICIO:', Object.keys(FORMULARIOS_POR_SERVICIO));
    
    const FormularioComponente = FORMULARIOS_POR_SERVICIO[servicio.nombre];
    console.log('🔧 [Hero] FormularioComponente para', servicio.nombre, ':', FormularioComponente);

    if (!FormularioComponente) {
      console.error('❌ [Hero] No se encontró formulario para:', servicio.nombre);
      console.error('❌ [Hero] Servicios disponibles:', Object.keys(FORMULARIOS_POR_SERVICIO));
      alertService.error("Error", `No se encontró formulario para el servicio "${servicio.nombre}". Por favor, contacta al administrador.`);
      return false;
    }

    console.log('✅ [Hero] Formulario encontrado, abriendo modal...');
    setServicioSeleccionado(servicio);
    setTituloModal(`Solicitud de ${servicio.nombre}`);
    setModalAbierto(true);
    console.log('✅ [Hero] Estado del modal actualizado: modalAbierto = true');
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

  // ✅ NUEVO: Estados para manejo de pago
  const [solicitudCreada, setSolicitudCreada] = useState(null);
  const [mostrarPasarela, setMostrarPasarela] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  // ✅ Función auxiliar para convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      if (typeof file === 'string') return resolve(file); // Ya es Base64
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(new Error(`El archivo ${file.name} excede el tamaño máximo de 5MB`));
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`El archivo ${file.name} debe ser PDF, JPG o PNG`));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleGuardarOrden = async (formData) => {
    try {
      console.log('🔧 [Hero] ========== INICIO handleGuardarOrden ==========');
      console.log('🔧 [Hero] FormData recibido:', formData);
      console.log('🔧 [Hero] Keys del formData:', Object.keys(formData));
      
      if (!user) {
        await alertService.error("Error", "No se pudo obtener la información del usuario.");
        return;
      }
      
      console.log('🔧 [Hero] Usuario encontrado:', { id: user.id_usuario, nombre: user.nombre, rol: user.rol });

      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        await alertService.error("Error", "No hay sesión activa. Por favor, inicia sesión.");
        return;
      }

      // Obtener tipo de solicitud del servicio seleccionado
      const tipoSolicitud = servicioSeleccionado?.nombre || formData.tipoSolicitud;
      if (!tipoSolicitud) {
        await alertService.error("Error", "No se pudo determinar el tipo de solicitud.");
        return;
      }

      // ✅ Obtener servicio ID (debe ser numérico según la API)
      const servicioId = servicioSeleccionado?.id || servicioSeleccionado?.id_servicio;
      
      if (!servicioId) {
        await alertService.error("Error", "No se pudo obtener el ID del servicio. Por favor, selecciona el servicio nuevamente.");
        return;
      }

      console.log('🔧 [Hero] Tipo de solicitud:', tipoSolicitud);
      console.log('🔧 [Hero] Servicio ID:', servicioId);

      // ✅ Convertir archivos a base64 antes de enviar
      const formToSave = { ...formData };
      const fileFields = [
        'certificadoCamara',
        'certificadoCamaraComercio',
        'certificadoRenovacion',
        'logotipoMarca',
        'logotipo',
        'poderRepresentante',
        'poderAutorizacion',
        'documentoCesion',
        'documentosOposicion',
        'soportes',
      ];
      
      // Convertir todos los campos de archivo a base64
      for (const field of fileFields) {
        if (formToSave[field] instanceof File) {
          try {
            console.log("🔧 [Hero] Convirtiendo archivo:", field);
            formToSave[field] = await fileToBase64(formToSave[field]);
            console.log("✅ [Hero] Archivo convertido:", field);
          } catch (error) {
            console.error(`❌ [Hero] Error convirtiendo archivo ${field}:`, error);
            await alertService.error('Error', `Error al procesar el archivo ${field}: ${error.message}`);
            return;
          }
        }
      }
      
      // También verificar si hay otros campos que puedan ser archivos
      for (const [key, value] of Object.entries(formToSave)) {
        if (value instanceof File && !fileFields.includes(key)) {
          try {
            console.log("🔧 [Hero] Convirtiendo archivo adicional:", key);
            formToSave[key] = await fileToBase64(value);
          } catch (error) {
            console.error(`❌ [Hero] Error convirtiendo archivo adicional ${key}:`, error);
            await alertService.error('Error', `Error al procesar el archivo ${key}: ${error.message}`);
            return;
          }
        }
      }

      // Obtener rol del usuario (debe ser cliente desde la landing)
      const userRole = normalizeRole(user.rol || user.role || '');

      // Transformar datos del formulario al formato de la API
      console.log('🔧 [Hero] Transformando datos para API...');
      console.log('🔧 [Hero] formToSave:', formToSave);
      console.log('🔧 [Hero] tipoSolicitud:', tipoSolicitud);
      console.log('🔧 [Hero] userRole:', userRole);
      
      const { servicioAPI, datosAPI } = await solicitudesApiService.transformarDatosParaAPI(
        formToSave,
        tipoSolicitud,
        userRole
      );

      console.log('✅ [Hero] Transformación completada:');
      console.log('  - servicioAPI:', servicioAPI);
      console.log('  - datosAPI keys:', Object.keys(datosAPI));
      console.log('  - datosAPI completo:', datosAPI);

      // ✅ Crear solicitud usando la API real con el ID del servicio (no el nombre)
      const resultado = await solicitudesApiService.crearSolicitud(
        servicioId, // ✅ Usar ID numérico del servicio
        datosAPI,
        token
      );

      console.log('✅ [Hero] Solicitud creada exitosamente:', resultado);

      // Manejar respuesta diferenciada
      const data = resultado.data || resultado;
      const requierePago = data.requiere_pago === true;
      const estado = data.estado || resultado.estado;
      const ordenId = data.orden_id || data.id || resultado.orden_id || resultado.id;
      const montoAPagar = data.monto_a_pagar || null;

      // Si requiere pago, mostrar pasarela
      if (requierePago && ordenId) {
        setSolicitudCreada({
          orden_id: ordenId,
          estado: estado,
          monto_a_pagar: montoAPagar,
          servicio: servicioAPI
        });
        
        await alertService.info(
          'Solicitud Creada - Pendiente de Pago',
          `Tu solicitud ha sido creada con estado "Pendiente de Pago". Debes procesar el pago de $${montoAPagar?.toLocaleString('es-CO') || 'N/A'} para activarla.`
        );
        
        // Mostrar pasarela de pago
        setMostrarPasarela(true);
      } else {
        // Solicitud activada automáticamente
        await alertService.success(
          'Solicitud Creada y Activada',
          'Tu solicitud ha sido creada exitosamente y está en proceso. Se han enviado notificaciones por email.'
        );
        
        cerrarModal();
        
        // Recargar página o navegar a Mis Procesos
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('❌ [Hero] Error al guardar la orden:', error);
      
      // ✅ Backend mejorado: extraer mensaje de error estructurado
      let errorMessage = error.message || 'Error desconocido';
      
      // Si el error viene del backend con estructura mejorada
      if (error.response?.data) {
        const errorData = error.response.data;
        // Priorizar mensaje del backend mejorado
        errorMessage = errorData.mensaje || 
                      errorData.message || 
                      errorData.error?.message || 
                      errorMessage;
        
        // Agregar detalles si están disponibles (backend mejorado los proporciona)
        if (errorData.error?.details) {
          const detalles = errorData.error.details;
          if (typeof detalles === 'object' && detalles.message) {
            errorMessage += `\n\n${detalles.message}`;
          }
        }
        
        // Agregar campos faltantes si están disponibles
        if (errorData.camposFaltantes && errorData.camposFaltantes.length > 0) {
          errorMessage += `\n\nCampos faltantes: ${errorData.camposFaltantes.join(', ')}`;
        }
      }
      
      let detailedMessage = `No se pudo crear la solicitud: ${errorMessage}`;
      
      // Mensajes más específicos según el tipo de error
      if (errorMessage.includes('validación') || errorMessage.includes('validation') || errorMessage.includes('Campos faltantes')) {
        detailedMessage = `Error de validación: ${errorMessage}\n\nPor favor, verifica que todos los campos requeridos estén completos y sean válidos.`;
      } else if (errorMessage.includes('token') || errorMessage.includes('autenticación') || errorMessage.includes('unauthorized')) {
        detailedMessage = 'Error de autenticación: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (errorMessage.includes('payload') || errorMessage.includes('too large')) {
        detailedMessage = `Error: El tamaño de los archivos es demasiado grande. Por favor, reduce el tamaño de las imágenes o documentos.`;
      } else if (errorMessage.includes('Data too long for column') || errorMessage.includes('ER_DATA_TOO_LONG') || errorMessage.includes('DatabaseError')) {
        // Error de base de datos - las columnas son demasiado pequeñas
        detailedMessage = `🚨 ERROR CRÍTICO DE BASE DE DATOS\n\n${errorMessage}\n\n⚠️ PROBLEMA:\nLas columnas de la base de datos son demasiado pequeñas (VARCHAR) para almacenar archivos Base64 grandes.\n\n✅ SOLUCIÓN:\nEl equipo de backend debe cambiar las columnas de archivos a tipo LONGTEXT.\n\n📋 Columnas que necesitan cambio:\n- logotipo\n- poder_autorizacion\n- certificado_camara_comercio\n- poderparaelregistrodelamarca\n- poderdelrepresentanteautorizado\n- certificado_renovacion\n- documento_cesion\n- soportes\n\n💡 Ver archivo: INSTRUCCIONES_BACKEND_COLUMNAS_ARCHIVOS.md para solución completa.`;
      }
      
      await alertService.error(
        "Error",
        detailedMessage,
        { confirmButtonText: "Entendido" }
      );
    }
  };

  // ✅ NUEVO: Procesar pago y activar solicitud
  const handleProcesarPago = async () => {
    if (!solicitudCreada || !solicitudCreada.orden_id) {
      await alertService.error('Error', 'No hay una solicitud pendiente de pago.');
      return;
    }

    setProcesandoPago(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await alertService.error('Error', 'No hay sesión activa. Por favor, inicia sesión.');
        setProcesandoPago(false);
        return;
      }
      
      // Importar API_CONFIG
      const API_CONFIG = await import('../../../shared/config/apiConfig.js');
      const baseURL = API_CONFIG.default?.BASE_URL || API_CONFIG.BASE_URL || (import.meta.env.DEV ? '' : 'https://api-registrack-2.onrender.com');

      // ✅ Llamar al endpoint de procesamiento de pago con los parámetros correctos
      const response = await fetch(`${baseURL}/api/gestion-pagos/process-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_orden_servicio: solicitudCreada.orden_id, // ✅ Campo correcto según API
          monto: solicitudCreada.monto_a_pagar,
          metodo_pago: 'Tarjeta' // ✅ Valor esperado por la API
        })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.mensaje || resultado.message || 'Error al procesar el pago');
      }

      console.log("✅ [Hero] Respuesta del pago:", resultado);

      // ✅ Verificar si la solicitud fue activada según la estructura de respuesta de la API
      const solicitudActivada = resultado.data?.solicitud_activada || resultado.solicitud_activada;
      
      if (solicitudActivada === true) {
        console.log("✅ [Hero] Pago procesado y solicitud activada:", resultado);
        
        await alertService.success(
          'Pago Procesado Exitosamente',
          'Tu solicitud ha sido activada y está en proceso. Se han enviado notificaciones por email.'
        );

        // Cerrar pasarela
        setMostrarPasarela(false);
        setSolicitudCreada(null);
        cerrarModal();

        // Recargar página después de un breve delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.warn("⚠️ [Hero] Pago procesado pero solicitud no activada:", resultado);
        throw new Error('El pago fue procesado, pero la solicitud no se activó automáticamente. Por favor, contacta al administrador.');
      }
    } catch (err) {
      console.error("❌ [Hero] Error al procesar pago:", err);
      const errorMessage = err.message || err.response?.data?.mensaje || err.response?.data?.message || 'Error desconocido';
      await alertService.error(
        "Error al procesar pago",
        `No se pudo procesar el pago: ${errorMessage}. Por favor, intenta de nuevo o contacta al soporte.`
      );
    } finally {
      setProcesandoPago(false);
    }
  };

  const handleAdquirir = async (servicio) => {
    console.log('🔧 [Hero] handleAdquirir llamado con servicio:', servicio);
    console.log('🔧 [Hero] Nombre del servicio:', servicio?.nombre);
    console.log('🔧 [Hero] Usuario actual:', user);
    
    // user ya está disponible desde useAuth

    if (!user) {
      console.log('⚠️ [Hero] Usuario no autenticado, redirigiendo al login');
      localStorage.setItem('postLoginRedirect', window.location.pathname);
      await alertService.warning(
        "¡Atención!",
        "Debes estar logueado para realizar esta opción.",
        { confirmButtonText: "Entiendo", showCancelButton: false }
      );
      navigate('/login');
      return;
    }

    // Verificar si el usuario es admin o administrador
    const userRole = normalizeRole(user.rol || user.role || '');
    console.log('🔧 [Hero] Rol normalizado del usuario:', userRole);
    
    if (userRole === 'admin' || userRole === 'administrador') {
      console.log('⚠️ [Hero] Usuario es admin/administrador, no puede adquirir servicios');
      await alertService.warning(
        "¡Atención!",
        "Esta acción solo está disponible para clientes.",
        { confirmButtonText: "Entiendo", showCancelButton: false }
      );
      return;
    }

    console.log('✅ [Hero] Usuario válido, abriendo modal...');
    const resultado = abrirModal(servicio);
    console.log('🔧 [Hero] Resultado de abrirModal:', resultado);
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
    const userRole = normalizeRole(user.rol || user.role || '');
    if (userRole === 'admin' || userRole === 'administrador') {
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
          console.log('🔧 [Hero] modalAbierto:', modalAbierto);
          console.log('🔧 [Hero] servicioSeleccionado:', servicioSeleccionado);
          
          const FormularioComponente = FORMULARIOS_POR_SERVICIO[servicioSeleccionado.nombre];
          console.log('🔧 [Hero] FormularioComponente encontrado:', FormularioComponente);
          
          if (FormularioComponente) {
            console.log('✅ [Hero] Renderizando componente del formulario');
            return (
              <FormularioComponente
                isOpen={modalAbierto}
                onClose={cerrarModal}
                onGuardar={handleGuardarOrden}
                tipoSolicitud={servicioSeleccionado.nombre}
              />
            );
          } else {
            console.error('❌ [Hero] No se encontró formulario para:', servicioSeleccionado.nombre);
            console.error('❌ [Hero] Servicios disponibles:', Object.keys(FORMULARIOS_POR_SERVICIO));
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

      {/* ✅ NUEVO: Modal de Pasarela de Pago */}
      {mostrarPasarela && solicitudCreada && (
        <DemoPasarelaPagoModal
          isOpen={mostrarPasarela}
          onClose={() => {
            setMostrarPasarela(false);
            // No cerrar el modal de solicitud si el usuario cancela el pago
          }}
          monto={solicitudCreada.monto_a_pagar}
          datosPago={{
            orden_id: solicitudCreada.orden_id,
            servicio: solicitudCreada.servicio
          }}
          onPagoExitoso={handleProcesarPago}
        />
      )}
    </div>
  );
};

export default Hero;