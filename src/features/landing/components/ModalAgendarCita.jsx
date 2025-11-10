import React, { useState, useRef } from "react";
import { Calendar } from "lucide-react";
import BaseModal from "../../../shared/components/BaseModal";
import solicitudesCitasApiService from "../../dashboard/services/solicitudesCitasApiService.js";
import alertService from "../../../utils/alertService.js";

const ModalAgendarCita = ({ isOpen, onClose }) => {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha: "",
    hora: "",
    mensaje: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores({ ...errores, [name]: '' });
    }
  };

  const mostrarError = (campo) => (formSubmitted || errores[campo]) && errores[campo];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El formato del email no es válido';
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    }
    
    if (!formData.fecha) {
      errors.fecha = 'La fecha es requerida';
    } else {
      const fecha = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fecha < hoy) {
        errors.fecha = 'La fecha no puede ser pasada';
      }
    }
    
    if (!formData.hora) {
      errors.hora = 'La hora es requerida';
    } else {
      const hora = formData.hora;
      const [horas, minutos] = hora.split(':').map(Number);
      
      if (horas < 7 || horas > 18 || (horas === 18 && minutos > 0)) {
        errors.hora = 'La hora debe estar entre 07:00 y 18:00';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validar formulario
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrores(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📋 [ModalAgendarCita] Creando solicitud de cita...');
      console.log('📤 [ModalAgendarCita] Datos:', formData);
      
      // Preparar datos para la API
      const solicitudData = {
        fecha_solicitada: formData.fecha,
        hora_solicitada: formData.hora + ":00", // Convertir HH:MM a HH:MM:SS
        tipo: "General", // Tipo por defecto
        modalidad: "Presencial", // Modalidad por defecto
        descripcion: formData.mensaje || 'Sin mensaje adicional',
        // Datos del cliente estructurados
        cliente: {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono
        }
      };
      
      console.log('🔗 [ModalAgendarCita] Datos preparados para API:', solicitudData);
      
      // Crear solicitud de cita usando el servicio
      const result = await solicitudesCitasApiService.createSolicitudCita(solicitudData);
      
      if (result.success) {
        await alertService.success(
          "¡Solicitud enviada!",
          result.message || "Tu solicitud de cita ha sido enviada exitosamente. Te contactaremos pronto para confirmar la cita.",
          { 
            confirmButtonText: "Entendido",
            timer: 5000,
            timerProgressBar: true
          }
        );
        
        // Limpiar formulario y cerrar modal
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          fecha: "",
          hora: "",
          mensaje: "",
        });
        setErrores({});
        setFormSubmitted(false);
        onClose();
        
        console.log('✅ [ModalAgendarCita] Solicitud creada exitosamente');
      } else {
        await alertService.error(
          "Error al enviar solicitud",
          result.message || "No se pudo enviar la solicitud. Intenta de nuevo.",
          { confirmButtonText: "Reintentar" }
        );
        console.error('❌ [ModalAgendarCita] Error:', result.message);
      }
    } catch (error) {
      console.error('💥 [ModalAgendarCita] Error inesperado:', error);
      await alertService.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpiar formulario al cancelar
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      fecha: "",
      hora: "",
      mensaje: "",
    });
    setErrores({});
    setFormSubmitted(false);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Agendar Nueva Cita"
      subtitle="Completa el formulario para solicitar una cita"
      headerGradient="blue"
      headerIcon={<Calendar className="w-5 h-5 text-white" />}
      maxWidth="2xl"
      footerActions={[
        {
          label: "Cancelar",
          onClick: handleCancel,
          variant: "secondary",
          disabled: isLoading
        },
        {
          label: isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
          ) : "Solicitar Cita",
          onClick: (e) => {
            e.preventDefault();
            if (formRef.current && !isLoading) {
              formRef.current.requestSubmit();
            }
          },
          variant: "primary",
          disabled: isLoading
        }
      ]}
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Información de Contacto */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <i className="bi bi-person text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Información de Contacto</h3>
              <p className="text-sm text-blue-600">Datos para contactarte y confirmar la cita</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-person text-gray-400 mr-2"></i>
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${
                  mostrarError('nombre') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu nombre completo"
              />
              {mostrarError('nombre') && (
                <p className="text-red-600 text-sm mt-1">{errores.nombre}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-envelope text-gray-400 mr-2"></i>
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${
                  mostrarError('email') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="tu@email.com"
              />
              {mostrarError('email') && (
                <p className="text-red-600 text-sm mt-1">{errores.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-telephone text-gray-400 mr-2"></i>
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${
                  mostrarError('telefono') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="3001234567"
              />
              {mostrarError('telefono') && (
                <p className="text-red-600 text-sm mt-1">{errores.telefono}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Información de la Cita */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <i className="bi bi-calendar-event text-green-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Información de la Cita</h3>
              <p className="text-sm text-green-600">Fecha y hora preferida para la cita</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-calendar text-gray-400 mr-2"></i>
                Fecha de la Cita <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${
                  mostrarError('fecha') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {mostrarError('fecha') && (
                <p className="text-red-600 text-sm mt-1">{errores.fecha}</p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="bi bi-clock text-gray-400 mr-2"></i>
                Hora de la Cita (07:00 - 18:00) <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                min="07:00"
                max="18:00"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${
                  mostrarError('hora') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {mostrarError('hora') && (
                <p className="text-red-600 text-sm mt-1">{errores.hora}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Mensaje Adicional */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 p-2 rounded-full mr-3">
              <i className="bi bi-chat-dots text-gray-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Mensaje Adicional</h3>
              <p className="text-sm text-gray-600">Información adicional sobre tu solicitud (opcional)</p>
            </div>
          </div>
          <div>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
              placeholder="Escribe aquí cualquier información adicional que quieras compartir..."
            ></textarea>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default ModalAgendarCita;
