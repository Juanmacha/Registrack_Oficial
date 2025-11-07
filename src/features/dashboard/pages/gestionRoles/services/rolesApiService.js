import API_CONFIG from '../../../../../shared/config/apiConfig.js';

/**
 * Servicio API para gestión de roles, permisos y privilegios
 * Conecta el frontend con la API real de Registrack
 */
class RolesApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS;
  }

  /**
   * Obtener token de autenticación del localStorage
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Configurar headers para las peticiones
   */
  getHeaders() {
    return {
      ...API_CONFIG.DEFAULT_HEADERS,
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  /**
   * Manejar respuestas de la API
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Realizar petición HTTP
   */
  async makeRequest(url, options = {}) {
    const config = {
      method: 'GET',
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error en petición API:', error);
      throw error;
    }
  }

  // ============================================================================
  // GESTIÓN DE ROLES
  // ============================================================================

  /**
   * Obtener todos los roles
   */
  async getAllRoles() {
    console.log('📤 [RolesApiService] Obteniendo todos los roles...');
    const url = `${this.baseUrl}${this.endpoints.ROLES}`;
    
    try {
      const response = await this.makeRequest(url);
      console.log('✅ [RolesApiService] Roles obtenidos:', response);
      
      // Transformar datos de la API al formato del frontend
      const transformedRoles = this.transformRolesFromAPI(response.data || response);
      console.log('🔄 [RolesApiService] Roles transformados:', transformedRoles);
      
      return transformedRoles;
    } catch (error) {
      console.error('❌ [RolesApiService] Error obteniendo roles:', error);
      throw error;
    }
  }

  /**
   * Obtener rol por ID
   */
  async getRoleById(id) {
    console.log(`📤 [RolesApiService] Obteniendo rol con ID: ${id}`);
    const url = `${this.baseUrl}${this.endpoints.ROLE_BY_ID(id)}`;
    
    try {
      const response = await this.makeRequest(url);
      console.log('✅ [RolesApiService] Rol obtenido:', response);
      
      return this.transformRoleFromAPI(response);
    } catch (error) {
      console.error('❌ [RolesApiService] Error obteniendo rol:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo rol
   */
  async createRole(roleData) {
    console.log('📤 [RolesApiService] Creando nuevo rol:', roleData);
    const url = `${this.baseUrl}${this.endpoints.ROLES}`;
    
    // Transformar datos del frontend al formato de la API
    const apiData = this.transformRoleToAPI(roleData);
    console.log('🔄 [RolesApiService] Datos transformados para API:', apiData);
    
    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(apiData)
      });
      console.log('✅ [RolesApiService] Rol creado:', response);
      
      return this.transformRoleFromAPI(response);
    } catch (error) {
      console.error('❌ [RolesApiService] Error creando rol:', error);
      throw error;
    }
  }

  /**
   * Actualizar rol
   */
  async updateRole(id, roleData) {
    console.log(`📤 [RolesApiService] ===== ACTUALIZANDO ROL ${id} =====`);
    console.log(`📤 [RolesApiService] Datos recibidos del componente:`, JSON.stringify(roleData, null, 2));
    const url = `${this.baseUrl}${this.endpoints.ROLE_BY_ID(id)}`;
    console.log(`📤 [RolesApiService] URL de la API:`, url);
    
    // Transformar datos del frontend al formato de la API
    const apiData = this.transformRoleToAPI(roleData);
    console.log('🔄 [RolesApiService] Datos transformados para API:', JSON.stringify(apiData, null, 2));
    console.log('🔄 [RolesApiService] JSON stringificado:', JSON.stringify(apiData));
    
    try {
      const response = await this.makeRequest(url, {
        method: 'PUT',
        body: JSON.stringify(apiData)
      });
      console.log('✅ [RolesApiService] Respuesta completa de la API:', JSON.stringify(response, null, 2));
      
      // La respuesta puede venir como { success: true, data: {...} } o directamente el objeto
      const roleDataResponse = response.data || response;
      console.log('🔄 [RolesApiService] Datos extraídos de la respuesta:', JSON.stringify(roleDataResponse, null, 2));
      
      const transformedRole = this.transformRoleFromAPI(roleDataResponse);
      
      console.log('✅ [RolesApiService] Rol transformado para frontend:', JSON.stringify(transformedRole, null, 2));
      console.log(`✅ [RolesApiService] ===== ACTUALIZACIÓN COMPLETADA =====`);
      return transformedRole;
    } catch (error) {
      console.error('❌ [RolesApiService] ===== ERROR EN ACTUALIZACIÓN =====');
      console.error('❌ [RolesApiService] Error completo:', error);
      console.error('❌ [RolesApiService] Mensaje:', error.message);
      console.error('❌ [RolesApiService] Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Cambiar estado del rol
   */
  async changeRoleState(id, estado) {
    console.log(`📤 [RolesApiService] Cambiando estado del rol ${id} a: ${estado}`);
    const url = `${this.baseUrl}${this.endpoints.ROLE_STATE(id)}`;
    
    try {
      const response = await this.makeRequest(url, {
        method: 'PATCH',
        body: JSON.stringify({ estado })
      });
      console.log('✅ [RolesApiService] Estado del rol cambiado:', response);
      
      return this.transformRoleFromAPI(response);
    } catch (error) {
      console.error('❌ [RolesApiService] Error cambiando estado del rol:', error);
      throw error;
    }
  }

  /**
   * Eliminar rol
   */
  async deleteRole(id) {
    console.log(`📤 [RolesApiService] Eliminando rol con ID: ${id}`);
    const url = `${this.baseUrl}${this.endpoints.ROLE_BY_ID(id)}`;
    
    try {
      const response = await this.makeRequest(url, {
        method: 'DELETE'
      });
      console.log('✅ [RolesApiService] Rol eliminado:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [RolesApiService] Error eliminando rol:', error);
      throw error;
    }
  }

  // ============================================================================
  // GESTIÓN DE PERMISOS
  // ============================================================================

  /**
   * Obtener todos los permisos
   */
  async getAllPermissions() {
    console.log('📤 [RolesApiService] Obteniendo todos los permisos...');
    const url = `${this.baseUrl}${this.endpoints.PERMISSIONS}`;
    
    try {
      const response = await this.makeRequest(url);
      console.log('✅ [RolesApiService] Permisos obtenidos:', response);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ [RolesApiService] Error obteniendo permisos:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo permiso
   */
  async createPermission(permissionData) {
    console.log('📤 [RolesApiService] Creando nuevo permiso:', permissionData);
    const url = `${this.baseUrl}${this.endpoints.PERMISSIONS}`;
    
    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(permissionData)
      });
      console.log('✅ [RolesApiService] Permiso creado:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [RolesApiService] Error creando permiso:', error);
      throw error;
    }
  }

  // ============================================================================
  // GESTIÓN DE PRIVILEGIOS
  // ============================================================================

  /**
   * Obtener todos los privilegios
   */
  async getAllPrivileges() {
    console.log('📤 [RolesApiService] Obteniendo todos los privilegios...');
    const url = `${this.baseUrl}${this.endpoints.PRIVILEGES}`;
    
    try {
      const response = await this.makeRequest(url);
      console.log('✅ [RolesApiService] Privilegios obtenidos:', response);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ [RolesApiService] Error obteniendo privilegios:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo privilegio
   */
  async createPrivilege(privilegeData) {
    console.log('📤 [RolesApiService] Creando nuevo privilegio:', privilegeData);
    const url = `${this.baseUrl}${this.endpoints.PRIVILEGES}`;
    
    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(privilegeData)
      });
      console.log('✅ [RolesApiService] Privilegio creado:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [RolesApiService] Error creando privilegio:', error);
      throw error;
    }
  }

  // ============================================================================
  // TRANSFORMACIONES DE DATOS
  // ============================================================================

  /**
   * Transformar datos de la API al formato del frontend
   * NOTA: El backend ahora devuelve el formato granular directamente
   */
  transformRoleFromAPI(apiRole) {
    // Normalizar estado desde la API
    let estadoNormalizado = apiRole.estado;
    if (typeof estadoNormalizado === 'boolean') {
      estadoNormalizado = estadoNormalizado ? 'Activo' : 'Inactivo';
    } else if (typeof estadoNormalizado === 'string') {
      // Mantener el formato original pero capitalizar primera letra
      estadoNormalizado = estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1).toLowerCase();
    }

    return {
      id: apiRole.id?.toString() || apiRole.id_rol?.toString(),
      nombre: apiRole.nombre,
      estado: estadoNormalizado || 'Activo',
      permisos: this.transformPermissionsFromAPI(apiRole.permisos || {})
    };
  }

  /**
   * Transformar array de roles de la API al formato del frontend
   */
  transformRolesFromAPI(apiRoles) {
    if (!Array.isArray(apiRoles)) {
      return [];
    }
    
    return apiRoles.map(role => this.transformRoleFromAPI(role));
  }

  /**
   * Transformar datos del frontend al formato de la API
   * NOTA: El backend ahora acepta el formato granular directamente
   */
  transformRoleToAPI(frontendRole) {
    console.log('🔄 [RolesApiService] transformRoleToAPI - Entrada:', JSON.stringify(frontendRole, null, 2));

    const apiData = {};

    // Incluir nombre si se proporciona
    if (frontendRole.nombre !== undefined && frontendRole.nombre !== null && frontendRole.nombre.trim() !== '') {
      apiData.nombre = frontendRole.nombre.trim();
      console.log('✅ [RolesApiService] Nombre incluido:', apiData.nombre);
    } else {
      console.log('⚠️ [RolesApiService] Nombre no proporcionado o vacío');
    }

    // Incluir estado si se proporciona (opcional según el backend)
    if (frontendRole.estado !== undefined && frontendRole.estado !== null) {
      // Normalizar estado: acepta "Activo", "activo", "Inactivo", "inactivo", true, false
      const estado = frontendRole.estado;
      if (typeof estado === 'string') {
        apiData.estado = estado.toLowerCase() === 'activo' ? true : false;
      } else if (typeof estado === 'boolean') {
        apiData.estado = estado;
      } else {
        apiData.estado = estado === 1 || estado === '1' || estado === 'Activo' || estado === 'activo';
      }
      console.log('✅ [RolesApiService] Estado incluido:', apiData.estado, '(desde:', estado, ')');
    } else {
      console.log('⚠️ [RolesApiService] Estado no proporcionado');
    }

    // Incluir permisos si se proporcionan
    if (frontendRole.permisos !== undefined && frontendRole.permisos !== null) {
      apiData.permisos = frontendRole.permisos;
      console.log('✅ [RolesApiService] Permisos incluidos:', Object.keys(apiData.permisos).length, 'módulos');
      console.log('📋 [RolesApiService] Detalle de permisos:', JSON.stringify(apiData.permisos, null, 2));
    } else {
      console.log('⚠️ [RolesApiService] Permisos no proporcionados');
    }

    console.log('🔄 [RolesApiService] transformRoleToAPI - Salida:', JSON.stringify(apiData, null, 2));
    return apiData;
  }

  /**
   * Transformar permisos de la API al formato del frontend
   * NOTA: El backend ahora devuelve el formato granular directamente
   */
  transformPermissionsFromAPI(apiPermissions) {
    console.log('🔄 [RolesApiService] transformPermissionsFromAPI - Entrada:', JSON.stringify(apiPermissions, null, 2));
    
    // El backend ahora devuelve el formato granular directamente
    if (typeof apiPermissions === 'object' && apiPermissions !== null && !Array.isArray(apiPermissions)) {
      // Asegurar que solo se incluyan los módulos con al menos un permiso activo
      // O incluir todos los módulos pero solo con los valores que vienen del backend
      const permisosNormalizados = {};
      
      // Si vienen permisos en formato granular, asegurarse de que solo tengan los valores correctos
      Object.keys(apiPermissions).forEach(modulo => {
        const moduloPermisos = apiPermissions[modulo];
        if (moduloPermisos && typeof moduloPermisos === 'object') {
          // Solo incluir el módulo si tiene estructura válida
          permisosNormalizados[modulo] = {
            crear: moduloPermisos.crear === true,
            leer: moduloPermisos.leer === true,
            actualizar: moduloPermisos.actualizar === true,
            eliminar: moduloPermisos.eliminar === true
          };
        }
      });
      
      console.log('✅ [RolesApiService] Permisos normalizados:', Object.keys(permisosNormalizados).length, 'módulos');
      console.log('📋 [RolesApiService] Detalle normalizado:', JSON.stringify(permisosNormalizados, null, 2));
      
      return permisosNormalizados;
    }
    
    // Fallback para casos donde no viene en formato granular
    console.log('⚠️ [RolesApiService] Permisos no vienen en formato granular, retornando objeto vacío');
    return {};
  }

  /**
   * Transformar permisos del frontend al formato de la API
   * NOTA: Ya no es necesario transformar, el backend ahora acepta el formato granular directamente
   */
  transformPermissionsToAPI(frontendPermissions) {
    // El backend ahora acepta el formato granular directamente
    return frontendPermissions;
  }

  /**
   * Transformar privilegios del frontend al formato de la API
   * NOTA: Ya no es necesario, el backend maneja los privilegios internamente
   */
  transformPrivilegesToAPI(frontendPermissions) {
    // El backend ahora maneja los privilegios internamente basado en los permisos
    return [];
  }

  /**
   * Capitalizar primera letra
   */
  capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

// Crear instancia única del servicio
const rolesApiService = new RolesApiService();

export default rolesApiService;
