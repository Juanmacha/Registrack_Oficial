import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import VerDetalleVenta from "./verDetalleVenta";
import Seguimiento from "./seguimiento";
import EditarVenta from "./editarVenta";
import SeleccionarTipoSolicitud from "./SeleccionarTipoSolicitud";
import { crearVenta, agregarComentario, anularVenta, initDatosPrueba, actualizarVenta, getInProcess } from "../services/ventasService";
import { mockDataService } from '../../../../../utils/mockDataService.js';
import { useSalesSync } from '../../../../../utils/hooks/useAsyncDataSync.js';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import DownloadButton from "../../../../../shared/components/DownloadButton";
import { AlertService } from '../../../../../shared/styles/alertStandards.js';
import getEstadoBadge from "../services/getEstadoBadge";
import CrearSolicitud from "./CrearSolicitud";
import Swal from 'sweetalert2';
import StandardAvatar from "../../../../../shared/components/StandardAvatar";
import * as xlsx from "xlsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { EmployeeService } from '../../../../../utils/mockDataService.js';
import ActionDropdown from '../../../../../shared/components/ActionDropdown.jsx';
import empleadosApiService from '../../../../dashboard/services/empleadosApiService';
import solicitudesApiService from '../services/solicitudesApiService';
import seguimientoApiService from '../services/seguimientoApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';

