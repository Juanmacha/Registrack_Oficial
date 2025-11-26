import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import solicitudesCitasApiService from '../../services/solicitudesCitasApiService.js';
import alertService from '../../../../utils/alertService.js';
import Swal from "sweetalert2";
import StandardAvatar from "../../../../shared/components/StandardAvatar";
import ModalAprobarSolicitud from './components/ModalAprobarSolicitud';

const TablaSolicitudesCitas = ({ solicitudes, onVer, deshabilitarAcciones, cargarSolicitudes }) => {
  const navigate = useNavigate();
  const [mostrarModalAprobar, setMostrarModalAprobar] = useState(false);
  const [solicitudAprobar, setSolicitudAprobar] = useState(null);

  const getEstadoBadge = (estado) => {
    const badges = {
      'Pendiente': 'text-yellow-800',
      'Aprobada': 'text-green-800',
      'Rechazada': 'text-red-800'
    };
    return badges[estado] || 'text-gray-800';
  };

  const handleAprobar = (solicitud) => {
    setSolicitudAprobar(solicitud);
    setMostrarModalAprobar(true);
  };

  const handleAprobarSuccess = async (empleadoId, horaFin, observacion) => {
    try {
        const result = await solicitudesCitasApiService.aprobarSolicitudCita(
        solicitudAprobar.id,
        empleadoId,
        horaFin,
        observacion
        );

        if (result.success) {
          await alertService.success('¡Solicitud Aprobada!', 'La solicitud ha sido aprobada y se ha creado la cita automáticamente.');
          cargarSolicitudes(); // Recargar la lista
        setMostrarModalAprobar(false);
        setSolicitudAprobar(null);
        } else {
          await alertService.error('Error', result.message);
      }
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      await alertService.error('Error', 'Error al aprobar la solicitud');
    }
  };

  const handleRechazar = async (solicitud) => {
    try {
      const { value: motivo } = await Swal.fire({
        title: 'Rechazar Solicitud de Cita',
        text: `¿Estás seguro de rechazar la solicitud de ${solicitud.cliente?.nombre || 'este cliente'}?`,
        input: 'textarea',
        inputPlaceholder: 'Motivo del rechazo (opcional)',
        showCancelButton: true,
        confirmButtonText: 'Rechazar Solicitud',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626'
      });

      if (motivo !== undefined) {
        const result = await solicitudesCitasApiService.rechazarSolicitudCita(solicitud.id, motivo);

        if (result.success) {
          await alertService.success('Solicitud Rechazada', 'La solicitud ha sido rechazada exitosamente.');
          cargarSolicitudes(); // Recargar la lista
        } else {
          await alertService.error('Error', result.message);
        }
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      await alertService.error('Error', 'Error al rechazar la solicitud');
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-300 z-40">
        <div className="overflow-x-auto w-full">
          <table className="table-auto w-full divide-y divide-gray-100 text-sm text-gray-700 min-w-[800px]">
            <thead className="text-left text-sm text-gray-500 bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-bold text-center">Cliente</th>
                <th className="px-6 py-4 font-bold text-center">Fecha Solicitada</th>
                <th className="px-6 py-4 font-bold text-center">Hora</th>
                <th className="px-6 py-4 font-bold text-center">Tipo</th>
                <th className="px-6 py-4 font-bold text-center">Modalidad</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {solicitudes.length > 0 ? (
                solicitudes.map((solicitud, idx) => (
                  <tr key={solicitud.id}>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <StandardAvatar 
                          nombre={solicitud.cliente?.nombre || solicitud.cliente?.nombre_completo || 'N/A'}
                        />
                        <div className="text-left">
                          <div className="font-medium">{solicitud.cliente?.nombre || solicitud.cliente?.nombre_completo || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">{solicitud.cliente?.correo || solicitud.cliente?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{solicitud.fecha_solicitada || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{solicitud.hora_solicitada || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{solicitud.tipo || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{solicitud.modalidad || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${getEstadoBadge(solicitud.estado)}`}>
                        {solicitud.estado || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={() => onVer(idx)}
                          title="Ver detalle"
                          className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                          disabled={deshabilitarAcciones}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {solicitud.estado === 'Pendiente' && (
                          <>
                          <button
                              onClick={() => handleAprobar(solicitud)}
                              title="Aprobar Solicitud"
                            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                            disabled={deshabilitarAcciones}
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRechazar(solicitud)}
                              title="Rechazar Solicitud"
                              className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200"
                              disabled={deshabilitarAcciones}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                          </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-sm text-gray-500">
                    No hay solicitudes de citas registradas.
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

      {/* Modal Aprobar Solicitud */}
      {mostrarModalAprobar && solicitudAprobar && (
        <ModalAprobarSolicitud
          isOpen={mostrarModalAprobar}
          onClose={() => {
            setMostrarModalAprobar(false);
            setSolicitudAprobar(null);
          }}
          solicitud={solicitudAprobar}
          onSuccess={handleAprobarSuccess}
        />
      )}
    </>
  );
};

export default TablaSolicitudesCitas;