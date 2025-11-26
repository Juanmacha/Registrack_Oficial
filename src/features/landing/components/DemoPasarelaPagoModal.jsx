import React, { useState } from 'react';
import { usePayments } from '../../../shared/contexts/PaymentContext';
import { generarComprobantePDF } from '../../../shared/utils/generarComprobantePDF';
import { useNavigate } from 'react-router-dom';
import { PaymentService } from '../../../utils/mockDataService';

const DemoPasarelaPagoModal = ({ isOpen, onClose, monto, datosPago, onPagoExitoso }) => {
  const [pagando, setPagando] = useState(false);
  const [exito, setExito] = useState(false);
  const [pagoRealizado, setPagoRealizado] = useState(null);
  const { registrarPago } = usePayments();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // ✅ NUEVO: Procesar pago con la API real
  const handlePagar = async () => {
    setPagando(true);
    try {
      // Si hay una función onPagoExitoso, usarla (procesa el pago con la API real)
      if (onPagoExitoso) {
        console.log('🔧 [DemoPasarelaPagoModal] Procesando pago con API real...');
        await onPagoExitoso();
        // Si llegamos aquí sin errores, el pago fue exitoso
        // El modal se cerrará automáticamente desde handleProcesarPago
        // Solo actualizamos el estado local para mostrar éxito si no se cierra
        setExito(true);
        setPagando(false);
        
        // Crear objeto de pago para mostrar en el modal
        const pago = {
          ...datosPago,
          monto,
          fechaPago: new Date().toLocaleDateString(),
          valorTotal: monto,
          gastoLegal: datosPago.gastoLegal || '928.000,00 COP',
          honorarios: datosPago.honorarios || '920.000,00 COP',
          numeroTransaccion: Math.floor(Math.random() * 1000000000),
        };
        setPagoRealizado(pago);
        registrarPago(pago);
        
        // Guardar el pago en el almacenamiento local
        PaymentService.create({
          monto: pago.valorTotal,
          metodo_pago: 'Tarjeta',
          estado: true,
          id_orden_servicio: datosPago.orden_id || '4',
          fecha_pago: new Date().toISOString(),
          comprobante_url: '#',
        });
      } else {
        // Modo legacy: simulación de pago (solo si no hay onPagoExitoso)
        setTimeout(() => {
          setExito(true);
          setPagando(false);
          const pago = {
            ...datosPago,
            monto,
            fechaPago: new Date().toLocaleDateString(),
            valorTotal: monto,
            gastoLegal: datosPago.gastoLegal || '928.000,00 COP',
            honorarios: datosPago.honorarios || '920.000,00 COP',
            numeroTransaccion: Math.floor(Math.random() * 1000000000),
            servicioOposicion: datosPago.servicioOposicion || '4',
            nombreMarca: datosPago.nombreMarca || 'Certimarcas',
            nombreRepresentante: datosPago.nombreRepresentante || 'Jorge Vanegas',
            tipoDocumento: datosPago.tipoDocumento || 'CC',
            numeroDocumento: datosPago.numeroDocumento || '1021804359',
          };
          setPagoRealizado(pago);
          registrarPago(pago);
          
          PaymentService.create({
            monto: pago.valorTotal,
            metodo_pago: 'Demo',
            estado: true,
            id_orden_servicio: pago.servicioOposicion || '4',
            fecha_pago: new Date().toISOString(),
            comprobante_url: '#',
            nombreMarca: pago.nombreMarca,
            nombreRepresentante: pago.nombreRepresentante,
            tipoDocumento: pago.tipoDocumento,
            numeroDocumento: pago.numeroDocumento,
            gastoLegal: pago.gastoLegal,
            honorarios: pago.honorarios,
            numeroTransaccion: pago.numeroTransaccion
          });
        }, 1800);
      }
    } catch (error) {
      console.error('❌ [DemoPasarelaPagoModal] Error al procesar pago:', error);
      setPagando(false);
      // El error ya fue manejado en handleProcesarPago, pero si hay error aquí, lanzarlo
      throw error;
    }
  };

  const handleDescargarComprobante = () => {
    if (pagoRealizado) {
      generarComprobantePDF({
        servicioOposicion: pagoRealizado.servicioOposicion,
        nombreMarca: pagoRealizado.nombreMarca,
        nombreRepresentante: pagoRealizado.nombreRepresentante,
        tipoDocumento: pagoRealizado.tipoDocumento,
        numeroDocumento: pagoRealizado.numeroDocumento,
        fechaPago: pagoRealizado.fechaPago,
        valorTotal: pagoRealizado.valorTotal,
        gastoLegal: pagoRealizado.gastoLegal,
        honorarios: pagoRealizado.honorarios,
        numeroTransaccion: pagoRealizado.numeroTransaccion,
      });
    }
  };

  const handleIrMisProcesos = () => {
    onClose();
    navigate('/dashboard/misProcesos');
  };

  // Función para formatear el monto con separadores de miles (formato colombiano)
  const formatearMonto = (valor) => {
    if (!valor) return '0';
    const numero = typeof valor === 'number' ? valor : parseFloat(valor);
    return numero.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative transform transition-all duration-300 scale-100 opacity-100">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          disabled={pagando}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 disabled:opacity-50 bg-white rounded-full p-1 shadow-sm hover:bg-gray-50"
          aria-label="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!exito ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-5 py-4 text-white">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="bg-white/20 rounded-full p-1.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Pasarela de Pago</h2>
              </div>
              <p className="text-green-100 text-xs">Proceso seguro y confiable</p>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Contenedores lado a lado */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Información del pago */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Resumen del pago</h3>
                  <div className="space-y-2.5">
                    {datosPago?.servicio && (
                      <div>
                        <span className="text-gray-500 text-xs block mb-0.5">Servicio:</span>
                        <span className="font-semibold text-gray-800 text-xs">{datosPago.servicio}</span>
                      </div>
                    )}
                    {datosPago?.nombreMarca && (
                      <div>
                        <span className="text-gray-500 text-xs block mb-0.5">Marca:</span>
                        <span className="font-semibold text-gray-800 text-xs line-clamp-1">{datosPago.nombreMarca}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2.5 mt-2.5">
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-xs mb-1">Total a pagar:</span>
                        <span className="text-lg font-bold text-green-700">
                          ${formatearMonto(monto)}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">COP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métodos de pago (simulado) */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Método de pago</p>
                  <div className="flex flex-col gap-2 p-2.5 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-1.5 rounded shadow-sm">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-xs leading-tight">Tarjeta de crédito o débito</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">Pago seguro con encriptación SSL</p>
                  </div>
                </div>
              </div>

              {/* Botón verde abajo */}
              <div className="space-y-2.5">
                <button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 px-6 rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePagar();
                  }}
                  disabled={pagando}
                  type="button"
                >
                  {pagando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando pago...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirmar y pagar</span>
                    </>
                  )}
                </button>
                <button
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-2.5 text-sm transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                  disabled={pagando}
                  type="button"
                >
                  Cancelar
                </button>
              </div>

              {/* Información de seguridad */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4 mt-4 border-t border-gray-200">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Pago seguro y encriptado</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Vista de éxito */}
            <div className="p-6">
              {/* Icono de éxito animado */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-green-100 rounded-full p-4 mb-4 transform transition-all duration-500 scale-100">
                  <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">¡Pago realizado con éxito!</h2>
                <p className="text-gray-600 text-center">Tu transacción se ha procesado correctamente.</p>
              </div>

              {/* Información del pago realizado */}
              {pagoRealizado && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Detalles de la transacción</h3>
                  <div className="space-y-2 text-sm">
                    {pagoRealizado.numeroTransaccion && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Número de transacción:</span>
                        <span className="font-mono font-semibold text-gray-800">{pagoRealizado.numeroTransaccion}</span>
                      </div>
                    )}
                    {pagoRealizado.fechaPago && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-semibold text-gray-800">{pagoRealizado.fechaPago}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-700 font-semibold">Monto pagado:</span>
                      <span className="text-lg font-bold text-green-700">
                        ${formatearMonto(pagoRealizado.valorTotal || monto)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  onClick={handleDescargarComprobante}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar comprobante PDF
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={handleIrMisProcesos}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ver estado de mi solicitud
                </button>
                <button
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 text-sm transition-colors"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoPasarelaPagoModal;