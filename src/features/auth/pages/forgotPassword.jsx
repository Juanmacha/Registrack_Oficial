import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiEnvelope, BiLeftArrowAlt } from "react-icons/bi";
import authApiService from '../services/authApiService.js';
import alertService from '../../../utils/alertService.js';
import { sanitizeEmail } from '../../../shared/utils/sanitizer.js';
import { manejarErrorAPI, obtenerMensajeErrorUsuario } from '../../../shared/utils/errorHandler.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();


  const validate = (value) => {
    if (!value.trim()) return "Por favor ingresa un correo electrónico.";
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(value)) return "Ingresa un correo válido.";
    return "";
  };

  const handleSubmit = async () => {
    console.log('🚀 [ForgotPassword] Iniciando handleSubmit...');
    
    const err = validate(email);
    setError(err);
    if (err) {
      console.log('❌ [ForgotPassword] Error de validación:', err);
      return;
    }
    
    console.log('✅ [ForgotPassword] Email validado:', email);
    console.log('🔄 [ForgotPassword] Llamando a authApiService.forgotPassword...');
    
    setIsLoading(true);
    setError("");
    
    try {
      // Sanitizar email antes de enviar
      const sanitizedEmail = sanitizeEmail(email);
      const result = await authApiService.forgotPassword(sanitizedEmail);
      console.log('📥 [ForgotPassword] Resultado recibido:', result);
      
      if (result.success) {
        console.log('✅ [ForgotPassword] Éxito, mostrando alerta...');
        await alertService.success(
          "¡Solicitud enviada!",
          "Se ha enviado un código de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y spam.",
          { 
            confirmButtonText: "Continuar",
            timer: 3000,
            timerProgressBar: true
          }
        );
        console.log('💾 [ForgotPassword] Guardando email en localStorage...');
        localStorage.setItem("emailRecuperacion", email);
        console.log('🧭 [ForgotPassword] Navegando a codigoRecuperacion...');
        navigate("/codigoRecuperacion");
      } else {
        console.log('❌ [ForgotPassword] Error en la solicitud:', result.message);
        await alertService.error(
          "Error en la solicitud",
          result.message || "No se pudo enviar el código de recuperación. Verifica que el email esté registrado e intenta de nuevo.",
          { confirmButtonText: "Intentar de nuevo" }
        );
        setError(result.message || "Error al enviar la solicitud. Intenta de nuevo.");
      }
    } catch (error) {
      console.log('💥 [ForgotPassword] Error capturado:', error);
      
      // Manejar errores de la API
      const errorInfo = manejarErrorAPI(error, error.response);
      const errorMessage = obtenerMensajeErrorUsuario(errorInfo);
      
      // Si es rate limit, mostrar mensaje específico
      if (errorInfo.tipo === 'RATE_LIMIT') {
        const rateLimitMessage = errorInfo.waitTimeMinutes 
          ? `${errorMessage} (Espera ${errorInfo.waitTimeMinutes} ${errorInfo.waitTimeMinutes === 1 ? 'minuto' : 'minutos'})`
          : errorMessage;
        
        setError(rateLimitMessage);
        await alertService.warning(
          "Demasiados intentos",
          rateLimitMessage
        );
      } else {
        await alertService.error(
          "Error de conexión",
          errorMessage,
          { confirmButtonText: "Reintentar" }
        );
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
    
    console.log('🏁 [ForgotPassword] handleSubmit completado');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Formulario de Recuperación - Lado Izquierdo */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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
              Recuperar contraseña - Certimarcas
            </h1>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-3 border rounded-lg ${
                error.includes('Demasiados intentos') || error.includes('espera')
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm text-center ${
                  error.includes('Demasiados intentos') || error.includes('espera')
                    ? 'text-yellow-800' 
                    : 'text-red-600'
                }`}>
                  {error}
                </p>
              </div>
            )}

            {/* Formulario */}
            <div className="space-y-6">
              {/* Campo Email */}
              <div>
                <div className="relative">
                  <BiEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="email"
                    placeholder="admin@registrack.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                onClick={handleSubmit}
                disabled={!!validate(email) || isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  "Enviar Código"
                )}
              </button>


              {/* Enlace de Regreso */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Recordaste tu contraseña?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    Inicia sesión
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

export default ForgotPassword;