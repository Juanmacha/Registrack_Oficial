import React from 'react';

const ProfileModal = ({ isOpen, onClose, user, onEdit }) => {
  if (!isOpen || !user) return null;

  const getEstadoBadge = (estado) => {
    if (typeof estado === 'boolean') {
      return estado ? (
        <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full text-xs font-semibold">
          Activo
        </span>
      ) : (
        <span className="px-3 py-1 text-red-700 bg-red-100 rounded-full text-xs font-semibold">
          Inactivo
        </span>
      );
    }
    
    const estadoLower = (estado || "").toLowerCase();
    if (estadoLower === 'activo' || estadoLower === 'true') {
      return (
        <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full text-xs font-semibold">
          Activo
        </span>
      );
    }
    if (estadoLower === "inactivo" || estadoLower === "false") {
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

  const getRolBadge = (rol, user) => {
    // Si el rol es un objeto, extraer el nombre
    let rolNombre = '';
    let rolId = null;
    
    if (typeof rol === 'object' && rol !== null) {
      rolNombre = rol.nombre || rol.name || '';
      rolId = rol.id || rol.id_rol;
    } else {
      rolNombre = rol || '';
    }
    
    // También intentar obtener del objeto user si está disponible
    if (user) {
      if (user.rol) {
        if (typeof user.rol === 'object') {
          rolNombre = user.rol.nombre || user.rol.name || rolNombre;
          rolId = user.rol.id || user.rol.id_rol || rolId;
        } else {
          rolNombre = user.rol || rolNombre;
        }
      }
      rolId = user.id_rol || user.idRol || rolId;
    }
    
    const rolLower = (rolNombre || "").toLowerCase().trim();
    
    // Verificar por ID primero (más confiable)
    if (rolId === 2 || rolId === '2' || rolLower.includes("admin") || rolLower.includes("administrador")) {
      return (
        <span className="px-3 py-1 text-blue-700 bg-blue-100 rounded-full text-xs font-semibold">
          Administrador
        </span>
      );
    }
    if (rolId === 3 || rolId === '3' || rolLower.includes("empleado") || rolLower.includes("employee")) {
      return (
        <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full text-xs font-semibold">
          Empleado
        </span>
      );
    }
    if (rolId === 1 || rolId === '1' || rolLower.includes("cliente") || rolLower.includes("client")) {
      return (
        <span className="px-3 py-1 text-purple-700 bg-purple-100 rounded-full text-xs font-semibold">
          Cliente
        </span>
      );
    }
    
    // Si no coincide con los roles estándar, mostrar el nombre del rol tal cual
    return (
      <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full text-xs font-semibold">
        {rolNombre || rol || 'Usuario'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <i className="bi bi-person-badge text-blue-600 text-xl"></i>
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
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.nombre || user.nombres || user.firstName || 'Usuario'}`}
                    alt={user.nombre || user.nombres || user.firstName || 'Usuario'}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{user.nombre || user.nombres || user.firstName || 'Usuario'}</div>
                    <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person-badge text-blue-500"></i>
                      <span className="text-gray-600">Rol:</span>
                      {getRolBadge(user.rol || user.role, user)}
                    </div>
                    {(user.tipoDocumento || user.documentType) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-card-text text-blue-500"></i>
                        <span className="text-gray-600">Tipo de Documento:</span>
                        <span className="font-medium text-gray-800">{user.tipoDocumento || user.documentType || 'N/A'}</span>
                      </div>
                    )}
                    {(user.documento || user.documentNumber) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-123 text-blue-500"></i>
                        <span className="text-gray-600">Número de Documento:</span>
                        <span className="font-medium text-gray-800">{user.documento || user.documentNumber || 'N/A'}</span>
                      </div>
                    )}
                    {(user.telefono || user.phone) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-telephone text-blue-500"></i>
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium text-gray-800">{user.telefono || user.phone}</span>
                      </div>
                    )}
                    {(user.direccion || user.address) && (
                      <div className="flex items-start space-x-2 text-sm">
                        <i className="bi bi-geo-alt text-blue-500 mt-0.5"></i>
                        <div>
                          <span className="text-gray-600">Dirección:</span>
                          <div className="font-medium text-gray-800">{user.direccion || user.address}</div>
                        </div>
                      </div>
                    )}
                    {(user.fechaRegistro || user.createdAt) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-calendar text-blue-500"></i>
                        <span className="text-gray-600">Fecha de Registro:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(user.fechaRegistro || user.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {user.estado !== undefined && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-flag text-blue-500"></i>
                        <span className="text-gray-600">Estado:</span>
                        {getEstadoBadge(user.estado)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información Empresarial (para clientes jurídicos) */}
            {(user.nit || user.razonSocial || user.nombreEmpresa) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <i className="bi bi-building text-green-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información Empresarial</h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <i className="bi bi-building text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{user.nombreEmpresa || user.razonSocial || 'N/A'}</div>
                      {user.nit && <div className="text-sm text-gray-500">NIT: {user.nit}</div>}
                    </div>
                  </div>
                  {(user.direccion || user.address || user.telefono || user.phone || user.email || user.ciudad || user.pais) && (
                    <div className="pt-2 border-t border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(user.direccion || user.address) && (
                          <div className="flex items-start space-x-2 text-sm">
                            <i className="bi bi-geo-alt text-green-500 mt-0.5"></i>
                            <div>
                              <span className="text-gray-600">Dirección:</span>
                              <div className="font-medium text-gray-800">{user.direccion || user.address}</div>
                            </div>
                          </div>
                        )}
                        {(user.telefono || user.phone) && (
                          <div className="flex items-center space-x-2 text-sm">
                            <i className="bi bi-telephone text-green-500"></i>
                            <span className="text-gray-600">Teléfono:</span>
                            <span className="font-medium text-gray-800">{user.telefono || user.phone}</span>
                          </div>
                        )}
                        {user.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <i className="bi bi-envelope text-green-500"></i>
                            <span className="text-gray-600">Correo:</span>
                            <span className="font-medium text-gray-800">{user.email}</span>
                          </div>
                        )}
                        {user.ciudad && (
                          <div className="flex items-center space-x-2 text-sm">
                            <i className="bi bi-geo text-green-500"></i>
                            <span className="text-gray-600">Ciudad:</span>
                            <span className="font-medium text-gray-800">{user.ciudad}</span>
                          </div>
                        )}
                        {user.pais && (
                          <div className="flex items-center space-x-2 text-sm">
                            <i className="bi bi-globe text-green-500"></i>
                            <span className="text-gray-600">País:</span>
                            <span className="font-medium text-gray-800">{user.pais}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información Adicional */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <i className="bi bi-info-circle text-purple-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información Adicional</h3>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <i className="bi bi-person-circle text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Usuario del Sistema</div>
                    <div className="text-sm text-gray-500">Datos del registro</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(user.createdAt || user.created_at) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-calendar-event text-purple-500"></i>
                        <span className="text-gray-600">Fecha de Creación:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(user.createdAt || user.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {(user.updatedAt || user.updated_at) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-clock text-purple-500"></i>
                        <span className="text-gray-600">Última Actualización:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(user.updatedAt || user.updated_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {user.id_usuario && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-hash text-purple-500"></i>
                        <span className="text-gray-600">ID Usuario:</span>
                        <span className="font-medium text-gray-800">{user.id_usuario}</span>
                      </div>
                    )}
                    {user.id_rol && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-shield-check text-purple-500"></i>
                        <span className="text-gray-600">ID Rol:</span>
                        <span className="font-medium text-gray-800">{user.id_rol}</span>
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

export default ProfileModal;
