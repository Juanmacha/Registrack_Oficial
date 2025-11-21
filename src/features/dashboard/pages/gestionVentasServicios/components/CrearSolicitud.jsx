import React, { useState, useEffect } from 'react';
import { crearVenta } from '../services/ventasService';
import { mockDataService } from '../../../../../utils/mockDataService';
import solicitudesApiService from '../services/solicitudesApiService';
import clientesApiService from '../../../services/clientesApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';
import { normalizeRole, isAdminOrEmployee } from '../../../../../shared/utils/roleUtils.js';
import API_CONFIG from '../../../../../shared/config/apiConfig.js';
import Swal from 'sweetalert2';
import { PAISES } from '../../../../../shared/utils/paises.js';
import { AlertService } from '../../../../../shared/styles/alertStandards.js';
import BaseModal from '../../../../../shared/components/BaseModal';
import { FilePlus } from 'lucide-react';
// Importar formularios específicos
import FormularioBusqueda from '../../../../../shared/components/formularioBusqueda';
import FormularioCertificacion from '../../../../../shared/components/formularioCertificacion';
import FormularioRenovacion from '../../../../../shared/components/formularioRenovacion';
import FormularioOposicion from '../../../../../shared/components/formularioOposicion';
import FormularioCesion from '../../../../../shared/components/formularioCesiondeMarca';
import FormularioAmpliacion from '../../../../../shared/components/formularioAmpliacion';
import FormularioRespuesta from '../../../../../shared/components/formularioRespuesta';
import DemoPasarelaPagoModal from '../../../../landing/components/DemoPasarelaPagoModal'; // Asegúrate de que la ruta sea correcta

/**
 * ⚠️ COMPONENTE EXCLUSIVO PARA CLIENTES
 * 
 * Este componente permite crear solicitudes como cliente.
 * Diferencias clave con CrearSolicitudAdmin (admin/empleado):
 * - NO requiere id_cliente (se toma automáticamente del token)
 * - Muestra pasarela de pago después de crear
 * - Estado inicial: "Pendiente de Pago"
 * - Requiere procesar pago para activar la solicitud
 * 
 * Para administradores/empleados, usar CrearSolicitudAdmin.jsx en su lugar.
 */

// Mapeo de formularios por servicio
const FORMULARIOS_POR_SERVICIO = {
  'Búsqueda de Antecedentes': FormularioBusqueda,
  'Certificación de Marca': FormularioCertificacion,
  'Renovación de Marca': FormularioRenovacion,
  'Presentación de Oposición': FormularioOposicion,
  'Cesión de Marca': FormularioCesion,
  'Ampliación de Alcance': FormularioAmpliacion,
  'Respuesta a Oposición': FormularioRespuesta,
};

