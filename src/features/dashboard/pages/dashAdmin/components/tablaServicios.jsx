import React, { useState, useMemo } from "react";
import { FileText, Download, ArrowRight } from "lucide-react";
import BotonDescargarExcel from "./descargarExcel";
import DownloadButton from "../../../../../shared/components/DownloadButton";
import BotonInfo from "./detalleInfo";
import ModalDetalleServicio from "./modalInfo";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import StandardAvatar from "../../../../../shared/components/StandardAvatar";
import { useDashboardInactivas } from "../../../hooks/useDashboardData";
import dashboardApiService from "../../../services/dashboardApiService";


// Badge de estado
const EstadoBadge = ({ estado }) => {
  const estadoLower = (estado || "").toLowerCase();
  if (estadoLower.includes("juicio"))
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{estado}</span>;
  if (estadoLower.includes("forma"))
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">{estado}</span>;
  if (estadoLower.includes("pendiente"))
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">{estado}</span>;
  if (estadoLower.includes("incompleta"))
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">{estado}</span>;
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{estado}</span>;
};

// Color para días
const DiasColor = ({ dias }) => {
  const num = parseInt(dias);
  let color = "text-gray-700";
  if (num >= 30) color = "text-red-600";
  else if (num >= 15) color = "text-orange-500";
  else if (num >= 8) color = "text-yellow-600";
  else color = "text-blue-700";
  return <span className={color + " font-semibold"}>{dias} días</span>;
};

