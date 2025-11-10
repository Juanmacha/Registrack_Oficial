import React, { useState } from 'react';
import Timeline from './Timeline.jsx';
import { obtenerFechaCreacion, obtenerFechaSolicitud } from '../services/procesosService.js';
import { PAISES } from '../../../../../shared/utils/paises.js';
import { usePayments } from '../../../../../shared/contexts/PaymentContext';
import { generarComprobantePDF } from '../../../../../shared/utils/generarComprobantePDF';

// Componente para mostrar el modal de historial de pagos
const HistorialPagosModal = ({ proceso, isOpen, onClose }) => {
  if (!isOpen || !proceso) return null;
  
  const { pagos } = usePayments();
  
  // Buscar pagos asociados al proceso por nombreMarca, tipoDocumento y numeroDocumento
  const pagosAsociados = pagos.filter(p =>
    p.nombreMarca === proceso.nombreMarca &&
    p.tipoDocumento === proceso.tipoDocumento &&
    p.numeroDocumento === proceso.numeroDocumento
  );
  
  const handleDescargarComprobante = (pago) => {
    generarComprobantePDF({
      servicioOposicion: pago.servicioOposicion,
      nombreMarca: pago.nombreMarca,
      nombreRepresentante: pago.nombreRepresentante,
      tipoDocumento: pago.tipoDocumento,
      numeroDocumento: pago.numeroDocumento,
      fechaPago: pago.fechaPago,
      valorTotal: pago.valorTotal,
      gastoLegal: pago.gastoLegal,
      honorarios: pago.honorarios,
      numeroTransaccion: pago.numeroTransaccion,
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-80 backdrop-blur-sm" style={{margin: 0, padding: 0}}>
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-8 relative border border-green-200 max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-700 hover:text-red-600 text-sm font-medium focus:outline-none bg-white border border-gray-300 rounded-lg shadow px-3 py-1 transition-colors" aria-label="Cerrar">Cerrar</button>
        
        <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2">
          <i className="bi bi-cash-coin text-green-600"></i>
          Historial de Pagos
        </h2>
        
        <div className="mb-4">
          <div><span className="font-semibold">Marca:</span> {proceso.nombreMarca || '-'}</div>
          <div><span className="font-semibold">Expediente:</span> {proceso.expediente || '-'}</div>
          <div><span className="font-semibold">Tipo de Solicitud:</span> {proceso.tipoSolicitud || '-'}</div>
        </div>
        
        {pagosAsociados.length > 0 ? (
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-sm rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 font-semibold border-b">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Transacción</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagosAsociados.map((pago, index) => (
                  <tr key={pago.numeroTransaccion || index} className="border-b hover:bg-green-50">
                    <td className="px-4 py-3">{pago.fechaPago}</td>
                    <td className="px-4 py-3 font-semibold">${pago.valorTotal?.toLocaleString?.() || ''}</td>
                    <td className="px-4 py-3">Demo</td>
                    <td className="px-4 py-3">{pago.numeroTransaccion}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDescargarComprobante(pago)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <i className="bi bi-download"></i> Comprobante
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No se encontraron pagos asociados a este proceso.
          </div>
        )}
      </div>
    </div>
  );
};

const ProcesosActivos = ({ procesos, servicios }) => {
  const [modalPagosAbierto, setModalPagosAbierto] = useState(false);
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  
  // Función para mostrar el modal de historial de pagos
  const mostrarHistorialPagos = (proceso) => {
    setProcesoSeleccionado(proceso);
    setModalPagosAbierto(true);
  };
  
  // Función para cerrar el modal de historial de pagos
  const cerrarHistorialPagos = () => {
    setModalPagosAbierto(false);
    setProcesoSeleccionado(null);
  };
  
  // Función para obtener el nombre del estado actual
  const obtenerNombreEstado = (servicio, estadoActual) => {
    if (!servicio || !servicio.process_states) return estadoActual || '-';
    
    // Mapeo de estados comunes
    const estadoMapping = {
      'En revisión': 'en_proceso',
      'Pendiente': 'recibida', 
      'En proceso': 'en_proceso',
      'Finalizado': 'finalizado',
      'Aprobado': 'aprobado',
      'Rechazado': 'rechazado',
      'Anulado': 'anulado'
    };

    // Buscar por nombre exacto
    let estadoEncontrado = servicio.process_states.find(e => e.name === estadoActual);
    
    // Si no se encuentra, buscar por status_key
    if (!estadoEncontrado) {
      estadoEncontrado = servicio.process_states.find(e => e.status_key === estadoActual);
    }
    
    // Si no se encuentra, buscar por mapeo
    if (!estadoEncontrado) {
      const statusKeyMapeado = estadoMapping[estadoActual];
      if (statusKeyMapeado) {
        estadoEncontrado = servicio.process_states.find(e => e.status_key === statusKeyMapeado);
      }
    }

    return estadoEncontrado ? estadoEncontrado.name : estadoActual || '-';
  };

  return (
    <div className="space-y-10">
      {procesos.map((proc) => {
        const servicio = servicios.find(s => s && s.nombre === proc.tipoSolicitud);
        const estados = servicio?.process_states || [];
        const nombreEstadoActual = obtenerNombreEstado(servicio, proc.estado);
        
        // Buscar país y bandera
        const paisObj = PAISES.find(p => p.nombre === proc.pais);
        return (
          <div key={proc.id || proc.expediente || Math.random()} className="rounded-2xl shadow-lg border border-gray-200 bg-gray-50">
            {/* Encabezado azul claro */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-8 py-4 rounded-t-2xl" style={{background: '#f4f8ff'}}>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xl font-bold text-blue-800">
                  {proc.nombreMarca || 'Sin marca'}
                  {paisObj && (
                    <img src={paisObj.bandera} alt={paisObj.nombre} title={paisObj.nombre} className="w-7 h-5 rounded shadow border border-gray-300" />
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium">Expediente: <span className="font-normal">{proc.expediente || '-'}</span></div>
                <div className="text-sm text-gray-600 font-medium">Servicio: <span className="font-normal">{proc.tipoSolicitud || '-'}</span></div>
                <div className="text-sm text-gray-600 font-medium">Representante: <span className="font-normal">{proc.nombreCompleto || proc.titular || '-'}</span></div>
                {proc.encargado && proc.encargado !== 'Sin asignar' && (
                  <div className="text-sm text-gray-600 font-medium">
                    Encargado: <span className="font-normal text-blue-700">{proc.encargado}</span>
                  </div>
                )}
                <div className="text-sm text-gray-600 font-medium">Fecha de creación: <span className="font-normal">{obtenerFechaCreacion(proc)}</span></div>
              </div>
              {/* Estado actual centrado entre los dos bloques */}
              <div className="flex-1 flex justify-center items-center min-w-0">
                <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shadow inline-block whitespace-nowrap">
                  Estado actual: {nombreEstadoActual}
                </div>
              </div>
              <div className="text-right flex-1 min-w-0">
                <div className="text-xs text-gray-500 font-semibold">Última actualización</div>
                <div className="text-2xl font-bold text-blue-900">{obtenerFechaSolicitud(proc)}</div>
              </div>
            </div>
            {/* Línea de tiempo y estado */}
            <div className="px-8 pt-2 pb-2">
              <Timeline
                estados={estados}
                estadoActual={proc.estado || ''}
                esHistorial={false}
              />
            </div>
            {/* Detalles del proceso actual */}
            <div className="bg-white rounded-b-2xl px-8 py-6 border-t border-gray-100">
              <div className="font-semibold text-gray-700 mb-2">Detalles del proceso actual</div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div>Etapa actual: <span className="font-bold text-blue-700">{nombreEstadoActual}</span></div>
                  <div>Próxima acción: <span className="font-bold text-gray-800">Revisión de documentos</span></div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div>Tiempo estimado: <span className="font-bold">15-30 días</span></div>
                  <div>Responsable: <span className="font-bold text-gray-800">
                    {proc.encargado && proc.encargado !== 'Sin asignar' ? proc.encargado : 'Sin asignar'}
                  </span></div>
                </div>
                {/* Botón de historial de pagos alineado a la derecha */}
                <div className="flex justify-end md:justify-center items-center mt-4 md:mt-0">
                  <button
                    className="px-4 py-2 rounded-lg bg-white border border-green-600 text-green-700 font-semibold shadow-sm hover:bg-green-50 hover:border-green-700 transition-all text-sm flex items-center gap-2"
                    onClick={() => mostrarHistorialPagos(proc)}
                  >
                    <i className="bi bi-cash-coin"></i>
                    Ver historial de pagos
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Modal de historial de pagos */}
      <HistorialPagosModal 
        proceso={procesoSeleccionado} 
        isOpen={modalPagosAbierto} 
        onClose={cerrarHistorialPagos} 
      />
    </div>
  );
};

export default ProcesosActivos;