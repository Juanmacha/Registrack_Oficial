import React, { useState, useEffect } from 'react';
import Timeline from './Timeline.jsx';
import { obtenerFechaCreacion, obtenerFechaSolicitud } from '../services/procesosService.js';
import { PAISES } from '../../../../../shared/utils/paises.js';
import { usePayments } from '../../../../../shared/contexts/PaymentContext';
import { generarComprobantePDF } from '../../../../../shared/utils/generarComprobantePDF';
import seguimientoApiService from '../../gestionVentasServicios/services/seguimientoApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';

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

// Componente para mostrar el modal de seguimientos
const SeguimientosModal = ({ proceso, isOpen, onClose }) => {
  const { getToken } = useAuth();
  const [seguimientos, setSeguimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && proceso) {
      cargarSeguimientos();
    } else {
      // Limpiar estado al cerrar
      setSeguimientos([]);
      setError(null);
    }
  }, [isOpen, proceso]);

  const cargarSeguimientos = async () => {
    if (!proceso) return;

    // Obtener id_orden_servicio del proceso
    const idOrdenServicio = proceso.id_orden_servicio || proceso.idOrdenServicio || proceso.id;
    
    if (!idOrdenServicio) {
      setError('No se pudo identificar la orden de servicio');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError('No se pudo obtener el token de autenticación');
        return;
      }

      console.log('🔧 [SeguimientosModal] Cargando seguimientos para orden:', idOrdenServicio);
      const seguimientosData = await seguimientoApiService.getSeguimientosCliente(idOrdenServicio, token);
      console.log('✅ [SeguimientosModal] Seguimientos cargados:', seguimientosData);
      
      const seguimientosArray = Array.isArray(seguimientosData) ? seguimientosData : [];
      // Ordenar por fecha (más reciente primero)
      seguimientosArray.sort((a, b) => {
        const fechaA = new Date(a.fecha_registro || a.fecha_creacion || a.fecha || 0);
        const fechaB = new Date(b.fecha_registro || b.fecha_creacion || b.fecha || 0);
        return fechaB - fechaA;
      });
      setSeguimientos(seguimientosArray);
    } catch (err) {
      console.error('❌ [SeguimientosModal] Error cargando seguimientos:', err);
      setError(err.message || 'Error al cargar los seguimientos');
      setSeguimientos([]);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return '-';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  const obtenerNombreUsuario = (seguimiento) => {
    const usuario = seguimiento.usuario_registro || seguimiento.empleado || {};
    if (usuario.nombre && usuario.apellido) {
      return `${usuario.nombre} ${usuario.apellido}`;
    }
    if (usuario.nombre_completo) {
      return usuario.nombre_completo;
    }
    if (usuario.nombre) {
      return usuario.nombre;
    }
    if (usuario.correo) {
      return usuario.correo;
    }
    return 'Usuario no identificado';
  };

  const tieneDocumentosAdjuntos = (seguimiento) => {
    const docs = seguimiento.documentos_adjuntos;
    return docs && docs !== null && docs !== '' && docs !== 'null';
  };

  if (!isOpen || !proceso) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-80 backdrop-blur-sm" style={{margin: 0, padding: 0}}>
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full p-6 relative border border-blue-200 max-h-[95vh] overflow-hidden flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-700 hover:text-red-600 text-sm font-medium focus:outline-none bg-white border border-gray-300 rounded-lg shadow px-3 py-1 transition-colors z-10" 
          aria-label="Cerrar"
        >
          <i className="bi bi-x-lg"></i> Cerrar
        </button>
        
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2 text-blue-800 flex items-center gap-2">
            <i className="bi bi-clock-history text-blue-600"></i>
            Seguimientos de la Solicitud
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <div><span className="font-semibold">Marca:</span> {proceso.nombreMarca || '-'}</div>
            <div><span className="font-semibold">Expediente:</span> {proceso.expediente || '-'}</div>
            <div><span className="font-semibold">Servicio:</span> {proceso.tipoSolicitud || '-'}</div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {cargando ? (
            <div className="text-center py-12 flex-1 flex items-center justify-center">
              <div>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando seguimientos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 flex-1 flex items-center justify-center">
              <div>
                <i className="bi bi-exclamation-triangle text-4xl mb-4"></i>
                <p className="font-semibold">Error al cargar seguimientos</p>
                <p className="text-sm mt-2">{error}</p>
                <button
                  onClick={cargarSeguimientos}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : seguimientos.length > 0 ? (
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="space-y-4">
                {seguimientos.map((seguimiento, index) => {
                  const fecha = seguimiento.fecha_registro || seguimiento.fecha_creacion || seguimiento.fecha;
                  const tieneDocs = tieneDocumentosAdjuntos(seguimiento);
                  const usuario = seguimiento.usuario_registro || seguimiento.empleado || {};
                  const idSeguimiento = seguimiento.id_seguimiento || seguimiento.id;
                  
                  return (
                    <div 
                      key={idSeguimiento || index} 
                      className="border border-gray-200 rounded-lg p-5 hover:bg-blue-50 transition-colors bg-white shadow-sm"
                    >
                      {/* Encabezado con título y fecha */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {seguimiento.titulo || seguimiento.título || 'Sin título'}
                            </h3>
                            {tieneDocs && (
                              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                <i className="bi bi-paperclip"></i>
                                Documentos
                              </span>
                            )}
                            {seguimiento.nuevo_estado && (
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                <i className="bi bi-arrow-right-circle mr-1"></i>
                                {seguimiento.nuevo_estado}
                              </span>
                            )}
                            {idSeguimiento && (
                              <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded">
                                ID: {idSeguimiento}
                              </span>
                            )}
                          </div>
                          
                          {/* Información detallada del usuario y fecha */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <i className="bi bi-calendar3 text-blue-600"></i>
                                <span className="font-semibold">Fecha:</span>
                                <span>{formatearFecha(fecha)}</span>
                              </div>
                              {formatearFechaCorta(fecha) !== '-' && (
                                <div className="flex items-center gap-2 ml-6 text-gray-500">
                                  <span className="text-xs">{formatearFechaCorta(fecha)}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <i className="bi bi-person text-blue-600"></i>
                                <span className="font-semibold">Registrado por:</span>
                                <span>{obtenerNombreUsuario(seguimiento)}</span>
                              </div>
                              {usuario.correo && (
                                <div className="flex items-center gap-2 ml-6 text-gray-500">
                                  <i className="bi bi-envelope text-xs"></i>
                                  <span className="text-xs">{usuario.correo}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      {seguimiento.descripcion && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-file-text text-blue-600"></i>
                            <span className="text-xs font-semibold text-gray-700">Descripción:</span>
                          </div>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed pl-6">
                            {seguimiento.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Observaciones */}
                      {seguimiento.observaciones && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-chat-left-text text-blue-600"></i>
                            <span className="text-xs font-semibold text-gray-700">Observaciones:</span>
                          </div>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed pl-6">
                            {seguimiento.observaciones}
                          </p>
                        </div>
                      )}

                      {/* Cambio de estado */}
                      {(seguimiento.nuevo_estado || seguimiento.estado_anterior) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-arrow-repeat text-blue-600"></i>
                            <span className="text-xs font-semibold text-gray-700">Cambio de Estado:</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs pl-6">
                            {seguimiento.estado_anterior && (
                              <div className="flex items-center gap-2">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded font-medium">
                                  {seguimiento.estado_anterior}
                                </span>
                                <span className="text-gray-400 text-xs">Estado anterior</span>
                              </div>
                            )}
                            {seguimiento.estado_anterior && seguimiento.nuevo_estado && (
                              <i className="bi bi-arrow-right text-gray-400 text-lg"></i>
                            )}
                            {seguimiento.nuevo_estado && (
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded font-semibold">
                                  {seguimiento.nuevo_estado}
                                </span>
                                <span className="text-blue-600 text-xs font-medium">Nuevo estado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 flex-1 flex items-center justify-center">
              <div>
                <i className="bi bi-inbox text-4xl mb-4"></i>
                <p className="font-medium">No se encontraron seguimientos para esta solicitud.</p>
                <p className="text-sm mt-2">Los seguimientos aparecerán aquí cuando se agreguen actualizaciones.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProcesosActivos = ({ procesos, servicios }) => {
  const [modalPagosAbierto, setModalPagosAbierto] = useState(false);
  const [modalSeguimientosAbierto, setModalSeguimientosAbierto] = useState(false);
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

  // Función para mostrar el modal de seguimientos
  const mostrarSeguimientos = (proceso) => {
    setProcesoSeleccionado(proceso);
    setModalSeguimientosAbierto(true);
  };

  // Función para cerrar el modal de seguimientos
  const cerrarSeguimientos = () => {
    setModalSeguimientosAbierto(false);
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
                {/* Botones de acciones alineados a la derecha */}
                <div className="flex flex-col md:flex-row justify-end md:justify-center items-center gap-2 mt-4 md:mt-0">
                  <button
                    className="px-4 py-2 rounded-lg bg-white border border-blue-600 text-blue-700 font-semibold shadow-sm hover:bg-blue-50 hover:border-blue-700 transition-all text-sm flex items-center gap-2"
                    onClick={() => mostrarSeguimientos(proc)}
                  >
                    <i className="bi bi-clock-history"></i>
                    Ver seguimientos
                  </button>
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
      
      {/* Modal de seguimientos */}
      <SeguimientosModal 
        proceso={procesoSeleccionado} 
        isOpen={modalSeguimientosAbierto} 
        onClose={cerrarSeguimientos} 
      />
    </div>
  );
};

export default ProcesosActivos;