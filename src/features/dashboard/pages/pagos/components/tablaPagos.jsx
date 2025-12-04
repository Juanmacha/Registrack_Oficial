import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import getEstadoPagoBadge from "../services/getEstadoPagoBadge";
import VerDetallePago from "../components/verDetallePagos";
import DownloadButton from "../../../../../shared/components/DownloadButton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from '../../../../../shared/contexts/authContext';
import pagosApiService from '../services/pagosApiService';
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import excelService from '../../../../../shared/services/excelService';
import { ANCHOS_COLUMNA } from '../../../../../shared/utils/excelStyles';

const Tablapagos = () => {
  const { getToken } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const registrosPorPagina = 5;

  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [descargandoComprobante, setDescargandoComprobante] = useState(null);

  // Cargar pagos desde la API
  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      
      console.log('🔧 [TablaPagos] Cargando pagos desde API...');
      const datos = await pagosApiService.getTodosLosPagos(token);
      
      console.log('✅ [TablaPagos] Pagos recibidos del servicio:', datos);
      console.log('✅ [TablaPagos] Tipo de datos:', typeof datos);
      console.log('✅ [TablaPagos] Es array?:', Array.isArray(datos));
      console.log('✅ [TablaPagos] Cantidad de pagos:', datos?.length || 0);
      
      // Asegurar que datos sea un array
      const pagosArray = Array.isArray(datos) ? datos : [];
      
      console.log('✅ [TablaPagos] Pagos a establecer:', pagosArray.length);
      if (pagosArray.length > 0) {
        console.log('📋 [TablaPagos] Primer pago (ejemplo):', pagosArray[0]);
        console.log('💰 [TablaPagos] Campos de monto disponibles:', {
          monto: pagosArray[0].monto,
          monto_pago: pagosArray[0].monto_pago,
          valor: pagosArray[0].valor,
          pago_monto: pagosArray[0].pago?.monto,
          solicitud_total: pagosArray[0].solicitud?.total_estimado,
          orden_total: pagosArray[0].orden_servicio?.total_estimado,
          todas_las_claves: Object.keys(pagosArray[0])
        });
      }
      
      setPagos(pagosArray);
    } catch (err) {
      console.error('❌ [TablaPagos] Error cargando pagos:', err);
      console.error('❌ [TablaPagos] Error completo:', {
        message: err.message,
        status: err.status,
        data: err.data,
        stack: err.stack
      });
      setError(err.message || 'Error al cargar los pagos');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudieron cargar los pagos. Por favor, intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y paginar datos
  useEffect(() => {
    if (!pagos || pagos.length === 0) {
      setDatos([]);
      setTotalRegistros(0);
      setTotalPaginas(0);
      return;
    }

    const filtrar = pagos.filter(
      (p) => {
        if (!busqueda || busqueda.trim() === '') return true;
        
        const busquedaLower = busqueda.toLowerCase().trim();
        
        // Buscar en datos del pago
        // Obtener monto de múltiples ubicaciones posibles para búsqueda
        const montoPago = p.monto_pagado || 
                         p.monto || 
                         p.monto_pago || 
                         p.valor || 
                         p.solicitud?.total_orden_servicio ||
                         p.solicitud?.total_estimado ||
                         null;
        
        const matchPago = 
          (p.id_pago ? String(p.id_pago).toLowerCase().includes(busquedaLower) : false) ||
          (montoPago !== null && montoPago !== undefined ? String(montoPago).toLowerCase().includes(busquedaLower) : false) ||
          (p.metodo_pago && typeof p.metodo_pago === 'string' ? p.metodo_pago.toLowerCase().includes(busquedaLower) : false) ||
          (p.id_orden_servicio ? String(p.id_orden_servicio).toLowerCase().includes(busquedaLower) : false) ||
          (p.referencia && typeof p.referencia === 'string' ? p.referencia.toLowerCase().includes(busquedaLower) : false) ||
          (p.numero_comprobante && typeof p.numero_comprobante === 'string' ? p.numero_comprobante.toLowerCase().includes(busquedaLower) : false) ||
          (p.transaction_id && typeof p.transaction_id === 'string' ? p.transaction_id.toLowerCase().includes(busquedaLower) : false) ||
          (p.estado && typeof p.estado === 'string' ? p.estado.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del cliente
        const matchCliente = 
          (p.cliente?.marca && typeof p.cliente.marca === 'string' ? p.cliente.marca.toLowerCase().includes(busquedaLower) : false) ||
          (p.cliente?.nombre && typeof p.cliente.nombre === 'string' ? p.cliente.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.cliente?.apellido && typeof p.cliente.apellido === 'string' ? p.cliente.apellido.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del servicio
        const matchServicio = 
          (p.servicio?.nombre && typeof p.servicio.nombre === 'string' ? p.servicio.nombre.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del usuario
        const matchUsuario = 
          (p.usuario?.nombre && typeof p.usuario.nombre === 'string' ? p.usuario.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.usuario?.apellido && typeof p.usuario.apellido === 'string' ? p.usuario.apellido.toLowerCase().includes(busquedaLower) : false) ||
          (p.usuario?.correo && typeof p.usuario.correo === 'string' ? p.usuario.correo.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos de la empresa
        const matchEmpresa = 
          (p.empresa?.nombre && typeof p.empresa.nombre === 'string' ? p.empresa.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.empresa?.nit && typeof p.empresa.nit === 'string' ? String(p.empresa.nit).toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos de la solicitud
        const matchSolicitud = 
          (p.solicitud?.numero_expediente && typeof p.solicitud.numero_expediente === 'string' ? p.solicitud.numero_expediente.toLowerCase().includes(busquedaLower) : false) ||
          (p.solicitud?.estado && typeof p.solicitud.estado === 'string' ? p.solicitud.estado.toLowerCase().includes(busquedaLower) : false);
        
        return matchPago || matchCliente || matchServicio || matchUsuario || matchEmpresa || matchSolicitud;
      }
    );
    
    const total = filtrar.length;
    const paginas = Math.ceil(total / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const datosPaginados = filtrar.slice(inicio, inicio + registrosPorPagina);
    
    setDatos(datosPaginados);
    setTotalPaginas(paginas);
    setTotalRegistros(total);
  }, [paginaActual, busqueda, pagos]);

  const abrirDetalle = (pago) => {
    setDetalleSeleccionado(pago);
    setModalAbierto(true);
  };

  const cerrarDetalle = () => {
    setDetalleSeleccionado(null);
    setModalAbierto(false);
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // Formatear fecha corta
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
  const generarComprobantePDF = (pago) => {
    try {
      console.log('🔧 [TablaPagos] Generando PDF mejorado...');
      const { texto } = getEstadoPagoBadge(pago.estado);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const alturaPie = 30;
      let y = margin;

      // Colores mejorados
      const colorAzul = [23, 75, 138]; // Azul más profesional
      const colorAzulClaro = [59, 130, 246]; // Azul claro
      const colorVerde = [34, 197, 94]; // Verde
      const colorGris = [107, 114, 128];
      const colorGrisClaro = [249, 250, 251]; // gray-50
      const colorGrisMedio = [229, 231, 235]; // gray-200
      const colorNegro = [17, 24, 39]; // gray-900

      // ============================================
      // ENCABEZADO SIN LOGO
      // ============================================
      const alturaEncabezado = 45;
      
      // Fondo azul que cubre todo el ancho
      doc.setFillColor(...colorAzul);
      doc.rect(0, 0, pageWidth, alturaEncabezado, 'F');
      
      // Calcular posición vertical centrada para el texto
      const centroVertical = alturaEncabezado / 2;
      const tituloX = pageWidth / 2;
      
      // Título principal (centrado)
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('COMPROBANTE DE PAGO', tituloX, centroVertical - 5, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(245, 245, 245);
      doc.text('Documento válido para comprobación fiscal', tituloX, centroVertical + 5, { align: 'center' });
      
      // Fecha de emisión
      doc.setFontSize(9);
      doc.setTextColor(235, 235, 235);
      const fechaEmision = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Emitido el ${fechaEmision}`, tituloX, centroVertical + 13, { align: 'center' });

      y = alturaEncabezado + 12;

      // ============================================
      // SECCIÓN: MONTO DESTACADO
      // ============================================
      const monto = pago.monto_pagado || pago.monto || pago.solicitud?.total_orden_servicio || pago.solicitud?.total_estimado || 0;
      const montoFormateado = `$${monto.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      
      // Tarjeta de monto destacada
      const alturaTarjetaMonto = 35;
      doc.setFillColor(...colorGrisClaro);
      doc.setDrawColor(...colorGrisMedio);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, pageWidth - 2 * margin, alturaTarjetaMonto, 'FD');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colorGris);
      doc.text('MONTO PAGADO', margin + 10, y + 12);
      
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorAzul);
      doc.text(montoFormateado, margin + 10, y + 28);
      
      // Estado del pago a la derecha
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorGris);
      doc.text('Estado:', pageWidth - margin - 50, y + 12);
      doc.setFontSize(12);
      doc.setTextColor(...colorAzul);
      doc.text(String(texto || pago.estado || 'N/A'), pageWidth - margin - 10, y + 12, { align: 'right' });
      
      y += alturaTarjetaMonto + 12;

      // ============================================
      // SECCIÓN: INFORMACIÓN GENERAL EN COLUMNAS
      // ============================================
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorNegro);
      doc.text('Información del Pago', margin, y);
      y += 8;

      // Tarjeta de información general
      const infoPago = [
        ['ID de Pago', pago.id_pago || pago.id || 'N/A'],
        ['Fecha de Pago', formatearFechaCorta(pago.fecha_pago)],
        ['Método de Pago', pago.metodo_pago || 'N/A'],
        ['N° Comprobante', pago.numero_comprobante || 'N/A'],
        ['Transaction ID', pago.transaction_id || 'N/A'],
        ['Expediente', pago.solicitud?.numero_expediente || 'N/A'],
      ].filter(([_, value]) => value && value !== 'N/A');

      const infoColWidth = (pageWidth - 2 * margin - 20) / 2;
      const labelWidth = 50;
      const valueWidth = infoColWidth - labelWidth - 10; // Ancho disponible para el valor
      
      // Calcular alturas de cada fila considerando texto que se divide en múltiples líneas
      let rowHeights = [];
      let rowItems = []; // Para agrupar items por fila
      
      infoPago.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        
        if (!rowItems[row]) rowItems[row] = [];
        rowItems[row].push({ label, value, col, row });
        
        if (!rowHeights[row]) rowHeights[row] = 0;
        
        doc.setFontSize(9);
        const valueText = doc.splitTextToSize(String(value), valueWidth);
        const linesCount = Math.max(1, valueText.length);
        const itemHeight = 8 + (linesCount - 1) * 4.5;
        
        if (itemHeight > rowHeights[row]) {
          rowHeights[row] = itemHeight;
        }
      });
      
      const alturaInfo = 8 + rowHeights.reduce((sum, h) => sum + h, 0) + 2;
      doc.setFillColor(...colorGrisClaro);
      doc.setDrawColor(...colorGrisMedio);
      doc.rect(margin, y, pageWidth - 2 * margin, alturaInfo, 'FD');
      
      let currentY = y + 10;
      
      // Dibujar cada fila
      rowItems.forEach((items, rowIndex) => {
        const rowHeight = rowHeights[rowIndex];
        
        items.forEach(({ label, value, col }) => {
          const x = margin + 10 + (col * infoColWidth);
          const valueX = x + labelWidth;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorGris);
          doc.text(`${label}:`, x, currentY);
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colorNegro);
          const valueText = doc.splitTextToSize(String(value), valueWidth);
          doc.text(valueText, valueX, currentY);
        });
        
        currentY += rowHeight + 2;
      });
      
      y += alturaInfo + 12;

      // ============================================
      // SECCIÓN: INFORMACIÓN DEL CLIENTE Y SERVICIO (2 COLUMNAS)
      // ============================================
      const colWidth = (pageWidth - 2 * margin - 10) / 2;
      let clienteData = [];
      let servicioData = [];
      
      // Preparar datos del cliente
      if (pago.cliente || pago.empresa) {
        if (pago.cliente?.marca) clienteData.push(['Marca', String(pago.cliente.marca)]);
        if (pago.cliente?.nombre || pago.cliente?.apellido) {
          const nombreCompleto = pago.cliente.nombre && pago.cliente.apellido
            ? `${pago.cliente.nombre} ${pago.cliente.apellido}`
            : pago.cliente.nombre || pago.cliente.apellido || '';
          if (nombreCompleto) clienteData.push(['Nombre', String(nombreCompleto)]);
        }
        if (pago.cliente?.correo) clienteData.push(['Correo', String(pago.cliente.correo)]);
        if (pago.empresa?.nombre) clienteData.push(['Empresa', String(pago.empresa.nombre)]);
        if (pago.empresa?.nit) clienteData.push(['NIT', String(pago.empresa.nit)]);
      }
      
      // Preparar datos del servicio
      if (pago.servicio) {
        if (pago.servicio.nombre) servicioData.push(['Nombre', String(pago.servicio.nombre)]);
        if (pago.servicio.precio_base !== undefined) {
          servicioData.push(['Precio Base', `$${pago.servicio.precio_base.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`]);
        }
      }
      
      if (pago.solicitud) {
        if (pago.solicitud.estado) servicioData.push(['Estado Solicitud', String(pago.solicitud.estado)]);
        if (pago.solicitud.total_estimado !== undefined) {
          servicioData.push(['Total Estimado', `$${pago.solicitud.total_estimado.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`]);
        }
      }
      
      // Columna izquierda: Cliente
      if (clienteData.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorAzul);
        doc.text('INFORMACIÓN DEL CLIENTE', margin, y);
        
        const alturaCliente = 10 + (clienteData.length * 9);
        doc.setFillColor(...colorGrisClaro);
        doc.setDrawColor(...colorGrisMedio);
        doc.rect(margin, y + 5, colWidth, alturaCliente, 'FD');
        
        clienteData.forEach(([label, value], idx) => {
          const itemY = y + 12 + (idx * 9);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorGris);
          doc.text(`${label}:`, margin + 8, itemY);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colorNegro);
          const valueText = doc.splitTextToSize(String(value), colWidth - 20);
          doc.text(valueText, margin + 35, itemY);
        });
      }
      
      // Columna derecha: Servicio
      if (servicioData.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorAzul);
        doc.text('INFORMACIÓN DEL SERVICIO', margin + colWidth + 10, y);
        
        const alturaServicio = 10 + (servicioData.length * 9);
        doc.setFillColor(...colorGrisClaro);
        doc.setDrawColor(...colorGrisMedio);
        doc.rect(margin + colWidth + 10, y + 5, colWidth, alturaServicio, 'FD');
        
        servicioData.forEach(([label, value], idx) => {
          const itemY = y + 12 + (idx * 9);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorGris);
          doc.text(`${label}:`, margin + colWidth + 18, itemY);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colorNegro);
          const valueText = doc.splitTextToSize(String(value), colWidth - 20);
          doc.text(valueText, margin + colWidth + 45, itemY);
        });
      }
      
      // Ajustar Y según la altura máxima
      const alturaMaxima = Math.max(
        clienteData.length > 0 ? (10 + (clienteData.length * 9)) : 0,
        servicioData.length > 0 ? (10 + (servicioData.length * 9)) : 0
      );
      
      if (alturaMaxima > 0) {
        y += alturaMaxima + 15;
      }

      // ============================================
      // SECCIÓN: INFORMACIÓN DEL USUARIO
      // ============================================
      if (pago.usuario) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorAzul);
        doc.text('INFORMACIÓN DEL USUARIO', margin, y);
        
        const usuarioData = [];
        if (pago.usuario.nombre || pago.usuario.apellido) {
          const nombreUsuario = pago.usuario.nombre && pago.usuario.apellido
            ? `${pago.usuario.nombre} ${pago.usuario.apellido}`
            : pago.usuario.nombre || pago.usuario.apellido || '';
          if (nombreUsuario) usuarioData.push(['Nombre', String(nombreUsuario)]);
        }
        if (pago.usuario.correo) usuarioData.push(['Correo', String(pago.usuario.correo)]);
        if (pago.usuario.documento || pago.usuario.numero_documento || pago.usuario.cedula || pago.usuario.numero_cedula) {
          const documento = pago.usuario.documento || pago.usuario.numero_documento || pago.usuario.cedula || pago.usuario.numero_cedula;
          usuarioData.push(['Documento', String(documento)]);
        }
        
        if (usuarioData.length > 0) {
          const alturaUsuario = 10 + (usuarioData.length * 9);
          doc.setFillColor(...colorGrisClaro);
          doc.setDrawColor(...colorGrisMedio);
          doc.rect(margin, y + 5, pageWidth - 2 * margin, alturaUsuario, 'FD');
          
          usuarioData.forEach(([label, value], idx) => {
            const itemY = y + 12 + (idx * 9);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colorGris);
            doc.text(`${label}:`, margin + 8, itemY);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorNegro);
            doc.text(String(value), margin + 45, itemY);
          });
          
          y += alturaUsuario + 12;
        }
      }

      // ============================================
      // SECCIÓN: OBSERVACIONES
      // ============================================
      if (pago.observaciones) {
        const espacioDisponible = pageHeight - y - alturaPie - 15;
        if (espacioDisponible > 20) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorAzul);
          doc.text('OBSERVACIONES', margin, y);
          
          const alturaObservaciones = Math.min(40, espacioDisponible - 10);
          doc.setFillColor(...colorGrisClaro);
          doc.setDrawColor(...colorGrisMedio);
          doc.rect(margin, y + 5, pageWidth - 2 * margin, alturaObservaciones, 'FD');
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colorNegro);
          
          const observaciones = doc.splitTextToSize(String(pago.observaciones), pageWidth - 2 * margin - 16);
          const lineasVisibles = Math.floor((alturaObservaciones - 10) / 5);
          const observacionesMostradas = observaciones.slice(0, Math.max(1, lineasVisibles));
          
          doc.text(observacionesMostradas, margin + 8, y + 15);
          y += alturaObservaciones + 12;
        }
      }

      // Asegurar que el contenido no se superponga con el pie de página
      if (y > pageHeight - alturaPie - 5) {
        y = pageHeight - alturaPie - 5;
        console.warn('⚠️ [TablaPagos] Contenido ajustado para evitar superposición con el pie de página');
      }

      // ============================================
      // PIE DE PÁGINA MEJORADO
      // ============================================
      const pieYInicio = pageHeight - alturaPie;
      
      // Línea divisoria superior
      doc.setDrawColor(...colorGrisMedio);
      doc.setLineWidth(1);
      doc.line(margin, pieYInicio, pageWidth - margin, pieYInicio);
      
      // Fondo del pie de página
      doc.setFillColor(...colorAzul);
      doc.rect(0, pieYInicio + 1, pageWidth, alturaPie - 1, 'F');
      
      // Fecha de generación
      const fechaGeneracion = new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`Generado el ${fechaGeneracion}`, pageWidth / 2, pieYInicio + 8, { align: 'center' });
      
      // Mensaje de validez
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Documento válido para comprobación', pageWidth / 2, pieYInicio + 15, { align: 'center' });
      
      // Información de la empresa
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(240, 240, 240);
      doc.text('Registrack - Sistema de Gestión de Marcas', pageWidth / 2, pieYInicio + 22, { align: 'center' });

      // Guardar PDF
      const nombreArchivo = `comprobante_pago_${pago.id_pago || pago.id || 'N/A'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);
      console.log('✅ [TablaPagos] PDF generado exitosamente:', nombreArchivo);
    } catch (error) {
      console.error('❌ [TablaPagos] Error en generarComprobantePDF:', error);
      throw error;
    }
  };

  // Descargar comprobante - Generar PDF mejorado
  const handleDescargarComprobante = (pago, e) => {
    // Prevenir eventos adicionales
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const idPago = pago.id_pago || pago.id;
    
    // Evitar descargas simultáneas del mismo pago
    if (descargandoComprobante === idPago) {
      console.log('⚠️ [TablaPagos] Ya se está generando este comprobante');
      return;
    }

    try {
      console.log('🔧 [TablaPagos] Iniciando generación de comprobante para pago:', idPago);
      setDescargandoComprobante(idPago);
      
      // Generar PDF mejorado
      generarComprobantePDF(pago);
      
      setDescargandoComprobante(null);
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
    } catch (error) {
      console.error('❌ [TablaPagos] Error al generar comprobante:', error);
      setDescargandoComprobante(null);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el comprobante de pago. Por favor, inténtalo nuevamente.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    }
  };

  // Descargar reporte Excel con logo y colores de la app
  const handleDescargarExcel = async () => {
    try {
      // Obtener todos los pagos filtrados (no solo los de la página actual)
      const busquedaLower = busqueda && busqueda.trim() ? busqueda.toLowerCase().trim() : '';
      const pagosFiltrados = pagos.filter(p => {
        if (!busquedaLower) return true;
        
        // Buscar en datos del pago
        const matchPago = 
          (p.id_pago ? String(p.id_pago).toLowerCase().includes(busquedaLower) : false) ||
          (p.monto !== null && p.monto !== undefined ? String(p.monto).toLowerCase().includes(busquedaLower) : false) ||
          (p.metodo_pago && typeof p.metodo_pago === 'string' ? p.metodo_pago.toLowerCase().includes(busquedaLower) : false) ||
          (p.estado && typeof p.estado === 'string' ? p.estado.toLowerCase().includes(busquedaLower) : false) ||
          (p.numero_comprobante && typeof p.numero_comprobante === 'string' ? p.numero_comprobante.toLowerCase().includes(busquedaLower) : false) ||
          (p.transaction_id && typeof p.transaction_id === 'string' ? p.transaction_id.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del cliente
        const matchCliente = 
          (p.cliente?.marca && typeof p.cliente.marca === 'string' ? p.cliente.marca.toLowerCase().includes(busquedaLower) : false) ||
          (p.cliente?.nombre && typeof p.cliente.nombre === 'string' ? p.cliente.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.cliente?.apellido && typeof p.cliente.apellido === 'string' ? p.cliente.apellido.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del servicio
        const matchServicio = 
          (p.servicio?.nombre && typeof p.servicio.nombre === 'string' ? p.servicio.nombre.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del usuario
        const matchUsuario = 
          (p.usuario?.nombre && typeof p.usuario.nombre === 'string' ? p.usuario.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.usuario?.apellido && typeof p.usuario.apellido === 'string' ? p.usuario.apellido.toLowerCase().includes(busquedaLower) : false) ||
          (p.usuario?.correo && typeof p.usuario.correo === 'string' ? p.usuario.correo.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos de la empresa
        const matchEmpresa = 
          (p.empresa?.nombre && typeof p.empresa.nombre === 'string' ? p.empresa.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.empresa?.nit && typeof p.empresa.nit === 'string' ? String(p.empresa.nit).toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos de la solicitud
        const matchSolicitud = 
          (p.solicitud?.numero_expediente && typeof p.solicitud.numero_expediente === 'string' ? p.solicitud.numero_expediente.toLowerCase().includes(busquedaLower) : false) ||
          (p.solicitud?.estado && typeof p.solicitud.estado === 'string' ? p.solicitud.estado.toLowerCase().includes(busquedaLower) : false);
        
        return matchPago || matchCliente || matchServicio || matchUsuario || matchEmpresa || matchSolicitud;
      });

      if (pagosFiltrados.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay pagos para exportar con los filtros actuales',
        });
        return;
      }

      console.log('🔧 [TablaPagos] Generando Excel con logo y colores de la app...');

      // Preparar encabezados
      const encabezados = [
        'ID Pago',
        'Monto',
        'Precio del Servicio',
        'Fecha de Pago',
        'Cliente',
        'Empresa',
        'Servicio',
        'Usuario',
        'Orden Servicio',
        'Expediente',
        'Estado',
        'N° Comprobante',
        'Transaction ID'
      ];

      // Preparar datos para Excel
      const datosExcel = pagosFiltrados.map(pago => {
        const { texto: estadoTexto } = getEstadoPagoBadge(pago.estado);
        
        // Obtener información del cliente
        const nombreCliente = pago.cliente?.marca || 
                             (pago.cliente?.nombre && pago.cliente?.apellido 
                               ? `${pago.cliente.nombre} ${pago.cliente.apellido}` 
                               : pago.cliente?.nombre || pago.cliente?.apellido || '');
        
        // Obtener información del servicio
        const nombreServicio = pago.servicio?.nombre || '';
        
        // Obtener información del usuario
        const nombreUsuario = pago.usuario?.nombre && pago.usuario?.apellido
                            ? `${pago.usuario.nombre} ${pago.usuario.apellido}`
                            : pago.usuario?.nombre || pago.usuario?.apellido || '';
        
        // Formatear fecha
        const fechaFormateada = pago.fecha_pago 
          ? new Date(pago.fecha_pago).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
          : '';

        return {
          'ID Pago': pago.id_pago || pago.id || '',
          'Monto': `$${(pago.monto_pagado || pago.monto || pago.monto_pago || pago.valor || pago.solicitud?.total_orden_servicio || pago.solicitud?.total_estimado || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          'Precio del Servicio': `$${(pago.servicio?.precio_base || pago.solicitud?.total_estimado || pago.servicio?.precio || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          'Fecha de Pago': fechaFormateada,
          'Cliente': nombreCliente,
          'Empresa': pago.empresa?.nombre || '',
          'Servicio': nombreServicio,
          'Usuario': nombreUsuario,
          'Orden Servicio': pago.id_orden_servicio || pago.solicitud?.id_orden_servicio || '',
          'Expediente': pago.solicitud?.numero_expediente || '',
          'Estado': estadoTexto || pago.estado || '',
          'N° Comprobante': pago.numero_comprobante || '',
          'Transaction ID': pago.transaction_id || ''
        };
      });

      // Anchos de columna personalizados
      const anchosColumnas = [
        ANCHOS_COLUMNA.ID,        // ID Pago
        ANCHOS_COLUMNA.MONTO,     // Monto
        ANCHOS_COLUMNA.MONTO,     // Precio del Servicio
        ANCHOS_COLUMNA.FECHA,     // Fecha de Pago
        ANCHOS_COLUMNA.NOMBRE,    // Cliente
        ANCHOS_COLUMNA.NOMBRE,    // Empresa
        ANCHOS_COLUMNA.SERVICIO,  // Servicio
        ANCHOS_COLUMNA.NOMBRE,    // Usuario
        ANCHOS_COLUMNA.ID,        // Orden Servicio
        ANCHOS_COLUMNA.DESCRIPCION, // Expediente
        ANCHOS_COLUMNA.ESTADO,    // Estado
        ANCHOS_COLUMNA.DESCRIPCION, // N° Comprobante
        ANCHOS_COLUMNA.DESCRIPCION  // Transaction ID
      ];

      // Generar Excel con logo y colores de la app
      await excelService.generarExcel(
        datosExcel,
        encabezados,
        {
          nombreHoja: 'Pagos',
          nombreArchivo: excelService.generarNombreArchivo('pagos'),
          anchosColumnas,
          titulo: 'Reporte de Pagos',
          incluirLogo: true,
          filasAlternadas: true
        }
      );
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Archivo Excel descargado exitosamente.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
        }
      });
    } catch (err) {
      console.error('❌ [TablaPagos] Error generando Excel:', err);
      
      let errorMessage = 'No se pudo generar el reporte. Por favor, intenta nuevamente.';
      if (err.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="w-full max-w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error && pagos.length === 0) {
    return (
      <div className="w-full max-w-full flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={cargarPagos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between px-4 mb-4 w-full">
        <input
          type="text"
          placeholder="Buscar por ID pago, cliente, servicio, método de pago, referencia, número de comprobante..."
          className="form-control w-50 h-9 text-sm border border-gray-300 rounded-md px-3"
          value={busqueda}
          onChange={handleBusquedaChange}
        />
        <DownloadButton
          type="excel"
          onClick={handleDescargarExcel}
          title="Descargar Excel"
        />
      </div>

      {error && (
        <div className="mb-4 px-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
            <button
              onClick={cargarPagos}
              className="mt-2 text-sm underline hover:text-yellow-900"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-300 z-40">
        <div className="overflow-x-auto w-full">
          <table className="table-auto w-full divide-y divide-gray-100 min-w-[1200px]">
            <thead className="text-left text-xs text-gray-500 bg-gray-50">
              <tr>
                <th className="px-2 py-3 font-bold text-center w-16">ID</th>
                <th className="px-2 py-3 font-bold text-center w-24">Monto</th>
                <th className="px-2 py-3 font-bold text-center w-24">Precio Servicio</th>
                <th className="px-2 py-3 font-bold text-center w-24">Fecha</th>
                <th className="px-2 py-3 font-bold text-center w-32">Cliente</th>
                <th className="px-2 py-3 font-bold text-center w-32">Servicio</th>
                <th className="px-2 py-3 font-bold text-center w-28">Usuario</th>
                <th className="px-2 py-3 font-bold text-center w-28">Orden/Exp.</th>
                <th className="px-2 py-3 font-bold text-center w-24">Estado</th>
                <th className="px-2 py-3 font-bold text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 text-center">
              {datos.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Cargando...' : 'No hay pagos disponibles'}
                  </td>
                </tr>
              ) : (
                datos.map((item, idx) => {
                  const { color, texto } = getEstadoPagoBadge(item.estado);
                  const idPago = item.id_pago || item.id;
                  const estaDescargando = descargandoComprobante === idPago;
                  
                  // Obtener información del cliente
                  const nombreCliente = item.cliente?.marca || 
                                       (item.cliente?.nombre && item.cliente?.apellido 
                                         ? `${item.cliente.nombre} ${item.cliente.apellido}` 
                                         : item.cliente?.nombre || item.cliente?.apellido || '-');
                  
                  // Obtener información del servicio
                  const nombreServicio = item.servicio?.nombre || '-';
                  
                  // Obtener información del usuario (solo iniciales o nombre corto)
                  const nombreUsuario = item.usuario?.nombre && item.usuario?.apellido
                                        ? `${item.usuario.nombre.split(' ')[0]} ${item.usuario.apellido.split(' ')[0]}`
                                        : item.usuario?.nombre?.split(' ')[0] || item.usuario?.apellido?.split(' ')[0] || '-';
                  
                  // Obtener expediente
                  const expediente = item.solicitud?.numero_expediente || '-';
                  const ordenServicio = item.id_orden_servicio || item.solicitud?.id_orden_servicio || '-';
                  
                  return (
                    <tr key={idPago || idx} className="hover:bg-gray-50">
                      <td className="px-2 py-3 font-medium">{idPago || '-'}</td>
                      <td className="px-2 py-3 font-semibold text-xs">
                        ${(item.monto_pagado || item.monto || item.monto_pago || item.valor || item.solicitud?.total_orden_servicio || item.solicitud?.total_estimado || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-2 py-3 font-semibold text-xs text-green-700">
                        ${(item.servicio?.precio_base || item.solicitud?.total_estimado || item.servicio?.precio || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-2 py-3 text-xs">
                        {item.fecha_pago 
                          ? new Date(item.fecha_pago).toLocaleDateString('es-CO', {
                              year: '2-digit',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="px-2 py-3 text-left">
                        <div className="max-w-[120px] truncate text-xs" title={nombreCliente + (item.empresa?.nombre ? ` - ${item.empresa.nombre}` : '')}>
                          {nombreCliente}
                        </div>
                        {item.empresa?.nombre && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[120px]" title={item.empresa.nombre}>
                            {item.empresa.nombre}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-3 text-left">
                        <div className="max-w-[120px] truncate text-xs" title={nombreServicio}>
                          {nombreServicio}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-left">
                        <div className="max-w-[100px] truncate text-xs" title={item.usuario?.correo || nombreUsuario}>
                          {nombreUsuario}
                        </div>
                        {item.usuario?.correo && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[100px]" title={item.usuario.correo}>
                            {item.usuario.correo.split('@')[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-3 text-xs">
                        <div className="font-medium">#{ordenServicio}</div>
                        {expediente !== '-' && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[100px]" title={expediente}>
                            {expediente}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span style={{ color, fontWeight: 600, fontSize: "11px" }} className="px-1.5 py-0.5 rounded">
                          {texto || item.estado || '-'}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              abrirDetalle(item);
                            }}
                            className="p-1.5 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-8 w-8 border border-gray-300 transition-all duration-200 cursor-pointer"
                            title="Ver detalle"
                            type="button"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDescargarComprobante(item, e)}
                            disabled={estaDescargando || !idPago}
                            className="p-1.5 rounded bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-8 w-8 border border-blue-300 transition-all duration-200 cursor-pointer relative z-10"
                            title={estaDescargando ? "Descargando..." : "Descargar comprobante"}
                            type="button"
                          >
                            {estaDescargando ? (
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="text-sm text-gray-700">
              Mostrando {" "}
              <span className="font-medium">
                {totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina + 1}
              </span>{" "}
              a {" "}
              <span className="font-medium">
                {Math.min(paginaActual * registrosPorPagina, totalRegistros)}
              </span>{" "}
              de <span className="font-medium">{totalRegistros}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
              >
                <FaChevronLeft className="text-base" />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginaActual(pagina)}
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold transition border ${paginaActual === pagina
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                >
                  {pagina}
                </button>
              ))}
              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
              >
                <FaChevronRight className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>

      <VerDetallePago
        datos={detalleSeleccionado}
        isOpen={modalAbierto}
        onClose={cerrarDetalle}
      />
    </div>
  );
};

export default Tablapagos;