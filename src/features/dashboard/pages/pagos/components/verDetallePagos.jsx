import React, { useState } from "react";
import getEstadoPagoBadge from "../services/getEstadoPagoBadge";
import { useAuth } from '../../../../../shared/contexts/authContext';
import pagosApiService from '../services/pagosApiService';
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

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

  // Generar comprobante PDF mejorado
  const generarComprobantePDF = () => {
    try {
      console.log('🔧 [VerDetallePago] Generando PDF...');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const alturaPie = 35; // Altura del pie de página (aumentada para evitar superposición)
      let y = margin;

      // Colores
      const colorAzul = [37, 99, 235]; // blue-600
      const colorVerde = [34, 197, 94]; // green-500
      const colorGris = [107, 114, 128]; // gray-500
      const colorGrisClaro = [243, 244, 246]; // gray-100

      // Encabezado con fondo azul
      doc.setFillColor(...colorAzul);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Logo/Icono (círculo con check mejorado)
      const centerX = pageWidth / 2;
      const centerY = 25;
      const radius = 10;
      
      // Círculo exterior blanco
      doc.setFillColor(255, 255, 255);
      doc.circle(centerX, centerY, radius, 'F');
      
      // Círculo interior verde
      doc.setFillColor(...colorVerde);
      doc.circle(centerX, centerY, radius - 2, 'F');
      
      // Check mark usando líneas más gruesas
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(2.5);
      // Dibujar check mark: dos líneas que forman una V invertida
      // Línea vertical corta
      doc.line(centerX - 3, centerY, centerX - 1, centerY + 3);
      // Línea diagonal larga
      doc.line(centerX - 1, centerY + 3, centerX + 4, centerY - 3);

      // Título
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('COMPROBANTE DE PAGO', pageWidth / 2, 40, { align: 'center' });

      y = 60;

      // Información principal del pago
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Información del Pago', margin, y);
      y += 10;

      // Línea divisoria
      doc.setDrawColor(...colorGris);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Monto destacado
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorAzul); // Cambiado de verde a azul corporativo
      const monto = `$${(datos.monto_pagado || datos.monto || datos.solicitud?.total_orden_servicio || datos.solicitud?.total_estimado || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text('Monto Pagado:', margin, y);
      doc.text(monto, pageWidth - margin, y, { align: 'right' });
      y += 12;

      // Información del pago
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      // Calcular posición fija para los valores (alineación consistente)
      const labelWidth = 70; // Ancho fijo para las etiquetas
      const valueStartX = margin + labelWidth; // Posición de inicio para los valores

      const infoPago = [
        ['ID de Pago:', datos.id_pago || datos.id || 'N/A'],
        ['Fecha de Pago:', formatearFechaCorta(datos.fecha_pago)],
        ['Método de Pago:', datos.metodo_pago || 'N/A'],
        ['Estado:', texto || datos.estado || 'N/A'],
        ['Número de Comprobante:', datos.numero_comprobante || 'N/A'],
        ['Transaction ID:', datos.transaction_id || 'N/A'],
      ];

      infoPago.forEach(([label, value]) => {
        if (value && value !== 'N/A') {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), valueStartX, y);
          y += 7;
        }
      });

      y += 5;

      // Información del Cliente
      if (datos.cliente || datos.empresa) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorAzul);
        doc.text('Información del Cliente', margin, y);
        y += 8;

        doc.setDrawColor(...colorGris);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        if (datos.cliente) {
          if (datos.cliente.marca) {
            doc.setFont('helvetica', 'bold');
            doc.text('Marca:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.cliente.marca, margin + 30, y);
            y += 6;
          }
          if (datos.cliente.nombre || datos.cliente.apellido) {
            const nombreCompleto = datos.cliente.nombre && datos.cliente.apellido
              ? `${datos.cliente.nombre} ${datos.cliente.apellido}`
              : datos.cliente.nombre || datos.cliente.apellido || '';
            if (nombreCompleto) {
              doc.setFont('helvetica', 'bold');
              doc.text('Nombre:', margin, y);
              doc.setFont('helvetica', 'normal');
              doc.text(nombreCompleto, margin + 30, y);
              y += 6;
            }
          }
          if (datos.cliente.tipo_persona) {
            doc.setFont('helvetica', 'bold');
            doc.text('Tipo de Persona:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.cliente.tipo_persona, margin + 50, y);
            y += 6;
          }
          if (datos.cliente.correo) {
            doc.setFont('helvetica', 'bold');
            doc.text('Correo:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.cliente.correo, margin + 30, y);
            y += 6;
          }
        }

        if (datos.empresa) {
          if (datos.empresa.nombre) {
            doc.setFont('helvetica', 'bold');
            doc.text('Empresa:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.empresa.nombre, margin + 30, y);
            y += 6;
          }
          if (datos.empresa.nit) {
            doc.setFont('helvetica', 'bold');
            doc.text('NIT:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.empresa.nit, margin + 20, y);
            y += 6;
          }
        }

        y += 5;
      }

      // Información del Servicio
      if (datos.servicio) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorAzul);
        doc.text('Información del Servicio', margin, y);
        y += 8;

        doc.setDrawColor(...colorGris);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        if (datos.servicio.nombre) {
          doc.setFont('helvetica', 'bold');
          doc.text('Servicio:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(datos.servicio.nombre, margin + 35, y);
          y += 6;
        }
        if (datos.servicio.precio_base !== undefined) {
          doc.setFont('helvetica', 'bold');
          doc.text('Precio Base:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`$${datos.servicio.precio_base.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 40, y);
          y += 6;
        }

        y += 5;
      }

      // Información de la Solicitud
      if (datos.solicitud) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorAzul);
        doc.text('Información de la Solicitud', margin, y);
        y += 8;

        doc.setDrawColor(...colorGris);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        if (datos.solicitud.numero_expediente) {
          doc.setFont('helvetica', 'bold');
          doc.text('Expediente:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(datos.solicitud.numero_expediente, margin + 40, y);
          y += 6;
        }
        if (datos.solicitud.estado) {
          doc.setFont('helvetica', 'bold');
          doc.text('Estado:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(datos.solicitud.estado, margin + 30, y);
          y += 6;
        }
        if (datos.solicitud.total_estimado !== undefined) {
          doc.setFont('helvetica', 'bold');
          doc.text('Total Estimado:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`$${datos.solicitud.total_estimado.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 50, y);
          y += 6;
        }

        y += 5;
      }

      // Información del Usuario
      if (datos.usuario) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorAzul);
        doc.text('Información del Usuario', margin, y);
        y += 8;

        doc.setDrawColor(...colorGris);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        if (datos.usuario.nombre || datos.usuario.apellido) {
          const nombreUsuario = datos.usuario.nombre && datos.usuario.apellido
            ? `${datos.usuario.nombre} ${datos.usuario.apellido}`
            : datos.usuario.nombre || datos.usuario.apellido || '';
          if (nombreUsuario) {
            doc.setFont('helvetica', 'bold');
            doc.text('Nombre:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(nombreUsuario, margin + 30, y);
            y += 6;
          }
        }
        if (datos.usuario.correo) {
          doc.setFont('helvetica', 'bold');
          doc.text('Correo:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(datos.usuario.correo, margin + 30, y);
          y += 6;
        }
        if (datos.usuario.documento || datos.usuario.numero_documento || datos.usuario.cedula || datos.usuario.numero_cedula) {
          const documento = datos.usuario.documento || datos.usuario.numero_documento || datos.usuario.cedula || datos.usuario.numero_cedula;
          doc.setFont('helvetica', 'bold');
          doc.text('Documento:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(documento), margin + 40, y);
          y += 6;
        }

        y += 5;
      }

      // Verificar espacio disponible antes del pie de página
      const espacioDisponible = pageHeight - y - alturaPie;
      
      // Observaciones (solo si hay espacio suficiente)
      if (datos.observaciones && espacioDisponible > 20) {
        // Verificar que haya espacio suficiente para la sección de observaciones
        if (y + 30 < pageHeight - alturaPie) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorAzul);
          doc.text('Observaciones', margin, y);
          y += 8;

          doc.setDrawColor(...colorGris);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          
          // Calcular cuánto espacio tenemos disponible
          const espacioRestante = pageHeight - y - alturaPie - 5; // 5mm de margen
          const observaciones = doc.splitTextToSize(datos.observaciones, pageWidth - 2 * margin);
          const lineasVisibles = Math.floor(espacioRestante / 5);
          const observacionesMostradas = observaciones.slice(0, Math.max(1, lineasVisibles));
          
          doc.text(observacionesMostradas, margin, y);
          y += observacionesMostradas.length * 5 + 5;
        }
      }

      // Asegurar que el contenido no se superponga con el pie de página
      if (y > pageHeight - alturaPie - 5) {
        y = pageHeight - alturaPie - 5;
        console.warn('⚠️ [VerDetallePago] Contenido ajustado para evitar superposición con el pie de página');
      }

      // Pie de página (siempre al final de la página)
      const pieYInicio = pageHeight - alturaPie;
      const fechaGeneracion = new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Línea divisoria antes del pie
      doc.setDrawColor(...colorGris);
      doc.line(margin, pieYInicio, pageWidth - margin, pieYInicio);
      
      // Pie de página con fondo azul
      doc.setFillColor(...colorAzul);
      doc.rect(0, pieYInicio, pageWidth, alturaPie, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(255, 255, 255);
      doc.text(`Comprobante generado el ${fechaGeneracion}`, pageWidth / 2, pieYInicio + 10, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('Este documento es un comprobante de pago válido', pageWidth / 2, pieYInicio + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Registrack - Sistema de Gestión de Marcas', pageWidth / 2, pieYInicio + 25, { align: 'center' });

      // Guardar PDF
      const nombreArchivo = `comprobante_pago_${datos.id_pago || datos.id || 'N/A'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);
      console.log('✅ [VerDetallePago] PDF generado exitosamente:', nombreArchivo);
    } catch (error) {
      console.error('❌ [VerDetallePago] Error en generarComprobantePDF:', error);
      throw error;
    }
  };

  // Descargar comprobante
  const handleDescargarComprobante = () => {
    try {
      console.log('🔧 [VerDetallePago] Iniciando generación de comprobante...');
      console.log('📋 [VerDetallePago] Datos del pago:', datos);
      
      setDescargando(true);
      
      // Generar PDF mejorado
      generarComprobantePDF();
      
      // Pequeño delay para asegurar que el PDF se genere
      setTimeout(() => {
        setDescargando(false);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Comprobante de pago descargado exitosamente.',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
          }
        });
      }, 500);
      
    } catch (err) {
      console.error('❌ [VerDetallePago] Error generando comprobante:', err);
      setDescargando(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo generar el comprobante. Por favor, intenta nuevamente.',
      });
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
                      ${(datos.monto_pagado || datos.monto || datos.solicitud?.total_orden_servicio || datos.solicitud?.total_estimado || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        {datos.numero_comprobante ? `N° ${datos.numero_comprobante}` : 'Generar comprobante PDF'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDescargarComprobante();
                    }}
                    disabled={descargando}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    type="button"
                  >
                    <i className="bi bi-download"></i>
                    {descargando ? 'Generando...' : 'Descargar'}
                  </button>
                </div>
              </div>
            </div>

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

            {/* Información del Cliente */}
            {(datos.cliente || datos.empresa) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <i className="bi bi-person-badge text-indigo-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información del Cliente</h3>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
                  {datos.cliente && (
                    <>
                      {datos.cliente.marca && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-tag text-indigo-500"></i>
                          <span className="text-gray-600">Marca:</span>
                          <span className="font-medium text-gray-800">{datos.cliente.marca}</span>
                        </div>
                      )}
                      {(datos.cliente.nombre || datos.cliente.apellido) && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-person text-indigo-500"></i>
                          <span className="text-gray-600">Nombre:</span>
                          <span className="font-medium text-gray-800">
                            {datos.cliente.nombre && datos.cliente.apellido
                              ? `${datos.cliente.nombre} ${datos.cliente.apellido}`
                              : datos.cliente.nombre || datos.cliente.apellido || '-'}
                          </span>
                        </div>
                      )}
                      {datos.cliente.tipo_persona && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-person-check text-indigo-500"></i>
                          <span className="text-gray-600">Tipo de Persona:</span>
                          <span className="font-medium text-gray-800">{datos.cliente.tipo_persona}</span>
                        </div>
                      )}
                      {datos.cliente.correo && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-envelope text-indigo-500"></i>
                          <span className="text-gray-600">Correo:</span>
                          <span className="font-medium text-gray-800">{datos.cliente.correo}</span>
                        </div>
                      )}
                    </>
                  )}
                  {datos.empresa && (
                    <>
                      {datos.empresa.nombre && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-building text-indigo-500"></i>
                          <span className="text-gray-600">Empresa:</span>
                          <span className="font-medium text-gray-800">{datos.empresa.nombre}</span>
                        </div>
                      )}
                      {datos.empresa.nit && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-file-earmark-text text-indigo-500"></i>
                          <span className="text-gray-600">NIT:</span>
                          <span className="font-medium text-gray-800">{datos.empresa.nit}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Información del Servicio */}
            {datos.servicio && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <i className="bi bi-briefcase text-teal-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información del Servicio</h3>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
                  {datos.servicio.nombre && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-tag text-teal-500"></i>
                      <span className="text-gray-600">Nombre del Servicio:</span>
                      <span className="font-medium text-gray-800">{datos.servicio.nombre}</span>
                    </div>
                  )}
                  {datos.servicio.precio_base !== undefined && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-currency-dollar text-teal-500"></i>
                      <span className="text-gray-600">Precio Base:</span>
                      <span className="font-medium text-gray-800">
                        ${datos.servicio.precio_base?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información de la Solicitud */}
            {datos.solicitud && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <i className="bi bi-file-earmark-text text-orange-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información de la Solicitud</h3>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  {datos.solicitud.numero_expediente && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-file-earmark-text text-orange-500"></i>
                      <span className="text-gray-600">Número de Expediente:</span>
                      <span className="font-medium text-gray-800">{datos.solicitud.numero_expediente}</span>
                    </div>
                  )}
                  {datos.solicitud.estado && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-info-circle text-orange-500"></i>
                      <span className="text-gray-600">Estado:</span>
                      <span className="font-medium text-gray-800">{datos.solicitud.estado}</span>
                    </div>
                  )}
                  {datos.solicitud.total_estimado !== undefined && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-currency-dollar text-orange-500"></i>
                      <span className="text-gray-600">Total Estimado:</span>
                      <span className="font-medium text-gray-800">
                        ${datos.solicitud.total_estimado?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información del Usuario */}
            {datos.usuario && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <i className="bi bi-person-circle text-pink-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información del Usuario</h3>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
                  {(datos.usuario.nombre || datos.usuario.apellido) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person text-pink-500"></i>
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium text-gray-800">
                        {datos.usuario.nombre && datos.usuario.apellido
                          ? `${datos.usuario.nombre} ${datos.usuario.apellido}`
                          : datos.usuario.nombre || datos.usuario.apellido || '-'}
                      </span>
                    </div>
                  )}
                  {datos.usuario.correo && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-envelope text-pink-500"></i>
                      <span className="text-gray-600">Correo:</span>
                      <span className="font-medium text-gray-800">{datos.usuario.correo}</span>
                    </div>
                  )}
                  {(datos.usuario.documento || datos.usuario.numero_documento || datos.usuario.cedula || datos.usuario.numero_cedula) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-card-text text-pink-500"></i>
                      <span className="text-gray-600">Documento:</span>
                      <span className="font-medium text-gray-800">
                        {datos.usuario.documento || datos.usuario.numero_documento || datos.usuario.cedula || datos.usuario.numero_cedula}
                      </span>
                    </div>
                  )}
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
