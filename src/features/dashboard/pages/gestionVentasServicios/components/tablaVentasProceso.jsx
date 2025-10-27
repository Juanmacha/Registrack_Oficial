import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import VerDetalleVenta from "./verDetalleVenta";
import Observaciones from "./observaciones";
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
import authData from '../../../../auth/services/authData';

const TablaVentasProceso = ({ adquirir }) => {
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
      const token = authData.getToken();
      if (!token) {
        console.warn("🔧 [useSalesSync] No hay token, retornando array vacío");
        return [];
      }
      
      try {
        console.log("🔧 [useSalesSync] Obteniendo solicitudes de la API...");
        const solicitudes = await solicitudesApiService.getAllSolicitudes(token);
        console.log("🔧 [useSalesSync] Solicitudes obtenidas:", solicitudes.length);
        console.log("🔧 [useSalesSync] Solicitudes RAW:", solicitudes);
        
        // Transformar todas las solicitudes
        const ventasTransformadas = solicitudes.map(s => {
          const transformada = solicitudesApiService.transformarRespuestaDelAPI(s);
          console.log(`🔧 [useSalesSync] Solicitud ${s.id} transformada:`, transformada);
          return transformada;
        });
        
        // Filtrar solo las que están en proceso (NO incluir Anuladas ni Finalizadas)
        const ventasEnProceso = ventasTransformadas.filter(v => {
          // Estados en proceso: "Pendiente" solamente (excluyendo Anulada y Finalizada)
          const esEnProceso = v.estado === 'Pendiente';
          console.log(`🔧 [useSalesSync] Venta ${v.id} - Estado: ${v.estado} - Es en proceso: ${esEnProceso}`);
          return esEnProceso;
        });
        
        console.log("✅ [useSalesSync] Ventas en proceso:", ventasEnProceso.length);
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

  const handleGuardarEdicion = (datosActualizados) => {
    if (datoSeleccionado && datoSeleccionado.id) {
      actualizarVenta(datoSeleccionado.id, datosActualizados);
    }
    setModalEditarOpen(false);
    setModoCrear(false);
    setTimeout(() => {
      refreshVentas();
    }, 100);
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


  const handleGuardarComentario = (texto) => {
    if (datoSeleccionado && datoSeleccionado.id) {
      agregarComentario(datoSeleccionado.id, texto);
      // Refrescar inmediatamente y luego de un pequeño delay para asegurar consistencia
      refreshVentas();
      setTimeout(() => {
        refreshVentas();
      }, 200);
    }
    setModalObservacionOpen(false);
  };

  const handleAnular = async () => {
    const result = await AlertService.warning("¿Anular venta?", "¿Estás seguro que deseas anular esta venta? Esta acción no se puede deshacer.");
    if (!result.isConfirmed) return;
    
    try {
      const token = authData.getToken();
      if (!token) {
        AlertService.error('Error', 'No hay sesión activa');
        return;
      }

      console.log("🔧 [TablaVentasProceso] Anulando solicitud:", datoSeleccionado.id);
      
      // ✅ USAR API REAL
      const resultado = await solicitudesApiService.anularSolicitud(datoSeleccionado.id, token);
      
      console.log("✅ [TablaVentasProceso] Solicitud anulada correctamente");
      console.log("✅ [TablaVentasProceso] Resultado de anulación:", resultado);
      
      AlertService.success("Venta anulada", "La venta ha sido anulada correctamente. Se ha enviado una notificación por email.");
      setModalAnularOpen(false);
      setMotivoAnular("");
      
      // Refrescar datos para que se actualice la tabla
      refreshVentas();
      
      // ✅ NUEVO: Notificar a otras tablas (TablaVentasFin) que se actualizaron las solicitudes
      window.dispatchEvent(new CustomEvent('solicitudAnulada', { detail: { id: datoSeleccionado.id } }));
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
                <th className="px-6 py-4 font-bold text-center">Tipo de Documento</th>
                <th className="px-6 py-4 font-bold text-center">País</th>
                <th className="px-6 py-4 font-bold text-center">Teléfono</th>
                <th className="px-6 py-4 font-bold text-center">Dirección</th>
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
                  <td className="px-4 py-3 text-center">{item.tipoDocumento || ''}</td>
                  <td className="px-4 py-3 text-center">{item.pais || ''}</td>
                  <td className="px-4 py-3 text-center">{item.telefono || ''}</td>
                  <td className="px-4 py-3 text-center">{item.direccion || ''}</td>
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
                            icon: "bi bi-chat-dots-fill",
                            label: "Observaciones",
                            title: "Ver y agregar observaciones",
                            onClick: () => {
                              setDatoSeleccionado(item);
                              setModalObservacionOpen(true);
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
      <Observaciones
        isOpen={modalObservacionOpen}
        onClose={() => setModalObservacionOpen(false)}
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
                    const token = authData.getToken();
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

export default TablaVentasProceso;
