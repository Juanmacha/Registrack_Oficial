import apiService from '../../../shared/services/apiService.js';
import API_CONFIG from '../../../shared/config/apiConfig.js';
import clientesApiService from '../../dashboard/services/clientesApiService.js';

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
      // Validar que roleId sea válido
      if (!userData.roleId || userData.roleId === null || userData.roleId === undefined) {
        console.error('❌ [userApiService] roleId inválido:', userData.roleId);
        return {
          success: false,
          message: 'El rol seleccionado no es válido. Por favor, selecciona un rol válido.'
        };
      }
      
      // Preparar datos según la documentación de la API
      const requestData = {
        tipo_documento: userData.tipoDocumento || 'CC',
        documento: String(userData.documento).trim(),
        nombre: String(userData.nombre).trim(),
        apellido: String(userData.apellido).trim(),
        correo: String(userData.email).trim(),
        contrasena: String(userData.password).trim(),
        id_rol: Number(userData.roleId) // Asegurar que sea un número
      };
      
      console.log('📤 [userApiService] Datos enviados a la API:', requestData);
      console.log('📤 [userApiService] id_rol (tipo):', typeof requestData.id_rol, 'valor:', requestData.id_rol);
      
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
      console.log('🔄 [UserApiService] updateProfile - Datos recibidos:', profileData);
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        console.error('❌ [UserApiService] No hay usuario en localStorage');
        return {
          success: false,
          message: 'Usuario no autenticado'
        };
      }

      // Obtener el ID del usuario (puede venir en diferentes formatos)
      const userId = currentUser.id_usuario || currentUser.id || currentUser.userId;
      if (!userId) {
        console.error('❌ [UserApiService] No se pudo obtener el ID del usuario:', currentUser);
        return {
          success: false,
          message: 'No se pudo identificar al usuario'
        };
      }

      console.log('🔄 [UserApiService] ID del usuario:', userId);
      console.log('🔄 [UserApiService] Usuario actual:', currentUser);

      // Detectar si el usuario es cliente
      const userRole = currentUser.rol?.nombre || currentUser.role || currentUser.rol || '';
      const userRoleId = currentUser.rol?.id || currentUser.id_rol || currentUser.idRol;
      const userRoleLower = (userRole || '').toLowerCase().trim();
      const isClient = userRoleId === 1 || userRoleId === '1' || userRoleLower === 'cliente' || userRoleLower === 'client';

      console.log('🔍 [UserApiService] Rol del usuario:', userRole, 'ID:', userRoleId, 'Es cliente:', isClient);

      // Preparar datos para enviar al backend
      const requestData = {};
      
      // Solo incluir campos que tienen valor y que el backend acepta
      if (profileData.nombre) requestData.nombre = profileData.nombre;
      if (profileData.apellido) requestData.apellido = profileData.apellido;
      if (profileData.correo) requestData.correo = profileData.correo;
      if (profileData.telefono !== undefined) {
        // Permitir null para limpiar el teléfono
        requestData.telefono = profileData.telefono === null || profileData.telefono === '' ? null : profileData.telefono;
      }
      if (profileData.tipoDocumento) requestData.tipo_documento = profileData.tipoDocumento;
      if (profileData.documento) requestData.documento = profileData.documento;
      // Nota: La contraseña no se puede actualizar a través del endpoint de cliente
      // Solo se puede actualizar a través del endpoint de usuarios
      if (!isClient && profileData.contrasena && profileData.contrasena.trim()) {
        requestData.contrasena = profileData.contrasena;
      }

      console.log('📤 [UserApiService] Datos a enviar al backend:', requestData);

      let response;
      
      // Si es cliente, usar el endpoint de gestión de clientes
      if (isClient) {
        console.log('👤 [UserApiService] Usuario es cliente, usando endpoint de gestión de clientes');
        
        // Obtener el ID del cliente asociado al usuario
        let clienteId = currentUser.id_cliente || currentUser.idCliente;
        
        // Si no tenemos el id_cliente, buscarlo
        if (!clienteId) {
          console.log('🔍 [UserApiService] No se encontró id_cliente, buscando cliente asociado...');
          try {
            const clientes = await clientesApiService.getAllClientes();
            const clienteAsociado = clientes.find(c => c.id_usuario === userId || c.id === userId);
            
            if (clienteAsociado) {
              clienteId = clienteAsociado.id_cliente || clienteAsociado.id;
              console.log('✅ [UserApiService] Cliente encontrado con ID:', clienteId);
            } else {
              console.error('❌ [UserApiService] No se encontró cliente asociado al usuario');
              return {
                success: false,
                message: 'No se encontró cliente asociado a tu usuario'
              };
            }
          } catch (error) {
            console.error('❌ [UserApiService] Error al buscar cliente:', error);
            return {
              success: false,
              message: 'Error al buscar cliente asociado: ' + error.message
            };
          }
        }
        
        console.log('📤 [UserApiService] Actualizando usuario del cliente con ID:', clienteId);
        console.log('📤 [UserApiService] Endpoint:', API_CONFIG.ENDPOINTS.CLIENT_UPDATE_USUARIO(clienteId));
        
        // Usar el endpoint específico para actualizar usuario del cliente
        response = await apiService.put(API_CONFIG.ENDPOINTS.CLIENT_UPDATE_USUARIO(clienteId), requestData);
      } else {
        // Si no es cliente, usar el endpoint normal de usuarios
        console.log('👤 [UserApiService] Usuario no es cliente, usando endpoint de usuarios');
        console.log('📤 [UserApiService] Endpoint:', API_CONFIG.ENDPOINTS.USER_BY_ID(userId));
        
        response = await apiService.put(API_CONFIG.ENDPOINTS.USER_BY_ID(userId), requestData);
      }
      
      console.log('📥 [UserApiService] Respuesta del backend:', response);

      if (response.success || response.mensaje) {
        // Actualizar datos del usuario en localStorage
        // La estructura de respuesta es diferente según el endpoint usado
        let updatedUser;
        
        if (isClient) {
          // Para clientes, la respuesta viene en response.data.cliente.usuario
          updatedUser = response.data?.cliente?.usuario || response.data?.usuario || response.usuario || response.data;
        } else {
          // Para usuarios normales, la respuesta viene en response.data.usuario
          updatedUser = response.data?.usuario || response.usuario || response.data;
        }
        
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
          // Preservar id_cliente si existe
          if (!updatedUser.id_cliente && currentUser.id_cliente) {
            updatedUser.id_cliente = currentUser.id_cliente;
          }
        }
        
        // Si no hay usuario en la respuesta, crear uno basado en el usuario actual y los datos actualizados
        if (!updatedUser && currentUser) {
          updatedUser = {
            ...currentUser,
            nombre: profileData.nombre || currentUser.nombre,
            apellido: profileData.apellido || currentUser.apellido,
            correo: profileData.correo || currentUser.correo,
            telefono: profileData.telefono || currentUser.telefono,
            tipo_documento: profileData.tipoDocumento || currentUser.tipo_documento,
            documento: profileData.documento || currentUser.documento
          };
        }
        
        console.log('✅ [UserApiService] Usuario actualizado:', updatedUser);
        console.log('✅ [UserApiService] Rol del usuario:', updatedUser?.rol || updatedUser?.role);
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        return {
          success: true,
          user: updatedUser,
          message: response.mensaje || response.message || 'Perfil actualizado correctamente'
        };
      } else {
        return {
          success: false,
          message: response.error || 'Error al actualizar perfil'
        };
      }
    } catch (error) {
      console.error('❌ [UserApiService] Error al actualizar perfil:', error);
      console.error('❌ [UserApiService] Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || error.response?.data?.mensaje || 'Datos inválidos. Verifica que todos los campos sean correctos.';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para actualizar perfil. Tu sesión puede haber expirado.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para actualizar este perfil';
      } else if (error.message) {
        errorMessage = error.message;
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
