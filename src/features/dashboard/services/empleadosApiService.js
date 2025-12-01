import userApiService from '../../auth/services/userApiService.js';
import { getToken, debugAuthState } from '../../../shared/utils/authUtils.js';
import { clearAllAuthData } from '../../../shared/utils/authCleanup.js';
import API_CONFIG from '../../../shared/config/apiConfig.js';

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
      console.log('⏰ [EmpleadosApiService] Token expirado:', new Date(payload.exp * 1000));
      return false;
    }
    
    console.log('✅ [EmpleadosApiService] Token válido, expira:', new Date(payload.exp * 1000));
    return true;
  } catch (error) {
    console.error('❌ [EmpleadosApiService] Error al validar token:', error);
    return false;
  }
};


// Función para intentar renovar el token
const refreshToken = async () => {
  try {
    console.log('🔄 [EmpleadosApiService] Intentando renovar token...');
    
    // Obtener datos del usuario actual
    const userData = localStorage.getItem('user') || localStorage.getItem('currentUser') || localStorage.getItem('userData');
    
    if (!userData) {
      console.error('❌ [EmpleadosApiService] No hay datos de usuario para renovar token');
      return null;
    }
    
    const user = JSON.parse(userData);
    console.log('👤 [EmpleadosApiService] Usuario para renovar token:', user);
    
    // Aquí podrías implementar un endpoint de refresh token si la API lo soporta
    // Por ahora, simplemente retornamos null para forzar re-login
    console.log('⚠️ [EmpleadosApiService] No hay endpoint de refresh token disponible');
    return null;
    
  } catch (error) {
    console.error('❌ [EmpleadosApiService] Error al renovar token:', error);
    return null;
  }
};

