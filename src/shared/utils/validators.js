/**
 * Utilidades para validación de datos
 * Implementa validaciones según los requisitos del backend
 */

/**
 * Valida si un ID tiene formato numérico válido (protección SQL injection)
 * @param {string|number} id - ID a validar
 * @returns {boolean} - true si es válido
 */
export const isValidId = (id) => {
  if (id === null || id === undefined || id === '') return false;
  
  const idStr = String(id).trim();
  
  // Validar formato numérico estricto (protección SQL injection)
  return /^\d+$/.test(idStr) && parseInt(idStr, 10) > 0;
};

/**
 * Valida y convierte un ID a número entero
 * @param {string|number} id - ID a validar
 * @param {string} paramName - Nombre del parámetro para mensajes de error
 * @returns {number} - ID validado como número
 * @throws {Error} - Si el ID no es válido
 */
export const validateIdParam = (id, paramName = 'ID') => {
  if (!isValidId(id)) {
    throw new Error(`${paramName} inválido. Debe ser un número entero positivo.`);
  }
  return parseInt(String(id).trim(), 10);
};

/**
 * Valida un monto según los requisitos del backend
 * Requisitos:
 * - Debe ser un número positivo
 * - Máximo 2 decimales
 * - No exceder $1,000,000,000 (1 billón)
 * 
 * @param {string|number} amount - Monto a validar
 * @returns {Object} - { isValid: boolean, errors: string[], value: number }
 */
export const validateAmount = (amount) => {
  const errors = [];
  
  if (amount === null || amount === undefined || amount === '') {
    errors.push('El monto es requerido');
    return {
      isValid: false,
      errors,
      value: null
    };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    errors.push('El monto debe ser un número válido');
    return {
      isValid: false,
      errors,
      value: null
    };
  }

  if (numAmount <= 0) {
    errors.push('El monto debe ser un número positivo');
  }

  if (numAmount > 1000000000) {
    errors.push('El monto no puede exceder $1,000,000,000');
  }

  // Validar decimales
  const amountStr = String(amount);
  const decimalPart = amountStr.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    errors.push('El monto no puede tener más de 2 decimales');
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: numAmount
  };
};

/**
 * Valida un precio según los requisitos del backend
 * Mismos requisitos que validateAmount
 * 
 * @param {string|number} price - Precio a validar
 * @returns {Object} - { isValid: boolean, errors: string[], value: number }
 */
export const validatePrice = (price) => {
  return validateAmount(price);
};

/**
 * Sanitiza y valida un NIT
 * Remueve caracteres no numéricos y valida formato
 * 
 * @param {string|number} nit - NIT a validar
 * @returns {Object} - { isValid: boolean, errors: string[], value: string }
 */
export const validateNIT = (nit) => {
  const errors = [];
  
  if (!nit || nit === '') {
    errors.push('El NIT es requerido');
    return {
      isValid: false,
      errors,
      value: ''
    };
  }

  // Remover caracteres no numéricos
  const nitStr = String(nit).replace(/\D/g, '');
  
  if (nitStr.length === 0) {
    errors.push('El NIT debe contener al menos un dígito');
    return {
      isValid: false,
      errors,
      value: ''
    };
  }

  // Validar longitud (típicamente 9-10 dígitos para NIT colombiano)
  if (nitStr.length < 9 || nitStr.length > 10) {
    errors.push('El NIT debe tener entre 9 y 10 dígitos');
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: nitStr
  };
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida un teléfono (formato colombiano o internacional)
 * @param {string} phone - Teléfono a validar
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone || phone === '') {
    errors.push('El teléfono es requerido');
    return {
      isValid: false,
      errors
    };
  }

  const phoneStr = String(phone).trim();
  
  // Validar longitud (7-20 caracteres según documentación)
  if (phoneStr.length < 7 || phoneStr.length > 20) {
    errors.push('El teléfono debe tener entre 7 y 20 caracteres');
  }

  // Validar formato (puede contener números, espacios, guiones, paréntesis, +)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(phoneStr)) {
    errors.push('El teléfono contiene caracteres inválidos');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida múltiples IDs en un array
 * @param {Array} ids - Array de IDs a validar
 * @returns {Object} - { isValid: boolean, errors: string[], validIds: number[] }
 */
export const validateIds = (ids) => {
  const errors = [];
  const validIds = [];
  
  if (!Array.isArray(ids)) {
    errors.push('Los IDs deben ser un array');
    return {
      isValid: false,
      errors,
      validIds: []
    };
  }

  ids.forEach((id, index) => {
    if (isValidId(id)) {
      validIds.push(parseInt(String(id).trim(), 10));
    } else {
      errors.push(`ID en posición ${index} es inválido`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validIds
  };
};

/**
 * Valida que un string no esté vacío y tenga longitud mínima
 * @param {string} str - String a validar
 * @param {number} minLength - Longitud mínima
 * @param {string} fieldName - Nombre del campo para mensajes de error
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateString = (str, minLength = 1, fieldName = 'Campo') => {
  const errors = [];
  
  if (!str || typeof str !== 'string') {
    errors.push(`${fieldName} es requerido`);
    return {
      isValid: false,
      errors
    };
  }

  const trimmed = str.trim();
  
  if (trimmed.length < minLength) {
    errors.push(`${fieldName} debe tener al menos ${minLength} ${minLength === 1 ? 'carácter' : 'caracteres'}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

