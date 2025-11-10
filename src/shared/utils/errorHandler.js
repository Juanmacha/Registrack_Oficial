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
      return {
        tipo: 'FORBIDDEN',
        mensaje: 'No tienes permisos para realizar esta acción.',
        detalles: data.mensaje
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

