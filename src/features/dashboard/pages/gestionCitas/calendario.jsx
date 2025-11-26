import React, { useState, useEffect, useRef } from "react";
import { useSidebar } from "../../../../shared/contexts/SidebarContext";
import { useAuth } from "../../../../shared/contexts/authContext";
import { usePermiso } from "../../../../shared/hooks/usePermiso";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
// Configuración del locale español
const esLocale = {
  code: 'es',
  week: {
    dow: 1, // Lunes como primer día de la semana
    doy: 4  // La semana que contiene Jan 4th es la primera semana del año
  },
  buttonText: {
    prev: 'Ant',
    next: 'Sig',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista'
  },
  weekText: 'Sm',
  allDayText: 'Todo el día',
  moreLinkText: function(n) {
    return '+ ver más (' + n + ')';
  },
  noEventsText: 'No hay eventos para mostrar'
};
import citasApiService from "../../services/citasApiService.js";
import alertService from "../../../../utils/alertService.js";
import empleadosApiService from "../../services/empleadosApiService.js";
import clientesApiService from "../../services/clientesApiService.js";
import DownloadButton from "../../../../shared/components/DownloadButton";
import VerDetalleCita from "../gestionCitas/components/verDetallecita";
import ModalAgendarDesdeSolicitud from "../gestionCitas/components/ModalAgendarDesdeSolicitud";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaUser, FaPhone, FaFileAlt, FaBriefcase, FaDownload, FaSearch, FaEye, FaEdit, FaTrash, FaCalendarDay, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { Dialog } from "@headlessui/react";
import * as XLSX from "xlsx";
import "../../../../styles/fullcalendar-custom.css";
import { handleDocumentNumberChange, handlePhoneChange, handleNumericPaste, handleDocumentNumberKeyDown, handlePhoneKeyDown } from "../../../../shared/utils/numericInputFilter.js";


