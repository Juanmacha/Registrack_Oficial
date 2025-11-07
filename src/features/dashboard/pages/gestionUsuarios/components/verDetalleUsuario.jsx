import React from "react";

const VerDetalleUsuario = ({ usuario, isOpen, onClose }) => {
  if (!isOpen || !usuario) return null;

  const getRolBadge = (rol) => {
    const rolLower = (rol || "").toLowerCase();
    if (rolLower.includes("administrador") || rolLower.includes("admin")) {
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
    if (rolLower.includes("cliente") || rolLower.includes("client")) {
      return (
        <span className="px-3 py-1 text-purple-700 bg-purple-100 rounded-full text-xs font-semibold">
          Cliente
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full text-xs font-semibold">
        {rol}
      </span>
    );
  };

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
              <h2 className="text-xl font-semibold text-gray-800">Detalle del Usuario</h2>
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
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${usuario.firstName || usuario.nombre} ${usuario.lastName || usuario.apellido}`}
                    alt={`${usuario.firstName || usuario.nombre} ${usuario.lastName || usuario.apellido}`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{usuario.firstName || usuario.nombre} {usuario.lastName || usuario.apellido}</div>
                    <div className="text-sm text-gray-500">{usuario.email || usuario.correo}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person-badge text-blue-500"></i>
                      <span className="text-gray-600">Rol:</span>
                      {getRolBadge(usuario.role || usuario.rol)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-card-text text-blue-500"></i>
                      <span className="text-gray-600">Tipo de Documento:</span>
                      <span className="font-medium text-gray-800">{usuario.documentType || usuario.tipo_documento || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-123 text-blue-500"></i>
                      <span className="text-gray-600">Número de Documento:</span>
                      <span className="font-medium text-gray-800">{usuario.documentNumber || usuario.documento || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-envelope text-blue-500"></i>
                      <span className="text-gray-600">Correo:</span>
                      <span className="font-medium text-gray-800">{usuario.email || usuario.correo || 'N/A'}</span>
                    </div>
                    {usuario.estado !== undefined && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-flag text-blue-500"></i>
                        <span className="text-gray-600">Estado:</span>
                        {getEstadoBadge(usuario.estado)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <i className="bi bi-info-circle text-purple-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información del Usuario</h3>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <i className="bi bi-person-circle text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{usuario.firstName || usuario.nombre} {usuario.lastName || usuario.apellido}</div>
                    <div className="text-sm text-gray-500">Usuario del sistema</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-calendar-event text-purple-500"></i>
                      <span className="text-gray-600">Fecha de Registro:</span>
                      <span className="font-medium text-gray-800">
                        {usuario.createdAt || usuario.created_at ? new Date(usuario.createdAt || usuario.created_at).toLocaleDateString('es-ES') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-clock text-purple-500"></i>
                      <span className="text-gray-600">Última Actualización:</span>
                      <span className="font-medium text-gray-800">
                        {usuario.updatedAt || usuario.updated_at ? new Date(usuario.updatedAt || usuario.updated_at).toLocaleDateString('es-ES') : 'N/A'}
                      </span>
                    </div>
                    {usuario.id_user && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-hash text-purple-500"></i>
                        <span className="text-gray-600">ID Usuario:</span>
                        <span className="font-medium text-gray-800">{usuario.id_user}</span>
                      </div>
                    )}
                    {usuario.id_rol && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-shield-check text-purple-500"></i>
                        <span className="text-gray-600">ID Rol:</span>
                        <span className="font-medium text-gray-800">{usuario.id_rol}</span>
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
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerDetalleUsuario;
