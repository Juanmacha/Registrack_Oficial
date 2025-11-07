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
    horaFin: '',
    empleadoId: '',
    observacion: ''
  });
  
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});

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
    }
  }, [isOpen, solicitud]);

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
            apellido: emp.apellido || ''
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
            apellido: emp.apellido || ''
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
    
    if (!formData.horaFin) {
      errors.horaFin = 'La hora de fin es requerida';
    } else {
      // Validar que hora de fin sea mayor que hora de inicio
      if (solicitud?.hora_solicitada) {
        const horaInicio = solicitud.hora_solicitada.split(':').slice(0, 2).join(':');
        if (formData.horaFin <= horaInicio) {
          errors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
        }
      }
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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      // Marcar todos los campos como touched para mostrar errores
      setTouched({ horaFin: true, empleadoId: true });
      return;
    }
    
    setLoading(true);
    try {
      await onSuccess(
        parseInt(formData.empleadoId),
        formData.horaFin,
        formData.observacion || ''
      );
      
      // Limpiar formulario después de éxito
      setFormData({
        horaFin: '',
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
      horaFin: '',
      empleadoId: '',
      observacion: ''
    });
    setErrores({});
    setTouched({});
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
            {/* Hora de Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaClock className="inline text-gray-400 mr-1" />
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
                disabled={loading}
              />
              {touched.horaFin && errores.horaFin && (
                <p className="text-red-600 text-xs mt-1">{errores.horaFin}</p>
              )}
            </div>
            
            {/* Empleado Asignado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline text-gray-400 mr-1" />
                Empleado Asignado <span className="text-red-500">*</span>
                {loadingEmpleados && (
                  <span className="ml-2 text-blue-600 text-xs">
                    <i className="bi bi-arrow-repeat animate-spin"></i> Cargando...
                  </span>
                )}
              </label>
              <select
                name="empleadoId"
                value={formData.empleadoId}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loadingEmpleados || loading || empleados.length === 0}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
                  loadingEmpleados || empleados.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                } ${touched.empleadoId && errores.empleadoId ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">
                  {loadingEmpleados ? 'Cargando empleados...' : 'Seleccionar empleado...'}
                </option>
                {empleados.map(emp => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombreCompleto}
                  </option>
                ))}
              </select>
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

