import React from 'react';

const labelClass = "text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide";
const valueClass = "text-sm text-gray-800 mb-2 break-all";

const renderObj = (obj) => {
  if (!obj) return <span className="italic text-gray-400">No disponible</span>;
  if (typeof obj === 'string' || typeof obj === 'number') return obj;
  if (Array.isArray(obj)) return obj.length ? obj.join(', ') : <span className="italic text-gray-400">Vacío</span>;
  return Object.entries(obj).map(([k, v]) => (
    <div key={k}><b>{k}:</b> {typeof v === 'object' ? renderObj(v) : v?.toString() || 'No disponible'}</div>
  ));
};

export default function ModalVerDetalleServicio({ servicio, isOpen, onClose }) {
  if (!isOpen || !servicio) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-0 overflow-y-auto max-h-[90vh] relative border border-gray-200">
        {/* Header sticky */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 border-b border-blue-200 flex items-center justify-between rounded-t-2xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full shadow">
              <i className="bi bi-eye text-blue-600 text-2xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-800">VER DETALLE</h2>
              <p className="text-sm text-gray-500">ID: {servicio.id}</p>
            </div>
          </div>
        </div>
        {/* Content: grid 3 columnas en desktop, 1 en móvil */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-gradient-to-br from-white to-blue-50">
          {/* Panel 1: Datos básicos */}
          <div className="bg-white rounded-xl p-3 flex flex-col gap-1 border border-blue-100 shadow-sm max-h-56 overflow-y-auto">
            <div className={labelClass}>Nombre</div>
            <div className={valueClass}>{servicio.nombre}</div>
            <div className={labelClass}>Descripción corta</div>
            <div className={valueClass}>{servicio.descripcion_corta}</div>
            <div className={labelClass}>Visible en landing</div>
            <div className={valueClass}>{servicio.visible_en_landing ? 'Sí' : 'No'}</div>
            <div className={labelClass}>Ruta</div>
            <div className={valueClass}>{servicio.route_path}</div>
          </div>
          {/* Panel 2: Datos para Landing Page */}
          <div className="bg-white rounded-xl p-3 flex flex-col gap-1 border border-blue-100 shadow-sm max-h-56 overflow-y-auto">
            <div className={labelClass}>Landing Page</div>
            <div className="text-xs text-gray-500 mb-1">(Título, resumen, imagen...)</div>
            <div className="bg-blue-50 rounded p-2 border border-blue-100 text-xs overflow-x-auto mt-1">
              {renderObj(servicio.landing_data)}
            </div>
          </div>
          {/* Panel 3: Estados del Proceso */}
          <div className="bg-white rounded-xl p-3 flex flex-col gap-1 border border-blue-100 shadow-sm max-h-56 overflow-y-auto">
            <div className={labelClass}>PROCESOS DEL SERVICIO</div>
            <ol className="list-decimal ml-6 mt-1">
              {servicio.process_states && servicio.process_states.length > 0 ? servicio.process_states.map((ps) => (
                <li key={ps.id} className="text-sm font-semibold text-blue-700">
                  <b>{ps.name}</b>
                </li>
              )) : <span className="italic text-gray-400">Sin procesos</span>}
            </ol>
          </div>
        </div>
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end rounded-b-2xl">
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
} 