// Función para transformar datos de la API al formato del componente
const transformarDatosAPI = (apiData) => {
  if (!apiData) return [];

  // Intentar diferentes estructuras de respuesta de la API
  let servicios = [];
  
  // Estructura 1: apiData contiene array de servicios
  if (Array.isArray(apiData)) {
    servicios = apiData;
  }
  // Estructura 2: apiData tiene propiedad servicios
  else if (apiData.servicios && Array.isArray(apiData.servicios)) {
    servicios = apiData.servicios;
  }
  // Estructura 3: apiData tiene propiedad data con servicios
  else if (apiData.data && Array.isArray(apiData.data)) {
    servicios = apiData.data;
  }
  // Estructura 4: apiData tiene propiedad inactivas
  else if (apiData.inactivas && Array.isArray(apiData.inactivas)) {
    servicios = apiData.inactivas;
  }
  // Estructura 5: apiData tiene propiedad solicitudes_inactivas
  else if (apiData.solicitudes_inactivas && Array.isArray(apiData.solicitudes_inactivas)) {
    servicios = apiData.solicitudes_inactivas;
  }

  // Transformar cada servicio al formato del componente
  return servicios.map((item, index) => {
    // Debug: ver estructura del item original
    if (index === 0) {
      console.log('🔍 [transformarDatosAPI] Primer item de la API:', JSON.stringify(item, null, 2));
      console.log('🔍 [transformarDatosAPI] Estructura cliente:', item.cliente);
      console.log('🔍 [transformarDatosAPI] Cliente.usuario:', item.cliente?.usuario);
    }
    
    // Obtener nombre del servicio
    const servicioNombre = item.nombre_servicio || item.servicio || item.tipo_servicio || item.servicio_nombre || 'Servicio';
    
    // Obtener nombre del cliente - buscando en múltiples ubicaciones
    let clienteNombre = null;
    
    // 0. PRIMERO: Verificar si cliente es un string directo (caso más común en esta API)
    if (typeof item.cliente === 'string' && item.cliente.trim() !== '') {
      clienteNombre = item.cliente.trim();
      if (index === 0) console.log('✅ [transformarDatosAPI] Cliente encontrado (string directo):', clienteNombre);
    }
    
    // 1. Intentar desde el objeto cliente.usuario (estructura más común cuando es objeto)
    if (!clienteNombre && item.cliente?.usuario) {
      if (item.cliente.usuario.nombre && item.cliente.usuario.apellido) {
        clienteNombre = `${item.cliente.usuario.nombre} ${item.cliente.usuario.apellido}`;
        if (index === 0) console.log('✅ [transformarDatosAPI] Cliente encontrado (nombre + apellido):', clienteNombre);
      } else if (item.cliente.usuario.nombre) {
        clienteNombre = item.cliente.usuario.nombre;
        if (index === 0) console.log('✅ [transformarDatosAPI] Cliente encontrado (nombre):', clienteNombre);
      } else if (item.cliente.usuario.correo) {
        clienteNombre = item.cliente.usuario.correo;
        if (index === 0) console.log('✅ [transformarDatosAPI] Cliente encontrado (correo):', clienteNombre);
      }
    }
    
    // 2. Si no se encontró, intentar desde cliente como objeto (nombre, razon_social, etc.)
    if (!clienteNombre && item.cliente && typeof item.cliente === 'object') {
      if (item.cliente.nombre) {
        clienteNombre = item.cliente.nombre;
      } else if (item.cliente.razon_social) {
        clienteNombre = item.cliente.razon_social;
      } else if (item.cliente.nombre_completo) {
        clienteNombre = item.cliente.nombre_completo;
      }
    }
    
    // 3. Intentar campos directos en el item (cliente_nombre, nombre_cliente, etc.)
    if (!clienteNombre) {
      if (item.cliente_nombre) {
        clienteNombre = item.cliente_nombre;
      } else if (item.nombre_cliente) {
        clienteNombre = item.nombre_cliente;
      } else if (item.cliente_nombre_completo) {
        clienteNombre = item.cliente_nombre_completo;
      } else if (item.nombre_solicitante) {
        clienteNombre = item.nombre_solicitante;
      } else if (item.solicitante) {
        clienteNombre = item.solicitante;
      } else if (item.cliente_nombre_completo_solicitante) {
        clienteNombre = item.cliente_nombre_completo_solicitante;
      }
    }
    
    // 4. Intentar desde orden_servicio.cliente
    if (!clienteNombre && item.orden_servicio?.cliente) {
      if (item.orden_servicio.cliente.usuario) {
        if (item.orden_servicio.cliente.usuario.nombre && item.orden_servicio.cliente.usuario.apellido) {
          clienteNombre = `${item.orden_servicio.cliente.usuario.nombre} ${item.orden_servicio.cliente.usuario.apellido}`;
        } else if (item.orden_servicio.cliente.usuario.nombre) {
          clienteNombre = item.orden_servicio.cliente.usuario.nombre;
        } else if (item.orden_servicio.cliente.usuario.correo) {
          clienteNombre = item.orden_servicio.cliente.usuario.correo;
        }
      }
      if (!clienteNombre && item.orden_servicio.cliente.nombre) {
        clienteNombre = item.orden_servicio.cliente.nombre;
      }
      if (!clienteNombre && item.orden_servicio.cliente.razon_social) {
        clienteNombre = item.orden_servicio.cliente.razon_social;
      }
    }
    
    // 5. Intentar desde solicitud.cliente
    if (!clienteNombre && item.solicitud?.cliente) {
      if (item.solicitud.cliente.usuario) {
        if (item.solicitud.cliente.usuario.nombre && item.solicitud.cliente.usuario.apellido) {
          clienteNombre = `${item.solicitud.cliente.usuario.nombre} ${item.solicitud.cliente.usuario.apellido}`;
        } else if (item.solicitud.cliente.usuario.nombre) {
          clienteNombre = item.solicitud.cliente.usuario.nombre;
        }
      }
    }
    
    // 6. Como último recurso, usar correo electrónico o ID
    if (!clienteNombre) {
      if (item.cliente?.usuario?.correo) {
        clienteNombre = item.cliente.usuario.correo;
      } else if (item.correo_electronico) {
        clienteNombre = item.correo_electronico;
      } else if (item.cliente?.id_cliente) {
        clienteNombre = `Cliente ID: ${item.cliente.id_cliente}`;
      } else if (item.id_cliente) {
        clienteNombre = `Cliente ID: ${item.id_cliente}`;
      } else {
        // Solo como último recurso usar 'Cliente'
        clienteNombre = 'Cliente';
      }
    }
    
    // Obtener nombre del empleado - buscando en múltiples ubicaciones
    let empleadoNombre = null;
    
    // 0. PRIMERO: Verificar si empleado_asignado es un string directo (caso más común en esta API)
    if (typeof item.empleado_asignado === 'string' && item.empleado_asignado.trim() !== '' && item.empleado_asignado !== 'Sin asignar') {
      empleadoNombre = item.empleado_asignado.trim();
      if (index === 0) console.log('✅ [transformarDatosAPI] Empleado encontrado (empleado_asignado):', empleadoNombre);
    }
    
    // 1. Intentar desde el objeto empleado.usuario (estructura más común cuando es objeto)
    if (!empleadoNombre && item.empleado?.usuario) {
      if (item.empleado.usuario.nombre && item.empleado.usuario.apellido) {
        empleadoNombre = `${item.empleado.usuario.nombre} ${item.empleado.usuario.apellido}`;
        if (index === 0) console.log('✅ [transformarDatosAPI] Empleado encontrado (nombre + apellido):', empleadoNombre);
      } else if (item.empleado.usuario.nombre) {
        empleadoNombre = item.empleado.usuario.nombre;
        if (index === 0) console.log('✅ [transformarDatosAPI] Empleado encontrado (nombre):', empleadoNombre);
      }
    }
    
    // 2. Si no se encontró, intentar desde empleado como string o objeto
    if (!empleadoNombre && item.empleado) {
      if (typeof item.empleado === 'string' && item.empleado.trim() !== '' && item.empleado !== 'Sin asignar') {
        empleadoNombre = item.empleado.trim();
      } else if (item.empleado.nombre) {
        empleadoNombre = item.empleado.nombre;
      }
    }
    
    // 3. Intentar campos directos en el item
    if (!empleadoNombre) {
      if (item.empleado_nombre && item.empleado_nombre !== 'Sin asignar') {
        empleadoNombre = item.empleado_nombre;
      } else if (item.nombre_empleado && item.nombre_empleado !== 'Sin asignar') {
        empleadoNombre = item.nombre_empleado;
      }
    }
    
    // 4. Intentar desde orden_servicio.empleado
    if (!empleadoNombre && item.orden_servicio?.empleado) {
      if (item.orden_servicio.empleado.usuario) {
        if (item.orden_servicio.empleado.usuario.nombre && item.orden_servicio.empleado.usuario.apellido) {
          empleadoNombre = `${item.orden_servicio.empleado.usuario.nombre} ${item.orden_servicio.empleado.usuario.apellido}`;
        } else if (item.orden_servicio.empleado.usuario.nombre) {
          empleadoNombre = item.orden_servicio.empleado.usuario.nombre;
        }
      }
      if (!empleadoNombre && item.orden_servicio.empleado.nombre) {
        empleadoNombre = item.orden_servicio.empleado.nombre;
      }
    }
    
    // 5. Como último recurso
    if (!empleadoNombre) {
      empleadoNombre = 'Sin asignar';
    }
    
    // Obtener estado
    const estado = item.estado || item.estado_actual || item.estado_servicio || 'Desconocido';
    
    // Obtener días de inactividad
    const diasInactividad = item.dias_inactivos || 
                           item.dias_sin_actualizar || 
                           item.dias_inactividad ||
                           item.dias || 
                           0;
    
    // Si todavía no encontramos el nombre del cliente, intentar desde datosCompletos si existe
    let clienteNombreFinal = clienteNombre;
    if (clienteNombreFinal === 'Cliente' && item.datosCompletos) {
      const datosCompletos = item.datosCompletos;
      if (datosCompletos.cliente?.usuario?.nombre && datosCompletos.cliente?.usuario?.apellido) {
        clienteNombreFinal = `${datosCompletos.cliente.usuario.nombre} ${datosCompletos.cliente.usuario.apellido}`;
      } else if (datosCompletos.cliente?.usuario?.nombre) {
        clienteNombreFinal = datosCompletos.cliente.usuario.nombre;
      } else if (datosCompletos.cliente?.nombre) {
        clienteNombreFinal = datosCompletos.cliente.nombre;
      } else if (datosCompletos.cliente_nombre) {
        clienteNombreFinal = datosCompletos.cliente_nombre;
      }
    }

    // Debug: verificar el resultado final
    if (index === 0) {
      console.log('📋 [transformarDatosAPI] Cliente nombre final:', clienteNombreFinal);
      console.log('📋 [transformarDatosAPI] Empleado:', empleadoNombre);
      console.log('📋 [transformarDatosAPI] Inactividad:', diasInactividad);
    }

    return {
      id: item.id || item.id_orden_servicio || item.id_solicitud || index,
      servicio: servicioNombre,
      cliente: clienteNombreFinal,
      empleado: empleadoNombre,
      estado: estado,
      inactividad: diasInactividad,
      datosCompletos: item // Guardar datos completos para el modal
    };
  });
};

