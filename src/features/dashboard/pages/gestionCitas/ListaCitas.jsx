import React, { useState, useEffect } from 'react';
import { useSidebar } from '../../../../shared/contexts/SidebarContext';
import citasApiService from '../../services/citasApiService.js';
import alertService from '../../../../utils/alertService.js';
import DownloadButton from '../../../../shared/components/DownloadButton';
import { FaCalendarAlt, FaUser, FaClock, FaSearch, FaEye, FaEdit, FaTrash, FaSync } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const ListaCitas = () => {
  const [citas, setCitas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const { isSidebarExpanded } = useSidebar();
  
  const citasPorPagina = 10;

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    setIsLoading(true);
    try {
      console.log('📅 [ListaCitas] Cargando citas desde la API...');
      const result = await citasApiService.getAllCitas();
      
      if (result.success) {
        console.log('✅ [ListaCitas] Citas cargadas:', result.data);
        setCitas(result.data || []);
      } else {
        console.error('❌ [ListaCitas] Error al cargar citas:', result.message);
        await alertService.error('Error', result.message);
      }
    } catch (error) {
      console.error('💥 [ListaCitas] Error al cargar citas:', error);
      await alertService.error('Error', 'Error al cargar las citas');
    } finally {
      setIsLoading(false);
    }
  };

  const normalizarTexto = (texto) => {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // ✅ Función para normalizar tipos de cita y corregir tildes
  const normalizarTipoCita = (tipo) => {
    if (!tipo) return 'Sin tipo';
    
    const tipoLower = tipo.toLowerCase().trim();
    
    // Mapeo de variantes sin tilde o mal escritas a la versión correcta
    const tiposCorregidos = {
      'oposicion': 'Oposición',
      'oposición': 'Oposición',
      'certificacion': 'Certificación',
      'certificación': 'Certificación',
      'cesion': 'Cesión de marca',
      'cesión': 'Cesión de marca',
      'cesion de marca': 'Cesión de marca',
      'cesión de marca': 'Cesión de marca',
      'renovacion': 'Renovación',
      'renovación': 'Renovación',
      'busqueda de antecedentes': 'Búsqueda de antecedentes',
      'búsqueda de antecedentes': 'Búsqueda de antecedentes',
      'búsqueda de antecedente': 'Búsqueda de antecedentes',
      'general': 'General',
      'generales': 'General'
    };
    
    // Buscar coincidencia exacta (case-insensitive)
    const tipoNormalizado = tiposCorregidos[tipoLower];
    if (tipoNormalizado) {
      return tipoNormalizado;
    }
    
    // Si no hay coincidencia exacta, intentar corregir tildes comunes
    let tipoCorregido = tipo;
    
    // Correcciones comunes de tildes
    tipoCorregido = tipoCorregido.replace(/oposicion/gi, 'Oposición');
    tipoCorregido = tipoCorregido.replace(/certificacion/gi, 'Certificación');
    tipoCorregido = tipoCorregido.replace(/cesion/gi, 'Cesión');
    tipoCorregido = tipoCorregido.replace(/renovacion/gi, 'Renovación');
    tipoCorregido = tipoCorregido.replace(/busqueda/gi, 'Búsqueda');
    
    // Capitalizar primera letra si es necesario
    return tipoCorregido.charAt(0).toUpperCase() + tipoCorregido.slice(1);
  };

  const citasFiltradas = citas.filter((cita) => {
    const cliente = cita.cliente?.nombre || '';
    const empleado = cita.empleado?.nombre || '';
    const tipo = cita.tipo || '';
    const estado = cita.estado || '';
    
    const texto = `${cliente} ${empleado} ${tipo} ${estado}`;
    const cumpleBusqueda = normalizarTexto(texto).includes(normalizarTexto(busqueda));
    const cumpleEstado = !filterEstado || cita.estado === filterEstado;
    const cumpleTipo = !filterTipo || cita.tipo === filterTipo;
    
    return cumpleBusqueda && cumpleEstado && cumpleTipo;
  });

  const totalPaginas = Math.ceil(citasFiltradas.length / citasPorPagina);
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const indiceFin = indiceInicio + citasPorPagina;
  const citasPagina = citasFiltradas.slice(indiceInicio, indiceFin);

  const getEstadoBadge = (estado) => {
    const estadoLower = (estado || '').toLowerCase();
    
    if (estadoLower.includes('programada')) return 'text-blue-800 bg-blue-100';
    if (estadoLower.includes('reprogramada')) return 'text-purple-800 bg-purple-100';
    if (estadoLower.includes('anulada') || estadoLower.includes('cancelada')) return 'text-red-800 bg-red-100';
    if (estadoLower.includes('completada') || estadoLower.includes('finalizada')) return 'text-green-800 bg-green-100';
    
    return 'text-gray-800 bg-gray-100';
  };

  const handleReprogramar = async (cita) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Reprogramar Cita',
        html: `
          <div class="text-left">
            <p class="mb-3">Cliente: <strong>${cita.cliente?.nombre || 'N/A'}</strong></p>
            <p class="mb-3">Fecha actual: <strong>${cita.fecha}</strong></p>
            <p class="mb-3">Hora actual: <strong>${cita.hora_inicio} - ${cita.hora_fin}</strong></p>
          </div>
          <input id="nuevaFecha" type="date" class="swal2-input" placeholder="Nueva fecha" required>
          <input id="nuevaHoraInicio" type="time" class="swal2-input" placeholder="Nueva hora de inicio" required>
          <input id="nuevaHoraFin" type="time" class="swal2-input" placeholder="Nueva hora de fin" required>
          <textarea id="observacion" class="swal2-textarea" placeholder="Observaciones (opcional)"></textarea>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Reprogramar Cita',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const nuevaFecha = document.getElementById('nuevaFecha').value;
          const nuevaHoraInicio = document.getElementById('nuevaHoraInicio').value;
          const nuevaHoraFin = document.getElementById('nuevaHoraFin').value;
          const observacion = document.getElementById('observacion').value;
          
          if (!nuevaFecha || !nuevaHoraInicio || !nuevaHoraFin) {
            Swal.showValidationMessage('Por favor, complete todos los campos requeridos');
            return false;
          }
          
          return { fecha: nuevaFecha, hora_inicio: nuevaHoraInicio, hora_fin: nuevaHoraFin, observacion };
        }
      });

      if (formValues) {
        const result = await citasApiService.reprogramarCita(cita.id_cita || cita.id, formValues);

        if (result.success) {
          await alertService.success('¡Cita Reprogramada!', 'La cita ha sido reprogramada exitosamente.');
          cargarCitas();
        } else {
          await alertService.error('Error', result.message);
        }
      }
    } catch (error) {
      console.error('Error al reprogramar cita:', error);
      await alertService.error('Error', 'Error al reprogramar la cita');
    }
  };

  const handleAnular = async (cita) => {
    try {
      const { value: motivo } = await Swal.fire({
        title: 'Anular Cita',
        text: `¿Estás seguro de anular la cita de ${cita.cliente?.nombre || 'este cliente'}?`,
        input: 'textarea',
        inputPlaceholder: 'Ingrese el motivo de la anulación (opcional)',
        showCancelButton: true,
        confirmButtonText: 'Anular Cita',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626'
      });

      if (motivo !== undefined) {
        const result = await citasApiService.anularCita(cita.id_cita || cita.id, motivo);

        if (result.success) {
          await alertService.success('Cita Anulada', 'La cita ha sido anulada exitosamente.');
          cargarCitas();
        } else {
          await alertService.error('Error', result.message);
        }
      }
    } catch (error) {
      console.error('Error al anular cita:', error);
      await alertService.error('Error', 'Error al anular la cita');
    }
  };

  const handleExportarExcel = () => {
    const encabezados = [
      "ID", "Fecha", "Hora Inicio", "Hora Fin", "Tipo", "Modalidad", "Estado", "Cliente", "Empleado", "Observación"
    ];
    const datosExcel = citasFiltradas.map((cita) => ({
      "ID": cita.id_cita || cita.id || '',
      "Fecha": cita.fecha || '',
      "Hora Inicio": cita.hora_inicio || '',
      "Hora Fin": cita.hora_fin || '',
      "Tipo": normalizarTipoCita(cita.tipo),
      "Modalidad": cita.modalidad || '',
      "Estado": cita.estado || '',
      "Cliente": `${cita.cliente?.nombre || ''} ${cita.cliente?.apellido || ''}`.trim(),
      "Empleado": `${cita.empleado?.nombre || ''} ${cita.empleado?.apellido || ''}`.trim(),
      "Observación": cita.observacion || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(datosExcel, { header: encabezados });
    worksheet["!cols"] = [
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, 
      { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 30 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Citas");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "citas.xlsx");
    alertService.success("¡Éxito!", "Archivo Excel descargado exitosamente.");
  };

  const tiposCita = [...new Set(citas.map(c => normalizarTipoCita(c.tipo)).filter(tipo => tipo && tipo !== 'Sin tipo'))];
  const estadosCita = [...new Set(citas.map(c => c.estado).filter(estado => estado))];

  return (
    <div className={`transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-16'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaCalendarAlt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Lista de Citas</h1>
                <p className="text-gray-600">Gestiona todas las citas del sistema</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={cargarCitas}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refrescar</span>
              </button>
              
              <DownloadButton
                type="excel"
                onClick={handleExportarExcel}
                title="Descargar Excel"
              />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, empleado, tipo o estado..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setPaginaActual(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {estadosCita.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          
          <select
            value={filterTipo}
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setPaginaActual(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {tiposCita.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <FaSync className="animate-spin mr-2" />
                        <span>Cargando citas...</span>
                      </div>
                    </td>
                  </tr>
                ) : citasPagina.length > 0 ? (
                  citasPagina.map((cita) => (
                    <tr key={cita.id_cita || cita.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {cita.cliente?.nombre || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cita.cliente?.correo || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cita.fecha ? new Date(cita.fecha).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FaClock className="h-4 w-4 text-gray-400 mr-1" />
                          {cita.hora_inicio} - {cita.hora_fin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {normalizarTipoCita(cita.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cita.modalidad || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(cita.estado)}`}>
                          {cita.estado || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cita.empleado?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReprogramar(cita)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Reprogramar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleAnular(cita)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Anular"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay citas programadas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indiceInicio + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(indiceFin, citasFiltradas.length)}</span> de{' '}
                    <span className="font-medium">{citasFiltradas.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                      disabled={paginaActual === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                      <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagina === paginaActual
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                    <button
                      onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaCitas;
