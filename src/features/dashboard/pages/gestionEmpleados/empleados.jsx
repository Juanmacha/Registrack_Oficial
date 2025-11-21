import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import TablaEmpleados from "./components/tablaEmpleados";
import { EmployeeService, initializeMockData } from "../../../../utils/mockDataService.js";
import EditarEmpleadoModal from "./components/editarEmpleado";
import ProfileModal from "../../../../shared/components/ProfileModal";
import EliminarEmpleado from "./components/eliminarEmpleado";
import DescargarExcelEmpleados from "./components/descargarEmpleadosExcel";
import VerificacionAuth from "./components/VerificacionAuth";
import notificationService from "../../../../shared/services/NotificationService.js";
import useAuth from "../../hooks/useAuth.js";
import empleadosApiService from "../../services/empleadosApiService.js";


const Empleados = () => {
  const [datosEmpleados, setDatosEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(false);
  // Siempre usar API real
  const empleadosPorPagina = 5;
  const { isAuthenticated, isLoading: authLoading, refreshAuth } = useAuth();

  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  const [mostrarVer, setMostrarVer] = useState(false);
  const [empleadoViendo, setEmpleadoViendo] = useState(null);

  console.log("Empleados Component Render: mostrarEditar=", mostrarEditar, "mostrarVer=", mostrarVer);

  const handleEditar = (empleado) => {
    setEmpleadoEditando(empleado);
    setMostrarEditar(true);
  };

  // Función para cargar empleados desde la API
  const cargarEmpleados = async () => {
    setLoading(true);
    try {
        console.log('🔄 [Empleados] Cargando empleados desde API...');
        const response = await empleadosApiService.getAllEmpleados();
      console.log('📥 [Empleados] Respuesta completa de la API:', response);
      
      // La API devuelve un array directo según la documentación
      let empleadosData = [];
      
      if (Array.isArray(response)) {
        // Respuesta directa de la API (array)
        empleadosData = response;
        console.log('📋 [Empleados] Datos recibidos como array directo:', empleadosData);
      } else if (response && response.success && Array.isArray(response.data)) {
        // Respuesta envuelta en objeto con success
        empleadosData = response.data;
        console.log('📋 [Empleados] Datos recibidos envueltos en objeto:', empleadosData);
      } else if (response && Array.isArray(response.data)) {
        // Respuesta con data pero sin success
        empleadosData = response.data;
        console.log('📋 [Empleados] Datos recibidos en response.data:', empleadosData);
      } else {
        console.error('❌ [Empleados] Formato de respuesta inesperado:', response);
        notificationService.updateError('Formato de respuesta inesperado de la API');
        return;
      }
      
      if (empleadosData.length === 0) {
        console.log('⚠️ [Empleados] No hay empleados en la respuesta');
        setDatosEmpleados([]);
        notificationService.info('Sin empleados', 'No hay empleados registrados en el sistema.');
        return;
      }
      
          // Transformar datos de la API al formato esperado por el componente
      // Según la documentación actualizada, la API devuelve estructura completa con información de identificación:
      // { id_usuario, nombre, apellido, correo, tipo_documento, documento, rol, id_rol, estado_usuario, id_empleado, estado_empleado, es_empleado_registrado }
      const empleadosTransformados = empleadosData.map(empleado => {
          console.log('🔍 [Empleados] Procesando empleado con información completa:', empleado);
          
        return {
          id: empleado.id_empleado || empleado.id_usuario, // Fallback a id_usuario si no hay id_empleado
          id_empleado: empleado.id_empleado,
          id_usuario: empleado.id_usuario,
          // Información básica del empleado
          nombre: empleado.nombre || 'N/A',
          apellidos: empleado.apellido || 'N/A',
          correo: empleado.correo || 'N/A',
          email: empleado.correo || 'N/A', // Para compatibilidad
          rol: empleado.rol || 'empleado',
          id_rol: empleado.id_rol,
          estado: empleado.estado_empleado !== undefined ? (empleado.estado_empleado ? 'activo' : 'inactivo') : 'activo',
          // Información de identificación completa (NUEVA FUNCIONALIDAD)
          tipoDocumento: empleado.tipo_documento || 'CC',
          documento: empleado.documento || 'N/A',
          // Información del usuario asociado
          usuario: {
            id_usuario: empleado.id_usuario,
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            documento: empleado.documento,
            correo: empleado.correo,
            rol: empleado.rol,
            id_rol: empleado.id_rol,
            tipo_documento: empleado.tipo_documento,
            estado_usuario: empleado.estado_usuario
          },
          // Estado del empleado
          es_empleado_registrado: empleado.es_empleado_registrado !== undefined ? empleado.es_empleado_registrado : true,
          estado_usuario: empleado.estado_usuario
        };
        });
          setDatosEmpleados(empleadosTransformados);
          console.log('✅ [Empleados] Empleados cargados desde API:', empleadosTransformados);
        notificationService.success('Empleados cargados', 'Los empleados se han cargado correctamente.');
    } catch (error) {
      console.error('💥 [Empleados] Error al cargar empleados:', error);
      notificationService.updateError('Error al cargar empleados: ' + error.message);
      setDatosEmpleados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarEmpleado = async (empleadoActualizado) => {
      try {
        console.log('🔄 [Empleados] Actualizando empleado en API...');
      console.log('📤 [Empleados] ID del empleado a actualizar:', empleadoActualizado.id);
      console.log('📤 [Empleados] Datos completos del empleado:', empleadoActualizado);
      console.log('🆔 [Empleados] ID empleado para actualizar:', empleadoActualizado.id_empleado);
      // Preparar datos para enviar a la API según la documentación actualizada
      // La API permite editar cualquier combinación de campos del empleado y del usuario
      const datosParaEnviar = {
        // Campos del empleado
          id_usuario: empleadoActualizado.id_usuario,
          estado: empleadoActualizado.estado === 'activo'
      };

      // Agregar campos del usuario solo si tienen valores válidos (no "N/A")
      if (empleadoActualizado.nombre && empleadoActualizado.nombre !== 'N/A') {
        datosParaEnviar.nombre = empleadoActualizado.nombre;
      }
      if (empleadoActualizado.apellidos && empleadoActualizado.apellidos !== 'N/A') {
        datosParaEnviar.apellido = empleadoActualizado.apellidos;
      }
      if (empleadoActualizado.correo && empleadoActualizado.correo !== 'N/A') {
        datosParaEnviar.correo = empleadoActualizado.correo;
      }
      if (empleadoActualizado.tipoDocumento && empleadoActualizado.tipoDocumento !== 'N/A') {
        datosParaEnviar.tipo_documento = empleadoActualizado.tipoDocumento;
      }
      if (empleadoActualizado.documento && empleadoActualizado.documento !== 'N/A') {
        datosParaEnviar.documento = empleadoActualizado.documento;
      }
      if (empleadoActualizado.id_rol) {
        datosParaEnviar.id_rol = empleadoActualizado.id_rol;
      }
      if (empleadoActualizado.estado_usuario !== undefined) {
        datosParaEnviar.estado_usuario = empleadoActualizado.estado_usuario;
      }

      console.log('📤 [Empleados] Datos preparados para enviar:', datosParaEnviar);

      const response = await empleadosApiService.updateEmpleado(empleadoActualizado.id_empleado, datosParaEnviar);
        
        console.log('📥 [Empleados] Respuesta completa de actualización:', response);
        
        // La API devuelve información completa del empleado actualizado según la documentación
        if (response.success || response.id_empleado) {
          console.log('✅ [Empleados] Empleado actualizado en API');
          notificationService.updateSuccess('Empleado actualizado correctamente');
          await cargarEmpleados(); // Recargar datos
        } else {
          console.error('❌ [Empleados] Error al actualizar empleado en API:', response.message || response.error);
          notificationService.updateError('Error al actualizar empleado: ' + (response.message || response.error || 'Error desconocido'));
        }
      } catch (error) {
        console.error('💥 [Empleados] Error al actualizar empleado:', error);
      notificationService.updateError('Error al actualizar empleado: ' + error.message);
    }
    setMostrarEditar(false);
  };


  useEffect(() => {
    initializeMockData(); // Siempre inicializar datos mock como fallback
    cargarEmpleados();
  }, []); // Recargar al montar el componente

  const normalizarTexto = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const empleadosFiltrados = datosEmpleados.filter((empleado) =>
    normalizarTexto(
      `${empleado.nombre} ${empleado.apellidos} ${empleado.documento} ${empleado.rol}`
    ).includes(normalizarTexto(busqueda))
  );

  const totalPaginas = Math.ceil(
    empleadosFiltrados.length / empleadosPorPagina
  );
  const indiceInicio = (paginaActual - 1) * empleadosPorPagina;
  const indiceFin = indiceInicio + empleadosPorPagina;
  const empleadosPaginados = empleadosFiltrados.slice(indiceInicio, indiceFin);

  const handleVer = (empleado) => {
    console.log('👁️ [Empleados] Abriendo modal de ver empleado:', empleado);
    console.log('👁️ [Empleados] Estado del empleado:', empleado.estado);
    console.log('👁️ [Empleados] Datos completos:', {
      id: empleado.id,
      id_empleado: empleado.id_empleado,
      nombre: empleado.nombre,
      apellidos: empleado.apellidos,
      correo: empleado.correo,
      email: empleado.email,
      rol: empleado.rol,
      estado: empleado.estado
    });
    setEmpleadoViendo(empleado);
    setMostrarVer(true);
  };

  const handleToggleEstado = async (empleado) => {
    const nuevoEstado = empleado.estado?.toLowerCase() === "activo" ? "inactivo" : "activo";
    const nuevoEstadoBoolean = nuevoEstado === "activo";
    console.log("🔄 [Empleados] handleToggleEstado - Empleado:", empleado);
    console.log("🔄 [Empleados] Estado actual:", empleado.estado);
    console.log("🔄 [Empleados] Nuevo estado string:", nuevoEstado);
    console.log("🔄 [Empleados] Nuevo estado boolean:", nuevoEstadoBoolean);
    console.log("🔄 [Empleados] ID empleado:", empleado.id_empleado);
    
    Swal.fire({
      title: "¿Está seguro?",
      text: `¿Desea cambiar el estado de ${empleado.nombre} ${empleado.apellidos} a ${nuevoEstado}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar estado",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
          try {
            console.log('🔄 [Empleados] Cambiando estado en API...');
          console.log('📤 [Empleados] ID empleado:', empleado.id_empleado);
          console.log('📤 [Empleados] Nuevo estado boolean:', nuevoEstadoBoolean);
          
          const response = await empleadosApiService.changeEmpleadoEstado(empleado.id_empleado, nuevoEstadoBoolean);
          
          console.log('📥 [Empleados] Respuesta completa de cambio de estado:', response);
          
          // La API devuelve información completa del empleado y usuario actualizados según la documentación
          if (response.success || response.id_empleado) {
              console.log('✅ [Empleados] Estado cambiado en API');
              notificationService.updateSuccess('Estado del empleado actualizado correctamente');
            console.log('🔄 [Empleados] Recargando datos...');
              await cargarEmpleados(); // Recargar datos
            console.log('✅ [Empleados] Datos recargados');
            } else {
            console.error('❌ [Empleados] Error al cambiar estado en API:', response.message || response.error);
            notificationService.updateError('Error al cambiar estado: ' + (response.message || response.error || 'Error desconocido'));
            }
          } catch (error) {
            console.error('💥 [Empleados] Error al cambiar estado:', error);
          notificationService.updateError('Error al cambiar estado del empleado: ' + error.message);
        }
      }
    });
  };

  const handleEliminar = async (empleado) => {
    console.log("📤 [Empleados] ID del empleado a eliminar:", empleado.id_empleado);
    console.log("📤 [Empleados] Datos completos del empleado:", empleado);
    console.log("🔄 [Empleados] Iniciando modal de confirmación...");
    
    try {
      const result = await Swal.fire({
      title: "¿Está seguro?",
      text: `¿Desea eliminar a ${empleado.nombre} ${empleado.apellidos}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
      });
      
      console.log("📥 [Empleados] Resultado del modal:", result);
      
      if (result.isConfirmed) {
        console.log('🔄 [Empleados] Usuario confirmó eliminación');
          try {
            console.log('🔄 [Empleados] Eliminando empleado en API...');
          console.log('📤 [Empleados] ID empleado a eliminar:', empleado.id_empleado);
          
          const response = await empleadosApiService.deleteEmpleado(empleado.id_empleado);
          
          console.log('📥 [Empleados] Respuesta completa de eliminación:', response);
          
          // La API devuelve confirmación de eliminación completa (empleado y usuario asociado) según la documentación
          if (response.success || response.message || response.id_empleado_eliminado) {
            console.log('✅ [Empleados] Empleado y usuario asociado eliminados en API');
            notificationService.updateSuccess('Empleado y usuario asociado eliminados correctamente');
            console.log('🔄 [Empleados] Recargando datos...');
              await cargarEmpleados(); // Recargar datos
            console.log('✅ [Empleados] Datos recargados');
            } else {
            console.error('❌ [Empleados] Error al eliminar empleado en API:', response.message || response.error);
            notificationService.updateError('Error al eliminar empleado: ' + (response.message || response.error || 'Error desconocido'));
            }
          } catch (error) {
            console.error('💥 [Empleados] Error al eliminar empleado:', error);
          notificationService.updateError('Error al eliminar empleado: ' + error.message);
          }
        } else {
        console.log('❌ [Empleados] Usuario canceló la eliminación');
      }
    } catch (error) {
      console.error('💥 [Empleados] Error en el modal de confirmación:', error);
      notificationService.updateError('Error al mostrar modal de confirmación: ' + error.message);
    }
  };

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  // Si está cargando la autenticación, mostrar loading
  if (authLoading) {
    return (
      <div className="w-full max-w-8xl mx-auto px-4 bg-[#eceded] min-h-screen">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex mt-4 justify-center">
            <div className="w-full px-4">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Verificando autenticación...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar componente de verificación
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-8xl mx-auto px-4 bg-[#eceded] min-h-screen">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex mt-4 justify-center">
            <div className="w-full px-4">
              <VerificacionAuth message="Sesión expirada. Por favor, inicie sesión nuevamente." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto px-4 bg-[#eceded] min-h-screen">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex mt-4 justify-center">
          <div className="w-full px-4">
            {/* === Barra superior === */}
            <div className="flex items-center justify-between px-4 mb-4 w-full">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Buscar empleados..."
                  className="w-80 h-10 text-sm border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                />
                
                
                {loading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-xs">Cargando...</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <DescargarExcelEmpleados empleados={datosEmpleados} />
              </div>
            </div>
            {mostrarEditar && empleadoEditando && (
              <EditarEmpleadoModal
                showModal={mostrarEditar}
                setShowModal={setMostrarEditar}
                empleadoEditando={empleadoEditando}
                setEmpleadoEditando={setEmpleadoEditando}
                handleActualizarEmpleado={handleActualizarEmpleado}
              />
            )}
            {/* === Tabla de empleados === */}
            <TablaEmpleados
              empleados={empleadosPaginados}
              onVer={handleVer}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
              onToggleEstado={handleToggleEstado}
              deshabilitarAcciones={mostrarEditar || mostrarVer}
            />
            <ProfileModal
              user={empleadoViendo}
              isOpen={mostrarVer}
              onClose={() => setMostrarVer(false)}
              onEdit={(empleado) => {
                setEmpleadoEditando(empleado);
                setMostrarEditar(true);
                setMostrarVer(false);
              }}
            />

            {/* === Paginación === */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando {" "}
                <span className="font-medium">{empleadosFiltrados.length === 0 ? 0 : indiceInicio + 1}</span>{" "}
                a {" "}
                <span className="font-medium">{Math.min(indiceFin, empleadosFiltrados.length)}</span>{" "}
                de {" "}
                <span className="font-medium">{empleadosFiltrados.length}</span>{" "}
                resultados
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => irAPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
                >
                  <i className="bi bi-chevron-left text-base"></i>
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => irAPagina(pagina)}
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
                  onClick={() => irAPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
                >
                  <i className="bi bi-chevron-right text-base"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empleados;