const TablaServicios = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const navigate = useNavigate();

  // Obtener datos de la API
  const { data: apiData, loading, error, refetch } = useDashboardInactivas(true);

  // Transformar datos de la API
  const datos = useMemo(() => {
    if (!apiData) return [];
    const datosTransformados = transformarDatosAPI(apiData);
    // Debug: verificar que el nombre del cliente se esté extrayendo correctamente
    if (datosTransformados.length > 0) {
      console.log('🔍 [TablaServicios] Primer item transformado:', datosTransformados[0]);
      console.log('🔍 [TablaServicios] Cliente del primer item:', datosTransformados[0].cliente);
      console.log('🔍 [TablaServicios] Empleado del primer item:', datosTransformados[0].empleado);
      console.log('🔍 [TablaServicios] Inactividad del primer item:', datosTransformados[0].inactividad);
    }
    return datosTransformados;
  }, [apiData]);

  // Filtrado global por todos los campos relevantes
  const datosFiltrados = useMemo(() => {
    if (!busquedaGlobal) return datos;
    return datos.filter((item) => {
      const texto = `${item.servicio} ${item.cliente} ${item.empleado} ${item.estado} ${item.inactividad}`.toLowerCase();
      return texto.includes(busquedaGlobal.toLowerCase());
    });
  }, [datos, busquedaGlobal]);

  const abrirModal = (servicio) => {
    setServicioSeleccionado(servicio);
    setModalAbierto(true);
  };

  const irAVentasProceso = () => {
    // Navegar a la tabla de ventas en proceso
    navigate("/admin/ventasServiciosProceso");
  };

  const descargarExcelInactivos = async () => {
    try {
      // Usar el servicio API para descargar Excel directamente
      const result = await dashboardApiService.getInactivas('excel');
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Excel descargado exitosamente.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Navegar después de descargar
          irAVentasProceso();
        });
      } else {
        // Si falla la descarga directa, crear Excel localmente
        const dataExcel = datosFiltrados.map(item => ({
          Servicio: item.servicio,
          Cliente: item.cliente,
          Empleado: item.empleado,
          Estado: item.estado,
          "Días de Inactividad": item.inactividad
        }));
        
        const libro = XLSX.utils.book_new();
        const hoja = XLSX.utils.json_to_sheet(dataExcel);
        XLSX.utils.book_append_sheet(libro, hoja, "ServiciosInactivos");
        const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "servicios-inactivos-prolongados.xlsx");
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Excel descargado exitosamente.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          irAVentasProceso();
        });
      }
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el archivo Excel.'
      });
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="card-responsive hover-responsive z-40">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Cargando servicios inactivos...</p>
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
    <>
      <div className="card-responsive hover-responsive z-40">
        {/* Encabezado elegante */}
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-gray-200 p-2 rounded-full">
            <i className="bi bi-exclamation-triangle text-gray-600 text-xl"></i>
          </div>
          <h2 className="text-lg font-bold text-gray-800 tracking-wide">Servicios con Inactividad Prolongada</h2>
          <div className="ml-auto flex gap-2">
            <DownloadButton
              type="excel"
              onClick={descargarExcelInactivos}
              title="Descargar Excel"
            />
          </div>
        </div>
        {/* Barra de búsqueda global */}
        <div className="flex flex-col md:flex-row gap-4 px-6 py-4 bg-white">
          <input
            type="text"
            placeholder="Buscar por servicio, cliente, empleado, estado..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/2"
            value={busquedaGlobal}
            onChange={e => setBusquedaGlobal(e.target.value)}
          />
          {datosFiltrados.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              {datosFiltrados.length} servicio(s) encontrado(s)
            </div>
          )}
        </div>
        <div className="table-responsive">
          <table className="table-auto w-full divide-y divide-gray-100">
            <thead className="text-left text-sm text-gray-500 bg-gray-50">
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-bold text-center">Servicio</th>
                <th className="px-6 py-4 font-bold text-center">Cliente</th>
                <th className="px-6 py-4 font-bold text-center">Empleado</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Días Inactivo</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {datosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-8">
                    {busquedaGlobal 
                      ? "No se encontraron servicios con los filtros actuales." 
                      : "No hay servicios inactivos en este momento."}
                  </td>
                </tr>
              ) : (
                datosFiltrados.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-3 justify-center">
                        <FileText className="text-blue-500" size={20} />
                        <span className="font-medium text-gray-800">{item.servicio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <StandardAvatar nombre={
                          item.cliente && item.cliente !== 'Cliente'
                            ? item.cliente
                            : (typeof item.datosCompletos?.cliente === 'string' && item.datosCompletos.cliente.trim() !== ''
                                ? item.datosCompletos.cliente
                                : 'Cliente')
                        } />
                        <span className="font-medium text-gray-800">
                          {item.cliente && item.cliente !== 'Cliente' 
                            ? item.cliente 
                            : (typeof item.datosCompletos?.cliente === 'string' && item.datosCompletos.cliente.trim() !== ''
                                ? item.datosCompletos.cliente
                                : (item.datosCompletos?.cliente?.usuario?.nombre && item.datosCompletos?.cliente?.usuario?.apellido
                                    ? `${item.datosCompletos.cliente.usuario.nombre} ${item.datosCompletos.cliente.usuario.apellido}`
                                    : item.datosCompletos?.cliente?.usuario?.nombre ||
                                      item.datosCompletos?.cliente?.nombre ||
                                      item.datosCompletos?.cliente_nombre ||
                                      item.datosCompletos?.nombre_cliente ||
                                      item.cliente ||
                                      'Cliente'))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <StandardAvatar 
                          nombre={item.empleado && item.empleado !== 'Sin asignar'
                            ? item.empleado
                            : (item.datosCompletos?.empleado?.usuario?.nombre && item.datosCompletos?.empleado?.usuario?.apellido
                                ? `${item.datosCompletos.empleado.usuario.nombre} ${item.datosCompletos.empleado.usuario.apellido}`
                                : item.datosCompletos?.empleado?.usuario?.nombre ||
                                  item.datosCompletos?.empleado_nombre ||
                                  'Sin asignar')} 
                          color="#444" 
                        />
                        <span className="font-medium text-gray-800">
                          {item.empleado && item.empleado !== 'Sin asignar'
                            ? item.empleado
                            : (item.datosCompletos?.empleado?.usuario?.nombre && item.datosCompletos?.empleado?.usuario?.apellido
                                ? `${item.datosCompletos.empleado.usuario.nombre} ${item.datosCompletos.empleado.usuario.apellido}`
                                : item.datosCompletos?.empleado?.usuario?.nombre ||
                                  item.datosCompletos?.empleado_nombre ||
                                  item.datosCompletos?.nombre_empleado ||
                                  'Sin asignar')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <EstadoBadge estado={item.estado} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <i className="bi bi-clock-history text-gray-400 text-base"></i>
                        <DiasColor dias={parseInt(item.inactividad) || 0} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <BotonInfo
                          onClick={() => {
                            // Pasar el item transformado completo (que ya tiene cliente, empleado, inactividad)
                            // pero también incluir datosCompletos para información adicional
                            console.log('🔍 [TablaServicios] Item seleccionado para modal:', item);
                            console.log('🔍 [TablaServicios] Cliente en item:', item.cliente);
                            console.log('🔍 [TablaServicios] Empleado en item:', item.empleado);
                            console.log('🔍 [TablaServicios] Inactividad en item:', item.inactividad);
                            setServicioSeleccionado({
                              servicio: item.servicio,
                              cliente: item.cliente,
                              empleado: item.empleado,
                              estado: item.estado,
                              inactividad: item.inactividad,
                              datosCompletos: item.datosCompletos
                            });
                            setModalAbierto(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal con detalle del servicio */}
      <ModalDetalleServicio
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        datos={servicioSeleccionado}
      />
    </>
  );
};

export default TablaServicios; 