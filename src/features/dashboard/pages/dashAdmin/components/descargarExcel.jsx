import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import DownloadButton from "../../../../../shared/components/DownloadButton";

const BotonDescargarExcel = ({ datos, nombreArchivo = "reporte.xlsx" }) => {
  const exportarExcel = () => {
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, "Datos");
    const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, nombreArchivo);
    
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
  };

  return (
    <DownloadButton
      type="excel"
      onClick={exportarExcel}
      title="Descargar Excel"
    />
  );
};

export default BotonDescargarExcel; 