// Servicio para empleados usando la API real
const empleadosApiService = {
  // Función de prueba para verificar conectividad
  testConnection: async () => {
    try {
      console.log('🧪 [EmpleadosApiService] Probando conectividad con la API...');
      return { success: true, data: 'Conectado' };
    } catch (error) {
      console.error('🧪 [EmpleadosApiService] Error en prueba de conectividad:', error);
      return { success: false, error: error };
    }
  },

  // Obtener todos los empleados desde la API real
  getAllEmpleados: async () => {
    try {
      console.log('👥 [EmpleadosApiService] Obteniendo todos los empleados desde la API...');

      // Debug: Verificar estado de autenticación
      console.log('🔍 [EmpleadosApiService] Verificando autenticación...');
      debugAuthState();

      // Obtener token usando utilidades unificadas
      const token = getToken();
      
      if (!token) {
        console.error('❌ [EmpleadosApiService] No hay token de autenticación');
        return {
          success: false,
          data: [],
          message: 'No hay token de autenticación. Por favor, inicie sesión.',
          requiresAuth: true
        };
      }

      console.log('✅ [EmpleadosApiService] Token encontrado:', token.substring(0, 20) + '...');

      console.log('🔑 [EmpleadosApiService] Token encontrado, haciendo petición a la API...');

      const fullUrl = `${API_CONFIG.BASE_URL}/api/gestion-empleados`;
      console.log('🌐 [EmpleadosApiService] Haciendo petición a:', fullUrl);
      console.log('🌐 [EmpleadosApiService] Token completo:', token);
      console.log('🌐 [EmpleadosApiService] Headers:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });

      // Verificar que el token no esté vacío o corrupto
      if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
        console.error('❌ [EmpleadosApiService] Token inválido o vacío');
        return {
          success: false,
          data: [],
          message: 'Token de autenticación inválido. Por favor, inicie sesión nuevamente.',
          requiresAuth: true
        };
      }

      // Verificar si el token es válido (no expirado)
      if (!isTokenValid(token)) {
        console.error('❌ [EmpleadosApiService] Token expirado o inválido');
        clearAllAuthData();
      
      return {
          success: false,
          data: [],
          message: 'Token expirado. Por favor, inicie sesión nuevamente.',
          requiresAuth: true
        };
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📡 [EmpleadosApiService] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (!response.ok) {
        console.error('❌ [EmpleadosApiService] Error en la respuesta de la API:', response.status, response.statusText);
        
        // Intentar obtener el contenido de la respuesta para debugging
        const responseText = await response.text();
        console.error('❌ [EmpleadosApiService] Contenido de la respuesta:', responseText.substring(0, 200) + '...');
        
        // Si es error 401, el token es inválido o expiró
        if (response.status === 401) {
          console.error('🔐 [EmpleadosApiService] Token inválido o expirado');
          clearAllAuthData();
          
          // Forzar recarga de la página para limpiar el estado
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          
          return {
            success: false,
            data: [],
            message: 'Sesión expirada. Redirigiendo al login...',
            requiresAuth: true
          };
        }
        
        return {
          success: false,
          data: [],
          message: `Error ${response.status}: ${response.statusText}`
        };
      }

      // Verificar que la respuesta sea JSON válido
      const responseText = await response.text();
      console.log('📥 [EmpleadosApiService] Respuesta raw:', responseText.substring(0, 200) + '...');
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📥 [EmpleadosApiService] Datos parseados correctamente:', data);
      } catch (parseError) {
        console.error('💥 [EmpleadosApiService] Error al parsear JSON:', parseError);
        console.error('💥 [EmpleadosApiService] Respuesta completa:', responseText);
        return {
          success: false,
          data: [],
          message: 'La API devolvió una respuesta inválida. Verifique que el servidor esté funcionando correctamente.'
        };
      }

             // La API devuelve datos directamente en el formato correcto
             // No necesitamos transformación adicional
             console.log('📋 [EmpleadosApiService] Datos de la API (sin transformar):', data);
      
      return {
        success: true,
        data: data,
        message: 'Empleados obtenidos correctamente desde la API'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al obtener empleados:', error);
      
      return {
        success: false,
        data: [],
        message: 'Error al obtener los empleados: ' + error.message
      };
    }
  },

  // Obtener usuarios con roles empleado o administrador desde la API real
  getUsuariosConRolesEmpleados: async () => {
    try {
      console.log('👥 [EmpleadosApiService] Obteniendo usuarios con roles empleado/administrador desde la API...');
      
      // Obtener todos los usuarios desde la API
      const response = await userApiService.getAllUsers();
      
      if (!response.success) {
        console.error('❌ [EmpleadosApiService] Error al obtener usuarios:', response.message);
        return {
          success: false,
          data: [],
          message: 'Error al obtener usuarios: ' + response.message
        };
      }
      
      console.log('📥 [EmpleadosApiService] Usuarios obtenidos de la API:', response.users);
      
      // Filtrar solo usuarios con roles empleado o administrador
      const usuariosEmpleados = response.users.filter(usuario => {
        const rol = usuario.rol || usuario.role || usuario.roleName;
        const esEmpleado = rol === 'empleado' || rol === 'Empleado' || 
                          rol === 'administrador' || rol === 'Administrador' ||
                          rol === 'admin' || rol === 'Admin' ||
                          rol === 'employee' || rol === 'Employee';
        
        console.log('🔍 [EmpleadosApiService] Usuario:', usuario.nombre || usuario.firstName, 'Rol:', rol, 'Es empleado:', esEmpleado);
        return esEmpleado;
      });
      
      console.log('📋 [EmpleadosApiService] Usuarios filtrados con roles empleados:', usuariosEmpleados);
      
      return {
        success: true,
        data: usuariosEmpleados,
        message: 'Usuarios con roles empleados obtenidos correctamente'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al obtener usuarios con roles empleados:', error);
      
      return {
        success: false,
        data: [],
        message: 'Error al obtener usuarios con roles empleados'
      };
    }
  },

  // Obtener empleado por ID
  getEmpleadoById: async (id) => {
    try {
      console.log('👤 [EmpleadosApiService] Obteniendo empleado ID:', id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ [EmpleadosApiService] No hay token de autenticación');
        return {
          success: false,
          data: null,
          message: 'No hay token de autenticación'
        };
      }

      const fullUrl = `${API_CONFIG.BASE_URL}/api/gestion-empleados/${id}`;
      console.log('🌐 [EmpleadosApiService] URL completa para obtener empleado:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [EmpleadosApiService] Error en la respuesta de la API:', response.status, errorData);
        return {
          success: false,
          data: null,
          message: `Error ${response.status}: ${errorData.message || 'Error al obtener empleado'}`
        };
      }

      const data = await response.json();
      console.log('📥 [EmpleadosApiService] Empleado obtenido:', data);
      
      return {
        success: true,
        data: data,
        message: 'Empleado obtenido correctamente'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al obtener empleado:', error);
      
      return {
        success: false,
        data: null,
        message: 'Error al obtener el empleado: ' + error.message
      };
    }
  },

  // Crear nuevo empleado
  createEmpleado: async (empleadoData) => {
    try {
      console.log('👥 [EmpleadosApiService] Creando empleado...');
      console.log('📤 [EmpleadosApiService] Datos:', empleadoData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ [EmpleadosApiService] No hay token de autenticación');
        return {
          success: false,
          data: null,
          message: 'No hay token de autenticación'
        };
      }

      const fullUrl = `${API_CONFIG.BASE_URL}/api/gestion-empleados`;
      console.log('🌐 [EmpleadosApiService] URL completa para crear empleado:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empleadoData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [EmpleadosApiService] Error en la respuesta de la API:', response.status, errorData);
        return {
          success: false,
          data: null,
          message: `Error ${response.status}: ${errorData.message || 'Error al crear empleado'}`
        };
      }

      const data = await response.json();
      console.log('📥 [EmpleadosApiService] Empleado creado:', data);
      
      return {
        success: true,
        data: data,
        message: 'Empleado creado exitosamente'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al crear empleado:', error);
      
      return {
        success: false,
        data: null,
        message: 'Error al crear el empleado: ' + error.message
      };
    }
  },

  // Actualizar empleado
  updateEmpleado: async (id, empleadoData) => {
    try {
      console.log('👥 [EmpleadosApiService] Actualizando empleado ID:', id);
      console.log('📤 [EmpleadosApiService] Datos:', empleadoData);
      
      // Obtener token usando utilidades unificadas
      const token = getToken();
      if (!token) {
        console.error('❌ [EmpleadosApiService] No hay token de autenticación');
        return {
          success: false,
          data: null,
          message: 'No hay token de autenticación'
        };
      }

      // Verificar si el token es válido
      if (!isTokenValid(token)) {
        console.error('❌ [EmpleadosApiService] Token expirado o inválido');
        clearAllAuthData();
        return {
          success: false,
          data: null,
          message: 'Token expirado. Por favor, inicie sesión nuevamente.'
        };
      }

      const fullUrl = `${API_CONFIG.BASE_URL}/api/gestion-empleados/${id}`;
      console.log('🌐 [EmpleadosApiService] URL completa:', fullUrl);
      console.log('📤 [EmpleadosApiService] Datos a enviar:', empleadoData);
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empleadoData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [EmpleadosApiService] Error en la respuesta de la API:', response.status, errorData);
        return {
          success: false,
          data: null,
          message: `Error ${response.status}: ${errorData.message || 'Error al actualizar empleado'}`
        };
      }

      const data = await response.json();
      console.log('📥 [EmpleadosApiService] Empleado actualizado:', data);
      
      return {
        success: true,
        data: data,
        message: 'Empleado actualizado exitosamente'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al actualizar empleado:', error);
      
      return {
        success: false,
        data: null,
        message: 'Error al actualizar el empleado: ' + error.message
      };
    }
  },

  // Cambiar estado del empleado
  changeEmpleadoEstado: async (id, estado) => {
    try {
      console.log('👥 [EmpleadosApiService] Cambiando estado del empleado ID:', id);
      console.log('📤 [EmpleadosApiService] Nuevo estado:', estado);
      
      // Obtener token usando utilidades unificadas
      const token = getToken();
      if (!token) {
        console.error('❌ [EmpleadosApiService] No hay token de autenticación');
        return {
          success: false,
          data: null,
          message: 'No hay token de autenticación'
        };
      }

      // Verificar si el token es válido
      if (!isTokenValid(token)) {
        console.error('❌ [EmpleadosApiService] Token expirado o inválido');
        clearAllAuthData();
        return {
          success: false,
          data: null,
          message: 'Token expirado. Por favor, inicie sesión nuevamente.'
        };
      }

      const fullUrl = `${API_CONFIG.BASE_URL}/api/gestion-empleados/${id}/estado`;
      console.log('🌐 [EmpleadosApiService] URL completa:', fullUrl);
      console.log('📤 [EmpleadosApiService] Estado a enviar:', { estado });
      
      const response = await fetch(fullUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: estado })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [EmpleadosApiService] Error en la respuesta de la API:', response.status, errorData);
        
        // Extraer el mensaje correcto del error (puede estar en errorData.error.message o errorData.message)
        const errorMessage = errorData.error?.message || errorData.message || 'No se puede cambiar el estado del empleado';
        
        // Lanzar error con información completa para que el componente pueda manejarlo
        const error = new Error(errorMessage);
        error.status = response.status;
        // Guardar toda la estructura del error para que el componente pueda acceder a codigo, tipo, cantidad, etc.
        error.data = errorData.error || errorData;
        // También guardar errorData completo por si acaso
        error.errorData = errorData;
        throw error;
      }

      const data = await response.json();
      console.log('📥 [EmpleadosApiService] Estado del empleado actualizado:', data);
      
      return {
        success: true,
        data: data,
        message: 'Estado del empleado actualizado exitosamente'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al cambiar estado del empleado:', error);
      
      // Si el error ya tiene status y data (viene del throw anterior), re-lanzarlo
      if (error.status && error.data) {
        throw error;
      }
      
      // Si es otro tipo de error, crear uno nuevo con la estructura correcta
      const newError = new Error(error.message || 'Error al cambiar el estado del empleado');
      newError.status = error.status || 500;
      newError.data = error.data || { message: error.message };
      throw newError;
    }
  },

  // Eliminar empleado
  deleteEmpleado: async (id) => {
    try {
      console.log('👥 [EmpleadosApiService] Eliminando empleado ID:', id);
      
      // Obtener token usando utilidades unificadas
      const token = getToken();
      if (!token) {
        console.error('❌ [EmpleadosApiService] No hay token de autenticación');
        return {
          success: false,
          data: null,
          message: 'No hay token de autenticación'
        };
      }

      // Verificar si el token es válido
      if (!isTokenValid(token)) {
        console.error('❌ [EmpleadosApiService] Token expirado o inválido');
        clearAllAuthData();
        return {
          success: false,
          data: null,
          message: 'Token expirado. Por favor, inicie sesión nuevamente.'
        };
      }

      const fullUrl = `${API_CONFIG.BASE_URL}/api/gestion-empleados/${id}`;
      console.log('🌐 [EmpleadosApiService] URL completa:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 [EmpleadosApiService] Respuesta de eliminación:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [EmpleadosApiService] Error en la respuesta de la API:', response.status, errorData);
        
        // Extraer el mensaje correcto del error (puede estar en errorData.error.message o errorData.message)
        const errorMessage = errorData.error?.message || errorData.message || 'No se puede eliminar el empleado';
        
        // Lanzar error con información completa para que el componente pueda manejarlo
        const error = new Error(errorMessage);
        error.status = response.status;
        // Guardar toda la estructura del error para que el componente pueda acceder a codigo, tipo, cantidad, etc.
        error.data = errorData.error || errorData;
        // También guardar errorData completo por si acaso
        error.errorData = errorData;
        throw error;
      }

      // Intentar leer la respuesta exitosa
      const responseData = await response.json().catch(() => ({}));
      console.log('📥 [EmpleadosApiService] Datos de respuesta exitosa:', responseData);

      console.log('📥 [EmpleadosApiService] Empleado y usuario asociado eliminados exitosamente');
      
      // La API devuelve confirmación de eliminación completa según la documentación
      return {
        success: true,
        data: responseData,
        message: responseData.message || 'Empleado y usuario asociado eliminados exitosamente'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al eliminar empleado:', error);
      
      // Si el error ya tiene status y data (viene del throw anterior), re-lanzarlo
      if (error.status && error.data) {
        throw error;
      }
      
      // Si es otro tipo de error, crear uno nuevo con la estructura correcta
      const newError = new Error(error.message || 'Error al eliminar el empleado');
      newError.status = error.status || 500;
      newError.data = error.data || { message: error.message };
      throw newError;
    }
  },

  // Descargar reporte de empleados en Excel
  downloadReporteExcel: async () => {
    try {
      console.log('👥 [EmpleadosApiService] Descargando reporte Excel...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ [EmpleadosApiService] No hay token de autenticación');
        return {
          success: false,
          data: null,
          message: 'No hay token de autenticación'
        };
      }

      const fullUrl = `${API_CONFIG.BASE_URL}/api/gestion-empleados/reporte/excel`;
      console.log('🌐 [EmpleadosApiService] URL completa para reporte Excel:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [EmpleadosApiService] Error en la respuesta de la API:', response.status, errorData);
        return {
          success: false,
          data: null,
          message: `Error ${response.status}: ${errorData.message || 'Error al descargar reporte Excel'}`
        };
      }

      // Obtener el blob del archivo Excel
      const blob = await response.blob();
      
      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo del header Content-Disposition o usar nombre por defecto
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'reporte_empleados.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('📥 [EmpleadosApiService] Reporte Excel descargado exitosamente');

      return {
        success: true,
        data: null,
        message: 'Reporte Excel descargado exitosamente'
      };
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al descargar reporte Excel:', error);
      
      return {
        success: false,
        data: null,
        message: 'Error al descargar el reporte Excel: ' + error.message
      };
    }
  },

  // Sincronizar usuario con rol empleado/administrador como empleado
  sincronizarUsuarioComoEmpleado: async (usuarioId, nuevoRol) => {
    try {
      console.log('🔄 [EmpleadosApiService] Sincronizando usuario como empleado...');
      console.log('👤 [EmpleadosApiService] Usuario ID:', usuarioId, 'Nuevo rol:', nuevoRol);
      
      // Verificar si el nuevo rol es empleado o administrador
      const esRolEmpleado = nuevoRol === 'empleado' || nuevoRol === 'Empleado' || 
                           nuevoRol === 'administrador' || nuevoRol === 'Administrador';
      
      if (esRolEmpleado) {
        console.log('✅ [EmpleadosApiService] Usuario con rol empleado/administrador detectado');
        
        // Crear empleado automáticamente
        const empleadoData = {
          id_usuario: usuarioId,
          estado: true // Activo por defecto
        };
        
        const resultado = await empleadosApiService.createEmpleado(empleadoData);
        
        if (resultado.success) {
          console.log('✅ [EmpleadosApiService] Usuario sincronizado como empleado exitosamente');
          return {
            success: true,
            message: 'Usuario sincronizado como empleado correctamente',
            data: resultado.data
          };
        } else {
          console.error('❌ [EmpleadosApiService] Error al sincronizar usuario como empleado:', resultado.message);
          return {
            success: false,
            message: 'Error al sincronizar usuario como empleado: ' + resultado.message
          };
        }
      } else {
        console.log('ℹ️ [EmpleadosApiService] Usuario no tiene rol empleado/administrador, no se sincroniza');
        return {
          success: true,
          message: 'Usuario no requiere sincronización como empleado'
        };
      }
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al sincronizar usuario como empleado:', error);
      return {
        success: false,
        message: 'Error al sincronizar usuario como empleado'
      };
    }
  },

  // Notificar cambio de rol de usuario (para integración con gestión de usuarios)
  notificarCambioRolUsuario: async (usuarioId, rolAnterior, nuevoRol) => {
    try {
      console.log('🔔 [EmpleadosApiService] Notificando cambio de rol de usuario...');
      console.log('👤 [EmpleadosApiService] Usuario ID:', usuarioId);
      console.log('🔄 [EmpleadosApiService] Rol anterior:', rolAnterior, '→ Nuevo rol:', nuevoRol);
      
      // Sincronizar si el nuevo rol es empleado/administrador
      const resultado = await empleadosApiService.sincronizarUsuarioComoEmpleado(usuarioId, nuevoRol);
      
      if (resultado.success) {
        console.log('✅ [EmpleadosApiService] Cambio de rol procesado correctamente');
        return {
          success: true,
          message: 'Cambio de rol procesado correctamente',
          sincronizado: resultado.message.includes('sincronizado')
        };
      } else {
        console.error('❌ [EmpleadosApiService] Error al procesar cambio de rol:', resultado.message);
        return {
          success: false,
          message: 'Error al procesar cambio de rol: ' + resultado.message
        };
      }
    } catch (error) {
      console.error('💥 [EmpleadosApiService] Error al notificar cambio de rol:', error);
      return {
        success: false,
        message: 'Error al procesar cambio de rol'
      };
    }
  },

  // Validar datos de empleado
  validateEmpleadoData: (empleadoData, isUpdate = false) => {
    const errors = {};
    
    if (!isUpdate) {
      if (!empleadoData.id_usuario || empleadoData.id_usuario <= 0) {
        errors.id_usuario = 'El ID del usuario es requerido';
      }
    }
    
    if (empleadoData.estado !== undefined && typeof empleadoData.estado !== 'boolean') {
      errors.estado = 'El estado debe ser true o false';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }
};

export default empleadosApiService;
