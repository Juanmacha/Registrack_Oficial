// pages/gestionRoles/index.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import TablaRoles from "./components/tablaRoles";
import CrearRolModal from "./components/crearRol";
import EditarRolModal from "./components/editarRol";
import DetalleRolModal from "./components/verRol";
import { useNotification } from "../../../../shared/contexts/NotificationContext.jsx";
import { modelosDisponibles, guardarRoles } from "./services/rolesG";
import rolesApiService from "./services/rolesApiService";

const GestionRoles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [rolEditable, setRolEditable] = useState(null);
  const { createSuccess, updateSuccess, createError, updateError } = useNotification();

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
    try {
      console.log('🔄 [GestionRoles] Cargando roles desde la API...');
      const rolesData = await rolesApiService.getAllRoles();
      setRoles(rolesData);
      console.log('✅ [GestionRoles] Roles cargados exitosamente:', rolesData);
    } catch (error) {
      console.error('❌ [GestionRoles] Error cargando roles:', error);
      createError('Error al cargar los roles');
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
        createSuccess('rol');
      } catch (error) {
        console.error('❌ [GestionRoles] Error creando rol:', error);
        createError('Error al crear el rol');
      }
    } else {
      createError('El nombre del rol es obligatorio');
    }
  };

  const handleCheckboxChange = (modelo, accion) => {
    setNuevoRol((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [modelo]: {
          ...prev.permisos[modelo],
          [accion]: !prev.permisos[modelo]?.[accion],
        },
      },
    }));
  };

  const handleToggleEstado = async (rol) => {
    const nuevoEstado = rol.estado?.toLowerCase() === "activo" ? "inactivo" : "activo";
    
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas cambiar el estado de ${rol.nombre} a ${nuevoEstado}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar estado",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(`🔄 [GestionRoles] Cambiando estado del rol ${rol.id} a: ${nuevoEstado}`);
          const rolActualizado = await rolesApiService.changeRoleState(rol.id, nuevoEstado === "activo");
          console.log('✅ [GestionRoles] Estado del rol cambiado exitosamente:', rolActualizado);
          
          // Recargar la lista de roles
          await loadRoles();
          updateSuccess('rol');
        } catch (error) {
          console.error('❌ [GestionRoles] Error cambiando estado del rol:', error);
          updateError('Error al cambiar el estado del rol');
        }
      }
    });
  };

  const handleActualizarRoles = async () => {
    await loadRoles();
  };

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full px-4">
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Roles</h1>
          <div className="flex gap-3">
            <button
              className="btn btn-primary px-4 py-2 text-sm rounded-md"
              onClick={() => setShowModal(true)}
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
          modelosDisponibles={modelosDisponibles}
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
