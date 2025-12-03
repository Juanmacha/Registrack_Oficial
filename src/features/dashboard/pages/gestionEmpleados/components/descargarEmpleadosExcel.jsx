import React, { useState } from "react";
import excelService from '../../../../../shared/services/excelService';
import { ANCHOS_COLUMNA } from '../../../../../shared/utils/excelStyles';
import Swal from "sweetalert2";
import DownloadButton from "../../../../../shared/components/DownloadButton";

const DescargarExcelEmpleados = ({ empleados }) => {
  const [downloading, setDownloading] = useState(false);

  const exportarExcel = async () => {
    setDownloading(true);

    try {
      console.log('🔄 [DescargarExcel] Generando reporte Excel...');
      
      const encabezados = [
        "ID",
        "Tipo de Documento",
        "Documento",
        "Nombre",
        "Apellidos",
        "Email",
        "Rol",
        "Estado",
      ];

      const datosExcel = empleados.map((e) => ({
        ID: e.id || '',
        "Tipo de Documento": e.tipoDocumento || '',
        Documento: e.documento || '',
        Nombre: e.nombre || '',
        Apellidos: e.apellidos || '',
        Email: e.email || '',
        Rol: e.rol || '',
        Estado: e.estado || '',
      }));

      const anchosColumnas = [
        ANCHOS_COLUMNA.ID,        // ID
        ANCHOS_COLUMNA.TIPO,     // Tipo de Documento
        ANCHOS_COLUMNA.DOCUMENTO, // Documento
        ANCHOS_COLUMNA.NOMBRE,   // Nombre
        ANCHOS_COLUMNA.NOMBRE,   // Apellidos
        ANCHOS_COLUMNA.EMAIL,    // Email
        ANCHOS_COLUMNA.TIPO,     // Rol
        ANCHOS_COLUMNA.ESTADO    // Estado
      ];

      await excelService.generarExcel(
        datosExcel,
        encabezados,
        {
          nombreHoja: 'Empleados',
          nombreArchivo: excelService.generarNombreArchivo('empleados'),
          anchosColumnas,
          titulo: 'Reporte de Empleados',
          incluirLogo: true,
          filasAlternadas: true
        }
      );

      console.log('✅ [DescargarExcel] Reporte Excel generado');
      
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
    } catch (error) {
      console.error('💥 [DescargarExcel] Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al descargar el reporte: " + (error.message || 'Error desconocido'),
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DownloadButton
      type="excel"
      onClick={exportarExcel}
      title={downloading ? "Descargando..." : "Descargar Excel"}
      disabled={downloading}
    />
  );
};

export default DescargarExcelEmpleados;
