import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import TablaUsuarios from "./components/tablaUsuarios";
import FormularioUsuario from "./components/FormularioUsuario";
import ProfileModal from "../../../../shared/components/ProfileModal";
import userApiService from "../../../auth/services/userApiService.js";
import { validarUsuario } from "./services/validarUsuario";
import { useNotification } from "../../../../shared/contexts/NotificationContext.jsx";
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
  const usuariosPorPagina = 5;
  const { deleteConfirm, deleteSuccess, deleteError, createSuccess, updateSuccess, createError, updateError } = useNotification();

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
        const usuariosMapeados = result.users.map(usuario => ({
          id: usuario.id_usuario,
          documentType: usuario.tipo_documento,
          documentNumber: usuario.documento,
          firstName: usuario.nombre,
          lastName: usuario.apellido,
          email: usuario.correo,
          role: obtenerNombreRol(usuario.id_rol),
          estado: usuario.estado !== undefined ? Boolean(usuario.estado) : true,
          fechaCreacion: usuario.createdAt || usuario.fecha_creacion
        }));
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
    cargarUsuarios();
  }, []);

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
          updateSuccess('usuario');
          await cargarUsuarios(); // Recargar la lista
          console.log("🔄 [GestionUsuarios] Usuarios recargados después de la actualización");
        } else {
          console.error("❌ [GestionUsuarios] Error al actualizar usuario:", result.message);
          updateError(result.message);
          return;
      }
    } else {
        console.log("🔄 [GestionUsuarios] Creando nuevo usuario");
        
        // Mapear datos del frontend al formato de la API
        const datosCreacion = {
          nombre: nuevoUsuario.firstName,
          apellido: nuevoUsuario.lastName,
          email: nuevoUsuario.email,
          password: nuevoUsuario.password,
          tipoDocumento: nuevoUsuario.documentType,
          documento: nuevoUsuario.documentNumber,
          roleId: obtenerIdRol(nuevoUsuario.role)
        };
        
        const result = await userApiService.createUser(datosCreacion);
        
        if (result.success) {
          console.log("✅ [GestionUsuarios] Usuario creado exitosamente");
          createSuccess('usuario');
          await cargarUsuarios(); // Recargar la lista
        } else {
          console.error("❌ [GestionUsuarios] Error al crear usuario:", result.message);
          createError(result.message);
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
      if (modoEdicion) {
        updateError(errorMessage);
      } else {
        createError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener el ID del rol
  // ⚠️ IMPORTANTE: El backend tiene mapeo diferente:
  // Backend: 1=cliente, 2=administrador, 3=empleado
  const obtenerIdRol = (nombreRol) => {
    const rolesMap = {
      'administrador': 2,  // Backend usa id_rol=2 para admin
      'empleado': 3,        // Backend usa id_rol=3 para empleado
      'cliente': 1,         // Backend usa id_rol=1 para cliente
      'usuario': 1,         // Por defecto cliente
      'admin': 2,
      'employee': 3,
      'customer': 1
    };
    return rolesMap[nombreRol?.toLowerCase()] || 1;
  };

  // Función auxiliar para obtener el nombre del rol desde el ID
  // ⚠️ IMPORTANTE: El backend tiene mapeo diferente:
  // Backend: 1=cliente, 2=administrador, 3=empleado
  const obtenerNombreRol = (idRol) => {
    const rolesMap = {
      1: 'cliente',          // Backend: id_rol=1 es cliente
      2: 'administrador',    // Backend: id_rol=2 es administrador
      3: 'empleado'          // Backend: id_rol=3 es empleado
    };
    return rolesMap[idRol] || 'cliente';
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
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar estado",
      cancelButtonText: "Cancelar"
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
          Swal.fire("¡Éxito!", `El estado del usuario ha sido cambiado a ${nuevoEstadoTexto}.`, "success");
        } else {
          console.error("❌ [GestionUsuarios] Error al actualizar estado:", updateResult.message);
          Swal.fire("Error", updateResult.message || "No se pudo actualizar el estado del usuario.", "error");
        }
      } catch (error) {
        console.error("💥 [GestionUsuarios] Error general al cambiar estado:", error);
        Swal.fire("Error", "No se pudo actualizar el estado del usuario.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (usuario) => {
    console.log("🔄 [GestionUsuarios] Usuario a eliminar:", usuario);
    
    const result = await deleteConfirm('usuario');
      if (result.isConfirmed) {
      setLoading(true);
      try {
        console.log("🔄 [GestionUsuarios] Confirmado, eliminando usuario:", usuario.id);
        const deleteResult = await userApiService.deleteUser(usuario.id);
        
        if (deleteResult.success) {
          console.log("✅ [GestionUsuarios] Usuario eliminado exitosamente");
          deleteSuccess('usuario');
          await cargarUsuarios(); // Recargar la lista
        } else {
          console.error("❌ [GestionUsuarios] Error al eliminar usuario:", deleteResult.message);
          deleteError(deleteResult.message);
        }
      } catch (error) {
        console.error("💥 [GestionUsuarios] Error general al eliminar usuario:", error);
        deleteError('Error al eliminar usuario');
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
            placeholder="Buscar"
            className="form-control w-50 h-9 text-sm border border-gray-300 rounded-md px-3"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />

          <div className="flex gap-3">
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
