import React, { useState, useEffect } from 'react';
import TablaSolicitudesCitas from './TablaSolicitudesCitas';
import solicitudesCitasApiService from '../../services/solicitudesCitasApiService.js';
import alertService from '../../../../utils/alertService.js';
import DownloadButton from "../../../../shared/components/DownloadButton";
import { FaFileAlt, FaSearch, FaFilter, FaSync, FaDownload } from "react-icons/fa";

const SolicitudesCitasApi = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [deshabilitarAcciones, setDeshabilitarAcciones] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const solicitudesPorPagina = 5;

  // Cargar solicitudes desde la API
  const cargarSolicitudes = async () => {
    setIsLoading(true);
    try {
      console.log('📋 [SolicitudesCitasApi] Cargando solicitudes desde la API...');
      const result = await solicitudesCitasApiService.getAllSolicitudesCitas();
      
      if (result.success) {
        console.log('✅ [SolicitudesCitasApi] Solicitudes cargadas exitosamente:', result.data);
        setSolicitudes(result.data);
      } else {
        console.error('❌ [SolicitudesCitasApi] Error al cargar solicitudes:', result.message);
        await alertService.error(
          "Error al cargar solicitudes",
          result.message || "No se pudieron cargar las solicitudes. Intenta de nuevo.",
          { confirmButtonText: "Reintentar" }
        );
      }
    } catch (error) {
      console.error('💥 [SolicitudesCitasApi] Error inesperado:', error);
      await alertService.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // Normalizar texto para búsqueda
  function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const cumpleBusqueda = !busqueda || 
      normalizarTexto(s.cliente?.nombre || '').includes(normalizarTexto(busqueda)) ||
      normalizarTexto(s.cliente?.correo || '').includes(normalizarTexto(busqueda)) ||
      normalizarTexto(s.tipo || '').includes(normalizarTexto(busqueda)) ||
      normalizarTexto(s.estado || '').includes(normalizarTexto(busqueda));

    const cumpleEstado = !filterEstado || s.estado === filterEstado;
    const cumpleTipo = !filterTipo || s.tipo === filterTipo;

    return cumpleBusqueda && cumpleEstado && cumpleTipo;
  });

  // Paginación
  const totalPaginas = Math.ceil(solicitudesFiltradas.length / solicitudesPorPagina);
  const indiceInicio = (paginaActual - 1) * solicitudesPorPagina;
  const solicitudesPaginadas = solicitudesFiltradas.slice(indiceInicio, indiceInicio + solicitudesPorPagina);

  // Aprobar solicitud
  const handleAprobarSolicitud = async (solicitudId) => {
    setIsRefreshing(true);
    try {
      console.log('📋 [SolicitudesCitasApi] Aprobando solicitud ID:', solicitudId);
      const result = await solicitudesCitasApiService.aprobarSolicitudCita(solicitudId);
      
      if (result.success) {
        await alertService.success(
          "Solicitud aprobada",
          result.message || "La solicitud se ha aprobado exitosamente.",
          { confirmButtonText: "Entendido" }
        );
        
        // Recargar solicitudes
        await cargarSolicitudes();
      } else {
        await alertService.error(
          "Error al aprobar solicitud",
          result.message || "No se pudo aprobar la solicitud. Intenta de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error('💥 [SolicitudesCitasApi] Error al aprobar solicitud:', error);
      await alertService.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Intenta de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Rechazar solicitud
  const handleRechazarSolicitud = async (solicitudId, motivo) => {
    setIsRefreshing(true);
    try {
      console.log('📋 [SolicitudesCitasApi] Rechazando solicitud ID:', solicitudId);
      const result = await solicitudesCitasApiService.rechazarSolicitudCita(solicitudId, motivo);
      
      if (result.success) {
        await alertService.success(
          "Solicitud rechazada",
          result.message || "La solicitud se ha rechazado exitosamente.",
          { confirmButtonText: "Entendido" }
        );
        
        // Recargar solicitudes
        await cargarSolicitudes();
      } else {
        await alertService.error(
          "Error al rechazar solicitud",
          result.message || "No se pudo rechazar la solicitud. Intenta de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error('💥 [SolicitudesCitasApi] Error al rechazar solicitud:', error);
      await alertService.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Intenta de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generar reporte Excel
  const generarReporteExcel = () => {
    try {
      const datosParaExcel = solicitudesFiltradas.map(solicitud => ({
        'ID': solicitud.id_cita || solicitud.id,
        'Cliente': solicitud.cliente?.nombre || 'N/A',
        'Email': solicitud.cliente?.correo || 'N/A',
        'Teléfono': solicitud.cliente?.telefono || 'N/A',
        'Tipo': solicitud.tipo || 'N/A',
        'Modalidad': solicitud.modalidad || 'N/A',
        'Fecha': solicitud.fecha || 'N/A',
        'Hora Inicio': solicitud.hora_inicio || 'N/A',
        'Hora Fin': solicitud.hora_fin || 'N/A',
        'Estado': solicitud.estado || 'N/A',
        'Empleado': solicitud.empleado?.nombre || 'N/A',
        'Observación': solicitud.observacion || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(datosParaExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes de Citas');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `solicitudes_citas_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      alertService.success(
        "Reporte generado",
        "El reporte Excel se ha descargado exitosamente.",
        { confirmButtonText: "Entendido" }
      );
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alertService.error(
        "Error al generar reporte",
        "No se pudo generar el reporte Excel. Intenta de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    }
  };

  // Obtener estados únicos para el filtro
  const estadosUnicos = [...new Set(solicitudes.map(s => s.estado).filter(Boolean))];
  const tiposUnicos = [...new Set(solicitudes.map(s => s.tipo).filter(Boolean))];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <FaFileAlt className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Solicitudes de Citas</h1>
              <p className="text-gray-600">Gestiona las solicitudes de citas pendientes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Botón de refrescar */}
            <button
              onClick={cargarSolicitudes}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refrescar</span>
            </button>
            
            {/* Botón de descargar reporte */}
            <button
              onClick={generarReporteExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              <span>Reporte Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, email, tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Todos los estados</option>
              {estadosUnicos.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Todos los tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <button
            onClick={() => {
              setBusqueda('');
              setFilterEstado('');
              setFilterTipo('');
              setPaginaActual(1);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaFileAlt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <FaFileAlt className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {solicitudes.filter(s => s.estado?.toLowerCase().includes('pendiente')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <FaFileAlt className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {solicitudes.filter(s => s.estado?.toLowerCase().includes('programada')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <FaFileAlt className="w-4 h-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rechazadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {solicitudes.filter(s => s.estado?.toLowerCase().includes('rechazada')).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : solicitudesPaginadas.length > 0 ? (
          <>
            <TablaSolicitudesCitas
              solicitudes={solicitudesPaginadas}
              onVer={(solicitud) => {
                setSelectedSolicitud(solicitud);
                setMostrarModalVer(true);
              }}
              onAprobar={handleAprobarSolicitud}
              onRechazar={handleRechazarSolicitud}
              isLoading={isRefreshing}
            />
            
            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando {indiceInicio + 1} a {Math.min(indiceInicio + solicitudesPorPagina, solicitudesFiltradas.length)} de {solicitudesFiltradas.length} solicitudes
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                      <button
                        key={numero}
                        onClick={() => setPaginaActual(numero)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          paginaActual === numero
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {numero}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-600">
              {busqueda || filterEstado || filterTipo 
                ? "No se encontraron solicitudes con los filtros aplicados."
                : "No hay solicitudes de citas registradas."
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de ver solicitud */}
      {mostrarModalVer && selectedSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Detalle de Solicitud</h2>
                <button
                  onClick={() => {
                    setMostrarModalVer(false);
                    setSelectedSolicitud(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <p className="text-gray-900">{selectedSolicitud.cliente?.nombre || 'N/A'}</p>
                  </div>
                  {/* Mostrar email solo si tiene valor real */}
                  {(selectedSolicitud.cliente?.correo || selectedSolicitud.cliente?.email) && 
                   selectedSolicitud.cliente?.correo !== 'N/A' && 
                   selectedSolicitud.cliente?.email !== 'N/A' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedSolicitud.cliente?.correo || selectedSolicitud.cliente?.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSolicitud.estado?.toLowerCase().includes('pendiente') ? 'bg-yellow-100 text-yellow-800' :
                      selectedSolicitud.estado?.toLowerCase().includes('programada') ? 'bg-green-100 text-green-800' :
                      selectedSolicitud.estado?.toLowerCase().includes('rechazada') ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSolicitud.estado || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="text-gray-900">{selectedSolicitud.tipo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Modalidad</label>
                    <p className="text-gray-900">{selectedSolicitud.modalidad || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <p className="text-gray-900">{selectedSolicitud.fecha || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora</label>
                    <p className="text-gray-900">
                      {selectedSolicitud.hora_inicio && selectedSolicitud.hora_fin 
                        ? `${selectedSolicitud.hora_inicio} - ${selectedSolicitud.hora_fin}`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
                
                {selectedSolicitud.observacion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Observación</label>
                    <p className="text-gray-900">{selectedSolicitud.observacion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesCitasApi;
