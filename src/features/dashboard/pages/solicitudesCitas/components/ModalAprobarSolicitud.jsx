import React, { useState, useEffect } from 'react';
import empleadosApiService from '../../../services/empleadosApiService';
import alertService from '../../../../../utils/alertService.js';
import { FaUser, FaClock, FaFileAlt, FaTimes } from 'react-icons/fa';

const ModalAprobarSolicitud = ({ 
  isOpen, 
  onClose, 
  solicitud, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    horaCita: '',
    empleadoId: '',
    observacion: ''
  });

  // Generar opciones de hora en bloques de 1 hora (formato 12h AM/PM)
  const generarOpcionesHora = () => {
    const opciones = [];
    for (let hora = 7; hora < 18; hora++) {
      const horaInicio = hora.toString().padStart(2, '0') + ':00';
      const horaFin = (hora + 1).toString().padStart(2, '0') + ':00';
      
      // Convertir a formato 12h AM/PM para mostrar
      const convertirHora12h = (hora24) => {
        const [h, m] = hora24.split(':').map(Number);
        const periodo = h >= 12 ? 'PM' : 'AM';
        const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${hora12}:${m.toString().padStart(2, '0')} ${periodo}`;
      };
      
      opciones.push({
        value: horaInicio, // Mantener valor en formato 24h para el backend
        label: `${convertirHora12h(horaInicio)} - ${convertirHora12h(horaFin)}`
      });
    }
    return opciones;
  };

  const opcionesHora = generarOpcionesHora();
  
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});
  
  // Estados para el buscador de empleados
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  const [mostrarListaEmpleados, setMostrarListaEmpleados] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  // Cargar empleados al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarEmpleados();
      // Pre-seleccionar empleado si ya está asignado
      if (solicitud?.id_empleado_asignado || solicitud?.empleado_asignado?.id_empleado) {
        const empleadoId = solicitud.id_empleado_asignado || solicitud.empleado_asignado?.id_empleado;
        setFormData(prev => ({
          ...prev,
          empleadoId: empleadoId.toString()
        }));
      }
    } else {
      // Limpiar al cerrar
      setBusquedaEmpleado('');
      setMostrarListaEmpleados(false);
      setEmpleadoSeleccionado(null);
    }
  }, [isOpen, solicitud]);

  // Actualizar empleado seleccionado cuando se cargan los empleados o cambia formData.empleadoId
  useEffect(() => {
    if (formData.empleadoId && empleados.length > 0) {
      const empleado = empleados.find(emp => 
        emp.id_empleado.toString() === formData.empleadoId.toString()
      );
      if (empleado) {
        // Solo actualizar si es diferente al actual para evitar loops
        if (!empleadoSeleccionado || empleadoSeleccionado.id_empleado !== empleado.id_empleado) {
          setEmpleadoSeleccionado(empleado);
          setBusquedaEmpleado(`${empleado.nombreCompleto} - ${empleado.tipo_documento || 'CC'} ${empleado.documento}`);
        }
      }
    } else if (!formData.empleadoId && empleadoSeleccionado) {
      setEmpleadoSeleccionado(null);
      setBusquedaEmpleado('');
    }
  }, [formData.empleadoId, empleados]);

  const cargarEmpleados = async () => {
    setLoadingEmpleados(true);
    try {
      console.log('👥 [ModalAprobarSolicitud] Cargando empleados desde la API...');
      const result = await empleadosApiService.getAllEmpleados();
      
      if (result && result.success && Array.isArray(result.data)) {
        const empleadosActivos = result.data
          .filter(emp => {
            const estadoEmpleado = emp.estado_empleado !== false && emp.estado_empleado !== 'Inactivo';
            const estadoUsuario = emp.estado_usuario !== false && emp.estado_usuario !== 'Inactivo';
            return estadoEmpleado && estadoUsuario;
          })
          .map(emp => ({
            id_empleado: emp.id_empleado,
            nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim(),
            nombre: emp.nombre || '',
            apellido: emp.apellido || '',
            documento: emp.documento || '',
            tipo_documento: emp.tipo_documento || 'CC'
          }));
        
        console.log('✅ [ModalAprobarSolicitud] Empleados cargados exitosamente:', empleadosActivos);
        setEmpleados(empleadosActivos);
      } else if (Array.isArray(result)) {
        const empleadosActivos = result
          .filter(emp => {
            const estadoEmpleado = emp.estado_empleado !== false && emp.estado_empleado !== 'Inactivo';
            const estadoUsuario = emp.estado_usuario !== false && emp.estado_usuario !== 'Inactivo';
            return estadoEmpleado && estadoUsuario;
          })
          .map(emp => ({
            id_empleado: emp.id_empleado,
            nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim(),
            nombre: emp.nombre || '',
            apellido: emp.apellido || '',
            documento: emp.documento || '',
            tipo_documento: emp.tipo_documento || 'CC'
          }));
        
        console.log('✅ [ModalAprobarSolicitud] Empleados cargados exitosamente (array directo):', empleadosActivos);
        setEmpleados(empleadosActivos);
      } else {
        console.warn('⚠️ [ModalAprobarSolicitud] Formato de respuesta de empleados inesperado:', result);
        setEmpleados([]);
      }
    } catch (error) {
      console.error('❌ [ModalAprobarSolicitud] Error al cargar empleados:', error);
      setEmpleados([]);
      alertService.error('Error', 'No se pudieron cargar los empleados. Intenta de nuevo.');
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const validarFormulario = () => {
    const errors = {};
    
    if (!formData.horaCita) {
      errors.horaCita = 'La hora de la cita es requerida';
    }
    
    if (!formData.empleadoId) {
      errors.empleadoId = 'Debes seleccionar un empleado';
    }
    
    setErrores(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Función para normalizar texto (búsqueda sin acentos)
  const normalizarTexto = (texto) => {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar empleados según la búsqueda
  const empleadosFiltrados = empleados.filter(emp => {
    if (!busquedaEmpleado.trim()) return true;
    const textoBusqueda = normalizarTexto(busquedaEmpleado);
    const nombreCompleto = normalizarTexto(emp.nombreCompleto || '');
    const documento = (emp.documento || '').toString();
    const tipoDoc = normalizarTexto(emp.tipo_documento || 'CC');
    return nombreCompleto.includes(textoBusqueda) || 
           documento.includes(textoBusqueda) ||
           tipoDoc.includes(textoBusqueda);
  });

  // Manejar selección de empleado desde el buscador
  const handleSeleccionarEmpleado = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setFormData(prev => ({ 
      ...prev, 
      empleadoId: empleado.id_empleado.toString() 
    }));
    setBusquedaEmpleado(`${empleado.nombreCompleto} - ${empleado.tipo_documento || 'CC'} ${empleado.documento}`);
    setMostrarListaEmpleados(false);
    
    // Limpiar error del campo
    if (errores.empleadoId) {
      setErrores(prev => ({ ...prev, empleadoId: undefined }));
    }
  };

  // Manejar cambio en el input de búsqueda
  const handleBusquedaEmpleadoChange = (e) => {
    const valor = e.target.value;
    setBusquedaEmpleado(valor);
    setMostrarListaEmpleados(true);
    
    // Si se limpia el input, limpiar también la selección
    if (!valor.trim()) {
      setEmpleadoSeleccionado(null);
      setFormData(prev => ({ ...prev, empleadoId: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      // Marcar todos los campos como touched para mostrar errores
      setTouched({ horaCita: true, empleadoId: true });
      return;
    }
    
    // ✅ Validaciones del frontend según la documentación de la API (Enero 2026)
    
    // 1. Validación de días hábiles (lunes a viernes)
    const fechaSolicitada = solicitud?.fecha_solicitada;
    if (fechaSolicitada) {
      const fechaObj = new Date(fechaSolicitada);
      const diaSemana = fechaObj.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
      if (diaSemana === 0 || diaSemana === 6) {
        await alertService.error(
          "Día inválido",
          "Las citas solo se pueden agendar de lunes a viernes."
        );
        return;
      }
    }
    
    // 2. Validación de horarios de atención (7:00 AM - 6:00 PM)
    const horaInicioConSegundos = formData.horaCita.includes(':') && formData.horaCita.split(':').length === 2 
      ? formData.horaCita + ':00' 
      : formData.horaCita;
    const [hora, minuto] = formData.horaCita.split(':').map(Number);
    const horaFin = (hora + 1).toString().padStart(2, '0') + ':00';
    const horaFinConSegundos = horaFin + ':00';
    
    const horaInicioObj = new Date(`2000-01-01T${horaInicioConSegundos}`);
    const horaFinObj = new Date(`2000-01-01T${horaFinConSegundos}`);
    const horaMinima = new Date('2000-01-01T07:00:00');
    const horaMaxima = new Date('2000-01-01T18:00:00');
    
    if (horaInicioObj < horaMinima || horaFinObj > horaMaxima) {
      await alertService.error(
        "Horario inválido",
        "Las citas solo se pueden agendar entre las 7:00 AM y las 6:00 PM."
      );
      return;
    }
    
    // 3. Validación de duración (1 hora ±5 minutos = 55-65 minutos)
    const duracionMinutos = (horaFinObj - horaInicioObj) / (1000 * 60);
    if (duracionMinutos < 55 || duracionMinutos > 65) {
      await alertService.error(
        "Duración inválida",
        "La cita debe durar aproximadamente 1 hora (entre 55 y 65 minutos)."
      );
      return;
    }
    
    // 4. Validación de rango de fechas (máximo 1 año en el futuro)
    if (fechaSolicitada) {
      const fechaObj = new Date(fechaSolicitada);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaMaxima = new Date(hoy);
      fechaMaxima.setFullYear(fechaMaxima.getFullYear() + 1);
      
      if (fechaObj > fechaMaxima) {
        await alertService.error(
          "Fecha inválida",
          "La fecha no puede ser más de 1 año en el futuro."
        );
        return;
      }
    }
    
    setLoading(true);
    try {
      await onSuccess(
        parseInt(formData.empleadoId),
        horaFinConSegundos,
        formData.observacion || ''
      );
      
      // Limpiar formulario después de éxito
      setFormData({
        horaCita: '',
        empleadoId: '',
        observacion: ''
      });
      setErrores({});
      setTouched({});
    } catch (error) {
      console.error('❌ [ModalAprobarSolicitud] Error al aprobar:', error);
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setFormData({
      horaCita: '',
      empleadoId: '',
      observacion: ''
    });
    setErrores({});
    setTouched({});
    setBusquedaEmpleado('');
    setMostrarListaEmpleados(false);
    setEmpleadoSeleccionado(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Aprobar Solicitud de Cita
            </h2>
            {solicitud?.cliente?.nombre && (
              <p className="text-sm text-gray-500 mt-1">
                Cliente: {solicitud.cliente.nombre} {solicitud.cliente.apellido || ''}
              </p>
            )}
          </div>
          <button
            onClick={cerrarModal}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
            disabled={loading}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body - Scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Información de la Solicitud (solo lectura) */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de la Solicitud</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Fecha solicitada:</span>
                <p className="font-medium text-gray-800">{solicitud?.fecha_solicitada || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Hora solicitada:</span>
                <p className="font-medium text-gray-800">{solicitud?.hora_solicitada || 'N/A'}</p>
              </div>
              {solicitud?.tipo && (
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <p className="font-medium text-gray-800">{solicitud.tipo}</p>
                </div>
              )}
              {solicitud?.modalidad && (
                <div>
                  <span className="text-gray-500">Modalidad:</span>
                  <p className="font-medium text-gray-800">{solicitud.modalidad}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hora de Cita */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaClock className="inline text-gray-400 mr-1" />
                Hora de Cita <span className="text-red-500">*</span>
              </label>
              <select
                name="horaCita"
                value={formData.horaCita}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
                  touched.horaCita && errores.horaCita ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={loading}
              >
                <option value="">Selecciona un horario</option>
                {opcionesHora.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
              {touched.horaCita && errores.horaCita && (
                <p className="text-red-600 text-xs mt-1">{errores.horaCita}</p>
              )}
            </div>
            
            {/* Empleado Asignado - Buscador */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline text-gray-400 mr-1" />
                Empleado Asignado <span className="text-red-500">*</span>
                {loadingEmpleados && (
                  <span className="ml-2 text-blue-600 text-xs">
                    <i className="bi bi-arrow-repeat animate-spin"></i> Cargando...
                  </span>
                )}
              </label>
              
              {/* Input de búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={loadingEmpleados ? 'Cargando empleados...' : 'Buscar empleado por nombre o documento...'}
                  value={busquedaEmpleado}
                  onChange={handleBusquedaEmpleadoChange}
                  onFocus={() => setMostrarListaEmpleados(true)}
                  onBlur={() => {
                    // Delay para permitir click en la lista
                    setTimeout(() => setMostrarListaEmpleados(false), 200);
                  }}
                  disabled={loadingEmpleados || loading || empleados.length === 0}
                  className={`w-full pr-4 py-3.5 pl-24 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm leading-[1.5] ${
                    loadingEmpleados || empleados.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'
                  } ${touched.empleadoId && errores.empleadoId ? 'border-red-500' : 'border-gray-300'}`}
                />
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                
                {/* Botón para limpiar búsqueda */}
                {busquedaEmpleado && !loadingEmpleados && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaEmpleado('');
                      setEmpleadoSeleccionado(null);
                      setFormData(prev => ({ ...prev, empleadoId: '' }));
                      setMostrarListaEmpleados(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                )}
              </div>

              {/* Lista desplegable de empleados filtrados */}
              {mostrarListaEmpleados && !loadingEmpleados && empleadosFiltrados.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {empleadosFiltrados.map(emp => (
                    <div
                      key={emp.id_empleado}
                      onClick={() => handleSeleccionarEmpleado(emp)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                        empleadoSeleccionado?.id_empleado === emp.id_empleado ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{emp.nombreCompleto}</p>
                          <p className="text-sm text-gray-500">
                            {emp.tipo_documento || 'CC'} {emp.documento}
                          </p>
                        </div>
                        {empleadoSeleccionado?.id_empleado === emp.id_empleado && (
                          <i className="bi bi-check-circle text-blue-600"></i>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mensaje cuando no hay resultados */}
              {mostrarListaEmpleados && !loadingEmpleados && busquedaEmpleado.trim() && empleadosFiltrados.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  <p className="text-sm text-gray-500 text-center">
                    No se encontraron empleados que coincidan con "{busquedaEmpleado}"
                  </p>
                </div>
              )}

              {/* Mensajes de estado */}
              {loadingEmpleados && empleados.length === 0 && (
                <p className="text-blue-600 text-xs mt-1 flex items-center">
                  <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                  Cargando empleados desde la base de datos...
                </p>
              )}
              {!loadingEmpleados && empleados.length === 0 && (
                <p className="text-yellow-600 text-xs mt-1 flex items-center">
                  <i className="bi bi-exclamation-triangle mr-2"></i>
                  No hay empleados disponibles. Verifica que existan empleados activos en el sistema.
                </p>
              )}
              {touched.empleadoId && errores.empleadoId && (
                <p className="text-red-600 text-xs mt-1">{errores.empleadoId}</p>
              )}

              {/* Mostrar empleado seleccionado */}
              {empleadoSeleccionado && !mostrarListaEmpleados && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium text-gray-700">
                    <i className="bi bi-check-circle text-blue-600 mr-2"></i>
                    Empleado seleccionado: <span className="font-semibold">{empleadoSeleccionado.nombreCompleto}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {empleadoSeleccionado.tipo_documento || 'CC'} {empleadoSeleccionado.documento}
                  </p>
                </div>
              )}
            </div>
            
            {/* Observaciones (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaFileAlt className="inline text-gray-400 mr-1" />
                Observaciones (opcional)
              </label>
              <textarea
                name="observacion"
                value={formData.observacion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar observaciones sobre la aprobación..."
                disabled={loading}
              />
            </div>
            
            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || loadingEmpleados || empleados.length === 0}
              >
                {loading ? 'Aprobando...' : 'Aprobar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAprobarSolicitud;

