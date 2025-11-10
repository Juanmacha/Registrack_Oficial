import React, { useState, useRef, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import BotonDescargarPdf from "./descargarPdf";
import { useDashboardIngresos } from "../../../hooks/useDashboardData";
import { PERIODOS_DISPONIBLES, PERIODO_DEFECTO } from "../../../shared/periodos";

ChartJS.register(ArcElement, Tooltip, Legend);

// Colores predefinidos para los servicios
const servicioColors = {
  "Certificación": "#347cf7",
  "Renovación": "#ff7d1a",
  "Proceso de Oposición": "#22c55e",
  "Búsqueda de Antecedentes": "#a259e6",
  "Ampliación de Alcance": "#1cc6e6",
  "Cesión de Marca": "#b6e61c",
  // Colores por defecto si no hay coincidencia
  "default": ["#347cf7", "#ff7d1a", "#22c55e", "#a259e6", "#1cc6e6", "#b6e61c"]
};

// Usar períodos desde el archivo compartido
const periodos = PERIODOS_DISPONIBLES;

// Función para transformar datos de la API al formato del gráfico
const transformarDatosAPI = (apiData) => {
  console.log('🔍 [GraficaIngresosPie] transformarDatosAPI - apiData recibido:', apiData);
  console.log('🔍 [GraficaIngresosPie] Tipo de apiData:', typeof apiData);
  console.log('🔍 [GraficaIngresosPie] ¿Es array?', Array.isArray(apiData));
  
  if (!apiData) {
    console.log('❌ [GraficaIngresosPie] apiData es null o undefined');
    return null;
  }

  // Intentar diferentes estructuras de respuesta de la API
  let servicios = [];
  
  // Estructura 1: apiData contiene array de servicios con nombre e ingresos
  if (Array.isArray(apiData)) {
    servicios = apiData;
    console.log('✅ [GraficaIngresosPie] Estructura 1: Array directo, servicios encontrados:', servicios.length);
  }
  // Estructura 2: apiData tiene propiedad servicios
  else if (apiData.servicios && Array.isArray(apiData.servicios)) {
    servicios = apiData.servicios;
    console.log('✅ [GraficaIngresosPie] Estructura 2: apiData.servicios, servicios encontrados:', servicios.length);
  }
  // Estructura 3: apiData tiene propiedad data con servicios
  else if (apiData.data && Array.isArray(apiData.data)) {
    servicios = apiData.data;
    console.log('✅ [GraficaIngresosPie] Estructura 3: apiData.data, servicios encontrados:', servicios.length);
  }
  // Estructura 4: apiData tiene propiedad ingresos_por_servicio
  else if (apiData.ingresos_por_servicio && Array.isArray(apiData.ingresos_por_servicio)) {
    servicios = apiData.ingresos_por_servicio;
    console.log('✅ [GraficaIngresosPie] Estructura 4: apiData.ingresos_por_servicio, servicios encontrados:', servicios.length);
  }
  // Estructura 5: apiData tiene propiedad resumen o resultados
  else if (apiData.resumen && Array.isArray(apiData.resumen)) {
    servicios = apiData.resumen;
    console.log('✅ [GraficaIngresosPie] Estructura 5: apiData.resumen, servicios encontrados:', servicios.length);
  }
  // Estructura 6: apiData tiene propiedad resultados
  else if (apiData.resultados && Array.isArray(apiData.resultados)) {
    servicios = apiData.resultados;
    console.log('✅ [GraficaIngresosPie] Estructura 6: apiData.resultados, servicios encontrados:', servicios.length);
  }
  // Estructura 7: apiData tiene propiedad data que contiene la estructura real (PRIORIDAD ALTA)
  // Esta es la estructura real que devuelve la API según los logs
  if (apiData.data && typeof apiData.data === 'object') {
    // Si apiData.data tiene ingresos_por_mes, usar eso para calcular ingresos por servicio
    if (apiData.data.ingresos_por_mes && Array.isArray(apiData.data.ingresos_por_mes) && apiData.data.ingresos_por_mes.length > 0) {
      // Transformar ingresos_por_mes en servicios con ingresos
      const ingresosPorServicio = {};
      apiData.data.ingresos_por_mes.forEach(mes => {
        if (mes.servicios && Array.isArray(mes.servicios)) {
          mes.servicios.forEach(servicio => {
            const nombre = servicio.nombre || servicio.servicio || 'Servicio';
            if (!ingresosPorServicio[nombre]) {
              ingresosPorServicio[nombre] = 0;
            }
            ingresosPorServicio[nombre] += servicio.ingresos || servicio.total || 0;
          });
        }
      });
      
      // Convertir a array
      servicios = Object.keys(ingresosPorServicio).map(nombre => ({
        nombre: nombre,
        ingresos: ingresosPorServicio[nombre]
      }));
      console.log('✅ [GraficaIngresosPie] Estructura 7: ingresos_por_mes procesado, servicios encontrados:', servicios.length);
    }
    // Si apiData.data tiene ingresos_por_servicio
    else if (apiData.data.ingresos_por_servicio && Array.isArray(apiData.data.ingresos_por_servicio)) {
      servicios = apiData.data.ingresos_por_servicio;
      console.log('✅ [GraficaIngresosPie] Estructura 7a: apiData.data.ingresos_por_servicio, servicios encontrados:', servicios.length);
    }
    // Si apiData.data tiene servicios directamente
    else if (apiData.data.servicios && Array.isArray(apiData.data.servicios)) {
      servicios = apiData.data.servicios;
      console.log('✅ [GraficaIngresosPie] Estructura 7b: apiData.data.servicios, servicios encontrados:', servicios.length);
    }
    // Si no hay ingresos (total_ingresos: 0), mostrar mensaje apropiado
    else if (apiData.data.total_ingresos === 0 || apiData.data.total_ingresos === undefined) {
      console.log('⚠️ [GraficaIngresosPie] No hay ingresos en el período (total_ingresos: 0)');
      // Retornar null para mostrar el mensaje de "no hay datos"
      return null;
    }
  }
  
  // Estructura 8: Verificar todas las propiedades para debugging (solo si no se encontró nada)
  if (servicios.length === 0) {
    console.log('⚠️ [GraficaIngresosPie] No se encontró estructura conocida. Propiedades disponibles:', Object.keys(apiData));
    if (apiData.data) {
      console.log('⚠️ [GraficaIngresosPie] apiData.data propiedades:', Object.keys(apiData.data));
      console.log('⚠️ [GraficaIngresosPie] total_ingresos:', apiData.data.total_ingresos);
      console.log('⚠️ [GraficaIngresosPie] ingresos_por_mes:', apiData.data.ingresos_por_mes);
    }
    
    // Intentar encontrar cualquier propiedad que sea un array (incluyendo dentro de data)
    for (const key in apiData) {
      if (Array.isArray(apiData[key]) && apiData[key].length > 0) {
        console.log(`🔍 [GraficaIngresosPie] Encontrado array en propiedad "${key}":`, apiData[key]);
        servicios = apiData[key];
        break;
      }
      if (apiData[key] && typeof apiData[key] === 'object') {
        if (apiData[key].data && Array.isArray(apiData[key].data)) {
          console.log(`🔍 [GraficaIngresosPie] Encontrado array en "${key}.data":`, apiData[key].data);
          servicios = apiData[key].data;
          break;
        }
        // Buscar cualquier array dentro del objeto
        for (const subKey in apiData[key]) {
          if (Array.isArray(apiData[key][subKey]) && apiData[key][subKey].length > 0) {
            console.log(`🔍 [GraficaIngresosPie] Encontrado array en "${key}.${subKey}":`, apiData[key][subKey]);
            servicios = apiData[key][subKey];
            break;
          }
        }
        if (servicios.length > 0) break;
      }
    }
  }

  if (servicios.length === 0) {
    console.log('❌ [GraficaIngresosPie] No se encontraron servicios en ninguna estructura conocida');
    return null;
  }
  
  console.log('✅ [GraficaIngresosPie] Servicios a procesar:', servicios);

  // Extraer labels, values y colores
  const labels = servicios.map(item => {
    // Intentar diferentes campos para el nombre del servicio
    return item.nombre || item.servicio || item.nombre_servicio || item.tipo || 'Servicio';
  });

  const values = servicios.map(item => {
    // Intentar diferentes campos para el valor/ingreso
    return item.ingresos || item.total || item.cantidad || item.valor || item.monto || 0;
  });

  const colors = labels.map(label => {
    // Buscar color por nombre del servicio
    for (const [key, color] of Object.entries(servicioColors)) {
      if (label.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(label.toLowerCase())) {
        return color;
      }
    }
    // Si no hay coincidencia, usar colores por defecto en orden
    return servicioColors.default[labels.indexOf(label) % servicioColors.default.length];
  });

  return { labels, values, colors };
};

const GraficaIngresosPie = () => {
  const [periodo, setPeriodo] = useState(PERIODO_DEFECTO); // Usar período por defecto desde configuración
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const chartRef = useRef(null);

  // Obtener datos de la API
  const { data: apiData, loading, error, refetch, updatePeriodo } = useDashboardIngresos(periodo, true);

  // Transformar datos de la API
  const datos = useMemo(() => {
    console.log('🔄 [GraficaIngresosPie] useMemo - apiData recibido:', apiData);
    if (!apiData) {
      console.log('❌ [GraficaIngresosPie] apiData es null o undefined en useMemo');
      return null;
    }
    const transformed = transformarDatosAPI(apiData);
    console.log('📊 [GraficaIngresosPie] Datos transformados:', transformed);
    return transformed;
  }, [apiData]);

  // Calcular total
  const total = useMemo(() => {
    if (!datos || !datos.values) return 0;
    return datos.values.reduce((a, b) => a + b, 0);
  }, [datos]);

  // Datos para el gráfico
  const chartData = useMemo(() => {
    if (!datos) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 2,
          hoverOffset: 16,
        }]
      };
    }

    return {
      labels: datos.labels,
      datasets: [
        {
          data: datos.values,
          backgroundColor: datos.colors,
          borderWidth: 2,
          hoverOffset: 16,
        },
      ],
    };
  }, [datos]);

  // Datos para Excel/PDF
  const datosExcel = useMemo(() => {
    if (!datos) return [];
    return datos.labels.map((label, idx) => ({
      Servicio: label,
      Ingresos: datos.values[idx],
      Porcentaje: total > 0 ? ((datos.values[idx] / total) * 100).toFixed(2) + '%' : '0%'
    }));
  }, [datos, total]);

  const options = useMemo(() => ({
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percent = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
            return `${label}: $${value.toLocaleString()} (${percent}%)`;
          }
        }
      }
    },
    onHover: (event, chartElement) => {
      if (chartElement.length > 0) {
        setHoveredIndex(chartElement[0].index);
      } else {
        setHoveredIndex(null);
      }
    }
  }), [total]);

  // Manejar cambio de periodo
  const handlePeriodoChange = (newPeriodo) => {
    setPeriodo(newPeriodo);
    updatePeriodo(newPeriodo);
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="dashboard-chart-container flex flex-col lg:flex-row items-center justify-center gap-2 min-h-[400px] relative mr-4">
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="dashboard-chart-container flex flex-col lg:flex-row items-center justify-center gap-2 min-h-[400px] relative mr-4">
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-red-800 font-bold text-lg mb-2">Error al cargar los datos</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay datos
  if (!datos || datos.labels.length === 0) {
    return (
      <div className="dashboard-chart-container flex flex-col lg:flex-row items-center justify-center gap-2 min-h-[400px] relative mr-4">
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-600">No hay datos disponibles para el período seleccionado</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-chart-container flex flex-col lg:flex-row items-center justify-center gap-2 min-h-[400px] relative mr-4">
      {/* Botón PDF en la esquina superior derecha absoluta del contenedor principal */}
      <div className="absolute top-4 right-4 z-20">
        <BotonDescargarPdf 
          datos={datosExcel} 
          nombreArchivo={`ingresos_pie_${periodo}.pdf`} 
          chartRef={chartRef}
        />
      </div>
      {/* Panel izquierdo: gráfica dona */}
      <div className="flex-shrink-0 flex items-center justify-center lg:justify-end w-full lg:w-auto pr-0 lg:pr-32 dashboard-chart">
        <div className="w-96 h-96" ref={chartRef}>
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
      {/* Panel derecho: leyenda y controles */}
      <div className="flex flex-col items-center lg:items-start justify-center w-full max-w-md gap-3 relative pr-4">
        <h2 className="text-2xl font-bold text-center lg:text-left mb-2">Distribución de Ingresos por Servicio</h2>
        <div className="flex items-center gap-2 w-full mb-2">
          <span className="flex items-center gap-1 text-gray-500 text-sm"><i className="bi bi-calendar-event"></i> Período:</span>
          <select
            className="border border-gray-300 rounded px-2 py-1 flex-1 text-sm"
            value={periodo}
            onChange={e => handlePeriodoChange(e.target.value)}
          >
            {periodos.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        {/* Leyenda de servicios con porcentaje */}
        <div className="flex flex-col gap-2 w-full bg-white rounded-xl p-2">
          <h3 className="font-bold text-lg mb-1">Servicios</h3>
          {datos.labels.map((label, idx) => {
            const percent = total > 0 ? ((datos.values[idx] / total) * 100).toFixed(1) : 0;
            const isActive = hoveredIndex === idx;
            return (
              <div key={label} className={`flex items-center justify-between px-2 py-1 rounded-lg ${isActive ? "bg-gray-100" : ""}`}
                style={{ transition: 'background 0.2s' }}>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: datos.colors[idx] }}></span>
                  <span className="font-medium text-gray-700">{label}</span>
                </span>
                <span className="font-bold text-gray-800">{percent}%</span>
              </div>
            );
          })}
          {total > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between px-2">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-blue-600">${total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraficaIngresosPie; 