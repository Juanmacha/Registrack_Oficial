import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import notificationService from "../../../../../shared/services/NotificationService.js";

const CrearEmpleadoModal = ({
  showModal,
  setShowModal,
  nuevoEmpleado,
  setNuevoEmpleado,
  handleSubmit,
}) => {
  const [errors, setErrors] = useState({});
  const [rolesDisponibles, setRolesDisponibles] = useState([]);

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("roles_mock")) || [];
    const rolesActivos = roles.filter((rol) => rol.estado === "Activo");
    setRolesDisponibles(rolesActivos);
  }, []);

  if (!showModal) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEmpleado((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleGuardar = () => {
    const camposObligatorios = [
      "tipoDocumento",
      "documento",
      "nombre",
      "apellidos",
      "email",
      "rol",
      "estado",
    ];

    const nuevosErrores = {};
    camposObligatorios.forEach((campo) => {
      if (!nuevoEmpleado[campo]?.trim()) {
        nuevosErrores[campo] = "Campo obligatorio";
      }
    });

    setErrors(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
      handleSubmit(nuevoEmpleado);
      notificationService.createSuccess('empleado');
      setShowModal(false);
    } else {
      notificationService.createError('empleado');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <i className="bi bi-person-plus text-green-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Crear Nuevo Empleado
              </h2>
              <p className="text-sm text-gray-500">
                Completa los datos del nuevo empleado
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-card-list text-gray-400 mr-2"></i>
                Tipo de Documento *
              </label>
              <select
                name="tipoDocumento"
                value={nuevoEmpleado.tipoDocumento || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 ${
                  errors.tipoDocumento ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
              {errors.tipoDocumento && (
                <p className="text-sm text-red-600">{errors.tipoDocumento}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-hash text-gray-400 mr-2"></i>
                Documento *
              </label>
              <input
                type="text"
                name="documento"
                value={nuevoEmpleado.documento || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  errors.documento ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.documento && (
                <p className="text-sm text-red-600">{errors.documento}</p>
              )}
            </div>

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombres *</label>
              <input
                type="text"
                name="nombre"
                value={nuevoEmpleado.nombre || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nombre && (
                <p className="text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={nuevoEmpleado.apellidos || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  errors.apellidos ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.apellidos && (
                <p className="text-sm text-red-600">{errors.apellidos}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-envelope text-gray-400 mr-2"></i>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={nuevoEmpleado.email || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-person-badge text-gray-400 mr-2"></i>
                Rol *
              </label>
              <select
                name="rol"
                value={nuevoEmpleado.rol || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 ${
                  errors.rol ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar rol...</option>
                {rolesDisponibles.map((rol) => (
                  <option key={rol.id} value={rol.nombre}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
              {errors.rol && (
                <p className="text-sm text-red-600">{errors.rol}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-flag text-gray-400 mr-2"></i>
                Estado *
              </label>
              <select
                name="estado"
                value={nuevoEmpleado.estado || "activo"}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 ${
                  errors.estado ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="text-sm text-red-600">{errors.estado}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 flex items-center">
              <i className="bi bi-exclamation-circle text-gray-400 mr-2"></i>
              * Campos requeridos
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEmpleadoModal;
