import React from "react";
import eliminarRol from "./eliminarRol";

const CustomCheckbox = ({ isChecked, onChange }) => {
  return (
    <label className="flex items-center justify-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={isChecked} onChange={onChange} />
        <div className={`block w-10 h-6 rounded-full ${isChecked ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isChecked ? 'transform translate-x-full' : ''}`}></div>
      </div>
    </label>
  );
};

const TablaRoles = ({ roles, setRolEditable, setRolSeleccionado, setRoles, onToggleEstado, loadRoles }) => {
  // Removed local toggleEstado function

  // Contar permisos activos
  const contarPermisosActivos = (permisos) => {
    if (!permisos || typeof permisos !== 'object') return 0;
    
    let total = 0;
    Object.values(permisos).forEach(recurso => {
      if (recurso && typeof recurso === 'object') {
        Object.values(recurso).forEach(permiso => {
          // Solo contar si el permiso es explícitamente true
          if (permiso === true) {
            total++;
          }
        });
      }
    });
    
    return total;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-300 mt-4 w-full">
      <div className="overflow-x-auto w-full">
        <table className="table-auto w-full divide-y divide-gray-100 min-w-[600px]">
          <thead className="text-left text-sm text-gray-500 bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-bold text-center">Rol</th>
              <th className="px-6 py-4 font-bold text-center">Permisos</th>
              <th className="px-6 py-4 font-bold text-center">Estado</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {roles.map((rol, index) => {
              const permisosActivos = contarPermisosActivos(rol.permisos);
              return (
                <tr key={rol.id || index}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-start">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${rol.nombre}`}
                        alt={rol.nombre}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="text-sm font-semibold text-gray-800">{rol.nombre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {permisosActivos} permisos
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CustomCheckbox
                      isChecked={rol.estado.toLowerCase() === 'activo'}
                      onChange={() => onToggleEstado(rol)}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                        onClick={() => setRolEditable(rol)}
                        title="Editar rol"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                        onClick={() => setRolSeleccionado(rol)}
                        title="Ver rol"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                        onClick={() => eliminarRol(rol.id, roles, setRoles, loadRoles)}
                        title="Eliminar rol"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .custom-hover:hover {
          opacity: 0.8;
          transform: scale(1.05);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TablaRoles;