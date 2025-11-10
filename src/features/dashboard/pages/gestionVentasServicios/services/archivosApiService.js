// Servicio para conectar gestión de archivos con la API real
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class ArchivosApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
  }

  // Función para hacer peticiones HTTP
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = { ...options };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ [ArchivosApiService] Error en petición API:`, error);
      throw error;
    }
  }

  // POST /api/gestion-archivos/upload - Subir archivo
  async uploadArchivo(formData, token) {
    try {
      console.log('🔧 [ArchivosApiService] Subiendo archivo...');
      const response = await fetch(`${this.baseURL}/api/gestion-archivos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // ⚠️ NO incluir 'Content-Type': 'application/json' - FormData lo maneja automáticamente
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      const archivo = await response.json();
      console.log('✅ [ArchivosApiService] Archivo subido:', archivo);
      return archivo;
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error subiendo archivo:', error);
      throw error;
    }
  }

  // GET /api/gestion-archivos/:id/download - Descargar archivo
  async downloadArchivo(id, token) {
    try {
      console.log(`🔧 [ArchivosApiService] Descargando archivo ${id}...`);
      const response = await fetch(`${this.baseURL}/api/gestion-archivos/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archivo-${id}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ [ArchivosApiService] Archivo descargado');
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error descargando archivo:', error);
      throw error;
    }
  }

  // GET /api/gestion-archivos/cliente/:idCliente - Obtener archivos de un cliente
  async getArchivosPorCliente(idCliente, token) {
    try {
      console.log(`🔧 [ArchivosApiService] Obteniendo archivos del cliente ${idCliente}...`);
      const archivos = await this.makeRequest(`/api/gestion-archivos/cliente/${idCliente}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [ArchivosApiService] Archivos obtenidos:', archivos.length);
      return archivos;
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error obteniendo archivos:', error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/:id/descargar-archivos - Descargar ZIP de archivos de una solicitud
  async downloadArchivosSolicitudZip(idOrdenServicio, token) {
    try {
      console.log(`🔧 [ArchivosApiService] Descargando ZIP de archivos de solicitud ${idOrdenServicio}...`);
      
      const response = await fetch(
        `${this.baseURL}/api/gestion-solicitudes/${idOrdenServicio}/descargar-archivos`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        // Intentar obtener mensaje de error del backend
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Si no se puede parsear el error, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }
      
      // Verificar que la respuesta es un ZIP (blob)
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('zip') && !contentType.includes('octet-stream')) {
        console.warn(`⚠️ [ArchivosApiService] Content-Type inesperado: ${contentType}`);
      }
      
      // Obtener nombre del archivo desde headers si está disponible
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Archivos_Solicitud_${idOrdenServicio}.zip`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
          // Decodificar si está en formato URL encoding
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            // Si falla la decodificación, usar el nombre tal cual
          }
        }
      }
      
      // Descargar el blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ [ArchivosApiService] ZIP descargado exitosamente: ${filename}`);
      return { success: true, filename, size: blob.size };
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error descargando ZIP de solicitud:', error);
      throw error;
    }
  }
}

// Crear instancia única del servicio
const archivosApiService = new ArchivosApiService();

export default archivosApiService;