const Calendario = () => {
  const { getToken } = useAuth();
  
  // ✅ Permisos del módulo de citas
  const puedeCrear = usePermiso('gestion_citas', 'crear');
  const puedeEditar = usePermiso('gestion_citas', 'editar');
  const puedeActualizar = usePermiso('gestion_citas', 'actualizar');
  const puedeEliminar = usePermiso('gestion_citas', 'eliminar');
  const puedeLeer = usePermiso('gestion_citas', 'leer');
  
  // Combinar editar y actualizar (pueden ser sinónimos según el backend)
  const puedeModificar = puedeEditar || puedeActualizar;
  
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modoReprogramar, setModoReprogramar] = useState(false);
  const [citaAReprogramar, setCitaAReprogramar] = useState(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const calendarRef = useRef(null);
  const { isSidebarExpanded } = useSidebar();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    tipoDocumento: "",
    telefono: "",
    tipoCita: "",
    horaInicio: "",
    horaFin: "",
    asesor: "",
    detalle: "",
  });
  const [modalDate, setModalDate] = useState(null);
  const [modalEventos, setModalEventos] = useState({ open: false, eventos: [], hora: "" });
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});
  // ✅ Estado para el modal de solicitud SEPARADO
  const [modalDesdeSolicitudOpen, setModalDesdeSolicitudOpen] = useState(false);
  const [solicitudParaAgendar, setSolicitudParaAgendar] = useState(null);
  // ✅ Estado para empleados cargados desde la API
  const [empleadosActivos, setEmpleadosActivos] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  
  // ✅ Estados para selector de clientes
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const clienteSearchRef = useRef(null);
  
  // ✅ Estados para buscador de empleados
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [mostrarListaEmpleados, setMostrarListaEmpleados] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  
  // Función para refrescar citas cuando se crea desde solicitud
  const handleCitaCreadaDesdeSolicitud = async () => {
    await cargarCitasDesdeAPI();
  };

  // ✅ Función para cargar clientes desde la API
  const cargarClientes = async () => {
    try {
      setCargandoClientes(true);
      console.log('👥 [Calendario] Cargando clientes desde la API...');
      const clientesData = await clientesApiService.getAllClientes();
      // Filtrar solo clientes activos
      const clientesActivos = (clientesData || []).filter(c => c.estado !== false);
      setClientes(clientesActivos);
      console.log('✅ [Calendario] Clientes cargados:', clientesActivos.length);
    } catch (error) {
      console.error('❌ [Calendario] Error al cargar clientes:', error);
      await alertService.error('Error', 'No se pudieron cargar los clientes. Intente nuevamente.');
    } finally {
      setCargandoClientes(false);
    }
  };

  // ✅ Función para normalizar texto para búsqueda
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // ✅ Función para filtrar clientes según búsqueda
  const clientesFiltrados = clientes.filter((cliente) => {
    if (!busquedaCliente.trim()) return true;
    
    const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
    const documento = cliente.documento || '';
    const tipoDoc = cliente.tipoDocumento || cliente.tipo_documento || '';
    const correo = cliente.correo || cliente.email || '';
    const telefono = cliente.telefono || '';
    
    const textoBusqueda = `${nombreCompleto} ${documento} ${tipoDoc} ${correo} ${telefono}`;
    return normalizarTexto(textoBusqueda).includes(normalizarTexto(busquedaCliente));
  });

  // ✅ Función para filtrar empleados según búsqueda
  const empleadosFiltrados = empleadosActivos.filter((emp) => {
    if (!busquedaEmpleado.trim()) return true;
    
    const nombreCompleto = emp.nombreCompleto || '';
    const documento = emp.cedula || emp.documento || '';
    
    const textoBusqueda = `${nombreCompleto} ${documento}`;
    return normalizarTexto(textoBusqueda).includes(normalizarTexto(busquedaEmpleado));
  });

  // ✅ Manejar selección de empleado desde el buscador
  const handleSeleccionarEmpleado = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setFormData(prev => ({ 
      ...prev, 
      asesor: empleado.nombreCompleto 
    }));
    setBusquedaEmpleado(`${empleado.nombreCompleto} ${empleado.cedula ? `- ${empleado.cedula}` : ''}`);
    setMostrarListaEmpleados(false);
    
    // Limpiar error del campo
    if (errores.asesor) {
      setErrores(prev => ({ ...prev, asesor: undefined }));
    }
  };

  // ✅ Manejar cambio en el input de búsqueda de empleado
  const handleBusquedaEmpleadoChange = (e) => {
    const valor = e.target.value;
    setBusquedaEmpleado(valor);
    setMostrarListaEmpleados(true);
    
    // Si se limpia el input, limpiar también la selección
    if (!valor.trim()) {
      setEmpleadoSeleccionado(null);
      setFormData(prev => ({ ...prev, asesor: '' }));
    }
  };

  // ✅ Función para autocompletar datos del cliente seleccionado
  const autocompletarDatosCliente = (cliente) => {
    if (!cliente) {
      setClienteSeleccionado(null);
      setFormData(prev => ({
        ...prev,
        nombre: "",
        apellido: "",
        cedula: "",
        tipoDocumento: "",
        telefono: "",
      }));
      setBusquedaCliente("");
      setMostrarListaClientes(false);
      return;
    }
    
    setClienteSeleccionado(cliente);
    const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
    const tipoDoc = cliente.tipoDocumento || cliente.tipo_documento || 'CC';
    const documento = cliente.documento || '';
    setBusquedaCliente(`${nombreCompleto} - ${tipoDoc} ${documento}`);
    setMostrarListaClientes(false);
    setFormData(prev => ({
      ...prev,
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      cedula: cliente.documento || '',
      // ✅ Solo usar valor por defecto si realmente no hay tipo de documento del cliente
      tipoDocumento: cliente.tipoDocumento || cliente.tipo_documento || '',
      // ✅ No usar 'N/A' como valor, usar cadena vacía si es null/undefined/N/A
      telefono: (cliente.telefono && cliente.telefono.trim() !== '' && cliente.telefono.toUpperCase() !== 'N/A') 
        ? cliente.telefono 
        : '',
    }));
  };

  // ✅ Cerrar lista de clientes al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteSearchRef.current && !clienteSearchRef.current.contains(event.target)) {
        setMostrarListaClientes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ✅ Cargar clientes cuando se abre el modal
  useEffect(() => {
    if (showModal && !modoReprogramar) {
      cargarClientes();
    } else if (!showModal) {
      // Limpiar al cerrar el modal
      setClienteSeleccionado(null);
      setClientes([]);
      setBusquedaCliente("");
      setMostrarListaClientes(false);
    }
  }, [showModal, modoReprogramar]);

  // Función para cargar empleados desde la API
  const cargarEmpleadosDesdeAPI = async () => {
    setLoadingEmpleados(true);
    try {
      console.log('👥 [Calendario] Cargando empleados desde la API...');
      const result = await empleadosApiService.getAllEmpleados();
      
      if (result && result.success && Array.isArray(result.data)) {
        // Filtrar solo empleados activos y transformar al formato necesario
        const empleadosFiltrados = result.data
          .filter(emp => {
            // Verificar que el empleado esté activo (puede venir como boolean o string)
            const estadoEmpleado = emp.estado_empleado !== false && emp.estado_empleado !== 'Inactivo';
            const estadoUsuario = emp.estado_usuario !== false && emp.estado_usuario !== 'Inactivo';
            return estadoEmpleado && estadoUsuario;
          })
          .map(emp => ({
            id_empleado: emp.id_empleado,
            nombre: emp.nombre || '',
            apellido: emp.apellido || '',
            cedula: emp.documento || emp.cedula || '',
            nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim()
          }));
        
        console.log('✅ [Calendario] Empleados cargados exitosamente:', empleadosFiltrados);
        setEmpleadosActivos(empleadosFiltrados);
      } else if (Array.isArray(result)) {
        // Si la respuesta es directamente un array
        const empleadosFiltrados = result
          .filter(emp => {
            const estadoEmpleado = emp.estado_empleado !== false && emp.estado_empleado !== 'Inactivo';
            const estadoUsuario = emp.estado_usuario !== false && emp.estado_usuario !== 'Inactivo';
            return estadoEmpleado && estadoUsuario;
          })
          .map(emp => ({
            id_empleado: emp.id_empleado,
            nombre: emp.nombre || '',
            apellido: emp.apellido || '',
            cedula: emp.documento || emp.cedula || '',
            nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim()
          }));
        
        console.log('✅ [Calendario] Empleados cargados exitosamente (array directo):', empleadosFiltrados);
        setEmpleadosActivos(empleadosFiltrados);
      } else {
        console.warn('⚠️ [Calendario] Formato de respuesta de empleados inesperado:', result);
        setEmpleadosActivos([]);
      }
    } catch (error) {
      console.error('❌ [Calendario] Error al cargar empleados:', error);
      setEmpleadosActivos([]);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  // Función para cargar citas desde la API
  const cargarCitasDesdeAPI = async () => {
    setIsLoading(true);
    try {
      console.log('📅 [Calendario] Cargando citas desde la API...');
      const result = await citasApiService.getAllCitas();
      
      if (result.success) {
        console.log('✅ [Calendario] Citas cargadas desde API:', result.data);
        console.log('📊 [Calendario] Análisis de estructura de datos:', {
          isArray: Array.isArray(result.data),
          length: Array.isArray(result.data) ? result.data.length : 'N/A',
          firstItem: Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : 'N/A',
          firstItemKeys: Array.isArray(result.data) && result.data.length > 0 ? Object.keys(result.data[0]) : 'N/A'
        });
        
        if (!Array.isArray(result.data) || result.data.length === 0) {
          console.log('⚠️ [Calendario] No hay citas en la API');
          setEvents([]);
          return;
        }
        
        // Convertir las citas de la API al formato de FullCalendar
        const eventosCalendario = result.data.map((cita, index) => {
          console.log(`📋 [Calendario] Procesando cita ${index + 1}:`, cita);
          
          // Normalizar estado para que coincida con el formato esperado por las estadísticas
          const estadoNormalizado = normalizarEstado(cita.estado);
          // ✅ Normalizar tipo de cita para corregir tildes
          const tipoCitaNormalizado = normalizarTipoCita(cita.tipo);
          
          const evento = {
            id: cita.id_cita || cita.id,
            title: `${tipoCitaNormalizado} - ${cita.cliente?.nombre || cita.cliente?.nombre_completo || 'Cliente'}`,
            start: `${cita.fecha}T${cita.hora_inicio}`,
            end: `${cita.fecha}T${cita.hora_fin}`,
            backgroundColor: getColorByEstado(estadoNormalizado),
            borderColor: getColorByEstado(estadoNormalizado),
            textColor: '#ffffff',
            extendedProps: {
              // Mapear datos de la API al formato que espera VerDetalleCita
              id: cita.id_cita || cita.id,
              nombre: cita.cliente?.nombre || cita.cliente?.nombre_completo || 'N/A',
              apellido: cita.cliente?.apellido || '',
              cedula: cita.cliente?.documento || cita.cliente?.cedula || 'N/A',
              telefono: cita.cliente?.telefono || 'N/A',
              email: cita.cliente?.email || cita.cliente?.correo || 'N/A',
              tipoCita: tipoCitaNormalizado, // ✅ Usar tipo normalizado con tildes corregidas
              horaInicio: cita.hora_inicio || 'N/A',
              horaFin: cita.hora_fin || 'N/A',
              asesor: cita.empleado?.nombre || cita.empleado?.nombre_completo || 'N/A',
              detalle: cita.descripcion || cita.observacion || 'Sin detalles',
              estado: estadoNormalizado, // ✅ Usar estado normalizado
              modalidad: cita.modalidad || 'N/A',
              observacionAnulacion: cita.observacion_anulacion || '',
              fecha: cita.fecha || 'N/A',
              // Datos originales de la API para referencia
              datosOriginales: cita,
              cliente: cita.cliente,
              empleado: cita.empleado,
              // Datos adicionales de la solicitud original
              observacionAdmin: cita.observacion_admin || '',
              fechaSolicitada: cita.fecha_solicitada || '',
              horaSolicitada: cita.hora_solicitada || ''
            }
          };
          
          console.log(`📅 [Calendario] Evento ${index + 1} creado:`, evento);
          return evento;
        });
        
        setEvents(eventosCalendario);
        console.log('📅 [Calendario] Eventos del calendario actualizados desde API:', eventosCalendario);
      } else {
        console.error('❌ [Calendario] Error al cargar citas desde API:', result.message);
        
        // Si es error 404, significa que el endpoint no existe
        if (result.message.includes('404') || result.message.includes('not found')) {
          await alertService.info(
            'Endpoint no disponible', 
            'El endpoint /api/gestion-citas no está implementado en la API. Las citas se crean automáticamente al aprobar solicitudes.'
          );
        } else {
          await alertService.error('Error', result.message || 'No se pudieron cargar las citas desde la API');
        }
      }
    } catch (error) {
      console.error('💥 [Calendario] Error inesperado al cargar desde API:', error);
      await alertService.error('Error', 'Error de conexión con la API');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para normalizar el estado de la API al formato esperado por el frontend
  const normalizarEstado = (estado) => {
    if (!estado) return 'N/A';
    
    const estadoLower = estado.toLowerCase().trim();
    
    // Normalizar diferentes variantes de estados
    if (estadoLower.includes('anulada') || estadoLower.includes('cancelada')) {
      return 'Cita anulada';
    }
    if (estadoLower.includes('reprogramada')) {
      return 'Reprogramada';
    }
    if (estadoLower.includes('programada')) {
      return 'Programada';
    }
    if (estadoLower.includes('finalizada')) {
      return 'Finalizada';
    }
    if (estadoLower.includes('iniciada')) {
      return 'Iniciada';
    }
    
    // Si no coincide con ningún patrón conocido, retornar el estado original capitalizado
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  };

  // ✅ Función para normalizar tipos de cita y corregir tildes
  const normalizarTipoCita = (tipo) => {
    if (!tipo) return 'Sin tipo';
    
    const tipoLower = tipo.toLowerCase().trim();
    
    // Mapeo de variantes sin tilde o mal escritas a la versión correcta
    const tiposCorregidos = {
      'oposicion': 'Oposición',
      'oposición': 'Oposición',
      'certificacion': 'Certificación',
      'certificación': 'Certificación',
      'cesion': 'Cesión de marca',
      'cesión': 'Cesión de marca',
      'cesion de marca': 'Cesión de marca',
      'cesión de marca': 'Cesión de marca',
      'renovacion': 'Renovación',
      'renovación': 'Renovación',
      'busqueda de antecedentes': 'Búsqueda de antecedentes',
      'búsqueda de antecedentes': 'Búsqueda de antecedentes',
      'búsqueda de antecedente': 'Búsqueda de antecedentes',
      'general': 'General',
      'generales': 'General'
    };
    
    // Buscar coincidencia exacta (case-insensitive)
    const tipoNormalizado = tiposCorregidos[tipoLower];
    if (tipoNormalizado) {
      return tipoNormalizado;
    }
    
    // Si no hay coincidencia exacta, intentar corregir tildes comunes
    let tipoCorregido = tipo;
    
    // Correcciones comunes de tildes
    tipoCorregido = tipoCorregido.replace(/oposicion/gi, 'Oposición');
    tipoCorregido = tipoCorregido.replace(/certificacion/gi, 'Certificación');
    tipoCorregido = tipoCorregido.replace(/cesion/gi, 'Cesión');
    tipoCorregido = tipoCorregido.replace(/renovacion/gi, 'Renovación');
    tipoCorregido = tipoCorregido.replace(/busqueda/gi, 'Búsqueda');
    
    // Capitalizar primera letra si es necesario
    return tipoCorregido.charAt(0).toUpperCase() + tipoCorregido.slice(1);
  };

  // Función para obtener color según el estado
  const getColorByEstado = (estado) => {
    const estadoLower = (estado || '').toLowerCase();
    
    if (estadoLower.includes('programada')) return '#3B82F6'; // Azul
    if (estadoLower.includes('pendiente')) return '#F59E0B'; // Amarillo
    if (estadoLower.includes('reprogramada')) return '#8B5CF6'; // Púrpura
    if (estadoLower.includes('anulada') || estadoLower.includes('cancelada')) return '#EF4444'; // Rojo
    if (estadoLower.includes('completada') || estadoLower.includes('finalizada')) return '#10B981'; // Verde
    
    return '#6B7280'; // Gris por defecto
  };

  useEffect(() => {
    // Cargar citas desde la API al montar el componente
    cargarCitasDesdeAPI();
    // Cargar empleados desde la API al montar el componente
    cargarEmpleadosDesdeAPI();

    // Forzar el re-renderizado del calendario después de que el DOM esté estable
    if (calendarRef.current) {
      calendarRef.current.getApi().updateSize();
    }
  }, []);

  useEffect(() => {
    // Este useEffect se ejecutará cada vez que isSidebarExpanded cambie
    if (calendarRef.current) {
      calendarRef.current.getApi().updateSize();
    }
  }, [isSidebarExpanded]);

  useEffect(() => {
    try {
      if (events.length > 0) {
        localStorage.setItem("citas", JSON.stringify(events));
      }
      // Si events está vacío, no sobreescribir localStorage
    } catch (error) {}
  }, [events]);

  // ✅ useEffect para detectar solicitudes desde localStorage y abrir modal SEPARADO automáticamente
  useEffect(() => {
    const solicitudParaAgendar = localStorage.getItem('solicitudParaAgendar');
    if (solicitudParaAgendar) {
      try {
        const solicitudData = JSON.parse(solicitudParaAgendar);
        
        console.log('✅ [Calendario] Solicitud detectada para agendar:', solicitudData);
        
        // Guardar datos de la solicitud
        setSolicitudParaAgendar(solicitudData);
        
        // Abrir modal SEPARADO de solicitud
        setModalDesdeSolicitudOpen(true);
        
        // Limpiar localStorage inmediatamente
        localStorage.removeItem('solicitudParaAgendar');
        
        // Mostrar mensaje informativo
        Swal.fire({
          icon: 'info',
          title: 'Datos cargados automáticamente',
          text: `Se han cargado los datos de la solicitud de ${solicitudData.clienteNombre}. Seleccione la fecha, hora y asesor.`,
          timer: 3000,
          showConfirmButton: false
        });
        
      } catch (error) {
        console.error('❌ [Calendario] Error al procesar solicitud para agendar:', error);
        localStorage.removeItem('solicitudParaAgendar');
      }
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  const generarIdUnico = (cedula, fecha, hora) => `${cedula}_${fecha}_${hora}`;

  const handleDateSelect = async (selectInfo) => {
    console.log('🔧 [Calendario] handleDateSelect llamado:', selectInfo);
    
    // ✅ Verificar permiso de crear antes de permitir seleccionar fecha
    if (!puedeCrear) {
      await alertService.warning(
        "Sin permisos",
        "No tiene permiso para crear citas. Contacte al administrador si necesita este acceso."
      );
      return;
    }
    
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaSeleccionada = new Date(selectInfo.startStr);
      fechaSeleccionada.setHours(0, 0, 0, 0);
      console.log('🔧 [Calendario] Fecha seleccionada:', fechaSeleccionada);
      console.log('🔧 [Calendario] Fecha de hoy:', hoy);
      
      if (fechaSeleccionada < hoy) {
        await alertService.warning("Fecha inválida", "No puedes agendar citas en días anteriores a hoy.");
        return;
      }
      
      // Asegurar que modoReprogramar esté desactivado cuando se selecciona una fecha nueva
      setModoReprogramar(false);
      setCitaAReprogramar(null);
      
      // Abrir el modal con la información de la fecha seleccionada
      abrirModal(selectInfo);
    } catch (error) {
      console.error('❌ [Calendario] Error en handleDateSelect:', error);
      // Aún así, intentar abrir el modal si hay un error
      setModoReprogramar(false);
      setCitaAReprogramar(null);
      abrirModal(selectInfo);
    }
  };

  // Función para asignar colores según el estado del evento
  const getEventColors = (estado) => {
    if (estado === "Programada") return { backgroundColor: "#22c55e" };
    if (estado === "Reprogramada") return { backgroundColor: "#2563eb" };
    if (estado === "Cita anulada") return { backgroundColor: "#6b7280" };
    if (estado === "Iniciada") return { backgroundColor: "#f59e0b" }; // Nuevo color para citas iniciadas
    return { backgroundColor: "#fbbf24" };
  };

  // Función para crear cita usando la API
  const handleCreateCita = async (citaData) => {
    setIsLoading(true);
    try {
      console.log('📅 [Calendario] Creando nueva cita...', citaData);
      const result = await citasApiService.createCita(citaData);
      
      if (result.success) {
        await alertService.success(
          "Cita creada",
          result.message || "La cita se ha creado exitosamente.",
          { confirmButtonText: "Entendido" }
        );
        
        cerrarModal();
        // Recargar citas desde la API
        await cargarCitasDesdeAPI();
      } else {
        await alertService.error(
          "Error al crear cita",
          result.message || "No se pudo crear la cita. Intente de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error('💥 [Calendario] Error al crear cita:', error);
      await alertService.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Intente de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reprogramar cita usando la API
  const handleReprogramarCita = async (citaId, newData) => {
    setIsLoading(true);
    try {
      console.log('📅 [Calendario] Reprogramando cita ID:', citaId, newData);
      const result = await citasApiService.reprogramarCita(citaId, newData);
      
      if (result.success) {
        await alertService.success(
          "Cita reprogramada",
          result.message || "La cita se ha reprogramado exitosamente.",
          { confirmButtonText: "Entendido" }
        );
        
        setModoReprogramar(false);
        setCitaAReprogramar(null);
        setShowModal(false);
        // Recargar citas desde la API
        await cargarCitasDesdeAPI();
      } else {
        await alertService.error(
          "Error al reprogramar cita",
          result.message || "No se pudo reprogramar la cita. Intente de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error('💥 [Calendario] Error al reprogramar cita:', error);
      await alertService.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Intente de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para anular cita usando la API
  const handleAnularCita = async (citaId, observacion) => {
    setIsLoading(true);
    try {
      console.log('📅 [Calendario] Anulando cita ID:', citaId, observacion);
      const result = await citasApiService.anularCita(citaId, observacion);
      
      if (result.success) {
        await alertService.success(
          "Cita anulada",
          result.message || "La cita se ha anulado exitosamente.",
          { confirmButtonText: "Entendido" }
        );
        
        setShowDetalle(false);
        // Recargar citas desde la API
        await cargarCitasDesdeAPI();
      } else {
        await alertService.error(
          "Error al anular cita",
          result.message || "No se pudo anular la cita. Intente de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error('💥 [Calendario] Error al anular cita:', error);
      await alertService.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Intente de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Función eliminada: obtenerIdUsuarioCliente
  // Ahora usamos selector de clientes que ya tienen id_cliente en la tabla clientes

  const handleGuardarCita = async (e) => {
    e.preventDefault();
    
    // Validar fecha
    if (!modalDate?.startStr && !modoReprogramar) {
      console.error('🔧 [Calendario] Error: No hay fecha seleccionada');
      await Swal.fire({ 
        icon: 'error', 
        title: 'Error de fecha', 
        text: 'No se ha seleccionado una fecha válida. Por favor, seleccione una fecha en el calendario.' 
      });
      return;
    }
    
    // ✅ Validación básica
    // Si hay cliente seleccionado, los campos de cliente no son obligatorios (ya están llenos)
    let camposObligatorios = ["tipoCita","horaInicio","horaFin","asesor"];
    if (!clienteSeleccionado && !modoReprogramar) {
      // Solo validar campos de cliente si NO hay cliente seleccionado
      camposObligatorios = ["nombre","apellido","cedula","telefono","tipoCita","horaInicio","horaFin","asesor"];
    }
    if (modoReprogramar) {
      // En modo reprogramar solo se requieren fecha, hora y asesor (opcional)
      camposObligatorios = ["horaInicio","horaFin"];
    }
    for (let campo of camposObligatorios) {
      if (!formData[campo]) {
        Swal.fire({ icon: 'error', title: 'Campo obligatorio', text: `El campo ${campo} es obligatorio.` });
        return;
      }
    }
    
    // Preparar fecha base para validaciones
    let fechaBase;
    if (modoReprogramar && citaAReprogramar?.start) {
      fechaBase = modalDate?.startStr ? modalDate.startStr.split("T")[0] : new Date(citaAReprogramar.start).toISOString().split("T")[0];
    } else if (modalDate?.startStr) {
      fechaBase = modalDate.startStr.split("T")[0];
    } else {
      console.error('🔧 [Calendario] Error: No se puede determinar la fecha base');
      await Swal.fire({ 
        icon: 'error', 
        title: 'Error de fecha', 
        text: 'No se puede determinar la fecha para la cita.' 
      });
      return;
    }
    
    // Preparar datos de cita para validar
    const horaInicioConSegundos = formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2 
      ? formData.horaInicio + ':00' 
      : formData.horaInicio;
    const horaFinConSegundos = formData.horaFin.includes(':') && formData.horaFin.split(':').length === 2 
      ? formData.horaFin + ':00' 
      : formData.horaFin;
    
    // Validar usando el servicio de citas (incluye todas las validaciones nuevas)
    const datosParaValidar = {
      fecha: fechaBase,
      hora_inicio: horaInicioConSegundos,
      hora_fin: horaFinConSegundos,
      tipo: formData.tipoCita,
      modalidad: "Presencial",
      id_cliente: 1, // Placeholder, se asignará después
      id_empleado: 1 // Placeholder, se asignará después
    };
    
    if (modoReprogramar) {
      // Validar para reprogramar
      const validacionReprogramar = citasApiService.validateReprogramarData(datosParaValidar);
      if (!validacionReprogramar.isValid) {
        const primerError = Object.values(validacionReprogramar.errors)[0];
        await alertService.error("Error de validación", primerError);
        return;
      }
    } else {
      // Validar para crear
      const validacionCrear = citasApiService.validateCitaData(datosParaValidar);
      if (!validacionCrear.isValid) {
        const primerError = Object.values(validacionCrear.errors)[0];
        await alertService.error("Error de validación", primerError);
        return;
      }
    }
    
    // Validar cruce de horarios
    const horaInicio = formData.horaInicio;
    const horaFin = formData.horaFin;
    const cruza = events.some(ev => {
      if (modoReprogramar && citaAReprogramar && ev.id === citaAReprogramar.id) return false;
      const fechaEv = ev.start.split('T')[0];
      if (fechaEv !== fechaBase) return false;
      const inicioEv = ev.start.split('T')[1]?.slice(0,5) || '';
      const finEv = ev.end.split('T')[1]?.slice(0,5) || '';
      return (horaInicio < finEv && horaFin > inicioEv);
    });
    
    if (cruza) {
      await alertService.error("Horario ocupado", "Ya existe una cita en ese rango de horas.");
      return;
    }

    if (modoReprogramar && citaAReprogramar) {
      // Buscar el ID del empleado seleccionado para reprogramar (opcional)
      const empleadoSeleccionado = empleadosActivos.find(emp => emp.nombreCompleto === formData.asesor);
      const idEmpleado = empleadoSeleccionado?.id_empleado || null;
      
      // Preparar datos para reprogramar según la documentación de la API
      // Solo requiere: fecha, hora_inicio, hora_fin, y opcionalmente observacion e id_empleado
      const datosReprogramar = {
        fecha: fechaBase,
        hora_inicio: formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2 ? formData.horaInicio + ':00' : formData.horaInicio,
        hora_fin: formData.horaFin.includes(':') && formData.horaFin.split(':').length === 2 ? formData.horaFin + ':00' : formData.horaFin
      };
      
      // Campos opcionales
      if (formData.detalle && formData.detalle.trim()) {
        datosReprogramar.observacion = formData.detalle.trim();
      }
      
      // Incluir id_empleado solo si se seleccionó un empleado diferente
      if (idEmpleado) {
        datosReprogramar.id_empleado = idEmpleado;
      }
      
      // Reprogramar cita usando la API
      await handleReprogramarCita(citaAReprogramar.id, datosReprogramar);
      return;
    }

    // Crear cita normal usando la API
    // Buscar el ID del empleado seleccionado
    const empleadoSeleccionado = empleadosActivos.find(emp => emp.nombreCompleto === formData.asesor);
    const idEmpleado = empleadoSeleccionado?.id_empleado || null;
    
    if (!idEmpleado) {
      await alertService.error("Error", "Debe seleccionar un asesor válido.");
      return;
    }
    
    // ✅ Validar que se haya seleccionado un cliente
    if (!clienteSeleccionado || !clienteSeleccionado.id_cliente) {
      await alertService.error(
        "Cliente requerido",
        "Debe seleccionar un cliente para crear la cita."
      );
      return;
    }
    
    // Preparar datos de la cita usando id_cliente de la tabla clientes
    const citaData = {
      fecha: fechaBase,
      hora_inicio: formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2 ? formData.horaInicio + ':00' : formData.horaInicio,
      hora_fin: formData.horaFin.includes(':') && formData.horaFin.split(':').length === 2 ? formData.horaFin + ':00' : formData.horaFin,
      tipo: formData.tipoCita,
      modalidad: "Presencial",
      id_cliente: clienteSeleccionado.id_cliente, // ✅ USAR id_cliente DE LA TABLA clientes
      id_empleado: idEmpleado,
      observacion: formData.detalle || ''
    };
    
    await handleCreateCita(citaData);
  };

  // Cambiar la generación de opciones de hora a intervalos de 1 hora
  const generarOpcionesHora = () => {
    const opciones = [];
    for (let h = 7; h <= 19; h++) {
      const hora24 = h.toString().padStart(2, '0');
      const min = '00';
      const value = `${hora24}:${min}`;
      let h12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label = `${h12.toString().padStart(2, '0')}:${min} ${ampm}`;
      opciones.push({ value, label });
    }
    return opciones;
  };
  const opcionesHora = generarOpcionesHora();


  const initialValues = {
    nombre: "", apellido: "", cedula: "", tipoDocumento: "", telefono: "",
    horaInicio: "", horaFin: "", detalle: "", tipoCita: "", asesor: "",
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required("Requerido"),
    apellido: Yup.string().required("Requerido"),
    cedula: Yup.string().required("Requerido"),
    tipoDocumento: Yup.string().required("Requerido"),
    telefono: Yup.string().required("Requerido"),
    tipoCita: Yup.string().required("Requerido"),
    horaInicio: Yup.string().required("Requerido"),
    horaFin: Yup.string().required("Requerido"),
    asesor: Yup.string().required("Requerido"),
  });

  const handleEventClick = async (clickInfo) => {
    console.log('🖱️ [Calendario] Click en evento:', clickInfo.event);
    console.log('📋 [Calendario] ExtendedProps del evento:', clickInfo.event.extendedProps);
    
    // ✅ Verificar permiso de leer antes de mostrar detalles
    if (!puedeLeer) {
      await alertService.warning(
        "Sin permisos",
        "No tiene permiso para ver detalles de citas."
      );
      return;
    }
    
    setCitaSeleccionada(clickInfo.event.extendedProps);
    setCitaAReprogramar(clickInfo.event);
    setShowDetalle(true);
  };

  const handleAnularCitaModal = () => {
    Swal.fire({
      title: "Observación obligatoria",
      input: "textarea",
      inputLabel: "Por favor, ingrese la razón de la anulación:",
      inputPlaceholder: "Escriba aquí la observación...",
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) return 'La observación es obligatoria';
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Anular cita",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed && citaSeleccionada) {
        const observacion = result.value;
        await handleAnularCita(citaSeleccionada.id, observacion);
      }
    });
  };

  const cambiarVista = (vista) => {
    setCurrentView(vista);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(vista);
    }
  };

  const irAHoy = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  // Estadísticas
  const stats = [
    {
      label: "Programadas",
      value: events.filter(e => e.extendedProps?.estado === "Programada").length,
      color: "bg-green-500",
      icon: <FaCalendarAlt className="text-white text-2xl" />,
    },
    {
      label: "Reprogramadas",
      value: events.filter(e => e.extendedProps?.estado === "Reprogramada").length,
      color: "bg-blue-500",
      icon: <FaEdit className="text-white text-2xl" />,
    },
    {
      label: "Anuladas",
      value: events.filter(e => e.extendedProps?.estado === "Cita anulada").length,
      color: "bg-gray-600",
      icon: <FaTrash className="text-white text-2xl" />,
    },
    {
      label: "Finalizadas",
      value: events.filter(e => e.extendedProps?.estado === "Finalizada").length,
      color: "bg-yellow-500",
      icon: <FaCalendarDay className="text-white text-2xl" />,
    },
    {
      label: "Total",
      value: events.length,
      color: "bg-blue-900 text-white",
      icon: <FaCalendarDay className="text-white text-2xl" />,
    },
  ];

  function abrirModal(dateInfo = null) {
    console.log('🔧 [Calendario] abrirModal llamado con dateInfo:', dateInfo);
    console.log('🔧 [Calendario] dateInfo.startStr:', dateInfo?.startStr);
    console.log('🔧 [Calendario] dateInfo.start:', dateInfo?.start);
    
    // Deseleccionar cualquier selección activa en el calendario
    if (calendarRef.current) {
      try {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.unselect();
      } catch (error) {
        console.warn('⚠️ [Calendario] No se pudo deseleccionar el calendario:', error);
      }
    }
    
    setShowModal(true);
    setModalDate(dateInfo);
    
    // Recargar empleados al abrir el modal para asegurar datos actualizados
    cargarEmpleadosDesdeAPI();
    
    // Resetear formulario y modo reprogramar
    setModoReprogramar(false);
    setCitaAReprogramar(null);
    
    // Determinar hora inicial basada en la fecha seleccionada
    let horaInicioInicial = "";
    if (dateInfo?.startStr) {
      // Si viene con hora (vista de semana/día), usar esa hora
      const partes = dateInfo.startStr.split('T');
      if (partes.length > 1 && partes[1]) {
        horaInicioInicial = partes[1].slice(0, 5);
      }
    }
    
    setFormData({
      nombre: "",
      apellido: "",
      cedula: "",
      tipoDocumento: "",
      telefono: "",
      tipoCita: "",
      horaInicio: horaInicioInicial,
      horaFin: "",
      asesor: "",
      detalle: "",
    });
    // Limpiar estados del buscador de empleados
    setBusquedaEmpleado("");
    setMostrarListaEmpleados(false);
    setEmpleadoSeleccionado(null);
    
    setErrores({});
    setTouched({});
    
    console.log('✅ [Calendario] Modal abierto, showModal:', true);
  }

  function cerrarModal() {
    setShowModal(false);
    setModalDate(null);
    setClienteSeleccionado(null); // ✅ Resetear cliente seleccionado
    setClientes([]); // ✅ Limpiar lista de clientes
    setBusquedaCliente(""); // ✅ Limpiar búsqueda de cliente
    setMostrarListaClientes(false); // ✅ Ocultar lista de clientes
    setBusquedaEmpleado(""); // ✅ Limpiar búsqueda de empleado
    setMostrarListaEmpleados(false); // ✅ Ocultar lista de empleados
    setEmpleadoSeleccionado(null); // ✅ Resetear empleado seleccionado
    setFormData({
      nombre: "",
      apellido: "",
      cedula: "",
      tipoDocumento: "",
      telefono: "",
      tipoCita: "",
      horaInicio: "",
      horaFin: "",
      asesor: "",
      detalle: "",
    });
    setErrores({});
    setTouched({});
  }

  function horaEstaOcupada(hora, fecha) {
    if (!fecha) return false;
    const rangosOcupados = events
      .filter(ev => {
        // Si estamos reprogramando, ignorar la cita actual
        if (modoReprogramar && citaAReprogramar) {
          return ev.id !== citaAReprogramar.id && ev.start.split('T')[0] === fecha;
        }
        return ev.start.split('T')[0] === fecha;
      })
      .map(ev => ({
        inicio: ev.start.split('T')[1].slice(0,5),
        fin: ev.end.split('T')[1].slice(0,5)
      }));
    return rangosOcupados.some(rango => hora >= rango.inicio && hora < rango.fin);
  }

  // Función para filtrar eventos según la búsqueda
  const filtrarEventos = (eventos, termino) => {
    if (!termino) return eventos;
    const t = termino.toLowerCase();
    return eventos.filter(ev => {
      // Buscar en todos los campos de extendedProps y en el título
      const props = ev.extendedProps || {};
      const values = [
        ev.title,
        ev.id,
        props.nombre,
        props.apellido,
        props.cedula,
        props.telefono,
        props.tipoCita,
        props.asesor,
        props.detalle,
        props.estado,
        props.observacionAnulacion,
        // Agrega aquí cualquier otro campo relevante
      ];
      return values.some(val =>
        typeof val === 'string' && val.toLowerCase().includes(t)
      );
    });
  };

  const validarCampos = (campos = formData) => {
    const nuevosErrores = {};
    // Nombre
    if (!campos.nombre || campos.nombre.trim().length < 2) {
      nuevosErrores.nombre = "El nombre es obligatorio y debe tener al menos 2 letras.";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(campos.nombre.trim())) {
      nuevosErrores.nombre = "El nombre solo puede contener letras y espacios.";
    } else if (/^\s|\s$/.test(campos.nombre) || !campos.nombre.trim()) {
      nuevosErrores.nombre = "El nombre no debe tener espacios al inicio/final ni solo espacios.";
    }
    // Apellido
    if (!campos.apellido || campos.apellido.trim().length < 2) {
      nuevosErrores.apellido = "El apellido es obligatorio y debe tener al menos 2 letras.";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(campos.apellido.trim())) {
      nuevosErrores.apellido = "El apellido solo puede contener letras y espacios.";
    } else if (/^\s|\s$/.test(campos.apellido) || !campos.apellido.trim()) {
      nuevosErrores.apellido = "El apellido no debe tener espacios al inicio/final ni solo espacios.";
    }
    // Cédula
    if (!campos.cedula) {
      nuevosErrores.cedula = "La cédula es obligatoria.";
    } else if (!/^[0-9]{7,10}$/.test(campos.cedula)) {
      nuevosErrores.cedula = "La cédula debe tener entre 7 y 10 dígitos numéricos y sin espacios.";
    }
    // Teléfono
    if (!campos.telefono) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (!/^[0-9]{7,10}$/.test(campos.telefono)) {
      nuevosErrores.telefono = "El teléfono debe tener entre 7 y 10 dígitos numéricos y sin espacios.";
    }
    // Tipo de cita
    if (!campos.tipoCita || !campos.tipoCita.trim()) {
      nuevosErrores.tipoCita = "El tipo de cita es obligatorio.";
    }
    // Hora de inicio
    if (!campos.horaInicio || !campos.horaInicio.trim()) {
      nuevosErrores.horaInicio = "La hora de inicio es obligatoria.";
    }
    // Hora de fin
    if (!campos.horaFin || !campos.horaFin.trim()) {
      nuevosErrores.horaFin = "La hora de fin es obligatoria.";
    }
    // Asesor
    if (!campos.asesor || !campos.asesor.trim()) {
      nuevosErrores.asesor = "El asesor es obligatorio.";
    }
    // No validar detalle (opcional)
    return nuevosErrores;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrores(validarCampos({ ...formData, [name]: value }));
  };

  // Handler específico para número de documento (cedula) con filtrado numérico
  const handleDocumentNumberChangeWrapper = (e) => {
    // Solo aplicar filtrado si el campo NO es readonly
    if (!e.target.readOnly) {
      handleDocumentNumberChange(e, handleInputChange);
    } else {
      handleInputChange(e);
    }
  };

  // Handler específico para teléfono con filtrado numérico
  const handlePhoneChangeWrapper = (e) => {
    // Solo aplicar filtrado si el campo NO es readonly
    if (!e.target.readOnly) {
      handlePhoneChange(e, handleInputChange);
    } else {
      handleInputChange(e);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrores(validarCampos(formData));
  };

  // Función para exportar a Excel las citas del mes visible
  const exportarExcelMesActual = async () => {
    if (!calendarRef.current) return;
    const calendarApi = calendarRef.current.getApi();
    const start = calendarApi.view.currentStart;
    const end = calendarApi.view.currentEnd;
    // Filtrar eventos del mes visible
    const eventosMes = events.filter(ev => {
      const fecha = new Date(ev.start);
      return fecha >= start && fecha < end;
    });
    if (eventosMes.length === 0) {
      await alertService.info("Sin datos", "No hay citas en el mes actual.");
      return;
    }
    // Preparar datos para Excel
    const data = eventosMes.map(ev => ({
      Nombre: ev.extendedProps?.nombre || '',
      Apellido: ev.extendedProps?.apellido || '',
      Cédula: ev.extendedProps?.cedula || '',
      Teléfono: ev.extendedProps?.telefono || '',
      "Tipo de Cita": ev.extendedProps?.tipoCita || '',
      Asesor: ev.extendedProps?.asesor || '',
      Fecha: ev.start ? new Date(ev.start).toLocaleDateString() : '',
      "Hora Inicio": ev.start ? new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      "Hora Fin": ev.end ? new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      Estado: ev.extendedProps?.estado || '',
      Detalle: ev.extendedProps?.detalle || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Citas");
    // Nombre del archivo con mes y año
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesNombre = meses[start.getMonth()];
    const anio = start.getFullYear();
    XLSX.writeFile(wb, `Citas_${mesNombre}_${anio}.xlsx`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 bg-gray-100 min-h-screen pb-4">
      {/* Header principal */}
      <div className="bg-blue-900 rounded-xl shadow-lg p-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaCalendarAlt className="text-white text-4xl" />
            Calendario de Citas
          </h1>
          <p className="text-blue-100 text-lg mt-1">Gestiona tus citas administrativas de forma eficiente</p>
        </div>
        <button className="bg-white text-[#174B8A] font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-100 transition-all">
          {isLoading ? 'Cargando...' : `${events.length} Citas de API`}
        </button>
      </div>

      {/* Barra de controles */}
      <div className="bg-white rounded-xl shadow flex flex-wrap items-center justify-between px-6 py-4 mb-6 gap-4">
        <div className="flex gap-2 items-center">
          <button
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
            onClick={() => {
              if (calendarRef.current) {
                calendarRef.current.getApi().prev();
              }
            }}
            aria-label="Anterior"
          >
            &lt;
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
            onClick={() => {
              if (calendarRef.current) {
                calendarRef.current.getApi().next();
              }
            }}
            aria-label="Siguiente"
          >
            &gt;
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
            onClick={() => {
              if (calendarRef.current) {
                calendarRef.current.getApi().today();
              }
            }}
            aria-label="Hoy"
          >
            Hoy
          </button>
          <button
            className={`border px-4 py-1 rounded-md text-base font-medium ${currentView === 'dayGridMonth' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-800 border-blue-600'}`}
            onClick={() => cambiarVista('dayGridMonth')}
          >
            Mes
          </button>
          <button
            className={`border px-4 py-1 rounded-md text-base font-medium ${currentView === 'timeGridWeek' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-800 border-blue-600'}`}
            onClick={() => cambiarVista('timeGridWeek')}
          >
            Semana
          </button>
          <button
            className={`border px-4 py-1 rounded-md text-base font-medium ${currentView === 'timeGridDay' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-800 border-blue-600'}`}
            onClick={() => cambiarVista('timeGridDay')}
          >
            Día
          </button>
        </div>
        <div className="flex gap-2 items-center flex-1 justify-end">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar citas por nombre, documento, tipo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          {puedeLeer && (
            <DownloadButton
              type="excel"
              onClick={exportarExcelMesActual}
              title="Descargar Excel"
            />
          )}
        </div>
      </div>

      {/* Leyenda de colores y tipos de cita */}
      <div className="flex flex-wrap gap-4 items-center my-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-5 rounded bg-green-500 border border-gray-300"></span>
          <span className="text-sm">Programada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-5 rounded bg-blue-600 border border-gray-300"></span>
          <span className="text-sm">Reprogramada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-5 rounded bg-gray-500 border border-gray-300"></span>
          <span className="text-sm">Anulada</span>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={stat.label} className={`rounded-xl shadow flex items-center justify-between p-4 ${stat.color}`}>
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <div>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Contenedor del calendario */}
      <div className="bg-white rounded-xl shadow-xl p-4 min-h-[500px]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={{
            left: '',
            center: 'title',
            right: ''
          }}
          locale={esLocale}
          events={filtrarEventos(events, busqueda).map((event) => ({
            ...event,
            ...getEventColors(event.extendedProps?.estado),
          }))}
          selectable={puedeCrear}
          selectMirror={puedeCrear}
          dayMaxEvents={1}
          dayMaxEventRows={false}
          eventDisplay="block"
          selectOverlap={false}
          eventClassNames={arg => {
            let base = "custom-event";
            if (arg.view.type === "timeGridWeek" || arg.view.type === "timeGridDay") {
              base += " custom-event-timegrid";
            }
            if (arg.view.type === "dayGridMonth") {
              base += " custom-event-month";
            }
            return base;
          }}
          eventContent={arg => {
            const { event } = arg;
            return (
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1em' }}>
                  {event.extendedProps?.tipoCita || event.title}
                </div>
                {event.extendedProps?.asesor && (
                  <div style={{ fontSize: '0.92em', opacity: 0.9 }}>
                    {event.extendedProps.asesor}
                  </div>
                )}
              </div>
            );
          }}
          eventClick={handleEventClick}
          slotDuration="01:00:00"
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          height="auto"
          select={handleDateSelect}
          selectAllow={(selectInfo) => {
            // Permitir selección en todas las vistas, pero validar fecha en handleDateSelect
            return true;
          }}
        />
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-300">
            <FaCalendarAlt className="text-7xl mb-4" />
            <p className="text-lg">No hay citas programadas</p>
          </div>
        )}
      </div>

      {/* MODAL DE AGENDAR CITA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center sticky top-0 bg-gray-50 z-10">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <FaCalendarAlt className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{modoReprogramar ? 'Reprogramar Cita' : 'Agendar Nueva Cita'}</h2>
                  <p className="text-xs text-gray-500">
                    {modoReprogramar ? 'Modifica solo los campos permitidos para reprogramar la cita' : 'Completa los campos para registrar una cita'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* ✅ Aviso al administrador (solo en modo crear) */}
            {!modoReprogramar && (
              <div className="mx-4 mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-blue-500 text-xl mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    <strong>Importante:</strong> Para crear una cita, el cliente debe estar registrado en el sistema. 
                    Seleccione un cliente de la lista a continuación.
                  </p>
                </div>
              </div>
            )}

            {/* Formulario en dos columnas */}
            <form onSubmit={handleGuardarCita} className="p-4 space-y-4">
              {/* ✅ Selector de Clientes con Búsqueda (solo en modo crear) */}
              {!modoReprogramar && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  {cargandoClientes ? (
                    <div className="flex items-center gap-2 text-gray-600 p-3 border rounded-lg bg-gray-50">
                      <FaSpinner className="animate-spin" />
                      <span className="text-sm">Cargando clientes...</span>
                    </div>
                  ) : clientes.length === 0 ? (
                    <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-300">
                      <p className="text-sm text-yellow-700">
                        No hay clientes disponibles. Debes registrar un cliente primero.
                      </p>
                    </div>
                  ) : (
                    <div className="relative" ref={clienteSearchRef}>
                      {/* Input de búsqueda */}
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={busquedaCliente}
                          onChange={(e) => {
                            setBusquedaCliente(e.target.value);
                            setMostrarListaClientes(true);
                            if (!e.target.value) {
                              setClienteSeleccionado(null);
                              autocompletarDatosCliente(null);
                            }
                          }}
                          onFocus={() => setMostrarListaClientes(true)}
                          placeholder="Buscar cliente por nombre, documento, email o teléfono..."
                          className="w-full border-2 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required={!clienteSeleccionado}
                        />
                        {clienteSeleccionado && (
                          <button
                            type="button"
                            onClick={() => {
                              setClienteSeleccionado(null);
                              setBusquedaCliente("");
                              autocompletarDatosCliente(null);
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                            title="Limpiar selección"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        )}
                      </div>
                      
                      {/* Lista desplegable de clientes filtrados */}
                      {mostrarListaClientes && clientesFiltrados.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {clientesFiltrados.map((cliente) => {
                            const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
                            const tipoDoc = cliente.tipoDocumento || cliente.tipo_documento || 'CC';
                            const documento = cliente.documento || '';
                            const textoMostrar = `${nombreCompleto} - ${tipoDoc} ${documento}`;
                            const esSeleccionado = clienteSeleccionado?.id_cliente === cliente.id_cliente;
                            
                            return (
                              <button
                                key={cliente.id_cliente}
                                type="button"
                                onClick={() => autocompletarDatosCliente(cliente)}
                                className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                                  esSeleccionado ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{nombreCompleto}</div>
                                    <div className="text-xs text-gray-500">
                                      {tipoDoc} {documento}
                                      {cliente.correo || cliente.email ? ` • ${cliente.correo || cliente.email}` : ''}
                                      {cliente.telefono ? ` • ${cliente.telefono}` : ''}
                                    </div>
                                  </div>
                                  {esSeleccionado && (
                                    <FaSearch className="text-blue-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Mensaje cuando no hay resultados */}
                      {mostrarListaClientes && busquedaCliente.trim() && clientesFiltrados.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4">
                          <p className="text-sm text-gray-500 text-center">
                            No se encontraron clientes que coincidan con "{busquedaCliente}"
                          </p>
                        </div>
                      )}
                      
                      {/* Validación visual si es requerido y no hay selección */}
                      {!clienteSeleccionado && (
                        <input
                          type="hidden"
                          value=""
                          required
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Información del Cliente Seleccionado (solo en modo crear) */}
              {!modoReprogramar && clienteSeleccionado && (
                <div className="mb-4 p-4 bg-gray-50 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Datos del Cliente Seleccionado:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Nombre:</strong> {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</div>
                    <div><strong>Documento:</strong> {clienteSeleccionado.tipoDocumento || clienteSeleccionado.tipo_documento || 'CC'} {clienteSeleccionado.documento}</div>
                    <div>
                      <strong>Teléfono:</strong> {
                        clienteSeleccionado.telefono && 
                        clienteSeleccionado.telefono.trim() !== '' && 
                        clienteSeleccionado.telefono.toUpperCase() !== 'N/A'
                          ? clienteSeleccionado.telefono 
                          : <span className="text-yellow-600 italic">No registrado (puedes agregarlo a continuación)</span>
                      }
                    </div>
                    <div><strong>Email:</strong> {clienteSeleccionado.email || 'N/A'}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <FaUser className="inline text-gray-400 mr-1" /> Nombre <span className="text-gray-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 border rounded-md shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.nombre}
                    readOnly={modoReprogramar || clienteSeleccionado} // ✅ Readonly si hay cliente seleccionado (siempre)
                  />
                  {touched.nombre && errores.nombre && <p className="text-red-600 text-xs mt-1">{errores.nombre}</p>}
                </div>
                {/* Apellido */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <FaUser className="inline text-gray-400 mr-1" /> Apellido <span className="text-gray-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 border rounded-md shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.apellido}
                    readOnly={modoReprogramar || clienteSeleccionado} // ✅ Readonly si hay cliente seleccionado (siempre)
                  />
                  {touched.apellido && errores.apellido && <p className="text-red-600 text-xs mt-1">{errores.apellido}</p>}
                </div>
                {/* Tipo de documento */}
                <div>
                  {(() => {
                    // ✅ Verificar si el cliente tiene tipo de documento válido (excluyendo valores por defecto)
                    const tipoDocCliente = clienteSeleccionado?.tipoDocumento || clienteSeleccionado?.tipo_documento || '';
                    const tieneTipoDocValido = clienteSeleccionado && 
                      tipoDocCliente &&
                      typeof tipoDocCliente === 'string' &&
                      tipoDocCliente.trim() !== '' &&
                      // ✅ Verificar que el formData también tenga el mismo valor (no es solo el default)
                      formData.tipoDocumento === tipoDocCliente;
                    const esTipoDocDisabled = modoReprogramar || tieneTipoDocValido;
                    
                    return (
                      <>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <FaFileAlt className="inline text-gray-400 mr-1" /> Tipo de documento <span className="text-gray-500">*</span>
                          {clienteSeleccionado && !tieneTipoDocValido && (
                            <span className="ml-2 text-xs text-yellow-600 italic">(Puedes agregarlo)</span>
                          )}
                        </label>
                        <select
                          name="tipoDocumento"
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-2 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-sm ${
                            esTipoDocDisabled ? 'bg-gray-100' : 'bg-white'
                          }`}
                          value={formData.tipoDocumento}
                          disabled={esTipoDocDisabled} // ✅ Disabled solo si está en modo reprogramar O si el cliente tiene tipo de documento válido
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                          <option value="Cédula de extranjería">Cédula de extranjería</option>
                          <option value="Pasaporte">Pasaporte</option>
                          <option value="NIT">NIT</option>
                          <option value="Otro">Otro</option>
                        </select>
                        {touched.tipoDocumento && errores.tipoDocumento && <p className="text-red-600 text-xs mt-1">{errores.tipoDocumento}</p>}
                      </>
                    );
                  })()}
                </div>
                {/* Número de documento */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <FaFileAlt className="inline text-gray-400 mr-1" /> Número de documento <span className="text-gray-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    onChange={handleDocumentNumberChangeWrapper}
                    onKeyDown={(e) => {
                      if (!e.target.readOnly) {
                        handleDocumentNumberKeyDown(e);
                      }
                    }}
                    onPaste={(e) => {
                      if (!e.target.readOnly) {
                        handleNumericPaste(e, {});
                      }
                    }}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 border rounded-md shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.cedula}
                    readOnly={modoReprogramar || clienteSeleccionado} // ✅ Readonly si hay cliente seleccionado (siempre)
                  />
                  {touched.cedula && errores.cedula && <p className="text-red-600 text-xs mt-1">{errores.cedula}</p>}
                </div>
                {/* Teléfono */}
                <div>
                  {(() => {
                    // ✅ Calcular si el cliente tiene teléfono válido (excluyendo "N/A", null, undefined, cadenas vacías)
                    const telefonoCliente = clienteSeleccionado?.telefono || '';
                    const tieneTelefonoValido = clienteSeleccionado && 
                      telefonoCliente &&
                      typeof telefonoCliente === 'string' && 
                      telefonoCliente.trim() !== '' &&
                      telefonoCliente.toUpperCase() !== 'N/A' &&
                      telefonoCliente.trim() !== 'null' &&
                      telefonoCliente.trim() !== 'undefined';
                    
                    const esTelefonoReadonly = modoReprogramar || tieneTelefonoValido;
                    const clienteSinTelefono = clienteSeleccionado && !tieneTelefonoValido;
                    
                    return (
                      <>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <FaPhone className="inline text-gray-400 mr-1" /> Teléfono <span className="text-gray-500">*</span>
                          {clienteSinTelefono && (
                            <span className="ml-2 text-xs text-yellow-600 italic">(Puedes agregarlo aquí)</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="telefono"
                          onChange={handlePhoneChangeWrapper}
                          onKeyDown={(e) => {
                            if (!e.target.readOnly) {
                              handlePhoneKeyDown(e);
                            }
                          }}
                          onPaste={(e) => {
                            if (!e.target.readOnly) {
                              handleNumericPaste(e, { allowPlus: true, allowSpaces: true, allowDashes: true, allowParentheses: true });
                            }
                          }}
                          onBlur={handleBlur}
                          className={`w-full px-2 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-sm ${
                            esTelefonoReadonly ? 'bg-gray-100' : 'bg-white'
                          }`}
                          value={formData.telefono}
                          readOnly={esTelefonoReadonly} // ✅ Readonly solo si está en modo reprogramar O si el cliente tiene teléfono válido
                          placeholder={clienteSinTelefono ? "Ingresa el teléfono del cliente" : ""}
                        />
                        {touched.telefono && errores.telefono && <p className="text-red-600 text-xs mt-1">{errores.telefono}</p>}
                        {clienteSinTelefono && !formData.telefono && (
                          <p className="text-yellow-600 text-xs mt-1">⚠️ Este cliente no tiene teléfono registrado. Por favor, agréguelo.</p>
                        )}
                      </>
                    );
                  })()}
                </div>
                {/* Tipo de Cita */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <FaBriefcase className="inline text-gray-400 mr-1" /> Tipo de Cita <span className="text-gray-500">*</span>
                  </label>
                  <select
                    name="tipoCita"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 border rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.tipoCita}
                    disabled={!modoReprogramar ? false : !modoReprogramar ? false : false}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="General">General</option>
                    <option value="Oposición">Oposición</option>
                    <option value="Certificación">Certificación</option>
                    <option value="Búsqueda de antecedentes">Búsqueda de antecedentes</option>
                    <option value="Cesión de marca">Cesión de marca</option>
                    <option value="Renovación">Renovación</option>
                  </select>
                  {touched.tipoCita && errores.tipoCita && <p className="text-red-600 text-xs mt-1">{errores.tipoCita}</p>}
                </div>
                {/* Hora Inicio */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora de Inicio <span className="text-gray-500">*</span></label>
                  <select
                    name="horaInicio"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 border rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.horaInicio}
                    disabled={!modoReprogramar ? false : !modoReprogramar ? false : false}
                  >
                    <option value="">Seleccionar...</option>
                    {opcionesHora.map(hora => {
                      const fechaValidacion = modalDate?.startStr?.split('T')[0] || new Date().toISOString().split('T')[0];
                      return (
                        <option key={hora.value} value={hora.value} disabled={horaEstaOcupada(hora.value, fechaValidacion)}>{hora.label}</option>
                      );
                    })}
                  </select>
                  {touched.horaInicio && errores.horaInicio && <p className="text-red-600 text-xs mt-1">{errores.horaInicio}</p>}
                </div>
                {/* Hora Fin */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora de Fin <span className="text-gray-500">*</span></label>
                  <select
                    name="horaFin"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 border rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.horaFin}
                    disabled={!modoReprogramar ? false : !modoReprogramar ? false : false}
                  >
                    <option value="">Seleccionar...</option>
                    {opcionesHora.map(hora => {
                      const menorOIgual = formData.horaInicio && hora.value <= formData.horaInicio;
                      const fechaValidacion = modalDate?.startStr?.split('T')[0] || new Date().toISOString().split('T')[0];
                      const cruce = horaEstaOcupada(hora.value, fechaValidacion);
                      return (
                        <option key={hora.value} value={hora.value} disabled={menorOIgual || cruce}>
                          {hora.label}
                        </option>
                      );
                    })}
                  </select>
                  {touched.horaFin && errores.horaFin && <p className="text-red-600 text-xs mt-1">{errores.horaFin}</p>}
                </div>
                {/* Asesor - Buscador */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <FaUser className="inline text-gray-400 mr-1" /> Asesor <span className="text-gray-500">*</span>
                    {loadingEmpleados && (
                      <span className="ml-2 text-blue-600 text-xs">
                        <i className="bi bi-arrow-repeat animate-spin"></i> Cargando...
                      </span>
                    )}
                  </label>
                  
                  {/* Input de búsqueda */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar empleado por nombre o documento..."
                      value={busquedaEmpleado}
                      onChange={handleBusquedaEmpleadoChange}
                      onFocus={() => setMostrarListaEmpleados(true)}
                      onBlur={() => {
                        // Delay para permitir click en la lista
                        setTimeout(() => setMostrarListaEmpleados(false), 200);
                      }}
                      disabled={loadingEmpleados || empleadosActivos.length === 0}
                      className={`w-full px-2 py-1.5 pl-8 border rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                        loadingEmpleados || empleadosActivos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      } ${touched.asesor && errores.asesor ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <i className="bi bi-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                    
                    {/* Botón para limpiar búsqueda */}
                    {busquedaEmpleado && !loadingEmpleados && (
                      <button
                        type="button"
                        onClick={() => {
                          setBusquedaEmpleado('');
                          setEmpleadoSeleccionado(null);
                          setFormData(prev => ({ ...prev, asesor: '' }));
                          setMostrarListaEmpleados(false);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className="bi bi-x-circle text-xs"></i>
                      </button>
                    )}
                  </div>

                  {/* Lista desplegable de empleados filtrados */}
                  {mostrarListaEmpleados && !loadingEmpleados && empleadosFiltrados.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {empleadosFiltrados.map(emp => (
                        <div
                          key={emp.id_empleado || emp.cedula}
                          onClick={() => handleSeleccionarEmpleado(emp)}
                          className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors text-sm ${
                            empleadoSeleccionado?.id_empleado === emp.id_empleado ? 'bg-blue-100' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{emp.nombreCompleto}</p>
                              {emp.cedula && (
                                <p className="text-xs text-gray-500">CC {emp.cedula}</p>
                              )}
                            </div>
                            {empleadoSeleccionado?.id_empleado === emp.id_empleado && (
                              <i className="bi bi-check-circle text-blue-600"></i>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mensaje cuando no hay resultados */}
                  {mostrarListaEmpleados && !loadingEmpleados && busquedaEmpleado.trim() && empleadosFiltrados.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                      <p className="text-xs text-gray-500 text-center">
                        No se encontraron empleados que coincidan con "{busquedaEmpleado}"
                      </p>
                    </div>
                  )}

                  {/* Mensajes de estado */}
                  {loadingEmpleados && empleadosActivos.length === 0 && (
                    <p className="text-blue-600 text-xs mt-1 flex items-center">
                      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                      Cargando empleados desde la base de datos...
                    </p>
                  )}
                  {!loadingEmpleados && empleadosActivos.length === 0 && (
                    <p className="text-yellow-600 text-xs mt-1 flex items-center">
                      <i className="bi bi-exclamation-triangle mr-2"></i>
                      No hay empleados disponibles. Verifique que existan empleados activos en el sistema.
                    </p>
                  )}
                  {touched.asesor && errores.asesor && <p className="text-red-600 text-xs mt-1">{errores.asesor}</p>}

                  {/* Mostrar empleado seleccionado */}
                  {empleadoSeleccionado && !mostrarListaEmpleados && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs font-medium text-gray-700">
                        <i className="bi bi-check-circle text-blue-600 mr-1"></i>
                        Asesor seleccionado: <span className="font-semibold">{empleadoSeleccionado.nombreCompleto}</span>
                      </p>
                      {empleadoSeleccionado.cedula && (
                        <p className="text-xs text-gray-500 mt-0.5">CC {empleadoSeleccionado.cedula}</p>
                      )}
                    </div>
                  )}
                </div>
                {/* Detalle */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <FaFileAlt className="inline text-gray-400 mr-1" /> Detalle
                  </label>
                  <textarea
                    name="detalle"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 border rounded-md shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={1}
                    value={formData.detalle}
                    readOnly={modoReprogramar}
                    placeholder="Detalles adicionales de la cita (opcional)..."
                  />
                  {touched.detalle && errores.detalle && <p className="text-red-600 text-xs mt-1">{errores.detalle}</p>}
                </div>
              </div>
              {/* Botones */}
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={cerrarModal} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                  {modoReprogramar ? 'Reprogramar Cita' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      

      {showDetalle && (
        <VerDetalleCita
          cita={citaSeleccionada}
          isOpen={showDetalle}
          onClose={() => setShowDetalle(false)}
          onReprogramar={() => {
            setModoReprogramar(true);
            setShowDetalle(false);
            setShowModal(true);
            // Precarga los datos de la cita a reprogramar
            setFormData({
              nombre: citaSeleccionada.nombre,
              apellido: citaSeleccionada.apellido,
              cedula: citaSeleccionada.cedula,
              telefono: citaSeleccionada.telefono,
              tipoCita: citaSeleccionada.tipoCita,
              horaInicio: citaSeleccionada.horaInicio,
              horaFin: citaSeleccionada.horaFin,
              asesor: citaSeleccionada.asesor,
              detalle: citaSeleccionada.detalle,
            });
            // Establecer empleado seleccionado si existe
            if (citaSeleccionada.asesor && empleadosActivos.length > 0) {
              const empleado = empleadosActivos.find(emp => emp.nombreCompleto === citaSeleccionada.asesor);
              if (empleado) {
                setEmpleadoSeleccionado(empleado);
                setBusquedaEmpleado(`${empleado.nombreCompleto} ${empleado.cedula ? `- ${empleado.cedula}` : ''}`);
              }
            }
          }}
          onAnular={handleAnularCitaModal}
          puedeReprogramar={puedeModificar && citaSeleccionada?.estado !== "Cita anulada"}
          puedeAnular={puedeEliminar && citaSeleccionada?.estado !== "Cita anulada"}
        />
      )}
      {modalEventos.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Eventos en {modalEventos.hora}</h2>
            <ul>
              {modalEventos.eventos.map((ev, idx) => (
                <li key={ev.publicId || idx} className="mb-2">
                  <span className="font-semibold">{ev.title}</span>
                  {ev.asesor && (
                    <span className="ml-2 text-gray-600">({ev.asesor})</span>
                  )}
                </li>
              ))}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setModalEventos({ open: false, eventos: [], hora: "" })}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* ✅ Modal separado para agendar citas desde solicitudes */}
      <ModalAgendarDesdeSolicitud
        isOpen={modalDesdeSolicitudOpen}
        onClose={() => {
          setModalDesdeSolicitudOpen(false);
          setSolicitudParaAgendar(null);
        }}
        solicitudData={solicitudParaAgendar}
        onSuccess={handleCitaCreadaDesdeSolicitud}
        events={events}
      />
    </div>
  );
};

export default Calendario;