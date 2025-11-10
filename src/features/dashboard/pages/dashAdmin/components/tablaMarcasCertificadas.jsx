import React, { useState, useMemo } from "react";
import { Calendar, AlertTriangle, Download } from "lucide-react";
import BotonDescargarExcel from "./descargarExcel";
import StandardAvatar from "../../../../../shared/components/StandardAvatar";
import { useDashboardRenovaciones } from "../../../hooks/useDashboardData";
import dashboardApiService from "../../../services/dashboardApiService";
import Swal from "sweetalert2";

// Badge de estado de vencimiento
const EstadoVencimientoBadge = ({ diasRestantes }) => {
  const dias = parseInt(diasRestantes);
  if (dias <= 30) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Crítico</span>;
  } else if (dias <= 60) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Urgente</span>;
  } else if (dias <= 90) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Atención</span>;
  } else {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Normal</span>;
  }
};

// Color para días restantes
const DiasRestantesColor = ({ dias }) => {
  const num = parseInt(dias);
  let color = "text-gray-700";
  if (num <= 30) color = "text-red-600 font-bold";
  else if (num <= 60) color = "text-orange-500 font-semibold";
  else if (num <= 90) color = "text-yellow-600 font-semibold";
  else color = "text-green-700";
  return <span className={color}>{dias} días</span>;
};

