import React, { useEffect, useState } from "react";
import TablaClientes from "./components/tablaClientes";
import VerDetalleCliente from "./components/verDetalleCliente";
import FormularioCliente from "./components/FormularioCliente";
import clientesApiService from "../../services/clientesApiService";
import notificationService from "../../../../shared/services/NotificationService.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import excelService from '../../../../shared/services/excelService';
import { ANCHOS_COLUMNA } from '../../../../shared/utils/excelStyles';
import Swal from "sweetalert2";
import DownloadButton from "../../../../shared/components/DownloadButton";

const CAMPOS_REQUERIDOS = [
  "tipoDocumento",
  "documento", "nombre", "apellido", "email",
  "nitEmpresa", "nombreEmpresa", "marca", "tipoPersona"
];

const GestionClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [deshabilitarAcciones, setDeshabilitarAcciones] = useState(false);
  const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [cargando, setCargando] = useState(false);
  const rolUsuario = "administrador"; // Cambia a "empleado" para probar restricción
  const clientesPorPagina = 5;

  useEffect(() => {
    cargarClientes();
  }, []);

  // Función para cargar clientes desde la API
  const cargarClientes = async () => {
    try {
      setCargando(true);
      console.log('🔄 [GestionClientes] Cargando clientes desde la API...');
      
      const clientesData = await clientesApiService.getAllClientes();
      setClientes(clientesData);
      
      console.log('✅ [GestionClientes] Clientes cargados:', clientesData);
    } catch (error) {
      console.error('❌ [GestionClientes] Error al cargar clientes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar clientes: ' + error.message,
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
      setCargando(false);
    }
  };

  function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCompleto = `${c.nombre} ${c.apellido}`;
    const texto = `${c.documento} ${nombreCompleto} ${c.email} ${c.telefono} ${c.estado} ${c.nitEmpresa} ${c.nombreEmpresa} ${c.marca} ${c.tipoPersona}`;
    return normalizarTexto(texto).includes(normalizarTexto(busqueda));
  });

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicio = (paginaActual - 1) * clientesPorPagina;
  const indiceFin = indiceInicio + clientesPorPagina;
  const clientesPagina = clientesFiltrados.slice(indiceInicio, indiceFin);

  const irAPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) setPaginaActual(num);
  };

  const handleVer = (idx) => {
    setSelectedCliente(clientesPagina[idx]);
    setMostrarModalVer(true);
    setDeshabilitarAcciones(true);
  };

  const handleToggleEstado = async (idx) => {
    try {
    const cliente = clientesPagina[idx];
    const nuevoEstado = cliente.estado === "Activo" ? "Inactivo" : "Activo";
      
      console.log(`🔄 [GestionClientes] Cambiando estado del cliente ${cliente.id} a: ${nuevoEstado}`);
      
      await clientesApiService.changeClienteEstado(cliente.id, nuevoEstado);
      
      console.log('✅ [GestionClientes] Estado cambiado en API');
      
      // Recargar datos
      await cargarClientes();
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Estado del cliente actualizado correctamente.',
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
      console.error('❌ [GestionClientes] Error al cambiar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar estado: ' + error.message,
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

  const handleEditarCliente = (idx) => {
    console.log('🔄 [GestionClientes] Editando cliente en índice:', idx);
    console.log('🔄 [GestionClientes] Cliente a editar:', clientesPagina[idx]);
    console.log('🔄 [GestionClientes] ID del cliente:', clientesPagina[idx]?.id);
    
    setModoEdicion(true);
    setClienteEditar(clientesPagina[idx]);
    setMostrarModalFormulario(true);
  };
  const handleGuardarCliente = async (nuevoCliente) => {
    try {
      console.log(`🔄 [GestionClientes] ${modoEdicion ? 'Actualizando' : 'Creando'} cliente:`, nuevoCliente);
      console.log(`🔄 [GestionClientes] Modo edición:`, modoEdicion);
      console.log(`🔄 [GestionClientes] ID del cliente:`, nuevoCliente.id);
      
      let clienteGuardado;
      
      if (modoEdicion) {
        // Editar cliente existente - usar endpoints específicos según la documentación
        console.log('🔄 [GestionClientes] Actualizando cliente con endpoints específicos...');
        
        // 1. Actualizar datos del usuario asociado al cliente
        const usuarioData = {
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          correo: nuevoCliente.email,
          tipo_documento: nuevoCliente.tipoDocumento,
          documento: nuevoCliente.documento
        };
        
        // Filtrar solo campos que tienen valores
        const usuarioDataFiltrado = Object.fromEntries(
          Object.entries(usuarioData).filter(([key, value]) => value !== undefined && value !== '')
        );
        
        if (Object.keys(usuarioDataFiltrado).length > 0) {
          console.log('🔄 [GestionClientes] Actualizando datos del usuario...');
          await clientesApiService.updateUsuarioCliente(nuevoCliente.id, usuarioDataFiltrado);
          console.log('✅ [GestionClientes] Usuario actualizado en API');
        }
        
        // 2. Actualizar datos de la empresa si hay cambios
        if (nuevoCliente.id_empresa && (
          nuevoCliente.direccionEmpresa || 
          nuevoCliente.telefonoEmpresa || 
          nuevoCliente.correoEmpresa ||
          nuevoCliente.ciudadEmpresa ||
          nuevoCliente.paisEmpresa
        )) {
          console.log('🔄 [GestionClientes] Actualizando datos de empresa...');
          
          const empresaData = {
            id_empresa: nuevoCliente.id_empresa,
            direccion: nuevoCliente.direccionEmpresa || '',
            telefono: nuevoCliente.telefonoEmpresa || '',
            email: nuevoCliente.correoEmpresa || '',
            ciudad: nuevoCliente.ciudadEmpresa || '',
            pais: nuevoCliente.paisEmpresa || ''
          };
          
          await clientesApiService.updateEmpresaCliente(nuevoCliente.id, empresaData);
          console.log('✅ [GestionClientes] Empresa actualizada en API');
        }
        
        // 3. Actualizar datos básicos del cliente (marca, tipo_persona, estado)
        const clienteData = {
          marca: nuevoCliente.marca,
          tipoPersona: nuevoCliente.tipoPersona,
          estado: nuevoCliente.estado
        };
        
        clienteGuardado = await clientesApiService.updateCliente(nuevoCliente.id, clienteData);
        console.log('✅ [GestionClientes] Cliente actualizado en API:', clienteGuardado);
        } else {
        // Crear nuevo cliente
        clienteGuardado = await clientesApiService.createCliente(nuevoCliente);
        console.log('✅ [GestionClientes] Cliente creado en API');
      }
      
      // Cerrar modal
          setMostrarModalFormulario(false);
      
      // Recargar datos
      await cargarClientes();
      
      // Mostrar alerta de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: modoEdicion ? 'Cliente, usuario y empresa actualizados correctamente.' : 'Cliente creado correctamente.',
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
      console.error("❌ [GestionClientes] Error al guardar cliente:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (modoEdicion ? 'Error al actualizar cliente: ' : 'Error al crear cliente: ') + error.message,
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

  const handleExportarExcel = async () => {
    try {
      console.log('🔄 [GestionClientes] Generando reporte Excel...');
      
      const encabezados = [
        "ID", "Nombre", "Apellido", "Tipo Documento", "Documento", "Email", "Teléfono",
        "Nit Empresa", "Nombre Empresa", "Marca", "Tipo Persona", "Origen", "Estado"
      ];
      
      const datosExcel = clientesFiltrados.map(c => ({
        "ID": c.id || '',
        "Nombre": c.nombre || '',
        "Apellido": c.apellido || '',
        "Tipo Documento": c.tipoDocumento || '',
        "Documento": c.documento || '',
        "Email": c.email || '',
        "Teléfono": c.telefono || '',
        "Nit Empresa": c.nitEmpresa || '',
        "Nombre Empresa": c.nombreEmpresa || '',
        "Marca": c.marca || '',
        "Tipo Persona": c.tipoPersona || '',
        "Origen": c.origen || '',
        "Estado": c.estado || ''
      }));
      
      const anchosColumnas = [
        ANCHOS_COLUMNA.ID,        // ID
        ANCHOS_COLUMNA.NOMBRE,    // Nombre
        ANCHOS_COLUMNA.NOMBRE,    // Apellido
        ANCHOS_COLUMNA.TIPO,      // Tipo Documento
        ANCHOS_COLUMNA.DOCUMENTO, // Documento
        ANCHOS_COLUMNA.EMAIL,     // Email
        ANCHOS_COLUMNA.TELEFONO,  // Teléfono
        ANCHOS_COLUMNA.NIT,       // Nit Empresa
        ANCHOS_COLUMNA.NOMBRE_EMPRESA, // Nombre Empresa
        ANCHOS_COLUMNA.NOMBRE_MARCA,   // Marca
        ANCHOS_COLUMNA.TIPO,      // Tipo Persona
        ANCHOS_COLUMNA.TIPO,      // Origen
        ANCHOS_COLUMNA.ESTADO     // Estado
      ];

      await excelService.generarExcel(
        datosExcel,
        encabezados,
        {
          nombreHoja: 'Clientes',
          nombreArchivo: excelService.generarNombreArchivo('clientes'),
          anchosColumnas,
          titulo: 'Reporte de Clientes',
          incluirLogo: true,
          filasAlternadas: true
        }
      );
      
      console.log('✅ [GestionClientes] Reporte Excel generado');
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
      console.error('❌ [GestionClientes] Error al generar reporte Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al descargar reporte: ' + error.message,
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

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 sm:px-4 mb-4 w-full">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, documento, email, teléfono, marca, razón social..."
            className="form-control w-50 h-9 text-sm border border-gray-300 rounded-md px-3"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />

          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <DownloadButton
              type="excel"
              onClick={handleExportarExcel}
              title="Descargar Excel"
            />
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 mx-2 sm:mx-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="bi bi-info-circle text-blue-500 text-lg"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Los clientes se crean automáticamente
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Los clientes se crean automáticamente cuando los usuarios registrados hacen solicitudes de servicios. 
                No es necesario crear clientes manualmente.
              </p>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando clientes...</p>
            </div>
          </div>
        ) : (
        <TablaClientes
          clientes={clientesPagina}
          onVer={handleVer}
          onToggleEstado={handleToggleEstado}
          deshabilitarAcciones={deshabilitarAcciones}
          onEditar={handleEditarCliente}
        />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 sm:px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Mostrando <span className="font-medium">{clientesFiltrados.length === 0 ? 0 : indiceInicio + 1}</span> a {" "}
            <span className="font-medium">{Math.min(indiceFin, clientesFiltrados.length)}</span> de {" "}
            <span className="font-medium">{clientesFiltrados.length}</span> resultados
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="p-1.5 sm:p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 border border-blue-200"
            >
              <i className="bi bi-chevron-left text-sm sm:text-base"></i>
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                const pagina = i + 1;
                return (
                  <button
                    key={pagina}
                    onClick={() => irAPagina(pagina)}
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-semibold transition border text-xs sm:text-sm ${
                      paginaActual === pagina
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {pagina}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="p-1.5 sm:p-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 border border-blue-200"
            >
              <i className="bi bi-chevron-right text-sm sm:text-base"></i>
            </button>
          </div>
        </div>

        <VerDetalleCliente
          cliente={selectedCliente}
          isOpen={mostrarModalVer}
          onClose={() => {
            setMostrarModalVer(false);
            setDeshabilitarAcciones(false);
          }}
        />
        {mostrarModalFormulario && (
          <FormularioCliente
            cliente={clienteEditar}
            onGuardar={handleGuardarCliente}
            onClose={() => setMostrarModalFormulario(false)}
            modoEdicion={modoEdicion}
            rolUsuario={rolUsuario}
          />
        )}
      </div>
    </div>
  );
};

export default GestionClientes;
