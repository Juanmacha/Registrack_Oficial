import React from "react";

const CrearRolModal = ({
  showModal,
  setShowModal,
  nuevoRol,
  setNuevoRol,
  handleSubmit,
  handleCheckboxChange,
}) => {
  if (!showModal) return null;

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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="bi bi-person-plus text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Rol</h2>
              <p className="text-sm text-gray-600">Define los permisos del nuevo rol</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
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
                    Nombre del Rol *
                  </label>
                  <input
                    type="text"
                    value={nuevoRol.nombre}
                    onChange={(e) => setNuevoRol({ ...nuevoRol, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Supervisor"
                    required
                  />
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
                              checked={!!nuevoRol.permisos?.[recurso.key]?.[accion]}
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

            {/* Resumen de permisos */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Resumen de Permisos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Total de recursos:</span>
                  <span className="ml-2 text-gray-800">{recursosSistema.length}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Permisos activos:</span>
                  <span className="ml-2 text-gray-800">
                    {recursosSistema.reduce((total, recurso) => 
                      total + Object.values(nuevoRol.permisos?.[recurso.key] || {}).filter(p => p).length, 0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Permisos totales:</span>
                  <span className="ml-2 text-gray-800">
                    {recursosSistema.reduce((total, recurso) => 
                      total + Object.keys(nuevoRol.permisos?.[recurso.key] || {}).length, 0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Porcentaje:</span>
                  <span className="ml-2 text-gray-800">
                    {recursosSistema.length > 0 
                      ? Math.round((recursosSistema.reduce((total, recurso) => 
                          total + Object.values(nuevoRol.permisos?.[recurso.key] || {}).filter(p => p).length, 0
                        ) / recursosSistema.reduce((total, recurso) => 
                          total + Object.keys(nuevoRol.permisos?.[recurso.key] || {}).length, 0
                        )) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Crear Rol
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearRolModal;
