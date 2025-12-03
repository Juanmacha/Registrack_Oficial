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
  const [loading, setLoading] = useState(true);
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Formato de respuesta inesperado de la API.',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
          }
        });
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
    } catch (error) {
      console.error('💥 [Empleados] Error al cargar empleados:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar empleados: ' + error.message,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
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
          await cargarEmpleados(); // Recargar datos
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El empleado ha sido actualizado correctamente.',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
              title: 'text-gray-800 font-bold text-2xl mb-4',
              content: 'text-gray-600 text-base mb-6',
              confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
            }
          });
        } else {
          console.error('❌ [Empleados] Error al actualizar empleado en API:', response.message || response.error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar empleado: ' + (response.message || response.error || 'Error desconocido'),
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
              title: 'text-gray-800 font-bold text-2xl mb-4',
              content: 'text-gray-600 text-base mb-6',
              confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
            }
          });
        }
      } catch (error) {
        console.error('💥 [Empleados] Error al actualizar empleado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al actualizar empleado: ' + error.message,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
          }
        });
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
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cambiar estado",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-2xl shadow-2xl border-t-4 border-t-yellow-500',
        title: 'text-gray-800 font-bold text-2xl mb-4',
        content: 'text-gray-600 text-base mb-6',
        confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white',
        cancelButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#6b7280] hover:bg-[#4b5563] border border-[#6b7280] text-white'
      }
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
            console.log('🔄 [Empleados] Recargando datos...');
              await cargarEmpleados(); // Recargar datos
            console.log('✅ [Empleados] Datos recargados');
              
              Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Estado del empleado actualizado correctamente.',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#10b981',
                customClass: {
                  popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
                  title: 'text-gray-800 font-bold text-2xl mb-4',
                  content: 'text-gray-600 text-base mb-6',
                  confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
                }
              });
            } else {
            // Si no es exitoso, lanzar error para que se maneje en el catch
            const error = new Error(response.message || response.error || 'Error desconocido');
            error.data = response;
            throw error;
            }
          } catch (error) {
            console.error('💥 [Empleados] Error al cambiar estado:', error);
            
            // Extraer mensaje de error más descriptivo
            let errorMessage = 'No se puede desactivar el empleado';
            let errorDetails = '';
            
            // El error puede venir en diferentes estructuras
            if (error.message && error.message !== 'Error al cambiar estado del empleado') {
              errorMessage = error.message;
            } else if (error.data?.message) {
              errorMessage = error.data.message;
            } else if (error.data?.error?.message) {
              errorMessage = error.data.error.message;
            }
            
            // Si hay detalles adicionales, extraerlos
            if (error.data?.detalles) {
              errorDetails = error.data.detalles;
            } else if (error.data?.error?.detalles) {
              errorDetails = error.data.error.detalles;
            }
            
            // Detectar si es un error de asignaciones activas (por código, tipo o mensaje)
            const tieneAsignaciones = error.data?.codigo === 'EMPLEADO_CON_ASIGNACIONES' ||
                                     error.data?.error?.codigo === 'EMPLEADO_CON_ASIGNACIONES' ||
                                     errorMessage.toLowerCase().includes('asignada') || 
                                     errorMessage.toLowerCase().includes('cita') || 
                                     errorMessage.toLowerCase().includes('solicitud') ||
                                     errorMessage.toLowerCase().includes('asignaciones activas') ||
                                     errorMessage.toLowerCase().includes('no se puede desactivar');
            
            if (tieneAsignaciones) {
              // Obtener información adicional del error
              const tipoAsignacion = error.data?.tipo || error.data?.error?.tipo || '';
              const cantidad = error.data?.cantidad_asignaciones || error.data?.error?.cantidad_asignaciones || '';
              
              // Construir mensaje más específico según el tipo
              let tituloAlerta = 'No se puede desactivar el empleado';
              let accionesEspecificas = '';
              
              if (tipoAsignacion === 'citas_activas' || errorMessage.toLowerCase().includes('cita')) {
                tituloAlerta = 'No se puede desactivar el empleado con citas asignadas';
                accionesEspecificas = `
                  <li><strong>Citas activas (${cantidad || 'varias'})</strong>: Reprograme las citas asignándolas a otro empleado o cancele las citas primero</li>
                `;
              } else if (tipoAsignacion === 'solicitudes_activas' || errorMessage.toLowerCase().includes('solicitud')) {
                tituloAlerta = 'No se puede desactivar el empleado con solicitudes asignadas';
                accionesEspecificas = `
                  <li><strong>Solicitudes activas (${cantidad || 'varias'})</strong>: Reasigne las solicitudes a otro empleado o finalice/anule las solicitudes primero</li>
                `;
              } else {
                accionesEspecificas = `
                  <li>Si tiene <strong>citas activas</strong>: Reprograme o cancele las citas primero</li>
                  <li>Si tiene <strong>solicitudes activas</strong>: Reasigne las solicitudes a otro empleado o finalice/anule primero</li>
                `;
              }
              
              // Mostrar alerta detallada con información sobre las asignaciones
              Swal.fire({
                icon: 'error',
                title: tituloAlerta,
                html: `
                  <div style="text-align: left; max-width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                    <div>
                      <p style="margin-bottom: 4px; line-height: 1.3; font-size: 14px;"><strong>${errorMessage}</strong></p>
                      ${errorDetails ? `<p style="margin-bottom: 4px; color: #666; line-height: 1.3; font-size: 13px;">${errorDetails}</p>` : ''}
                      <p style="margin-top: 8px; color: #666; line-height: 1.3; font-size: 13px;">Debe resolver todas las asignaciones activas antes de desactivar el empleado.</p>
                    </div>
                    <div>
                      <p style="margin-bottom: 6px; font-weight: 600; font-size: 14px;"><strong>Acciones requeridas:</strong></p>
                      <ul style="margin-left: 16px; margin-bottom: 0; line-height: 1.4; font-size: 13px; padding: 0;">
                        ${accionesEspecificas}
                      </ul>
                    </div>
                  </div>
                `,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#ef4444',
                width: '1200px',
                padding: '1.25rem',
                customClass: {
                  popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
                  title: 'text-gray-800 font-bold text-lg mb-2',
                  htmlContainer: 'text-gray-600 text-base mb-3 max-h-[40vh] overflow-y-auto',
                  confirmButton: 'rounded-xl px-6 py-2 font-semibold text-sm bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white',
                  icon: 'swal2-error-icon'
                }
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#ef4444',
                customClass: {
                  popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
                  title: 'text-gray-800 font-bold text-2xl mb-4',
                  content: 'text-gray-600 text-base mb-6',
                  confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white',
                  icon: 'swal2-error-icon'
                }
              });
            }
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
          
          Swal.fire({
            title: "",
            html: "",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
              // Ocultar todos los elementos excepto el loader
              setTimeout(() => {
                const popup = document.querySelector('.swal2-loading-popup');
                if (popup) {
                  // Ocultar título
                  const titleElement = popup.querySelector('.swal2-title');
                  if (titleElement) titleElement.style.display = 'none';
                  
                  // Ocultar contenido
                  const contentElements = popup.querySelectorAll('.swal2-content, .swal2-html-container, .swal2-text, .swal2-icon-container');
                  contentElements.forEach(el => el.style.display = 'none');
                  
                  // Ocultar acciones
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
          
          const response = await empleadosApiService.deleteEmpleado(empleado.id_empleado);
          
          console.log('📥 [Empleados] Respuesta completa de eliminación:', response);
          
          Swal.close();
          
          // La API devuelve confirmación de eliminación completa (empleado y usuario asociado) según la documentación
          if (response.success || response.message || response.id_empleado_eliminado) {
            console.log('✅ [Empleados] Empleado y usuario asociado eliminados en API');
            console.log('🔄 [Empleados] Recargando datos...');
              await cargarEmpleados(); // Recargar datos
            console.log('✅ [Empleados] Datos recargados');
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Empleado y usuario asociado eliminados correctamente.',
              confirmButtonText: 'Cerrar',
              confirmButtonColor: '#10b981',
              customClass: {
                popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
                title: 'text-gray-800 font-bold text-2xl mb-4',
                content: 'text-gray-600 text-base mb-6',
                confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
              }
            });
            } else {
            // Si no es exitoso, lanzar error para que se maneje en el catch
            const error = new Error(response.message || response.error || 'Error desconocido');
            error.data = response;
            throw error;
            }
          } catch (error) {
            console.error('💥 [Empleados] Error al eliminar empleado:', error);
            Swal.close();
            
            // Extraer mensaje de error más descriptivo
            let errorMessage = 'No se puede eliminar el empleado';
            let errorDetails = '';
            
            // El error puede venir en diferentes estructuras
            if (error.message && error.message !== 'Error al eliminar empleado') {
              errorMessage = error.message;
            } else if (error.data?.message) {
              errorMessage = error.data.message;
            } else if (error.data?.error?.message) {
              errorMessage = error.data.error.message;
            }
            
            // Si hay detalles adicionales, extraerlos
            if (error.data?.detalles) {
              errorDetails = error.data.detalles;
            } else if (error.data?.error?.detalles) {
              errorDetails = error.data.error.detalles;
            }
            
            // Detectar si es un error de asignaciones activas (por código, tipo o mensaje)
            const tieneAsignaciones = error.data?.codigo === 'EMPLEADO_CON_ASIGNACIONES' ||
                                     error.data?.error?.codigo === 'EMPLEADO_CON_ASIGNACIONES' ||
                                     errorMessage.toLowerCase().includes('asignada') || 
                                     errorMessage.toLowerCase().includes('cita') || 
                                     errorMessage.toLowerCase().includes('solicitud') ||
                                     errorMessage.toLowerCase().includes('asignaciones activas') ||
                                     errorMessage.toLowerCase().includes('no se puede eliminar');
            
            if (tieneAsignaciones) {
              // Obtener información adicional del error
              const tipoAsignacion = error.data?.tipo || error.data?.error?.tipo || '';
              const cantidad = error.data?.cantidad_asignaciones || error.data?.error?.cantidad_asignaciones || '';
              
              // Construir mensaje más específico según el tipo
              let tituloAlerta = 'No se puede eliminar el empleado';
              let accionesEspecificas = '';
              
              if (tipoAsignacion === 'citas_activas' || errorMessage.toLowerCase().includes('cita')) {
                tituloAlerta = 'No se puede eliminar el empleado con citas asignadas';
                accionesEspecificas = `
                  <li><strong>Citas activas (${cantidad || 'varias'})</strong>: Reprograme las citas asignándolas a otro empleado o cancele las citas primero</li>
                `;
              } else if (tipoAsignacion === 'solicitudes_activas' || errorMessage.toLowerCase().includes('solicitud')) {
                tituloAlerta = 'No se puede eliminar el empleado con solicitudes asignadas';
                accionesEspecificas = `
                  <li><strong>Solicitudes activas (${cantidad || 'varias'})</strong>: Reasigne las solicitudes a otro empleado o finalice/anule las solicitudes primero</li>
                `;
              } else {
                accionesEspecificas = `
                  <li>Si tiene <strong>citas activas</strong>: Reprograme o cancele las citas primero</li>
                  <li>Si tiene <strong>solicitudes activas</strong>: Reasigne las solicitudes a otro empleado o finalice/anule primero</li>
                `;
              }
              
              // Mostrar alerta detallada con información sobre las asignaciones
              Swal.fire({
                icon: 'error',
                title: tituloAlerta,
                html: `
                  <div style="text-align: left; max-width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                    <div>
                      <p style="margin-bottom: 4px; line-height: 1.3; font-size: 14px;"><strong>${errorMessage}</strong></p>
                      ${errorDetails ? `<p style="margin-bottom: 4px; color: #666; line-height: 1.3; font-size: 13px;">${errorDetails}</p>` : ''}
                      <p style="margin-top: 8px; color: #666; line-height: 1.3; font-size: 13px;">Debe resolver todas las asignaciones activas antes de eliminar el empleado.</p>
                    </div>
                    <div>
                      <p style="margin-bottom: 6px; font-weight: 600; font-size: 14px;"><strong>Acciones requeridas:</strong></p>
                      <ul style="margin-left: 16px; margin-bottom: 0; line-height: 1.4; font-size: 13px; padding: 0;">
                        ${accionesEspecificas}
                      </ul>
                    </div>
                  </div>
                `,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#ef4444',
                width: '1200px',
                padding: '1.25rem',
                customClass: {
                  popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
                  title: 'text-gray-800 font-bold text-lg mb-2',
                  htmlContainer: 'text-gray-600 text-base mb-3 max-h-[40vh] overflow-y-auto',
                  confirmButton: 'rounded-xl px-6 py-2 font-semibold text-sm bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white',
                  icon: 'swal2-error-icon'
                }
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#ef4444',
                customClass: {
                  popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
                  title: 'text-gray-800 font-bold text-2xl mb-4',
                  content: 'text-gray-600 text-base mb-6',
                  confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white',
                  icon: 'swal2-error-icon'
                }
              });
            }
          }
        } else {
        console.log('❌ [Empleados] Usuario canceló la eliminación');
      }
    } catch (error) {
      console.error('💥 [Empleados] Error en el modal de confirmación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al mostrar modal de confirmación: ' + error.message,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
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

  // Mostrar loading mientras se cargan los empleados
  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empleados...</p>
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
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, documento, rol..."
                className="form-control w-50 h-9 text-sm border border-gray-300 rounded-md px-3"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
              />

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
