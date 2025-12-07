// Servicio para conectar solicitudes/procesos con la API real
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class SolicitudesApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    console.log('🔧 [SolicitudesApiService] Base URL configurada:', this.baseURL);
  }

  // Función para hacer peticiones HTTP
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Construir headers correctamente
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    // Construir config separando headers y body
    const config = {
      method: options.method || 'GET',
      headers: headers
    };
    
    // Solo agregar body si existe y asegurarse de que sea string JSON
    if (options.body) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      console.log('📤 [SolicitudesApiService] Request body:', config.body);
      console.log('📤 [SolicitudesApiService] Request headers:', headers);
    }

    try {
      console.log('🌐 [SolicitudesApiService] Base URL:', this.baseURL);
      console.log('🌐 [SolicitudesApiService] Endpoint:', endpoint);
      console.log('🌐 [SolicitudesApiService] URL completa:', url);
      console.log('🌐 [SolicitudesApiService] Method:', config.method);
      
      // ✅ MEJORADO: Agregar timeout a la petición (1 minuto y 15 segundos para creación de solicitudes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 75000); // 1 minuto y 15 segundos (75 segundos)
      
      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        console.log('📡 [SolicitudesApiService] Response status:', response.status);
        console.log('📡 [SolicitudesApiService] Response ok:', response.ok);
        console.log('📡 [SolicitudesApiService] Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          // Obtener información completa del error
        let errorData = {};
        let errorText = '';
        try {
          const text = await response.clone().text();
          errorText = text;
          console.error('❌ [SolicitudesApiService] Error response text:', text);
          console.error('❌ [SolicitudesApiService] Response status:', response.status);
          console.error('❌ [SolicitudesApiService] Response statusText:', response.statusText);
          console.error('❌ [SolicitudesApiService] Response headers:', Object.fromEntries(response.headers.entries()));
          try {
            errorData = JSON.parse(text);
            console.error('❌ [SolicitudesApiService] Error data parsed:', errorData);
            // Si hay detalles adicionales en el error, mostrarlos
            if (errorData.error?.details) {
              console.error('❌ [SolicitudesApiService] Error details:', errorData.error.details);
            }
            if (errorData.camposFaltantes) {
              console.error('❌ [SolicitudesApiService] Campos faltantes:', errorData.camposFaltantes);
            }
            if (errorData.camposRequeridos) {
              console.error('❌ [SolicitudesApiService] Campos requeridos:', errorData.camposRequeridos);
            }
            // Si hay stack trace en el error, mostrarlo
            if (errorData.stack) {
              console.error('❌ [SolicitudesApiService] Stack trace:', errorData.stack);
            }
            if (errorData.error?.stack) {
              console.error('❌ [SolicitudesApiService] Error stack trace:', errorData.error.stack);
            }
          } catch (parseError) {
            // Si no es JSON, usar el texto como mensaje
            errorText = text;
            console.error('❌ [SolicitudesApiService] No se pudo parsear error como JSON:', parseError);
            console.error('❌ [SolicitudesApiService] Texto del error:', text.substring(0, 500));
          }
        } catch (e) {
          console.error('❌ [SolicitudesApiService] No se pudo obtener error response:', e);
          errorText = `Error ${response.status}: ${response.statusText}`;
        }
        
        console.error('❌ [SolicitudesApiService] Error data completo:', errorData);
        
        // Extraer mensaje de error según formato del backend
        let errorMessage = errorData.mensaje || 
                           errorData.message || 
                           errorData.error?.message ||
                           errorData.error ||
                           errorText || 
                           `Error ${response.status}: ${response.statusText}`;
        
        // Para errores 500, agregar más contexto (backend ya implementó mejoras)
        if (response.status === 500) {
          errorMessage = errorMessage || 'Error interno del servidor';
          
          // ✅ Backend mejorado: ahora devuelve detalles estructurados
          if (errorData.error?.details) {
            const detalles = errorData.error.details;
            if (typeof detalles === 'object') {
              // Si hay un mensaje específico en los detalles, usarlo
              if (detalles.message || detalles.error) {
                errorMessage += `\n\nDetalles: ${detalles.message || detalles.error}`;
              }
              // Si hay información sobre el tipo de error
              if (detalles.tipo) {
                errorMessage += `\n\nTipo de error: ${detalles.tipo}`;
              }
              // Si hay información sobre el payload
              if (detalles.payloadSize) {
                errorMessage += `\n\nTamaño del payload: ${detalles.payloadSize}`;
              }
            } else {
              errorMessage += `\n\nDetalles: ${JSON.stringify(detalles, null, 2)}`;
            }
          }
          
          // Información adicional del error del backend mejorado
          if (errorData.error?.message && errorData.error.message !== 'Error interno del servidor') {
            errorMessage = `${errorData.error.message}\n\n${errorMessage}`;
          }
          
          // ✅ Detectar errores de base de datos relacionados con columnas pequeñas
          if (errorData.error?.message && errorData.error.message.includes('Data too long for column')) {
            const columnMatch = errorData.error.message.match(/column '([^']+)'/);
            if (columnMatch) {
              const columnName = columnMatch[1];
              // Determinar si es un archivo Base64 o un campo de texto
              const esCampoTexto = columnName.includes('tipo_documento') || 
                                  columnName.includes('nombre') || 
                                  columnName.includes('razon_social') ||
                                  columnName.includes('representante_legal') ||
                                  columnName.includes('direccion') ||
                                  columnName.includes('correo');
              
              if (esCampoTexto) {
                errorMessage += `\n\n⚠️ PROBLEMA DE BASE DE DATOS:`;
                errorMessage += `\nLa columna '${columnName}' en la base de datos es demasiado pequeña para almacenar el valor.`;
                errorMessage += `\n\n📊 INFORMACIÓN DEL CAMPO:`;
              } else {
                errorMessage += `\n\n⚠️ PROBLEMA DE BASE DE DATOS:`;
                errorMessage += `\nLa columna '${columnName}' en la base de datos es demasiado pequeña para almacenar el archivo.`;
                errorMessage += `\n\n📊 INFORMACIÓN DEL ARCHIVO:`;
              }
              
              // Intentar obtener información del tamaño del campo/archivo del payload
              try {
                if (options.body) {
                  const payloadData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                  
                  // Buscar el campo que corresponde a esta columna
                  let campoArchivo = '';
                  let tamanioArchivo = 0;
                  let valorCampo = '';
                  
                  if (columnName.includes('poderparaelregistrodelamarca') || columnName.includes('poder_autorizacion')) {
                    campoArchivo = 'poder_autorizacion';
                    if (payloadData.poder_autorizacion) {
                      tamanioArchivo = payloadData.poder_autorizacion.length;
                    }
                  } else if (columnName.includes('logotipo')) {
                    campoArchivo = 'logotipo';
                    if (payloadData.logotipo) {
                      tamanioArchivo = payloadData.logotipo.length;
                    }
                  } else if (columnName.includes('documento_cesion')) {
                    campoArchivo = 'documento_cesion';
                    if (payloadData.documento_cesion) {
                      tamanioArchivo = payloadData.documento_cesion.length;
                    }
                  } else if (columnName.includes('certificado_renovacion')) {
                    campoArchivo = 'certificado_renovacion';
                    if (payloadData.certificado_renovacion) {
                      tamanioArchivo = payloadData.certificado_renovacion.length;
                    }
                  } else if (columnName.includes('soportes')) {
                    campoArchivo = 'soportes';
                    if (payloadData.soportes) {
                      tamanioArchivo = payloadData.soportes.length;
                    }
                  } else if (columnName.includes('certificado')) {
                    campoArchivo = 'certificado_camara_comercio';
                    if (payloadData.certificado_camara_comercio) {
                      tamanioArchivo = payloadData.certificado_camara_comercio.length;
                    }
                  } else if (columnName.includes('tipo_documento_cesionario')) {
                    campoArchivo = 'tipo_documento_cesionario';
                    if (payloadData.tipo_documento_cesionario) {
                      valorCampo = payloadData.tipo_documento_cesionario;
                      tamanioArchivo = payloadData.tipo_documento_cesionario.length;
                    }
                  } else if (columnName.includes('numero_documento_cesionario')) {
                    campoArchivo = 'numero_documento_cesionario';
                    if (payloadData.numero_documento_cesionario) {
                      valorCampo = payloadData.numero_documento_cesionario;
                      tamanioArchivo = payloadData.numero_documento_cesionario.length;
                    }
                  } else if (columnName.includes('nombre_razon_social_cesionario')) {
                    campoArchivo = 'nombre_razon_social_cesionario';
                    if (payloadData.nombre_razon_social_cesionario) {
                      valorCampo = payloadData.nombre_razon_social_cesionario;
                      tamanioArchivo = payloadData.nombre_razon_social_cesionario.length;
                    }
                  } else if (columnName.includes('representante_legal_cesionario')) {
                    campoArchivo = 'representante_legal_cesionario';
                    if (payloadData.representante_legal_cesionario) {
                      valorCampo = payloadData.representante_legal_cesionario;
                      tamanioArchivo = payloadData.representante_legal_cesionario.length;
                    }
                  }
                  
                  if (tamanioArchivo > 0) {
                    errorMessage += `\n- Campo: ${campoArchivo}`;
                    if (esCampoTexto && valorCampo) {
                      errorMessage += `\n- Valor enviado: "${valorCampo}"`;
                      errorMessage += `\n- Longitud: ${tamanioArchivo} caracteres`;
                      errorMessage += `\n- Tipo de columna actual: Probablemente VARCHAR(20) o menor`;
                      errorMessage += `\n- Tamaño necesario: ${tamanioArchivo} caracteres`;
                    } else {
                      const tamanioKB = (tamanioArchivo / 1024).toFixed(2);
                      const tamanioMB = (tamanioArchivo / (1024 * 1024)).toFixed(2);
                      errorMessage += `\n- Tamaño del archivo: ${tamanioKB}KB (${tamanioMB}MB)`;
                      errorMessage += `\n- Tipo de columna actual: Probablemente VARCHAR(255) o similar (máximo ~255 caracteres)`;
                      errorMessage += `\n- Tamaño necesario: ${tamanioKB}KB (${tamanioArchivo} caracteres)`;
                    }
                  }
                }
              } catch (e) {
                // Ignorar errores al parsear
              }
              
              errorMessage += `\n\n🔧 SOLUCIÓN BACKEND (URGENTE - REQUERIDA INMEDIATAMENTE):`;
              errorMessage += `\n\n⚠️ ESTE ES UN ERROR CRÍTICO DE BASE DE DATOS ⚠️`;
              
              if (esCampoTexto) {
                errorMessage += `\n\nLa columna '${columnName}' es demasiado pequeña para almacenar el valor de texto.`;
                errorMessage += `\n\n📋 PASOS PARA SOLUCIONAR (2 minutos):`;
                errorMessage += `\n\n1. Conectar a la base de datos MySQL/MariaDB:`;
                errorMessage += `\n   mysql -u [usuario] -p [nombre_base_datos]`;
                errorMessage += `\n\n2. Ejecutar este comando SQL:`;
                if (columnName.includes('tipo_documento_cesionario')) {
                  errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN ${columnName} VARCHAR(50);`;
                } else if (columnName.includes('numero_documento_cesionario')) {
                  errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN ${columnName} VARCHAR(20);`;
                } else if (columnName.includes('nombre_razon_social_cesionario')) {
                  errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN ${columnName} VARCHAR(100);`;
                } else if (columnName.includes('representante_legal_cesionario')) {
                  errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN ${columnName} VARCHAR(100);`;
                } else {
                  errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN ${columnName} VARCHAR(100);`;
                }
                errorMessage += `\n\n3. Verificar cambios:`;
                errorMessage += `\n   SHOW COLUMNS FROM orden_servicios WHERE Field = '${columnName}';`;
                errorMessage += `\n\n💡 NOTA: Para campos de texto, usar VARCHAR con tamaño apropiado (no LONGTEXT)`;
                errorMessage += `\n\n📄 Ver archivo: PROMPT_BACKEND_CESION_COLUMNA_PEQUENA.md para más detalles`;
              } else {
                errorMessage += `\n\nLa columna '${columnName}' es demasiado pequeña para almacenar archivos Base64.`;
                errorMessage += `\n\n📋 PASOS PARA SOLUCIONAR (5 minutos):`;
                errorMessage += `\n\n1. Conectar a la base de datos MySQL/MariaDB:`;
                errorMessage += `\n   mysql -u [usuario] -p [nombre_base_datos]`;
                errorMessage += `\n\n2. Ejecutar este comando SQL:`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN ${columnName} LONGTEXT;`;
                errorMessage += `\n\n3. ⚠️ IMPORTANTE: Cambiar TODAS las columnas de archivos a LONGTEXT:`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN logotipo LONGTEXT;`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN poder_autorizacion LONGTEXT;`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN certificado_camara_comercio LONGTEXT;`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN poderparaelregistrodelamarca LONGTEXT;`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN poderdelrepresentanteautorizado LONGTEXT;`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN certificado_renovacion LONGTEXT;`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN documento_cesion LONGTEXT;`;
                errorMessage += `\n   ALTER TABLE orden_servicios MODIFY COLUMN soportes LONGTEXT;`;
                errorMessage += `\n\n4. Verificar cambios:`;
                errorMessage += `\n   SHOW COLUMNS FROM orden_servicios WHERE Field = '${columnName}';`;
                errorMessage += `\n   (Debe mostrar: Type: longtext)`;
                errorMessage += `\n\n💡 NOTA: LONGTEXT puede almacenar hasta 4GB de datos (suficiente para cualquier archivo Base64)`;
                errorMessage += `\n\n📄 Ver archivo: INSTRUCCIONES_BACKEND_COLUMNAS_ARCHIVOS.md para más detalles`;
              }
            }
          }
          
          if (errorData.detalles) {
            errorMessage += `\n\nDetalles adicionales: ${JSON.stringify(errorData.detalles, null, 2)}`;
          }
          
          // Campos faltantes o requeridos (si el backend los proporciona)
          if (errorData.camposFaltantes && errorData.camposFaltantes.length > 0) {
            errorMessage += `\n\n❌ Campos faltantes: ${errorData.camposFaltantes.join(', ')}`;
          }
          if (errorData.camposRequeridos && errorData.camposRequeridos.length > 0) {
            errorMessage += `\n\n📋 Campos requeridos: ${errorData.camposRequeridos.join(', ')}`;
          }
          
          // Información del payload enviado (para debugging)
          if (options.body) {
            try {
              const payloadData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
              const payloadSize = JSON.stringify(payloadData).length;
              const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
              
              // Solo mostrar si el payload es grande (para debugging)
              if (payloadSize > 1024 * 1024) { // > 1MB
                errorMessage += `\n\n📊 Información del payload:`;
                errorMessage += `\n- Tamaño: ${payloadSizeMB}MB (${payloadSize} caracteres)`;
                errorMessage += `\n- Campos enviados: ${Object.keys(payloadData).length}`;
                errorMessage += `\n- Tipo solicitante: ${payloadData.tipo_solicitante || 'N/A'}`;
              }
            } catch (e) {
              // Ignorar error de parsing
            }
          }
        }
        
        // Si hay campos faltantes, incluirlos en el mensaje
        if (errorData.camposFaltantes && errorData.camposFaltantes.length > 0) {
          errorMessage += `\nCampos faltantes: ${errorData.camposFaltantes.join(', ')}`;
        }
        
        // ✅ MEJORADO: Crear error con información adicional para mejor manejo
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        
        // Detectar caso específico de solicitud ya anulada
        const errorMessageLower = errorMessage.toLowerCase();
        if (errorMessageLower.includes("ya está anulada") || 
            errorMessageLower.includes("ya ha sido anulada") ||
            errorMessageLower.includes("already cancelled") ||
            errorMessageLower.includes("already canceled")) {
          error.isAlreadyCancelled = true;
        }
        
        throw error;
      }

        const data = await response.json();
        console.log('✅ [SolicitudesApiService] Response data:', data);
        console.log('✅ [SolicitudesApiService] Response data type:', typeof data);
        console.log('✅ [SolicitudesApiService] Response data keys:', data ? Object.keys(data) : 'null');
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Si es un error de abort (timeout), lanzar error específico
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ [SolicitudesApiService] Timeout: La petición tardó más de 1 minuto y 15 segundos');
          const timeoutError = new Error('La petición tardó demasiado tiempo. Por favor, verifica tu conexión o intenta nuevamente.');
          timeoutError.isTimeout = true;
          throw timeoutError;
        }
        
        // Re-lanzar otros errores de fetch
        throw fetchError;
      }
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error en petición API:`, error);
      console.error(`❌ [SolicitudesApiService] Error name:`, error.name);
      console.error(`❌ [SolicitudesApiService] Error message:`, error.message);
      console.error(`❌ [SolicitudesApiService] Error stack:`, error.stack);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes - Obtener todas las solicitudes (admin/empleado)
  async getAllSolicitudes(token) {
    try {
      console.log('🔧 [SolicitudesApiService] Obteniendo todas las solicitudes...');
      const solicitudes = await this.makeRequest('/api/gestion-solicitudes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Solicitudes obtenidas:', solicitudes.length);
      return solicitudes;
    } catch (error) {
      console.error('❌ [SolicitudesApiService] Error obteniendo solicitudes:', error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/mias - Obtener mis solicitudes (cliente)
  async getMisSolicitudes(token) {
    try {
      console.log('🔧 [SolicitudesApiService] Obteniendo mis solicitudes...');
      console.log('🔧 [SolicitudesApiService] Token:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      
      const respuesta = await this.makeRequest('/api/gestion-solicitudes/mias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 [SolicitudesApiService] Respuesta raw:', respuesta);
      console.log('🔍 [SolicitudesApiService] Tipo de respuesta:', typeof respuesta);
      console.log('🔍 [SolicitudesApiService] Es array?', Array.isArray(respuesta));
      
      // Extraer el array de solicitudes de la respuesta
      let solicitudes = null;
      
      if (Array.isArray(respuesta)) {
        // ✅ La respuesta es directamente un array
        solicitudes = respuesta;
        console.log('✅ [SolicitudesApiService] Respuesta es array directo con', solicitudes.length, 'elementos');
      } else if (respuesta && typeof respuesta === 'object') {
        // Intentar extraer el array de diferentes propiedades comunes
        if (Array.isArray(respuesta.data)) {
          solicitudes = respuesta.data;
          console.log('✅ [SolicitudesApiService] Array encontrado en .data:', solicitudes.length, 'elementos');
        } else if (Array.isArray(respuesta.solicitudes)) {
          solicitudes = respuesta.solicitudes;
          console.log('✅ [SolicitudesApiService] Array encontrado en .solicitudes:', solicitudes.length, 'elementos');
        } else if (Array.isArray(respuesta.result)) {
          solicitudes = respuesta.result;
          console.log('✅ [SolicitudesApiService] Array encontrado en .result:', solicitudes.length, 'elementos');
        } else {
          // Si no encontramos un array, loggear la estructura para debugging
          console.warn('⚠️ [SolicitudesApiService] No se encontró array en la respuesta. Estructura:', Object.keys(respuesta));
          console.warn('⚠️ [SolicitudesApiService] Respuesta completa:', JSON.stringify(respuesta, null, 2).substring(0, 500));
          solicitudes = []; // Devolver array vacío en lugar de lanzar error
        }
      } else {
        console.warn('⚠️ [SolicitudesApiService] Respuesta no es array ni objeto:', respuesta);
        solicitudes = [];
      }
      
      if (!Array.isArray(solicitudes)) {
        console.error('❌ [SolicitudesApiService] No se pudo extraer un array válido de la respuesta');
        solicitudes = [];
      }
      
      console.log('✅ [SolicitudesApiService] Mis solicitudes obtenidas:', solicitudes.length);
      if (solicitudes.length > 0) {
        console.log('📊 [SolicitudesApiService] Primera solicitud:', solicitudes[0]);
      }
      
      return solicitudes;
    } catch (error) {
      console.error('❌ [SolicitudesApiService] Error obteniendo mis solicitudes:', error);
      console.error('❌ [SolicitudesApiService] Stack:', error.stack);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/:id - Obtener solicitud específica
  async getSolicitudById(id, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo solicitud ${id}...`);
      const solicitud = await this.makeRequest(`/api/gestion-solicitudes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Solicitud obtenida:', solicitud);
      return solicitud;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo solicitud ${id}:`, error);
      throw error;
    }
  }

  // POST /api/gestion-solicitudes/crear/:servicio - Crear nueva solicitud
  // ✅ CORREGIDO: El parámetro :servicio debe ser el ID numérico del servicio, no el nombre
  async crearSolicitud(servicioId, datos, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Creando solicitud para servicio ID: ${servicioId}...`, datos);
      
      // ✅ IMPORTANTE: El endpoint espera el ID numérico del servicio, no el nombre
      // Validar que servicioId sea un número
      if (!servicioId || (typeof servicioId !== 'number' && isNaN(parseInt(servicioId)))) {
        throw new Error(`ID de servicio inválido: ${servicioId}. Debe ser un número.`);
      }
      
      // Asegurar que sea un número
      const idServicio = typeof servicioId === 'number' ? servicioId : parseInt(servicioId);
      
      // ✅ Logging detallado del payload antes de enviar
      console.log('📤 [SolicitudesApiService] ========== PAYLOAD COMPLETO ==========');
      console.log('📤 [SolicitudesApiService] Servicio ID:', idServicio);
      console.log('📤 [SolicitudesApiService] Total de campos:', Object.keys(datos).length);
      console.log('📤 [SolicitudesApiService] Campos enviados:', Object.keys(datos));
      console.log('📤 [SolicitudesApiService] Tamaño del payload (JSON):', JSON.stringify(datos).length, 'caracteres');
      
      // Log de cada campo (sin mostrar el contenido completo de base64)
      const datosLog = {};
      for (const [key, value] of Object.entries(datos)) {
        if (typeof value === 'string' && value.length > 100 && (key.includes('logo') || key.includes('poder') || key.includes('certificado') || key.includes('documento') || key.includes('soporte'))) {
          datosLog[key] = `[Base64 - ${value.length} caracteres]`;
        } else {
          datosLog[key] = value;
        }
      }
      console.log('📤 [SolicitudesApiService] Datos (resumidos):', datosLog);
      console.log('📤 [SolicitudesApiService] ===========================================');
      
      // Log final antes de enviar - mostrar estructura exacta sin los archivos completos
      const datosParaLog = {};
      for (const [key, value] of Object.entries(datos)) {
        if (typeof value === 'string' && value.startsWith('data:') && value.length > 100) {
          datosParaLog[key] = `[Base64 - ${value.length} caracteres, tipo: ${value.substring(5, value.indexOf(';'))}]`;
        } else {
          datosParaLog[key] = value;
        }
      }
      console.log('🔍 [SolicitudesApiService] DATOS FINALES QUE SE ENVIARÁN AL BACKEND:');
      console.log(JSON.stringify(datosParaLog, null, 2));
      console.log('🔍 [SolicitudesApiService] Número total de campos:', Object.keys(datos).length);
      console.log('🔍 [SolicitudesApiService] Campos presentes:', Object.keys(datos).join(', '));
      
      // ✅ Validar tamaño del payload antes de enviar
      const payloadString = JSON.stringify(datos);
      const payloadSize = payloadString.length;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
      const payloadSizeKB = (payloadSize / 1024).toFixed(2);
      
      console.log(`📊 [SolicitudesApiService] Tamaño del payload: ${payloadSizeKB}KB (${payloadSizeMB}MB)`);
      
      // ✅ Backend ya implementó el límite de 10MB, solo informar si es muy grande
      if (payloadSize > 9 * 1024 * 1024) { // > 9MB (cerca del límite de 10MB)
        console.warn(`⚠️ [SolicitudesApiService] ADVERTENCIA: El payload (${payloadSizeKB}KB) está cerca del límite del backend (10MB)`);
        console.warn(`⚠️ [SolicitudesApiService] Si el payload excede 10MB, la solicitud fallará`);
      } else if (payloadSize > 1024 * 1024) { // > 1MB (solo informativo)
        console.log(`ℹ️ [SolicitudesApiService] Payload de ${payloadSizeKB}KB (dentro del límite de 10MB)`);
      }
      
      const solicitudCreada = await this.makeRequest(`/api/gestion-solicitudes/crear/${idServicio}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payloadString
      });
      
      console.log('✅ [SolicitudesApiService] Solicitud creada:', solicitudCreada);
      return solicitudCreada;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error creando solicitud para servicio ID ${servicioId}:`, error);
      throw error;
    }
  }

  // PUT /api/gestion-solicitudes/editar/:id - Editar solicitud
  async editarSolicitud(id, datos, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Editando solicitud ${id}...`, datos);
      const solicitudEditada = await this.makeRequest(`/api/gestion-solicitudes/editar/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });
      console.log('✅ [SolicitudesApiService] Solicitud editada:', solicitudEditada);
      return solicitudEditada;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error editando solicitud ${id}:`, error);
      throw error;
    }
  }

  // PUT /api/gestion-solicitudes/anular/:id - Anular solicitud
  async anularSolicitud(id, motivo, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Anulando solicitud ${id} con motivo: ${motivo}...`);
      
      // Validar que el motivo existe y no está vacío
      if (!motivo || !motivo.trim()) {
        throw new Error('El motivo de anulación es requerido');
      }
      
      const bodyData = {
        motivo: motivo.trim()
      };
      
      const bodyString = JSON.stringify(bodyData);
      console.log('📤 [SolicitudesApiService] Payload de anulación:', bodyString);
      console.log('📤 [SolicitudesApiService] BodyData objeto:', bodyData);
      
      const solicitudAnulada = await this.makeRequest(`/api/gestion-solicitudes/anular/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type ya está en makeRequest por defecto
        },
        body: bodyString  // ✅ Asegurar que es un string JSON
      });
      
      console.log('✅ [SolicitudesApiService] Solicitud anulada:', solicitudAnulada);
      return solicitudAnulada;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error anulando solicitud ${id}:`, error);
      
      // ✅ MEJORADO: Agregar información adicional al error para mejor manejo en el componente
      if (error.message) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes("ya está anulada") || 
            errorMessage.includes("ya ha sido anulada") ||
            errorMessage.includes("already cancelled") ||
            errorMessage.includes("already canceled")) {
          // Marcar el error como "ya anulada" para manejo especial
          error.isAlreadyCancelled = true;
        }
      }
      
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/buscar - Buscar solicitudes
  async buscarSolicitudes(termino, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Buscando solicitudes con término: ${termino}...`);
      const solicitudes = await this.makeRequest(`/api/gestion-solicitudes/buscar?search=${encodeURIComponent(termino)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Solicitudes encontradas:', solicitudes.length);
      return solicitudes;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error buscando solicitudes con término ${termino}:`, error);
      throw error;
    }
  }

  // PUT /api/gestion-solicitudes/asignar-empleado/:id - Asignar empleado a solicitud
  async asignarEmpleado(solicitudId, empleadoId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Asignando empleado ${empleadoId} a solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/asignar-empleado/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_empleado: empleadoId })
      });
      console.log('✅ [SolicitudesApiService] Empleado asignado exitosamente:', resultado);
      return resultado;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error asignando empleado a solicitud ${solicitudId}:`, error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/:id/empleado-asignado - Obtener empleado asignado
  async getEmpleadoAsignado(solicitudId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo empleado asignado a solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/${solicitudId}/empleado-asignado`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Empleado asignado obtenido:', resultado);
      return resultado;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo empleado asignado de solicitud ${solicitudId}:`, error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/:id/estados-disponibles - Obtener estados disponibles del servicio
  async getEstadosDisponibles(solicitudId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo estados disponibles para solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/${solicitudId}/estados-disponibles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Estados disponibles obtenidos:', resultado);
      return resultado.data?.estados_disponibles || [];
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo estados disponibles de solicitud ${solicitudId}:`, error);
      return [];
    }
  }

  // GET /api/gestion-solicitudes/:id/estado-actual - Obtener estado actual de la solicitud
  async getEstadoActual(solicitudId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo estado actual de solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/${solicitudId}/estado-actual`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Estado actual obtenido:', resultado);
      return resultado.data?.estado_actual || 'Pendiente';
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo estado actual de solicitud ${solicitudId}:`, error);
      return 'Pendiente';
    }
  }

  // Función auxiliar para convertir archivo a Base64
  async convertirArchivoABase64(archivo) {
    if (!archivo) return null; // Retornar null en lugar de string vacío
    if (typeof archivo === 'string') {
      // Si ya es base64, validar que tenga el formato correcto
      if (archivo.trim() === '' || archivo === 'data:,') {
        return null;
      }
      return archivo; // Ya es Base64 válido
    }
    if (archivo instanceof File) {
      return new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(archivo);
          reader.onload = () => {
            const result = reader.result;
            // Validar que la conversión fue exitosa
            if (result && result.startsWith('data:')) {
              resolve(result);
            } else {
              reject(new Error('Error al convertir archivo a base64'));
            }
          };
          reader.onerror = error => {
            console.error('❌ [SolicitudesApiService] Error en FileReader:', error);
            reject(new Error('Error al leer el archivo'));
          };
        } catch (error) {
          console.error('❌ [SolicitudesApiService] Error al convertir archivo:', error);
          reject(error);
        }
      });
    }
    return null; // Retornar null para valores no válidos
  }
  
  /**
   * Limpiar datos antes de enviar: remover campos con valores null, undefined o strings vacíos
   * EXCEPTO si son campos requeridos por la API
   */
  limpiarDatosParaEnvio(datos, camposRequeridos = []) {
    const datosLimpios = {};
    for (const [key, value] of Object.entries(datos)) {
      // Si el campo es requerido, mantenerlo incluso si está vacío (el backend lo validará)
      if (camposRequeridos.includes(key)) {
        datosLimpios[key] = value === null || value === undefined ? '' : value;
      } 
      // Si no es requerido, solo incluir si tiene un valor válido
      else if (value !== null && value !== undefined && value !== '') {
        // Para archivos en base64, verificar que no sea solo el prefijo
        if (typeof value === 'string' && value.startsWith('data:') && value.length > 100) {
          datosLimpios[key] = value;
        } else if (typeof value !== 'string' || (typeof value === 'string' && value.trim() !== '')) {
          datosLimpios[key] = value;
        }
      }
    }
    return datosLimpios;
  }

  // Función para transformar datos del frontend al formato de la API
  async transformarDatosParaAPI(datosFrontend, tipoServicio, userRole = null) {
    console.log('🔧 [SolicitudesApiService] Transformando datos del frontend para API...', datosFrontend);
    console.log('🔧 [SolicitudesApiService] Rol del usuario:', userRole);
    
    // Mapeo de tipos de servicio del frontend a la API
    const mapeoServicios = {
      'Búsqueda de Antecedentes': 'Búsqueda de antecedentes',
      'Certificación de Marca': 'Certificación de marca',
      'Renovación de Marca': 'Renovación de marca',
      'Presentación de Oposición': 'Presentación de oposición',
      'Cesión de Marca': 'Cesión de marca',
      'Ampliación de Alcance': 'Ampliación de alcance',
      'Respuesta a Oposición': 'Respuesta a oposición'
    };

    const servicioAPI = mapeoServicios[tipoServicio] || tipoServicio;
    
    // Helper para obtener nombres_apellidos
    const obtenerNombresApellidos = () => {
      if (datosFrontend.nombres && datosFrontend.apellidos) {
        return `${datosFrontend.nombres} ${datosFrontend.apellidos}`.trim();
      }
      return datosFrontend.nombresApellidos || datosFrontend.titular || '';
    };

    // Helper para obtener clase_niza
    const obtenerClaseNiza = () => {
      if (datosFrontend.clases && datosFrontend.clases.length > 0) {
        return datosFrontend.clases.map(c => c.numero).filter(n => n).join(', ');
      }
      return datosFrontend.claseNiza || datosFrontend.categoria || '';
    };

    // Helper para convertir archivos a Base64
    const convertirArchivos = async (campos) => {
      const datosConvertidos = {};
      for (const [key, value] of Object.entries(campos)) {
        if (value && (value instanceof File || typeof value === 'object')) {
          try {
            datosConvertidos[key] = await this.convertirArchivoABase64(value);
          } catch (error) {
            console.error(`❌ [SolicitudesApiService] Error convirtiendo archivo ${key}:`, error);
            datosConvertidos[key] = ''; // Usar string vacío si falla la conversión
          }
        } else {
          datosConvertidos[key] = value || '';
        }
      }
      return datosConvertidos;
    };

    // Helper para truncar tipo_producto_servicio a máximo 50 caracteres (límite de BD)
    // Si el valor excede este límite, se truncará automáticamente
    const truncarTipoProductoServicio = (value, maxLength = 50) => {
      if (!value) return '';
      const trimmed = String(value).trim();
      if (trimmed.length <= maxLength) return trimmed;
      console.warn(`⚠️ [SolicitudesApiService] tipo_producto_servicio truncado de ${trimmed.length} a ${maxLength} caracteres: "${trimmed.substring(0, maxLength)}..."`);
      return trimmed.substring(0, maxLength);
    };

    // Transformar según el tipo de servicio
    let datosAPI = {};
    
    switch (servicioAPI) {
      case 'Búsqueda de antecedentes':
        // ✅ Validar campos requeridos antes de construir el objeto
        // Función auxiliar para convertir a string y hacer trim
        const toStringAndTrim = (value) => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return String(value);
          if (typeof value === 'string') return value.trim();
          return String(value).trim();
        };
        
        const nombresApellidos = obtenerNombresApellidos();
        const tipoDocumento = toStringAndTrim(datosFrontend.tipoDocumento);
        const numeroDocumento = toStringAndTrim(datosFrontend.numeroDocumento);
        const direccion = toStringAndTrim(datosFrontend.direccion);
        const telefono = toStringAndTrim(datosFrontend.telefono);
        const correo = toStringAndTrim(datosFrontend.email || datosFrontend.correo);
        const pais = toStringAndTrim(datosFrontend.pais || 'Colombia');
        const nombreABuscar = toStringAndTrim(datosFrontend.nombreMarca || datosFrontend.nombreABuscar);
        const tipoProductoServicio = truncarTipoProductoServicio(datosFrontend.tipoProductoServicio || datosFrontend.categoria);
        const logotipoBase64 = await this.convertirArchivoABase64(datosFrontend.logotipoMarca || datosFrontend.logotipo || '');
        
        // ✅ Logging detallado para debugging
        console.log('🔍 [SolicitudesApiService] Campos para Búsqueda de Antecedentes:');
        console.log('  - nombres_apellidos:', nombresApellidos);
        console.log('  - tipo_documento:', tipoDocumento);
        console.log('  - numero_documento:', numeroDocumento);
        console.log('  - direccion:', direccion);
        console.log('  - telefono:', telefono);
        console.log('  - correo:', correo);
        console.log('  - pais:', pais);
        console.log('  - nombre_a_buscar:', nombreABuscar);
        console.log('  - tipo_producto_servicio:', tipoProductoServicio);
        console.log('  - logotipo (tiene valor):', !!logotipoBase64, logotipoBase64 ? `(${logotipoBase64.length} caracteres)` : '');
        
        // ✅ Validar campos requeridos
        const camposFaltantes = [];
        if (!nombresApellidos || nombresApellidos.trim() === '') camposFaltantes.push('nombres_apellidos');
        if (!tipoDocumento) camposFaltantes.push('tipo_documento');
        if (!numeroDocumento) camposFaltantes.push('numero_documento');
        if (!direccion) camposFaltantes.push('direccion');
        if (!telefono) camposFaltantes.push('telefono');
        if (!correo) camposFaltantes.push('correo');
        if (!pais) camposFaltantes.push('pais');
        if (!nombreABuscar) camposFaltantes.push('nombre_a_buscar');
        if (!tipoProductoServicio) camposFaltantes.push('tipo_producto_servicio');
        // logotipo es ahora opcional para Búsqueda de antecedentes
        
        if (camposFaltantes.length > 0) {
          console.error('❌ [SolicitudesApiService] Campos faltantes:', camposFaltantes);
          throw new Error(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`);
        }
        
        // ✅ Mapeo de campos según formato que el backend espera (documentación actualizada)
        // Campos requeridos según "Solicitar documentacion formularios.md":
        // nombres_apellidos, tipo_documento, numero_documento, direccion, telefono, 
        // correo, pais, nombre_a_buscar, tipo_producto_servicio, logotipo
        datosAPI = {
          // Campos requeridos (formato nuevo según documentación)
          nombres_apellidos: nombresApellidos.trim(),
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento,
          direccion: direccion,
          telefono: telefono,
          correo: correo,
          pais: pais,
          nombre_a_buscar: nombreABuscar,
          tipo_producto_servicio: tipoProductoServicio,
          logotipo: logotipoBase64,
          
          // Campos opcionales (si están presentes)
          ...(datosFrontend.ciudad ? { ciudad: toStringAndTrim(datosFrontend.ciudad) } : {}),
          ...(datosFrontend.codigoPostal ? { codigo_postal: toStringAndTrim(datosFrontend.codigoPostal) } : {}),
          ...(obtenerClaseNiza() ? { clase_niza: obtenerClaseNiza() } : {})
        };
        break;
        
      case 'Certificación de marca':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, numero_nit_cedula, nombre_marca, 
        // tipo_producto_servicio, certificado_camara_comercio, logotipo, poder_autorizacion
        // Campos condicionales (si es Jurídica): tipo_entidad, razon_social, nit_empresa, representante_legal, direccion_domicilio
        
        // Función auxiliar para convertir a string y hacer trim
        const toStringAndTrimCert = (value) => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return String(value);
          if (typeof value === 'string') return value.trim();
          return String(value).trim();
        };
        
        const esJuridicaCert = datosFrontend.tipoPersona === 'Jurídica' || datosFrontend.tipoSolicitante === 'Jurídica';
        
        // Convertir archivos a base64 (pueden retornar null si no existen)
        const certificadoCamaraBase64 = await this.convertirArchivoABase64(
          datosFrontend.certificadoCamara || datosFrontend.certificadoCamaraComercio || null
        );
        const logotipoBase64Cert = await this.convertirArchivoABase64(
          datosFrontend.logotipoMarca || datosFrontend.logotipo || null
        );
        // ✅ Para Certificación de Marca:
        // - poderAutorizacion: siempre requerido (poder para el registro de la marca)
        // - poderRepresentante: solo para Jurídica (poder del representante legal)
        // NO confundir: poderAutorizacion NO es poderRepresentante
        const poderAutorizacionBase64 = await this.convertirArchivoABase64(
          datosFrontend.poderAutorizacion || null
        );
        
        // Validar archivos requeridos según tipo de solicitante
        const camposFaltantesCert = [];
        
        // Para Natural: certificado_camara_comercio es opcional (personas naturales no tienen cámara de comercio)
        // Para Jurídica: certificado_camara_comercio es requerido
        if (esJuridicaCert) {
          if (!certificadoCamaraBase64 || (typeof certificadoCamaraBase64 === 'string' && !certificadoCamaraBase64.startsWith('data:'))) {
            camposFaltantesCert.push('certificado_camara_comercio');
          }
        }
        // Si es Natural y no hay certificado, no se incluye (opcional)
        
        // Logotipo siempre requerido
        if (!logotipoBase64Cert || (typeof logotipoBase64Cert === 'string' && !logotipoBase64Cert.startsWith('data:'))) {
          camposFaltantesCert.push('logotipo');
        }
        
        // Poder de autorización siempre requerido
        if (!poderAutorizacionBase64 || (typeof poderAutorizacionBase64 === 'string' && !poderAutorizacionBase64.startsWith('data:'))) {
          camposFaltantesCert.push('poder_autorizacion');
        }
        
        // Validar otros campos requeridos
        if (!obtenerNombresApellidos() || obtenerNombresApellidos().trim() === '') camposFaltantesCert.push('nombres_apellidos');
        if (!datosFrontend.tipoDocumento || toStringAndTrimCert(datosFrontend.tipoDocumento) === '') camposFaltantesCert.push('tipo_documento');
        if (!datosFrontend.numeroDocumento || toStringAndTrimCert(datosFrontend.numeroDocumento) === '') camposFaltantesCert.push('numero_documento');
        if (!datosFrontend.direccion || toStringAndTrimCert(datosFrontend.direccion) === '') camposFaltantesCert.push('direccion');
        if (!datosFrontend.telefono || toStringAndTrimCert(datosFrontend.telefono) === '') camposFaltantesCert.push('telefono');
        if (!datosFrontend.email && !datosFrontend.correo) camposFaltantesCert.push('correo');
        if (!datosFrontend.nombreMarca || datosFrontend.nombreMarca.trim() === '') camposFaltantesCert.push('nombre_marca');
        if (!datosFrontend.tipoProductoServicio && !datosFrontend.categoria) camposFaltantesCert.push('tipo_producto_servicio');
        
        if (camposFaltantesCert.length > 0) {
          console.error('❌ [SolicitudesApiService] Campos faltantes en Certificación de marca:', camposFaltantesCert);
          throw new Error(`Campos requeridos faltantes: ${camposFaltantesCert.join(', ')}`);
        }
        
        // Determinar tipo de solicitante final
        const tipoSolicitanteFinal = datosFrontend.tipoSolicitante === 'Titular' ? 
          (datosFrontend.tipoPersona || 'Natural') : 
          (datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' ? 
            datosFrontend.tipoSolicitante : 
            (datosFrontend.tipoPersona || 'Natural'));
        
        // Construir objeto base con campos siempre requeridos
        datosAPI = {
          // Campos siempre requeridos
          tipo_solicitante: tipoSolicitanteFinal,
          nombres_apellidos: obtenerNombresApellidos().trim(),
          tipo_documento: toStringAndTrimCert(datosFrontend.tipoDocumento),
          numero_documento: toStringAndTrimCert(datosFrontend.numeroDocumento),
          direccion: toStringAndTrimCert(datosFrontend.direccion),
          telefono: toStringAndTrimCert(datosFrontend.telefono),
          correo: (datosFrontend.email || datosFrontend.correo || '').trim(),
          pais: (datosFrontend.pais || 'Colombia').trim(),
          nombre_marca: datosFrontend.nombreMarca.trim(),
          tipo_producto_servicio: truncarTipoProductoServicio(datosFrontend.tipoProductoServicio || datosFrontend.categoria || ''),
          logotipo: logotipoBase64Cert || '',
          poder_autorizacion: poderAutorizacionBase64 || ''
        };
        
        // Para Natural: numero_nit_cedula puede ser opcional o igual a numero_documento
        // Para Jurídica: numero_nit_cedula es requerido y debe ser diferente
        if (esJuridicaCert) {
          // Jurídica: campos adicionales requeridos
          const numeroNitCedula = (datosFrontend.numeroNitCedula || datosFrontend.nitMarca || '').trim();
          if (!numeroNitCedula) {
            camposFaltantesCert.push('numero_nit_cedula');
          }
          datosAPI.numero_nit_cedula = numeroNitCedula;
          datosAPI.certificado_camara_comercio = certificadoCamaraBase64 || '';
          datosAPI.tipo_entidad = (datosFrontend.tipoEntidad || '').trim();
          datosAPI.razon_social = (datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '').trim();
          datosAPI.nit_empresa = datosFrontend.nit ? parseInt(datosFrontend.nit) : null;
          datosAPI.representante_legal = (datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || '').trim();
          datosAPI.direccion_domicilio = (datosFrontend.direccionDomicilio || datosFrontend.direccion || '').trim();
        } else {
          // Natural: numero_nit_cedula puede ser opcional, si no se proporciona usar numero_documento
          datosAPI.numero_nit_cedula = toStringAndTrimCert(datosFrontend.numeroNitCedula || datosFrontend.nitMarca || datosFrontend.numeroDocumento || '');
          // ✅ Para Natural: certificado_camara_comercio NO debe incluirse (personas naturales no tienen cámara de comercio)
          // Asegurar que NO se incluya, incluso si el usuario lo subió
          delete datosAPI.certificado_camara_comercio;
          // NO incluir campos de jurídica (tipo_entidad, razon_social, nit_empresa, representante_legal, direccion_domicilio)
        }
        
        // Validar campos faltantes después de construir el objeto
        if (camposFaltantesCert.length > 0) {
          console.error('❌ [SolicitudesApiService] Campos faltantes en Certificación de marca:', camposFaltantesCert);
          throw new Error(`Campos requeridos faltantes: ${camposFaltantesCert.join(', ')}`);
        }
        
        // Campos opcionales (solo agregar si tienen valor)
        if (datosFrontend.ciudad && datosFrontend.ciudad.trim()) {
          datosAPI.ciudad = datosFrontend.ciudad.trim();
        }
        if (obtenerClaseNiza() && obtenerClaseNiza().trim()) {
          datosAPI.clase_niza = obtenerClaseNiza();
        }
        
        // Limpiar datos: remover campos vacíos que no sean requeridos
        const camposRequeridosCert = [
          'tipo_solicitante', 'nombres_apellidos', 'tipo_documento', 'numero_documento',
          'direccion', 'telefono', 'correo', 'pais', 'numero_nit_cedula', 'nombre_marca',
          'tipo_producto_servicio', 'logotipo', 'poder_autorizacion'
        ];
        
        // Si es Jurídica, agregar campos condicionales a requeridos
        if (esJuridicaCert) {
          camposRequeridosCert.push('certificado_camara_comercio', 'tipo_entidad', 'razon_social', 'nit_empresa', 'representante_legal', 'direccion_domicilio');
        }
        // Si es Natural, certificado_camara_comercio NO está en requeridos (es opcional)
        
        datosAPI = this.limpiarDatosParaEnvio(datosAPI, camposRequeridosCert);
        
        // Log adicional para debugging
        console.log('🔍 [SolicitudesApiService] Tipo solicitante:', tipoSolicitanteFinal);
        console.log('🔍 [SolicitudesApiService] Es Jurídica:', esJuridicaCert);
        console.log('🔍 [SolicitudesApiService] Certificado incluido:', !!datosAPI.certificado_camara_comercio);
        if (datosAPI.certificado_camara_comercio) {
          console.log('🔍 [SolicitudesApiService] Tamaño certificado:', datosAPI.certificado_camara_comercio.length, 'caracteres');
        }
        
        // ✅ Verificar que NO se incluyan campos de jurídica para Natural
        if (!esJuridicaCert) {
          // Remover certificado_camara_comercio si está presente (no debe incluirse para Natural)
          if (datosAPI.certificado_camara_comercio) {
            console.warn('⚠️ [SolicitudesApiService] ADVERTENCIA: certificado_camara_comercio incluido para Natural, removiendo...');
            delete datosAPI.certificado_camara_comercio;
          }
          
          // ✅ CRÍTICO: Remover TODOS los campos relacionados con representante legal para Natural
          // El backend tiene problemas con poderdelrepresentanteautorizado - NO debe enviarse para Natural
          const camposJuridica = [
            'tipo_entidad', 
            'razon_social', 
            'nit_empresa', 
            'representante_legal', 
            'direccion_domicilio',
            'poder_representante',
            'poderRepresentante',
            'poderdelrepresentanteautorizado', // Campo de BD que causa error
            'poder_del_representante_autorizado'
          ];
          
          const camposIncluidos = camposJuridica.filter(campo => datosAPI.hasOwnProperty(campo));
          if (camposIncluidos.length > 0) {
            console.warn('⚠️ [SolicitudesApiService] ADVERTENCIA: Campos de jurídica incluidos para Natural:', camposIncluidos);
            // Remover campos de jurídica para Natural
            camposIncluidos.forEach(campo => delete datosAPI[campo]);
            console.log('✅ [SolicitudesApiService] Campos de jurídica removidos para Natural');
          }
          
          // ✅ Verificar que solo tenemos poder_autorizacion (NO poder_representante)
          if (datosAPI.poder_representante || datosAPI.poderRepresentante) {
            console.warn('⚠️ [SolicitudesApiService] ADVERTENCIA: poder_representante incluido para Natural, removiendo...');
            delete datosAPI.poder_representante;
            delete datosAPI.poderRepresentante;
            console.log('✅ [SolicitudesApiService] poder_representante removido - solo se usa poder_autorizacion para Natural');
          }
          
          // ✅ Log final para verificar que solo tenemos los campos correctos
          console.log('🔍 [SolicitudesApiService] Campos finales para Natural:', Object.keys(datosAPI));
          console.log('🔍 [SolicitudesApiService] Verificando que NO hay campos de representante:', 
            !datosAPI.poder_representante && !datosAPI.poderRepresentante && !datosAPI.representante_legal);
        }
        
        break;

      case 'Renovación de marca':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, nombre_marca, numero_expediente_marca, 
        // poder_autorizacion, certificado_renovacion, logotipo
        // Campos condicionales (si es Jurídica): tipo_entidad, razon_social, nit_empresa, representante_legal
        // ✅ Simplificado: tipo_solicitante debe ser directamente "Natural" o "Jurídica"
        const esJuridicaRen = datosFrontend.tipoSolicitante === 'Jurídica';
        const tipoSolicitanteFinalRen = datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' 
          ? datosFrontend.tipoSolicitante 
          : 'Natural'; // Default a Natural si no se especifica
        
        datosAPI = {
          // Campos requeridos
          tipo_solicitante: tipoSolicitanteFinalRen,
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          nombre_marca: datosFrontend.nombreMarca || '',
          numero_expediente_marca: datosFrontend.numeroExpedienteMarca || datosFrontend.expediente || '',
          certificado_renovacion: await this.convertirArchivoABase64(datosFrontend.certificadoRenovacion || ''),
          logotipo: await this.convertirArchivoABase64(datosFrontend.logotipoMarca || datosFrontend.logotipo || ''),
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || ''),
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {}),
          ...(obtenerClaseNiza() ? { clase_niza: obtenerClaseNiza() } : {})
        };
        
        // ✅ Para Jurídica: agregar campos de empresa
        if (esJuridicaRen) {
          datosAPI.tipo_entidad = datosFrontend.tipoEntidad || '';
          datosAPI.razon_social = datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '';
          datosAPI.nit_empresa = datosFrontend.nit ? parseInt(datosFrontend.nit) : null;
          datosAPI.representante_legal = datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || '';
        } else {
          // ✅ Para Natural: NO incluir campos de jurídica (el backend ya valida condicionalmente)
          // Asegurar que NO se incluyan campos de jurídica
          delete datosAPI.tipo_entidad;
          delete datosAPI.razon_social;
          delete datosAPI.nit_empresa;
          delete datosAPI.representante_legal;
          delete datosAPI.poder_representante;
          delete datosAPI.poderRepresentante;
          delete datosAPI.poderdelrepresentanteautorizado;
        }
        
        break;

      case 'Cesión de marca':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, nombre_marca, numero_expediente_marca, 
        // documento_cesion, poder_autorizacion, nombre_razon_social_cesionario, nit_cesionario, 
        // representante_legal_cesionario, tipo_documento_cesionario, numero_documento_cesionario, 
        // correo_cesionario, telefono_cesionario, direccion_cesionario
        // ✅ Simplificado: tipo_solicitante debe ser directamente "Natural" o "Jurídica"
        const esJuridicaCes = datosFrontend.tipoSolicitante === 'Jurídica';
        const tipoSolicitanteFinalCes = datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' 
          ? datosFrontend.tipoSolicitante 
          : 'Natural'; // Default a Natural si no se especifica
        
        datosAPI = {
          // Campos requeridos del cedente
          tipo_solicitante: tipoSolicitanteFinalCes,
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          nombre_marca: datosFrontend.nombreMarca || '',
          numero_expediente_marca: datosFrontend.numeroExpedienteMarca || datosFrontend.expediente || '',
          documento_cesion: await this.convertirArchivoABase64(datosFrontend.documentoCesion || ''),
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || ''),
          // Campos requeridos del cesionario
          nombre_razon_social_cesionario: datosFrontend.nombreRazonSocialCesionario || datosFrontend.nombreCesionario || '',
          nit_cesionario: datosFrontend.nitCesionario || '',
          representante_legal_cesionario: datosFrontend.representanteLegalCesionario || '',
          tipo_documento_cesionario: datosFrontend.tipoDocumentoCesionario || '',
          numero_documento_cesionario: datosFrontend.numeroDocumentoCesionario || '',
          correo_cesionario: datosFrontend.correoCesionario || '',
          telefono_cesionario: datosFrontend.telefonoCesionario || '',
          direccion_cesionario: datosFrontend.direccionCesionario || '',
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {})
        };
        
        // ✅ Para Jurídica: agregar campos de empresa del cedente (si aplica)
        if (esJuridicaCes) {
          // Para Cesión, el cedente puede ser jurídica pero no necesariamente requiere campos adicionales
          // según la documentación, pero si el formulario los incluye, los agregamos
          if (datosFrontend.tipoEntidad) datosAPI.tipo_entidad = datosFrontend.tipoEntidad;
          if (datosFrontend.razonSocial || datosFrontend.nombreEmpresa) {
            datosAPI.razon_social = datosFrontend.razonSocial || datosFrontend.nombreEmpresa;
          }
          if (datosFrontend.nit) datosAPI.nit_empresa = parseInt(datosFrontend.nit);
          if (datosFrontend.representanteLegal || datosFrontend.nombreRepresentante) {
            datosAPI.representante_legal = datosFrontend.representanteLegal || datosFrontend.nombreRepresentante;
          }
        } else {
          // ✅ Para Natural: asegurar que NO se incluyan campos de jurídica
          delete datosAPI.tipo_entidad;
          delete datosAPI.razon_social;
          delete datosAPI.nit_empresa;
          delete datosAPI.representante_legal;
          delete datosAPI.poder_representante;
          delete datosAPI.poderRepresentante;
          delete datosAPI.poderdelrepresentanteautorizado;
        }
        
        break;

      case 'Presentación de oposición':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, nit_empresa (SIEMPRE requerido), nombre_marca, 
        // marca_a_oponerse, poder_autorizacion, argumentos_respuesta, documentos_oposicion
        // Campos condicionales (si es Jurídica): tipo_entidad, razon_social, representante_legal
        // ✅ Simplificado: tipo_solicitante debe ser directamente "Natural" o "Jurídica"
        const esJuridicaOpo = datosFrontend.tipoSolicitante === 'Jurídica';
        const tipoSolicitanteFinalOpo = datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' 
          ? datosFrontend.tipoSolicitante 
          : 'Natural'; // Default a Natural si no se especifica
        
        datosAPI = {
          // Campos requeridos
          tipo_solicitante: tipoSolicitanteFinalOpo,
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          nit_empresa: datosFrontend.nit ? parseInt(datosFrontend.nit) : null, // ✅ SIEMPRE requerido
          nombre_marca: datosFrontend.nombreMarca || '',
          marca_a_oponerse: datosFrontend.marcaAOponerse || '',
          argumentos_respuesta: datosFrontend.argumentosRespuesta || '',
          documentos_oposicion: await this.convertirArchivoABase64(datosFrontend.documentosOposicion || ''),
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || ''),
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {})
        };
        
        // ✅ Para Jurídica: agregar campos de empresa
        if (esJuridicaOpo) {
          datosAPI.tipo_entidad = datosFrontend.tipoEntidad || '';
          datosAPI.razon_social = datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '';
          datosAPI.representante_legal = datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || '';
        } else {
          // ✅ Para Natural: asegurar que NO se incluyan campos de jurídica
          delete datosAPI.tipo_entidad;
          delete datosAPI.razon_social;
          delete datosAPI.representante_legal;
          delete datosAPI.poder_representante;
          delete datosAPI.poderRepresentante;
          delete datosAPI.poderdelrepresentanteautorizado;
          // NOTA: nit_empresa se mantiene porque es SIEMPRE requerido para Oposición
        }
        
        break;

      case 'Respuesta a oposición':
        // ✅ Campos requeridos según documentación: nombres_apellidos, tipo_documento, numero_documento, 
        // direccion, telefono, correo, pais, nit_empresa, nombre_marca, numero_expediente_marca, 
        // marca_opositora, poder_autorizacion, razon_social, representante_legal
        datosAPI = {
          // Campos requeridos
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          razon_social: datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '',
          nit_empresa: datosFrontend.nit ? parseInt(datosFrontend.nit) : null,
          representante_legal: datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || '',
          nombre_marca: datosFrontend.nombreMarca || '',
          numero_expediente_marca: datosFrontend.numeroExpedienteMarca || datosFrontend.expediente || '',
          marca_opositora: datosFrontend.marcaOpositora || '',
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || datosFrontend.poderRepresentante || ''),
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {})
        };
        break;

      case 'Ampliación de alcance':
        // ✅ Campos requeridos según documentación: documento_nit_titular, direccion, ciudad, pais, 
        // correo, telefono, numero_registro_existente, nombre_marca, clase_niza_actual, 
        // nuevas_clases_niza, descripcion_nuevos_productos_servicios, soportes
        datosAPI = {
          // Campos requeridos
          documento_nit_titular: datosFrontend.documentoNitTitular || datosFrontend.numeroNitCedula || datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          ciudad: datosFrontend.ciudad || 'Bogotá',
          pais: datosFrontend.pais || 'Colombia',
          correo: datosFrontend.email || datosFrontend.correo || '',
          telefono: datosFrontend.telefono || '',
          numero_registro_existente: datosFrontend.numeroRegistroExistente || datosFrontend.expediente || '',
          nombre_marca: datosFrontend.nombreMarca || '',
          clase_niza_actual: datosFrontend.claseNizaActual || datosFrontend.clases?.[0]?.numero || '',
          nuevas_clases_niza: datosFrontend.nuevasClasesNiza || 
            (datosFrontend.clases && datosFrontend.clases.length > 1 ? 
              datosFrontend.clases.slice(1).map(c => c.numero).filter(n => n).join(', ') : ''),
          descripcion_nuevos_productos_servicios: datosFrontend.descripcionNuevosProductosServicios || datosFrontend.descripcionAdicional || '',
          soportes: await this.convertirArchivoABase64(datosFrontend.soportes || '')
        };
        break;
        
      default:
        datosAPI = {
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          telefono: datosFrontend.telefono || '',
          direccion: datosFrontend.direccion || '',
          pais: datosFrontend.pais || 'Colombia',
          ciudad: datosFrontend.ciudad || 'Bogotá',
          nombre_marca: datosFrontend.nombreMarca || '',
          descripcion_adicional: datosFrontend.descripcionAdicional || ''
        };
    }
    
    // 🔥 NUEVO: Lógica de id_cliente según rol (Enero 2026)
    // Clientes: NO enviar id_cliente (se toma del token)
    // Admin/Empleado: DEBE enviar id_cliente (obligatorio)
    
    // Normalizar userRole (puede ser string o objeto)
    let rolNormalizado = '';
    if (typeof userRole === 'string') {
      rolNormalizado = userRole.toLowerCase();
    } else if (userRole && typeof userRole === 'object') {
      // Si es objeto, extraer el nombre del rol
      rolNormalizado = (userRole.nombre || userRole.name || userRole.rol || '').toLowerCase();
    }
    
    console.log('🔧 [SolicitudesApiService] Rol normalizado:', rolNormalizado);
    console.log('🔧 [SolicitudesApiService] id_cliente en datosFrontend:', datosFrontend.id_cliente);
    
    if (rolNormalizado === 'cliente') {
      // Cliente: NO incluir id_cliente (se toma automáticamente del token)
      if (datosFrontend.id_cliente) {
        console.warn('⚠️ [SolicitudesApiService] Cliente no debe enviar id_cliente, se removerá del body');
        delete datosAPI.id_cliente;
      }
      // Asegurar que no esté en datosAPI
      delete datosAPI.id_cliente;
    } else if (rolNormalizado === 'administrador' || rolNormalizado === 'empleado' || 
               (userRole && typeof userRole === 'object' && (userRole.id === '2' || userRole.id === 2 || userRole.id === '3' || userRole.id === 3))) {
      // Admin/Empleado: Validar que id_cliente esté presente (obligatorio)
      if (!datosFrontend.id_cliente) {
        throw new Error('El campo id_cliente es obligatorio para administradores y empleados');
      }
      // Asegurar que id_cliente sea un número
      datosAPI.id_cliente = typeof datosFrontend.id_cliente === 'number' 
        ? datosFrontend.id_cliente 
        : parseInt(datosFrontend.id_cliente);
      console.log('✅ [SolicitudesApiService] Admin/Empleado - id_cliente incluido:', datosAPI.id_cliente);
    } else {
      // Si no se especifica rol, asumir cliente (no enviar id_cliente)
      delete datosAPI.id_cliente;
      console.warn('⚠️ [SolicitudesApiService] Rol no especificado o no reconocido, asumiendo cliente (no se envía id_cliente)');
      console.warn('⚠️ [SolicitudesApiService] userRole recibido:', userRole);
    }
    
    // Los datos ya fueron limpiados en cada caso del switch
    // Solo asegurar que no haya valores null que puedan causar problemas
    const datosFinales = {};
    for (const [key, value] of Object.entries(datosAPI)) {
      // Convertir null a string vacío para campos que el backend espera como strings
      if (value === null) {
        datosFinales[key] = '';
      } else {
        datosFinales[key] = value;
      }
    }
    
    console.log('✅ [SolicitudesApiService] Datos transformados para API:');
    console.log('  - Total de campos:', Object.keys(datosFinales).length);
    console.log('  - Campos:', Object.keys(datosFinales));
    console.log('  - Tamaño del payload (aproximado):', JSON.stringify(datosFinales).length, 'caracteres');
    
    // Log detallado de archivos (sin mostrar el contenido completo)
    const archivosInfo = {};
    for (const [key, value] of Object.entries(datosFinales)) {
      if (typeof value === 'string' && value.startsWith('data:')) {
        archivosInfo[key] = `[Base64 - ${value.length} caracteres]`;
      } else {
        archivosInfo[key] = value;
      }
    }
    console.log('  - Datos (archivos resumidos):', archivosInfo);
    
    return { servicioAPI, datosAPI: datosFinales };
  }

  // Función para mapear estados de la API al frontend
  mapearEstadoAPIaFrontend(estadoAPI) {
    // ✅ IMPORTANTE: El backend usa estados dinámicos del process_state (no ENUMs genéricos)
    // Ejemplos: "Solicitud Inicial", "Verificación de Documentos", "Aprobación Final"
    // Solo mapear estados especiales que el backend pueda usar para solicitudes terminales:
    const mapeoEstados = {
      'Anulada': 'Anulada',           // Estado especial cuando se anula
      'Anulado': 'Anulado',           // ✅ NUEVO: Backend usa "Anulado" (masculino)
      'Rechazada': 'Rechazada',       // Estado especial cuando se rechaza
      'Rechazado': 'Rechazado',       // ✅ NUEVO: Backend puede usar "Rechazado" (masculino)
      'Finalizada': 'Finalizada',     // Estado especial cuando se completa
      'Finalizado': 'Finalizado',     // ✅ NUEVO: Backend puede usar "Finalizado" (masculino)
      'Aprobada': 'Finalizada',       // Por si el backend usa "Aprobada" en vez de "Finalizada"
      'Aprobado': 'Finalizado'        // Por si el backend usa "Aprobado" en vez de "Finalizado"
    };
    
    const estadoMapeado = mapeoEstados[estadoAPI];
    if (estadoMapeado) {
      return estadoMapeado;
    }
    
    // ✅ CORRECTO: Mantener los estados dinámicos del process_state tal cual vienen
    // Ejemplos del backend: "Solicitud Inicial", "Verificación de Documentos", 
    // "Procesamiento de Pago", "Consulta en BD", "Generación de Certificado", "Entrega Final"
    return estadoAPI || 'Sin Estado';
  }

  // Función para transformar respuesta de la API al formato del frontend
  transformarRespuestaDelAPI(respuestaAPI) {
    // ✅ Log de debugging deshabilitado - Backend confirmado con 36 campos (28 Oct 2025)
    // if (!this._loggedOnce) {
    //   console.log('🔍 [SolicitudesApiService] DATOS RAW del backend (sin transformar):', respuestaAPI);
    //   console.log('🔍 [SolicitudesApiService] Campos disponibles:', Object.keys(respuestaAPI));
    //   this._loggedOnce = true;
    // }
    
    // ✅ MEJORADO: Extraer titular de múltiples fuentes posibles
    const titular = respuestaAPI.nombre_solicitante || 
                    respuestaAPI.nombre_completo_titular || 
                    respuestaAPI.nombres_apellidos ||
                    respuestaAPI.titular || 
                    respuestaAPI.cliente?.nombre ||
                    'Sin titular';
    
    // ✅ MEJORADO: Extraer marca de múltiples fuentes posibles
    const marca = respuestaAPI.marca_a_buscar || 
                  respuestaAPI.nombre_marca || 
                  respuestaAPI.marca || 
                  respuestaAPI.nombre_a_buscar ||
                  'Sin marca';
    
    // ✅ MEJORADO: Extraer servicio de múltiples fuentes (puede ser objeto o string)
    const tipoSolicitud = respuestaAPI.servicio?.nombre || 
                          respuestaAPI.servicio || 
                          respuestaAPI.tipoSolicitud || 
                          'Sin servicio';
    
    // ✅ MEJORADO: Extraer encargado de múltiples fuentes (puede ser objeto)
    const encargado = respuestaAPI.empleado_asignado?.nombre ||
                      respuestaAPI.empleado_asignado?.nombres ||
                      (respuestaAPI.empleado_asignado ? 
                        `${respuestaAPI.empleado_asignado.nombres || ''} ${respuestaAPI.empleado_asignado.apellidos || ''}`.trim() : 
                        null) ||
                      respuestaAPI.empleado?.nombre ||
                      respuestaAPI.encargado || 
                      'Sin asignar';
    
    // ✅ MEJORADO: Extraer email de múltiples fuentes
    const email = respuestaAPI.correo_electronico || 
                  respuestaAPI.correo_titular || 
                  respuestaAPI.correo ||
                  respuestaAPI.email || 
                  respuestaAPI.cliente?.correo ||
                  '';
    
    // ✅ MEJORADO: Extraer teléfono de múltiples fuentes
    const telefono = respuestaAPI.telefono || 
                     respuestaAPI.telefono_titular || 
                     respuestaAPI.cliente?.telefono ||
                     '';
    
    // ✅ MEJORADO: Extraer fechas con múltiples formatos
    const fechaCreacion = respuestaAPI.fecha_solicitud || 
                          respuestaAPI.createdAt ||
                          respuestaAPI.created_at ||
                          respuestaAPI.fechaCreacion || 
                          new Date().toISOString();
    
    // fechaSolicitud se usa para mostrar "Última actualización" en ProcesosActivos
    const fechaSolicitud = respuestaAPI.fecha_solicitud || 
                           respuestaAPI.updatedAt ||
                           respuestaAPI.updated_at ||
                           respuestaAPI.fechaSolicitud ||
                           fechaCreacion;
    
    // Determinar si el proceso está finalizado o anulado para usar fechaSolicitud como fechaFin
    const estadoAPI = respuestaAPI.estado || '';
    const esAnulado = estadoAPI === 'Anulado' || 
                     estadoAPI === 'Anulada' ||
                     (estadoAPI && estadoAPI.toLowerCase().includes('anulado'));
    const esFinalizado = estadoAPI === 'Finalizado' || 
                        estadoAPI === 'Finalizada' ||
                        (estadoAPI && estadoAPI.toLowerCase().includes('finalizado'));
    const esFinalizadoOAnulado = esAnulado || esFinalizado;
    
    // ✅ Log para debugging - ver qué campos tiene el backend
    if (esAnulado || esFinalizado) {
      const camposMotivo = Object.keys(respuestaAPI).filter(k => 
        k.toLowerCase().includes('motivo') || 
        k.toLowerCase().includes('observ') ||
        k.toLowerCase().includes('anul')
      );
      
      console.log(`🔍 [transformarRespuestaDelAPI] Proceso ${respuestaAPI.id} (${estadoAPI}) - Campos disponibles:`, {
        fecha_anulacion: respuestaAPI.fecha_anulacion,
        fecha_finalizacion: respuestaAPI.fecha_finalizacion,
        fecha_fin: respuestaAPI.fecha_fin,
        updatedAt: respuestaAPI.updatedAt,
        updated_at: respuestaAPI.updated_at,
        motivo_anulacion: respuestaAPI.motivo_anulacion,
        motivoAnulacion: respuestaAPI.motivoAnulacion,
        motivo: respuestaAPI.motivo,
        observaciones: respuestaAPI.observaciones,
        camposMotivo: camposMotivo,
        valoresMotivo: camposMotivo.reduce((acc, key) => {
          acc[key] = respuestaAPI[key];
          return acc;
        }, {}),
        todosLosCampos: Object.keys(respuestaAPI).filter(k => 
          k.toLowerCase().includes('fecha') || 
          k.toLowerCase().includes('motivo') ||
          k.toLowerCase().includes('anul') ||
          k.toLowerCase().includes('observ')
        )
      });
    }
    
    // fechaFin: Priorizar fecha_anulacion para procesos anulados, luego fecha_finalizacion
    let fechaFin = null;
    
    if (esAnulado) {
      // Para procesos anulados, priorizar fecha_anulacion
      fechaFin = respuestaAPI.fecha_anulacion ||
                 respuestaAPI.fecha_finalizacion ||
                 respuestaAPI.fecha_fin ||
                 respuestaAPI.fechaFin ||
                 null;
    } else if (esFinalizado) {
      // Para procesos finalizados, usar fecha_finalizacion
      fechaFin = respuestaAPI.fecha_finalizacion ||
                 respuestaAPI.fecha_fin ||
                 respuestaAPI.fechaFin ||
                 null;
    }
    
    // Si no hay fecha de finalización específica pero el proceso está finalizado/anulado,
    // usar la fecha de última actualización (updatedAt) como fecha de fin
    if ((!fechaFin || fechaFin === null) && esFinalizadoOAnulado) {
      fechaFin = respuestaAPI.updatedAt || 
                 respuestaAPI.updated_at || 
                 fechaSolicitud; // Usar última actualización como fecha de fin
      console.log(`ℹ️ [transformarRespuestaDelAPI] Proceso ${respuestaAPI.id} - Usando fecha de última actualización como fechaFin:`, fechaFin);
    }
    
    // ✅ Extraer motivo de anulación si existe (con múltiples variantes)
    // IMPORTANTE: El backend debe incluir motivo_anulacion en la respuesta
    let motivoAnulacion = respuestaAPI.motivo_anulacion ||
                         respuestaAPI.motivoAnulacion ||
                         respuestaAPI.motivo ||
                         respuestaAPI.motivo_anulacion_solicitud ||
                         respuestaAPI.observaciones ||
                         null;
    
    // Si no está en los campos directos, buscar en comentarios/seguimientos
    if (esAnulado && !motivoAnulacion && respuestaAPI.comentarios && Array.isArray(respuestaAPI.comentarios)) {
      // Buscar en comentarios si hay alguno relacionado con anulación
      const comentarioAnulacion = respuestaAPI.comentarios.find(c => 
        c && (
          (typeof c === 'string' && c.toLowerCase().includes('anul')) ||
          (typeof c === 'object' && c.texto && c.texto.toLowerCase().includes('anul')) ||
          (typeof c === 'object' && c.descripcion && c.descripcion.toLowerCase().includes('anul'))
        )
      );
      if (comentarioAnulacion) {
        motivoAnulacion = typeof comentarioAnulacion === 'string' 
          ? comentarioAnulacion 
          : (comentarioAnulacion.texto || comentarioAnulacion.descripcion || comentarioAnulacion.motivo);
        console.log(`ℹ️ [transformarRespuestaDelAPI] Proceso ${respuestaAPI.id} - Motivo encontrado en comentarios:`, motivoAnulacion);
      }
    }
    
    if (esAnulado && motivoAnulacion) {
      console.log(`✅ [transformarRespuestaDelAPI] Proceso ${respuestaAPI.id} - Motivo de anulación encontrado:`, motivoAnulacion);
      console.log(`✅ [transformarRespuestaDelAPI] Proceso ${respuestaAPI.id} - Fecha de anulación:`, respuestaAPI.fecha_anulacion || 'No disponible');
      console.log(`✅ [transformarRespuestaDelAPI] Proceso ${respuestaAPI.id} - Anulado por (ID):`, respuestaAPI.anulado_por || 'No disponible');
    } else if (esAnulado && !motivoAnulacion) {
      console.warn(`⚠️ [transformarRespuestaDelAPI] ⚠️⚠️⚠️ Proceso ${respuestaAPI.id} - Proceso anulado pero SIN motivo en la respuesta del backend.`);
      console.warn(`⚠️ [transformarRespuestaDelAPI] Verificando campos disponibles...`);
      console.warn(`⚠️ [transformarRespuestaDelAPI] motivo_anulacion:`, respuestaAPI.motivo_anulacion);
      console.warn(`⚠️ [transformarRespuestaDelAPI] fecha_anulacion:`, respuestaAPI.fecha_anulacion);
      console.warn(`⚠️ [transformarRespuestaDelAPI] anulado_por:`, respuestaAPI.anulado_por);
      console.warn(`⚠️ [transformarRespuestaDelAPI] Campos relacionados disponibles:`, 
        Object.keys(respuestaAPI).filter(k => 
          k.toLowerCase().includes('motivo') || 
          k.toLowerCase().includes('observ') ||
          k.toLowerCase().includes('anul') ||
          k.toLowerCase().includes('coment')
        )
      );
    }
    
    const respuestaFrontend = {
      id: respuestaAPI.id?.toString() || respuestaAPI.id_orden_servicio?.toString(),
      expediente: respuestaAPI.expediente || `EXP-${respuestaAPI.id || respuestaAPI.id_orden_servicio}`,
      titular,
      marca,
      tipoSolicitud,
      encargado,
      estado: this.mapearEstadoAPIaFrontend(respuestaAPI.estado),
      email,
      telefono,
      comentarios: respuestaAPI.comentarios || [],
      fechaCreacion,
      fechaSolicitud, // Para mostrar "Última actualización"
      fechaFin, // Fecha de finalización (o última actualización si está finalizado/anulado)
      motivoAnulacion, // Para mostrar motivo en historial
      // ✅ Campos adicionales de fecha (para fallback en obtenerFechaFin)
      fecha_anulacion: respuestaAPI.fecha_anulacion || null, // Fecha específica de anulación del backend
      anulado_por: respuestaAPI.anulado_por || null, // ID del usuario que anuló
      updatedAt: respuestaAPI.updatedAt || respuestaAPI.updated_at || null,
      updated_at: respuestaAPI.updated_at || respuestaAPI.updatedAt || null,
      
      // ✅ Campos para la tabla (con múltiples fuentes)
      pais: respuestaAPI.pais || respuestaAPI.pais_titular || '',
      ciudad: respuestaAPI.ciudad || respuestaAPI.ciudad_titular || '',
      direccion: respuestaAPI.direccion || respuestaAPI.direccion_titular || '',
      tipoDocumento: respuestaAPI.tipo_documento || 
                     respuestaAPI.tipodedocumento || 
                     respuestaAPI.tipoDocumento ||
                     respuestaAPI.cliente?.tipo_documento ||
                     respuestaAPI.cliente?.tipoDocumento ||
                     '',
      numeroDocumento: respuestaAPI.numero_documento || 
                       respuestaAPI.numerodedocumento || 
                       respuestaAPI.numeroDocumento ||
                       respuestaAPI.documento ||
                       respuestaAPI.cliente?.numero_documento ||
                       respuestaAPI.cliente?.numeroDocumento ||
                       respuestaAPI.cliente?.documento ||
                       '',
      documento: respuestaAPI.numero_documento || 
                 respuestaAPI.numerodedocumento || 
                 respuestaAPI.numeroDocumento ||
                 respuestaAPI.documento ||
                 respuestaAPI.cliente?.numero_documento ||
                 respuestaAPI.cliente?.numeroDocumento ||
                 respuestaAPI.cliente?.documento ||
                 '',
      tipoPersona: respuestaAPI.tipo_persona || respuestaAPI.tipodepersona || '',
      
      // ✅ Campos adicionales para la tabla y ver detalle
      nombreCompleto: titular,
      nombreMarca: marca,
      categoria: respuestaAPI.clase_niza || respuestaAPI.categoria || '',
      tipoSolicitante: respuestaAPI.tipo_solicitante || '',
      tipoEntidad: respuestaAPI.tipo_entidad || respuestaAPI.tipodeentidadrazonsocial || '',
      razonSocial: respuestaAPI.razon_social || respuestaAPI.nombre_razon_social || '',
      nombreEmpresa: respuestaAPI.nombre_empresa || respuestaAPI.nombredelaempresa || '',
      nit: respuestaAPI.nit || respuestaAPI.nit_empresa || respuestaAPI.documento_nit || '',
      
      // IDs para relaciones
      id_cliente: respuestaAPI.id_cliente,
      id_empresa: respuestaAPI.id_empresa,
      id_empleado_asignado: respuestaAPI.id_empleado_asignado,
      
      // ✅ Información completa del servicio si está disponible
      servicioCompleto: respuestaAPI.servicio || null,
      
      // ✅ Información completa del empleado si está disponible
      empleadoCompleto: respuestaAPI.empleado_asignado || respuestaAPI.empleado || null,
      
      // ✅ Información completa del cliente si está disponible
      clienteCompleto: respuestaAPI.cliente || null
    };
    
    // console.log('✅ [SolicitudesApiService] Respuesta transformada para frontend:', respuestaFrontend);
    // console.log('🔍 [SolicitudesApiService] Campos extraídos:');
    // console.log('   - Titular:', titular);
    // console.log('   - Marca:', marca);
    // console.log('   - Servicio:', tipoSolicitud);
    // console.log('   - Encargado:', encargado);
    // console.log('   - Estado:', respuestaFrontend.estado);
    
    return respuestaFrontend;
  }
}

// Crear instancia única del servicio
const solicitudesApiService = new SolicitudesApiService();

export default solicitudesApiService;
