/**
 * Servicio API para gestión de servicios
 * Versión actualizada - Backend funcionando correctamente
 */

import API_CONFIG from '../../../../../shared/config/apiConfig.js';

class ServiciosApiService {
  constructor() {
    // ✅ Usar API_CONFIG para manejar proxy en desarrollo y URL completa en producción
    this.baseURL = API_CONFIG.BASE_URL || API_CONFIG.baseURL || '';
  }

  // 🔧 Función base para hacer peticiones HTTP
  async makeRequest(url, config = {}) {
    try {
      console.log('🌐 [ServiciosApiService] URL:', url);
      console.log('🔧 [ServiciosApiService] Config:', {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.parse(config.body) : null
      });

      const response = await fetch(url, config);
      
      console.log('📡 [ServiciosApiService] Response status:', response.status);
      console.log('📡 [ServiciosApiService] Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [ServiciosApiService] Error response:', errorData);
        throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      console.log('✅ [ServiciosApiService] Response data:', data);
      return data;

    } catch (error) {
      console.error('❌ [ServiciosApiService] Error en petición API:', error);
      throw error;
    }
  }

  // 📋 Obtener todos los servicios
  async getServicios() {
    try {
      console.log('🔧 [ServiciosApiService] Obteniendo todos los servicios...');
      
      const url = `${this.baseURL}/api/servicios`;
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const servicios = await this.makeRequest(url, config);
      console.log('✅ [ServiciosApiService] Servicios obtenidos:', servicios.length);
      return servicios;

    } catch (error) {
      console.error('❌ [ServiciosApiService] Error obteniendo servicios:', error);
      throw new Error(`Error del servidor al obtener servicios: ${error.message}`);
    }
  }

  // 🔍 Obtener servicio por ID
  async getServicioById(id) {
    try {
      console.log(`🔧 [ServiciosApiService] Obteniendo servicio ${id}...`);
      
      const url = `${this.baseURL}/api/servicios/${id}`;
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const servicio = await this.makeRequest(url, config);
      console.log('✅ [ServiciosApiService] Servicio obtenido:', servicio);
      return servicio;

    } catch (error) {
      console.error(`❌ [ServiciosApiService] Error obteniendo servicio ${id}:`, error);
      throw new Error(`Error del servidor al obtener servicio: ${error.message}`);
    }
  }

