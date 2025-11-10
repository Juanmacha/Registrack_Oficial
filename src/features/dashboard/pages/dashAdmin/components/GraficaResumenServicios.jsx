import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import DownloadButton from "../../../../../shared/components/DownloadButton";
import { useDashboardServicios } from "../../../hooks/useDashboardData";
import { PERIODOS_DISPONIBLES, PERIODO_DEFECTO } from "../../../shared/periodos";

// Usar períodos desde el archivo compartido
const periodos = PERIODOS_DISPONIBLES;

// Función para formatear números con separadores de miles
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('es-CO').format(num);
};

// Función para formatear moneda
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Función para obtener el color de un estado
const getEstadoColor = (estado) => {
  const estadoLower = estado.toLowerCase();
  
  // Estados finalizados
  if (estadoLower.includes('finalizado') || estadoLower.includes('completado') || estadoLower.includes('certificado')) {
    return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
  }
  // Estados en proceso
  if (estadoLower.includes('proceso') || estadoLower.includes('revisión') || estadoLower.includes('revision') || 
      estadoLower.includes('publicación') || estadoLower.includes('publicacion') || estadoLower.includes('tramite')) {
    return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
  }
  // Estados pendientes
  if (estadoLower.includes('pendiente') || estadoLower.includes('recibida') || estadoLower.includes('inicial')) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
  }
  // Estados rechazados/anulados
  if (estadoLower.includes('rechazado') || estadoLower.includes('anulado') || estadoLower.includes('cancelado')) {
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  }
  // Estados aprobados
  if (estadoLower.includes('aprobado') || estadoLower.includes('aprobación') || estadoLower.includes('aprobacion')) {
    return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
  }
  
  // Por defecto
  return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
};

// Función para transformar datos de la API al formato del componente
const transformarDatosAPI = (apiData) => {
  console.log('🔍 [GraficaResumenServicios] transformarDatosAPI - apiData recibido:', apiData);
  console.log('🔍 [GraficaResumenServicios] Tipo de apiData:', typeof apiData);
  
  if (!apiData) {
    console.log('❌ [GraficaResumenServicios] apiData es null o undefined');
    return null;
  }

  // Extraer servicios de la respuesta de la API
  let serviciosData = [];
  let totalServicios = 0;
  let totalSolicitudes = 0;
  
  // Estructura más común: apiData.data.servicios
  if (apiData.data && apiData.data.servicios && Array.isArray(apiData.data.servicios)) {
    serviciosData = apiData.data.servicios;
    totalServicios = apiData.data.total_servicios || serviciosData.length;
    totalSolicitudes = apiData.data.total_solicitudes || 0;
    console.log('✅ [GraficaResumenServicios] Estructura encontrada: apiData.data.servicios');
  }
  // Estructura alternativa: apiData.servicios
  else if (apiData.servicios && Array.isArray(apiData.servicios)) {
    serviciosData = apiData.servicios;
    totalServicios = apiData.total_servicios || serviciosData.length;
    totalSolicitudes = apiData.total_solicitudes || 0;
    console.log('✅ [GraficaResumenServicios] Estructura encontrada: apiData.servicios');
  }
  // Estructura alternativa: apiData.data es array
  else if (apiData.data && Array.isArray(apiData.data)) {
    serviciosData = apiData.data;
    console.log('✅ [GraficaResumenServicios] Estructura encontrada: apiData.data (array)');
  }
  // Estructura alternativa: apiData es array directo
  else if (Array.isArray(apiData)) {
    serviciosData = apiData;
    console.log('✅ [GraficaResumenServicios] Estructura encontrada: apiData (array directo)');
  }
  
  if (serviciosData.length === 0) {
    console.log('❌ [GraficaResumenServicios] No se encontraron servicios');
    console.log('⚠️ [GraficaResumenServicios] Propiedades disponibles:', Object.keys(apiData));
    if (apiData.data) {
      console.log('⚠️ [GraficaResumenServicios] apiData.data propiedades:', Object.keys(apiData.data));
    }
    return null;
  }
  
  console.log('✅ [GraficaResumenServicios] Servicios encontrados:', serviciosData.length);
  console.log('✅ [GraficaResumenServicios] Total servicios:', totalServicios);
  console.log('✅ [GraficaResumenServicios] Total solicitudes:', totalSolicitudes);

  // Transformar servicios manteniendo toda la información de la API
  const serviciosTransformados = serviciosData.map(item => {
    const nombreServicio = item.nombre || item.servicio || item.nombre_servicio || item.tipo || 'Servicio';
    const totalSolicitudesServicio = item.total_solicitudes || 0;
    const porcentajeUso = item.porcentaje_uso || 0;
    const precioBase = item.precio_base || 0;
    const estadoDistribucion = item.estado_distribucion || {};
    const idServicio = item.id_servicio || item.id || null;
    
    // Extraer todos los estados dinámicos del estado_distribucion
    const estados = [];
    if (estadoDistribucion && typeof estadoDistribucion === 'object') {
      Object.keys(estadoDistribucion).forEach(estado => {
        const cantidad = estadoDistribucion[estado] || 0;
        if (cantidad > 0) {
          estados.push({
            nombre: estado,
            cantidad: cantidad,
            color: getEstadoColor(estado)
          });
        }
      });
    }
    
    // Ordenar estados por cantidad (mayor a menor)
    estados.sort((a, b) => b.cantidad - a.cantidad);
    
    return {
      id: idServicio,
      nombre: nombreServicio,
      totalSolicitudes: totalSolicitudesServicio,
      porcentajeUso: porcentajeUso,
      precioBase: precioBase,
      estados: estados,
      estadoDistribucion: estadoDistribucion, // Mantener objeto original para referencia
      datosCompletos: item // Mantener todos los datos originales
    };
  });
  
  // Ordenar servicios por total de solicitudes (mayor a menor)
  serviciosTransformados.sort((a, b) => b.totalSolicitudes - a.totalSolicitudes);
  
  return {
    servicios: serviciosTransformados,
    totalServicios: totalServicios,
    totalSolicitudes: totalSolicitudes,
    periodo: apiData.data?.periodo || apiData.periodo || null
  };
};

