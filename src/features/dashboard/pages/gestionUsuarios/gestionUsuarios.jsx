import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import TablaUsuarios from "./components/tablaUsuarios";
import FormularioUsuario from "./components/FormularioUsuario";
import ProfileModal from "../../../../shared/components/ProfileModal";
import userApiService from "../../../auth/services/userApiService.js";
import rolesApiService from "../gestionRoles/services/rolesApiService.js";
import { validarUsuario } from "./services/validarUsuario";
import notificationService from "../../../../shared/services/NotificationService.js";
import { usePermiso } from "../../../../shared/hooks/usePermiso.js";
import { useAuth } from "../../../../shared/contexts/authContext.jsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CAMPOS_REQUERIDOS = [
  "firstName", "lastName", "documentType", "documentNumber", "email", "password", "role"
];

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    documentType: "",
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "usuario"
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [indiceEditar, setIndiceEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]); // Estado para almacenar todos los roles
  const usuariosPorPagina = 5;
  const { user: currentUser, updateUser: updateCurrentUser } = useAuth();
  
  // Verificar permisos del usuario actual
  const puedeCrear = usePermiso('gestion_usuarios', 'crear');
  const puedeEditar = usePermiso('gestion_usuarios', 'editar');
  const puedeEliminar = usePermiso('gestion_usuarios', 'eliminar');
  
  // Cargar roles desde la API al inicio
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        console.log('📤 [GestionUsuarios] Cargando roles desde la API...');
        const rolesData = await rolesApiService.getAllRoles();
        console.log('✅ [GestionUsuarios] Roles cargados:', rolesData);
        setRoles(rolesData || []);
      } catch (error) {
        console.error('❌ [GestionUsuarios] Error cargando roles:', error);
        // Continuar sin roles, las funciones de mapeo usarán fallback
      }
    };
    
    cargarRoles();
  }, []);

  // Función para cargar usuarios desde la API
  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [GestionUsuarios] Cargando usuarios desde la API...');
      const result = await userApiService.getAllUsers();
      
      if (result.success) {
        console.log('✅ [GestionUsuarios] Usuarios cargados exitosamente:', result.users);
        // Mapear datos de la API al formato del frontend
        const usuariosMapeados = result.users.map(usuario => {
          // Buscar el rol real desde la lista de roles cargados
          const rolEncontrado = roles.find(r => r.id === usuario.id_rol);
          const nombreRol = rolEncontrado 
            ? rolEncontrado.nombre?.toLowerCase() || obtenerNombreRol(usuario.id_rol)
            : obtenerNombreRol(usuario.id_rol);
          
          return {
            id: usuario.id_usuario,
            documentType: usuario.tipo_documento,
            documentNumber: usuario.documento,
            firstName: usuario.nombre,
            lastName: usuario.apellido,
            email: usuario.correo,
            role: nombreRol,
            estado: usuario.estado !== undefined ? Boolean(usuario.estado) : true,
            fechaCreacion: usuario.createdAt || usuario.fecha_creacion
          };
        });
        setUsuarios(usuariosMapeados);
      } else {
        console.error('❌ [GestionUsuarios] Error al cargar usuarios:', result.message);
        setError(result.message);
        // Mostrar error al usuario
        await Swal.fire({
          icon: 'error',
          title: 'Error al cargar usuarios',
          text: result.message,
          confirmButtonText: 'Reintentar',
          showCancelButton: true,
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            cargarUsuarios();
          }
        });
      }
    } catch (error) {
      console.error('💥 [GestionUsuarios] Error general al cargar usuarios:', error);
      setError('Error de conexión con el servidor');
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        confirmButtonText: 'Reintentar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          cargarUsuarios();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar usuarios cuando los roles estén disponibles
    // Esto asegura que los nombres de roles se mapeen correctamente
    cargarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles]); // Recargar usuarios cuando los roles cambien

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    console.log("🔄 [GestionUsuarios] Guardando usuario:", nuevoUsuario);
    console.log("🔄 [GestionUsuarios] Modo edición:", modoEdicion);
    console.log("🔄 [GestionUsuarios] Usuario seleccionado:", usuarioSeleccionado);
    
    const esValido = validarUsuario(nuevoUsuario);
    if (!esValido) return;
    
    setLoading(true);
    
    try {
      if (modoEdicion && usuarioSeleccionado) {
        console.log("🔄 [GestionUsuarios] Actualizando usuario:", usuarioSeleccionado.id);
        
        // Mapear datos del frontend al formato de la API
        const roleId = obtenerIdRol(nuevoUsuario.role);
        console.log('🔄 [GestionUsuarios] Rol seleccionado:', nuevoUsuario.role, '→ RoleId:', roleId);
        
        const datosActualizacion = {
          nombre: nuevoUsuario.firstName,
          apellido: nuevoUsuario.lastName,
          email: nuevoUsuario.email,
          tipoDocumento: nuevoUsuario.documentType,
          documento: nuevoUsuario.documentNumber,
          roleId: roleId,
          estado: usuarioSeleccionado.estado // Mantener el estado actual
        };
        
        console.log('🔄 [GestionUsuarios] Datos completos de actualización:', JSON.stringify(datosActualizacion, null, 2));
        
        const result = await userApiService.updateUser(usuarioSeleccionado.id, datosActualizacion);
        
        if (result.success) {
          console.log("✅ [GestionUsuarios] Usuario actualizado exitosamente");
          
          // Si el usuario editado es el mismo que está logueado, actualizar su información
          const usuarioActualizado = result.user;
          if (currentUser && usuarioActualizado) {
            const currentUserId = currentUser.id_usuario || currentUser.id;
            const editedUserId = usuarioSeleccionado.id || usuarioActualizado.id_usuario || usuarioActualizado.id;
            
            console.log('🔍 [GestionUsuarios] Verificando si es el usuario actual:', {
              currentUserId,
              editedUserId,
              esElMismo: currentUserId == editedUserId || currentUser.email === usuarioActualizado.email
            });
            
            if (currentUserId == editedUserId || currentUser.email === usuarioActualizado.email) {
              console.log('🔄 [GestionUsuarios] Es el usuario actual, obteniendo información completa del usuario actualizado');
              
              // Obtener el usuario completo con rol y permisos desde la API
              try {
                const userResult = await userApiService.getUserById(editedUserId);
                if (userResult.success && userResult.user) {
                  const usuarioCompleto = userResult.user;
                  console.log('✅ [GestionUsuarios] Usuario completo obtenido:', usuarioCompleto);
                  console.log('✅ [GestionUsuarios] Rol del usuario:', usuarioCompleto.rol);
                  
                  // Si el backend devuelve el rol completo con permisos, usarlo
                  if (usuarioCompleto.rol && typeof usuarioCompleto.rol === 'object') {
                    // Actualizar en el contexto
                    await updateCurrentUser(usuarioCompleto);
                    
                    // También actualizar en localStorage directamente
                    localStorage.setItem('currentUser', JSON.stringify(usuarioCompleto));
                    localStorage.setItem('user', JSON.stringify(usuarioCompleto));
                    localStorage.setItem('userData', JSON.stringify(usuarioCompleto));
                    
                    console.log('✅ [GestionUsuarios] Usuario actual actualizado con rol completo en contexto y localStorage');
                  } else {
                    // Si no viene el rol completo, combinar con la información actual
                    const usuarioParaActualizar = {
                      ...currentUser,
                      ...usuarioActualizado,
                      ...usuarioCompleto,
                      // Preservar el rol completo si viene en la respuesta
                      rol: usuarioCompleto.rol || usuarioActualizado.rol || currentUser.rol,
                      // Actualizar el roleId si viene
                      id_rol: usuarioCompleto.id_rol || usuarioActualizado.id_rol || datosActualizacion.roleId || currentUser.id_rol
                    };
                    
                    // Actualizar en el contexto
                    await updateCurrentUser(usuarioParaActualizar);
                    
                    // También actualizar en localStorage directamente
                    localStorage.setItem('currentUser', JSON.stringify(usuarioParaActualizar));
                    localStorage.setItem('user', JSON.stringify(usuarioParaActualizar));
                    localStorage.setItem('userData', JSON.stringify(usuarioParaActualizar));
                    
                    console.log('⚠️ [GestionUsuarios] Usuario actual actualizado, pero el rol completo no está disponible');
                  }
                } else {
                  console.warn('⚠️ [GestionUsuarios] No se pudo obtener el usuario completo, usando información parcial');
                  // Fallback: actualizar con la información que tenemos
                  const usuarioParaActualizar = {
                    ...currentUser,
                    ...usuarioActualizado,
                    // Actualizar el roleId
                    id_rol: usuarioActualizado.id_rol || datosActualizacion.roleId || currentUser.id_rol
                  };
                  
                  // Actualizar en el contexto
                  await updateCurrentUser(usuarioParaActualizar);
                  
                  // También actualizar en localStorage directamente
                  localStorage.setItem('currentUser', JSON.stringify(usuarioParaActualizar));
                  localStorage.setItem('user', JSON.stringify(usuarioParaActualizar));
                  localStorage.setItem('userData', JSON.stringify(usuarioParaActualizar));
                }
              } catch (error) {
                console.error('❌ [GestionUsuarios] Error al obtener usuario completo:', error);
                // Fallback: actualizar con la información que tenemos
                const usuarioParaActualizar = {
                  ...currentUser,
                  ...usuarioActualizado,
                  // Actualizar el roleId
                  id_rol: usuarioActualizado.id_rol || datosActualizacion.roleId || currentUser.id_rol
                };
                
                // Actualizar en el contexto
                await updateCurrentUser(usuarioParaActualizar);
                
                // También actualizar en localStorage directamente
                localStorage.setItem('currentUser', JSON.stringify(usuarioParaActualizar));
                localStorage.setItem('user', JSON.stringify(usuarioParaActualizar));
                localStorage.setItem('userData', JSON.stringify(usuarioParaActualizar));
              }
            }
          }
          
          await cargarUsuarios(); // Recargar la lista
          console.log("🔄 [GestionUsuarios] Usuarios recargados después de la actualización");
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El usuario ha sido actualizado correctamente.',
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
          console.error("❌ [GestionUsuarios] Error al actualizar usuario:", result.message);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message || 'No se pudo actualizar el usuario.',
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
          return;
      }
    } else {
        console.log("🔄 [GestionUsuarios] Creando nuevo usuario");
        
        // Obtener el ID del rol
        const roleId = obtenerIdRol(nuevoUsuario.role);
        console.log('🔍 [GestionUsuarios] Rol seleccionado:', nuevoUsuario.role);
        console.log('🔍 [GestionUsuarios] RoleId obtenido:', roleId);
        console.log('🔍 [GestionUsuarios] Roles disponibles:', roles);
        
        // Validar que el roleId sea válido
        if (!roleId || roleId === null || roleId === undefined) {
          console.error('❌ [GestionUsuarios] RoleId inválido:', roleId);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `El rol "${nuevoUsuario.role}" no es válido. Por favor, selecciona un rol válido.`,
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
          setLoading(false);
          return;
        }
        
        // Mapear datos del frontend al formato de la API
        const datosCreacion = {
          nombre: nuevoUsuario.firstName,
          apellido: nuevoUsuario.lastName,
          email: nuevoUsuario.email,
          password: nuevoUsuario.password,
          tipoDocumento: nuevoUsuario.documentType,
          documento: nuevoUsuario.documentNumber,
          roleId: Number(roleId) // Asegurar que sea un número
        };
        
        console.log('📤 [GestionUsuarios] Datos de creación:', datosCreacion);
        
        const result = await userApiService.createUser(datosCreacion);
        
        if (result.success) {
          console.log("✅ [GestionUsuarios] Usuario creado exitosamente");
          await cargarUsuarios(); // Recargar la lista
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El usuario ha sido creado correctamente.',
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
          console.error("❌ [GestionUsuarios] Error al crear usuario:", result.message);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message || 'No se pudo crear el usuario.',
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
          return;
        }
      }
      
      // Limpiar formulario y cerrar modal
    setModoEdicion(false);
    setUsuarioSeleccionado(null);
    setIndiceEditar(null);
    setMostrarModal(false);
    setNuevoUsuario({
      documentType: "",
      documentNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "usuario"
    });
      
    } catch (error) {
      console.error("💥 [GestionUsuarios] Error general al guardar usuario:", error);
      const errorMessage = modoEdicion ? 'Error al actualizar usuario' : 'Error al crear usuario';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage + '.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener el ID del rol
  // Busca el rol en la lista de roles cargados desde la API
  const obtenerIdRol = (nombreRol) => {
    if (!nombreRol) {
      console.warn('⚠️ [GestionUsuarios] obtenerIdRol: nombreRol es vacío o null');
      return null;
    }
    
    // Normalizar el nombre del rol
    const nombreNormalizado = nombreRol.toLowerCase().trim();
    console.log('🔍 [GestionUsuarios] Buscando rol:', nombreNormalizado);
    console.log('🔍 [GestionUsuarios] Roles disponibles:', roles.map(r => ({ id: r.id, nombre: r.nombre })));
    
    // Buscar el rol en la lista de roles cargados
    const rolEncontrado = roles.find(r => {
      const nombreRolLower = r.nombre?.toLowerCase().trim() || '';
      return nombreRolLower === nombreNormalizado;
    });
    
    if (rolEncontrado && rolEncontrado.id) {
      console.log('✅ [GestionUsuarios] Rol encontrado:', { id: rolEncontrado.id, nombre: rolEncontrado.nombre });
      // Asegurar que el ID sea un número
      return Number(rolEncontrado.id);
    }
    
    // Fallback: mapeo hardcodeado para compatibilidad (solo si no se encontró en la lista)
    console.warn(`⚠️ [GestionUsuarios] Rol "${nombreRol}" no encontrado en la lista, usando fallback`);
    const rolesMap = {
      'administrador': 2,
      'empleado': 3,
      'cliente': 1,
      'usuario': 1,
      'admin': 2,
      'employee': 3,
      'customer': 1
    };
    const fallbackId = rolesMap[nombreNormalizado];
    if (fallbackId) {
      console.log('✅ [GestionUsuarios] Usando fallback ID:', fallbackId);
      return fallbackId;
    }
    
    console.error('❌ [GestionUsuarios] No se pudo encontrar el ID del rol:', nombreRol);
    return null;
  };

  // Función auxiliar para obtener el nombre del rol desde el ID
  // Busca el rol en la lista de roles cargados desde la API
  const obtenerNombreRol = (idRol) => {
    if (!idRol) return 'cliente';
    
    // Buscar el rol en la lista de roles cargados
    const rolEncontrado = roles.find(r => r.id === idRol || r.id === String(idRol) || r.id === Number(idRol));
    
    if (rolEncontrado && rolEncontrado.nombre) {
      return rolEncontrado.nombre.toLowerCase().trim();
    }
    
    // Fallback: mapeo hardcodeado para compatibilidad (solo si no se encontró en la lista)
    console.warn(`⚠️ [GestionUsuarios] Rol con ID "${idRol}" no encontrado en la lista, usando fallback`);
    const rolesMap = {
      1: 'cliente',
      2: 'administrador',
      3: 'empleado'
    };
    return rolesMap[idRol] || rolesMap[Number(idRol)] || 'cliente';
  };

  const handleToggleEstado = async (usuario) => {
    // Manejar tanto boolean como string para el estado
    const estadoActual = typeof usuario.estado === 'boolean' ? usuario.estado : usuario.estado?.toLowerCase() === "activo";
    const nuevoEstado = !estadoActual;
    const nuevoEstadoTexto = nuevoEstado ? "activo" : "inactivo";
    console.log("🔄 [GestionUsuarios] Intentando cambiar estado para usuario:", usuario.id, "a", nuevoEstadoTexto);
    
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas cambiar el estado de ${usuario.firstName} ${usuario.lastName} a ${nuevoEstadoTexto}?`,
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
    });
    
      if (result.isConfirmed) {
      setLoading(true);
      try {
        // Mapear datos para la actualización
        const datosActualizacion = {
          nombre: usuario.firstName,
          apellido: usuario.lastName,
          email: usuario.email,
          tipoDocumento: usuario.documentType,
          documento: usuario.documentNumber,
          roleId: obtenerIdRol(usuario.role),
          estado: nuevoEstado
        };
        
        const updateResult = await userApiService.updateUser(usuario.id, datosActualizacion);
        
        if (updateResult.success) {
          console.log("✅ [GestionUsuarios] Estado del usuario actualizado exitosamente");
          console.log("🔄 [GestionUsuarios] Recargando usuarios después del cambio de estado...");
          await cargarUsuarios(); // Recargar la lista
          console.log("✅ [GestionUsuarios] Usuarios recargados después del cambio de estado");
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: `El estado del usuario ha sido cambiado a ${nuevoEstadoTexto}.`,
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
          console.error("❌ [GestionUsuarios] Error al actualizar estado:", updateResult.message);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: updateResult.message || "No se pudo actualizar el estado del usuario.",
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
      } catch (error) {
        console.error("💥 [GestionUsuarios] Error general al cambiar estado:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "No se pudo actualizar el estado del usuario.",
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
          }
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (usuario) => {
    console.log("🔄 [GestionUsuarios] Usuario a eliminar:", usuario);
    
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Estás seguro de que deseas eliminar a ${usuario.firstName} ${usuario.lastName}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-2xl shadow-2xl border-t-4 border-t-yellow-500',
        title: 'text-gray-800 font-bold text-2xl mb-4',
        content: 'text-gray-600 text-base mb-6',
        confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white',
        cancelButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#6b7280] hover:bg-[#4b5563] border border-[#6b7280] text-white'
      }
    });
      if (result.isConfirmed) {
      setLoading(true);
      try {
        console.log("🔄 [GestionUsuarios] Confirmado, eliminando usuario:", usuario.id);
        const deleteResult = await userApiService.deleteUser(usuario.id);
        
        if (deleteResult.success) {
          console.log("✅ [GestionUsuarios] Usuario eliminado exitosamente");
          await cargarUsuarios(); // Recargar la lista
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El usuario ha sido eliminado correctamente.',
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
          console.error("❌ [GestionUsuarios] Error al eliminar usuario:", deleteResult.message);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: deleteResult.message || 'No se pudo eliminar el usuario.',
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
      } catch (error) {
        console.error("💥 [GestionUsuarios] Error general al eliminar usuario:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar usuario.',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
          }
        });
      } finally {
        setLoading(false);
      }
    }
  };

  function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const nombreCompleto = `${u.firstName} ${u.lastName}`;
    const texto = `${u.documentType} ${u.documentNumber} ${nombreCompleto} ${u.email} ${u.role}`;
    return normalizarTexto(texto).includes(normalizarTexto(busqueda));
  });

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const indiceFin = indiceInicio + usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(indiceInicio, indiceFin);

  const irAPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) setPaginaActual(num);
  };

  const handleVer = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalVer(true);
  };

  const handleEditar = (usuario, idx) => {
    // Encontrar el índice real del usuario en el array completo de usuarios
    const indiceReal = usuarios.findIndex(u => 
      u.documentNumber === usuario.documentNumber && 
      u.email === usuario.email
    );
    
    console.log("Editando usuario:", usuario);
    console.log("Índice real encontrado:", indiceReal);
    
    setNuevoUsuario(usuario);
    setModoEdicion(true);
    setUsuarioSeleccionado(usuario);
    setIndiceEditar(indiceReal);
    setMostrarModal(true);
  };

  const handleAbrirCrear = () => {
    setNuevoUsuario({
      documentType: "",
      documentNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "usuario"
    });
    setModoEdicion(false);
    setUsuarioSeleccionado(null);
    setIndiceEditar(null);
    setMostrarModal(true);
  };

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full px-4">
        <div className="flex items-center justify-between px-4 mb-4 w-full">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, tipo de documento, número de documento, email, rol..."
            className="form-control w-50 h-9 text-sm border border-gray-300 rounded-md px-3"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />

          <div className="flex gap-3">
            {puedeCrear && (
              <button 
                className="btn btn-primary px-4 py-2 text-sm rounded-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleAbrirCrear}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                <i className="bi bi-plus-square"></i> Crear Usuario
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Cargando usuarios...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-red-600 mb-2">
                <i className="bi bi-exclamation-triangle text-2xl"></i>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={cargarUsuarios}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
        <TablaUsuarios
          usuarios={usuariosPagina}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          handleDelete={handleDelete}
          onVer={handleVer}
          onEditar={handleEditar}
          onToggleEstado={handleToggleEstado}
            deshabilitarAcciones={mostrarModal || mostrarModalVer || loading}
          mostrarBusqueda={false}
          mostrarPaginacion={false}
        />
        )}

        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{usuariosFiltrados.length === 0 ? 0 : indiceInicio + 1}</span> a
            <span className="font-medium"> {Math.min(indiceFin, usuariosFiltrados.length)}</span> de
            <span className="font-medium"> {usuariosFiltrados.length}</span> resultados
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

        {mostrarModal && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50">
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">{modoEdicion ? "Editar Usuario" : "Agregar Nuevo Usuario"}</h2>
              <FormularioUsuario
                nuevoUsuario={nuevoUsuario}
                handleInputChange={handleInputChange}
                handleGuardarUsuario={handleGuardarUsuario}
                modoEdicion={modoEdicion}
                usuarioEditar={usuarioSeleccionado}
                onClose={() => setMostrarModal(false)}
              />
              <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarUsuario}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      {modoEdicion ? "Guardando..." : "Registrando..."}
                    </>
                  ) : (
                    modoEdicion ? "Guardar Cambios" : "Registrar Usuario"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <ProfileModal
          user={usuarioSeleccionado}
          isOpen={mostrarModalVer}
          onClose={() => setMostrarModalVer(false)}
          onEdit={handleEditar}
        />
      </div>
    </div>
  );
};

export default GestionUsuarios;
