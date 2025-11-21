import React, { useState, useEffect, useRef } from 'react';
import solicitudesApiService from '../services/solicitudesApiService';
import clientesApiService from '../../../services/clientesApiService';
import serviciosApiService from '../services/serviciosApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';
import { AlertService } from '../../../../../shared/styles/alertStandards.js';
import BaseModal from '../../../../../shared/components/BaseModal';
import { FilePlus } from 'lucide-react';
// Importar formularios específicos (compartidos con CrearSolicitud)
import FormularioBusqueda from '../../../../../shared/components/formularioBusqueda';
import FormularioCertificacion from '../../../../../shared/components/formularioCertificacion';
import FormularioRenovacion from '../../../../../shared/components/formularioRenovacion';
import FormularioOposicion from '../../../../../shared/components/formularioOposicion';
import FormularioCesion from '../../../../../shared/components/formularioCesiondeMarca';
import FormularioAmpliacion from '../../../../../shared/components/formularioAmpliacion';
import FormularioRespuesta from '../../../../../shared/components/formularioRespuesta';

/**
 * ⚠️ COMPONENTE EXCLUSIVO PARA ADMINISTRADORES Y EMPLEADOS
 * 
 * Este componente permite crear solicitudes como administrador/empleado.
 * Diferencias clave con CrearSolicitud (cliente):
 * - Requiere seleccionar un cliente (id_cliente obligatorio)
 * - NO muestra pasarela de pago
 * - La solicitud se activa automáticamente al crearse
 * - Estado inicial: Primer proceso activo del servicio
 * 
 * NO usar este componente para clientes. Usar CrearSolicitud.jsx en su lugar.
 */

// Mapeo de formularios por servicio (compartido con CrearSolicitud)
const FORMULARIOS_POR_SERVICIO = {
  'Búsqueda de Antecedentes': FormularioBusqueda,
  'Certificación de Marca': FormularioCertificacion,
  'Renovación de Marca': FormularioRenovacion,
  'Presentación de Oposición': FormularioOposicion,
  'Cesión de Marca': FormularioCesion,
  'Ampliación de Alcance': FormularioAmpliacion,
  'Respuesta a Oposición': FormularioRespuesta,
};

