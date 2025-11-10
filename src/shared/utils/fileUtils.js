/**
 * Utilidades para manejo de archivos
 * Convierte archivos a base64 y valida tipos y tamaños
 */

/**
 * Convierte un archivo a base64
 * @param {File} file - Archivo a convertir
 * @param {boolean} includePrefix - Si incluir el prefijo data:image/jpeg;base64,
 * @returns {Promise<string>} - String en base64
 */
export const fileToBase64 = (file, includePrefix = true) => {
  return new Promise((resolve, reject) => {
    // Si no hay archivo, retornar null
    if (!file) {
      resolve(null);
      return;
    }

    // Si ya es un string base64, retornarlo
    if (typeof file === 'string') {
      // Validar que tenga el formato correcto
      if (file.trim() === '' || file === 'data:,') {
        resolve(null);
        return;
      }
      resolve(file);
      return;
    }

    // Si no es un File, rechazar
    if (!(file instanceof File)) {
      reject(new Error('El valor proporcionado no es un archivo válido'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      let base64String = reader.result;
      
      // Si no se quiere el prefijo, removerlo
      if (!includePrefix && base64String.includes(',')) {
        base64String = base64String.split(',')[1];
      }
      
      resolve(base64String);
    };
    
    reader.onerror = (error) => {
      reject(new Error(`Error al leer el archivo: ${error.message || 'Error desconocido'}`));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Valida un archivo antes de convertirlo
 * @param {File} file - Archivo a validar
 * @param {Object} options - Opciones de validación
 * @param {string[]} options.tiposPermitidos - Tipos MIME permitidos
 * @param {number} options.maxSize - Tamaño máximo en bytes
 * @param {number} options.minSize - Tamaño mínimo en bytes
 * @returns {Object} - { esValido, error }
 */
export const validarArchivo = (file, options = {}) => {
  const {
    tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    minSize = 0
  } = options;
  
  // Validar que sea un archivo
  if (!file || !(file instanceof File)) {
    return {
      esValido: false,
      error: 'No se proporcionó un archivo válido'
    };
  }

  // Validar tipo
  if (!tiposPermitidos.includes(file.type)) {
    return {
      esValido: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${tiposPermitidos.join(', ')}`
    };
  }
  
  // Validar tamaño
  if (file.size > maxSize) {
    return {
      esValido: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${(maxSize / (1024 * 1024)).toFixed(2)}MB`
    };
  }
  
  if (file.size < minSize) {
    return {
      esValido: false,
      error: `El archivo es demasiado pequeño. Tamaño mínimo: ${(minSize / 1024).toFixed(2)}KB`
    };
  }
  
  return { esValido: true };
};

/**
 * Procesa múltiples archivos y los convierte a base64
 * @param {FileList|Array} files - Lista de archivos
 * @param {Object} options - Opciones de validación
 * @returns {Promise<Array>} - Array de objetos { file, base64, error }
 */
export const procesarArchivos = async (files, options = {}) => {
  const resultados = [];
  
  for (const file of Array.from(files)) {
    const validacion = validarArchivo(file, options);
    
    if (!validacion.esValido) {
      resultados.push({
        file,
        base64: null,
        error: validacion.error
      });
      continue;
    }
    
    try {
      const base64 = await fileToBase64(file, true);
      resultados.push({
        file,
        base64,
        error: null
      });
    } catch (error) {
      resultados.push({
        file,
        base64: null,
        error: `Error al procesar archivo: ${error.message}`
      });
    }
  }
  
  return resultados;
};

/**
 * Obtiene el tamaño de un string base64 en MB
 * @param {string} base64String - String en base64
 * @returns {number} - Tamaño en MB
 */
export const obtenerTamañoBase64 = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return 0;
  }
  
  // Remover el prefijo data:...;base64, si existe
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  // Calcular tamaño aproximado (base64 aumenta el tamaño ~33%)
  const tamañoBytes = (base64Data.length * 3) / 4;
  return tamañoBytes / (1024 * 1024); // Convertir a MB
};

/**
 * Valida el tamaño total de un payload
 * @param {Object} payload - Objeto con datos que incluyen archivos base64
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {Object} - { esValido, tamañoMB, error }
 */
export const validarTamañoPayload = (payload, maxSizeMB = 10) => {
  const payloadString = JSON.stringify(payload);
  const tamañoBytes = new Blob([payloadString]).size;
  const tamañoMB = tamañoBytes / (1024 * 1024);
  
  if (tamañoMB > maxSizeMB) {
    return {
      esValido: false,
      tamañoMB: tamañoMB.toFixed(2),
      error: `El tamaño total del payload (${tamañoMB.toFixed(2)}MB) excede el límite máximo de ${maxSizeMB}MB`
    };
  }
  
  return {
    esValido: true,
    tamañoMB: tamañoMB.toFixed(2)
  };
};

