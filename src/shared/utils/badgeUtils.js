/**
 * Utilidad unificada para generar badges consistentes en toda la aplicación
 * 
 * Soporta múltiples tipos de estados:
 * - Estados de solicitudes/ventas (Finalizado, Anulado, Pendiente, etc.)
 * - Estados de pagos (Completado, Fallido, Pendiente, etc.)
 * - Estados de usuarios/roles (Activo, Inactivo)
 * - Estados de servicios (En juicio, En forma, Pendiente, etc.)
 * 
 * @module badgeUtils
 */

/**
 * Mapa de estados de solicitudes/ventas con sus clases Tailwind CSS
 */
const ESTADO_SOLICITUD_MAP = {
  // Estados exitosos/finalizados
  finalizado: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Finalizado' },
  finalizada: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Finalizada' },
  completado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
  completada: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completada' },
  aprobado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado' },
  aprobada: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobada' },
  exitoso: { bg: 'bg-green-100', text: 'text-green-700', label: 'Exitoso' },
  
  // Estados en proceso
  'en proceso': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En Proceso' },
  proceso: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En Proceso' },
  'en revisión': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Revisión' },
  revisión: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Revisión' },
  activo: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo' },
  
  // Estados pendientes
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
  
  // Estados negativos
  anulado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Anulado' },
  anulada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Anulada' },
  rechazado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' },
  rechazada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazada' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
  fallido: { bg: 'bg-red-100', text: 'text-red-700', label: 'Fallido' },
  fallida: { bg: 'bg-red-100', text: 'text-red-700', label: 'Fallida' },
  
  // Estados neutros
  expirado: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expirado' },
  expirada: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expirada' },
  
  // Estados de servicios específicos
  'en juicio': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En Juicio' },
  juicio: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En Juicio' },
  'en forma': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Forma' },
  forma: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Forma' },
  incompleta: { bg: 'bg-red-100', text: 'text-red-600', label: 'Incompleta' },
  incompleto: { bg: 'bg-red-100', text: 'text-red-600', label: 'Incompleto' },
};

/**
 * Mapa de estados de pagos
 */
const ESTADO_PAGO_MAP = {
  completado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
  pagado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Pagado' },
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
  fallido: { bg: 'bg-red-100', text: 'text-red-700', label: 'Fallido' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
};

/**
 * Normaliza un estado para buscar en los mapas
 * @param {string|boolean|null|undefined} estado - Estado a normalizar
 * @returns {string} Estado normalizado en minúsculas sin espacios
 */
const normalizarEstado = (estado) => {
  if (estado === null || estado === undefined) return '';
  if (typeof estado === 'boolean') {
    return estado ? 'activo' : 'inactivo';
  }
  if (typeof estado !== 'string') {
    return String(estado).toLowerCase().trim();
  }
  return estado.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Busca un estado en el mapa con coincidencia parcial
 * @param {string} estadoNormalizado - Estado normalizado
 * @param {object} mapa - Mapa de estados
 * @returns {string|null} Clave encontrada o null
 */
const buscarEnMapa = (estadoNormalizado, mapa) => {
  // Primero buscar coincidencia exacta
  if (mapa[estadoNormalizado]) {
    return estadoNormalizado;
  }
  
  // Buscar coincidencia parcial (incluye)
  for (const [key, value] of Object.entries(mapa)) {
    if (estadoNormalizado.includes(key) || key.includes(estadoNormalizado)) {
      return key;
    }
  }
  
  return null;
};

/**
 * Obtiene las clases CSS para un badge de estado de solicitud/venta
 * @param {string|boolean|null|undefined} estado - Estado de la solicitud
 * @returns {object} Objeto con bg, text y label
 */
export const getEstadoSolicitudBadge = (estado) => {
  const estadoNormalizado = normalizarEstado(estado);
  if (!estadoNormalizado) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: estado || 'Sin estado'
    };
  }
  
  const key = buscarEnMapa(estadoNormalizado, ESTADO_SOLICITUD_MAP);
  if (key) {
    return ESTADO_SOLICITUD_MAP[key];
  }
  
  // Si no se encuentra, retornar por defecto con el estado original
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: estado || 'Sin estado'
  };
};

/**
 * Obtiene las clases CSS para un badge de estado de pago
 * @param {string|boolean|null|undefined} estado - Estado del pago
 * @returns {object} Objeto con bg, text y label
 */
export const getEstadoPagoBadge = (estado) => {
  // Si es booleano
  if (typeof estado === 'boolean') {
    return estado
      ? { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' }
      : { bg: 'bg-red-100', text: 'text-red-700', label: 'Fallido' };
  }
  
  const estadoNormalizado = normalizarEstado(estado);
  if (!estadoNormalizado) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Desconocido'
    };
  }
  
  const key = buscarEnMapa(estadoNormalizado, ESTADO_PAGO_MAP);
  if (key) {
    return ESTADO_PAGO_MAP[key];
  }
  
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: estado || 'Desconocido'
  };
};

/**
 * Obtiene las clases CSS para un badge de estado activo/inactivo
 * @param {string|boolean|null|undefined} estado - Estado (activo/inactivo o true/false)
 * @returns {object} Objeto con bg, text y label
 */
export const getEstadoActivoBadge = (estado) => {
  const estadoNormalizado = normalizarEstado(estado);
  
  if (estadoNormalizado === 'activo' || estado === true) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Activo'
    };
  }
  
  if (estadoNormalizado === 'inactivo' || estado === false) {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Inactivo'
    };
  }
  
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: estado || 'Sin estado'
  };
};

// ✅ Componente Badge movido a src/shared/components/Badge.jsx
// Importar desde: import Badge from '../../../../../shared/components/Badge';

/**
 * Función helper para generar badge de solicitud (mantiene compatibilidad)
 * @param {string} estado - Estado de la solicitud
 * @returns {object} Objeto con color (hex) y texto (para compatibilidad con código antiguo)
 */
export const getEstadoBadgeLegacy = (estado) => {
  const config = getEstadoSolicitudBadge(estado);
  
  // Convertir clases Tailwind a colores hex aproximados
  const colorMap = {
    'bg-green-100': '#28A745',
    'bg-blue-100': '#007BFF',
    'bg-yellow-100': '#FFA726',
    'bg-red-100': '#DC3545',
    'bg-gray-100': '#6C757D',
    'bg-orange-100': '#FF9800',
  };
  
  return {
    color: colorMap[config.bg] || '#6C757D',
    texto: config.label
  };
};

/**
 * Función helper para badge de pago (mantiene compatibilidad)
 * @param {string|boolean} estado - Estado del pago
 * @returns {object} Objeto con color (hex) y texto
 */
export const getEstadoPagoBadgeLegacy = (estado) => {
  const config = getEstadoPagoBadge(estado);
  
  const colorMap = {
    'bg-green-100': '#16a34a',
    'bg-red-100': '#dc2626',
    'bg-yellow-100': '#eab308',
    'bg-gray-100': '#6b7280',
  };
  
  return {
    color: colorMap[config.bg] || '#6b7280',
    texto: config.label
  };
};

// ✅ Nota: El componente Badge está en src/shared/components/Badge.jsx
// Exportar funciones principales
export default {
  getEstadoSolicitudBadge,
  getEstadoPagoBadge,
  getEstadoActivoBadge,
  getEstadoBadgeLegacy,
  getEstadoPagoBadgeLegacy,
};