const CrearSolicitud = ({ isOpen, onClose, onGuardar, tipoSolicitud, servicioId }) => {
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
    ciudad: '', // ✅ NUEVO: Campo agregado
    codigoPostal: '', // ✅ NUEVO: Campo agregado
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

  // Estado para la pasarela demo y flujo de pago
  const [mostrarPasarela, setMostrarPasarela] = useState(false);
  const [pagoDemo, setPagoDemo] = useState(null);
  const [solicitudCreada, setSolicitudCreada] = useState(null); // ✅ NUEVO: Guardar solicitud creada para pago
  const [procesandoPago, setProcesandoPago] = useState(false); // ✅ NUEVO: Estado de procesamiento de pago

  // ✅ NUEVO: Estados para selector de cliente (admin/empleado)
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState('');

  // Determinar qué formulario renderizar
  const FormularioComponente = FORMULARIOS_POR_SERVICIO[tipoSolicitud];

  // ✅ NUEVO: Cargar clientes cuando el modal se abre y el usuario es admin/empleado
  useEffect(() => {
    const cargarClientes = async () => {
      const esAdminOEmpleado = isAdminOrEmployee(user);
      
      if (isOpen && esAdminOEmpleado) {
        try {
          setCargandoClientes(true);
          console.log('🔧 [CrearSolicitud] Cargando clientes para admin/empleado...');
          const clientesData = await clientesApiService.getAllClientes();
          setClientes(clientesData || []);
          console.log('✅ [CrearSolicitud] Clientes cargados:', clientesData?.length || 0);
        } catch (error) {
          console.error('❌ [CrearSolicitud] Error al cargar clientes:', error);
          AlertService.error('Error', 'No se pudieron cargar los clientes. Intenta de nuevo.');
        } finally {
          setCargandoClientes(false);
        }
      } else if (!isOpen) {
        // Limpiar al cerrar el modal
        setClientes([]);
        setIdClienteSeleccionado('');
      }
    };

    cargarClientes();
  }, [isOpen, user]);

  // Función para convertir archivo a base64 con validación
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // ✅ NUEVO: Validar tamaño (máx 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        reject(new Error(`El archivo ${file.name} excede el tamaño máximo de 5MB`));
        return;
      }

      // ✅ NUEVO: Validar formato (PDF, JPG, PNG)
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
    
    console.log("🔧 [CrearSolicitud] Validando form:", form);
    
    // Validar solo campos básicos requeridos que siempre deben estar
    if (!form.tipoSolicitante || form.tipoSolicitante.trim() === '') {
      newErrors.tipoSolicitante = 'El tipo de solicitante es requerido';
    }
    if (!form.email || form.email.trim() === '') {
      newErrors.email = 'El email es requerido';
    }
    if (!form.nombreMarca || form.nombreMarca.trim() === '') {
      newErrors.nombreMarca = 'El nombre de la marca es requerido';
    }
    
    // Validar campos condicionales según el tipo de solicitante
    if (form.tipoSolicitante === 'Titular') {
      if (!form.tipoPersona || form.tipoPersona.trim() === '') {
        newErrors.tipoPersona = 'El tipo de persona es requerido';
      }
      if (form.tipoPersona === 'Natural') {
        if (!form.tipoDocumento || form.tipoDocumento.trim() === '') {
          newErrors.tipoDocumento = 'El tipo de documento es requerido';
        }
        if (!form.numeroDocumento || form.numeroDocumento.trim() === '') {
          newErrors.numeroDocumento = 'El número de documento es requerido';
        }
        if (!form.nombres || form.nombres.trim() === '') {
          newErrors.nombres = 'Los nombres son requeridos';
        }
        if (!form.apellidos || form.apellidos.trim() === '') {
          newErrors.apellidos = 'Los apellidos son requeridos';
        }
      } else if (form.tipoPersona === 'Jurídica') {
        if (!form.nombreEmpresa || form.nombreEmpresa.trim() === '') {
          newErrors.nombreEmpresa = 'El nombre de la empresa es requerido';
        }
        if (!form.nit || form.nit.trim() === '') {
          newErrors.nit = 'El NIT es requerido';
        }
      }
    } else if (form.tipoSolicitante === 'Representante Autorizado') {
      if (!form.tipoDocumento || form.tipoDocumento.trim() === '') {
        newErrors.tipoDocumento = 'El tipo de documento es requerido';
      }
      if (!form.numeroDocumento || form.numeroDocumento.trim() === '') {
        newErrors.numeroDocumento = 'El número de documento es requerido';
      }
      if (!form.nombres || form.nombres.trim() === '') {
        newErrors.nombres = 'Los nombres son requeridos';
      }
      if (!form.apellidos || form.apellidos.trim() === '') {
        newErrors.apellidos = 'Los apellidos son requeridos';
      }
    }
    
    console.log("🔧 [CrearSolicitud] Errores generados:", newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    console.log("🔧 [CrearSolicitud] handleSubmit iniciado");
    console.log("🔧 [CrearSolicitud] Form actual:", form);
    console.log("🔧 [CrearSolicitud] Form keys:", Object.keys(form));
    e.preventDefault();
    
    const newErrors = validate();
    console.log("🔧 [CrearSolicitud] Errores de validación encontrados:", newErrors);
    console.log("🔧 [CrearSolicitud] Número de errores:", Object.keys(newErrors).length);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log("🔧 [CrearSolicitud] Errores de validación:", newErrors);
      // ✅ NO MOSTRAR ALERT, DEJAR QUE LOS ERRORES SE MUESTREN EN EL FORMULARIO
      return;
    }
    console.log("🔧 [CrearSolicitud] Validación exitosa");
    
    try {
      // Obtener token y rol del usuario
      const token = getToken();
      const userRole = user?.rol || user?.role;
      
      if (!token) {
        AlertService.error('Error', 'No hay sesión activa. Por favor, inicia sesión.');
        return;
      }

      console.log("🔧 [CrearSolicitud] Token obtenido, rol del usuario:", userRole);

      // Convertir archivos a base64 antes de enviar
      const formToSave = { ...form };
      
      // ✅ Lista completa de campos de archivo según todos los formularios
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
            console.log("🔧 [CrearSolicitud] Convirtiendo archivo:", field);
            formToSave[field] = await fileToBase64(formToSave[field]);
            console.log("✅ [CrearSolicitud] Archivo convertido:", field);
          } catch (error) {
            console.error(`❌ [CrearSolicitud] Error convirtiendo archivo ${field}:`, error);
            AlertService.error('Error', `Error al procesar el archivo ${field}: ${error.message}`);
            return;
          }
        }
      }
      
      // También verificar si hay otros campos que puedan ser archivos (búsqueda dinámica)
      for (const [key, value] of Object.entries(formToSave)) {
        if (value instanceof File && !fileFields.includes(key)) {
          try {
            console.log("🔧 [CrearSolicitud] Convirtiendo archivo adicional:", key);
            formToSave[key] = await fileToBase64(value);
          } catch (error) {
            console.error(`❌ [CrearSolicitud] Error convirtiendo archivo adicional ${key}:`, error);
            AlertService.error('Error', `Error al procesar el archivo ${key}: ${error.message}`);
            return;
          }
        }
      }

      // ✅ LÓGICA DE ROLES según la documentación de la API (Enero 2026)
      // Clientes: NO enviar id_cliente (se usa automáticamente del token)
      // Admin/Empleados: DEBE enviar id_cliente (obligatorio)
      
      const esCliente = userRole === 'cliente';
      const esAdminOEmpleado = userRole === 'administrador' || userRole === 'empleado';
      
      if (esAdminOEmpleado) {
        // Admin/Empleado: DEBE enviar id_cliente
        const idCliente = idClienteSeleccionado || formToSave.id_cliente;
        if (!idCliente || idCliente === '') {
          AlertService.error('Error', 'Para administradores y empleados, se requiere seleccionar un cliente. Por favor, selecciona un cliente de la lista antes de continuar.');
          setErrors(prev => ({ ...prev, id_cliente: 'Cliente requerido para administradores y empleados' }));
          return;
        }
        formToSave.id_cliente = parseInt(idCliente); // Asegurar que sea número
        console.log("🔧 [CrearSolicitud] Admin/Empleado - Agregando id_cliente:", formToSave.id_cliente);
      } else {
        // Cliente: NO enviar id_cliente (se usa automáticamente del token JWT)
        // Asegurar que NO esté en el objeto
        delete formToSave.id_cliente;
        console.log("🔧 [CrearSolicitud] Cliente - No se envía id_cliente (se usa del token)");
      }

      // Transformar datos del formulario al formato de la API
      const { servicioAPI, datosAPI } = await solicitudesApiService.transformarDatosParaAPI(
        formToSave,
        tipoSolicitud,
        userRole
      );

      console.log("🔧 [CrearSolicitud] Servicio API:", servicioAPI);
      console.log("🔧 [CrearSolicitud] Datos transformados para API:", datosAPI);

      // Crear solicitud usando la API real
      const resultado = await solicitudesApiService.crearSolicitud(
        servicioAPI,
        datosAPI,
        token
      );

      console.log("✅ [CrearSolicitud] Solicitud creada exitosamente:", resultado);

      // 🔥 NUEVO: Manejar respuesta diferenciada por rol
      const data = resultado.data || resultado;
      const requierePago = data.requiere_pago === true;
      const estado = data.estado || resultado.estado;
      const ordenId = data.orden_id || data.id || resultado.orden_id || resultado.id;
      const montoAPagar = data.monto_a_pagar || null;

      // Guardar solicitud creada para procesamiento de pago (solo clientes)
      if (esCliente && requierePago && ordenId) {
        setSolicitudCreada({
          orden_id: ordenId,
          estado: estado,
          monto_a_pagar: montoAPagar,
          servicio: servicioAPI
        });
        
        // Mostrar mensaje y opción de pago
        AlertService.info(
          'Solicitud Creada - Pendiente de Pago',
          `Tu solicitud ha sido creada con estado "Pendiente de Pago". Debes procesar el pago de $${montoAPagar?.toLocaleString('es-CO') || 'N/A'} para activarla.`
        );
        
        // Mostrar pasarela de pago
        setMostrarPasarela(true);
      } else {
        // Admin/Empleado o solicitud activada automáticamente
        AlertService.success(
          'Solicitud Creada y Activada', 
          `La solicitud ha sido creada exitosamente${esAdminOEmpleado ? ' y activada automáticamente' : ''}. Se han enviado notificaciones por email.`
        );

        // Llamar a onGuardar con el resultado de la API
        if (onGuardar) {
          await onGuardar(resultado);
        }

        // Cerrar el modal
        if (onClose) {
          onClose();
        }
      }

    } catch (err) {
      console.error("❌ [CrearSolicitud] Error al guardar:", err);
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
    }
  };

  // 🔥 NUEVO: Procesar pago y activar solicitud (solo clientes)
  const handleProcesarPago = async () => {
    if (!solicitudCreada || !solicitudCreada.orden_id) {
      AlertService.error('Error', 'No hay una solicitud pendiente de pago.');
      return;
    }

    setProcesandoPago(true);
    try {
      const token = getToken();
      if (!token) {
        AlertService.error('Error', 'No hay sesión activa. Por favor, inicia sesión.');
        setProcesandoPago(false);
        return;
      }
      
      // ✅ Usar URL base de la configuración
      const baseURL = API_CONFIG.BASE_URL || API_CONFIG.baseURL || (import.meta.env.DEV ? '' : 'https://api-registrack-2.onrender.com');

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

      console.log("✅ [CrearSolicitud] Respuesta del pago:", resultado);

      // ✅ Verificar si la solicitud fue activada según la estructura de respuesta de la API
      const solicitudActivada = resultado.data?.solicitud_activada || resultado.solicitud_activada;
      
      if (solicitudActivada === true) {
        console.log("✅ [CrearSolicitud] Pago procesado y solicitud activada:", resultado);
        
        AlertService.success(
          'Pago Procesado Exitosamente',
          'Tu solicitud ha sido activada y está en proceso. Se han enviado notificaciones por email.'
        );

        // Cerrar pasarela
        setMostrarPasarela(false);
        setSolicitudCreada(null);

        // Llamar a onGuardar con el resultado actualizado
        if (onGuardar) {
          await onGuardar(resultado);
        }

        // Cerrar el modal
        if (onClose) {
          onClose();
        }
      } else {
        AlertService.warning(
          'Pago Procesado',
          'El pago fue procesado, pero la solicitud no se activó automáticamente. Por favor, contacta al administrador.'
        );
      }
    } catch (err) {
      console.error("❌ [CrearSolicitud] Error al procesar pago:", err);
      const errorMessage = err.message || err.response?.data?.mensaje || err.response?.data?.message || 'Error desconocido';
      AlertService.error(
        "Error al procesar pago",
        `No se pudo procesar el pago: ${errorMessage}. Por favor, intenta de nuevo o contacta al soporte.`
      );
    } finally {
      setProcesandoPago(false);
    }
  };

  // Cuando el pago es exitoso (versión anterior para compatibilidad)
  const handlePagoExitoso = async (pago) => {
    console.log("🔧 [CrearSolicitud] handlePagoExitoso iniciado (modo legacy)");
    
    // Si hay una solicitud creada pendiente de pago, procesarla
    if (solicitudCreada && solicitudCreada.orden_id) {
      await handleProcesarPago();
      return;
    }
    
    // Modo legacy: comportamiento anterior
    setMostrarPasarela(false);
    setPagoDemo(pago);
    
    // Este flujo legacy ya no se usa con el nuevo sistema
    AlertService.info(
      'Pago Realizado',
      'El pago fue procesado. La solicitud será activada automáticamente.'
    );
  };

  // ...existing code...

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Crear Solicitud"
        headerGradient="blue"
        headerIcon={<FilePlus className="w-5 h-5 text-white" />}
        maxWidth="3xl"
        footerActions={[
          {
            label: "Cerrar",
            onClick: onClose,
            variant: "secondary"
          }
        ]}
      >
        {/* Renderizar el formulario dinámico */}
        {FormularioComponente ? (
          <form onSubmit={handleSubmit}>
            {/* ✅ NUEVO: Selector de Cliente para Admin/Empleado */}
            {isAdminOrEmployee(user) && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cliente <span className="text-red-500">*</span>
                </label>
                {cargandoClientes ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <i className="bi bi-arrow-repeat animate-spin"></i>
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
                  </>
                )}
                {clientes.length === 0 && !cargandoClientes && (
                  <p className="text-yellow-600 text-xs mt-2">
                    ⚠️ No hay clientes disponibles. Asegúrate de tener clientes registrados.
                  </p>
                )}
              </div>
            )}
            <FormularioComponente
              isOpen={isOpen}
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
            />
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-gray-700 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Guardar y Pagar
              </button>
            </div>
          </form>
        ) : (
          <div className="text-red-500">No hay formulario disponible para este servicio.</div>
        )}
      </BaseModal>
      {/* Modal de pasarela demo - Solo para clientes con solicitud pendiente de pago */}
      {solicitudCreada && solicitudCreada.orden_id ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 relative flex flex-col items-center">
            <h2 className="text-2xl font-bold text-center mb-4 text-green-700 flex items-center gap-2">
              <span className="inline-block bg-green-100 rounded-full p-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 12l2 2l4-4"/>
                </svg>
              </span>
              Procesar Pago
            </h2>
            <p className="text-lg text-gray-700 mb-4 text-center">
              Tu solicitud ha sido creada con estado <strong>"Pendiente de Pago"</strong>
            </p>
            <p className="text-xl font-bold text-blue-700 mb-6 text-center">
              Monto a pagar: ${solicitudCreada.monto_a_pagar?.toLocaleString('es-CO') || 'N/A'}
            </p>
            <div className="flex gap-3 w-full">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-md text-lg flex-1 transition disabled:opacity-50"
                onClick={handleProcesarPago}
                disabled={procesandoPago}
              >
                {procesandoPago ? 'Procesando...' : 'Procesar Pago'}
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-md text-lg transition"
                onClick={() => {
                  setMostrarPasarela(false);
                  setSolicitudCreada(null);
                  if (onClose) onClose();
                }}
                disabled={procesandoPago}
              >
                Cancelar
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Al procesar el pago, tu solicitud se activará automáticamente
            </p>
          </div>
        </div>
      ) : (
        /* Modal de pasarela demo legacy (para compatibilidad) */
        <DemoPasarelaPagoModal
          isOpen={mostrarPasarela && !solicitudCreada}
          onClose={() => setMostrarPasarela(false)}
          monto={solicitudCreada?.monto_a_pagar || 1000000}
          datosPago={{
            nombreMarca: form.nombreMarca || '',
            nombreRepresentante: `${form.nombres || ''} ${form.apellidos || ''}`.trim(),
            tipoDocumento: form.tipoDocumento || '',
            numeroDocumento: form.numeroDocumento || '',
          }}
          onPagoExitoso={handlePagoExitoso}
        />
      )}
    </>
  );
};

export default CrearSolicitud;