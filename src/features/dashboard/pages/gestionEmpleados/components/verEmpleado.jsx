import React from "react";

const VerEmpleadoModal = ({ showModal, setShowModal, empleado }) => {
  if (!showModal || !empleado) return null;

  const getEstadoBadge = (estado) => {
    const estadoLower = (estado || "").toLowerCase();
    if (estadoLower === "activo" || estadoLower === true || estadoLower === "true") {
      return (
        <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full text-xs font-semibold">
          Activo
        </span>
      );
    }
    if (estadoLower === "inactivo" || estadoLower === false || estadoLower === "false") {
      return (
        <span className="px-3 py-1 text-red-700 bg-red-100 rounded-full text-xs font-semibold">
          Inactivo
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full text-xs font-semibold">
        {estado}
      </span>
    );
  };

  const getRolBadge = (rol) => {
    const rolLower = (rol || "").toLowerCase();
    if (rolLower.includes("admin")) {
      return (
        <span className="px-3 py-1 text-blue-700 bg-blue-100 rounded-full text-xs font-semibold">
          Administrador
        </span>
      );
    }
    if (rolLower.includes("empleado") || rolLower.includes("employee")) {
      return (
        <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full text-xs font-semibold">
          Empleado
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full text-xs font-semibold">
        {rol}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <i className="bi bi-person text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Detalle del Empleado</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <i className="bi bi-person text-blue-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${empleado.nombre} ${empleado.apellidos}`}
                    alt={`${empleado.nombre} ${empleado.apellidos}`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{empleado.nombre} {empleado.apellidos}</div>
                    <div className="text-sm text-gray-500">{empleado.email || empleado.correo || empleado.rol}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person-badge text-blue-500"></i>
                      <span className="text-gray-600">Rol:</span>
                      {getRolBadge(empleado.rol)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-card-text text-blue-500"></i>
                      <span className="text-gray-600">Tipo de Documento:</span>
                      <span className="font-medium text-gray-800">{empleado.tipoDocumento || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-123 text-blue-500"></i>
                      <span className="text-gray-600">Número de Documento:</span>
                      <span className="font-medium text-gray-800">{empleado.documento || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-envelope text-blue-500"></i>
                      <span className="text-gray-600">Correo:</span>
                      <span className="font-medium text-gray-800">{empleado.email || empleado.correo || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-flag text-blue-500"></i>
                      <span className="text-gray-600">Estado:</span>
                      {getEstadoBadge(empleado.estado_usuario !== undefined ? empleado.estado_usuario : true)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Empleado */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <i className="bi bi-briefcase text-green-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información del Empleado</h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <i className="bi bi-briefcase text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{empleado.nombre} {empleado.apellidos}</div>
                    <div className="text-sm text-gray-500">Empleado {empleado.rol === 'administrador' ? 'Administrador' : empleado.rol}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person-circle text-green-500"></i>
                      <span className="text-gray-600">Estado del Empleado:</span>
                      {getEstadoBadge(empleado.estado || empleado.estado_empleado)}
                    </div>
                    {empleado.id_empleado && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-hash text-green-500"></i>
                        <span className="text-gray-600">ID Empleado:</span>
                        <span className="font-medium text-gray-800">{empleado.id_empleado}</span>
                      </div>
                    )}
                    {empleado.id_usuario && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-person-badge text-green-500"></i>
                        <span className="text-gray-600">ID Usuario:</span>
                        <span className="font-medium text-gray-800">{empleado.id_usuario}</span>
                      </div>
                    )}
                    {empleado.es_empleado_registrado !== undefined && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-check-circle text-green-500"></i>
                        <span className="text-gray-600">Registrado:</span>
                        {getEstadoBadge(empleado.es_empleado_registrado)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerEmpleadoModal;
