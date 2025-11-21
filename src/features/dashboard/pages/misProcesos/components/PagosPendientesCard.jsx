import React, { useState } from 'react';
import BaseModal from '../../../../../shared/components/BaseModal';
import DemoPasarelaPagoModal from '../../../../landing/components/DemoPasarelaPagoModal';
import { CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import alertService from '../../../../../utils/alertService';
import { extraerInfoPago } from '../../../../../shared/utils/pagosPendientesUtils';

/**
 * Componente para mostrar una tarjeta de solicitud pendiente de pago
 * Permite procesar el pago directamente desde Mis Procesos
 */
const PagosPendientesCard = ({ proceso, onPagoExitoso }) => {
  const [mostrarPasarela, setMostrarPasarela] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [infoPago, setInfoPago] = useState(null);

  // Extraer información de pago
  React.useEffect(() => {
    if (proceso) {
      const info = extraerInfoPago(proceso);
      if (info) {
        setInfoPago(info);
      }
    }
  }, [proceso]);

  const handleProcesarPago = async () => {
    if (!infoPago || !infoPago.orden_id) {
      await alertService.error(
        'Error',
        'No se pudo obtener la información de pago de esta solicitud. Por favor, contacta al soporte.'
      );
      return;
    }

    console.log('🔧 [PagosPendientesCard] Abriendo pasarela de pago para:', infoPago);
    
    // Si no hay monto pero hay orden_id, el backend calculará el monto automáticamente
    if (!infoPago.monto_a_pagar) {
      console.warn('⚠️ [PagosPendientesCard] No se encontró monto, pero el backend lo calculará automáticamente desde total_estimado');
    }
    
    setMostrarPasarela(true);
  };

  // ✅ Handler para procesar el pago real usando la API (similar a hero.jsx)
  const handlePagoExitoso = async () => {
    if (!infoPago || !infoPago.orden_id) {
      await alertService.error('Error', 'No hay información de pago disponible.');
      setMostrarPasarela(false);
      return;
    }

    setProcesandoPago(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await alertService.error('Error', 'No hay sesión activa. Por favor, inicia sesión.');
        setProcesandoPago(false);
        setMostrarPasarela(false);
        return;
      }

      const API_CONFIG = await import('../../../../../shared/config/apiConfig.js');
      const baseURL = API_CONFIG.default?.BASE_URL || API_CONFIG.BASE_URL || 
                     (import.meta.env.DEV ? '' : 'https://api-registrack-2.onrender.com');

      const ordenId = Number(infoPago.orden_id);
      if (isNaN(ordenId) || ordenId <= 0) {
        throw new Error(`ID de orden inválido: ${infoPago.orden_id}`);
      }

      // ✅ El backend calcula el monto automáticamente desde total_estimado de la orden
      const requestBody = {
        id_orden_servicio: ordenId,
        metodo_pago: 'Tarjeta'
      };

      console.log('🔧 [PagosPendientesCard] Procesando pago con body:', requestBody);

      const response = await fetch(`${baseURL}/api/gestion-pagos/process-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const resultado = await response.json();

      if (!response.ok) {
        let errorMessage = resultado.mensaje || resultado.message || 'Error al procesar el pago';
        
        if (resultado.error) {
          if (typeof resultado.error === 'string') {
            errorMessage = resultado.error;
          } else if (resultado.error.message) {
            errorMessage = resultado.error.message;
          }
        }

        throw new Error(errorMessage);
      }

      // Verificar si la solicitud fue activada
      const solicitudActivada = 
        resultado.data?.solicitud_activada || 
        resultado.data?.payment?.solicitud_activada ||
        resultado.solicitud_activada ||
        resultado.data?.solicitudActivada ||
        resultado.success === true;

      console.log('✅ [PagosPendientesCard] Pago procesado:', { solicitudActivada, resultado });

      await alertService.success(
        'Pago Procesado Exitosamente',
        solicitudActivada 
          ? 'Tu solicitud ha sido activada y está en proceso. Se han enviado notificaciones por email.'
          : 'El pago fue procesado exitosamente. Verifica el estado de tu solicitud.'
      );

      // Cerrar modal y refrescar datos
      setMostrarPasarela(false);
      setInfoPago(null);
      
      // Notificar al componente padre para refrescar los datos
      if (onPagoExitoso) {
        onPagoExitoso();
      }
      
      // Recargar página después de un breve delay para mostrar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('❌ [PagosPendientesCard] Error al procesar pago:', error);
      await alertService.error(
        'Error al procesar pago',
        `No se pudo procesar el pago: ${error.message}. Por favor, intenta de nuevo o contacta al soporte.`
      );
      setProcesandoPago(false);
      // No cerrar el modal si hay error para que el usuario pueda intentar nuevamente
    }
  };


  if (!proceso || !infoPago) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 hover:border-orange-300 transition-all duration-200 overflow-hidden">
        <div className="p-6">
          {/* Header con icono y estado */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {proceso.nombreMarca || proceso.nombre_marca || proceso.marca_a_buscar || 'Sin marca'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {proceso.tipoSolicitud || proceso.tipo_solicitud || proceso.servicio?.nombre || 'Sin servicio'}
                </p>
              </div>
            </div>
            <div className="bg-orange-100 px-3 py-1 rounded-full">
              <span className="text-xs font-semibold text-orange-700">Pendiente de Pago</span>
            </div>
          </div>

          {/* Información de la solicitud */}
          <div className="space-y-2 mb-4">
            {proceso.expediente && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Expediente:</span>
                <span className="text-gray-800 font-semibold">{proceso.expediente}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-bold">Monto a pagar:</span>
              <span className="text-orange-700 font-bold text-lg">
                {infoPago.monto_a_pagar 
                  ? `$${infoPago.monto_a_pagar.toLocaleString('es-CO')}`
                  : <span className="text-gray-500 italic text-sm">Se calculará automáticamente</span>
                }
              </span>
            </div>
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleProcesarPago}
            disabled={procesandoPago}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {procesandoPago ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Completar Pago Ahora
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de pasarela de pago */}
      {mostrarPasarela && infoPago && (
        <DemoPasarelaPagoModal
          isOpen={mostrarPasarela}
          onClose={() => {
            setMostrarPasarela(false);
            setProcesandoPago(false);
          }}
          monto={infoPago.monto_a_pagar || 0} // Si no hay monto, usar 0 (el backend lo calculará)
          datosPago={{
            orden_id: infoPago.orden_id,
            servicio: infoPago.servicio,
            nombreMarca: proceso.nombreMarca || proceso.nombre_marca || proceso.marca_a_buscar
          }}
          onPagoExitoso={handlePagoExitoso} // Este handler ahora procesa el pago realmente
        />
      )}
    </>
  );
};

/**
 * Componente para mostrar la sección de pagos pendientes
 */
export const PagosPendientesSection = ({ procesos, servicios, onRefresh }) => {
  // Filtrar procesos pendientes de pago
  const procesosPendientes = React.useMemo(() => {
    if (!Array.isArray(procesos)) return [];
    
    return procesos.filter(proceso => {
      const estado = proceso.estado || proceso.estado_actual || proceso.status || '';
      const estadoLower = estado.toLowerCase();
      return estadoLower.includes('pendiente') && 
             (estadoLower.includes('pago') || estadoLower.includes('payment'));
    });
  }, [procesos]);

  if (procesosPendientes.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-t-xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pagos Pendientes</h2>
            <p className="text-orange-100 text-sm mt-1">
              Tienes {procesosPendientes.length} solicitud{procesosPendientes.length !== 1 ? 'es' : ''} pendiente{procesosPendientes.length !== 1 ? 's' : ''} de pago
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-b-xl p-6 border-2 border-t-0 border-orange-200">
        <p className="text-gray-700 mb-4 text-sm">
          Completa el pago de tus solicitudes para activarlas y comenzar el proceso. Una vez que proceses el pago, tu solicitud se activará automáticamente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {procesosPendientes.map((proceso, index) => (
            <PagosPendientesCard
              key={proceso.id || proceso.id_orden_servicio || proceso.expediente || index}
              proceso={proceso}
              onPagoExitoso={onRefresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PagosPendientesCard;

