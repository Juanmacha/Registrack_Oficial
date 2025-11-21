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
        const busquedaLower = busqueda.toLowerCase();
        // Buscar en datos del pago
        const matchPago = 
          (p.id_pago ? p.id_pago.toString().includes(busqueda) : false) ||
          (p.metodo_pago ? p.metodo_pago.toLowerCase().includes(busquedaLower) : false) ||
          (p.id_orden_servicio ? p.id_orden_servicio.toString().includes(busqueda) : false) ||
          (p.referencia ? p.referencia.toLowerCase().includes(busquedaLower) : false) ||
          (p.numero_comprobante ? p.numero_comprobante.toLowerCase().includes(busquedaLower) : false) ||
          (p.transaction_id ? p.transaction_id.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del cliente
        const matchCliente = 
          (p.cliente?.marca ? p.cliente.marca.toLowerCase().includes(busquedaLower) : false) ||
          (p.cliente?.nombre ? p.cliente.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.cliente?.apellido ? p.cliente.apellido.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del servicio
        const matchServicio = 
          (p.servicio?.nombre ? p.servicio.nombre.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos del usuario
        const matchUsuario = 
          (p.usuario?.nombre ? p.usuario.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.usuario?.apellido ? p.usuario.apellido.toLowerCase().includes(busquedaLower) : false) ||
          (p.usuario?.correo ? p.usuario.correo.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos de la empresa
        const matchEmpresa = 
          (p.empresa?.nombre ? p.empresa.nombre.toLowerCase().includes(busquedaLower) : false) ||
          (p.empresa?.nit ? p.empresa.nit.toLowerCase().includes(busquedaLower) : false);
        
        // Buscar en datos de la solicitud
        const matchSolicitud = 
          (p.solicitud?.numero_expediente ? p.solicitud.numero_expediente.toLowerCase().includes(busquedaLower) : false) ||
          (p.solicitud?.estado ? p.solicitud.estado.toLowerCase().includes(busquedaLower) : false);
        
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
      console.log('🔧 [TablaPagos] Generando PDF para pago:', pago);
      const { color, texto } = getEstadoPagoBadge(pago.estado);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      // Colores
      const colorAzul = [37, 99, 235]; // blue-600
      const colorVerde = [34, 197, 94]; // green-500
      const colorGris = [107, 114, 128]; // gray-500

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
      doc.setTextColor(...colorVerde);
      const monto = `$${(pago.monto || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text('Monto Pagado:', margin, y);
      doc.text(monto, pageWidth - margin, y, { align: 'right' });
      y += 12;

      // Información del pago
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      const infoPago = [
        ['ID de Pago:', pago.id_pago || pago.id || 'N/A'],
        ['Fecha de Pago:', formatearFechaCorta(pago.fecha_pago)],
        ['Método de Pago:', pago.metodo_pago || 'N/A'],
        ['Estado:', texto || pago.estado || 'N/A'],
        ['Número de Comprobante:', pago.numero_comprobante || 'N/A'],
        ['Transaction ID:', pago.transaction_id || 'N/A'],
      ];

      infoPago.forEach(([label, value]) => {
        if (value && value !== 'N/A') {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, y);
          doc.setFont('helvetica', 'normal');
          const valueStr = value !== null && value !== undefined ? String(value) : 'N/A';
          doc.text(valueStr, margin + 60, y);
          y += 7;
        }
      });

      y += 5;

      // Información del Cliente
      if (pago.cliente || pago.empresa) {
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

        if (pago.cliente) {
          if (pago.cliente.marca) {
            doc.setFont('helvetica', 'bold');
            doc.text('Marca:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(pago.cliente.marca || ''), margin + 30, y);
            y += 6;
          }
          if (pago.cliente.nombre || pago.cliente.apellido) {
            const nombreCompleto = pago.cliente.nombre && pago.cliente.apellido
              ? `${pago.cliente.nombre} ${pago.cliente.apellido}`
              : pago.cliente.nombre || pago.cliente.apellido || '';
            if (nombreCompleto) {
              doc.setFont('helvetica', 'bold');
              doc.text('Nombre:', margin, y);
              doc.setFont('helvetica', 'normal');
              doc.text(String(nombreCompleto), margin + 30, y);
              y += 6;
            }
          }
          if (pago.cliente.tipo_persona) {
            doc.setFont('helvetica', 'bold');
            doc.text('Tipo de Persona:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(pago.cliente.tipo_persona || ''), margin + 50, y);
            y += 6;
          }
          if (pago.cliente.correo) {
            doc.setFont('helvetica', 'bold');
            doc.text('Correo:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(pago.cliente.correo || ''), margin + 30, y);
            y += 6;
          }
        }

        if (pago.empresa) {
          if (pago.empresa.nombre) {
            doc.setFont('helvetica', 'bold');
            doc.text('Empresa:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(pago.empresa.nombre || ''), margin + 30, y);
            y += 6;
          }
          if (pago.empresa.nit) {
            doc.setFont('helvetica', 'bold');
            doc.text('NIT:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(pago.empresa.nit), margin + 20, y);
            y += 6;
          }
        }

        y += 5;
      }

      // Información del Servicio
      if (pago.servicio) {
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

        if (pago.servicio.nombre) {
          doc.setFont('helvetica', 'bold');
          doc.text('Servicio:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(pago.servicio.nombre || ''), margin + 35, y);
          y += 6;
        }
        if (pago.servicio.precio_base !== undefined) {
          doc.setFont('helvetica', 'bold');
          doc.text('Precio Base:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`$${pago.servicio.precio_base.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 40, y);
          y += 6;
        }

        y += 5;
      }

      // Información de la Solicitud
      if (pago.solicitud) {
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

        if (pago.solicitud.numero_expediente) {
          doc.setFont('helvetica', 'bold');
          doc.text('Expediente:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(pago.solicitud.numero_expediente || ''), margin + 40, y);
          y += 6;
        }
        if (pago.solicitud.estado) {
          doc.setFont('helvetica', 'bold');
          doc.text('Estado:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(pago.solicitud.estado || ''), margin + 30, y);
          y += 6;
        }
        if (pago.solicitud.total_estimado !== undefined) {
          doc.setFont('helvetica', 'bold');
          doc.text('Total Estimado:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`$${pago.solicitud.total_estimado.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 50, y);
          y += 6;
        }

        y += 5;
      }

      // Información del Usuario
      if (pago.usuario) {
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

        if (pago.usuario.nombre || pago.usuario.apellido) {
          const nombreUsuario = pago.usuario.nombre && pago.usuario.apellido
            ? `${pago.usuario.nombre} ${pago.usuario.apellido}`
            : pago.usuario.nombre || pago.usuario.apellido || '';
          if (nombreUsuario) {
            doc.setFont('helvetica', 'bold');
            doc.text('Nombre:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(nombreUsuario), margin + 30, y);
            y += 6;
          }
        }
        if (pago.usuario.correo) {
          doc.setFont('helvetica', 'bold');
          doc.text('Correo:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(pago.usuario.correo || ''), margin + 30, y);
          y += 6;
        }
        if (pago.usuario.documento || pago.usuario.numero_documento || pago.usuario.cedula || pago.usuario.numero_cedula) {
          const documento = pago.usuario.documento || pago.usuario.numero_documento || pago.usuario.cedula || pago.usuario.numero_cedula;
          doc.setFont('helvetica', 'bold');
          doc.text('Documento:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(documento), margin + 40, y);
          y += 6;
        }

        y += 5;
      }

      // Observaciones
      if (pago.observaciones) {
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
        const observaciones = doc.splitTextToSize(pago.observaciones, pageWidth - 2 * margin);
        doc.text(observaciones, margin, y);
        y += observaciones.length * 5 + 5;
      }

      // Pie de página
      const fechaGeneracion = new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.setDrawColor(...colorGris);
      doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...colorGris);
      doc.text(`Comprobante generado el ${fechaGeneracion}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text('Este documento es un comprobante de pago válido', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text('Registrack - Sistema de Gestión de Marcas', pageWidth / 2, pageHeight - 10, { align: 'center' });

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
      
      // Pequeño delay para asegurar que el PDF se genere
      setTimeout(() => {
        setDescargandoComprobante(null);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Comprobante generado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }, 500);
      
    } catch (err) {
      console.error('❌ [TablaPagos] Error generando comprobante:', err);
      setDescargandoComprobante(null);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo generar el comprobante. Por favor, intenta nuevamente.',
      });
    }
  };

  // Descargar reporte Excel desde la API
  const handleDescargarExcel = async () => {
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

      // Mostrar indicador de carga
      Swal.fire({
        title: 'Descargando reporte...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      console.log('🔧 [TablaPagos] Descargando reporte Excel...');
      const { blob, filename } = await pagosApiService.descargarReporteExcel(token);
      
      // Descargar el archivo
      saveAs(blob, filename);
      
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Reporte Excel descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('❌ [TablaPagos] Error descargando reporte Excel:', err);
      Swal.close();
      
      let errorMessage = 'No se pudo descargar el reporte. Por favor, intenta nuevamente.';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 403) {
        errorMessage = 'No tienes permisos para descargar el reporte';
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
          placeholder="Buscar por ID, cliente, servicio, usuario, empresa, expediente, método, referencia, transaction ID..."
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
                <th className="px-2 py-3 font-bold text-center w-24">Fecha</th>
                <th className="px-2 py-3 font-bold text-center w-20">Método</th>
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
                        ${item.monto?.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
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
                      <td className="px-2 py-3">
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium whitespace-nowrap">
                          {item.metodo_pago || '-'}
                        </span>
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
