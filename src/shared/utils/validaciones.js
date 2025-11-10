/**
 * Utilidades de validación para formularios
 * Específicamente para Certificación de Marca
 */

/**
 * Valida una solicitud de certificación de marca
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - { esValido, errores, warnings }
 */
export const validarSolicitudCertificacionMarca = (formData) => {
  const errores = [];
  const warnings = [];
  
  // Validar tipo_solicitante
  if (!formData.tipo_solicitante || 
      !['Natural', 'Jurídica'].includes(formData.tipo_solicitante)) {
    errores.push({
      campo: 'tipo_solicitante',
      mensaje: 'Debe seleccionar "Natural" o "Jurídica"'
    });
  }
  
  // Validar campos comunes
  if (!formData.nombres_apellidos || formData.nombres_apellidos.trim().length < 3) {
    errores.push({
      campo: 'nombres_apellidos',
      mensaje: 'El nombre completo debe tener al menos 3 caracteres'
    });
  }
  
  if (!formData.numero_documento || formData.numero_documento.trim().length < 5) {
    errores.push({
      campo: 'numero_documento',
      mensaje: 'El número de documento debe tener al menos 5 caracteres'
    });
  }
  
  // Validar email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.correo || !emailPattern.test(formData.correo)) {
    errores.push({
      campo: 'correo',
      mensaje: 'El correo electrónico no es válido'
    });
  }
  
  // Validar teléfono
  const telefonoPattern = /^[0-9+\-\s()]+$/;
  if (!formData.telefono || !telefonoPattern.test(formData.telefono)) {
    errores.push({
      campo: 'telefono',
      mensaje: 'El teléfono no es válido'
    });
  }
  
  // Validar archivos
  if (!formData.logotipo) {
    errores.push({
      campo: 'logotipo',
      mensaje: 'El logotipo es obligatorio'
    });
  }
  
  if (!formData.poder_autorizacion) {
    errores.push({
      campo: 'poder_autorizacion',
      mensaje: 'El poder de autorización es obligatorio'
    });
  }
  
  // Validaciones condicionales para Jurídica
  if (formData.tipo_solicitante === 'Jurídica') {
    if (!formData.certificado_camara_comercio) {
      errores.push({
        campo: 'certificado_camara_comercio',
        mensaje: 'El certificado de cámara de comercio es obligatorio para persona jurídica'
      });
    }
    
    if (!formData.razon_social || formData.razon_social.trim().length < 2) {
      errores.push({
        campo: 'razon_social',
        mensaje: 'La razón social es obligatoria para persona jurídica'
      });
    }
    
    if (!formData.nit_empresa) {
      errores.push({
        campo: 'nit_empresa',
        mensaje: 'El NIT de empresa es obligatorio para persona jurídica'
      });
    } else {
      const nit = Number(formData.nit_empresa);
      if (isNaN(nit) || nit < 1000000000 || nit > 9999999999) {
        errores.push({
          campo: 'nit_empresa',
          mensaje: 'El NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)'
        });
      }
    }
    
    if (!formData.representante_legal || formData.representante_legal.trim().length < 3) {
      errores.push({
        campo: 'representante_legal',
        mensaje: 'El representante legal es obligatorio para persona jurídica'
      });
    }
    
    if (!formData.tipo_entidad) {
      errores.push({
        campo: 'tipo_entidad',
        mensaje: 'El tipo de entidad es obligatorio para persona jurídica'
      });
    }
    
    if (!formData.direccion_domicilio) {
      errores.push({
        campo: 'direccion_domicilio',
        mensaje: 'La dirección de domicilio es obligatoria para persona jurídica'
      });
    }
  }
  
  // Validar tamaño total del payload (aprox)
  const payloadSize = JSON.stringify(formData).length;
  const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
  
  if (payloadSize > 10 * 1024 * 1024) {
    warnings.push({
      campo: 'payload',
      mensaje: `El tamaño del payload (${payloadSizeMB}MB) es muy grande. Puede causar errores.`
    });
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    warnings
  };
};

/**
 * Valida campos específicos según el tipo de solicitante
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - { esValido, errores }
 */
export const validarCamposCondicionales = (formData) => {
  const errores = [];
  
  if (formData.tipo_solicitante === 'Jurídica') {
    const camposJuridica = [
      'certificado_camara_comercio',
      'tipo_entidad',
      'razon_social',
      'nit_empresa',
      'representante_legal',
      'direccion_domicilio'
    ];
    
    camposJuridica.forEach(campo => {
      if (!formData[campo] || (typeof formData[campo] === 'string' && formData[campo].trim() === '')) {
        errores.push({
          campo,
          mensaje: `El campo ${campo} es obligatorio para persona jurídica`
        });
      }
    });
    
    // Validación especial de NIT
    if (formData.nit_empresa) {
      const nit = Number(formData.nit_empresa);
      if (isNaN(nit) || nit < 1000000000 || nit > 9999999999) {
        errores.push({
          campo: 'nit_empresa',
          mensaje: 'El NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)'
        });
      }
    }
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
};

