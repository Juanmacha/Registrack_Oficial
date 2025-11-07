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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 relative flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center mb-4 text-green-700 flex items-center gap-2">
          <span className="inline-block bg-green-100 rounded-full p-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>
          </span>
          Demo Pasarela de Pago
        </h2>
        <p className="text-lg text-gray-700 mb-6 text-center">Monto a pagar: <span className="font-bold text-blue-700">${monto?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>
        {!exito ? (
          <>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-md text-lg w-full transition mb-2"
              onClick={handlePagar}
              disabled={pagando}
            >
              {pagando ? 'Procesando pago...' : 'Pagar ahora'}
            </button>
            <button
              className="text-gray-500 hover:text-gray-700 mt-2 text-sm"
              onClick={onClose}
              disabled={pagando}
            >
              Cancelar
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="inline-block bg-green-100 rounded-full p-3 mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>
            </span>
            <p className="text-xl font-semibold text-green-700">¡Pago realizado con éxito!</p>
            <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleDescargarComprobante}>
              Descargar comprobante PDF
            </button>
            <button className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={handleIrMisProcesos}>
              Ver estado de mi solicitud
            </button>
            <button className="mt-2 px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" onClick={onClose}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPasarelaPagoModal;