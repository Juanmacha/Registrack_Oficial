import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../shared/contexts/authContext';
import citasApiService from '../../../services/citasApiService';
import empleadosApiService from '../../../services/empleadosApiService';
import alertService from '../../../../../utils/alertService';
import Swal from 'sweetalert2';
import { FaCalendarAlt, FaUser, FaPhone, FaFileAlt, FaBriefcase } from "react-icons/fa";

const ModalAgendarDesdeSolicitud = ({
  isOpen,
  onClose,
  solicitudData,
  onSuccess,
  events = [] // Citas existentes para validar cruces
}) => {
  const { getToken } = useAuth();

  // Estados
  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    asesor: '', // id_empleado
    modalidad: 'Presencial', // modalidad
    detalle: '' // observacion
  });

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});
  
  // Estados para el buscador de empleados
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  const [mostrarListaEmpleados, setMostrarListaEmpleados] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  // Generar opciones de hora en bloques de 1 hora (igual que en la landing)
  const generarOpcionesHora = () => {
    const opciones = [];
    for (let hora = 7; hora < 18; hora++) {
      const horaInicio = hora.toString().padStart(2, '0') + ':00';
      const horaFin = (hora + 1).toString().padStart(2, '0') + ':00';
      opciones.push({
        value: horaInicio,
        label: `${horaInicio} - ${horaFin}`
      });
    }
    return opciones;
  };

  const opcionesHora = generarOpcionesHora();

  // Cargar empleados al montar
  useEffect(() => {
    if (isOpen) {
      cargarEmpleados();
      prellenarFormulario();
    } else {
      // Limpiar al cerrar
      setBusquedaEmpleado('');
      setMostrarListaEmpleados(false);
      setEmpleadoSeleccionado(null);
    }
  }, [isOpen, solicitudData]);

  // Actualizar empleado seleccionado cuando se cargan los empleados o cambia formData.asesor
  useEffect(() => {
    if (formData.asesor && empleados.length > 0) {
      const empleado = empleados.find(emp => 
        emp.id_empleado.toString() === formData.asesor.toString()
      );
      if (empleado) {
        // Solo actualizar si es diferente al actual para evitar loops
        if (!empleadoSeleccionado || empleadoSeleccionado.id_empleado !== empleado.id_empleado) {
          setEmpleadoSeleccionado(empleado);
          setBusquedaEmpleado(`${empleado.nombreCompleto} - ${empleado.tipo_documento || 'CC'} ${empleado.documento}`);
        }
      }
    } else if (!formData.asesor && empleadoSeleccionado) {
      setEmpleadoSeleccionado(null);
      setBusquedaEmpleado('');
    }
  }, [formData.asesor, empleados]);

  const cargarEmpleados = async () => {
    try {
      const result = await empleadosApiService.getAllEmpleados();
      let empleadosData = [];

      if (result && result.success && Array.isArray(result.data)) {
        empleadosData = result.data;
      } else if (Array.isArray(result)) {
        empleadosData = result;
      } else {
        console.warn('⚠️ [ModalAgendarDesdeSolicitud] Formato de respuesta inesperado:', result);
        setEmpleados([]);
        return;
      }

      const empleadosActivos = empleadosData
        .filter(emp => emp.estado_empleado !== false && emp.estado_usuario !== false)
        .map(emp => ({
          id_empleado: emp.id_empleado,
          nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim(),
          documento: emp.documento || '',
          tipo_documento: emp.tipo_documento || 'CC'
        }));
      setEmpleados(empleadosActivos);
    } catch (error) {
      console.error('❌ [ModalAgendarDesdeSolicitud] Error al cargar empleados:', error);
      setEmpleados([]);
    }
  };

  const prellenarFormulario = () => {
    // Pre-seleccionar asesor si viene en la solicitud
    if (solicitudData?.empleadoCompleto?.id_empleado) {
      const empleadoId = solicitudData.empleadoCompleto.id_empleado.toString();
      setFormData(prev => ({
        ...prev,
        asesor: empleadoId
      }));
      console.log('✅ [ModalAgendarDesdeSolicitud] Empleado asignado pre-seleccionado:', empleadoId);
      
      // Buscar y establecer el empleado seleccionado cuando se carguen los empleados
      // Esto se manejará en el useEffect que observa formData.asesor y empleados
    }

    // Prellenar detalle si hay mensaje
    if (solicitudData?.mensaje) {
      setFormData(prev => ({
        ...prev,
        detalle: solicitudData.mensaje
      }));
    }
  };

  // Validaciones
  const validarFormulario = () => {
    const errors = {};

    if (!formData.fecha) {
      errors.fecha = 'Por favor, selecciona una fecha para la cita';
    } else {
      const fechaSeleccionada = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaSeleccionada.setHours(0, 0, 0, 0);

      // Solo validar que no sea una fecha pasada (anterior a hoy)
      if (fechaSeleccionada < hoy) {
        errors.fecha = 'No se pueden agendar citas para fechas pasadas. Por favor, selecciona una fecha válida';
      }
    }

    if (!formData.horaInicio) {
      errors.horaInicio = 'La hora es requerida';
    }

    if (!formData.asesor) {
      errors.asesor = 'Debe seleccionar un asesor';
    }

    // Calcular hora de fin automáticamente (1 hora después de la hora de inicio)
    let horaFinCalculada = '';
    if (formData.horaInicio) {
      const [hora, minuto] = formData.horaInicio.split(':').map(Number);
      horaFinCalculada = (hora + 1).toString().padStart(2, '0') + ':00';
    }

    // Validar cruce de horarios
    if (formData.fecha && formData.horaInicio && horaFinCalculada && formData.asesor) {
      const cruza = events.some(ev => {
        const fechaEv = ev.start.split('T')[0];
        if (fechaEv !== formData.fecha) return false;

        const inicioEv = ev.start.split('T')[1]?.slice(0, 5) || '';
        const finEv = ev.end.split('T')[1]?.slice(0, 5) || '';

        // Verificar si el empleado es el mismo
        const idEmpleadoEvento = ev.extendedProps?.empleado?.id_empleado || ev.id_empleado;
        if (idEmpleadoEvento !== parseInt(formData.asesor)) return false;

        // Si el nuevo rango se traslapa con uno existente
        return (formData.horaInicio < finEv && horaFinCalculada > inicioEv);
      });

      if (cruza) {
        errors.horaFin = 'Ya existe una cita en ese rango de horas para este asesor';
      }
    }

    setErrores(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejo de cambios
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
      asesor: empleado.id_empleado.toString() 
    }));
    setBusquedaEmpleado(`${empleado.nombreCompleto} - ${empleado.tipo_documento || 'CC'} ${empleado.documento}`);
    setMostrarListaEmpleados(false);
    
    // Limpiar error del campo
    if (errores.asesor) {
      setErrores(prev => ({ ...prev, asesor: undefined }));
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
      setFormData(prev => ({ ...prev, asesor: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      // Marcar todos los campos como touched para mostrar errores
      setTouched({ fecha: true, horaInicio: true, asesor: true });
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró token de autenticación',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
          }
        });
        return;
      }

      // Obtener id_orden_servicio
      const idOrdenServicio = solicitudData?.idOrdenServicio || solicitudData?.id_orden_servicio;
      if (!idOrdenServicio) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró ID de solicitud',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
          }
        });
        return;
      }

      // Calcular hora de fin automáticamente (1 hora después de la hora de inicio)
      const [hora, minuto] = formData.horaInicio.split(':').map(Number);
      const horaFinCalculada = (hora + 1).toString().padStart(2, '0') + ':00';

      // Construir payload según documentación
      const citaData = {
        fecha: formData.fecha,
        hora_inicio: formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2
          ? formData.horaInicio + ':00'
          : formData.horaInicio,
        hora_fin: horaFinCalculada + ':00',
        id_empleado: parseInt(formData.asesor),
        modalidad: formData.modalidad
      };

      // Campos opcionales
      if (formData.detalle && formData.detalle.trim()) {
        citaData.observacion = formData.detalle.trim();
      }

      console.log('📤 [ModalAgendarDesdeSolicitud] Creando cita desde solicitud...');
      console.log('📤 [ModalAgendarDesdeSolicitud] idOrdenServicio:', idOrdenServicio);
      console.log('📤 [ModalAgendarDesdeSolicitud] citaData:', citaData);

      // Llamar al endpoint específico
      const result = await citasApiService.crearCitaDesdeSolicitud(
        idOrdenServicio,
        citaData,
        token
      );

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `La cita ha sido agendada para ${solicitudData?.clienteNombre || 'el cliente'}. Ahora aparecerá en el calendario.`,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
          }
        });

        // Cerrar modal y limpiar
        setFormData({
          fecha: '',
          horaInicio: '',
          horaFin: '',
          asesor: '',
          modalidad: 'Presencial',
          detalle: ''
        });
        setErrores({});
        setTouched({});

        // Notificar al calendario para refrescar
        if (onSuccess) {
          onSuccess();
        }

        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al crear la cita',
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
    } catch (error) {
      console.error('❌ [ModalAgendarDesdeSolicitud] Error al crear cita:', error);
      let errorMessage = error.message || error.response?.data?.message || error.response?.data?.mensaje || 'Error al crear la cita';

      // Si es error de conflicto de horario
      if (errorMessage.includes('Ya existe una cita') || errorMessage.includes('horario')) {
        console.log('⚠️ [ModalAgendarDesdeSolicitud] Conflicto de horario detectado');
        console.log('📋 [ModalAgendarDesdeSolicitud] Datos de la cita que intentó crear:', {
          fecha: formData.fecha,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          id_empleado: formData.asesor
        });

        // Recargar citas automáticamente para que el usuario vea todas las citas existentes
        if (onSuccess) {
          console.log('🔄 [ModalAgendarDesdeSolicitud] Recargando citas del calendario...');
          onSuccess();
        }

        errorMessage += '\n\n💡 Se han recargado las citas del calendario. Revise las citas existentes del empleado y seleccione otro horario disponible.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al agendar cita',
        html: errorMessage.replace(/\n/g, '<br>'),
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
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setFormData({
      fecha: '',
      horaInicio: '',
      horaFin: '',
      asesor: '',
      modalidad: 'Presencial',
      detalle: ''
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Agendar Cita desde Solicitud
            </h2>
            {solicitudData?.clienteNombre && (
              <p className="text-sm text-gray-500 mt-1">
                Cliente: {solicitudData.clienteNombre}
              </p>
            )}
          </div>
          <button
            onClick={cerrarModal}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Fecha */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline text-gray-400 mr-1" />
              Fecha de la Cita <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              onBlur={handleBlur}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${touched.fecha && errores.fecha ? 'border-red-500' : 'border-gray-300'
                }`}
              required
            />
            {touched.fecha && errores.fecha && (
              <p className="text-red-600 text-xs mt-1">{errores.fecha}</p>
            )}
          </div>

          {/* Hora */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de la Cita <span className="text-red-500">*</span>
            </label>
            <select
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${touched.horaInicio && errores.horaInicio ? 'border-red-500' : 'border-gray-300'
                }`}
              required
            >
              <option value="">Selecciona un horario</option>
              {opcionesHora.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
            {touched.horaInicio && errores.horaInicio && (
              <p className="text-red-600 text-xs mt-1">{errores.horaInicio}</p>
            )}
          </div>

          {/* Asesor - Buscador */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline text-gray-400 mr-1" />
              Asesor <span className="text-red-500">*</span>
            </label>
            
            {/* Input de búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar empleado por nombre o documento..."
                value={busquedaEmpleado}
                onChange={handleBusquedaEmpleadoChange}
                onFocus={() => setMostrarListaEmpleados(true)}
                onBlur={() => {
                  // Delay para permitir click en la lista
                  setTimeout(() => setMostrarListaEmpleados(false), 200);
                }}
                disabled={loading || empleados.length === 0}
                className={`w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  loading || empleados.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'
                } ${touched.asesor && errores.asesor ? 'border-red-500' : 'border-gray-300'}`}
              />
              <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              
              {/* Botón para limpiar búsqueda */}
              {busquedaEmpleado && !loading && (
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaEmpleado('');
                    setEmpleadoSeleccionado(null);
                    setFormData(prev => ({ ...prev, asesor: '' }));
                    setMostrarListaEmpleados(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              )}
            </div>

            {/* Lista desplegable de empleados filtrados */}
            {mostrarListaEmpleados && !loading && empleadosFiltrados.length > 0 && (
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
            {mostrarListaEmpleados && !loading && busquedaEmpleado.trim() && empleadosFiltrados.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                <p className="text-sm text-gray-500 text-center">
                  No se encontraron empleados que coincidan con "{busquedaEmpleado}"
                </p>
              </div>
            )}

            {/* Mensajes de estado */}
            {empleados.length === 0 && !loading && (
              <p className="text-yellow-600 text-xs mt-1">Cargando empleados...</p>
            )}
            {touched.asesor && errores.asesor && (
              <p className="text-red-600 text-xs mt-1">{errores.asesor}</p>
            )}

            {/* Mostrar empleado seleccionado */}
            {empleadoSeleccionado && !mostrarListaEmpleados && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-gray-700">
                  <i className="bi bi-check-circle text-blue-600 mr-2"></i>
                  Asesor seleccionado: <span className="font-semibold">{empleadoSeleccionado.nombreCompleto}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {empleadoSeleccionado.tipo_documento || 'CC'} {empleadoSeleccionado.documento}
                </p>
              </div>
            )}
          </div>

          {/* Modalidad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidad <span className="text-red-500">*</span>
            </label>
            <select
              name="modalidad"
              value={formData.modalidad}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${touched.modalidad && errores.modalidad ? 'border-red-500' : 'border-gray-300'
                }`}
              required
              disabled={loading}
            >
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
            </select>
            {touched.modalidad && errores.modalidad && (
              <p className="text-red-600 text-xs mt-1">{errores.modalidad}</p>
            )}
          </div>

          {/* Detalle (opcional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaFileAlt className="inline text-gray-400 mr-1" />
              Observaciones (opcional)
            </label>
            <textarea
              name="detalle"
              value={formData.detalle}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa detalles adicionales sobre la cita..."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgendarDesdeSolicitud;

