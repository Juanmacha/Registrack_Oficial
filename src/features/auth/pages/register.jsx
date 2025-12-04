import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiUser, BiIdCard, BiEnvelope, BiLock, BiUserCheck, BiShow, BiHide, BiLeftArrowAlt, BiPhone } from "react-icons/bi";
import authApiService from "../services/authApiService.js";
import alertService from "../../../utils/alertService";
import { validatePasswordStrength, getPasswordRequirementsShort } from "../../../shared/utils/passwordValidator.js";
import { sanitizeRegisterData } from "../../../shared/utils/sanitizer.js";
import { manejarErrorAPI, obtenerMensajeErrorUsuario } from "../../../shared/utils/errorHandler.js";
import { handleDocumentNumberChange, handlePhoneChange, handleNumericPaste, handleDocumentNumberKeyDown, handlePhoneKeyDown } from "../../../shared/utils/numericInputFilter.js";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    documentNumber: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validate = (field, value) => {
    let e = { ...errors };
    switch (field) {
      case "firstName":
        e.firstName = value ? "" : "El nombre es requerido.";
        break;
      case "lastName":
        e.lastName = value ? "" : "El apellido es requerido.";
        break;
      case "documentType":
        e.documentType = value ? "" : "Selecciona el tipo de documento.";
        break;
      case "documentNumber":
        e.documentNumber = value ? "" : "El número de documento es requerido.";
        break;
      case "email":
        e.email = value ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Correo inválido.") : "El correo es requerido.";
        break;
      case "phone":
        e.phone = value ? "" : "El teléfono es requerido.";
        break;
      case "password":
        if (!value) {
          e.password = "La contraseña es requerida.";
        } else {
          const validation = validatePasswordStrength(value);
          e.password = validation.isValid ? "" : validation.errors[0];
        }
        break;
      case "confirmPassword":
        e.confirmPassword = value ? (value === formData.password ? "" : "Las contraseñas no coinciden.") : "Confirma la contraseña.";
        break;
      default:
        break;
    }
    setErrors(e);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Manejar checkbox de política de privacidad
    if (type === 'checkbox' && name === 'privacyPolicy') {
      setAcceptedPrivacyPolicy(checked);
      // Limpiar error de política si se acepta
      if (checked && errors.privacyPolicy) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.privacyPolicy;
          return newErrors;
        });
      }
      return;
    }
    
    // Manejar campos de texto normales
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validate(name, value);
  };

  // Handler específico para campos numéricos (documentNumber)
  const handleDocumentNumberChangeWrapper = (e) => {
    handleDocumentNumberChange(e, handleChange);
  };

  // Handler específico para teléfono (permite +, espacios, guiones, paréntesis)
  const handlePhoneChangeWrapper = (e) => {
    handlePhoneChange(e, handleChange);
  };

  const isFormValid = () => {
    // Verificar que todos los campos requeridos estén llenos
    const fieldsValid = (
      formData.firstName &&
      formData.lastName &&
      formData.documentType &&
      formData.documentNumber &&
      formData.email &&
      formData.phone &&
      formData.password &&
      formData.confirmPassword
    );
    
    // Verificar que no haya errores de validación
    const noErrors = Object.keys(errors).every((key) => {
      // Ignorar errores generales y rateLimit en la validación del botón
      if (key === 'general' || key === 'rateLimit' || key === 'waitTime') {
        return true;
      }
      return !errors[key];
    });
    
    // Verificar que se haya aceptado la política de privacidad
    const privacyAccepted = acceptedPrivacyPolicy;
    
    return fieldsValid && noErrors && privacyAccepted && !isSubmitting;
  };

  const handleRegister = async (e) => {
    // Prevenir submit del formulario si se llama desde un form
    if (e) {
      e.preventDefault();
    }

    // Limpiar errores previos (excepto rateLimit)
    setErrors((prev) => {
      const newErrors = {};
      if (prev.rateLimit) {
        newErrors.rateLimit = prev.rateLimit;
        newErrors.waitTime = prev.waitTime;
      }
      return newErrors;
    });

    // Validar política de privacidad
    if (!acceptedPrivacyPolicy) {
      await alertService.warning(
        "¡Atención!",
        "Debes aceptar la política de privacidad para continuar.",
        { confirmButtonText: "Entendido" }
      );
      setErrors((prev) => ({
        ...prev,
        privacyPolicy: "Debes aceptar la política de privacidad para continuar.",
        general: "Debes aceptar la política de privacidad para continuar."
      }));
      return;
    }

    // Validar campos requeridos
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.documentType || !formData.documentNumber) {
      await alertService.warning(
        "¡Atención!",
        "Por favor, completa todos los campos requeridos para crear tu cuenta.",
        { confirmButtonText: "Entendido" }
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      await alertService.error(
        "Error",
        "Las contraseñas no coinciden. Por favor, verifica que ambas contraseñas sean iguales.",
        { confirmButtonText: "Entendido" }
      );
      return;
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      await alertService.error(
        "Contraseña inválida",
        passwordValidation.errors[0] || "La contraseña no cumple con los requisitos de seguridad.",
        { confirmButtonText: "Entendido" }
      );
      return;
    }

    // Si ya está enviando, no hacer nada
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitizar datos antes de enviar
      const sanitizedData = sanitizeRegisterData({
        tipoDocumento: formData.documentType,
        documento: formData.documentNumber,
        nombre: formData.firstName,
        apellido: formData.lastName,
        email: formData.email,
        telefono: formData.phone
      });

      // Usar el servicio de autenticación real
      const result = await authApiService.register({
        tipoDocumento: sanitizedData.tipoDocumento || formData.documentType,
        documento: sanitizedData.documento || formData.documentNumber,
        nombre: sanitizedData.nombre || formData.firstName,
        apellido: sanitizedData.apellido || formData.lastName,
        email: sanitizedData.email || sanitizedData.correo || formData.email,
        telefono: sanitizedData.telefono || formData.phone || null,
        password: formData.password, // No sanitizar contraseña
        roleId: 3 // Cliente por defecto
      });

      if (result.success) {
        // Mostrar alerta de registro exitoso
        await alertService.success(
          "¡Registro exitoso!",
          "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
          { confirmButtonText: "Ir al Login" }
        );
        
        navigate("/login");
      } else {
        // Mostrar mensaje de error con alerta
        await alertService.error(
          "Error al crear cuenta",
          result.message || "Error al crear la cuenta. Por favor, intenta de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error("Error en registro:", error);
      
      // Manejar errores de la API
      const errorInfo = manejarErrorAPI(error, error.response);
      const errorMessage = obtenerMensajeErrorUsuario(errorInfo);
      
      // Si es rate limit, mostrar alerta específica
      if (errorInfo.tipo === 'RATE_LIMIT') {
        const rateLimitMessage = errorInfo.waitTimeMinutes
          ? `${errorMessage} (Espera ${errorInfo.waitTimeMinutes} ${errorInfo.waitTimeMinutes === 1 ? 'minuto' : 'minutos'})`
          : errorMessage;
        
        await alertService.warning(
          "¡Demasiados intentos!",
          rateLimitMessage,
          { confirmButtonText: "Entendido" }
        );
      } else {
        // Mostrar alerta de error
        await alertService.error(
          "Error",
          errorMessage,
          { confirmButtonText: "Entendido" }
        );
      }
    } finally {
      // Siempre resetear el estado de envío, incluso si hay error
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Formulario de Registro - Lado Izquierdo */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Botón Volver */}
            <div className="mb-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <BiLeftArrowAlt className="mr-2" />
                Volver al inicio
              </button>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-blue-900 mb-8 text-center">
              Registro - Certimarcas
            </h1>

            {/* Formulario */}
            <div className="space-y-6">
              {/* Primera fila: Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      name="firstName"
                      placeholder="Nombre"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Campo Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      name="lastName"
                      placeholder="Apellido"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Segunda fila: Email y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Campo Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Teléfono"
                      value={formData.phone}
                      onChange={handlePhoneChangeWrapper}
                      onKeyDown={handlePhoneKeyDown}
                      onPaste={(e) => handleNumericPaste(e, { allowPlus: true, allowSpaces: true, allowDashes: true, allowParentheses: true })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Tercera fila: Tipo de Documento y Número */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de documento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <select
                      name="documentType"
                      onChange={handleChange}
                      value={formData.documentType}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Tipo de documento</option>
                      <option value="CC">Cédula de ciudadanía</option>
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="CE">Cédula de extranjería</option>
                      <option value="PA">Pasaporte</option>
                      <option value="PEP">Permiso Especial</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                </div>

                {/* Número de Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de documento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      name="documentNumber"
                      placeholder="Número de documento"
                      value={formData.documentNumber}
                      onChange={handleDocumentNumberChangeWrapper}
                      onKeyDown={handleDocumentNumberKeyDown}
                      onPaste={(e) => handleNumericPaste(e, {})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Cuarta fila: Contraseña y Confirmar Contraseña */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Contraseña"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <BiHide className="text-lg" /> : <BiShow className="text-lg" />}
                    </button>
                  </div>
                  {formData.password && !errors.password && (
                    <p className="text-gray-500 text-xs mt-1">
                      {getPasswordRequirementsShort()}
                    </p>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirmar contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <BiHide className="text-lg" /> : <BiShow className="text-lg" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox de Política de Privacidad */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="privacyPolicy"
                  id="privacyPolicy"
                  checked={acceptedPrivacyPolicy}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 cursor-pointer"
                />
                <label htmlFor="privacyPolicy" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Estoy de acuerdo con la{" "}
                  <button 
                    type="button"
                    className="text-blue-500 hover:text-blue-700 transition-colors underline"
                    onClick={(e) => {
                      e.preventDefault();
                      // Aquí puedes agregar lógica para abrir un modal o página de política de privacidad
                      console.log('Abrir política de privacidad');
                    }}
                  >
                    política de privacidad
                  </button>
                  <span className="text-red-500"> *</span>
                </label>
              </div>

              {/* Botón de Registro */}
              <button
                type="button"
                onClick={handleRegister}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear Cuenta"
                )}
              </button>

              {/* Enlace a Login */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Decorativo - Lado Derecho */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-lg h-96 flex items-center justify-center">
          <video
            src="/images/Whisk_cauajgm4ymzhyjjkltawzjetndazzc1hn2y3lwe.mp4"
            alt="Video Registrack"
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </div>
    </div>
  );
};

export default Register;