const CrearSolicitudAdmin = ({ isOpen, onClose, onGuardar, tipoSolicitud, servicioId }) => {
  const { getToken, user } = useAuth();
  
  // Estados del formulario
  const [form, setForm] = useState({
    tipoSolicitante: '',
    tipoPersona: '',
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    tipoEntidad: '',
    razonSocial: '',
    nombreEmpresa: '',
    nit: '',
    pais: '',
    nitMarca: '',
    nombreMarca: '',
    categoria: '',
    clases: [{ numero: '', descripcion: '' }],
    certificadoCamara: null,
    logotipoMarca: null,
    poderRepresentante: null,
    poderAutorizacion: null,
    fechaSolicitud: new Date().toISOString().split('T')[0],
    estado: 'En revisión',
    tipoSolicitud: tipoSolicitud,
    encargado: 'Sin asignar',
    proximaCita: null,
    comentarios: []
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null); // Referencia al formulario para hacer submit desde el footer
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el envío

  // Estados para selector de cliente (OBLIGATORIO para admin/empleado)
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Para mostrar info del cliente

  // Determinar qué formulario renderizar
  const FormularioComponente = FORMULARIOS_POR_SERVICIO[tipoSolicitud];

  // Cargar clientes cuando el modal se abre
  useEffect(() => {
    const cargarClientes = async () => {
      if (isOpen) {
        try {
          setCargandoClientes(true);
          console.log('🔧 [CrearSolicitudAdmin] Cargando clientes...');
          const clientesData = await clientesApiService.getAllClientes();
          setClientes(clientesData || []);
          console.log('✅ [CrearSolicitudAdmin] Clientes cargados:', clientesData?.length || 0);
        } catch (error) {
          console.error('❌ [CrearSolicitudAdmin] Error al cargar clientes:', error);
          AlertService.error('Error', 'No se pudieron cargar los clientes. Intenta de nuevo.');
        } finally {
          setCargandoClientes(false);
        }
      } else {
        // Limpiar al cerrar el modal
        setClientes([]);
        setIdClienteSeleccionado('');
        setClienteSeleccionado(null);
        setForm({
          tipoSolicitante: '',
          tipoPersona: '',
          tipoDocumento: '',
          numeroDocumento: '',
          nombres: '',
          apellidos: '',
          email: '',
          telefono: '',
          direccion: '',
          ciudad: '',
          codigoPostal: '',
          tipoEntidad: '',
          razonSocial: '',
          nombreEmpresa: '',
          nit: '',
          pais: '',
          nitMarca: '',
          nombreMarca: '',
          categoria: '',
          clases: [{ numero: '', descripcion: '' }],
          certificadoCamara: null,
          logotipoMarca: null,
          poderRepresentante: null,
          poderAutorizacion: null,
          fechaSolicitud: new Date().toISOString().split('T')[0],
          estado: 'En revisión',
          tipoSolicitud: tipoSolicitud,
          encargado: 'Sin asignar',
          proximaCita: null,
          comentarios: []
        });
        setErrors({});
      }
    };

    cargarClientes();
  }, [isOpen, tipoSolicitud]);

  // Actualizar cliente seleccionado cuando cambia el selector
  useEffect(() => {
    if (idClienteSeleccionado && clientes.length > 0) {
      const cliente = clientes.find(c => {
        const idCliente = c.id_cliente || c.id;
        return idCliente.toString() === idClienteSeleccionado.toString();
      });
      setClienteSeleccionado(cliente || null);
      
      // Pre-llenar datos del cliente si está disponible
      if (cliente) {
        setForm(prev => ({
          ...prev,
          nombres: cliente.nombre || prev.nombres,
          apellidos: cliente.apellido || prev.apellidos,
          email: cliente.email || prev.email,
          telefono: cliente.telefono || prev.telefono,
          direccion: cliente.direccion || prev.direccion,
          ciudad: cliente.ciudad || prev.ciudad,
          tipoDocumento: cliente.tipoDocumento || cliente.tipo_documento || prev.tipoDocumento,
          numeroDocumento: cliente.documento || cliente.numeroDocumento || prev.numeroDocumento,
          tipoPersona: cliente.tipoPersona || cliente.tipo_persona || prev.tipoPersona,
        }));
      }
    } else {
      setClienteSeleccionado(null);
    }
  }, [idClienteSeleccionado, clientes]);

  // Función para convertir archivo a base64 con validación
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Validar tamaño (máx 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        reject(new Error(`El archivo ${file.name} excede el tamaño máximo de 5MB`));
        return;
      }

      // Validar formato (PDF, JPG, PNG)
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

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para manejar cambios en las clases
  const handleClaseChange = (index, field, value) => {
    const nuevasClases = [...form.clases];
    nuevasClases[index][field] = value;
    setForm(prev => ({ ...prev, clases: nuevasClases }));
  };

  // Función para agregar una nueva clase
  const addClase = () => {
    setForm(prev => ({
      ...prev,
      clases: [...prev.clases, { numero: '', descripcion: '' }]
    }));
  };

  // Función para eliminar una clase
  const removeClase = (index) => {
    if (form.clases.length > 1) {
      const nuevasClases = form.clases.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, clases: nuevasClases }));
    }
  };

  // Función de validación
  const validate = () => {
    const newErrors = {};
    
    console.log("🔧 [CrearSolicitudAdmin] Validando form:", form);
    
    // ✅ VALIDACIÓN CRÍTICA: id_cliente es OBLIGATORIO para admin/empleado
    if (!idClienteSeleccionado || idClienteSeleccionado === '') {
      newErrors.id_cliente = 'Debes seleccionar un cliente para crear la solicitud';
    }
    
    // ✅ Validación específica según el tipo de servicio
    // "Búsqueda de Antecedentes" NO tiene tipoSolicitante, solo campos básicos
    if (tipoSolicitud === 'Búsqueda de Antecedentes') {
      // Función auxiliar para validar campos (maneja strings y números)
      const isEmpty = (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'number') return false; // Los números siempre son válidos si existen
        if (typeof value === 'string') return value.trim() === '';
        return !value;
      };
      
      // Validar campos requeridos para Búsqueda de Antecedentes
      if (isEmpty(form.tipoDocumento)) {
        newErrors.tipoDocumento = 'El tipo de documento es requerido';
      }
      if (!form.numeroDocumento || (typeof form.numeroDocumento === 'string' && form.numeroDocumento.trim() === '')) {
        newErrors.numeroDocumento = 'El número de documento es requerido';
      }
      if (isEmpty(form.nombres)) {
        newErrors.nombres = 'Los nombres son requeridos';
      }
      if (isEmpty(form.apellidos)) {
        newErrors.apellidos = 'Los apellidos son requeridos';
      }
      if (isEmpty(form.email)) {
        newErrors.email = 'El email es requerido';
      }
      if (isEmpty(form.telefono)) {
        newErrors.telefono = 'El teléfono es requerido';
      }
      if (isEmpty(form.direccion)) {
        newErrors.direccion = 'La dirección es requerida';
      }
      if (isEmpty(form.pais)) {
        newErrors.pais = 'El país es requerido';
      }
      if (isEmpty(form.nombreMarca)) {
        newErrors.nombreMarca = 'El nombre a buscar (marca) es requerido';
      }
      if (isEmpty(form.tipoProductoServicio)) {
        newErrors.tipoProductoServicio = 'El tipo de producto/servicio es requerido';
      }
      if (!form.logotipoMarca) {
        newErrors.logotipoMarca = 'El logotipo de la marca es requerido';
      }
    } else {
      // Para otros servicios (Certificación, Renovación, etc.), validar tipoSolicitante
      if (!form.tipoSolicitante || form.tipoSolicitante.trim() === '') {
        newErrors.tipoSolicitante = 'El tipo de solicitante es requerido';
      }
      if (!form.email || form.email.trim() === '') {
        newErrors.email = 'El email es requerido';
      }
      if (!form.nombreMarca || form.nombreMarca.trim() === '') {
        newErrors.nombreMarca = 'El nombre de la marca es requerido';
      }
      
      // Función auxiliar para validar campos (maneja strings y números)
      const isEmpty = (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'number') return false; // Los números siempre son válidos si existen
        if (typeof value === 'string') return value.trim() === '';
        return !value;
      };
      
      // Validar campos condicionales según el tipo de solicitante
      if (form.tipoSolicitante === 'Titular') {
        if (isEmpty(form.tipoPersona)) {
          newErrors.tipoPersona = 'El tipo de persona es requerido';
        }
        if (form.tipoPersona === 'Natural') {
          if (isEmpty(form.tipoDocumento)) {
            newErrors.tipoDocumento = 'El tipo de documento es requerido';
          }
          if (!form.numeroDocumento || (typeof form.numeroDocumento === 'string' && form.numeroDocumento.trim() === '')) {
            newErrors.numeroDocumento = 'El número de documento es requerido';
          }
          if (isEmpty(form.nombres)) {
            newErrors.nombres = 'Los nombres son requeridos';
          }
          if (isEmpty(form.apellidos)) {
            newErrors.apellidos = 'Los apellidos son requeridos';
          }
        } else if (form.tipoPersona === 'Jurídica') {
          if (isEmpty(form.nombreEmpresa)) {
            newErrors.nombreEmpresa = 'El nombre de la empresa es requerido';
          }
          if (isEmpty(form.nit)) {
            newErrors.nit = 'El NIT es requerido';
          }
        }
      } else if (form.tipoSolicitante === 'Representante Autorizado') {
        if (isEmpty(form.tipoDocumento)) {
          newErrors.tipoDocumento = 'El tipo de documento es requerido';
        }
        if (!form.numeroDocumento || (typeof form.numeroDocumento === 'string' && form.numeroDocumento.trim() === '')) {
          newErrors.numeroDocumento = 'El número de documento es requerido';
        }
        if (isEmpty(form.nombres)) {
          newErrors.nombres = 'Los nombres son requeridos';
        }
        if (isEmpty(form.apellidos)) {
          newErrors.apellidos = 'Los apellidos son requeridos';
        }
      }
    }
    
    console.log("🔧 [CrearSolicitudAdmin] Errores generados:", newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    // ✅ CRÍTICO: Prevenir comportamiento por defecto del formulario
    e.preventDefault();
    e.stopPropagation();
    
    // Prevenir múltiples envíos
    if (isSubmitting) {
      console.log("🔧 [CrearSolicitudAdmin] Ya se está enviando, ignorando...");
      return;
    }
    
    console.log("🔧 [CrearSolicitudAdmin] handleSubmit iniciado");
    
    setIsSubmitting(true);
    
    const newErrors = validate();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log("🔧 [CrearSolicitudAdmin] Errores de validación:", newErrors);
      setIsSubmitting(false);
      // Mostrar alerta si falta el cliente (error crítico)
      if (newErrors.id_cliente) {
        AlertService.error('Cliente requerido', newErrors.id_cliente);
      }
      return;
    }
    
    console.log("🔧 [CrearSolicitudAdmin] Validación exitosa");
    
    try {
      // Obtener token
      const token = getToken();
      if (!token) {
        AlertService.error('Error', 'No hay sesión activa. Por favor, inicia sesión.');
        return;
      }

      const userRole = user?.rol || user?.role || 'administrador';
      console.log("🔧 [CrearSolicitudAdmin] Token obtenido, rol del usuario:", userRole);

      // Convertir archivos a base64 antes de enviar
      const formToSave = { ...form };
      
      // Lista completa de campos de archivo según todos los formularios
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
            console.log("🔧 [CrearSolicitudAdmin] Convirtiendo archivo:", field);
            formToSave[field] = await fileToBase64(formToSave[field]);
            console.log("✅ [CrearSolicitudAdmin] Archivo convertido:", field);
          } catch (error) {
            console.error(`❌ [CrearSolicitudAdmin] Error convirtiendo archivo ${field}:`, error);
            AlertService.error('Error', `Error al procesar el archivo ${field}: ${error.message}`);
            return;
          }
        }
      }
      
      // También verificar si hay otros campos que puedan ser archivos (búsqueda dinámica)
      for (const [key, value] of Object.entries(formToSave)) {
        if (value instanceof File && !fileFields.includes(key)) {
          try {
            console.log("🔧 [CrearSolicitudAdmin] Convirtiendo archivo adicional:", key);
            formToSave[key] = await fileToBase64(value);
          } catch (error) {
            console.error(`❌ [CrearSolicitudAdmin] Error convirtiendo archivo adicional ${key}:`, error);
            AlertService.error('Error', `Error al procesar el archivo ${key}: ${error.message}`);
            return;
          }
        }
      }

      // ✅ OBLIGATORIO: Agregar id_cliente para admin/empleado
      if (!idClienteSeleccionado || idClienteSeleccionado === '') {
        AlertService.error('Error', 'Se requiere seleccionar un cliente. Por favor, selecciona un cliente de la lista.');
        setErrors(prev => ({ ...prev, id_cliente: 'Cliente requerido' }));
        return;
      }
      
      formToSave.id_cliente = parseInt(idClienteSeleccionado); // Asegurar que sea número
      console.log("🔧 [CrearSolicitudAdmin] Agregando id_cliente:", formToSave.id_cliente);

      // Transformar datos del formulario al formato de la API
      const { servicioAPI, datosAPI } = await solicitudesApiService.transformarDatosParaAPI(
        formToSave,
        tipoSolicitud,
        userRole
      );

      console.log("🔧 [CrearSolicitudAdmin] Servicio API (nombre):", servicioAPI);
      console.log("🔧 [CrearSolicitudAdmin] Datos transformados para API:", datosAPI);

      // ✅ Obtener el ID del servicio basado en el nombre
      console.log("🔧 [CrearSolicitudAdmin] Obteniendo servicios para buscar ID...");
      const servicios = await serviciosApiService.getServicios();
      console.log("🔧 [CrearSolicitudAdmin] Servicios obtenidos:", servicios.length);
      
      // Buscar el servicio por nombre (normalizar para comparación)
      const normalizarNombre = (nombre) => nombre.toLowerCase().trim();
      const servicioEncontrado = servicios.find(s => {
        const nombreServicio = s.nombre || s.nombre_servicio || '';
        return normalizarNombre(nombreServicio) === normalizarNombre(servicioAPI) ||
               normalizarNombre(nombreServicio) === normalizarNombre(tipoSolicitud);
      });
      
      if (!servicioEncontrado) {
        console.error("❌ [CrearSolicitudAdmin] No se encontró el servicio:", servicioAPI);
        console.error("❌ [CrearSolicitudAdmin] Servicios disponibles:", servicios.map(s => ({ id: s.id, nombre: s.nombre })));
        AlertService.error('Error', `No se pudo encontrar el servicio "${servicioAPI}". Por favor, verifica que el servicio existe.`);
        return;
      }
      
      const servicioId = parseInt(servicioEncontrado.id || servicioEncontrado.id_servicio);
      console.log("✅ [CrearSolicitudAdmin] ID del servicio encontrado:", servicioId, "para:", servicioEncontrado.nombre);

      // Crear solicitud usando la API real con el ID del servicio
      const resultado = await solicitudesApiService.crearSolicitud(
        servicioId,
        datosAPI,
        token
      );

      console.log("✅ [CrearSolicitudAdmin] Solicitud creada exitosamente:", resultado);

      // ✅ Manejar respuesta: Admin/Empleado - La solicitud se activa automáticamente
      const data = resultado.data || resultado;
      const estado = data.estado || resultado.estado || 'Solicitud Recibida';
      
      AlertService.success(
        'Solicitud Creada y Activada', 
        `La solicitud ha sido creada exitosamente y activada automáticamente con estado "${estado}". El cliente ha sido notificado por email.`
      );

      // Llamar a onGuardar con el resultado de la API (solo refrescar datos)
      if (onGuardar) {
        console.log("🔧 [CrearSolicitudAdmin] Llamando a onGuardar con resultado:", resultado);
        try {
          await onGuardar(resultado);
        } catch (guardarError) {
          console.error("❌ [CrearSolicitudAdmin] Error en onGuardar:", guardarError);
          // No mostrar error aquí, solo loguear, porque la solicitud ya se creó exitosamente
        }
      }

      // Cerrar el modal después de un pequeño delay para asegurar que todo se procesó
      setTimeout(() => {
        if (onClose) {
          console.log("🔧 [CrearSolicitudAdmin] Cerrando modal...");
          onClose();
        }
      }, 100);

    } catch (err) {
      console.error("❌ [CrearSolicitudAdmin] Error al guardar:", err);
      console.error("❌ [CrearSolicitudAdmin] Stack trace:", err.stack);
      
      const errorMessage = err.message || err.response?.data?.mensaje || err.response?.data?.message || 'Error desconocido';
      let detailedMessage = `No se pudo crear la solicitud: ${errorMessage}`;
      
      // Mensajes más específicos según el tipo de error
      if (errorMessage.includes('id_cliente')) {
        detailedMessage = 'Error: Se requiere seleccionar un cliente válido. Por favor, selecciona un cliente de la lista.';
      } else if (errorMessage.includes('validación') || errorMessage.includes('validation')) {
        detailedMessage = `Error de validación: ${errorMessage}. Por favor, verifica que todos los campos requeridos estén completos y sean válidos.`;
      } else if (errorMessage.includes('token') || errorMessage.includes('autenticación')) {
        detailedMessage = 'Error de autenticación: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }
      
      AlertService.error("Error al crear solicitud", detailedMessage);
      
      // ✅ IMPORTANTE: No propagar el error para evitar refresh del navegador
      return;
    }
  };

  // Determinar si se debe mostrar el formulario (solo después de seleccionar cliente)
  const mostrarFormulario = idClienteSeleccionado && !cargandoClientes;

  // Función para manejar el cierre del modal con confirmación si hay datos
  const handleClose = () => {
    // Verificar si hay datos ingresados
    const hasData = idClienteSeleccionado || 
                    Object.values(form).some(value => {
                      if (Array.isArray(value)) return value.length > 0 && value.some(item => Object.values(item).some(v => v));
                      if (value && typeof value === 'object') return Object.keys(value).length > 0;
                      return value && value !== '';
                    });
    
    if (hasData && !isSubmitting) {
      AlertService.confirm(
        '¿Cerrar formulario?',
        'Tienes datos ingresados que se perderán. ¿Estás seguro de que deseas cerrar?',
        {
          confirmButtonText: 'Sí, cerrar',
          cancelButtonText: 'Cancelar'
        }
      ).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  // Función para manejar el submit desde el footer
  const handleSubmitFromFooter = (e) => {
    e.preventDefault();
    if (formRef.current && !isSubmitting) {
      formRef.current.requestSubmit();
    }
  };

  // Preparar acciones del footer
  const footerActions = mostrarFormulario && FormularioComponente ? [
    {
      label: "Cancelar",
      onClick: handleClose,
      variant: "secondary",
      disabled: isSubmitting
    },
    {
      label: isSubmitting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creando...
        </span>
      ) : "Crear Solicitud",
      onClick: handleSubmitFromFooter,
      variant: "primary",
      disabled: isSubmitting
    }
  ] : [
    {
      label: "Cerrar",
      onClick: handleClose,
      variant: "secondary"
    }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Solicitud (Administrador)"
      headerGradient="blue"
      headerIcon={<FilePlus className="w-5 h-5 text-white" />}
      maxWidth="3xl"
      footerActions={footerActions}
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      {/* ✅ PASO 1: Selector de Cliente - OBLIGATORIO y PRIMERO */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Paso 1: Seleccionar Cliente <span className="text-red-500">*</span>
        </label>
        {cargandoClientes ? (
          <div className="flex items-center gap-2 text-blue-600 py-4">
            <i className="bi bi-arrow-repeat animate-spin text-xl"></i>
            <span className="text-sm">Cargando clientes...</span>
          </div>
        ) : (
          <>
            <select
              value={idClienteSeleccionado}
              onChange={(e) => {
                setIdClienteSeleccionado(e.target.value);
                // Limpiar error cuando se selecciona un cliente
                if (errors.id_cliente) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.id_cliente;
                    return newErrors;
                  });
                }
              }}
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                errors.id_cliente 
                  ? 'border-red-400 focus:ring-red-300' 
                  : !idClienteSeleccionado 
                    ? 'border-yellow-400' 
                    : 'border-gray-300'
              }`}
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => {
                const nombreCompleto = cliente.nombreCompleto || 
                  `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() ||
                  cliente.nombre || 
                  cliente.razonSocial || 
                  `Cliente #${cliente.id_cliente || cliente.id}`;
                const idCliente = cliente.id_cliente || cliente.id;
                return (
                  <option key={idCliente} value={idCliente}>
                    {nombreCompleto} {cliente.email ? `(${cliente.email})` : ''}
                  </option>
                );
              })}
            </select>
            {errors.id_cliente && (
              <p className="text-red-600 text-xs mt-1">{errors.id_cliente}</p>
            )}
            
            {/* Mostrar información del cliente seleccionado */}
            {clienteSeleccionado && (
              <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  ✅ Cliente seleccionado:
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Nombre:</strong> {clienteSeleccionado.nombreCompleto || `${clienteSeleccionado.nombre || ''} ${clienteSeleccionado.apellido || ''}`.trim() || 'N/A'}</p>
                  {clienteSeleccionado.email && <p><strong>Email:</strong> {clienteSeleccionado.email}</p>}
                  {clienteSeleccionado.documento && <p><strong>Documento:</strong> {clienteSeleccionado.documento}</p>}
                  {clienteSeleccionado.telefono && <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</p>}
                </div>
              </div>
            )}
          </>
        )}
        {clientes.length === 0 && !cargandoClientes && (
          <p className="text-yellow-600 text-xs mt-2">
            ⚠️ No hay clientes disponibles. Asegúrate de tener clientes registrados.
          </p>
        )}
      </div>

      {/* ✅ PASO 2: Formulario - Solo se muestra después de seleccionar cliente */}
      {mostrarFormulario && FormularioComponente ? (
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-700">
              Paso 2: Completa los datos de la solicitud
            </p>
          </div>
          
          <FormularioComponente
            isOpen={true}
            onClose={onClose}
            onGuardar={onGuardar}
            tipoSolicitud={tipoSolicitud}
            servicioId={servicioId}
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            handleChange={handleChange}
            handleClaseChange={handleClaseChange}
            addClase={addClase}
            removeClase={removeClase}
            renderForm={false}
            renderModal={false}
          />
        </form>
      ) : mostrarFormulario && !FormularioComponente ? (
        <div className="text-red-500 p-4 bg-red-50 border border-red-200 rounded-lg">
          No hay formulario disponible para este servicio.
        </div>
      ) : !cargandoClientes && !idClienteSeleccionado ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⚠️ Por favor, selecciona un cliente primero para continuar con el formulario.
          </p>
        </div>
      ) : null}
    </BaseModal>
  );
};

export default CrearSolicitudAdmin;

