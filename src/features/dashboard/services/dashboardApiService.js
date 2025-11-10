import { getToken } from '../../../shared/utils/authUtils.js';
import { clearAllAuthData } from '../../../shared/utils/authCleanup.js';
import API_CONFIG from '../../../shared/config/apiConfig.js';
import { PERIODO_DEFECTO } from '../shared/periodos.js';

// Función para verificar si un token JWT es válido (no expirado)
const isTokenValid = (token) => {
  try {
    if (!token || token.trim() === '') return false;
    
    // Decodificar el payload del JWT (sin verificar la firma)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Verificar si el token ha expirado
    if (payload.exp && payload.exp < currentTime) {
      console.log('⏰ [DashboardApiService] Token expirado:', new Date(payload.exp * 1000));
      return false;
    }
    
    console.log('✅ [DashboardApiService] Token válido, expira:', new Date(payload.exp * 1000));
    return true;
  } catch (error) {
    console.error('❌ [DashboardApiService] Error al validar token:', error);
    return false;
  }
};

// Función auxiliar para realizar peticiones HTTP
const makeRequest = async (url, options = {}) => {
  try {
    // Obtener token usando utilidades unificadas
    const token = getToken();
    
    if (!token) {
      console.error('❌ [DashboardApiService] No hay token de autenticación');
      return {
        success: false,
        data: null,
        message: 'No hay token de autenticación. Por favor, inicie sesión.',
        requiresAuth: true
      };
    }

    // Verificar que el token no esté vacío o corrupto
    if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
      console.error('❌ [DashboardApiService] Token inválido o vacío');
      return {
        success: false,
        data: null,
        message: 'Token de autenticación inválido. Por favor, inicie sesión nuevamente.',
        requiresAuth: true
      };
    }

    // Verificar si el token es válido (no expirado)
    if (!isTokenValid(token)) {
      console.error('❌ [DashboardApiService] Token expirado o inválido');
      clearAllAuthData();
      return {
        success: false,
        data: null,
        message: 'Token expirado. Por favor, inicie sesión nuevamente.',
        requiresAuth: true
      };
    }

    const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
    console.log('🌐 [DashboardApiService] Haciendo petición a:', fullUrl);

    const response = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    console.log('📡 [DashboardApiService] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      console.error('❌ [DashboardApiService] Error en la respuesta de la API:', response.status, response.statusText);
      
      // Si es error 401, el token es inválido o expiró
      if (response.status === 401) {
        console.error('🔐 [DashboardApiService] Token inválido o expirado');
        clearAllAuthData();
        
        // Forzar recarga de la página para limpiar el estado
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        return {
          success: false,
          data: null,
          message: 'Sesión expirada. Redirigiendo al login...',
          requiresAuth: true
        };
      }
      
      // Intentar obtener el contenido de la respuesta para debugging
      const responseText = await response.text();
      console.error('❌ [DashboardApiService] Contenido de la respuesta:', responseText.substring(0, 200) + '...');
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        errorData = { message: responseText || `Error ${response.status}: ${response.statusText}` };
      }
      
      return {
        success: false,
        data: null,
        message: errorData.message || `Error ${response.status}: ${response.statusText}`
      };
    }

    // Verificar que la respuesta sea JSON válido
    const responseText = await response.text();
    console.log('📥 [DashboardApiService] Respuesta raw (primeros 500 caracteres):', responseText.substring(0, 500));
    console.log('📥 [DashboardApiService] Longitud total de la respuesta:', responseText.length);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📥 [DashboardApiService] Datos parseados correctamente');
      console.log('📥 [DashboardApiService] Tipo de datos:', typeof data);
      console.log('📥 [DashboardApiService] ¿Es array?', Array.isArray(data));
      console.log('📥 [DashboardApiService] Claves principales:', Object.keys(data));
      console.log('📥 [DashboardApiService] Datos completos:', JSON.stringify(data, null, 2).substring(0, 1000));
    } catch (parseError) {
      console.error('💥 [DashboardApiService] Error al parsear JSON:', parseError);
      console.error('💥 [DashboardApiService] Respuesta completa:', responseText);
      return {
        success: false,
        data: null,
        message: 'La API devolvió una respuesta inválida. Verifique que el servidor esté funcionando correctamente.'
      };
    }

    return {
      success: true,
      data: data,
      message: 'Datos obtenidos correctamente desde la API'
    };
  } catch (error) {
    console.error('💥 [DashboardApiService] Error en la petición:', error);
    
    return {
      success: false,
      data: null,
      message: 'Error al obtener los datos: ' + error.message
    };
  }
};

