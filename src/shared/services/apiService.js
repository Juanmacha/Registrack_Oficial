// import axios from 'axios';
import API_CONFIG from '../config/apiConfig.js';

// Función para hacer peticiones HTTP usando fetch
const makeHttpRequest = async (url, options = {}) => {
  console.log('🔧 [makeHttpRequest] Iniciando petición HTTP...');
  console.log('🔗 [makeHttpRequest] URL:', url);
  console.log('⚙️ [makeHttpRequest] Options:', options);
  
  const defaultOptions = {
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers
    },
    ...options
  };

  // Agregar token de autenticación si existe
  // Intentar ambas claves para compatibilidad
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 [makeHttpRequest] Token agregado');
  } else {
    console.log('🔓 [makeHttpRequest] Sin token (petición pública)');
  }

  const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
  console.log('🌐 [makeHttpRequest] URL completa:', fullUrl);
  console.log('📤 [makeHttpRequest] Enviando fetch...');

  // Crear un AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('⏰ [makeHttpRequest] Timeout alcanzado, cancelando petición...');
    controller.abort();
  }, API_CONFIG.TIMEOUT || 30000); // 30 segundos por defecto

  try {
    const response = await fetch(fullUrl, {
      ...defaultOptions,
      signal: controller.signal
    });
    
    // Limpiar el timeout si la petición fue exitosa
    clearTimeout(timeoutId);
    console.log('📥 [makeHttpRequest] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      console.log('❌ [makeHttpRequest] Error HTTP:', response.status);
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.log('❌ [makeHttpRequest] Error response data:', errorData);
      
      // Convertir headers a objeto plano para facilitar el acceso
      const headersObj = {};
      if (response.headers) {
        response.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
      }
      
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        headers: headersObj // Headers como objeto plano para fácil acceso
      };
      throw error;
    }

    const responseData = await response.json();
    console.log('✅ [makeHttpRequest] Datos parseados:', responseData);

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    // Limpiar el timeout en caso de error
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.log('⏰ [makeHttpRequest] Petición cancelada por timeout');
      const timeoutError = new Error('El servidor está tardando mucho en responder. Esto puede suceder si el servidor está iniciando (especialmente en OnRender). Por favor, espera unos segundos e intenta de nuevo.');
      timeoutError.response = {
        status: 408,
        data: { 
          error: 'Timeout de conexión',
          message: 'El servidor está tardando mucho en responder. Si estás usando OnRender, el servidor puede estar "despertando". Espera unos segundos e intenta de nuevo.'
        }
      };
      throw timeoutError;
    }
    
    console.log('💥 [makeHttpRequest] Error en fetch:', error);
    throw error;
  }
};

// Función para hacer peticiones con reintentos
const makeRequest = async (url, options = {}, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  try {
    const response = await makeHttpRequest(url, options);
    return response.data;
  } catch (error) {
    // Si el token expiró o es inválido, limpiar localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Reintentar si hay error 408 (timeout) o 500+ (errores del servidor)
    if (retries > 0 && (error.response?.status === 408 || error.response?.status >= 500)) {
      console.log(`🔄 [makeRequest] Reintentando petición... Intentos restantes: ${retries - 1}`);
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return makeRequest(url, options, retries - 1);
    }
    throw error;
  }
};

// Servicio base para todas las peticiones HTTP
export const apiService = {
  // GET request
  get: async (endpoint, config = {}) => {
    return makeRequest(endpoint, {
      method: 'GET',
      ...config
    });
  },

  // POST request
  post: async (endpoint, data = {}, config = {}) => {
    return makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...config
    });
  },

  // PUT request
  put: async (endpoint, data = {}, config = {}) => {
    return makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config
    });
  },

  // DELETE request
  delete: async (endpoint, config = {}) => {
    return makeRequest(endpoint, {
      method: 'DELETE',
      ...config
    });
  },

  // PATCH request
  patch: async (endpoint, data = {}, config = {}) => {
    return makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...config
    });
  },

  // POST request público (sin autenticación)
  postPublic: async (endpoint, data = {}, config = {}) => {
    console.log('🌐 [ApiService] Iniciando postPublic...');
    console.log('🔗 [ApiService] Endpoint:', endpoint);
    console.log('📤 [ApiService] Data:', data);
    console.log('🌐 [ApiService] URL completa:', `${API_CONFIG.BASE_URL}${endpoint}`);
    
    try {
      console.log('📡 [ApiService] Haciendo petición HTTP...');
      const response = await makeHttpRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...config.headers
        },
        ...config
      });
      console.log('✅ [ApiService] Petición exitosa, respuesta:', response);
      return response.data;
    } catch (error) {
      console.error('💥 [ApiService] Error en petición pública:', error);
      console.error('💥 [ApiService] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // GET request público (sin autenticación)
  getPublic: async (endpoint, config = {}) => {
    return makeHttpRequest(endpoint, {
      method: 'GET',
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...config.headers
      },
      ...config
    });
  }
};

export default apiService;
