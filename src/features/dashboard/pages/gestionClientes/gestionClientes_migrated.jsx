// Ejemplo de migración: gestionClientes.jsx usando el sistema centralizado
// Este archivo muestra cómo migrar desde el sistema anterior al nuevo

import React, { useEffect, useState } from "react";
import TablaClientes from "./components/tablaClientes";
import VerDetalleCliente from "./components/verDetalleCliente";
import { ClientService } from "../../../../utils/mockDataService"; // ✅ Nuevo import
import "bootstrap-icons/font/bootstrap-icons.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

const GestionClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [deshabilitarAcciones, setDeshabilitarAcciones] = useState(false);
  const clientesPorPagina = 5;

  useEffect(() => {
    // ✅ NUEVO: Usar el servicio centralizado
    const cargarClientes = () => {
      const clientesData = ClientService.getAll();
      setClientes(clientesData);
    };

    cargarClientes();
  }, []);

  function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const clientesFiltrados = clientes.filter((c) => {
    const texto = `${c.documento} ${c.nombre} ${c.apellido} ${c.email} ${c.telefono} ${c.estado} ${c.nitEmpresa} ${c.nombreEmpresa} ${c.marca} ${c.tipoPersona}`;
    return normalizarTexto(texto).includes(normalizarTexto(busqueda));
  });

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicio = (paginaActual - 1) * clientesPorPagina;
  const indiceFin = indiceInicio + clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFin);

  const handleVer = (cliente) => {
    setSelectedCliente(cliente);
    setMostrarModalVer(true);
  };

  const handleEditar = (cliente) => {
    // ✅ NUEVO: Usar el servicio para actualizar
    const clienteActualizado = ClientService.update(cliente.id, {
      // Aquí irían los datos actualizados
      ...cliente,
      // Ejemplo de actualización
      telefono: cliente.telefono + " (actualizado)"
    });
    
    if (clienteActualizado) {
      // Actualizar el estado local
      setClientes(prev => prev.map(c => 
        c.id === cliente.id ? clienteActualizado : c
      ));
    }
  };

  const handleEliminar = (cliente) => {
    const confirmacion = confirm(`¿Eliminar a ${cliente.nombre}?`);
    if (confirmacion) {
      // ✅ NUEVO: Usar el servicio para eliminar
      const eliminado = ClientService.delete(cliente.id);
      
      if (eliminado) {
        // Actualizar el estado local
        setClientes(prev => prev.filter(c => c.id !== cliente.id));
      }
    }
  };

  const handleCrearCliente = (nuevoCliente) => {
    // ✅ NUEVO: Usar el servicio para crear
    const clienteCreado = ClientService.create({
      tipoDocumento: nuevoCliente.tipoDocumento,
      documento: nuevoCliente.documento,
      nombre: nuevoCliente.nombre,
      apellido: nuevoCliente.apellido,
      email: nuevoCliente.email,
      telefono: nuevoCliente.telefono,
      nitEmpresa: nuevoCliente.nitEmpresa,
      nombreEmpresa: nuevoCliente.nombreEmpresa,
      marca: nuevoCliente.marca,
      tipoPersona: nuevoCliente.tipoPersona
    });

    if (clienteCreado) {
      // Actualizar el estado local
      setClientes(prev => [...prev, clienteCreado]);
    }
  };

  const exportarExcel = () => {
    const encabezados = [
      "Tipo Documento",
      "Documento",
      "Nombre",
      "Apellido",
      "Email",
      "Teléfono",
      "NIT Empresa",
      "Nombre Empresa",
      "Marca",
      "Tipo Persona",
      "Estado"
    ];

    const datosExcel = clientes.map((cliente) => ({
      "Tipo Documento": cliente.tipoDocumento,
      "Documento": cliente.documento,
      "Nombre": cliente.nombre,
      "Apellido": cliente.apellido,
      "Email": cliente.email,
      "Teléfono": cliente.telefono,
      "NIT Empresa": cliente.nitEmpresa,
      "Nombre Empresa": cliente.nombreEmpresa,
      "Marca": cliente.marca,
      "Tipo Persona": cliente.tipoPersona,
      "Estado": cliente.estado
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel, {
      header: encabezados,
    });

    // Estilo de encabezados
    const headerStyle = {
      fill: { fgColor: { rgb: "D9E1F2" } },
      font: { bold: true },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cell_address]) continue;
      worksheet[cell_address].s = headerStyle;
    }

    // Ajustar el ancho de las columnas
    worksheet["!cols"] = [
      { wch: 15 }, // Tipo Documento
      { wch: 15 }, // Documento
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido
      { wch: 25 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 15 }, // NIT Empresa
      { wch: 25 }, // Nombre Empresa
      { wch: 20 }, // Marca
      { wch: 15 }, // Tipo Persona
      { wch: 10 }, // Estado
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "clientes.xlsx");
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

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto px-4 bg-[#eceded] min-h-screen">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex mt-12 justify-center">
          <div className="w-full px-4">
            {/* Barra superior */}
            <div className="flex items-center justify-between px-4 mb-4 w-full">
              <input
                type="text"
                placeholder="Buscar"
                className="form-control w-50 h-9 text-sm border border-gray-300 rounded-md px-3"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
              />

              <div className="flex gap-3">
                <button
                  className="btn btn-primary px-4 py-2 text-sm rounded-md whitespace-nowrap"
                  onClick={() => {/* Aquí iría la lógica para crear cliente */}}
                >
                  <i className="bi bi-plus-square"></i> Crear Cliente
                </button>
                <button
                  className="p-2 rounded-full bg-white text-green-600 hover:bg-green-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-green-200"
                  onClick={exportarExcel}
                  title="Descargar Excel"
                >
                  <i className="bi bi-file-earmark-excel-fill text-sm"></i>
                </button>
              </div>
            </div>

            {/* Tabla de clientes */}
            <TablaClientes
              clientes={clientesPaginados}
              onVer={handleVer}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
            />

            {/* Modal de ver detalle */}
            {mostrarModalVer && selectedCliente && (
              <VerDetalleCliente
                showModal={mostrarModalVer}
                setShowModal={setMostrarModalVer}
                cliente={selectedCliente}
              />
            )}

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando {" "}
                <span className="font-medium">
                  {clientesFiltrados.length === 0 ? 0 : indiceInicio + 1}
                </span>{" "}
                a {" "}
                <span className="font-medium">
                  {Math.min(indiceFin, clientesFiltrados.length)}
                </span>{" "}
                de {" "}
                <span className="font-medium">{clientesFiltrados.length}</span>{" "}
                resultados
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => irAPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
                >
                  <i className="bi bi-chevron-left text-base"></i>
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => irAPagina(pagina)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold transition border ${
                      paginaActual === pagina
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
                <button
                  onClick={() => irAPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-9 w-9 border border-blue-200"
                >
                  <i className="bi bi-chevron-right text-base"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionClientes; 