// Función para transformar datos de la API al formato del componente
const transformarDatosAPI = (apiData) => {
  if (!apiData) return [];

  // Intentar diferentes estructuras de respuesta de la API
  let marcas = [];
  
  // Estructura 1: apiData contiene array de marcas
  if (Array.isArray(apiData)) {
    marcas = apiData;
  }
  // Estructura 2: apiData tiene propiedad marcas
  else if (apiData.marcas && Array.isArray(apiData.marcas)) {
    marcas = apiData.marcas;
  }
  // Estructura 3: apiData tiene propiedad data con marcas
  else if (apiData.data && Array.isArray(apiData.data)) {
    marcas = apiData.data;
  }
  // Estructura 4: apiData tiene propiedad renovaciones_proximas
  else if (apiData.renovaciones_proximas && Array.isArray(apiData.renovaciones_proximas)) {
    marcas = apiData.renovaciones_proximas;
  }
  // Estructura 5: apiData tiene propiedad renovaciones
  else if (apiData.renovaciones && Array.isArray(apiData.renovaciones)) {
    marcas = apiData.renovaciones;
  }

  // Transformar cada marca al formato del componente
  return marcas.map((item, index) => {
    // Obtener nombre de la marca
    const marcaNombre = item.nombre_marca || 
                       item.marca || 
                       item.nombre || 
                       item.marca_nombre || 
                       'Marca';
    
    // Obtener nombre del cliente
    const clienteNombre = item.cliente?.nombre || 
                         item.cliente_nombre || 
                         item.nombre_cliente || 
                         (item.cliente?.usuario?.nombre && item.cliente?.usuario?.apellido 
                           ? `${item.cliente.usuario.nombre} ${item.cliente.usuario.apellido}` 
                           : item.cliente?.usuario?.nombre || 
                           item.cliente?.razon_social || 
                           'Cliente');
    
    // Obtener nombre del empleado asignado
    const empleadoNombre = item.empleado?.nombre || 
                          item.empleado_nombre || 
                          item.nombre_empleado ||
                          (item.empleado?.usuario?.nombre && item.empleado?.usuario?.apellido 
                            ? `${item.empleado.usuario.nombre} ${item.empleado.usuario.apellido}` 
                            : item.empleado?.usuario?.nombre || 
                            'Sin asignar');
    
    // Obtener fechas
    const fechaCertificacion = item.fecha_certificacion || 
                              item.fecha_certificado || 
                              item.fecha_finalizacion ||
                              item.fecha_aprobacion ||
                              item.certificado_fecha ||
                              null;
    
    const fechaVencimiento = item.fecha_vencimiento || 
                            item.fecha_vencimiento_certificado || 
                            item.fecha_vencimiento_marca ||
                            item.vencimiento ||
                            null;
    
    // Calcular días restantes si no viene de la API
    let diasRestantes = item.dias_restantes || 
                       item.dias_hasta_vencimiento || 
                       item.dias_para_vencer ||
                       0;
    
    // Si no hay días restantes pero hay fecha de vencimiento, calcularlos
    if (!diasRestantes && fechaVencimiento) {
      const fechaVenc = new Date(fechaVencimiento);
      const hoy = new Date();
      const diffTime = fechaVenc.getTime() - hoy.getTime();
      diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Obtener estado
    const estado = item.estado || item.estado_marca || item.estado_certificado || 'Activa';
    
    return {
      id: item.id || item.id_marca || item.id_certificado || item.id_orden_servicio || index,
      marca: marcaNombre,
      cliente: clienteNombre,
      fechaCertificacion: fechaCertificacion,
      fechaVencimiento: fechaVencimiento,
      diasRestantes: diasRestantes,
      estado: estado,
      empleadoAsignado: empleadoNombre,
      datosCompletos: item // Guardar datos completos para acciones futuras
    };
  });
};

const TablaMarcasCertificadas = () => {
  const [busquedaGlobal, setBusquedaGlobal] = useState("");

  // Obtener datos de la API
  const { data: apiData, loading, error, refetch } = useDashboardRenovaciones(true);

  // Transformar datos de la API
  const datos = useMemo(() => {
    if (!apiData) return [];
    return transformarDatosAPI(apiData);
  }, [apiData]);

  // Filtrado global por todos los campos relevantes
  const datosFiltrados = useMemo(() => {
    if (!busquedaGlobal) return datos;
    return datos.filter((item) => {
      const texto = `${item.marca} ${item.cliente} ${item.empleadoAsignado} ${item.estado}`.toLowerCase();
      return texto.includes(busquedaGlobal.toLowerCase());
    });
  }, [datos, busquedaGlobal]);

  // Ordenar por días restantes (más críticos primero)
  const datosOrdenados = useMemo(() => {
    return [...datosFiltrados].sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [datosFiltrados]);

  // Manejar descarga de Excel
  const handleDescargarExcel = async () => {
    try {
      // Intentar descargar desde la API primero
      const result = await dashboardApiService.getRenovacionesProximas('excel');
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Archivo Excel descargado exitosamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Si falla, crear Excel localmente
        const dataExcel = datosOrdenados.map(item => ({
          Marca: item.marca,
          Cliente: item.cliente,
          "Fecha Certificación": item.fechaCertificacion ? new Date(item.fechaCertificacion).toLocaleDateString("es-ES") : 'N/A',
          "Fecha Vencimiento": item.fechaVencimiento ? new Date(item.fechaVencimiento).toLocaleDateString("es-ES") : 'N/A',
          "Días Restantes": item.diasRestantes,
          Estado: item.estado,
          "Empleado Asignado": item.empleadoAsignado
        }));
        
        // Usar BotonDescargarExcel para descargar localmente
        const blob = new Blob([JSON.stringify(dataExcel, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'marcas-certificadas-proximas-vencimiento.json';
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el archivo. Por favor, intente nuevamente.'
      });
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="card-responsive hover-responsive z-40">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Cargando marcas certificadas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="card-responsive hover-responsive z-40">
        <div className="flex items-center justify-center py-12">
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

  return (
    <div className="card-responsive hover-responsive z-40">
      {/* Encabezado elegante */}
      <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
        <div className="bg-orange-200 p-2 rounded-full">
          <AlertTriangle className="text-orange-600 text-xl" />
        </div>
        <h2 className="text-lg font-bold text-orange-800 tracking-wide">Marcas Certificadas Próximas a Vencerse</h2>
        <div className="ml-auto flex gap-2">
          <BotonDescargarExcel
            datos={datosOrdenados.map(item => ({
              Marca: item.marca,
              Cliente: item.cliente,
              "Fecha Certificación": item.fechaCertificacion ? new Date(item.fechaCertificacion).toLocaleDateString("es-ES") : 'N/A',
              "Fecha Vencimiento": item.fechaVencimiento ? new Date(item.fechaVencimiento).toLocaleDateString("es-ES") : 'N/A',
              "Días Restantes": item.diasRestantes,
              Estado: item.estado,
              "Empleado Asignado": item.empleadoAsignado
            }))}
            nombreArchivo="marcas-certificadas-proximas-vencimiento.xlsx"
          />
        </div>
      </div>

      {/* Barra de búsqueda global */}
      <div className="flex flex-col md:flex-row gap-4 px-6 py-4 bg-white">
        <input
          type="text"
          placeholder="Buscar por marca, cliente, empleado..."
          value={busquedaGlobal}
          onChange={(e) => setBusquedaGlobal(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{datosOrdenados.length} marca(s) encontrada(s)</span>
        </div>
      </div>

      {/* Tabla responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-bold text-center">Cliente</th>
              <th className="px-6 py-4 font-bold text-center">Marca</th>
              <th className="px-6 py-4 font-bold text-center">Fecha Certificación</th>
              <th className="px-6 py-4 font-bold text-center">Fecha Vencimiento</th>
              <th className="px-6 py-4 font-bold text-center">Días Restantes</th>
              <th className="px-6 py-4 font-bold text-center">Estado</th>
              <th className="px-6 py-4 font-bold text-center">Empleado Asignado</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datosOrdenados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-8">
                  {busquedaGlobal 
                    ? "No se encontraron marcas con los filtros actuales." 
                    : "No hay marcas certificadas próximas a vencerse en este momento."}
                </td>
              </tr>
            ) : (
              datosOrdenados.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <StandardAvatar 
                        nombre={item.cliente}
                      />
                      <div className="text-left">
                        <span>{item.cliente}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-gray-900">
                    {item.marca}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {item.fechaCertificacion 
                      ? new Date(item.fechaCertificacion).toLocaleDateString("es-ES") 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {item.fechaVencimiento 
                      ? new Date(item.fechaVencimiento).toLocaleDateString("es-ES") 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <DiasRestantesColor dias={item.diasRestantes || 0} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <EstadoVencimientoBadge diasRestantes={item.diasRestantes || 0} />
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700">
                    {item.empleadoAsignado}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="p-2 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                      title="Iniciar proceso de renovación"
                      onClick={() => {
                        // Aquí se puede agregar la lógica para iniciar el proceso de renovación
                        Swal.fire({
                          icon: 'info',
                          title: 'Proceso de renovación',
                          text: 'Funcionalidad de renovación próximamente disponible.',
                          confirmButtonText: 'OK'
                        });
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TablaMarcasCertificadas; 