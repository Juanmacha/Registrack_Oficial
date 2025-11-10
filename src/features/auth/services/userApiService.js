import apiService from '../../../shared/services/apiService.js';
import API_CONFIG from '../../../shared/config/apiConfig.js';

// Servicio de usuarios que consume la API real
const userApiService = {
  // Obtener todos los usuarios (solo admin/empleado)
  getAllUsers: async () => {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS);
      
      return {
        success: true,
        users: response.data || response.usuarios || response,
        message: 'Usuarios obtenidos correctamente'
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para ver usuarios';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para acceder a esta información';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Obtener usuario por ID
  getUserById: async (userId) => {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.USER_BY_ID(userId));
      
      return {
        success: true,
        user: response.data || response.usuario || response,
        message: 'Usuario obtenido correctamente'
      };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para ver este usuario';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Crear usuario (solo admin)
  createUser: async (userData) => {
    try {
      // Preparar datos según la documentación de la API
      const requestData = {
        tipo_documento: userData.tipoDocumento || 'CC',
        documento: String(userData.documento).trim(),
        nombre: String(userData.nombre).trim(),
        apellido: String(userData.apellido).trim(),
        correo: String(userData.email).trim(),
        contrasena: String(userData.password).trim(),
        id_rol: userData.roleId || 1 // Por defecto cliente (backend: 1=cliente, 2=admin, 3=empleado)
      };
      
      console.log('📤 [userApiService] Datos enviados a la API:', requestData);
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.CREATE_USER, requestData);
      
      console.log('📥 [userApiService] Respuesta recibida:', response);

      if (response.success || response.mensaje) {
        return {
          success: true,
          user: response.data?.usuario || response.usuario || response.data || response,
          message: response.mensaje || 'Usuario creado correctamente'
        };
      } else {
        const errorMsg = response.error || response.message || 'Error al crear usuario';
        console.error('❌ [userApiService] Error en respuesta:', errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }
    } catch (error) {
      console.error('💥 [userApiService] Error al crear usuario:', error);
      console.error('💥 [userApiService] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data) {
        // Intentar extraer mensaje de error de diferentes formatos
        const errorData = error.response.data;
        errorMessage = errorData.error || 
                      errorData.mensaje || 
                      errorData.message ||
                      (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
      }
      
      if (error.response?.status === 400) {
        errorMessage = errorMessage || 'Datos inválidos o usuario ya existe';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para crear usuarios';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para crear usuarios';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Actualizar usuario
  updateUser: async (userId, userData) => {
    try {
      console.log('🔄 [userApiService] Actualizando usuario:', userId, 'con datos:', userData);
      
      const requestData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.email,
        tipo_documento: userData.tipoDocumento,
        documento: userData.documento,
        id_rol: userData.roleId,
        rol: userData.roleId, // Probar también con 'rol'
        estado: userData.estado // Agregar el campo estado
      };
      
      console.log('🔄 [userApiService] Datos enviados a la API:', requestData);
      
      const response = await apiService.put(API_CONFIG.ENDPOINTS.USER_BY_ID(userId), requestData);
      
      console.log('📥 [userApiService] Respuesta completa de la API:', JSON.stringify(response, null, 2));

      if (response.success || response.mensaje) {
        console.log('✅ [userApiService] Usuario actualizado en la API');
        const usuarioActualizado = response.data?.usuario || response.usuario || response.data;
        console.log('📥 [userApiService] Usuario devuelto por la API:', JSON.stringify(usuarioActualizado, null, 2));
        return {
          success: true,
          user: usuarioActualizado,
          message: response.mensaje || 'Usuario actualizado correctamente'
        };
      } else {
        return {
          success: false,
          message: response.error || 'Error al actualizar usuario'
        };
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para actualizar este usuario';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Eliminar usuario (solo admin)
  deleteUser: async (userId) => {
    try {
      const response = await apiService.delete(API_CONFIG.ENDPOINTS.USER_BY_ID(userId));

      if (response.success || response.mensaje) {
        return {
          success: true,
          message: response.mensaje || 'Usuario eliminado correctamente'
        };
      } else {
        return {
          success: false,
          message: response.error || 'Error al eliminar usuario'
        };
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para eliminar usuarios';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para eliminar usuarios';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (profileData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        return {
          success: false,
          message: 'Usuario no autenticado'
        };
      }

      const response = await apiService.put(API_CONFIG.ENDPOINTS.USER_BY_ID(currentUser.id_usuario), {
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        correo: profileData.correo,
        telefono: profileData.telefono,
        tipo_documento: profileData.tipoDocumento,
        documento: profileData.documento,
        contrasena: profileData.contrasena
      });

      if (response.success || response.mensaje) {
        // Actualizar datos del usuario en localStorage
        let updatedUser = response.data?.usuario || response.usuario || response.data;
        
        // Si la respuesta no incluye el usuario completo, combinar con el usuario actual
        if (updatedUser && currentUser) {
          // Preservar el rol si no viene en la respuesta
          if (!updatedUser.rol && currentUser.rol) {
            updatedUser.rol = currentUser.rol;
          }
          if (!updatedUser.role && currentUser.role && !updatedUser.rol) {
            updatedUser.role = currentUser.role;
          }
          // Preservar otros campos importantes que puedan no venir en la respuesta
          if (!updatedUser.id_usuario && currentUser.id_usuario) {
            updatedUser.id_usuario = currentUser.id_usuario;
          }
          if (!updatedUser.documento && currentUser.documento) {
            updatedUser.documento = currentUser.documento;
          }
          if (!updatedUser.tipo_documento && currentUser.tipo_documento) {
            updatedUser.tipo_documento = currentUser.tipo_documento;
          }
        }
        
        // Si no hay usuario en la respuesta, crear uno basado en el usuario actual y los datos actualizados
        if (!updatedUser && currentUser) {
          updatedUser = {
            ...currentUser,
            nombre: profileData.nombre || currentUser.nombre,
            apellido: profileData.apellido || currentUser.apellido,
            correo: profileData.correo || currentUser.correo,
            telefono: profileData.telefono || currentUser.telefono
          };
        }
        
        console.log('✅ [UserApiService] Usuario actualizado:', updatedUser);
        console.log('✅ [UserApiService] Rol del usuario:', updatedUser?.rol || updatedUser?.role);
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        return {
          success: true,
          user: updatedUser,
          message: response.mensaje || 'Perfil actualizado correctamente'
        };
      } else {
        return {
          success: false,
          message: response.error || 'Error al actualizar perfil'
        };
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para actualizar perfil';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        return {
          success: false,
          message: 'Usuario no autenticado'
        };
      }

      // Nota: Este endpoint no está en la documentación, pero es común en APIs
      // Si no existe, se puede implementar usando el endpoint de reset-password
      const response = await apiService.put(`${API_CONFIG.ENDPOINTS.USER_BY_ID(currentUser.id_usuario)}/password`, {
        currentPassword,
        newPassword
      });

      if (response.success || response.mensaje) {
        return {
          success: true,
          message: response.mensaje || 'Contraseña actualizada correctamente'
        };
      } else {
        return {
          success: false,
          message: response.error || 'Error al cambiar contraseña'
        };
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 400) {
        errorMessage = 'Contraseña actual incorrecta';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para cambiar contraseña';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }
};

export default userApiService;
