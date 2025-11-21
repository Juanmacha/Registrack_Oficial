import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiEnvelope, BiLock, BiShow, BiHide, BiLeftArrowAlt } from "react-icons/bi";
import { useAuth } from "../../../shared/contexts/authContext";
import alertService from "../../../utils/alertService";
import { sanitizeLoginData } from "../../../shared/utils/sanitizer.js";
import { manejarErrorAPI, obtenerMensajeErrorUsuario } from "../../../shared/utils/errorHandler.js";
import { tieneRolAdministrativo } from "../../../shared/utils/roleUtils.js";

const validateEmail = (email) => {
  // Expresión regular básica para validar email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const authContext = useAuth();
  const { login } = authContext || { login: async () => ({ success: false, message: 'Contexto no disponible' }) };

  const validate = (field, value) => {
    let e = { ...fieldErrors };
    if (field === "email") {
      e.email = value ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Correo inválido.") : "El correo es requerido.";
    }
    if (field === "password") {
      e.password = value ? "" : "La contraseña es requerida.";
    }
    setFieldErrors(e);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    validate(e.target.name, e.target.value);
    setError("");
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      Object.values(fieldErrors).every((err) => !err)
    );
  };

  const handleLogin = async () => {
    // Validaciones antes de enviar
    if (!formData.email || !formData.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("El correo electrónico no es válido.");
      return;
    }
    try {
      // Sanitizar datos antes de enviar
      const sanitizedData = sanitizeLoginData({
        email: formData.email,
        password: formData.password
      });

      // Autenticar usuario usando AuthContext
      const result = await login(sanitizedData.correo || formData.email, formData.password);
      
      if (result.success) {
        // Mostrar alerta de login exitoso
        const userName = result.user.name || result.user.firstName || 'Usuario';
        await alertService.success(
          "¡Bienvenido!",
          `Hola ${userName}, has iniciado sesión correctamente.`,
          { confirmButtonText: "Continuar" }
        );

        // Debug: Mostrar datos del usuario en consola
        console.log('🔍 Datos del usuario recibidos:', result.user);
        console.log('🔍 Rol del usuario:', result.user.rol || result.user.role);
        console.log('🔍 Tipo de rol:', typeof (result.user.rol || result.user.role));

        // Redirección inteligente para rutas del landing
        const redirect = localStorage.getItem('postLoginRedirect');
        if (redirect &&
          redirect.startsWith('/') &&
          !redirect.startsWith('/admin') &&
          !redirect.startsWith('/misprocesos') &&
          !redirect.startsWith('/profile') &&
          !redirect.startsWith('/ayuda')
        ) {
          localStorage.removeItem('postLoginRedirect');
          navigate(redirect);
          return;
        }
        
        // Redirigir según el rol - Usar lógica inteligente basada en permisos
        const user = result.user;
        console.log('🎯 [Login] Usuario para redirección:', user);
        console.log('🎯 [Login] Rol del usuario:', user.rol);
        console.log('🎯 [Login] Tipo de rol:', typeof user.rol);
        
        // Verificar si el rol tiene permisos administrativos (dashboard o gestión)
        const esAdministrativo = tieneRolAdministrativo(user);
        console.log('🎯 [Login] ¿Es administrativo?', esAdministrativo);
        
        // Esperar un momento para que el contexto se actualice completamente
        // Luego redirigir usando navigate para mantener el estado de React
        setTimeout(() => {
          if (esAdministrativo) {
            console.log('✅ [Login] Rol administrativo detectado, redirigiendo a dashboard');
            navigate("/admin/dashboard", { replace: true });
          } else {
            console.log('✅ [Login] Rol de cliente detectado, redirigiendo a landing');
            navigate("/", { replace: true });
          }
        }, 200);
      } else {
        // El mensaje de error ya viene procesado desde authApiService
        // Si es rate limit, el mensaje ya incluye el tiempo de espera
        const errorMessage = result.message || "Credenciales incorrectas. Intenta de nuevo.";
        setError(errorMessage);
        
        // Si hay información adicional del error (como rate limit), podemos usarla
        if (result.errorType === 'RATE_LIMIT' && result.errorInfo?.waitTimeMinutes) {
          // El mensaje ya debería incluir el tiempo, pero por si acaso lo verificamos
          if (!errorMessage.includes('Espera')) {
            setError(`${errorMessage} (Espera ${result.errorInfo.waitTimeMinutes} ${result.errorInfo.waitTimeMinutes === 1 ? 'minuto' : 'minutos'})`);
          }
        }
      }
    } catch (error) {
      console.error("Error en login:", error);
      
      // Asegurar que el error tenga la estructura correcta
      let errorResponse = error.response;
      if (!errorResponse && error.status) {
        // Si el error tiene status pero no response, crear la estructura
        errorResponse = {
          status: error.status,
          data: error.data || { error: error.message || 'Error desconocido' },
          headers: error.headers
        };
      }
      
      // Manejar errores de la API
      const errorInfo = manejarErrorAPI(error, errorResponse);
      const errorMessage = obtenerMensajeErrorUsuario(errorInfo);
      
      // Asegurar que errorMessage sea siempre un string
      const finalErrorMessage = typeof errorMessage === 'string' 
        ? errorMessage 
        : (errorInfo.mensaje || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
      
      // Si es rate limit, mostrar mensaje específico
      if (errorInfo.tipo === 'RATE_LIMIT') {
        if (errorInfo.waitTimeMinutes) {
          setError(`${finalErrorMessage} (Espera ${errorInfo.waitTimeMinutes} ${errorInfo.waitTimeMinutes === 1 ? 'minuto' : 'minutos'})`);
        } else {
          setError(finalErrorMessage);
        }
      } else {
        setError(finalErrorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Formulario de Login - Lado Izquierdo */}
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
              Iniciar sesión - Certimarcas
            </h1>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-3 border rounded-lg ${
                (typeof error === 'string' && (error.includes('Demasiados intentos') || error.includes('espera')))
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm text-center ${
                  (typeof error === 'string' && (error.includes('Demasiados intentos') || error.includes('espera')))
                    ? 'text-yellow-800' 
                    : 'text-red-600'
                }`}>
                  {typeof error === 'string' ? error : String(error)}
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
                    name="email"
                    type="email"
                    placeholder="martica@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Campo Password */}
              <div>
                <div className="relative">
                  <BiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••••"
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
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <button
                  onClick={() => navigate("/forgotPassword")}
                  className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón de Login */}
              <button
                onClick={handleLogin}
                disabled={!isFormValid()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ingresar
              </button>

              {/* Registro */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    Regístrate
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

export default Login;