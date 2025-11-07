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
}

// Crear instancia única del servicio
const archivosApiService = new ArchivosApiService();

export default archivosApiService;