const GraficaResumenServicios = () => {
  const [periodo, setPeriodo] = useState(PERIODO_DEFECTO); // Usar período por defecto desde configuración
  
  // Obtener datos de la API
  const { data: apiData, loading, error, refetch, updatePeriodo } = useDashboardServicios(periodo, true);

  // Transformar datos de la API
  const datosTransformados = useMemo(() => {
    console.log('🔄 [GraficaResumenServicios] useMemo - apiData recibido:', apiData);
    if (!apiData) {
      console.log('❌ [GraficaResumenServicios] apiData es null o undefined en useMemo');
      return null;
    }
    const transformed = transformarDatosAPI(apiData);
    console.log('📊 [GraficaResumenServicios] Datos transformados:', transformed);
    return transformed;
  }, [apiData]);
  
  const servicios = datosTransformados?.servicios || [];
  const totalServicios = datosTransformados?.totalServicios || 0;
  const totalSolicitudes = datosTransformados?.totalSolicitudes || 0;

  // Manejar cambio de periodo
  const handlePeriodoChange = (newPeriodo) => {
    setPeriodo(newPeriodo);
    updatePeriodo(newPeriodo);
  };

  const handleDescargarExcel = () => {
    if (!servicios || servicios.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para descargar'
      });
      return;
    }

    // Preparar datos para Excel con todos los estados dinámicos
    const dataExcel = servicios.map(servicio => {
      const fila = {
        Servicio: servicio.nombre,
        "Total Solicitudes": servicio.totalSolicitudes,
        "Porcentaje de Uso": servicio.porcentajeUso ? `${servicio.porcentajeUso.toFixed(2)}%` : '0%',
        "Precio Base": servicio.precioBase ? formatCurrency(servicio.precioBase) : '$0'
      };
      
      // Agregar cada estado dinámico como columna
      servicio.estados.forEach(estado => {
        fila[estado.nombre] = estado.cantidad;
      });
      
      return fila;
    });
    
    // Agregar fila de totales
    const totalesFila = {
      Servicio: 'TOTALES',
      "Total Solicitudes": totalSolicitudes,
      "Porcentaje de Uso": '100%',
      "Precio Base": '-'
    };
    
    // Sumar totales por estado
    servicios.forEach(servicio => {
      servicio.estados.forEach(estado => {
        if (!totalesFila[estado.nombre]) {
          totalesFila[estado.nombre] = 0;
        }
        totalesFila[estado.nombre] += estado.cantidad;
      });
    });
    
    dataExcel.push(totalesFila);
    
    const hoja = XLSX.utils.json_to_sheet(dataExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "ResumenServicios");
    const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `resumen_servicios_${periodo}.xlsx`);
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'Archivo Excel descargado exitosamente.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-4 p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Cargando resumen de servicios...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-4 p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <div className="text-red-600 text-2xl mb-2">⚠️</div>
            <h3 className="text-red-800 font-bold mb-1">Error al cargar los datos</h3>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={refetch}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay datos
  if (!servicios || servicios.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-4 p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-400 text-3xl mb-2">📊</div>
            <p className="text-gray-600 text-sm mb-3">No hay datos disponibles para el período seleccionado</p>
            <button
              onClick={refetch}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 mb-4 p-2">
      {/* Filtros de periodo y botón de descarga */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="font-bold text-lg text-blue-800">Resumen de Servicios</div>
            {(totalServicios > 0 || totalSolicitudes > 0) && (
              <div className="text-xs text-gray-600 mt-1">
                {totalServicios > 0 && <span>{formatNumber(totalServicios)} servicio{totalServicios !== 1 ? 's' : ''}</span>}
                {totalServicios > 0 && totalSolicitudes > 0 && <span> • </span>}
                {totalSolicitudes > 0 && <span>{formatNumber(totalSolicitudes)} solicitud{totalSolicitudes !== 1 ? 'es' : ''}</span>}
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center w-full md:w-auto">
            {/* Selector de período */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap"><i className="bi bi-calendar-event"></i> Período:</span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 md:min-w-[150px]"
                value={periodo}
                onChange={e => handlePeriodoChange(e.target.value)}
              >
                {periodos.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Botón de descarga */}
            <div className="flex gap-2 items-center">
              <DownloadButton
                type="excel"
                onClick={handleDescargarExcel}
                title="Descargar Excel"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tarjetas de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {servicios.map((servicio) => {
          const totalEstados = servicio.estados.reduce((sum, estado) => sum + estado.cantidad, 0);
          
          return (
            <div
              key={servicio.id || servicio.nombre}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
            >
              {/* Encabezado del servicio */}
              <div className="mb-3">
                <h3 className="font-bold text-base text-gray-800 mb-1 line-clamp-2" title={servicio.nombre}>
                  {servicio.nombre}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <i className="bi bi-file-earmark-text mr-1"></i>
                    <span className="font-semibold text-gray-800">{formatNumber(servicio.totalSolicitudes)}</span>
                    <span className="text-gray-500 ml-1">solicitud{servicio.totalSolicitudes !== 1 ? 'es' : ''}</span>
                  </span>
                  {servicio.porcentajeUso > 0 && (
                    <span className="text-blue-600 font-medium">
                      {servicio.porcentajeUso.toFixed(1)}%
                    </span>
                  )}
                </div>
                {servicio.precioBase > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    <i className="bi bi-currency-dollar mr-1"></i>
                    {formatCurrency(servicio.precioBase)}
                  </div>
                )}
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-3"></div>
              
              {/* Estados del servicio */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Estados ({totalEstados}):
                </div>
                {servicio.estados.length > 0 ? (
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                    {servicio.estados.map((estado, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between text-xs font-medium rounded-md px-2.5 py-1.5 border ${estado.color.bg} ${estado.color.text} ${estado.color.border}`}
                      >
                        <span className="truncate flex-1 mr-2" title={estado.nombre}>
                          {estado.nombre}
                        </span>
                        <span className="font-bold flex-shrink-0">
                          {formatNumber(estado.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-2">
                    Sin solicitudes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GraficaResumenServicios;
