import React from "react";
import StandardAvatar from "../../../../../shared/components/StandardAvatar";

const CustomCheckbox = ({ isChecked, onChange, disabled }) => {
  return (
    <label className={`flex items-center justify-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={isChecked} onChange={onChange} disabled={disabled} />
        <div className={`block w-10 h-6 rounded-full ${isChecked ? 'bg-blue-600' : (disabled ? 'bg-gray-200' : 'bg-gray-300')}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isChecked ? 'transform translate-x-full' : ''}`}></div>
      </div>
    </label>
  );
};

const TablaEmpleados = ({ empleados, onVer, onEditar, onEliminar, onToggleEstado, deshabilitarAcciones = false }) => {

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-300 z-40">
      <div className="overflow-x-auto w-full">
        <table className="table-auto w-full divide-y divide-gray-100 text-sm text-gray-700 min-w-[800px]">
          <thead className="text-left text-sm text-gray-500 bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-bold text-center">Nombre Completo</th>
              <th className="px-6 py-4 font-bold text-center">Tipo de Documento</th>
              <th className="px-6 py-4 font-bold text-center">Documento</th>
              <th className="px-6 py-4 font-bold text-center">Email</th>
              <th className="px-6 py-4 font-bold text-center">Rol</th>
              <th className="px-6 py-4 font-bold text-center">Estado</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {empleados.length > 0 ? (
              empleados.map((item, idx) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-start gap-3">
                      <StandardAvatar 
                        nombre={`${item.nombre || ''} ${item.apellidos || ''}`}
                      />
                      <div className="text-sm font-semibold text-gray-800">
                        {item.nombre} {item.apellidos}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">{item.tipoDocumento}</td>
                  <td className="px-6 py-4 text-center">{item.documento}</td>
                  <td className="px-6 py-4 text-center">{item.email}</td>
                  <td className="px-6 py-4 text-center">{item.rol}</td>
                  <td className="px-6 py-4 text-center">
                    <CustomCheckbox
                      isChecked={item.estado.toLowerCase() === 'activo'}
                      onChange={() => onToggleEstado(item)}
                      disabled={deshabilitarAcciones}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1 flex-nowrap">
                      <button
                        title="Editar"
                        onClick={() => onEditar(item)}
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        title="Ver"
                        onClick={() => onVer(item)}
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => onEliminar(item)}
                        disabled={deshabilitarAcciones}
                        className="p-2 rounded-lg bg-white text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-red-300 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500 italic">
                  No hay empleados registrados.
                </td>
              </tr>
            )}
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

export default TablaEmpleados;
