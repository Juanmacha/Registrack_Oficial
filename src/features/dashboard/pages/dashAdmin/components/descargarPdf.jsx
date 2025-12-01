import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import DownloadButton from "../../../../../shared/components/DownloadButton";

const BotonDescargarPdf = ({ datos, nombreArchivo = "reporte.pdf", chartRef }) => {
  const exportarPdf = async () => {
    let swalInstance = null;
    
    try {
      // Mostrar loading
      swalInstance = Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const pdf = new jsPDF("landscape", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Título del reporte
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Distribución de Ingresos por Servicio", pageWidth / 2, 25, { align: "center" });

      // Fecha del reporte
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const fecha = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      pdf.text(`Fecha: ${fecha}`, pageWidth - margin, 35, { align: "right" });

      // Validar datos
      if (!datos || !Array.isArray(datos) || datos.length === 0) {
        throw new Error("No hay datos para generar el PDF");
      }

      // Normalizar datos - puede venir como Cantidad o Ingresos
      const datosNormalizados = datos.map(item => ({
        Servicio: item.Servicio || item.servicio || 'N/A',
        Ingresos: item.Ingresos || item.Cantidad || item.ingresos || item.cantidad || 0,
        Porcentaje: item.Porcentaje || item.porcentaje || '0%'
      }));

      const total = datosNormalizados.reduce((sum, item) => sum + (typeof item.Ingresos === 'number' ? item.Ingresos : parseFloat(item.Ingresos) || 0), 0);

      // Si tenemos referencia al chart, capturarlo con timeout
      let chartImageAdded = false;
      if (chartRef && chartRef.current) {
        try {
          // Esperar un momento para asegurar que el chart esté renderizado
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const canvas = await Promise.race([
            html2canvas(chartRef.current, {
              scale: 3,
              useCORS: true,
              allowTaint: false,
              backgroundColor: "#ffffff",
              logging: false,
              width: chartRef.current.offsetWidth,
              height: chartRef.current.offsetHeight
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout al capturar el gráfico')), 15000)
            )
          ]);

          const imgData = canvas.toDataURL("image/png", 1.0);
          const maxWidth = 100;
          const maxHeight = 100;
          const imgWidth = Math.min(maxWidth, (canvas.width * maxHeight) / canvas.height);
          const imgHeight = Math.min(maxHeight, (canvas.height * maxWidth) / canvas.width);
          
          // Posicionar la imagen centrada en el lado izquierdo
          const chartX = margin;
          const chartY = 50;
          pdf.addImage(imgData, "PNG", chartX, chartY, imgWidth, imgHeight);
          chartImageAdded = true;
        } catch (error) {
          console.error("Error capturando chart:", error);
          // Continuar sin la imagen del gráfico
        }
      }

      // Tabla de datos - ajustar posición según si hay gráfico
      const tableX = chartImageAdded ? margin + 110 : margin;
      const tableY = 50;
      const colWidths = [60, 35, 35]; // Anchos de columnas ajustados
      const rowHeight = 7;
      const startX = tableX;

      // Fondo para encabezados
      pdf.setFillColor(240, 240, 240);
      pdf.rect(startX, tableY - 6, colWidths[0] + colWidths[1] + colWidths[2], 8, 'F');

      // Encabezados de la tabla
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Servicio", startX + 2, tableY);
      pdf.text("Ingresos", startX + colWidths[0] + 2, tableY);
      pdf.text("Porcentaje", startX + colWidths[0] + colWidths[1] + 2, tableY);

      // Línea separadora debajo de encabezados
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(startX, tableY + 1, startX + colWidths[0] + colWidths[1] + colWidths[2], tableY + 1);

      // Datos de la tabla
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(50, 50, 50);
      
      datosNormalizados.forEach((item, index) => {
        const y = tableY + (index + 1) * rowHeight + 3;
        const ingresos = typeof item.Ingresos === 'number' ? item.Ingresos : parseFloat(item.Ingresos) || 0;
        const porcentaje = item.Porcentaje || (total > 0 ? ((ingresos / total) * 100).toFixed(1) + '%' : '0.0%');
        
        // Truncar nombre de servicio si es muy largo
        const servicioNombre = item.Servicio.length > 25 ? item.Servicio.substring(0, 22) + '...' : item.Servicio;
        
        // Formatear ingresos con separadores de miles
        const ingresosFormateado = ingresos.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        
        pdf.text(servicioNombre, startX + 2, y);
        pdf.text(`$${ingresosFormateado}`, startX + colWidths[0] + 2, y);
        pdf.text(porcentaje.toString().replace('%', '') + '%', startX + colWidths[0] + colWidths[1] + 2, y);
        
        // Línea separadora entre filas
        if (index < datosNormalizados.length - 1) {
          pdf.setDrawColor(230, 230, 230);
          pdf.line(startX, y + 2, startX + colWidths[0] + colWidths[1] + colWidths[2], y + 2);
        }
      });

      // Resumen total con fondo
      const totalY = tableY + (datosNormalizados.length + 1) * rowHeight + 5;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(startX, totalY - 4, colWidths[0] + colWidths[1] + colWidths[2], 6, 'F');
      
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.5);
      pdf.line(startX, totalY - 4, startX + colWidths[0] + colWidths[1] + colWidths[2], totalY - 4);
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("TOTAL", startX + 2, totalY);
      
      const totalFormateado = total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      pdf.text(`$${totalFormateado}`, startX + colWidths[0] + 2, totalY);
      pdf.text("100%", startX + colWidths[0] + colWidths[1] + 2, totalY);

      // Guardar el PDF
      pdf.save(nombreArchivo);

      // Cerrar loading y mostrar éxito
      await Swal.close();
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Archivo PDF descargado exitosamente.',
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
      console.error("Error generando PDF:", error);
      
      // Cerrar loading si está abierto
      if (swalInstance) {
        await Swal.close();
      }
      
      // Mostrar error
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al generar el PDF. Por favor, intenta nuevamente.",
        confirmButtonText: "Aceptar"
      });
    }
  };

  return (
    <DownloadButton
      type="pdf"
      onClick={exportarPdf}
      title="Descargar PDF"
    />
  );
};

export default BotonDescargarPdf; 