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

  // Cargar empleados al montar
  useEffect(() => {
    if (isOpen) {
      cargarEmpleados();
      prellenarFormulario();
    }
  }, [isOpen, solicitudData]);

  const cargarEmpleados = async () => {
    try {
      const result = await empleadosApiService.getAllEmpleados();
      if (result && result.success && Array.isArray(result.data)) {
        const empleadosActivos = result.data
          .filter(emp => emp.estado_empleado !== false && emp.estado_usuario !== false)
          .map(emp => ({
            id_empleado: emp.id_empleado,
            nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim()
          }));
        setEmpleados(empleadosActivos);
      }
    } catch (error) {
      console.error('❌ [ModalAgendarDesdeSolicitud] Error al cargar empleados:', error);
    }
  };

  const prellenarFormulario = () => {
    // Pre-seleccionar asesor si viene en la solicitud
    if (solicitudData?.empleadoCompleto?.id_empleado) {
      setFormData(prev => ({
        ...prev,
        asesor: solicitudData.empleadoCompleto.id_empleado.toString()
      }));
      console.log('✅ [ModalAgendarDesdeSolicitud] Empleado asignado pre-seleccionado:', solicitudData.empleadoCompleto.id_empleado);
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
      errors.fecha = 'La fecha es requerida';
    } else {
      const fechaSeleccionada = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaSeleccionada < hoy) {
        errors.fecha = 'No se pueden seleccionar fechas pasadas';
      }
    }
    
    if (!formData.horaInicio) {
      errors.horaInicio = 'La hora de inicio es requerida';
    }
    
    if (!formData.horaFin) {
      errors.horaFin = 'La hora de fin es requerida';
    } else if (formData.horaInicio && formData.horaFin) {
      if (formData.horaInicio >= formData.horaFin) {
        errors.horaFin = 'La hora de fin debe ser posterior a la de inicio';
      }
    }
    
    if (!formData.asesor) {
      errors.asesor = 'Debe seleccionar un asesor';
    }
    
    // Validar cruce de horarios
    if (formData.fecha && formData.horaInicio && formData.horaFin && formData.asesor) {
      const cruza = events.some(ev => {
        const fechaEv = ev.start.split('T')[0];
        if (fechaEv !== formData.fecha) return false;
        
        const inicioEv = ev.start.split('T')[1]?.slice(0, 5) || '';
        const finEv = ev.end.split('T')[1]?.slice(0, 5) || '';
        
        // Verificar si el empleado es el mismo
        const idEmpleadoEvento = ev.extendedProps?.empleado?.id_empleado || ev.id_empleado;
        if (idEmpleadoEvento !== parseInt(formData.asesor)) return false;
        
        // Si el nuevo rango se traslapa con uno existente
        return (formData.horaInicio < finEv && formData.horaFin > inicioEv);
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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      // Marcar todos los campos como touched para mostrar errores
      setTouched({ fecha: true, horaInicio: true, horaFin: true, asesor: true });
      return;
    }
    
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        await alertService.error('Error', 'No se encontró token de autenticación');
        return;
      }
      
      // Obtener id_orden_servicio
      const idOrdenServicio = solicitudData?.idOrdenServicio || solicitudData?.id_orden_servicio;
      if (!idOrdenServicio) {
        await alertService.error('Error', 'No se encontró ID de solicitud');
        return;
      }
      
      // Construir payload según documentación
      const citaData = {
        fecha: formData.fecha,
        hora_inicio: formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2 
          ? formData.horaInicio + ':00' 
          : formData.horaInicio,
        hora_fin: formData.horaFin.includes(':') && formData.horaFin.split(':').length === 2 
          ? formData.horaFin + ':00' 
          : formData.horaFin,
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
        await alertService.success(
          'Cita creada exitosamente',
          `La cita ha sido agendada para ${solicitudData?.clienteNombre || 'el cliente'}. Ahora aparecerá en el calendario.`
        );
        
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
        await alertService.error('Error', result.message || 'Error al crear la cita');
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
      
      await alertService.error('Error al agendar cita', errorMessage);
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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
                touched.fecha && errores.fecha ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {touched.fecha && errores.fecha && (
              <p className="text-red-600 text-xs mt-1">{errores.fecha}</p>
            )}
          </div>
          
          {/* Hora Inicio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
                touched.horaInicio && errores.horaInicio ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {touched.horaInicio && errores.horaInicio && (
              <p className="text-red-600 text-xs mt-1">{errores.horaInicio}</p>
            )}
          </div>
          
          {/* Hora Fin */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="horaFin"
              value={formData.horaFin}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
                touched.horaFin && errores.horaFin ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {touched.horaFin && errores.horaFin && (
              <p className="text-red-600 text-xs mt-1">{errores.horaFin}</p>
            )}
          </div>
          
          {/* Asesor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline text-gray-400 mr-1" />
              Asesor <span className="text-red-500">*</span>
            </label>
            <select
              name="asesor"
              value={formData.asesor}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
                touched.asesor && errores.asesor ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={loading || empleados.length === 0}
            >
              <option value="">Seleccionar...</option>
              {empleados.map(emp => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombreCompleto}
                </option>
              ))}
            </select>
            {touched.asesor && errores.asesor && (
              <p className="text-red-600 text-xs mt-1">{errores.asesor}</p>
            )}
            {empleados.length === 0 && (
              <p className="text-yellow-600 text-xs mt-1">Cargando empleados...</p>
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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
                touched.modalidad && errores.modalidad ? 'border-red-500' : 'border-gray-300'
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

