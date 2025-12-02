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

const TablaClientes = ({ clientes, onVer, onToggleEstado, deshabilitarAcciones, onEditar }) => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-300 z-40">
    <div className="overflow-x-auto w-full">
      <table className="table-auto w-full divide-y divide-gray-100 text-sm text-gray-700 min-w-[800px]">
        <thead className="text-left text-sm text-gray-500 bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center">Nombre Completo</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center hidden sm:table-cell">Tipo Doc</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center hidden sm:table-cell">Documento</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center hidden lg:table-cell">Email</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center hidden xl:table-cell">Nit Empresa</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center hidden lg:table-cell">Marca</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center hidden xl:table-cell">T. Persona</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center hidden lg:table-cell">Origen</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center">Estado</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
          {clientes.length > 0 ? (
            clientes.map((c, idx) => (
              <tr key={idx}>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-start gap-2 sm:gap-3">
                    <StandardAvatar 
                      nombre={`${c.nombre || ''} ${c.apellido || ''}`}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{c.nombre} {c.apellido}</div>
                      <div className="text-xs text-gray-500 sm:hidden">{c.tipoDocumento} - {c.documento}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">{c.tipoDocumento}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">{c.documento}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">{c.email}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden xl:table-cell">{c.nitEmpresa}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">{c.marca}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden xl:table-cell">{c.tipoPersona}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    c.origen === 'solicitud' 
                      ? 'bg-blue-100 text-blue-800' 
                      : c.origen === 'directo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {c.origen === 'solicitud' ? 'Solicitud' : c.origen === 'directo' ? 'Directo' : 'Importado'}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                  <CustomCheckbox
                    isChecked={c.estado === 'Activo'}
                    onChange={() => onToggleEstado(idx)}
                    disabled={deshabilitarAcciones}
                  />
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                  <div className="flex gap-1 sm:gap-2 justify-center">
                    <button
                      onClick={() => onVer(idx)}
                      title="Ver detalle"
                      className="p-1.5 sm:p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 border border-gray-300 transition-all duration-200"
                      disabled={deshabilitarAcciones}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEditar(idx)}
                      title="Editar"
                      className="p-1.5 sm:p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 border border-gray-300 transition-all duration-200"
                      disabled={deshabilitarAcciones}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center py-4 text-sm text-gray-500">
                No hay clientes registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default TablaClientes;