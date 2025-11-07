// Servicio para conectar seguimiento con la API real
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class SeguimientoApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
  }

  // Función para hacer peticiones HTTP
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log('🌐 [SeguimientoApiService] URL:', url);
      const response = await fetch(url, config);
      console.log('📡 [SeguimientoApiService] Response status:', response.status);
      
      if (!response.ok) {
        // Intentar obtener texto completo del error según documentación del backend
        let errorData = {};
        let errorText = '';
        try {
          const text = await response.clone().text();
          errorText = text;
          console.error('❌ [SeguimientoApiService] Error response text:', text);
          console.error('❌ [SeguimientoApiService] Response status:', response.status);
          console.error('❌ [SeguimientoApiService] Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (text) {
            try {
              errorData = JSON.parse(text);
            } catch (parseError) {
              // Si no es JSON, usar el texto como mensaje
              errorText = text;
            }
          }
        } catch (e) {
          console.error('❌ [SeguimientoApiService] No se pudo parsear error como JSON:', e);
          errorText = `Error ${response.status}: ${response.statusText}`;
        }
        
        console.error('❌ [SeguimientoApiService] Error data completo:', errorData);
        
        // Según documentación del backend, los errores pueden venir en diferentes formatos:
        // - { mensaje: "..." } para errores 500
        // - { error: "..." } para errores 400
        // - Mensajes específicos según el tipo de error
        const errorMessage = errorData.error || 
                           errorData.mensaje || 
                           (errorData.success === false && errorData.error?.message) ||
                           errorText || 
                           `Error ${response.status}: ${response.statusText}`;
        
        console.error('❌ [SeguimientoApiService] Mensaje de error final:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ [SeguimientoApiService] Response data:', data);
      return data;
    } catch (error) {
      console.error(`❌ [SeguimientoApiService] Error en petición API:`, error);
      throw error;
    }
  }

  // GET /api/seguimiento/:idOrdenServicio/estados-disponibles - Obtener estados disponibles
  async getEstadosDisponibles(idOrdenServicio, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Obteniendo estados disponibles para orden ${idOrdenServicio}...`);
      const resultado = await this.makeRequest(`/api/seguimiento/${idOrdenServicio}/estados-disponibles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SeguimientoApiService] Estados disponibles obtenidos:', resultado);
      // Retornar resultado completo con data.estados_disponibles y data.estado_actual
      return resultado;
    } catch (error) {
      console.error(`❌ [SeguimientoApiService] Error obteniendo estados disponibles para orden ${idOrdenServicio}:`, error);
      throw error;
    }
  }

  // GET /api/seguimiento/historial/:idOrdenServicio - Obtener historial de seguimiento
  async getHistorial(idOrdenServicio, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Obteniendo historial para orden ${idOrdenServicio}...`);
      const historial = await this.makeRequest(`/api/seguimiento/historial/${idOrdenServicio}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Según la guía, el historial viene como array directamente
      const historialArray = Array.isArray(historial) ? historial : [];
      console.log(`✅ [SeguimientoApiService] Historial obtenido:`, historialArray.length, 'registros');
      return historialArray;
    } catch (error) {
      console.error(`❌ [SeguimientoApiService] Error obteniendo historial para orden ${idOrdenServicio}:`, error);
      throw error;
    }
  }

  // POST /api/seguimiento/crear - Crear nuevo seguimiento
  async crearSeguimiento(datos, token) {
    try {
      console.log('🔧 [SeguimientoApiService] Creando seguimiento...');
      console.log('📋 [SeguimientoApiService] Datos recibidos:', JSON.stringify(datos, null, 2));
      console.log('🔐 [SeguimientoApiService] Token presente:', token ? 'Sí' : 'No');
      
      // Validar estructura del payload según documentación del backend
      if (!datos.id_orden_servicio || typeof datos.id_orden_servicio !== 'number') {
        throw new Error('id_orden_servicio es requerido y debe ser un número');
      }
      
      if (!datos.titulo || typeof datos.titulo !== 'string' || !datos.titulo.trim()) {
        throw new Error('titulo es requerido y debe ser un string no vacío');
      }
      
      if (!datos.descripcion || typeof datos.descripcion !== 'string' || !datos.descripcion.trim()) {
        throw new Error('descripcion es requerido y debe ser un string no vacío');
      }
      
      if (datos.titulo.length > 200) {
        throw new Error('El título no puede exceder los 200 caracteres');
      }
      
      console.log('✅ [SeguimientoApiService] Validaciones del frontend pasadas');
      
      const seguimiento = await this.makeRequest('/api/seguimiento/crear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });
      
      console.log('✅ [SeguimientoApiService] Seguimiento creado exitosamente:', seguimiento);
      return seguimiento;
    } catch (error) {
      console.error('❌ [SeguimientoApiService] Error creando seguimiento:', error);
      console.error('❌ [SeguimientoApiService] Stack trace:', error.stack);
      throw error;
    }
  }

  // GET /api/seguimiento/:id - Obtener seguimiento por ID
  async getSeguimientoById(id, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Obteniendo seguimiento ${id}...`);
      const seguimiento = await this.makeRequest(`/api/seguimiento/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SeguimientoApiService] Seguimiento obtenido:', seguimiento);
      return seguimiento;
    } catch (error) {
      console.error(`❌ [SeguimientoApiService] Error obteniendo seguimiento ${id}:`, error);
      throw error;
    }
  }

  // PUT /api/seguimiento/:id - Actualizar seguimiento
  async updateSeguimiento(id, datos, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Actualizando seguimiento ${id}...`, datos);
      const seguimiento = await this.makeRequest(`/api/seguimiento/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });
      console.log('✅ [SeguimientoApiService] Seguimiento actualizado:', seguimiento);
      return seguimiento;
    } catch (error) {
      console.error(`❌ [SeguimientoApiService] Error actualizando seguimiento ${id}:`, error);
      throw error;
    }
  }

  // DELETE /api/seguimiento/:id - Eliminar seguimiento
  async deleteSeguimiento(id, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Eliminando seguimiento ${id}...`);
      const resultado = await this.makeRequest(`/api/seguimiento/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SeguimientoApiService] Seguimiento eliminado:', resultado);
      return resultado;
    } catch (error) {
      console.error(`❌ [SeguimientoApiService] Error eliminando seguimiento ${id}:`, error);
      throw error;
    }
  }

  // GET /api/seguimiento/buscar/:idOrdenServicio?titulo= - Buscar seguimiento por título
  async buscarSeguimientoPorTitulo(idOrdenServicio, titulo, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Buscando seguimiento con título "${titulo}" en orden ${idOrdenServicio}...`);
      const seguimientos = await this.makeRequest(`/api/seguimiento/buscar/${idOrdenServicio}?titulo=${encodeURIComponent(titulo)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`✅ [SeguimientoApiService] Seguimientos encontrados:`, seguimientos.length);
      return seguimientos;
    } catch (error) {
      console.error(`❌ [SeguimientoApiService] Error buscando seguimiento con título "${titulo}":`, error);
      throw error;
    }
  }
}

// Crear instancia única del servicio
const seguimientoApiService = new SeguimientoApiService();

export default seguimientoApiService;

