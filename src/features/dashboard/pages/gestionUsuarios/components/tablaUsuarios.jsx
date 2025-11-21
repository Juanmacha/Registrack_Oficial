import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "bootstrap-icons/font/bootstrap-icons.css";
import StandardAvatar from "../../../../../shared/components/StandardAvatar";

const CustomCheckbox = ({ isChecked, onChange, disabled }) => {
  console.log('🔘 [CustomCheckbox] isChecked:', isChecked, 'disabled:', disabled);
  
  const handleChange = (e) => {
    console.log('🔘 [CustomCheckbox] onChange triggered, isChecked:', isChecked);
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <label className={`flex items-center justify-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={isChecked} 
          onChange={handleChange} 
          disabled={disabled} 
        />
        <div 
          className={`block w-10 h-6 rounded-full transition-all duration-300 ${
            isChecked 
              ? 'bg-blue-600' 
              : (disabled ? 'bg-gray-200' : 'bg-gray-300')
          }`}
          style={{
            backgroundColor: isChecked ? '#2563eb' : (disabled ? '#e5e7eb' : '#d1d5db')
          }}
        ></div>
        <div 
          className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
            isChecked ? 'left-5' : 'left-1'
          }`}
          style={{
            transform: isChecked ? 'translateX(0)' : 'translateX(0)',
            left: isChecked ? '1.25rem' : '0.25rem'
          }}
        ></div>
      </div>
    </label>
  );
};

const TablaUsuarios = ({
  usuarios = [],
  handleDelete,
  onVer,
  onEditar,
  onToggleEstado,
  deshabilitarAcciones = false,
  registrosPorPagina = 5,
  puedeEditar = false,
  puedeEliminar = false
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);

  useEffect(() => {
    const filtrados = usuarios.filter((u) => {
      const nombreCompleto = `${u.firstName} ${u.lastName}`;
      const texto = `${u.documentType} ${u.documentNumber} ${nombreCompleto} ${u.email} ${u.role}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
    setUsuariosFiltrados(filtrados);
    setPaginaActual(1); // Reiniciar a la primera página si se busca
  }, [busqueda, usuarios]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(inicio, fin);

  return (
    <div className="w-full max-w-full">

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-300 z-40">
        <div className="overflow-x-auto w-full">
          <table className="table-auto w-full divide-y divide-gray-100 min-w-[800px]">
            <thead className="text-left text-sm text-gray-500 bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-bold text-center">Nombre Completo</th>
                <th className="px-6 py-4 font-bold text-center">Tipo Doc</th>
                <th className="px-6 py-4 font-bold text-center">Documento</th>
                <th className="px-6 py-4 font-bold text-center">Email</th>
                <th className="px-6 py-4 font-bold text-center">Rol</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {usuariosPaginados.map((u, idx) => (
                <tr key={idx}>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <StandardAvatar 
                          nombre={`${u.firstName || ''} ${u.lastName || ''}`}
                        />
                        <div className="text-left">
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4 text-center">{u.documentType}</td>
                  <td className="px-6 py-4 text-center">{u.documentNumber}</td>
                  <td className="px-6 py-4 text-center">{u.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === "administrador"
                          ? "text-blue-600 text-blue-800"
                          : "text-green-600 text-green-800"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CustomCheckbox
                      isChecked={typeof u.estado === 'boolean' ? u.estado : u.estado?.toLowerCase() === 'activo'}
                      onChange={() => onToggleEstado(u)}
                      disabled={deshabilitarAcciones}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                        title="Ver detalle"
                        onClick={() => onVer(u)}
                        disabled={deshabilitarAcciones}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {puedeEditar && (
                        <button
                          className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                          title="Editar"
                          onClick={() => onEditar(u, inicio + idx)}
                          disabled={deshabilitarAcciones}
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      )}
                      {puedeEliminar && (
                        <button
                          className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                          title="Eliminar"
                          onClick={() => handleDelete(u)}
                          disabled={deshabilitarAcciones}
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hover animado */}
      <style>{`
        .custom-hover:hover {
          opacity: 0.8;
          transform: scale(1.05);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TablaUsuarios;
