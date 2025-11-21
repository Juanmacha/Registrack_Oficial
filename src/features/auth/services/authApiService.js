import apiService from '../../../shared/services/apiService.js';
import { clearAllAuthData } from '../../../shared/utils/authCleanup.js';
import API_CONFIG from '../../../shared/config/apiConfig.js';
import { manejarErrorAPI, obtenerMensajeErrorUsuario } from '../../../shared/utils/errorHandler.js';

// Servicio de autenticación que consume la API real
const authApiService = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      console.log('🔐 Intentando login con:', {
        email: credentials.email,
        endpoint: API_CONFIG.ENDPOINTS.LOGIN,
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`
      });

      const response = await apiService.post(API_CONFIG.ENDPOINTS.LOGIN, {
        correo: credentials.email,
        contrasena: credentials.password
      });

      console.log('📥 Respuesta del servidor:', response);

      if (response.success || response.mensaje) {
        // Guardar token y datos del usuario
        const token = response.data?.token || response.token;
        let user = response.data?.usuario || response.usuario || response.user;
        
        // ✅ Los roles ahora están correctos en la base de datos
        // No se necesita corrección adicional
        
        console.log('✅ Login exitoso, guardando datos:', { 
          token: token ? 'Presente' : 'Ausente', 
          user: user ? 'Presente' : 'Ausente',
          tokenValue: token,
          userValue: user
        });
        
        if (token && user) {
          // Limpiar datos de autenticación anteriores antes de guardar los nuevos
          console.log('🧹 [AuthApiService] Limpiando datos de autenticación anteriores...');
          clearAllAuthData(false); // Limpiar sin logs verbosos
          
          // Guardar nuevos datos de autenticación
          console.log('💾 [AuthApiService] Guardando nuevos datos de autenticación...');
          localStorage.setItem('authToken', token);
          localStorage.setItem('token', token); // Para compatibilidad
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('user', JSON.stringify(user)); // Para compatibilidad
          localStorage.setItem('userData', JSON.stringify(user)); // Para compatibilidad
          localStorage.setItem('isAuthenticated', 'true');

          return {
            success: true,
            token,
            user,
            message: response.message || response.mensaje || 'Login exitoso'
          };
        } else {
          console.log('❌ Token o usuario faltante:', { token, user });
          return {
            success: false,
            message: 'Error: Token o datos de usuario no encontrados en la respuesta'
          };
        }
      } else {
        console.log('❌ Login falló, respuesta:', response);
        return {
          success: false,
          message: response.error || 'Error en el login'
        };
      }
    } catch (error) {
      console.error('💥 Error completo en login:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      // Usar el manejador de errores para procesar el error correctamente
      const errorInfo = manejarErrorAPI(error, error.response);
      const errorMessage = obtenerMensajeErrorUsuario(errorInfo);
      
      // Asegurar que el mensaje sea siempre un string
      let finalMessage = typeof errorMessage === 'string' 
        ? errorMessage 
        : (errorInfo.mensaje || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
      
      // Si es rate limit, agregar información de tiempo de espera
      if (errorInfo.tipo === 'RATE_LIMIT' && errorInfo.waitTimeMinutes) {
        finalMessage = `${finalMessage} (Espera ${errorInfo.waitTimeMinutes} ${errorInfo.waitTimeMinutes === 1 ? 'minuto' : 'minutos'})`;
      }

      return {
        success: false,
        message: finalMessage,
        errorType: errorInfo.tipo, // Incluir el tipo de error para manejo específico
        errorInfo: errorInfo // Incluir información completa del error
      };
    }
  },

  // Registrar usuario
  register: async (userData) => {
    try {
      const requestData = {
        tipo_documento: userData.tipoDocumento || 'CC',
        documento: userData.documento,
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.email,
        contrasena: userData.password,
        id_rol: userData.roleId || 3 // Por defecto cliente
      };

      // Agregar teléfono si está presente
      if (userData.telefono) {
        requestData.telefono = userData.telefono;
      }

      const response = await apiService.post(API_CONFIG.ENDPOINTS.REGISTER, requestData);

      if (response.success || response.mensaje) {
        return {
          success: true,
          user: response.usuario || response.user,
          message: response.mensaje || 'Usuario registrado correctamente'
        };
      } else {
        return {
          success: false,
          message: response.error || 'Error en el registro'
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos o usuario ya existe';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error interno del servidor';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Recuperar contraseña - Implementación con nueva API
  forgotPassword: async (email) => {
    console.log('🔐 [AuthApiService] Iniciando forgotPassword para:', email);
    console.log('🔗 [AuthApiService] Endpoint:', API_CONFIG.ENDPOINTS.FORGOT_PASSWORD);
    console.log('🌐 [AuthApiService] URL completa:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`);
    
    try {
      console.log('📤 [AuthApiService] Enviando petición...');
      const response = await apiService.postPublic(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
        correo: email
      });
      console.log('📥 [AuthApiService] Respuesta recibida:', response);

      return {
        success: true,
        message: response.mensaje || response.message || 'Código de recuperación enviado'
      };
    } catch (error) {
      console.log('💥 [AuthApiService] Error capturado:', error);
      console.log('💥 [AuthApiService] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al enviar solicitud';
      
      if (error.response?.status === 404) {
        errorMessage = 'El email no está registrado en el sistema.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword
      });

      return {
        success: response.success || response.mensaje ? true : false,
        message: response.mensaje || response.error || 'Contraseña restablecida'
      };
    } catch (error) {
      console.error('Error en restablecimiento de contraseña:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Cerrar sesión
  logout: () => {
    console.log('🚪 [AuthApiService] Iniciando logout...');
    
    // Usar la utilidad centralizada para limpiar datos de autenticación
    clearAllAuthData();
    
    console.log('✅ [AuthApiService] Logout completado');
    
    return {
      success: true,
      message: 'Logout exitoso'
    };
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const isAuth = localStorage.getItem('isAuthenticated');
    
    if (!token || !isAuth) return false;

    try {
      // Decodificar el token JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        authApiService.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al verificar token:', error);
      authApiService.logout();
      return false;
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Verificar permisos (basado en los permisos que vienen del backend)
  // El backend ahora envía los permisos en usuario.rol.permisos
  hasPermission: (resource, action) => {
    const user = authApiService.getCurrentUser();
    if (!user) return false;

    // Si es administrador, tiene acceso total
    const userRole = user.rol?.nombre || user.rol || user.role;
    if (userRole === 'administrador' || userRole === 'Administrador' || userRole === 'admin') {
      return true;
    }

    // Usar los permisos que vienen del backend en usuario.rol.permisos
    const permisos = user.rol?.permisos;
    if (!permisos || typeof permisos !== 'object') {
      console.warn('⚠️ [AuthApiService] No se encontraron permisos en usuario.rol.permisos');
      return false;
    }

    // El backend envía los módulos sin el prefijo "gestion_"
    // Ejemplo: "usuarios" en lugar de "gestion_usuarios"
    const moduloKey = resource.replace('gestion_', '').toLowerCase();
    const moduloPermisos = permisos[moduloKey];
    
    if (!moduloPermisos || typeof moduloPermisos !== 'object') {
      return false;
    }

    // Normalizar acción: "editar" -> "actualizar" (el backend usa "actualizar")
    const accionNormalizada = action === 'editar' ? 'actualizar' : action;
    
    return moduloPermisos[accionNormalizada] === true;
  },

  // Verificar si es administrador
  isAdmin: () => {
    const user = authApiService.getCurrentUser();
    if (!user) return false;
    
    // Verificar por id_rol (1 = administrador)
    const userRoleId = user.rol?.id || user.id_rol || user.idRol;
    if (userRoleId === 1 || userRoleId === '1') {
      return true;
    }
    
    // Verificar por nombre del rol (formato antiguo y nuevo)
    const userRole = user.rol?.nombre || user.rol || user.role;
    console.log('🔍 [AuthApiService] Verificando si es admin:', { userRole, userRoleId, user });
    return userRole === 'administrador' || userRole === 'Administrador' || userRole === 'admin';
  },

  // Verificar si es empleado
  isEmployee: () => {
    const user = authApiService.getCurrentUser();
    if (!user) return false;
    
    // Si es admin, también es empleado (tiene más permisos)
    if (authApiService.isAdmin()) return true;
    
    // Verificar por id_rol (3 = empleado)
    const userRoleId = user.rol?.id || user.id_rol || user.idRol;
    if (userRoleId === 3 || userRoleId === '3') {
      return true;
    }
    
    // Verificar por nombre del rol (formato antiguo y nuevo)
    const userRole = user.rol?.nombre || user.rol || user.role;
    console.log('🔍 [AuthApiService] Verificando si es empleado:', { userRole, userRoleId, user });
    return userRole === 'empleado' || userRole === 'Empleado' || userRole === 'employee';
  },

  // Verificar si es cliente
  isClient: () => {
    const user = authApiService.getCurrentUser();
    if (!user) return false;
    
    // Verificar tanto el formato antiguo como el nuevo
    const userRole = user.rol?.nombre || user.rol || user.role;
    console.log('🔍 [AuthApiService] Verificando si es cliente:', { userRole, user });
    return userRole === 'cliente';
  }
};

export default authApiService;
