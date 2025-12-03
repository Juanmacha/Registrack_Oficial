import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import VerDetalleVenta from "./verDetalleVenta";
import Observaciones from "./observaciones";
import EditarVenta from "./editarVenta";
import { agregarComentario } from "../services/ventasService";
import { mockDataService } from '../../../../../utils/mockDataService';
import solicitudesApiService from '../services/solicitudesApiService';
import archivosApiService from '../services/archivosApiService';
import seguimientoApiService from '../services/seguimientoApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import getEstadoBadge from "../services/getEstadoBadge"; // Usa el mismo servicio
import excelService from '../../../../../shared/services/excelService';
import StandardAvatar from "../../../../../shared/components/StandardAvatar";
import ActionDropdown from "../../../../../shared/components/ActionDropdown";
import DownloadButton from "../../../../../shared/components/DownloadButton";
import Swal from 'sweetalert2';

const TablaVentasFin = () => {
  const { getToken } = useAuth();
  
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const registrosPorPagina = 5;
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalObservacionOpen, setModalObservacionOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [datoSeleccionado, setDatoSeleccionado] = useState(null);
  const [servicioFiltro, setServicioFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [modalSeguimientosDescargarOpen, setModalSeguimientosDescargarOpen] = useState(false);
  const [seguimientosDisponibles, setSeguimientosDisponibles] = useState([]);
  const [cargandoSeguimientos, setCargandoSeguimientos] = useState(false);
  
  // ✅ NUEVO: Estados para API real
  const [allDatos, setAllDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NUEVO: Cargar ventas finalizadas de la API real
  useEffect(() => {
    const cargarVentasFinalizadas = async () => {
      const token = getToken();
      if (!token) {
        console.warn("🔧 [TablaVentasFin] No hay token, usando datos vacíos");
        setAllDatos([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("🔧 [TablaVentasFin] Cargando ventas finalizadas de la API...");
        const solicitudes = await solicitudesApiService.getAllSolicitudes(token);
        console.log("🔧 [TablaVentasFin] Solicitudes obtenidas:", solicitudes.length);
        
        // Transformar todas las solicitudes para ver sus estados
        const todasTransformadas = solicitudes.map(s => {
          const transformada = solicitudesApiService.transformarRespuestaDelAPI(s);
          console.log(`🔍 [TablaVentasFin] Solicitud ${s.id} - Estado API: "${s.estado}" → Estado Frontend: "${transformada.estado}"`);
          return transformada;
        });
        
        // Filtrar: finalizadas, anuladas y rechazadas (por si el backend usa "Rechazada")
        const ventasFinalizadas = todasTransformadas.filter(v => {
          // ⚠️ IMPORTANTE: Backend usa tanto femenino como masculino ("Anulada" y "Anulado")
          const estadosFinales = ['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'];
          const esFinalizada = estadosFinales.includes(v.estado);
          console.log(`🔍 [TablaVentasFin] Venta ${v.id} - Estado: "${v.estado}" - Es finalizada: ${esFinalizada}`);
          return esFinalizada;
        });
        
        console.log("✅ [TablaVentasFin] Ventas finalizadas/anuladas:", ventasFinalizadas.length);
        console.log("✅ [TablaVentasFin] Estados encontrados:", todasTransformadas.map(v => v.estado));
        setAllDatos(ventasFinalizadas);
        
        // Obtener servicios y estados únicos de las ventas finalizadas
        const servicios = Array.from(new Set(ventasFinalizadas.map(v => v.tipoSolicitud))).filter(Boolean);
        setServiciosDisponibles(['Todos', ...servicios]);
        
        const estados = Array.from(new Set(ventasFinalizadas.map(v => v.estado))).filter(Boolean);
        setEstadosDisponibles(['Todos', ...estados]);
        
      } catch (error) {
        console.error("❌ [TablaVentasFin] Error cargando ventas finalizadas:", error);
        setAllDatos([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarVentasFinalizadas();
    
    // ✅ NUEVO: Escuchar evento de solicitud anulada para refrescar automáticamente
    const handleSolicitudAnulada = (event) => {
      console.log("🔔 [TablaVentasFin] Evento de solicitud anulada recibido:", event.detail);
      console.log("🔔 [TablaVentasFin] Refrescando tabla de ventas finalizadas...");
      cargarVentasFinalizadas();
    };

    // ✅ NUEVO: Escuchar evento de solicitud finalizada (cambio de estado a Finalizada/Finalizado)
    const handleSolicitudFinalizada = (event) => {
      console.log("🔔 [TablaVentasFin] Evento de solicitud finalizada recibido:", event.detail);
      console.log("🔔 [TablaVentasFin] Nueva solicitud finalizada. Refrescando tabla...");
      // Pequeño delay para asegurar que el backend haya actualizado el estado
      setTimeout(() => {
        cargarVentasFinalizadas();
      }, 500);
    };
    
    window.addEventListener('solicitudAnulada', handleSolicitudAnulada);
    window.addEventListener('solicitudFinalizada', handleSolicitudFinalizada);
    
    // Cleanup: remover listeners cuando el componente se desmonte
    return () => {
      window.removeEventListener('solicitudAnulada', handleSolicitudAnulada);
      window.removeEventListener('solicitudFinalizada', handleSolicitudFinalizada);
    };
  }, []);

  // Filtrar por texto, servicio y estado
  const texto = busqueda.trim().toLowerCase();
  let datosFiltrados = allDatos.filter(item => {
    const coincideServicio = servicioFiltro === 'Todos' || item.tipoSolicitud === servicioFiltro;
    const coincideEstado = estadoFiltro === 'Todos' || item.estado === estadoFiltro;
    const coincideTexto =
      !texto ||
      (item.titular && item.titular.toLowerCase().includes(texto)) ||
      (item.marca && item.marca.toLowerCase().includes(texto));
    return coincideServicio && coincideEstado && coincideTexto;
  });
  // Eliminar duplicados por id (deja solo la primera ocurrencia)
  const idsVistos = new Set();
  datosFiltrados = datosFiltrados.filter(item => {
    if (!item.id || idsVistos.has(item.id)) return false;
    idsVistos.add(item.id);
    return true;
  });

  // Paginado manual
  const total = datosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / registrosPorPagina));
  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(1);
    // eslint-disable-next-line
  }, [totalPaginas]);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, fin);

  // ✅ NUEVO: Refrescar datos desde API
  const refrescar = async () => {
      const token = getToken();
    if (!token) {
      console.warn("🔧 [TablaVentasFin] No hay token para refrescar");
      return;
    }
    
    try {
      setLoading(true);
      console.log("🔧 [TablaVentasFin] Refrescando ventas finalizadas...");
      const solicitudes = await solicitudesApiService.getAllSolicitudes(token);
      
      const todasTransformadas = solicitudes.map(s => {
        const transformada = solicitudesApiService.transformarRespuestaDelAPI(s);
        console.log(`🔍 [TablaVentasFin-Refresh] Solicitud ${s.id} - Estado API: "${s.estado}" → Estado Frontend: "${transformada.estado}"`);
        return transformada;
      });
      
      // ⚠️ IMPORTANTE: Backend usa tanto femenino como masculino
      const estadosFinales = ['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'];
      const ventasFinalizadas = todasTransformadas.filter(v => estadosFinales.includes(v.estado));
      
      console.log("✅ [TablaVentasFin] Ventas finalizadas/anuladas refrescadas:", ventasFinalizadas.length);
      console.log("✅ [TablaVentasFin] Todos los estados:", todasTransformadas.map(v => `${v.id}:${v.estado}`));
      setAllDatos(ventasFinalizadas);
    } catch (error) {
      console.error("❌ [TablaVentasFin] Error refrescando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarEdicion = () => {
    refrescar();
    setModalEditarOpen(false);
  };

  const handleGuardarComentario = (texto) => {
    if (datoSeleccionado && datoSeleccionado.id) {
      agregarComentario(datoSeleccionado.id, texto);
      refrescar();
    }
    setModalObservacionOpen(false);
  };

  const cargarSeguimientosParaDescarga = async (idOrdenServicio) => {
    if (!idOrdenServicio) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar la orden de servicio',
        customClass: { popup: "swal2-border-radius" }
      });
      return;
    }

    setCargandoSeguimientos(true);
    try {
      const token = getToken();
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró token de autenticación',
          customClass: { popup: "swal2-border-radius" }
        });
        return;
      }

      console.log('🔧 [TablaVentasFin] Cargando seguimientos para orden:', idOrdenServicio);
      const historial = await seguimientoApiService.getHistorial(idOrdenServicio, token);
      
      // Filtrar solo seguimientos que tienen documentos adjuntos
      const seguimientosConArchivos = historial.filter(s => {
        const docs = s.documentos_adjuntos;
        return docs && docs !== null && docs !== '' && docs !== 'null';
      });
      
      console.log('✅ [TablaVentasFin] Seguimientos con archivos:', seguimientosConArchivos.length);
      setSeguimientosDisponibles(seguimientosConArchivos);
    } catch (error) {
      console.error('❌ [TablaVentasFin] Error cargando seguimientos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los seguimientos',
        customClass: { popup: "swal2-border-radius" }
      });
      setSeguimientosDisponibles([]);
    } finally {
      setCargandoSeguimientos(false);
    }
  };

  const descargarArchivosSeguimiento = async (idSeguimiento) => {
    try {
      Swal.fire({
        title: "",
        html: "",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
          setTimeout(() => {
            const popup = document.querySelector('.swal2-loading-popup');
            if (popup) {
              const titleElement = popup.querySelector('.swal2-title');
              if (titleElement) titleElement.style.display = 'none';
              const contentElements = popup.querySelectorAll('.swal2-content, .swal2-html-container, .swal2-text, .swal2-icon-container');
              contentElements.forEach(el => el.style.display = 'none');
              const actionsElement = popup.querySelector('.swal2-actions');
              if (actionsElement) actionsElement.style.display = 'none';
            }
          }, 10);
        },
        customClass: {
          popup: 'swal2-loading-popup',
          title: 'swal2-loading-title-hidden'
        }
      });

      const token = getToken();
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente.');
      }

      const result = await seguimientoApiService.descargarArchivosSeguimiento(idSeguimiento, token);
      
      // Descargar el archivo
      const url = window.URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Archivo ZIP de seguimiento descargado exitosamente.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
        }
      });

      // Cerrar modal
      setModalSeguimientosDescargarOpen(false);
    } catch (error) {
      console.error('❌ [TablaVentasFin] Error descargando archivos de seguimiento:', error);
      Swal.close();
      
      let errorMessage = 'No se pudieron descargar los archivos. Por favor, intente nuevamente.';
      if (error.message) {
        if (error.message.includes('404')) {
          errorMessage = 'No se encontraron archivos asociados a este seguimiento.';
        } else if (error.message.includes('403') || error.message.includes('401')) {
          errorMessage = 'No tiene permisos para descargar estos archivos.';
        } else if (error.message.includes('token')) {
          errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar',
        text: errorMessage,
        customClass: { popup: "swal2-border-radius" }
      });
    }
  };

  const exportarExcel = async () => {
    try {
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

    // Anchos de columna optimizados
    const anchosColumnas = [
      25, 20, 15, 18, 15, 30, 15, 35, 20, 30, 30, 15, 25, 25, 15, 25, 20, 15, 15, 25, 15, 15, 30, 15, 25, 25, 50, 60
    ];

    await excelService.generarExcel(
      datosExcel,
      encabezados,
      {
        nombreHoja: 'Ventas Finalizadas',
        nombreArchivo: excelService.generarNombreArchivo('ventas_finalizadas'),
        anchosColumnas,
        titulo: 'Reporte de Solicitudes Finalizadas',
        incluirLogo: true,
        filasAlternadas: true
      }
    );
    
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Archivo Excel descargado exitosamente.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al descargar el archivo: ' + error.message,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando solicitudes terminadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      {/* Buscador y botones */}
      <div className="pr-4 pb-4 pl-4 flex flex-col md:flex-row md:items-end gap-3 w-full">
        <div className="relative w-full md:w-80 flex-shrink-0">
          <span className="absolute left-4 top-2.5 text-gray-400"><i className="bi bi-search"></i></span>
          <input
            type="text"
            placeholder="Buscar"
            className="pl-11 pr-3 h-12 w-full text-base border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 bg-white shadow-md"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
          />
        </div>
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
        <div className="flex flex-col min-w-[210px] w-[210px]">
          <label className="text-xs font-medium text-gray-500 mb-1" htmlFor="select-estado">Estado:</label>
          <select
            id="select-estado"
            value={estadoFiltro}
            onChange={e => { setEstadoFiltro(e.target.value); setPaginaActual(1); }}
            className="px-4 h-12 rounded-xl border border-blue-300 text-base font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            {estadosDisponibles.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 ml-auto">
          <DownloadButton
            type="excel"
            onClick={exportarExcel}
            title="Descargar Excel"
          />
        </div>
      </div>
      {/* Tabla */}
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
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {datosPagina.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-lg">No se encontraron resultados.</td>
                </tr>
              ) : datosPagina.filter(item => item && typeof item === 'object').map((item, idx) => {
                try {
                  const { color, texto } = getEstadoBadge(item.estado);
                  const esAnulado = (item.estado || '').toLowerCase() === 'anulado';
                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start gap-3">
                          <StandardAvatar 
                            nombre={item.titular || 'N/A'}
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{item.titular || 'Sin titular'}</div>
                            <div className="text-xs text-gray-500">{item.tipoPersona || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">{item.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">{item.telefono || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">{item.marca || item.nombreMarca || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">{item.tipoSolicitud || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span style={{ color, fontWeight: 600, fontSize: "14px" }}>{texto || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ActionDropdown
                            actions={[
                              ...(!esAnulado ? [
                                {
                                  icon: "bi bi-pencil-fill",
                                  label: "Editar",
                                  title: "Editar venta",
                                  onClick: () => {
                                    setDatoSeleccionado(item);
                                    setModalEditarOpen(true);
                                  }
                                },
                                {
                                  icon: "bi bi-chat-dots-fill",
                                  label: "Observaciones",
                                  title: "Ver y agregar observaciones",
                                  onClick: () => {
                                    setDatoSeleccionado(item);
                                    setModalObservacionOpen(true);
                                  }
                                }
                              ] : []),
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
                                icon: "bi bi-file-earmark-arrow-down",
                                label: "Descargar archivos de seguimiento",
                                title: "Descargar archivos adjuntos de seguimientos",
                                onClick: async () => {
                                  setDatoSeleccionado(item);
                                  setModalSeguimientosDescargarOpen(true);
                                  await cargarSeguimientosParaDescarga(item.id || item.id_orden_servicio);
                                }
                              },
                              {
                                icon: "bi bi-file-earmark-zip",
                                label: "Descargar ZIP",
                                title: "Descargar documentos adjuntos",
                                onClick: async () => {
                                  try {
                                    // Mostrar loading
                                    Swal.fire({
                                      title: 'Descargando archivos...',
                                      text: 'Por favor espera mientras se preparan los archivos',
                                      allowOutsideClick: false,
                                      didOpen: () => {
                                        Swal.showLoading();
                                      }
                                    });
                                    
                                    const token = getToken();
                                    if (!token) {
                                      throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente.');
                                    }
                                    
                                    // Obtener id_orden_servicio del item
                                    const idOrdenServicio = item.id || item.id_orden_servicio;
                                    if (!idOrdenServicio) {
                                      throw new Error('No se pudo obtener el ID de la solicitud');
                                    }
                                    
                                    // Llamar al servicio para descargar ZIP desde el backend
                                    const result = await archivosApiService.downloadArchivosSolicitudZip(idOrdenServicio, token);
                                    
                                    // Cerrar loading y mostrar éxito
                                    Swal.close();
                                    Swal.fire({
                                      icon: 'success',
                                      title: '¡Éxito!',
                                      text: 'Archivo ZIP de solicitud descargado exitosamente.',
                                      confirmButtonText: 'Cerrar',
                                      confirmButtonColor: '#10b981',
                                      customClass: {
                                        popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
                                        title: 'text-gray-800 font-bold text-2xl mb-4',
                                        content: 'text-gray-600 text-base mb-6',
                                        confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
                                      }
                                    });
                                  } catch (error) {
                                    console.error('❌ [TablaVentasFin] Error al descargar ZIP:', error);
                                    Swal.close();
                                    Swal.fire({
                                      icon: 'error',
                                      title: 'Error al descargar',
                                      text: error.message || 'No se pudieron descargar los archivos. Por favor, intente nuevamente.',
                                      confirmButtonText: 'Aceptar'
                                    });
                                  }
                                }
                              }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                } catch (err) {
                  console.error('Error al renderizar fila de venta finalizada:', err, item);
                  return (
                    <tr key={item.id} className="bg-red-50">
                      <td colSpan={8} className="text-center text-red-600 py-4">Error al mostrar este registro. Revisa la consola para más detalles.</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Paginación */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="text-sm text-gray-700">
          Mostrando {" "}
          <span className="font-medium">{total === 0 ? 0 : (paginaActual - 1) * registrosPorPagina + 1}</span> a {" "}
          <span className="font-medium">
            {Math.min(paginaActual * registrosPorPagina, total)}
          </span>{" "}
          de <span className="font-medium">{total}</span> resultados
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
      {/* Modales */}
      <VerDetalleVenta
        datos={datoSeleccionado}
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
      />
      <Observaciones
        isOpen={modalObservacionOpen}
        onClose={() => setModalObservacionOpen(false)}
        onGuardar={handleGuardarComentario}
      />
      <EditarVenta
        datos={datoSeleccionado}
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        onGuardar={handleGuardarEdicion}
      />
      {/* Modal para seleccionar seguimiento y descargar archivos */}
      {modalSeguimientosDescargarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 overflow-y-auto max-h-[90vh] relative border border-gray-200">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 p-2 rounded-full">
                  <i className="bi bi-file-earmark-arrow-down text-blue-600 text-2xl"></i>
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Descargar Archivos de Seguimiento</h2>
                  <p className="text-sm text-gray-500">Seleccione un seguimiento para descargar sus archivos adjuntos</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalSeguimientosDescargarOpen(false);
                  setSeguimientosDisponibles([]);
                }}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <i className="bi bi-x-lg text-2xl"></i>
              </button>
            </div>
            {/* Content */}
            <div className="p-6">
              {cargandoSeguimientos ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500 mt-4">Cargando seguimientos...</p>
                </div>
              ) : seguimientosDisponibles.length === 0 ? (
                <div className="text-center py-8">
                  <i className="bi bi-inbox text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600 font-medium">No hay seguimientos con archivos adjuntos</p>
                  <p className="text-sm text-gray-500 mt-2">Esta solicitud no tiene seguimientos con documentos adjuntos disponibles para descargar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {seguimientosDisponibles.map((seguimiento) => {
                    const fecha = seguimiento.fecha_registro || seguimiento.fecha_creacion || seguimiento.fecha;
                    const formatearFecha = (fecha) => {
                      if (!fecha) return '-';
                      try {
                        const fechaObj = new Date(fecha);
                        return fechaObj.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch {
                        return fecha;
                      }
                    };
                    
                    return (
                      <div
                        key={seguimiento.id_seguimiento || seguimiento.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {seguimiento.titulo || seguimiento.título || 'Sin título'}
                            </h3>
                            {seguimiento.descripcion && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {seguimiento.descripcion}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <i className="bi bi-calendar3"></i>
                                {formatearFecha(fecha)}
                              </span>
                              {seguimiento.usuario_registro && (
                                <span className="flex items-center gap-1">
                                  <i className="bi bi-person"></i>
                                  {seguimiento.usuario_registro.nombre} {seguimiento.usuario_registro.apellido}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => descargarArchivosSeguimiento(seguimiento.id_seguimiento || seguimiento.id)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
                          >
                            <i className="bi bi-download"></i>
                            Descargar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Estilo de botones */}
      <style jsx>{`
        .custom-hover:hover {
          opacity: 0.8;
          transform: scale(1.05);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TablaVentasFin;
