import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import rolesApiService from "../services/rolesApiService";

const EditarRolModal = ({ rolEditable, setRolEditable, roles, setRoles, loadRoles }) => {
  console.log("EditarRolModal - rolEditable:", rolEditable);  // Depuración

  if (!rolEditable) {
    return null;
  }

  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    estado: "activo", // Añadir estado al formData
    permisos: {},
  });

  useEffect(() => {
    if (rolEditable) {
      // Normalizar el estado antes de asignarlo al formData
      let estadoNormalizado = "activo";
      if (rolEditable.estado) {
        const estadoStr = String(rolEditable.estado).toLowerCase();
        estadoNormalizado = estadoStr === "activo" || estadoStr === "true" || estadoStr === "1" ? "activo" : "inactivo";
      }

      setFormData({
        id: rolEditable.id,
        nombre: rolEditable.nombre || "",
        estado: estadoNormalizado,
        permisos: rolEditable.permisos || {},
      });
    }
  }, [rolEditable]);

  if (!rolEditable) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📤 [EditarRol] ===== INICIANDO ACTUALIZACIÓN =====");
    console.log("📤 [EditarRol] formData completo:", formData);
    console.log("📤 [EditarRol] ID del rol:", formData.id);
    console.log("📤 [EditarRol] Nombre actual:", formData.nombre);
    console.log("📤 [EditarRol] Estado actual:", formData.estado);
    console.log("📤 [EditarRol] Permisos actuales:", JSON.stringify(formData.permisos, null, 2));

    try {
      // Enviar solo los módulos que tienen al menos un permiso true (igual que cuando se crea)
      // Si un módulo tiene todos los permisos en false, NO se incluye (para que el backend lo procese correctamente)
      const permisosCompletos = {};
      recursosSistema.forEach(recurso => {
        const crear = formData.permisos?.[recurso.key]?.crear === true;
        const leer = formData.permisos?.[recurso.key]?.leer === true;
        const actualizar = formData.permisos?.[recurso.key]?.actualizar === true;
        const eliminar = formData.permisos?.[recurso.key]?.eliminar === true;
        
        // Solo incluir el módulo si tiene al menos un permiso en true
        if (crear || leer || actualizar || eliminar) {
          permisosCompletos[recurso.key] = {
            crear: crear || false,
            leer: leer || false,
            actualizar: actualizar || false,
            eliminar: eliminar || false
          };
        }
        // Si todos los permisos están en false, no se incluye el módulo (igual que cuando se crea)
      });

      console.log("📤 [EditarRol] Permisos completos (solo módulos con permisos activos):", JSON.stringify(permisosCompletos, null, 2));

      // Preparar datos para enviar a la API
      const datosActualizacion = {
        nombre: formData.nombre.trim(),
        estado: formData.estado === "activo" ? "Activo" : "Inactivo",
        permisos: permisosCompletos
      };

      console.log("📤 [EditarRol] Datos preparados para enviar:", JSON.stringify(datosActualizacion, null, 2));

      // Actualizar el rol usando la API
      const rolActualizado = await rolesApiService.updateRole(formData.id, datosActualizacion);
      
      console.log("✅ [EditarRol] Respuesta del backend:", JSON.stringify(rolActualizado, null, 2));

      // Cerrar el modal primero para evitar problemas de estado
      setRolEditable(null);

      // Esperar un momento para que el backend procese completamente la actualización
      await new Promise(resolve => setTimeout(resolve, 300));

      // Recargar la lista de roles desde la API
      console.log("🔄 [EditarRol] Recargando lista de roles...");
      if (loadRoles) {
        await loadRoles();
      } else {
        // Fallback: recargar manualmente
        const rolesData = await rolesApiService.getAllRoles();
        console.log("🔄 [EditarRol] Roles recargados:", rolesData);
        setRoles(rolesData);
      }

      console.log("✅ [EditarRol] ===== ACTUALIZACIÓN COMPLETADA =====");
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El rol ha sido actualizado correctamente.',
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
      console.error("❌ [EditarRol] ===== ERROR EN ACTUALIZACIÓN =====");
      console.error("❌ [EditarRol] Error completo:", error);
      console.error("❌ [EditarRol] Mensaje de error:", error.message);
      console.error("❌ [EditarRol] Stack:", error.stack);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al actualizar el rol.',
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

  const handleCheckboxChange = (recurso, accion) => {
    setFormData((prev) => {
      const nuevoValor = !prev.permisos[recurso]?.[accion];
      const permisosActualizados = {
        ...prev.permisos[recurso],
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
          [recurso]: permisosActualizados,
        },
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Mapear los recursos del sistema centralizado (19 módulos reales de la API según INFORMACION_SISTEMA_PERMISOS.md)
  // El backend envía los módulos sin el prefijo "gestion_"
  // Total: 19 módulos (11 completos, 7 parciales, 1 solo lectura)
  const recursosSistema = [
    // Módulos Completos (11) - Tienen todas las acciones: crear, leer, actualizar, eliminar
    { key: 'usuarios', nombre: 'Usuarios' },
    { key: 'empleados', nombre: 'Empleados' },
    { key: 'clientes', nombre: 'Clientes' },
    { key: 'solicitudes', nombre: 'Solicitudes' },
    { key: 'citas', nombre: 'Citas' },
    { key: 'seguimiento', nombre: 'Seguimiento' },
    { key: 'roles', nombre: 'Roles' },
    { key: 'permisos', nombre: 'Permisos' },
    { key: 'privilegios', nombre: 'Privilegios' },
    { key: 'tipo_archivos', nombre: 'Tipos de Archivo' },
    { key: 'detalles_procesos', nombre: 'Detalles de Procesos' },
    
    // Módulos Parciales (7) - Tienen solo algunas acciones
    { key: 'empresas', nombre: 'Empresas' }, // crear, leer
    { key: 'servicios', nombre: 'Servicios' }, // leer, actualizar
    { key: 'pagos', nombre: 'Pagos' }, // crear, leer, actualizar
    { key: 'archivos', nombre: 'Archivos' }, // crear, leer
    { key: 'solicitud_cita', nombre: 'Solicitudes de Cita' }, // crear, leer, actualizar (módulo separado de gestion_citas)
    { key: 'detalles_orden', nombre: 'Detalles de Orden' }, // crear, leer, actualizar
    { key: 'servicios_procesos', nombre: 'Servicios y Procesos' }, // crear, leer, eliminar
    
    // Módulos de Solo Lectura (1)
    { key: 'dashboard', nombre: 'Dashboard' } // solo lectura
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.nombre}`}
              alt={formData.nombre}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Editar Rol: {formData.nombre}</h2>
              <p className="text-sm text-gray-600">Modifica los permisos del rol</p>
            </div>
          </div>
          {/* Botón de cerrar eliminado */}
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Rol
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {/* Nuevo campo de estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permisos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Permisos del Sistema</h3>
              <div className="overflow-x-auto">
                <table className="w-full border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Recurso</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Crear</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Leer</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Actualizar</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recursosSistema.map((recurso, index) => (
                      <tr key={recurso.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 border-b">
                          {recurso.nombre}
                        </td>
                        {['crear', 'leer', 'actualizar', 'eliminar'].map((accion) => (
                          <td key={accion} className="px-4 py-3 text-center border-b">
                            <input
                              type="checkbox"
                              checked={!!formData.permisos?.[recurso.key]?.[accion]}
                              onChange={() => handleCheckboxChange(recurso.key, accion)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={() => setRolEditable(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarRolModal;
