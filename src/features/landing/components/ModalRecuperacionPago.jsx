import React, { useState } from 'react';
import BaseModal from '../../../shared/components/BaseModal';
import { AlertCircle, CheckCircle2, Clock, ArrowRight, X } from 'lucide-react';
import alertService from '../../../utils/alertService';
import { verificarSolicitudRecientePendiente, extraerInfoPago } from '../../../shared/utils/pagosPendientesUtils';
import { useNavigate } from 'react-router-dom';

/**
 * Modal de recuperación de pago después de un timeout
 * Permite verificar si la solicitud se creó y procesar el pago
 */
const ModalRecuperacionPago = ({ 
  isOpen, 
  onClose, 
  tipoSolicitud = null,
  onPagoEncontrado,
  onProcesarPago 
}) => {
  const [verificando, setVerificando] = useState(false);
  const [solicitudEncontrada, setSolicitudEncontrada] = useState(null);
  const [errorVerificacion, setErrorVerificacion] = useState(null);
  const navigate = useNavigate();

  // Verificar si hay solicitud pendiente al abrir el modal
  React.useEffect(() => {
    if (isOpen && !solicitudEncontrada && !verificando && !errorVerificacion) {
      handleVerificar();
    }
  }, [isOpen]);

  // Resetear estado al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      setSolicitudEncontrada(null);
      setErrorVerificacion(null);
      setVerificando(false);
    }
  }, [isOpen]);

  const handleVerificar = async () => {
    setVerificando(true);
    setErrorVerificacion(null);

    try {
      console.log('🔍 [ModalRecuperacionPago] Verificando solicitud reciente...');
      const solicitud = await verificarSolicitudRecientePendiente(tipoSolicitud);

      if (solicitud) {
        const infoPago = extraerInfoPago(solicitud);
        
        if (infoPago) {
          console.log('✅ [ModalRecuperacionPago] Solicitud encontrada:', infoPago);
          setSolicitudEncontrada(infoPago);
          
          // Notificar al componente padre si hay callback
          if (onPagoEncontrado) {
            onPagoEncontrado(infoPago);
          }
        } else {
          console.warn('⚠️ [ModalRecuperacionPago] Solicitud encontrada pero sin información de pago válida');
          setErrorVerificacion('Se encontró una solicitud pendiente, pero no se pudo obtener la información de pago. Por favor, ve a "Mis Procesos" para completar el pago.');
        }
      } else {
        console.log('ℹ️ [ModalRecuperacionPago] No se encontró solicitud reciente pendiente');
        setErrorVerificacion(null); // No es un error, simplemente no hay solicitud pendiente
      }
    } catch (error) {
      console.error('❌ [ModalRecuperacionPago] Error al verificar:', error);
      setErrorVerificacion('Hubo un error al verificar tu solicitud. Por favor, intenta nuevamente o ve a "Mis Procesos".');
    } finally {
      setVerificando(false);
    }
  };

  const handleProcesarPago = () => {
    if (!solicitudEncontrada) return;

    console.log('🔧 [ModalRecuperacionPago] Procesando pago para:', solicitudEncontrada);
    
    // Si hay callback personalizado, usarlo
    if (onProcesarPago) {
      onProcesarPago(solicitudEncontrada);
      onClose();
      return;
    }

    // Si no, navegar a Mis Procesos donde puede completar el pago
    onClose();
    navigate('/misprocesos');
  };

  const handleIrAMisProcesos = () => {
    onClose();
    navigate('/misprocesos');
  };

  const footerActions = [
    {
      label: 'Cerrar',
      onClick: onClose,
      variant: 'outline',
      icon: X
    }
  ];

  // Si hay solicitud encontrada, agregar botón de procesar pago
  if (solicitudEncontrada) {
    footerActions.push({
      label: verificando ? 'Procesando...' : 'Procesar Pago Ahora',
      onClick: handleProcesarPago,
      variant: 'success',
      icon: CheckCircle2,
      disabled: verificando
    });
  }

  // Si no se encontró solicitud, agregar botón para ir a Mis Procesos
  if (!verificando && !solicitudEncontrada && !errorVerificacion) {
    footerActions.push({
      label: 'Ir a Mis Procesos',
      onClick: handleIrAMisProcesos,
      variant: 'primary',
      icon: ArrowRight
    });
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Recuperar Pago Pendiente"
      subtitle="Verificando si tu solicitud se creó correctamente..."
      headerGradient="orange"
      headerIcon={<AlertCircle className="w-6 h-6 text-white" />}
      footerActions={footerActions}
      maxWidth="2xl"
      closeOnBackdropClick={!verificando}
      closeOnEscape={!verificando}
    >
      <div className="space-y-6 py-4">
        {/* Estado: Verificando */}
        {verificando && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-700 font-medium text-center">
              Verificando si tu solicitud se creó correctamente...
            </p>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Esto puede tardar unos segundos
            </p>
          </div>
        )}

        {/* Estado: Solicitud encontrada */}
        {!verificando && solicitudEncontrada && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-800 mb-2">
                    ¡Solicitud encontrada!
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Tu solicitud se creó correctamente y está pendiente de pago. Puedes completar el pago ahora para activarla.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 space-y-2 border border-green-100">
                    {solicitudEncontrada.nombreMarca && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Marca:</span>
                        <span className="text-gray-800 font-semibold">{solicitudEncontrada.nombreMarca}</span>
                      </div>
                    )}
                    {solicitudEncontrada.expediente && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Expediente:</span>
                        <span className="text-gray-800 font-semibold">{solicitudEncontrada.expediente}</span>
                      </div>
                    )}
                    {solicitudEncontrada.servicio && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Servicio:</span>
                        <span className="text-gray-800 font-semibold">{solicitudEncontrada.servicio}</span>
                      </div>
                    )}
                    {solicitudEncontrada.monto_a_pagar && (
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-700 font-bold">Monto a pagar:</span>
                        <span className="text-green-700 font-bold text-lg">
                          ${solicitudEncontrada.monto_a_pagar.toLocaleString('es-CO')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estado: Error en verificación */}
        {!verificando && errorVerificacion && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Error al verificar
                </h3>
                <p className="text-gray-700">
                  {errorVerificacion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado: No se encontró solicitud */}
        {!verificando && !solicitudEncontrada && !errorVerificacion && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">
                    No se encontró solicitud reciente
                  </h3>
                  <p className="text-gray-700 mb-4">
                    No se encontró ninguna solicitud pendiente de pago creada en los últimos minutos. Esto puede significar que:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                    <li>La solicitud no se creó debido al timeout</li>
                    <li>La solicitud ya fue procesada o está en otro estado</li>
                    <li>Necesitas crear una nueva solicitud</li>
                  </ul>
                  <p className="text-gray-600 text-sm font-medium">
                    Puedes revisar todas tus solicitudes pendientes de pago en "Mis Procesos"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Si tienes solicitudes pendientes de pago, puedes encontrarlas y completarlas en cualquier momento desde la sección "Pagos Pendientes" en "Mis Procesos".
          </p>
        </div>
      </div>
    </BaseModal>
  );
};

export default ModalRecuperacionPago;