const TablaVentasProceso = ({ adquirir }) => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const registrosPorPagina = 5;
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalObservacionOpen, setModalObservacionOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [datoSeleccionado, setDatoSeleccionado] = useState(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [modalTipoOpen, setModalTipoOpen] = useState(false);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [modalAnularOpen, setModalAnularOpen] = useState(false);
  const [motivoAnular, setMotivoAnular] = useState("");
  const [servicioFiltro, setServicioFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [modalAsignarEncargadoOpen, setModalAsignarEncargadoOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [empleadosAPI, setEmpleadosAPI] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  // ✅ NUEVO: Usar API real para ventas en proceso
  const [ventasEnProceso, refreshVentas, loading, lastUpdate, error] = useSalesSync(
    async () => {
      const token = getToken();
      if (!token) {
        console.warn("🔧 [useSalesSync] No hay token, retornando array vacío");
        return [];
      }
      
      try {
        console.log("🔧 [TablaVentasProceso] Obteniendo solicitudes de la API...");
        const solicitudes = await solicitudesApiService.getAllSolicitudes(token);
        console.log("✅ [TablaVentasProceso] Solicitudes obtenidas:", solicitudes.length);
        
        // Transformar todas las solicitudes
        const ventasTransformadas = solicitudes.map(s => solicitudesApiService.transformarRespuestaDelAPI(s));
        
        // ✅ CORRECTO: Filtrar solo las que están en proceso (excluir solo estados terminales)
        const ventasEnProceso = ventasTransformadas.filter(v => {
          // Estados terminales del sistema (solicitudes finalizadas, no se pueden modificar):
          // ⚠️ IMPORTANTE: Backend puede usar tanto femenino como masculino ("Finalizada" y "Finalizado")
          const estadosTerminales = ['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'];
          const esEnProceso = !estadosTerminales.includes(v.estado);
          
          // Estados en proceso incluyen TODOS los process_states dinámicos del servicio:
          // Ejemplos: "Solicitud Inicial", "Verificación de Documentos", "Procesamiento de Pago",
          // "Consulta en BD", "Generación de Certificado", "Entrega Final", etc.
          return esEnProceso;
        });
        
        console.log("✅ [TablaVentasProceso] Ventas en proceso:", ventasEnProceso.length);
        console.log("✅ [TablaVentasProceso] Estados encontrados:", ventasTransformadas.map(v => v.estado));
        return ventasEnProceso;
      } catch (error) {
        console.error("❌ [useSalesSync] Error cargando ventas en proceso:", error);
        return [];
      }
    },
    [] // ✅ CORREGIDO: Sin dependencias innecesarias
  );

  // Filtrar por texto, servicio y estado
  const texto = busqueda.trim().toLowerCase();
  const datosFiltrados = ventasEnProceso.filter(item => {
    const coincideServicio = servicioFiltro === 'Todos' || item.tipoSolicitud === servicioFiltro;
    const coincideEstado = estadoFiltro === 'Todos' || item.estado === estadoFiltro;
    const coincideTexto =
      !texto ||
      (item.titular && item.titular.toLowerCase().includes(texto)) ||
      (item.marca && item.marca.toLowerCase().includes(texto));
    return coincideServicio && coincideEstado && coincideTexto;
  });

  // Paginado manual
  const total = datosFiltrados.length;
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, fin);

  // Actualizar total de registros cuando cambian los datos
  useEffect(() => {
    setTotalRegistros(datosFiltrados.length);
  }, [datosFiltrados]);

  // ✅ NUEVO: Actualizar servicios y estados disponibles basados en las ventas reales
  useEffect(() => {
    if (ventasEnProceso && ventasEnProceso.length > 0) {
      // Obtener servicios únicos de las ventas en proceso
      const serviciosUnicos = Array.from(new Set(ventasEnProceso.map(v => v.tipoSolicitud))).filter(Boolean);
      setServiciosDisponibles(['Todos', ...serviciosUnicos]);
      
      // Obtener estados únicos de las ventas en proceso
      const estadosUnicos = Array.from(new Set(ventasEnProceso.map(v => v.estado))).filter(Boolean);
      setEstadosDisponibles(['Todos', ...estadosUnicos]);
      
      console.log("✅ [TablaVentasProceso] Servicios disponibles actualizados:", serviciosUnicos);
      console.log("✅ [TablaVentasProceso] Estados disponibles actualizados:", estadosUnicos);
    }
  }, [ventasEnProceso]);

  // Abrir modal de creación si viene adquirir
  useEffect(() => {
    if (adquirir) {
      setTipoSeleccionado('');
      setModalTipoOpen(false);
      setModalCrearOpen(true);
      setModoCrear(true);
    }
  }, [adquirir]);

  // Cargar empleados de la API cuando se abre el modal de asignar encargado
  useEffect(() => {
    if (modalAsignarEncargadoOpen) {
      cargarEmpleadosAPI();
    }
  }, [modalAsignarEncargadoOpen]);

  const cargarEmpleadosAPI = async () => {
    setLoadingEmpleados(true);
    try {
      const resultado = await empleadosApiService.getAllEmpleados();
      if (resultado.success) {
        // Filtrar solo empleados activos
        const empleadosActivos = resultado.data.filter(e => e.estado_empleado === true || e.estado_empleado === 1);
        setEmpleadosAPI(empleadosActivos);
        console.log('✅ [TablaVentasProceso] Empleados cargados desde API:', empleadosActivos);
      } else {
        console.error('❌ [TablaVentasProceso] Error al cargar empleados:', resultado.message);
        AlertService.error('Error', 'No se pudieron cargar los empleados');
        setEmpleadosAPI([]);
      }
    } catch (error) {
      console.error('❌ [TablaVentasProceso] Error al cargar empleados:', error);
      AlertService.error('Error', 'No se pudieron cargar los empleados');
      setEmpleadosAPI([]);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const handleGuardarEdicion = async (datosActualizados) => {
    if (!datoSeleccionado || !datoSeleccionado.id) {
      AlertService.error('Error', 'No se ha seleccionado una solicitud para editar');
      return;
    }

    try {
      console.log('🔧 [handleGuardarEdicion] Actualizando solicitud:', datoSeleccionado.id, datosActualizados);
      
      const token = getToken();
      if (!token) {
        AlertService.error('Error', 'No se encontró token de autenticación');
        return;
      }

      // ✅ Mapear datos del formulario al formato de la API
      const datosAPI = {
        pais: datosActualizados.pais || '',
        ciudad: datosActualizados.ciudad || '',
        tipodepersona: datosActualizados.tipoPersona || '',
        tipodedocumento: datosActualizados.tipoDocumento || '',
        numerodedocumento: datosActualizados.numeroDocumento || '',
        nombrecompleto: datosActualizados.nombres && datosActualizados.apellidos 
          ? `${datosActualizados.nombres} ${datosActualizados.apellidos}`.trim()
          : datosActualizados.titular || '',
        correoelectronico: datosActualizados.email || '',
        telefono: datosActualizados.telefono || '',
        direccion: datosActualizados.direccion || '',
        tipodeentidadrazonsocial: datosActualizados.tipoEntidad || '',
        nombredelaempresa: datosActualizados.nombreEmpresa || '',
        nit: datosActualizados.nit || '',
        poderdelrepresentanteautorizado: datosActualizados.poderRepresentante || '',
        poderparaelregistrodelamarca: datosActualizados.poderAutorizacion || ''
      };

      // ✅ Llamar a la API
      await solicitudesApiService.editarSolicitud(datoSeleccionado.id, datosAPI, token);
      
      AlertService.success('Éxito', 'Solicitud actualizada correctamente');
      
      // ✅ Cerrar modal y refrescar datos
      setModalEditarOpen(false);
      setModoCrear(false);
      
      // ✅ Refresh después de un delay para asegurar que el backend procesó
      setTimeout(() => {
        refreshVentas();
      }, 300);
      
    } catch (error) {
      console.error('❌ [handleGuardarEdicion] Error actualizando solicitud:', error);
      AlertService.error('Error', 'No se pudo actualizar la solicitud. Intenta de nuevo.');
    }
  };

  // Nuevo flujo: abrir modal de tipo
  const handleCrear = () => {
    setModalTipoOpen(true);
  };

  // Al seleccionar tipo de solicitud
  const handleSeleccionarTipo = (tipo) => {
    setModalTipoOpen(false);
    setTipoSeleccionado(tipo);
    setModalCrearOpen(true);
  };

  const handleGuardarNuevaVenta = async (nuevaVenta) => {
    console.log("🔧 [handleGuardarNuevaVenta] Iniciando creación de venta:", nuevaVenta);
    try {
      const resultado = await crearVenta(nuevaVenta); // Guardar la venta en el almacenamiento
      console.log("🔧 [handleGuardarNuevaVenta] Venta creada exitosamente:", resultado);
      
      setModalCrearOpen(false);
      setModoCrear(false);
      setPaginaActual(1); // Forzar a la primera página
      
      // Refrescar inmediatamente después de crear
      console.log("🔧 [handleGuardarNuevaVenta] Refrescando datos...");
      refreshVentas();
      
      AlertService.success("Solicitud creada", "La solicitud se ha creado correctamente.");
    } catch (error) {
      console.error("🔧 [handleGuardarNuevaVenta] Error al crear la venta:", error);
      AlertService.error("Error al crear", "No se pudo crear la solicitud. Inténtalo de nuevo.");
    }
  };


  const handleGuardarComentario = async (datos) => {
    if (!datoSeleccionado || !datoSeleccionado.id) {
      AlertService.error('Error', 'No se ha seleccionado una solicitud para agregar seguimiento');
      return;
    }

    try {
      console.log('🔧 [handleGuardarComentario] Agregando seguimiento a solicitud:', datoSeleccionado.id, datos);
      
      const token = getToken();
      if (!token) {
        AlertService.error('Error', 'No se encontró token de autenticación');
        return;
      }

      // ✅ Crear seguimiento con los datos del formulario
      // Validar que id_orden_servicio sea un número válido
      const idOrdenServicio = parseInt(datoSeleccionado.id);
      if (isNaN(idOrdenServicio) || idOrdenServicio <= 0) {
        AlertService.error('Error', 'ID de orden de servicio inválido');
        return;
      }

      // ✅ Construir payload según documentación exacta del backend
      // Campos requeridos según backend (validación en servicio)
      if (!datos.titulo || !datos.titulo.trim()) {
        AlertService.error('Error', 'El título es requerido');
        return;
      }

      if (!datos.descripcion || !datos.descripcion.trim()) {
        AlertService.error('Error', 'La descripción es requerida');
        return;
      }

      // Validar longitud del título (máx 200 caracteres según backend)
      if (datos.titulo.trim().length > 200) {
        AlertService.error('Error', 'El título no puede exceder los 200 caracteres');
        return;
      }

      // Construir payload mínimo requerido
      const datosSeguimiento = {
        id_orden_servicio: idOrdenServicio,
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim()
      };

      // Campos opcionales según la documentación del backend
      // Solo agregar si tienen valor (no enviar null o undefined)
      if (datos.observaciones && datos.observaciones.trim()) {
        datosSeguimiento.observaciones = datos.observaciones.trim();
      }

      if (datos.documentos_adjuntos && datos.documentos_adjuntos.trim()) {
        datosSeguimiento.documentos_adjuntos = datos.documentos_adjuntos.trim();
      }

      // Si hay cambio de estado, agregar nuevo_proceso (nombre exacto del estado según backend)
      if (datos.nuevo_proceso && datos.nuevo_proceso.trim()) {
        datosSeguimiento.nuevo_proceso = datos.nuevo_proceso.trim();
      }

      console.log('📤 [handleGuardarComentario] Payload que se enviará a la API:', JSON.stringify(datosSeguimiento, null, 2));
      console.log('📤 [handleGuardarComentario] Verificación de campos requeridos:', {
        id_orden_servicio: datosSeguimiento.id_orden_servicio,
        titulo: datosSeguimiento.titulo?.length || 0,
        descripcion: datosSeguimiento.descripcion?.length || 0
      });
      
      const respuestaSeguimiento = await seguimientoApiService.crearSeguimiento(datosSeguimiento, token);
      
      // ✅ Verificar si el nuevo estado es terminal (Finalizada/Finalizado)
      const nuevoEstadoEsFinal = datosSeguimiento.nuevo_proceso && 
        ['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'].includes(datosSeguimiento.nuevo_proceso);
      
      if (nuevoEstadoEsFinal) {
        console.log('✅ [handleGuardarComentario] El nuevo estado es terminal. La solicitud se moverá a finalizadas.');
        // Notificar a la tabla de finalizadas para que se refresque
        window.dispatchEvent(new CustomEvent('solicitudFinalizada', {
          detail: {
            id_orden_servicio: idOrdenServicio,
            nuevo_estado: datosSeguimiento.nuevo_proceso
          }
        }));
      }
      
      AlertService.success('Éxito', 'Seguimiento agregado correctamente');
      
      // ✅ Cerrar modal
      setModalObservacionOpen(false);
      
      // ✅ Refresh después de un delay para asegurar consistencia
      // Si el estado es terminal, la solicitud desaparecerá de esta tabla automáticamente
      setTimeout(() => {
        refreshVentas();
      }, 300);
      
    } catch (error) {
      console.error('❌ [handleGuardarComentario] Error agregando seguimiento:', error);
      console.error('❌ [handleGuardarComentario] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Manejar diferentes tipos de errores según documentación del backend
      let errorMessage = 'No se pudo agregar el seguimiento. Intenta de nuevo.';
      
      if (error.message) {
        // Mensajes específicos del backend según documentación
        if (error.message.includes('Campo') && error.message.includes('requerido')) {
          errorMessage = error.message;
        } else if (error.message.includes('título') || error.message.includes('200 caracteres')) {
          errorMessage = error.message;
        } else if (error.message.includes('proceso') && error.message.includes('válido')) {
          errorMessage = error.message;
        } else if (error.message.includes('Orden de servicio no encontrada')) {
          errorMessage = 'La orden de servicio no existe o no es válida.';
        } else if (error.message.includes('No autorizado') || error.message.includes('autenticado')) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.message.includes('Error interno del servidor')) {
          errorMessage = 'Error del servidor. Por favor, verifica que la orden existe y vuelve a intentar. Si el problema persiste, contacta al administrador.';
        } else {
          errorMessage = error.message;
        }
      }
      
      AlertService.error('Error', errorMessage);
    }
  };

  const handleAnular = async () => {
    // ✅ NUEVO: Validar que haya un motivo antes de continuar
    if (!motivoAnular.trim()) {
      AlertService.error('Motivo requerido', 'Debes proporcionar un motivo para anular la solicitud.');
      return;
    }
    
    try {
      const token = getToken();
      if (!token) {
        AlertService.error('Error', 'No hay sesión activa');
        return;
      }

      console.log("🔧 [TablaVentasProceso] Anulando solicitud:", datoSeleccionado.id);
      console.log("🔧 [TablaVentasProceso] Motivo:", motivoAnular.trim());
      
      // ✅ USAR API REAL - Ahora pasando el motivo como segundo parámetro
      const resultado = await solicitudesApiService.anularSolicitud(
        datoSeleccionado.id, 
        motivoAnular.trim(), 
        token
      );
      
      console.log("✅ [TablaVentasProceso] Solicitud anulada - ID:", datoSeleccionado.id);
      console.log("✅ [TablaVentasProceso] Resultado:", resultado);
      
      // Cerrar modal y limpiar
      setModalAnularOpen(false);
      setMotivoAnular("");
      
      AlertService.success("Venta anulada", "La venta ha sido anulada correctamente. Se ha enviado una notificación por email.");
      
      // ✅ MEJORADO: Notificar inmediatamente a otras tablas
      console.log("🔔 [TablaVentasProceso] Notificando anulación a TablaVentasFin...");
      window.dispatchEvent(new CustomEvent('solicitudAnulada', { 
        detail: { 
          id: datoSeleccionado.id,
          estado: 'Anulada' 
        } 
      }));
      
      // ✅ MEJORADO: Esperar y refrescar múltiples veces para asegurar sincronización
      console.log("🔄 [TablaVentasProceso] Iniciando refresh de datos...");
      
      // Refresh inmediato
      await refreshVentas();
      
      // Segundo refresh después de 300ms (dar tiempo al backend)
      setTimeout(async () => {
        console.log("🔄 [TablaVentasProceso] Segundo refresh (300ms)...");
        await refreshVentas();
      }, 300);
      
      // Tercer refresh después de 800ms (por si el backend es lento)
      setTimeout(async () => {
        console.log("🔄 [TablaVentasProceso] Tercer refresh (800ms)...");
        await refreshVentas();
      }, 800);
    } catch (err) {
      console.error("❌ [TablaVentasProceso] Error al anular:", err);
      AlertService.error("Error al anular", err.message || "No se pudo anular la solicitud");
    }
  };

  const exportarExcel = () => {
    // Encabezados organizados por secciones
    const encabezados = [
      "Titular", "Tipo de Solicitante", "Tipo de Persona", "Tipo de Documento", "N° Documento", 
      "Email", "Teléfono", "Dirección", "Tipo de Entidad", "Razón Social", "Nombre Empresa", "NIT", 
      "Poder Representante", "Poder Autorización", "Estado", "Tipo de Solicitud", "Encargado", 
      "Fecha Solicitud", "Próxima Cita", "Motivo Anulación", "País", "NIT Marca", "Nombre Marca", 
      "Categoría", "Certificado Cámara", "Logotipo Marca", "Clases", "Comentarios"
    ];
    
    const datosExcel = datosFiltrados.map(item => ({
      Titular: item.titular || item.nombreCompleto || '',
      "Tipo de Solicitante": item.tipoSolicitante || '',
      "Tipo de Persona": item.tipoPersona || '',
      "Tipo de Documento": item.tipoDocumento || '',
      "N° Documento": item.numeroDocumento || '',
      Email: item.email || '',
      Teléfono: item.telefono || '',
      Dirección: item.direccion || '',
      "Tipo de Entidad": item.tipoEntidad || '',
      "Razón Social": item.razonSocial || '',
      "Nombre Empresa": item.nombreEmpresa || '',
      NIT: item.nit || '',
      "Poder Representante": typeof item.poderRepresentante === 'string' ? item.poderRepresentante : (item.poderRepresentante?.name || ''),
      "Poder Autorización": typeof item.poderAutorizacion === 'string' ? item.poderAutorizacion : (item.poderAutorizacion?.name || ''),
      Estado: item.estado || '',
      "Tipo de Solicitud": item.tipoSolicitud || '',
      Encargado: item.encargado || '',
      "Fecha Solicitud": item.fechaSolicitud || '',
      "Próxima Cita": item.proximaCita || '',
      "Motivo Anulación": item.motivoAnulacion || '',
      País: item.pais || '',
      "NIT Marca": item.nitMarca || '',
      "Nombre Marca": item.nombreMarca || '',
      Categoría: item.categoria || '',
      "Certificado Cámara": typeof item.certificadoCamara === 'string' ? item.certificadoCamara : (item.certificadoCamara?.name || ''),
      "Logotipo Marca": typeof item.logotipoMarca === 'string' ? item.logotipoMarca : (item.logotipoMarca?.name || ''),
      Clases: Array.isArray(item.clases) ? item.clases.map(c => `N°: ${c.numero}, Desc: ${c.descripcion}`).join(' | ') : '',
      Comentarios: Array.isArray(item.comentarios) ? item.comentarios.map(c => `${c.autor || 'Sistema'}: ${c.texto} (${c.fecha})`).join(' | ') : ''
    }));

    // Crear worksheet con datos
    const worksheet = xlsx.utils.json_to_sheet(datosExcel, { header: encabezados });
    
    // Configurar anchos de columna optimizados
    const anchosColumna = [
      { wch: 25 }, // Titular
      { wch: 20 }, // Tipo de Solicitante
      { wch: 15 }, // Tipo de Persona
      { wch: 18 }, // Tipo de Documento
      { wch: 15 }, // N° Documento
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 35 }, // Dirección
      { wch: 20 }, // Tipo de Entidad
      { wch: 30 }, // Razón Social
      { wch: 30 }, // Nombre Empresa
      { wch: 15 }, // NIT
      { wch: 25 }, // Poder Representante
      { wch: 25 }, // Poder Autorización
      { wch: 15 }, // Estado
      { wch: 25 }, // Tipo de Solicitud
      { wch: 20 }, // Encargado
      { wch: 15 }, // Fecha Solicitud
      { wch: 15 }, // Próxima Cita
      { wch: 25 }, // Motivo Anulación
      { wch: 15 }, // País
      { wch: 15 }, // NIT Marca
      { wch: 30 }, // Nombre Marca
      { wch: 15 }, // Categoría
      { wch: 25 }, // Certificado Cámara
      { wch: 25 }, // Logotipo Marca
      { wch: 50 }, // Clases
      { wch: 60 }  // Comentarios
    ];
    
    worksheet["!cols"] = anchosColumna;
    
    // Aplicar estilos al encabezado
    const rangoEncabezado = xlsx.utils.decode_range(worksheet["!ref"]);
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const celdaEncabezado = xlsx.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[celdaEncabezado]) continue;
      
      worksheet[celdaEncabezado].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "4472C4" } },
          bottom: { style: "thin", color: { rgb: "4472C4" } },
          left: { style: "thin", color: { rgb: "4472C4" } },
          right: { style: "thin", color: { rgb: "4472C4" } }
        }
      };
    }
    
    // Aplicar estilos a las filas de datos
    for (let fila = 1; fila <= datosExcel.length; fila++) {
      for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
        const celda = xlsx.utils.encode_cell({ r: fila, c: col });
        if (!worksheet[celda]) continue;
        
        worksheet[celda].s = {
          font: { color: { rgb: "000000" } },
          fill: { fgColor: { rgb: fila % 2 === 0 ? "F2F2F2" : "FFFFFF" } },
          alignment: { vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "D0D0D0" } },
            bottom: { style: "thin", color: { rgb: "D0D0D0" } },
            left: { style: "thin", color: { rgb: "D0D0D0" } },
            right: { style: "thin", color: { rgb: "D0D0D0" } }
          }
        };
      }
    }
    
    // Crear workbook y agregar hoja
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Ventas en Proceso");
    
    // Generar archivo
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    
    // Nombre del archivo con fecha
    const fecha = new Date().toISOString().split('T')[0];
    saveAs(data, `Ventas_En_Proceso_${fecha}.xlsx`);
  };

  return (
    <div className="w-full max-w-full">
      <SeleccionarTipoSolicitud
        isOpen={modalTipoOpen}
        onClose={() => setModalTipoOpen(false)}
        onSeleccionar={handleSeleccionarTipo}
      />
      <CrearSolicitud
        isOpen={modalCrearOpen && !!tipoSeleccionado}
        onClose={() => {
          setModalCrearOpen(false);
          setTipoSeleccionado("");
        }}
        tipoSolicitud={tipoSeleccionado}
        onGuardar={handleGuardarNuevaVenta}
      />
      <div className="pr-4 pb-4 pl-4 flex flex-col md:flex-row md:items-end gap-3 w-full">
        {/* Buscador */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <span className="absolute left-3 top-2.5 text-gray-400"><i className="bi bi-search"></i></span>
          <input
            type="text"
            placeholder="Buscar"
            className="pl-9 pr-3 h-12 w-full text-base border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 bg-white shadow-md"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
          />
        </div>
        
        {/* Select Servicio */}
        <div className="flex flex-col min-w-[210px] w-[210px]">
          <label className="text-xs font-medium text-gray-500 mb-1" htmlFor="select-servicio">Servicio:</label>
          <select
            id="select-servicio"
            value={servicioFiltro}
            onChange={e => { setServicioFiltro(e.target.value); setPaginaActual(1); }}
            className="px-4 h-12 rounded-xl border border-blue-300 text-base font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            {serviciosDisponibles.map(servicio => (
              <option key={servicio} value={servicio}>{servicio}</option>
            ))}
          </select>
        </div>
        {/* Select Estado */}
        <div className="flex flex-col min-w-[210px] w-[210px]">
          <label className="text-xs font-medium text-gray-500 mb-1" htmlFor="select-estado">Estado:</label>
          <select
            id="select-estado"
            value={estadoFiltro}
            onChange={e => { setEstadoFiltro(e.target.value); setPaginaActual(1); }}
            className="px-4 h-12 rounded-xl border border-green-300 text-base font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
          >
            {estadosDisponibles.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
        {/* Botones de acción */}
        <div className="flex gap-3 ml-auto">
          <button
            style={{ backgroundColor: "#1677ff", color: "#fff" }}
            className="px-4 h-12 text-sm rounded-md whitespace-nowrap flex items-center gap-2 hover:bg-blue-700 transition"
            onClick={handleCrear}
          >
            <i className="bi bi-plus-square"></i> Crear Solicitud
          </button>
          <DownloadButton
            type="excel"
            onClick={exportarExcel}
            title="Descargar Excel"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 z-40">
        <div className="overflow-x-auto w-full">
          <table className="table-auto w-full divide-y divide-gray-100 min-w-[1000px]">
            <thead className="text-left text-sm text-gray-500 bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-bold text-center">Titular</th>
                <th className="px-6 py-4 font-bold text-center">Email</th>
                <th className="px-6 py-4 font-bold text-center">Teléfono</th>
                <th className="px-6 py-4 font-bold text-center">Marca</th>
                <th className="px-6 py-4 font-bold text-center">Tipo de Solicitud</th>
                <th className="px-6 py-4 font-bold text-center">Proceso</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {datosPagina.map((item, idx) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <StandardAvatar 
                        nombre={item.titular || item.nombreCompleto || 'N/A'}
                      />
                      <div className="text-left">
                        <span>{item.titular || item.nombreCompleto || ''}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{item.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">{item.telefono || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">{item.marca || item.nombreMarca || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">{item.tipoSolicitud || ''}</td>
                  <td className="px-4 py-3 text-center">{item.estado || ''}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <ActionDropdown
                        actions={[
                          {
                            icon: "bi bi-pencil-fill",
                            label: "Editar",
                            title: "Editar venta",
                            onClick: () => {
                              setDatoSeleccionado(item);
                              setModalEditarOpen(true);
                              setModoCrear(false);
                            }
                          },
                          {
                            icon: "bi bi-clipboard-check",
                            label: "Seguimiento",
                            title: "Ver y agregar seguimiento",
                            onClick: () => {
                              setDatoSeleccionado(item);
                              setModalObservacionOpen(true);
                            }
                          },
                          {
                            icon: "bi bi-calendar-plus",
                            label: "Agendar cita",
                            title: "Agendar una cita asociada a esta solicitud",
                            onClick: () => {
                              // Guardar datos de la solicitud en localStorage para que calendario.jsx los detecte
                              const solicitudParaAgendar = {
                                idOrdenServicio: item.id,
                                id_orden_servicio: item.id, // Para el endpoint
                                clienteNombre: item.titular || item.nombrecompleto || '',
                                clienteDocumento: item.cedula || item.documento || '',
                                tipoDocumento: item.tipodedocumento || item.tipoDocumento || '',
                                telefono: item.telefono || '',
                                tipoSolicitud: item.tipoSolicitud || item.servicio || '',
                                mensaje: item.observaciones || item.descripcion || '',
                                // ✅ NUEVO: Empleado asignado si existe
                                empleadoAsignado: item.encargado || '',
                                empleadoCompleto: item.empleadoCompleto || null, // Objeto completo con id_empleado
                                // Datos adicionales de la solicitud para referencia
                                solicitudData: item
                              };
                              
                              localStorage.setItem('solicitudParaAgendar', JSON.stringify(solicitudParaAgendar));
                              
                              // Redirigir al calendario
                              navigate('/admin/calendario');
                            }
                          },
                          {
                            icon: "bi bi-eye-fill",
                            label: "Ver detalle",
                            title: "Ver detalles completos",
                            onClick: () => {
                              setDatoSeleccionado(item);
                              setModalDetalleOpen(true);
                            }
                          },
                          {
                            icon: "bi bi-file-earmark-zip",
                            label: "Descargar ZIP",
                            title: "Descargar documentos adjuntos",
                            onClick: async () => {
                              const zip = new JSZip();
                              // Archivos a incluir
                              const files = [
                                { file: item.certificadoCamara, label: "Certificado_Camara" },
                                { file: item.logotipoMarca, label: "Logotipo_Marca" },
                                { file: item.poderRepresentante, label: "Poder_Representante" },
                                { file: item.poderAutorizacion, label: "Poder_Autorizacion" },
                              ];
                              let added = 0;
                              for (const { file, label } of files) {
                                if (file && typeof file !== "string" && file.name && file instanceof File) {
                                  // Si es un File (input file)
                                  zip.file(label + "_" + file.name, file);
                                  added++;
                                } else if (file && typeof file === "string" && file.startsWith("data:")) {
                                  // Si es base64
                                  const arr = file.split(",");
                                  const mime = arr[0].match(/:(.*?);/)[1];
                                  const bstr = atob(arr[1]);
                                  let n = bstr.length;
                                  const u8arr = new Uint8Array(n);
                                  while (n--) u8arr[n] = bstr.charCodeAt(n);
                                  zip.file(label + "." + mime.split("/")[1], u8arr);
                                  added++;
                                }
                              }
                              if (added === 0) {
                                Swal.fire({
                                  icon: "info",
                                  title: "Sin archivos",
                                  text: "No hay documentos adjuntos para descargar en esta venta.",
                                  customClass: { popup: "swal2-border-radius" }
                                });
                                return;
                              }
                              const content = await zip.generateAsync({ type: "blob" });
                              saveAs(content, `Documentos_Venta_${item.id || item.expediente || ""}.zip`);
                            }
                          },
                          {
                            icon: "bi bi-person-badge",
                            label: "Asignar encargado",
                            title: "Asignar empleado encargado",
                            onClick: () => {
                              setDatoSeleccionado(item);
                              setEmpleadoSeleccionado(item.encargado || "");
                              setModalAsignarEncargadoOpen(true);
                            }
                          },
                          {
                            icon: "bi bi-x-circle",
                            label: "Anular venta",
                            title: "Anular esta venta",
                            danger: true,
                            onClick: () => {
                              setDatoSeleccionado(item);
                              setModalAnularOpen(true);
                              setMotivoAnular("");
                            }
                          }
                        ]}
                        triggerIcon="bi-three-dots-vertical"
                        triggerTitle="Acciones"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="text-sm text-gray-700">
          Mostrando{" "}
          <span className="font-medium">{(paginaActual - 1) * registrosPorPagina + 1}</span> a{" "}
          <span className="font-medium">
            {Math.min(paginaActual * registrosPorPagina, total)}
          </span>{" "}
          de <span className="font-medium">{totalRegistros}</span> resultados
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPaginaActual(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
          >
            <FaChevronLeft className="text-base" />
          </button>
          {Array.from({ length: Math.ceil(total / registrosPorPagina) }, (_, i) => i + 1).map((pagina) => (
            <button
              key={pagina}
              onClick={() => setPaginaActual(pagina)}
              className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold transition border ${
                paginaActual === pagina
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              }`}
            >
              {pagina}
            </button>
          ))}
          <button
            onClick={() => setPaginaActual(paginaActual + 1)}
            disabled={paginaActual === Math.ceil(total / registrosPorPagina)}
            className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
          >
            <FaChevronRight className="text-base" />
          </button>
        </div>
      </div>
      <VerDetalleVenta
        datos={datoSeleccionado}
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
      />
      <Seguimiento
        isOpen={modalObservacionOpen}
        onClose={() => setModalObservacionOpen(false)}
        solicitudId={datoSeleccionado?.id}
        onGuardar={handleGuardarComentario}
      />
      <EditarVenta
        datos={datoSeleccionado}
        isOpen={modalEditarOpen}
        onClose={() => { setModalEditarOpen(false); setModoCrear(false); }}
        onGuardar={modoCrear ? handleGuardarNuevaVenta : handleGuardarEdicion}
      />
      {modalAnularOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-0 relative">
            {/* Encabezado visual consistente */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-t-xl px-6 py-4 border-b border-gray-200">
              <span className="bg-blue-100 p-3 rounded-full flex items-center justify-center">
                <i className="bi bi-x-octagon text-blue-600 text-xl"></i>
              </span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">Anular Venta de Servicio</h2>
                <div className="text-sm text-gray-500 font-medium">Esta acción no se puede deshacer</div>
              </div>
            </div>
            {/* Contenido del modal */}
            <div className="p-6">
              <p className="mb-2 text-gray-700 text-center">¿Estás seguro que deseas anular esta venta?<br/>Debes indicar el motivo de anulación.</p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm mb-4"
              placeholder="Motivo de anulación..."
              value={motivoAnular}
              onChange={e => setMotivoAnular(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalAnularOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnular}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                disabled={!motivoAnular.trim()}
              >
                Anular
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modalAsignarEncargadoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-y-auto max-h-[90vh] relative border border-gray-200">
            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col items-center rounded-t-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-blue-100 p-2 rounded-full">
                  <i className="bi bi-person-badge text-blue-600 text-2xl"></i>
                </span>
                <h2 className="text-xl font-semibold text-gray-800">Asignar Encargado</h2>
              </div>
              <p className="text-sm text-gray-500 text-center">Selecciona el empleado encargado de esta venta.</p>
            </div>
            {/* Content */}
            <div className="p-6 flex flex-col gap-4">
              {loadingEmpleados ? (
                <div className="text-center py-4">
                  <i className="bi bi-arrow-repeat animate-spin text-blue-600 text-2xl"></i>
                  <p className="text-sm text-gray-500 mt-2">Cargando empleados...</p>
                </div>
              ) : (
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={empleadoSeleccionado}
                  onChange={e => setEmpleadoSeleccionado(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {empleadosAPI.map(emp => (
                    <option key={emp.id_empleado} value={emp.id_empleado}>
                      {emp.nombre} {emp.apellido}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 pb-6">
              <button
                onClick={() => setModalAsignarEncargadoOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!datoSeleccionado) {
                    AlertService.error('Error', 'No hay solicitud seleccionada');
                    return;
                  }
                  
                  if (!empleadoSeleccionado) {
                    AlertService.warning('Atención', 'Debes seleccionar un empleado');
                    return;
                  }

                  try {
                    const token = getToken();
                    if (!token) {
                      AlertService.error('Error', 'No hay sesión activa');
                      return;
                    }

                    console.log('🔧 [TablaVentasProceso] Asignando empleado:', empleadoSeleccionado, 'a solicitud:', datoSeleccionado.id);
                    
                    // Asignar empleado usando la API real
                    await solicitudesApiService.asignarEmpleado(
                      datoSeleccionado.id,
                      parseInt(empleadoSeleccionado),
                      token
                    );

                    setModalAsignarEncargadoOpen(false);
                    setEmpleadoSeleccionado("");
                    
                    Swal.fire({
                      icon: "success",
                      title: "Encargado asignado",
                      text: "El encargado ha sido actualizado correctamente. Se han enviado notificaciones por email.",
                      customClass: { popup: "swal2-border-radius" }
                    });
                    
                    refreshVentas();
                  } catch (error) {
                    console.error('❌ [TablaVentasProceso] Error asignando empleado:', error);
                    AlertService.error('Error', 'No se pudo asignar el empleado: ' + error.message);
                  }
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!empleadoSeleccionado || loadingEmpleados}
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaVentasProceso;
