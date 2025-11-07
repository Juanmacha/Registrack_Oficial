import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import VerDetalleVenta from "./verDetalleVenta";
import Observaciones from "./observaciones";
import EditarVenta from "./editarVenta";
import { agregarComentario } from "../services/ventasService";
import { mockDataService } from '../../../../../utils/mockDataService';
import solicitudesApiService from '../services/solicitudesApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import getEstadoBadge from "../services/getEstadoBadge"; // Usa el mismo servicio
import * as xlsx from "xlsx";
import StandardAvatar from "../../../../../shared/components/StandardAvatar";
import { saveAs } from "file-saver";
import ActionDropdown from "../../../../../shared/components/ActionDropdown";
import DownloadButton from "../../../../../shared/components/DownloadButton";

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
    xlsx.utils.book_append_sheet(workbook, worksheet, "Ventas Finalizadas");
    
    // Generar archivo
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    
    // Nombre del archivo con fecha
    const fecha = new Date().toISOString().split('T')[0];
    saveAs(data, `Ventas_Finalizadas_${fecha}.xlsx`);
  };

  return (
    <div className="w-full max-w-full">
      {/* Buscador y botones */}
      <div className="pr-4 pb-4 pl-4 flex flex-col md:flex-row md:items-end gap-3 w-full">
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <StandardAvatar 
                            nombre={item.titular || 'N/A'}
                          />
                          <div className="text-left">
                            <div className="font-semibold text-gray-800">{item.titular || 'Sin titular'}</div>
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
                            layout="horizontal"
                            actions={[
                              ...(!esAnulado ? [
                                {
                                  icon: "bi bi-pencil-fill",
                                  label: "Editar",
                                  title: "Editar venta",
                                  hideLabel: true,
                                  onClick: () => {
                                    setDatoSeleccionado(item);
                                    setModalEditarOpen(true);
                                  }
                                },
                                {
                                  icon: "bi bi-chat-dots-fill",
                                  label: "Observaciones",
                                  title: "Ver y agregar observaciones",
                                  hideLabel: true,
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
                                hideLabel: true,
                                onClick: () => {
                                  setDatoSeleccionado(item);
                                  setModalDetalleOpen(true);
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
