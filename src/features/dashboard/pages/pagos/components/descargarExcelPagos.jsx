import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import DownloadButton from "../../../../../shared/components/DownloadButton";

const DescargarExcelPagos = ({ pagos }) => {
  const exportarExcel = () => {
    const encabezados = ["ID Pago", "Monto", "Fecha", "Método", "Orden de Servicio", "Estado"];

    const datosExcel = pagos.map((p) => ({
      "ID Pago": p.id_pago,
      "Monto": p.monto,
      "Fecha": new Date(p.fecha_pago).toLocaleDateString(),
      "Método": p.metodo_pago,
      "Orden de Servicio": p.id_orden_servicio,
      "Estado": p.estado ? "Completado" : "Fallido",
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel, { header: encabezados });

    worksheet["!cols"] = [
      { wch: 10 }, // ID Pago
      { wch: 15 }, // Monto
      { wch: 15 }, // Fecha
      { wch: 20 }, // Método
      { wch: 20 }, // Orden
      { wch: 15 }, // Estado
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, "pagos.xlsx");

    // ✅ Mostrar mensaje con SweetAlert2
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

export default DescargarExcelPagos;
