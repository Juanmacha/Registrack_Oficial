import React from "react";

const VerDetalleCita = ({ cita, isOpen, onClose, onReprogramar, onAnular, puedeReprogramar, puedeAnular }) => {
  if (!isOpen || !cita) return null;

  const getEstadoBadge = (estado) => {
    const estadoLower = (estado || '').toLowerCase();
    if (estadoLower === "programada") {
      return (
        <span className="px-3 py-1 text-blue-700 bg-blue-100 rounded-full text-xs font-semibold">
          Programada
        </span>
      );
    }
    if (estadoLower === "reprogramada") {
      return (
        <span className="px-3 py-1 text-yellow-700 bg-yellow-100 rounded-full text-xs font-semibold">
          Reprogramada
        </span>
      );
    }
    if (estadoLower === "cita anulada") {
      return (
        <span className="px-3 py-1 text-red-700 bg-red-100 rounded-full text-xs font-semibold">
          Cita anulada
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <i className="bi bi-calendar-event text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Detalle de la Cita</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Información del Cliente</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
                    <i className="bi bi-person"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{cita.nombre} {cita.apellido}</div>
                    <div className="text-sm text-gray-500">Cédula: {cita.cedula}</div>
                    {/* Mostrar teléfono solo si tiene valor real (no 'N/A' ni vacío) */}
                    {(cita.cliente?.telefono || (cita.telefono && cita.telefono !== 'N/A' && cita.telefono.trim() !== '')) && (
                      <div className="text-sm text-gray-500">
                        Teléfono: {cita.cliente?.telefono || cita.telefono}
                      </div>
                    )}
                    {/* Mostrar email solo si tiene valor real (no 'N/A' ni vacío) */}
                    {(cita.cliente?.email || cita.cliente?.correo || (cita.email && cita.email !== 'N/A' && cita.email.trim() !== '')) && (
                      <div className="text-sm text-gray-500">
                        Email: {cita.cliente?.email || cita.cliente?.correo || cita.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-info-circle text-gray-400"></i>
                    <span className="text-gray-600">Estado:</span>
                    {getEstadoBadge(cita.estado)}
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Cita */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Datos de la Cita</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-briefcase text-gray-400"></i>
                  <span className="text-gray-600">Tipo de Cita:</span>
                  <span className="font-medium text-gray-800">{cita.tipoCita}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-clock text-gray-400"></i>
                  <span className="text-gray-600">Hora de Inicio:</span>
                  <span className="font-medium text-gray-800">{cita.horaInicio}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-clock-history text-gray-400"></i>
                  <span className="text-gray-600">Hora de Fin:</span>
                  <span className="font-medium text-gray-800">{cita.horaFin}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-person-badge text-gray-400"></i>
                  <span className="text-gray-600">Asesor:</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {cita.empleado?.nombre && cita.empleado?.apellido
                        ? `${cita.empleado.nombre} ${cita.empleado.apellido}`
                        : cita.empleado?.nombre || cita.empleado?.nombre_completo || cita.asesor || 'N/A'}
                    </span>
                    {/* Verificar múltiples campos posibles para el documento del empleado */}
                    {(cita.empleado?.documento || 
                      cita.empleado?.cedula || 
                      cita.empleado?.numero_documento || 
                      cita.empleado?.numero_cedula ||
                      cita.datosOriginales?.empleado?.documento ||
                      cita.datosOriginales?.empleado?.cedula ||
                      cita.datosOriginales?.empleado?.numero_documento ||
                      cita.datosOriginales?.empleado?.numero_cedula) && (
                      <span className="text-xs text-gray-500">
                        Documento: {
                          cita.empleado?.documento || 
                          cita.empleado?.cedula || 
                          cita.empleado?.numero_documento || 
                          cita.empleado?.numero_cedula ||
                          cita.datosOriginales?.empleado?.documento ||
                          cita.datosOriginales?.empleado?.cedula ||
                          cita.datosOriginales?.empleado?.numero_documento ||
                          cita.datosOriginales?.empleado?.numero_cedula
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-chat-left-text text-gray-400"></i>
                  <span className="text-gray-600">Detalle:</span>
                  <span className="font-medium text-gray-800">{cita.detalle || <span className="italic text-gray-400">Sin detalles</span>}</span>
                </div>
                {/* Observación de anulación */}
                {cita.estado?.toLowerCase() === 'cita anulada' && cita.observacionAnulacion && (
                  <div className="flex items-start space-x-2 text-sm mt-2">
                    <i className="bi bi-exclamation-triangle text-red-400 mt-1"></i>
                    <div>
                      <span className="text-red-700 font-semibold">Observación de anulación:</span>
                      <div className="text-red-700 bg-red-50 rounded p-2 mt-1 whitespace-pre-line">{cita.observacionAnulacion}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Información de la Solicitud Original */}
          {(cita.fechaSolicitada || cita.horaSolicitada || cita.observacionAdmin) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Información de la Solicitud Original</h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                {cita.fechaSolicitada && (
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-calendar-date text-blue-400"></i>
                    <span className="text-blue-600">Fecha Solicitada:</span>
                    <span className="font-medium text-blue-800">{cita.fechaSolicitada}</span>
                  </div>
                )}
                {cita.horaSolicitada && (
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-clock text-blue-400"></i>
                    <span className="text-blue-600">Hora Solicitada:</span>
                    <span className="font-medium text-blue-800">{cita.horaSolicitada}</span>
                  </div>
                )}
                {cita.observacionAdmin && (
                  <div className="flex items-start space-x-2 text-sm">
                    <i className="bi bi-chat-left-dots text-blue-400 mt-1"></i>
                    <div>
                      <span className="text-blue-600">Observación del Administrador:</span>
                      <div className="text-blue-800 bg-blue-100 rounded p-2 mt-1 whitespace-pre-line">{cita.observacionAdmin}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          {puedeReprogramar && (
            <button
              onClick={onReprogramar}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              Reprogramar
            </button>
          )}
          {puedeAnular && (
            <button
              onClick={onAnular}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
            >
              Anular
            </button>
          )}
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

export default VerDetalleCita; 