// Servicio para conectar pagos con la API real
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class PagosApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    console.log('🔧 [PagosApiService] Base URL configurada:', this.baseURL);
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
      console.log('📤 [PagosApiService] Request body:', config.body);
    }

    try {
      console.log('🌐 [PagosApiService] URL completa:', url);
      console.log('🌐 [PagosApiService] Method:', config.method);
      const response = await fetch(url, config);
      console.log('📡 [PagosApiService] Response status:', response.status);
      
      if (!response.ok) {
        let errorData = {};
        let errorText = '';
        try {
          const text = await response.clone().text();
          errorText = text;
          console.error('❌ [PagosApiService] Error response text:', text);
          try {
            errorData = JSON.parse(text);
            console.error('❌ [PagosApiService] Error data parsed:', errorData);
          } catch (parseError) {
            errorText = text;
            console.error('❌ [PagosApiService] No se pudo parsear error como JSON:', parseError);
          }
        } catch (e) {
          console.error('❌ [PagosApiService] No se pudo obtener error response:', e);
          errorText = `Error ${response.status}: ${response.statusText}`;
        }
        
        // Extraer mensaje de error según formato del backend
        let errorMessage = errorData.mensaje || 
                           errorData.message || 
                           errorData.error?.message ||
                           errorData.error ||
                           errorText || 
                           `Error ${response.status}: ${response.statusText}`;
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      // Para respuestas que no son JSON (archivos, etc.)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ [PagosApiService] Response data:', data);
        return data;
      } else {
        // Devolver la respuesta para manejar archivos
        return response;
      }
    } catch (error) {
      console.error('❌ [PagosApiService] Error en makeRequest:', error);
      throw error;
    }
  }

  // GET /api/gestion-pagos - Obtener todos los pagos
  async getTodosLosPagos(token) {
    try {
      console.log('🔧 [PagosApiService] Obteniendo todos los pagos...');
      const response = await this.makeRequest(apiConfig.ENDPOINTS.PAYMENTS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // El backend puede devolver { success: true, data: [...] } o directamente un array
      if (response.success && response.data) {
        console.log('✅ [PagosApiService] Pagos obtenidos:', response.data.length);
        return response.data;
      } else if (Array.isArray(response)) {
        console.log('✅ [PagosApiService] Pagos obtenidos (array directo):', response.length);
        return response;
      } else {
        console.warn('⚠️ [PagosApiService] Formato de respuesta inesperado:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ [PagosApiService] Error obteniendo pagos:', error);
      throw error;
    }
  }

  // GET /api/gestion-pagos/:id - Obtener pago por ID
  async getPagoPorId(id, token) {
    try {
      console.log(`🔧 [PagosApiService] Obteniendo pago ${id}...`);
      const response = await this.makeRequest(apiConfig.ENDPOINTS.PAYMENT_BY_ID(id), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success && response.data) {
        console.log('✅ [PagosApiService] Pago obtenido:', response.data);
        return response.data;
      } else if (response.id_pago || response.id) {
        console.log('✅ [PagosApiService] Pago obtenido (formato directo):', response);
        return response;
      } else {
        console.warn('⚠️ [PagosApiService] Formato de respuesta inesperado:', response);
        return null;
      }
    } catch (error) {
      console.error('❌ [PagosApiService] Error obteniendo pago:', error);
      throw error;
    }
  }

  // POST /api/gestion-pagos/process-mock - Procesar pago mock
  async procesarPagoMock(datos, token) {
    try {
      console.log('🔧 [PagosApiService] Procesando pago mock...', datos);
      const response = await this.makeRequest(apiConfig.ENDPOINTS.PAYMENT_PROCESS_MOCK, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: datos
      });
      
      if (response.success && response.data) {
        console.log('✅ [PagosApiService] Pago procesado:', response.data);
        return response.data;
      } else {
        console.warn('⚠️ [PagosApiService] Formato de respuesta inesperado:', response);
        return response;
      }
    } catch (error) {
      console.error('❌ [PagosApiService] Error procesando pago:', error);
      throw error;
    }
  }

  // GET /api/gestion-pagos/:id/comprobante/download - Descargar comprobante PDF
  async descargarComprobante(id, token) {
    try {
      console.log(`🔧 [PagosApiService] Descargando comprobante del pago ${id}...`);
      // Intentar primero con /comprobante (sin /download) ya que /download parece devolver JSON
      const url = `${this.baseURL}${apiConfig.ENDPOINTS.PAYMENT_COMPROBANTE(id)}`;
      console.log(`🔗 [PagosApiService] URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`📡 [PagosApiService] Response status: ${response.status}`);
      console.log(`📡 [PagosApiService] Response headers:`, {
        'content-type': response.headers.get('content-type'),
        'content-disposition': response.headers.get('content-disposition'),
        'content-length': response.headers.get('content-length')
      });
      
      // Verificar el Content-Type antes de procesar
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const isPdf = contentType.includes('application/pdf') || contentType.includes('application/octet-stream');
      
      // Si la respuesta es JSON, podría ser un error o información del comprobante
      if (isJson) {
        const jsonData = await response.json();
        console.warn('⚠️ [PagosApiService] Respuesta es JSON, no PDF:', jsonData);
        
        // Verificar si tiene comprobante_url en la respuesta
        const comprobanteUrl = jsonData.data?.comprobante_url || jsonData.comprobante_url;
        if (comprobanteUrl) {
          console.log('🔗 [PagosApiService] Comprobante URL encontrada, descargando desde:', comprobanteUrl);
          // Descargar desde la URL proporcionada
          const pdfResponse = await fetch(comprobanteUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!pdfResponse.ok) {
            throw new Error(`Error al descargar el comprobante desde la URL: ${pdfResponse.statusText}`);
          }
          
          const pdfBlob = await pdfResponse.blob();
          const filename = `comprobante_pago_${id}.pdf`;
          return { blob: pdfBlob, filename };
        }
        
        // Verificar si es un error
        if (!response.ok || jsonData.error || (jsonData.mensaje && !jsonData.success)) {
          const errorMessage = jsonData.mensaje || jsonData.message || jsonData.error?.message || jsonData.error || `Error ${response.status}: ${response.statusText}`;
          const error = new Error(errorMessage);
          error.status = response.status;
          throw error;
        }
        
        // Si es success: true pero no tiene URL, intentar con el endpoint /download
        if (jsonData.success && !comprobanteUrl) {
          console.log('🔄 [PagosApiService] Intentando con endpoint /download...');
          const downloadUrl = `${this.baseURL}${apiConfig.ENDPOINTS.PAYMENT_COMPROBANTE_DOWNLOAD(id)}`;
          const downloadResponse = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const downloadContentType = downloadResponse.headers.get('content-type') || '';
          if (downloadContentType.includes('application/pdf')) {
            const downloadBlob = await downloadResponse.blob();
            const filename = `comprobante_pago_${id}.pdf`;
            return { blob: downloadBlob, filename };
          }
        }
        
        // Si no es un error conocido pero es JSON, algo está mal
        throw new Error('El servidor devolvió JSON en lugar de un PDF. Por favor, contacta al administrador.');
      }
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          // Intentar leer como texto primero
          const text = await response.clone().text();
          console.error('❌ [PagosApiService] Error response text:', text);
          
          // Intentar parsear como JSON
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.mensaje || errorData.message || errorData.error?.message || errorMessage;
          } catch (e) {
            // Si no es JSON, usar el texto tal cual si no está vacío
            if (text && text.trim()) {
              errorMessage = text;
            }
          }
        } catch (e) {
          console.error('❌ [PagosApiService] No se pudo obtener error response:', e);
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }
      
      // Verificar que la respuesta sea un PDF o binario
      if (!isPdf && !isJson) {
        console.warn('⚠️ [PagosApiService] Content-Type inesperado:', contentType);
        // Continuar de todas formas, podría ser un PDF sin Content-Type correcto
      }
      
      // Clonar la respuesta ANTES de leer el blob para poder validar después si es necesario
      const responseClone = response.clone();
      
      // Obtener el blob del archivo PDF
      const blob = await response.blob();
      console.log('✅ [PagosApiService] Blob creado:', {
        size: blob.size,
        type: blob.type
      });
      
      // Validar que el blob tenga contenido
      if (blob.size === 0) {
        throw new Error('El comprobante descargado está vacío. Por favor, intenta nuevamente.');
      }
      
      // Validar que el blob sea un PDF (verificar los primeros bytes)
      if (blob.size > 4) {
        const firstBytes = blob.slice(0, 4);
        const arrayBuffer = await firstBytes.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const pdfSignature = String.fromCharCode(...uint8Array);
        
        console.log('🔍 [PagosApiService] Firma del archivo (primeros 4 bytes):', pdfSignature);
        
        // Los PDFs deberían comenzar con %PDF
        if (!pdfSignature.startsWith('%PDF')) {
          console.warn('⚠️ [PagosApiService] El archivo no parece ser un PDF válido. Primeros bytes:', pdfSignature);
          
          // Leer la respuesta clonada como texto para ver si es un error
          try {
            const text = await responseClone.text();
            console.error('❌ [PagosApiService] Contenido del archivo (no es PDF):', text.substring(0, 500));
            
            // Intentar parsear como JSON
            try {
              const errorData = JSON.parse(text);
              const errorMessage = errorData.mensaje || errorData.message || errorData.error?.message || errorData.error || 'Error al generar el comprobante';
              throw new Error(errorMessage);
            } catch (parseError) {
              // Si no es JSON válido, verificar si contiene palabras clave de error
              if (text.toLowerCase().includes('error') || text.toLowerCase().includes('mensaje') || text.toLowerCase().includes('message')) {
                throw new Error(`Error del servidor: ${text.substring(0, 200)}`);
              }
              // Si no parece ser un error, lanzar error genérico
              throw new Error('El archivo descargado no es un PDF válido. Por favor, contacta al administrador.');
            }
          } catch (textError) {
            // Si ya es un Error que lanzamos, re-lanzarlo
            if (textError instanceof Error && textError.message) {
              throw textError;
            }
            // Si hay otro error, lanzar error genérico
            throw new Error('No se pudo validar el comprobante. Por favor, intenta nuevamente.');
          }
        } else {
          console.log('✅ [PagosApiService] PDF válido confirmado (firma %PDF encontrada)');
        }
      } else {
        console.warn('⚠️ [PagosApiService] El archivo es muy pequeño para ser un PDF válido');
      }
      
      // Obtener nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `comprobante_pago_${id}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          // Decodificar URL encoding si existe
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            // Si falla la decodificación, usar el nombre tal cual
          }
        }
      }
      
      // Asegurar que el blob tenga el tipo MIME correcto
      // Si el tipo del blob no es 'application/pdf', crear un nuevo blob con el tipo correcto
      let finalBlob = blob;
      if (blob.type !== 'application/pdf') {
        console.log('⚠️ [PagosApiService] El tipo del blob no es application/pdf, corrigiendo...');
        finalBlob = new Blob([blob], { type: 'application/pdf' });
      }
      
      console.log('✅ [PagosApiService] Comprobante listo para descargar:', {
        filename,
        size: finalBlob.size,
        type: finalBlob.type
      });
      return { blob: finalBlob, filename };
    } catch (error) {
      console.error('❌ [PagosApiService] Error descargando comprobante:', error);
      throw error;
    }
  }

  // GET /api/gestion-pagos/:id/comprobante - Ver comprobante (preview)
  async verComprobante(id, token) {
    try {
      console.log(`🔧 [PagosApiService] Obteniendo comprobante del pago ${id}...`);
      const url = `${this.baseURL}${apiConfig.ENDPOINTS.PAYMENT_COMPROBANTE(id)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.mensaje || errorData.message || errorData.error?.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear como JSON, usar el mensaje por defecto
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }
      
      // Obtener el blob del archivo PDF
      const blob = await response.blob();
      const urlBlob = URL.createObjectURL(blob);
      console.log('✅ [PagosApiService] Comprobante obtenido para preview');
      return urlBlob;
    } catch (error) {
      console.error('❌ [PagosApiService] Error obteniendo comprobante:', error);
      throw error;
    }
  }

  // GET /api/gestion-pagos/reporte/excel - Descargar reporte Excel
  async descargarReporteExcel(token) {
    try {
      console.log('🔧 [PagosApiService] Descargando reporte Excel de pagos...');
      const url = `${this.baseURL}${apiConfig.ENDPOINTS.PAYMENT_REPORTE_EXCEL}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.mensaje || errorData.message || errorData.error?.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear como JSON, usar el mensaje por defecto
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }
      
      // Obtener el blob del archivo Excel
      const blob = await response.blob();
      console.log('✅ [PagosApiService] Reporte Excel descargado, tamaño:', blob.size);
      
      // Obtener nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `reporte_pagos_${new Date().toISOString().split('T')[0]}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          // Decodificar URL encoding si existe
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            // Si falla la decodificación, usar el nombre tal cual
          }
        }
      }
      
      return { blob, filename };
    } catch (error) {
      console.error('❌ [PagosApiService] Error descargando reporte Excel:', error);
      throw error;
    }
  }

  // POST /api/gestion-pagos/:id/verify-manual - Verificar pago manualmente
  async verificarPagoManual(id, observaciones, token) {
    try {
      console.log(`🔧 [PagosApiService] Verificando pago ${id} manualmente...`);
      const response = await this.makeRequest(apiConfig.ENDPOINTS.PAYMENT_VERIFY_MANUAL(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          observaciones: observaciones || 'Verificado manualmente por administrador'
        }
      });
      
      if (response.success && response.data) {
        console.log('✅ [PagosApiService] Pago verificado:', response.data);
        return response.data;
      } else {
        console.warn('⚠️ [PagosApiService] Formato de respuesta inesperado:', response);
        return response;
      }
    } catch (error) {
      console.error('❌ [PagosApiService] Error verificando pago:', error);
      throw error;
    }
  }

  // POST /api/gestion-pagos/simular - Simular pago (testing)
  async simularPago(datos, token) {
    try {
      console.log('🔧 [PagosApiService] Simulando pago...', datos);
      const response = await this.makeRequest(apiConfig.ENDPOINTS.PAYMENT_SIMULAR, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: datos
      });
      
      if (response.success && response.data) {
        console.log('✅ [PagosApiService] Pago simulado:', response.data);
        return response.data;
      } else {
        console.warn('⚠️ [PagosApiService] Formato de respuesta inesperado:', response);
        return response;
      }
    } catch (error) {
      console.error('❌ [PagosApiService] Error simulando pago:', error);
      throw error;
    }
  }
}

export default new PagosApiService();

