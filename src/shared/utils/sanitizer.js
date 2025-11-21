/**
 * Utilidades para sanitización de inputs
 * Previene XSS e inyección SQL en el frontend
 * Complementa las validaciones del backend
 */

/**
 * Sanitiza un email: trim, lowercase, y remueve caracteres peligrosos
 * @param {string} email - Email a sanitizar
 * @returns {string} - Email sanitizado
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[<>\"']/g, '') // Remover caracteres peligrosos
    .replace(/\s+/g, ''); // Remover espacios
};

/**
 * Sanitiza una cadena de texto: trim y remueve caracteres peligrosos
 * @param {string} str - Cadena a sanitizar
 * @returns {string} - Cadena sanitizada
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>\"']/g, '') // Remover caracteres peligrosos para XSS
    .replace(/\s+/g, ' '); // Normalizar espacios múltiples a uno solo
};

/**
 * Sanitiza un número: valida que sea un número válido
 * @param {string|number} num - Número a sanitizar
 * @returns {number|null} - Número sanitizado o null si es inválido
 */
export const sanitizeNumber = (num) => {
  if (num === null || num === undefined || num === '') return null;
  
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(parsed)) return null;
  
  return parsed;
};

/**
 * Sanitiza un ID: valida formato numérico y lo convierte a entero
 * @param {string|number} id - ID a sanitizar
 * @returns {number|null} - ID sanitizado o null si es inválido
 */
export const sanitizeId = (id) => {
  if (id === null || id === undefined || id === '') return null;
  
  const idStr = String(id).trim();
  
  // Validar formato numérico estricto (protección SQL injection)
  if (!/^\d+$/.test(idStr)) return null;
  
  const parsed = parseInt(idStr, 10);
  
  if (isNaN(parsed) || parsed <= 0) return null;
  
  return parsed;
};

/**
 * Sanitiza un NIT: remueve caracteres no numéricos
 * @param {string|number} nit - NIT a sanitizar
 * @returns {string} - NIT sanitizado (solo números)
 */
export const sanitizeNIT = (nit) => {
  if (!nit) return '';
  
  const nitStr = String(nit);
  
  // Remover todos los caracteres no numéricos
  return nitStr.replace(/\D/g, '');
};

/**
 * Sanitiza un objeto completo aplicando sanitización según el tipo de campo
 * @param {Object} obj - Objeto a sanitizar
 * @param {Object} fieldTypes - Mapeo de campos a tipos ('email', 'string', 'number', 'id', 'nit')
 * @returns {Object} - Objeto sanitizado
 */
export const sanitizeObject = (obj, fieldTypes = {}) => {
  if (!obj || typeof obj !== 'object') return {};
  
  const sanitized = { ...obj };
  
  Object.keys(sanitized).forEach(key => {
    const fieldType = fieldTypes[key] || 'string';
    const value = sanitized[key];
    
    switch (fieldType) {
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value);
        break;
      case 'id':
        sanitized[key] = sanitizeId(value);
        break;
      case 'nit':
        sanitized[key] = sanitizeNIT(value);
        break;
      case 'string':
      default:
        sanitized[key] = sanitizeString(value);
        break;
    }
  });
  
  return sanitized;
};

/**
 * Sanitiza los datos de login antes de enviar al backend
 * @param {Object} loginData - { email, password }
 * @returns {Object} - Datos sanitizados
 */
export const sanitizeLoginData = (loginData) => {
  return {
    correo: sanitizeEmail(loginData.email || loginData.correo),
    contrasena: loginData.password || loginData.contrasena // No sanitizar contraseña
  };
};

/**
 * Sanitiza los datos de registro antes de enviar al backend
 * @param {Object} registerData - Datos de registro
 * @returns {Object} - Datos sanitizados
 */
export const sanitizeRegisterData = (registerData) => {
  return sanitizeObject(registerData, {
    email: 'email',
    correo: 'email',
    nombre: 'string',
    apellido: 'string',
    tipo_documento: 'string',
    documento: 'number',
    telefono: 'string'
  });
};