// Servicio para dashboard usando la API real
const dashboardApiService = {
  /**
   * Obtener períodos disponibles desde el backend
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getPeriodos: async () => {
    try {
      console.log('📊 [DashboardApiService] Obteniendo períodos disponibles');
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_PERIODOS;
      return await makeRequest(url);
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al obtener períodos:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener los períodos disponibles: ' + error.message
      };
    }
  },

  /**
   * Obtener análisis de ingresos por periodo
   * @param {string} periodo - Periodo de análisis (1mes, 3meses, 6meses, 12meses, 18meses, 2anos, 3anos, 5anos, todo, custom)
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getIngresos: async (periodo = PERIODO_DEFECTO) => {
    try {
      console.log('📊 [DashboardApiService] Obteniendo ingresos, periodo:', periodo);
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_INGRESOS(periodo);
      return await makeRequest(url);
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al obtener ingresos:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener los ingresos: ' + error.message
      };
    }
  },

  /**
   * Obtener resumen de servicios y estadísticas
   * @param {string} periodo - Periodo de análisis (1mes, 3meses, 6meses, 12meses, 18meses, 2anos, 3anos, 5anos, todo)
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getServicios: async (periodo = PERIODO_DEFECTO) => {
    try {
      console.log('📊 [DashboardApiService] Obteniendo servicios, periodo:', periodo);
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_SERVICIOS(periodo);
      return await makeRequest(url);
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al obtener servicios:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener los servicios: ' + error.message
      };
    }
  },

  /**
   * Obtener KPIs generales del dashboard
   * @param {string} periodo - Periodo de análisis (1mes, 3meses, 6meses, 12meses, 18meses, 2anos, 3anos, 5anos, todo, custom)
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getResumen: async (periodo = PERIODO_DEFECTO) => {
    try {
      console.log('📊 [DashboardApiService] Obteniendo resumen, periodo:', periodo);
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_RESUMEN(periodo);
      return await makeRequest(url);
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al obtener resumen:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener el resumen: ' + error.message
      };
    }
  },

  /**
   * Obtener servicios pendientes
   * @param {string} format - Formato de respuesta (json, excel)
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getPendientes: async (format = 'json') => {
    try {
      console.log('📊 [DashboardApiService] Obteniendo servicios pendientes, formato:', format);
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_PENDIENTES(format);
      
      if (format === 'excel') {
        // Para Excel, necesitamos manejar la descarga del archivo
        return await dashboardApiService.downloadExcel(url, 'servicios-pendientes.xlsx');
      }
      
      return await makeRequest(url);
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al obtener servicios pendientes:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener los servicios pendientes: ' + error.message
      };
    }
  },

  /**
   * Obtener solicitudes inactivas
   * @param {string} format - Formato de respuesta (json, excel)
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getInactivas: async (format = 'json') => {
    try {
      console.log('📊 [DashboardApiService] Obteniendo solicitudes inactivas, formato:', format);
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_INACTIVAS(format);
      
      if (format === 'excel') {
        // Para Excel, necesitamos manejar la descarga del archivo
        return await dashboardApiService.downloadExcel(url, 'solicitudes-inactivas.xlsx');
      }
      
      return await makeRequest(url);
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al obtener solicitudes inactivas:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener las solicitudes inactivas: ' + error.message
      };
    }
  },

  /**
   * Obtener renovaciones próximas a vencer
   * @param {string} format - Formato de respuesta (json, excel)
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getRenovacionesProximas: async (format = 'json') => {
    try {
      console.log('📊 [DashboardApiService] Obteniendo renovaciones próximas, formato:', format);
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_RENOVACIONES(format);
      
      if (format === 'excel') {
        // Para Excel, necesitamos manejar la descarga del archivo
        return await dashboardApiService.downloadExcel(url, 'renovaciones-proximas.xlsx');
      }
      
      return await makeRequest(url);
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al obtener renovaciones próximas:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener las renovaciones próximas: ' + error.message
      };
    }
  },

  /**
   * Probar envío de alertas de renovación
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  testAlertas: async () => {
    try {
      console.log('📊 [DashboardApiService] Probando envío de alertas');
      const url = API_CONFIG.ENDPOINTS.DASHBOARD_TEST_ALERTAS;
      return await makeRequest(url, { method: 'POST' });
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al probar alertas:', error);
      return {
        success: false,
        data: null,
        message: 'Error al probar las alertas: ' + error.message
      };
    }
  },

  /**
   * Descargar archivo Excel desde la API
   * @param {string} url - URL del endpoint
   * @param {string} filename - Nombre del archivo a descargar
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  downloadExcel: async (url, filename = 'reporte.xlsx') => {
    try {
      const token = getToken();
      
      if (!token || !isTokenValid(token)) {
        return {
          success: false,
          data: null,
          message: 'Token de autenticación inválido o expirado.',
          requiresAuth: true
        };
      }

      const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
      console.log('🌐 [DashboardApiService] Descargando Excel desde:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [DashboardApiService] Error al descargar Excel:', response.status, errorData);
        return {
          success: false,
          data: null,
          message: `Error ${response.status}: ${errorData.message || 'Error al descargar el archivo Excel'}`
        };
      }

      // Obtener el blob del archivo Excel
      const blob = await response.blob();
      
      // Crear URL temporal para descarga
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Obtener nombre del archivo del header Content-Disposition o usar nombre por defecto
      const contentDisposition = response.headers.get('Content-Disposition');
      let finalFilename = filename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          finalFilename = filenameMatch[1];
        }
      }
      
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('📥 [DashboardApiService] Archivo Excel descargado exitosamente:', finalFilename);

      return {
        success: true,
        data: { filename: finalFilename },
        message: 'Archivo Excel descargado exitosamente'
      };
    } catch (error) {
      console.error('💥 [DashboardApiService] Error al descargar Excel:', error);
      return {
        success: false,
        data: null,
        message: 'Error al descargar el archivo Excel: ' + error.message
      };
    }
  }
};

export default dashboardApiService;

