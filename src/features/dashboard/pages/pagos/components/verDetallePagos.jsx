import React, { useState } from "react";
import getEstadoPagoBadge from "../services/getEstadoPagoBadge";
import { useAuth } from '../../../../../shared/contexts/authContext';
import pagosApiService from '../services/pagosApiService';
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';

const VerDetallePago = ({ datos, isOpen, onClose }) => {
  const { getToken } = useAuth();
  const [descargando, setDescargando] = useState(false);

  if (!isOpen || !datos) return null;

  const { color, texto } = getEstadoPagoBadge(datos.estado);

  // Función para formatear valores
  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return value;
  };

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fecha;
    }
  };

  // Formatear fecha solo para fecha (sin hora)
  const formatearFechaCorta = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return fecha;
    }
  };

  // Descargar comprobante
  const handleDescargarComprobante = async () => {
    try {
      const token = getToken();
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay token de autenticación',
        });
        return;
      }

      const idPago = datos.id_pago || datos.id;
      if (!idPago) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo identificar el pago',
        });
        return;
      }

      setDescargando(true);
      Swal.fire({
        title: 'Descargando comprobante...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const { blob, filename } = await pagosApiService.descargarComprobante(idPago, token);
      saveAs(blob, filename);
      
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Comprobante descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('❌ [VerDetallePago] Error descargando comprobante:', err);
      Swal.close();
      
      let errorMessage = 'No se pudo descargar el comprobante. Por favor, intenta nuevamente.';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 404) {
        errorMessage = 'El comprobante no está disponible para este pago';
      } else if (err.status === 403) {
        errorMessage = 'No tienes permisos para descargar este comprobante';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setDescargando(false);
    }
  };

  const tieneComprobante = datos.numero_comprobante || datos.comprobante_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Información Principal del Pago */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <i className="bi bi-cash-stack text-blue-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información del Pago</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <i className="bi bi-currency-dollar text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-2xl">
                      ${(datos.monto || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">Monto del pago</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-calendar-check text-blue-500"></i>
                      <span className="text-gray-600">Fecha del Pago:</span>
                      <span className="font-medium text-gray-800">{formatearFecha(datos.fecha_pago)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-credit-card text-blue-500"></i>
                      <span className="text-gray-600">Método de Pago:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.metodo_pago)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-info-circle text-blue-500"></i>
                      <span className="text-gray-600">Estado:</span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ color, backgroundColor: color + '20' }}
                      >
                        {texto}
                      </span>
                    </div>
                    {datos.gateway && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-shield-check text-blue-500"></i>
                        <span className="text-gray-600">Gateway:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.gateway)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Orden y Referencias */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <i className="bi bi-receipt text-green-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Orden y Referencias</h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <i className="bi bi-file-earmark-text text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Orden de Servicio #{renderValue(datos.id_orden_servicio)}</div>
                    <div className="text-sm text-gray-500">ID de la orden asociada</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {datos.referencia && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-hash text-green-500"></i>
                        <span className="text-gray-600">Referencia:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.referencia)}</span>
                      </div>
                    )}
                    {datos.transaction_id && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-upc-scan text-green-500"></i>
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.transaction_id)}</span>
                      </div>
                    )}
                    {datos.numero_comprobante && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-pdf text-green-500"></i>
                        <span className="text-gray-600">Número de Comprobante:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.numero_comprobante)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Verificación */}
            {(datos.verified_at || datos.verified_by || datos.verification_method) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <i className="bi bi-check-circle text-purple-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información de Verificación</h3>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <i className="bi bi-shield-check text-purple-600 text-xl"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {datos.verification_method === 'automatic' ? 'Verificación Automática' : 
                         datos.verification_method === 'manual' ? 'Verificación Manual' : 
                         'Verificado'}
                      </div>
                      <div className="text-sm text-gray-500">Estado de verificación del pago</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {datos.verified_at && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-calendar-event text-purple-500"></i>
                          <span className="text-gray-600">Verificado el:</span>
                          <span className="font-medium text-gray-800">{formatearFecha(datos.verified_at)}</span>
                        </div>
                      )}
                      {datos.verified_by && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-person-check text-purple-500"></i>
                          <span className="text-gray-600">Verificado por (ID):</span>
                          <span className="font-medium text-gray-800">{renderValue(datos.verified_by)}</span>
                        </div>
                      )}
                      {datos.verification_method && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-gear text-purple-500"></i>
                          <span className="text-gray-600">Método de Verificación:</span>
                          <span className="font-medium text-gray-800">
                            {datos.verification_method === 'automatic' ? 'Automático' : 
                             datos.verification_method === 'manual' ? 'Manual' : 
                             renderValue(datos.verification_method)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comprobante - Sección de Descarga */}
            {tieneComprobante && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <i className="bi bi-file-earmark-pdf text-yellow-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Comprobante de Pago</h3>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <i className="bi bi-file-earmark-pdf text-yellow-600 text-xl"></i>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Comprobante disponible</div>
                        <div className="text-sm text-gray-500">
                          {datos.numero_comprobante ? `N° ${datos.numero_comprobante}` : 'Descargar comprobante PDF'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDescargarComprobante}
                      disabled={descargando}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <i className="bi bi-download"></i>
                      {descargando ? 'Descargando...' : 'Descargar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones */}
            {datos.observaciones && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <i className="bi bi-chat-left-text text-indigo-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Observaciones</h3>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{datos.observaciones}</p>
                </div>
              </div>
            )}

            {/* Información Adicional (Gateway Data) */}
            {datos.gateway_data && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <i className="bi bi-code-slash text-gray-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información del Gateway</h3>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-3 rounded border">
                    {typeof datos.gateway_data === 'string' 
                      ? datos.gateway_data 
                      : JSON.stringify(datos.gateway_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
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

export default VerDetallePago;
