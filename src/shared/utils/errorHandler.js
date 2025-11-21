/**
 * Utilidades para manejo de errores de la API
 */

/**
 * Maneja errores de la API y los convierte en mensajes amigables
 * @param {Error} error - Error original
 * @param {Response} response - Respuesta HTTP (si existe)
 * @returns {Object} - { tipo, mensaje, detalles, camposFaltantes }
 */
export const manejarErrorAPI = (error, response = null) => {
  if (!response) {
    return {
      tipo: 'NETWORK_ERROR',
      mensaje: 'Error de conexión. Verifica tu internet.',
      detalles: error.message
    };
  }
  
  const status = response.status;
  const data = response.data || {};
  
  switch (status) {
    case 400:
      return {
        tipo: 'VALIDATION_ERROR',
        mensaje: data.mensaje || 'Error de validación',
        detalles: data.camposFaltantes || data.detalles,
        camposFaltantes: data.camposFaltantes
      };
    
    case 401:
      return {
        tipo: 'UNAUTHORIZED',
        mensaje: 'No autorizado. Por favor, inicia sesión nuevamente.',
        detalles: data.error
      };
    
    case 403:
      // Detectar si es un usuario inactivo o falta de permisos
      const isInactiveUser = data.mensaje?.toLowerCase().includes('inactivo') || 
                             data.mensaje?.toLowerCase().includes('desactivado') ||
                             data.error?.toLowerCase().includes('inactivo') ||
                             data.error?.toLowerCase().includes('desactivado');
      
      return {
        tipo: 'FORBIDDEN',
        mensaje: isInactiveUser 
          ? 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.'
          : 'No tienes permisos para realizar esta acción.',
        detalles: data.mensaje || data.error,
        isInactiveUser
      };
    
    case 429:
      // Rate Limiting - Demasiados intentos
      // Manejar headers tanto si es un objeto Headers de Fetch como si es un objeto plano
      let retryAfter = null;
      let rateLimitReset = null;
      let rateLimitRemaining = null;
      
      if (response.headers) {
        // Si es un objeto Headers de Fetch API
        if (typeof response.headers.get === 'function') {
          retryAfter = response.headers.get('Retry-After');
          rateLimitReset = response.headers.get('RateLimit-Reset');
          rateLimitRemaining = response.headers.get('RateLimit-Remaining');
        } else {
          // Si es un objeto plano
          retryAfter = response.headers['Retry-After'] || response.headers['retry-after'];
          rateLimitReset = response.headers['RateLimit-Reset'] || response.headers['ratelimit-reset'];
          rateLimitRemaining = response.headers['RateLimit-Remaining'] || response.headers['ratelimit-remaining'];
        }
      }
      
      // También verificar en data
      retryAfter = retryAfter || data.retryAfter;
      rateLimitReset = rateLimitReset || data.rateLimitReset;
      rateLimitRemaining = rateLimitRemaining || data.rateLimitRemaining;
      
      // Calcular tiempo de espera en minutos
      let waitTime = null;
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          waitTime = Math.ceil(seconds / 60); // Convertir a minutos
        }
      }
      
      return {
        tipo: 'RATE_LIMIT',
        mensaje: data.mensaje || data.message || 'Demasiados intentos. Por favor, espera antes de intentar nuevamente.',
        detalles: data.detalles || data.error || data.message,
        retryAfter,
        rateLimitReset,
        rateLimitRemaining,
        waitTimeMinutes: waitTime
      };
    
    case 404:
      return {
        tipo: 'NOT_FOUND',
        mensaje: 'El servicio solicitado no existe.',
        detalles: data.error
      };
    
    case 500:
      return {
        tipo: 'SERVER_ERROR',
        mensaje: data.mensaje || 'Error interno del servidor',
        detalles: data.detalles || data.error,
        // Si el error es de payload demasiado grande
        payloadTooLarge: data.detalles?.tipo === 'PayloadTooLarge'
      };
    
    default:
      return {
        tipo: 'UNKNOWN_ERROR',
        mensaje: data.mensaje || 'Error desconocido',
        detalles: data.error || error.message
      };
  }
};

/**
 * Obtiene un mensaje de error amigable para mostrar al usuario
 * @param {Object} errorInfo - Información del error de manejarErrorAPI
 * @returns {string} - Mensaje amigable
 */
export const obtenerMensajeErrorUsuario = (errorInfo) => {
  switch (errorInfo.tipo) {
    case 'VALIDATION_ERROR':
      if (errorInfo.camposFaltantes && errorInfo.camposFaltantes.length > 0) {
        return `Faltan los siguientes campos: ${errorInfo.camposFaltantes.join(', ')}`;
      }
      return errorInfo.mensaje || 'Por favor, completa todos los campos requeridos.';
    
    case 'PAYLOAD_TOO_LARGE':
      return 'El tamaño de los archivos es demasiado grande. Por favor, reduce el tamaño de los archivos o comprime las imágenes.';
    
    case 'UNAUTHORIZED':
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    
    case 'FORBIDDEN':
      return errorInfo.isInactiveUser
        ? 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.'
        : 'No tienes permisos para realizar esta acción.';
    
    case 'RATE_LIMIT':
      if (errorInfo.waitTimeMinutes) {
        return `Demasiados intentos. Por favor, espera ${errorInfo.waitTimeMinutes} ${errorInfo.waitTimeMinutes === 1 ? 'minuto' : 'minutos'} antes de intentar nuevamente.`;
      }
      return errorInfo.mensaje || 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
    
    case 'NETWORK_ERROR':
      return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
    
    case 'SERVER_ERROR':
      if (errorInfo.payloadTooLarge) {
        return 'El tamaño de los archivos es demasiado grande. Por favor, reduce el tamaño de los archivos.';
      }
      return errorInfo.mensaje || 'Ha ocurrido un error en el servidor. Por favor, intenta nuevamente más tarde.';
    
    default:
      return errorInfo.mensaje || 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  }
};

