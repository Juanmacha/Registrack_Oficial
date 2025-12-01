// pages/gestionRoles/index.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import TablaRoles from "./components/tablaRoles";
import CrearRolModal from "./components/crearRol";
import EditarRolModal from "./components/editarRol";
import DetalleRolModal from "./components/verRol";
import notificationService from "../../../../shared/services/NotificationService.js";
import { modelosDisponibles, guardarRoles } from "./services/rolesG";
import rolesApiService from "./services/rolesApiService";

const GestionRoles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [rolEditable, setRolEditable] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nuevoRol, setNuevoRol] = useState({
    nombre: "",
    estado: "Activo",
    permisos: {},
  });

  useEffect(() => {
    // Cargar roles desde la API real
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      console.log('🔄 [GestionRoles] Cargando roles desde la API...');
      const rolesData = await rolesApiService.getAllRoles();
      setRoles(rolesData);
      console.log('✅ [GestionRoles] Roles cargados exitosamente:', rolesData);
    } catch (error) {
      console.error('❌ [GestionRoles] Error cargando roles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los roles.',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevoRol.nombre.trim() !== "") {
      try {
        console.log('🔄 [GestionRoles] Creando nuevo rol:', nuevoRol);
        const rolCreado = await rolesApiService.createRole(nuevoRol);
        console.log('✅ [GestionRoles] Rol creado exitosamente:', rolCreado);
        
        // Recargar la lista de roles
        await loadRoles();
        
        // Limpiar formulario y cerrar modal
        setNuevoRol({ nombre: "", estado: "Activo", permisos: {} });
        setShowModal(false);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El rol ha sido creado correctamente.',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
          }
        });
      } catch (error) {
        console.error('❌ [GestionRoles] Error creando rol:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear el rol.',
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
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'El nombre del rol es obligatorio.',
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

  const handleCheckboxChange = (modelo, accion) => {
    setNuevoRol((prev) => {
      const nuevoValor = !prev.permisos[modelo]?.[accion];
      const permisosActualizados = {
        ...prev.permisos[modelo],
        [accion]: nuevoValor,
      };
      
      // Si se activa crear, actualizar o eliminar, también activar leer automáticamente
      if (nuevoValor && (accion === 'crear' || accion === 'actualizar' || accion === 'eliminar')) {
        permisosActualizados.leer = true;
      }
      
      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [modelo]: permisosActualizados,
        },
      };
    });
  };

  const handleToggleEstado = async (rol) => {
    const nuevoEstado = rol.estado?.toLowerCase() === "activo" ? "inactivo" : "activo";
    
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas cambiar el estado de ${rol.nombre} a ${nuevoEstado}?`,
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
          console.log(`🔄 [GestionRoles] Cambiando estado del rol ${rol.id} a: ${nuevoEstado}`);
          const rolActualizado = await rolesApiService.changeRoleState(rol.id, nuevoEstado === "activo");
          console.log('✅ [GestionRoles] Estado del rol cambiado exitosamente:', rolActualizado);
          
          // Recargar la lista de roles
          await loadRoles();
          
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Estado del rol actualizado correctamente.',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
              title: 'text-gray-800 font-bold text-2xl mb-4',
              content: 'text-gray-600 text-base mb-6',
              confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
            }
          });
        } catch (error) {
          console.error('❌ [GestionRoles] Error cambiando estado del rol:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cambiar el estado del rol.',
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
      }
    });
  };

  const handleActualizarRoles = async () => {
    await loadRoles();
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full px-4">
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Roles</h1>
          <div className="flex gap-3">
            <button
              className="btn btn-primary px-4 py-2 text-sm rounded-md"
              onClick={() => setShowModal(true)}
              disabled={loading}
            >
              <i className="bi bi-plus"></i> Crear Rol
            </button>
          </div>
        </div>

        <TablaRoles
          roles={roles}
          setRolEditable={setRolEditable}
          setRolSeleccionado={setRolSeleccionado}
          setRoles={setRoles}
          onToggleEstado={handleToggleEstado}
          loadRoles={loadRoles}
        />

        <CrearRolModal
          showModal={showModal}
          setShowModal={setShowModal}
          nuevoRol={nuevoRol}
          setNuevoRol={setNuevoRol}
          handleSubmit={handleSubmit}
          handleCheckboxChange={handleCheckboxChange}
        />

        {rolSeleccionado && (
          <DetalleRolModal
            rol={rolSeleccionado}
            onClose={() => setRolSeleccionado(null)}
            modelosDisponibles={modelosDisponibles}
          />
        )}

        {rolEditable && (
          <EditarRolModal
            rolEditable={rolEditable}
            setRolEditable={setRolEditable}
            roles={roles}
            setRoles={setRoles}
            loadRoles={loadRoles}
          />
        )}
      </div>
    </div>
  );
};

export default GestionRoles;