  // ✏️ Actualizar servicio
  async updateServicio(id, data, token) {
    try {
      console.log(`🔧 [ServiciosApiService] Actualizando servicio ${id}...`);
      console.log('🔍 [DEBUG] Datos de actualización:', data);
      
      const url = `${this.baseURL}/api/servicios/${id}`;
      const config = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      };

      const servicioActualizado = await this.makeRequest(url, config);
      console.log('✅ [ServiciosApiService] Servicio actualizado:', servicioActualizado);
      return servicioActualizado;

    } catch (error) {
      console.error(`❌ [ServiciosApiService] Error actualizando servicio ${id}:`, error);
      throw new Error(`Error del servidor al actualizar servicio: ${error.message}`);
    }
  }

  // 👁️ Cambiar visibilidad del servicio
  async toggleVisibilidadServicio(id, visible, token) {
    try {
      console.log(`🔧 [ServiciosApiService] Cambiando visibilidad del servicio ${id} a ${visible}...`);

      // Obtener servicio actual para verificar cambios
      const servicioActual = await this.getServicioById(id);
      console.log('🔍 [DEBUG] Servicio actual desde backend:', {
        id: servicioActual.id,
        visible_en_landing: servicioActual.visible_en_landing
      });

      // Verificar si hay cambios reales
      if (servicioActual.visible_en_landing === visible) {
        console.log('⚠️ [DEBUG] No hay cambio real en visibilidad, el valor ya es:', visible);
        console.log('🔄 [DEBUG] Retornando servicio actual sin cambios');
        return {
          success: true,
          message: "No hay cambios necesarios",
          data: servicioActual
        };
      }

      // Preparar datos de actualización
      const datosActualizacion = {
        visible_en_landing: visible,
        landing_data: servicioActual.landing_data || {}
      };

      console.log('🔍 [DEBUG] Datos de actualización (solo visibilidad):', datosActualizacion);
      console.log('🔍 [DEBUG] Comparación: actual =', servicioActual.visible_en_landing, 'nuevo =', visible);
      
      const servicioActualizado = await this.updateServicio(id, datosActualizacion, token);
      console.log('✅ [ServiciosApiService] Visibilidad actualizada:', servicioActualizado);
      return servicioActualizado;

    } catch (error) {
      console.error(`❌ [ServiciosApiService] Error cambiando visibilidad del servicio ${id}:`, error);
      throw new Error(`Error del servidor al actualizar servicio: ${error.message}`);
    }
  }

  // 🏠 Actualizar datos de landing
  async updateLandingData(id, data, token) {
    try {
      console.log(`🔧 [ServiciosApiService] Actualizando landing data del servicio ${id}...`);
      console.log('🔍 [DEBUG] LandingData recibido:', data);

      // Obtener servicio actual
      const servicioActual = await this.getServicioById(id);
      console.log('🔍 [DEBUG] Servicio actual obtenido:', {
        id: servicioActual.id,
        landing_data: servicioActual.landing_data
      });

      // Preparar datos de actualización completos
      const datosActualizacion = {
        visible_en_landing: servicioActual.visible_en_landing,
        landing_data: data
      };

      console.log('🔍 [DEBUG] Datos de actualización preparados:', datosActualizacion);
      console.log('🔍 [DEBUG] Estructura completa de datos:', JSON.stringify(datosActualizacion, null, 2));

      const servicioActualizado = await this.updateServicio(id, datosActualizacion, token);
      console.log('✅ [ServiciosApiService] Landing data actualizado:', servicioActualizado);
      
      // Verificar estructura de respuesta
      const landingDataActualizado = servicioActualizado?.landing_data || servicioActualizado?.data?.landing_data;
      console.log('🔍 [ServiciosApiService] Landing data en respuesta:', landingDataActualizado);
      console.log('🔍 [ServiciosApiService] Imagen en respuesta:', landingDataActualizado?.imagen ? 'Presente' : 'Ausente');
      
      // Si la respuesta tiene una estructura diferente, normalizarla
      if (servicioActualizado?.data) {
        return servicioActualizado.data;
      }
      
      return servicioActualizado;

    } catch (error) {
      console.error(`❌ [ServiciosApiService] Error actualizando landing data del servicio ${id}:`, error);
      throw new Error(`Error del servidor al actualizar servicio: ${error.message}`);
    }
  }


  // ⚙️ Actualizar estados de proceso
  async updateProcessStates(id, data, token) {
    try {
      console.log(`🔧 [ServiciosApiService] Actualizando process states del servicio ${id}...`);
      console.log('🔍 [DEBUG] ProcessStates recibido:', data);
      console.log('🔍 [DEBUG] Tipo de datos:', typeof data, 'Es array:', Array.isArray(data));
      console.log('🔍 [DEBUG] Longitud del array:', Array.isArray(data) ? data.length : 'No es array');

      // Obtener servicio actual
      const servicioActual = await this.getServicioById(id);
      console.log('🔍 [DEBUG] Servicio actual obtenido:', {
        id: servicioActual.id,
        process_states: servicioActual.process_states,
        process_states_type: typeof servicioActual.process_states,
        process_states_is_array: Array.isArray(servicioActual.process_states)
      });

      // Verificar si hay cambios reales en process_states
      const actualProcessStates = servicioActual.process_states || [];
      const nuevosProcessStates = data || [];
      
      console.log('🔍 [DEBUG] Comparando process states:');
      console.log('  - Actual:', JSON.stringify(actualProcessStates, null, 2));
      console.log('  - Nuevo:', JSON.stringify(nuevosProcessStates, null, 2));
      
      const hayCambios = JSON.stringify(actualProcessStates) !== JSON.stringify(nuevosProcessStates);
      console.log('🔍 [DEBUG] ¿Hay cambios en process_states?', hayCambios);

      if (!hayCambios) {
        console.log('⚠️ [DEBUG] No hay cambios reales en process_states');
        return {
          success: true,
          message: "No hay cambios necesarios en los estados del proceso",
          data: servicioActual
        };
      }

      // Preparar datos de actualización completos
      const datosActualizacion = {
        visible_en_landing: servicioActual.visible_en_landing,
        landing_data: servicioActual.landing_data || {},
        process_states: data
      };

      console.log('🔍 [DEBUG] Datos de actualización preparados:', datosActualizacion);
      console.log('🔍 [DEBUG] Estructura completa de datos:', JSON.stringify(datosActualizacion, null, 2));

      const servicioActualizado = await this.updateServicio(id, datosActualizacion, token);
      console.log('✅ [ServiciosApiService] Process states actualizado:', servicioActualizado);
      
      // Log específico para verificar qué devuelve el backend
      console.log('🔍 [DEBUG] Respuesta del backend después de actualizar process_states:');
      console.log('  - Success:', servicioActualizado.success);
      console.log('  - Message:', servicioActualizado.message);
      console.log('  - Process states en respuesta:', servicioActualizado.data?.process_states);
      console.log('  - Cantidad de process states:', servicioActualizado.data?.process_states?.length);
      
      // Verificar si el backend está devolviendo los process_states correctamente
      if (servicioActualizado.data?.process_states?.length > 0) {
        console.log('✅ [DEBUG] ¡Backend corregido! Process states se están guardando correctamente');
      } else {
        console.log('❌ [DEBUG] Backend aún no está guardando process_states correctamente');
      }
      
      return servicioActualizado;

    } catch (error) {
      console.error(`❌ [ServiciosApiService] Error actualizando process states del servicio ${id}:`, error);
      throw new Error(`Error del servidor al actualizar servicio: ${error.message}`);
    }
  }
}

// Crear instancia única del servicio
const serviciosApiService = new ServiciosApiService();

export default serviciosApiService;