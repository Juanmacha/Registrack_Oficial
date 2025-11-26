import React, { useState, useRef } from "react";
import { BiUser, BiEnvelope, BiPhone, BiCalendar, BiCalendarEvent, BiTime, BiMessage } from "react-icons/bi";
import BaseModal from "../../../shared/components/BaseModal";
import solicitudesCitasApiService from "../../dashboard/services/solicitudesCitasApiService.js";
import alertService from "../../../utils/alertService.js";
import { handleDocumentNumberChange, handlePhoneChange, handleNumericPaste, handleDocumentNumberKeyDown, handlePhoneKeyDown } from "../../../shared/utils/numericInputFilter.js";

const ModalAgendarCita = ({ isOpen, onClose }) => {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
    tipoDocumento: "CC",
    fecha: "",
    hora: "",
    tipoCita: "",
    mensaje: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [touched, setTouched] = useState({});

  // Validar un campo específico
  const validarCampo = (name, value) => {
    let error = '';

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'Por favor, ingresa tu nombre completo';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Por favor, ingresa tu correo electrónico';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'El formato del correo electrónico no es válido. Ejemplo: correo@ejemplo.com';
        }
        break;

      case 'telefono':
        if (!value.trim()) {
          error = 'Por favor, ingresa tu número de teléfono';
        } else {
          // Validar que tenga al menos 7 dígitos (número mínimo razonable)
          const soloNumeros = value.replace(/\D/g, '');
          if (soloNumeros.length < 7) {
            error = 'El número de teléfono debe tener al menos 7 dígitos';
          } else if (soloNumeros.length > 15) {
            error = 'El número de teléfono no puede tener más de 15 dígitos';
          }
        }
        break;

      case 'tipoDocumento':
        if (!value) {
          error = 'Por favor, selecciona el tipo de documento';
        }
        break;

      case 'documento':
        if (!value.trim()) {
          error = 'Por favor, ingresa tu número de documento';
        } else {
          // Validar que tenga al menos 5 dígitos
          const soloNumeros = value.replace(/\D/g, '');
          if (soloNumeros.length < 5) {
            error = 'El número de documento debe tener al menos 5 dígitos';
          } else if (soloNumeros.length > 20) {
            error = 'El número de documento no puede tener más de 20 dígitos';
          }
        }
        break;

      case 'fecha':
        if (!value) {
          error = 'Por favor, selecciona una fecha para la cita';
        } else {
          // Parsear la fecha sin problemas de zona horaria
          // El input type="date" devuelve formato YYYY-MM-DD
          const [year, month, day] = value.split('-').map(Number);
          const fechaSeleccionada = new Date(year, month - 1, day);

          // Obtener la fecha de hoy en la zona horaria local
          const hoy = new Date();
          const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

          // Comparar solo las fechas (sin hora)
          const fechaLocal = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate());

          // Solo validar que no sea una fecha pasada (anterior a hoy)
          if (fechaLocal < hoyLocal) {
            error = 'No se pueden agendar citas para fechas pasadas. Por favor, selecciona una fecha válida';
          }
        }
        break;

      case 'hora':
        if (!value) {
          error = 'Por favor, selecciona un horario para la cita';
        }
        break;

      case 'tipoCita':
        if (!value) {
          error = 'Por favor, selecciona el tipo de cita que deseas agendar';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validar en tiempo real si el campo ya ha sido tocado
    if (touched[name] || formSubmitted) {
      const error = validarCampo(name, value);
      setErrores(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handler específico para número de documento con filtrado numérico
  const handleDocumentNumberChangeWrapper = (e) => {
    handleDocumentNumberChange(e, handleChange);
  };

  // Handler específico para teléfono con filtrado numérico
  const handlePhoneChangeWrapper = (e) => {
    handlePhoneChange(e, handleChange);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Marcar el campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validar el campo cuando pierde el foco
    const error = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: error }));
  };

  const mostrarError = (campo) => {
    // Mostrar error si el campo ha sido tocado o si el formulario ha sido enviado
    return (touched[campo] || formSubmitted) && errores[campo];
  };

  // Generar opciones de hora en bloques de 1 hora
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

  // Tipos de cita disponibles
  const tiposCita = [
    { value: "General", label: "General" },
    { value: "Busqueda", label: "Búsqueda" },
    { value: "Ampliacion", label: "Ampliación" },
    { value: "Certificacion", label: "Certificación" },
    { value: "Renovacion", label: "Renovación" },
    { value: "Cesion", label: "Cesión" },
    { value: "Oposicion", label: "Oposición" },
    { value: "Respuesta de oposicion", label: "Respuesta de oposición" }
  ];

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'Por favor, ingresa tu nombre completo';
    }

    if (!formData.email.trim()) {
      errors.email = 'Por favor, ingresa tu correo electrónico';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El formato del correo electrónico no es válido. Ejemplo: correo@ejemplo.com';
    }

    if (!formData.telefono.trim()) {
      errors.telefono = 'Por favor, ingresa tu número de teléfono';
    } else {
      // Validar que tenga al menos 7 dígitos (número mínimo razonable)
      const soloNumeros = formData.telefono.replace(/\D/g, '');
      if (soloNumeros.length < 7) {
        errors.telefono = 'El número de teléfono debe tener al menos 7 dígitos';
      } else if (soloNumeros.length > 15) {
        errors.telefono = 'El número de teléfono no puede tener más de 15 dígitos';
      }
    }

    if (!formData.tipoDocumento) {
      errors.tipoDocumento = 'Por favor, selecciona el tipo de documento';
    }

    if (!formData.documento.trim()) {
      errors.documento = 'Por favor, ingresa tu número de documento';
    } else {
      // Validar que tenga al menos 5 dígitos
      const soloNumeros = formData.documento.replace(/\D/g, '');
      if (soloNumeros.length < 5) {
        errors.documento = 'El número de documento debe tener al menos 5 dígitos';
      } else if (soloNumeros.length > 20) {
        errors.documento = 'El número de documento no puede tener más de 20 dígitos';
      }
    }

    if (!formData.fecha) {
      errors.fecha = 'Por favor, selecciona una fecha para la cita';
    } else {
      // Parsear la fecha sin problemas de zona horaria
      // El input type="date" devuelve formato YYYY-MM-DD
      const [year, month, day] = formData.fecha.split('-').map(Number);
      const fechaSeleccionada = new Date(year, month - 1, day);

      // Obtener la fecha de hoy en la zona horaria local
      const hoy = new Date();
      const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

      // Comparar solo las fechas (sin hora)
      const fechaLocal = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate());

      // Solo validar que no sea una fecha pasada (anterior a hoy)
      if (fechaLocal < hoyLocal) {
        errors.fecha = 'No se pueden agendar citas para fechas pasadas. Por favor, selecciona una fecha válida';
      }
    }

    if (!formData.hora) {
      errors.hora = 'Por favor, selecciona un horario para la cita';
    }

    if (!formData.tipoCita) {
      errors.tipoCita = 'Por favor, selecciona el tipo de cita que deseas agendar';
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
        tipo: formData.tipoCita,
        modalidad: "Presencial", // Modalidad por defecto
        descripcion: formData.mensaje || 'Sin mensaje adicional',
        // Datos del cliente estructurados
        cliente: {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          tipo_documento: formData.tipoDocumento,
          documento: formData.documento
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
          documento: "",
          tipoDocumento: "CC",
          fecha: "",
          hora: "",
          tipoCita: "",
          mensaje: "",
        });
        setErrores({});
        setFormSubmitted(false);
        setTouched({});
        onClose();

        console.log('✅ [ModalAgendarCita] Solicitud creada exitosamente');
      } else {
        // Mejorar mensajes de error del servidor para que sean más claros
        let mensajeError = result.message || "No se pudo enviar la solicitud. Por favor, verifica los datos e intenta de nuevo.";

        // Personalizar mensajes comunes del servidor
        if (result.message) {
          const mensajeLower = result.message.toLowerCase();
          if (mensajeLower.includes('fecha') && (mensajeLower.includes('pasada') || mensajeLower.includes('hoy'))) {
            mensajeError = "No se pueden agendar citas para el día de hoy o fechas anteriores. Por favor, selecciona una fecha futura.";
          } else if (mensajeLower.includes('hora') || mensajeLower.includes('horario')) {
            mensajeError = "El horario seleccionado no está disponible. Por favor, selecciona otro horario.";
          } else if (mensajeLower.includes('fecha') || mensajeLower.includes('día')) {
            mensajeError = "La fecha seleccionada no es válida. Por favor, selecciona otra fecha.";
          }
        }

        await alertService.error(
          "Error al enviar solicitud",
          mensajeError,
          { confirmButtonText: "Entendido" }
        );
        console.error('❌ [ModalAgendarCita] Error:', result.message);
      }
    } catch (error) {
      console.error('💥 [ModalAgendarCita] Error inesperado:', error);

      // Mejorar mensajes de error de conexión
      let mensajeError = "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta de nuevo.";

      if (error.message) {
        const errorLower = error.message.toLowerCase();
        if (errorLower.includes('network') || errorLower.includes('fetch')) {
          mensajeError = "Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.";
        } else if (errorLower.includes('timeout')) {
          mensajeError = "La solicitud tardó demasiado. Por favor, intenta de nuevo.";
        }
      }

      await alertService.error(
        "Error de conexión",
        mensajeError,
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
      documento: "",
      tipoDocumento: "CC",
      fecha: "",
      hora: "",
      tipoCita: "",
      mensaje: "",
    });
    setErrores({});
    setFormSubmitted(false);
    setTouched({});
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Agendar Nueva Cita"
      subtitle="Completa el formulario para solicitar una cita"
      headerGradient="blue"
      headerIcon={
        <BiCalendarEvent className="w-7 h-7 text-blue-600" />
      }
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
            <div className="bg-blue-100 p-2 rounded-full mr-3 flex items-center justify-center">
              <BiUser className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Información de Contacto</h3>
              <p className="text-sm text-blue-600">Datos para contactarte y confirmar la cita</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BiUser className="text-gray-400 mr-2 text-sm" />
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('nombre') ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Ingresa tu nombre completo"
              />
              {mostrarError('nombre') && (
                <p className="text-red-600 text-sm mt-1">{errores.nombre}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BiEnvelope className="text-gray-400 mr-2 text-sm" />
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('email') ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="tu@email.com"
              />
              {mostrarError('email') && (
                <p className="text-red-600 text-sm mt-1">{errores.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BiPhone className="text-gray-400 mr-2 text-sm" />
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handlePhoneChangeWrapper}
                onKeyDown={handlePhoneKeyDown}
                onPaste={(e) => handleNumericPaste(e, { allowPlus: true, allowSpaces: true, allowDashes: true, allowParentheses: true })}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('telefono') ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="3001234567"
              />
              {mostrarError('telefono') && (
                <p className="text-red-600 text-sm mt-1">{errores.telefono}</p>
              )}
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BiUser className="text-gray-400 mr-2 text-sm" />
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('tipoDocumento') ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Tipo de documento</option>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="PA">Pasaporte</option>
                <option value="PEP">Permiso Especial de Permanencia</option>
                <option value="NIT">NIT</option>
              </select>
              {mostrarError('tipoDocumento') && (
                <p className="text-red-600 text-sm mt-1">{errores.tipoDocumento}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BiUser className="text-gray-400 mr-2 text-sm" />
                Número de Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleDocumentNumberChangeWrapper}
                onKeyDown={handleDocumentNumberKeyDown}
                onPaste={(e) => handleNumericPaste(e, {})}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('documento') ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="1234567890"
              />
              {mostrarError('documento') && (
                <p className="text-red-600 text-sm mt-1">{errores.documento}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Información de la Cita */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-full mr-3 flex items-center justify-center">
              <BiCalendarEvent className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Información de la Cita</h3>
              <p className="text-sm text-green-600">Fecha y hora preferida para la cita</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BiCalendar className="text-gray-400 mr-2 text-sm" />
                Fecha de la Cita <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                onBlur={handleBlur}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('fecha') ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {mostrarError('fecha') && (
                <p className="text-red-600 text-sm mt-1">{errores.fecha}</p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BiTime className="text-gray-400 mr-2 text-sm" />
                Hora de la Cita <span className="text-red-500">*</span>
              </label>
              <select
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('hora') ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Selecciona un horario</option>
                {opcionesHora.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
              {mostrarError('hora') && (
                <p className="text-red-600 text-sm mt-1">{errores.hora}</p>
              )}
            </div>
          </div>

          {/* Tipo de Cita */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <BiCalendarEvent className="text-gray-400 mr-2 text-sm" />
              Tipo de Cita <span className="text-red-500">*</span>
            </label>
            <select
              name="tipoCita"
              value={formData.tipoCita}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white ${mostrarError('tipoCita') ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Selecciona el tipo de cita</option>
              {tiposCita.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {mostrarError('tipoCita') && (
              <p className="text-red-600 text-sm mt-1">{errores.tipoCita}</p>
            )}
          </div>
        </div>

        {/* Sección de Mensaje Adicional */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 p-2 rounded-full mr-3 flex items-center justify-center">
              <BiMessage className="text-gray-600 text-xl" />
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
