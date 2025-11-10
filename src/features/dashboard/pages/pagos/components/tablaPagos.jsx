import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import getEstadoPagoBadge from "../services/getEstadoPagoBadge";
import VerDetallePago from "../components/verDetallePagos";
import DownloadButton from "../../../../../shared/components/DownloadButton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from '../../../../../shared/contexts/authContext';
import pagosApiService from '../services/pagosApiService';
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';

const Tablapagos = () => {
  const { getToken } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const registrosPorPagina = 5;

  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [descargandoComprobante, setDescargandoComprobante] = useState(null);

  // Cargar pagos desde la API
  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      
      console.log('🔧 [TablaPagos] Cargando pagos desde API...');
      const datos = await pagosApiService.getTodosLosPagos(token);
      console.log('✅ [TablaPagos] Pagos cargados:', datos.length);
      setPagos(datos || []);
    } catch (err) {
      console.error('❌ [TablaPagos] Error cargando pagos:', err);
      setError(err.message || 'Error al cargar los pagos');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudieron cargar los pagos. Por favor, intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y paginar datos
  useEffect(() => {
    if (!pagos || pagos.length === 0) {
      setDatos([]);
      setTotalRegistros(0);
      setTotalPaginas(0);
      return;
    }

    const filtrar = pagos.filter(
      (p) =>
        (p.id_pago ? p.id_pago.toString().includes(busqueda) : false) ||
        (p.metodo_pago ? p.metodo_pago.toLowerCase().includes(busqueda.toLowerCase()) : false) ||
        (p.id_orden_servicio ? p.id_orden_servicio.toString().includes(busqueda) : false) ||
        (p.referencia ? p.referencia.toLowerCase().includes(busqueda.toLowerCase()) : false) ||
        (p.numero_comprobante ? p.numero_comprobante.toLowerCase().includes(busqueda.toLowerCase()) : false)
    );
    
    const total = filtrar.length;
    const paginas = Math.ceil(total / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const datosPaginados = filtrar.slice(inicio, inicio + registrosPorPagina);
    
    setDatos(datosPaginados);
    setTotalPaginas(paginas);
    setTotalRegistros(total);
  }, [paginaActual, busqueda, pagos]);

  const abrirDetalle = (pago) => {
    setDetalleSeleccionado(pago);
    setModalAbierto(true);
  };

  const cerrarDetalle = () => {
    setDetalleSeleccionado(null);
    setModalAbierto(false);
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // Descargar comprobante desde la API
  const handleDescargarComprobante = async (pago, e) => {
    // Prevenir eventos adicionales
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const idPago = pago.id_pago || pago.id;
    
    // Evitar descargas simultáneas del mismo pago
    if (descargandoComprobante === idPago) {
      console.log('⚠️ [TablaPagos] Ya se está descargando este comprobante');
      return;
    }

    try {
      setDescargandoComprobante(idPago);
      
      const token = getToken();
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay token de autenticación',
        });
        return;
      }

      if (!idPago) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo identificar el pago',
        });
        return;
      }

      // Mostrar indicador de carga
      Swal.fire({
        title: 'Descargando comprobante...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      console.log(`🔧 [TablaPagos] Descargando comprobante del pago ${idPago}...`);
      const { blob, filename } = await pagosApiService.descargarComprobante(idPago, token);
      
      // Descargar el archivo
      saveAs(blob, filename);
      
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Comprobante descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('❌ [TablaPagos] Error descargando comprobante:', err);
      Swal.close();
      
      let errorMessage = 'No se pudo descargar el comprobante. Por favor, intenta nuevamente.';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 404) {
        errorMessage = 'El comprobante no está disponible para este pago';
      } else if (err.status === 403) {
        errorMessage = 'No tienes permisos para descargar este comprobante';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setDescargandoComprobante(null);
    }
  };

  // Descargar reporte Excel desde la API
  const handleDescargarExcel = async () => {
    try {
      const token = getToken();
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay token de autenticación',
        });
        return;
      }

      // Mostrar indicador de carga
      Swal.fire({
        title: 'Descargando reporte...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      console.log('🔧 [TablaPagos] Descargando reporte Excel...');
      const { blob, filename } = await pagosApiService.descargarReporteExcel(token);
      
      // Descargar el archivo
      saveAs(blob, filename);
      
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Reporte Excel descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('❌ [TablaPagos] Error descargando reporte Excel:', err);
      Swal.close();
      
      let errorMessage = 'No se pudo descargar el reporte. Por favor, intenta nuevamente.';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 403) {
        errorMessage = 'No tienes permisos para descargar el reporte';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="w-full max-w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error && pagos.length === 0) {
    return (
      <div className="w-full max-w-full flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={cargarPagos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between px-4 mb-4 w-full">
        <input
          type="text"
          placeholder="Buscar por ID, método, orden de servicio, referencia o comprobante..."
          className="form-control w-50 h-9 text-sm border border-gray-300 rounded-md px-3"
          value={busqueda}
          onChange={handleBusquedaChange}
        />
        <DownloadButton
          type="excel"
          onClick={handleDescargarExcel}
          title="Descargar Excel"
        />
      </div>

      {error && (
        <div className="mb-4 px-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
            <button
              onClick={cargarPagos}
              className="mt-2 text-sm underline hover:text-yellow-900"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-300 z-40">
        <div className="overflow-x-auto w-full">
          <table className="table-auto w-full divide-y divide-gray-100 min-w-[800px]">
            <thead className="text-left text-sm text-gray-500 bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-bold text-center">ID</th>
                <th className="px-6 py-4 font-bold text-center">Monto</th>
                <th className="px-6 py-4 font-bold text-center">Fecha</th>
                <th className="px-6 py-4 font-bold text-center">Método</th>
                <th className="px-6 py-4 font-bold text-center">Orden de Servicio</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700 text-center">
              {datos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Cargando...' : 'No hay pagos disponibles'}
                  </td>
                </tr>
              ) : (
                datos.map((item, idx) => {
                  const { color, texto } = getEstadoPagoBadge(item.estado);
                  const idPago = item.id_pago || item.id;
                  const estaDescargando = descargandoComprobante === idPago;
                  
                  return (
                    <tr key={idPago || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{idPago || '-'}</td>
                      <td className="px-6 py-4">
                        ${item.monto?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </td>
                      <td className="px-6 py-4">
                        {item.fecha_pago 
                          ? new Date(item.fecha_pago).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4">{item.metodo_pago || '-'}</td>
                      <td className="px-6 py-4">{item.id_orden_servicio || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span style={{ color, fontWeight: 600, fontSize: "14px" }}>
                          {texto || item.estado || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              abrirDetalle(item);
                            }}
                            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200 cursor-pointer"
                            title="Ver detalle"
                            type="button"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDescargarComprobante(item, e)}
                            disabled={estaDescargando || !idPago}
                            className="p-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-10 w-10 border border-blue-300 transition-all duration-200 cursor-pointer relative z-10"
                            title={estaDescargando ? "Descargando..." : "Descargar comprobante"}
                            type="button"
                          >
                            {estaDescargando ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="text-sm text-gray-700">
              Mostrando {" "}
              <span className="font-medium">
                {totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina + 1}
              </span>{" "}
              a {" "}
              <span className="font-medium">
                {Math.min(paginaActual * registrosPorPagina, totalRegistros)}
              </span>{" "}
              de <span className="font-medium">{totalRegistros}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
              >
                <FaChevronLeft className="text-base" />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginaActual(pagina)}
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold transition border ${paginaActual === pagina
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                >
                  {pagina}
                </button>
              ))}
              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
              >
                <FaChevronRight className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>

      <VerDetallePago
        datos={detalleSeleccionado}
        isOpen={modalAbierto}
        onClose={cerrarDetalle}
      />
    </div>
  );
};

export default Tablapagos;
