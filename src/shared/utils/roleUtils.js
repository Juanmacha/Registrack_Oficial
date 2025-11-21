/**
 * Utilidades para identificar tipos de roles
 * Determina si un rol es administrativo (acceso al dashboard) o cliente (acceso a landing)
 */

/**
 * Normaliza el nombre del rol a formato estándar
 * @param {string|object} role - Rol del usuario (string o objeto)
 * @returns {string} Rol normalizado en minúsculas
 */
export const normalizeRole = (role) => {
  if (!role) return '';
  
  let roleName = '';
  
  // Si es un objeto, extraer el nombre
  if (typeof role === 'object' && role !== null) {
    roleName = role.nombre || role.name || role.role || '';
  } else {
    roleName = String(role);
  }
  
  // Normalizar a minúsculas
  return roleName.toLowerCase().trim();
};

/**
 * Obtiene el rol del usuario en formato normalizado
 * @param {Object} user - Objeto del usuario
 * @returns {string} Rol normalizado
 */
export const getUserRole = (user) => {
  if (!user || !user.rol) {
    return '';
  }
  
  return normalizeRole(user.rol || user.role);
};

/**
 * Verifica si un rol tiene permisos administrativos
 * Un rol es administrativo si tiene al menos uno de estos permisos:
 * - dashboard.leer
 * - Cualquier permiso de gestión (usuarios, empleados, roles, etc.)
 * 
 * @param {Object} rol - Objeto del rol con permisos
 * @returns {boolean} - true si es un rol administrativo
 */
export const esRolAdministrativo = (rol) => {
  if (!rol || !rol.permisos) {
    return false;
  }

  const permisos = rol.permisos;

  // Si tiene permiso de dashboard, es administrativo
  if (permisos.dashboard && permisos.dashboard.leer === true) {
    return true;
  }

  // Si tiene cualquier permiso de gestión administrativa, es administrativo
  const modulosAdministrativos = [
    'usuarios',
    'empleados',
    'roles',
    'permisos',
    'privilegios',
    'solicitudes',
    'citas',
    'seguimiento',
    'clientes',
    'pagos',
    'servicios',
    'empresas',
    'archivos',
    'tipo_archivos',
    'solicitud_cita',
    'detalles_orden',
    'detalles_procesos',
    'servicios_procesos'
  ];

  // Verificar si tiene al menos un permiso activo en algún módulo administrativo
  for (const modulo of modulosAdministrativos) {
    if (permisos[modulo]) {
      const moduloPermisos = permisos[modulo];
      // Si tiene al menos una acción activa (crear, leer, actualizar, eliminar)
      if (
        moduloPermisos.crear === true ||
        moduloPermisos.leer === true ||
        moduloPermisos.actualizar === true ||
        moduloPermisos.eliminar === true
      ) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Verifica si un usuario tiene un rol administrativo
 * @param {Object} user - Objeto del usuario
 * @returns {boolean} - true si el usuario tiene un rol administrativo
 */
export const tieneRolAdministrativo = (user) => {
  if (!user) {
    console.log('⚠️ [tieneRolAdministrativo] Usuario no proporcionado');
    return false;
  }

  console.log('🔍 [tieneRolAdministrativo] Verificando usuario:', user);
  console.log('🔍 [tieneRolAdministrativo] user.rol:', user.rol);

  // Verificar por ID de rol primero (más confiable)
  const roleId = user.rol?.id || user.id_rol || user.idRol || user.rol?.id_rol;
  console.log('🔍 [tieneRolAdministrativo] RoleId:', roleId);
  
  // Según el backend: 1=Cliente, 2=Administrador, 3=Empleado
  // Solo IDs 2 y 3 son administrativos
  if (roleId !== undefined && roleId !== null) {
    const idNum = Number(roleId);
    // Verificar si es administrador (ID 2) o empleado (ID 3)
    if (idNum === 2 || idNum === 3) {
      console.log('✅ [tieneRolAdministrativo] Rol administrativo detectado por ID:', idNum);
      return true;
    }
    // ID 1 es cliente, no administrativo
    if (idNum === 1) {
      console.log('❌ [tieneRolAdministrativo] ID 1 = Cliente (no administrativo)');
      return false;
    }
  }

  // Si el rol es un objeto con permisos, verificar
  if (typeof user.rol === 'object' && user.rol !== null && user.rol.permisos) {
    console.log('🔍 [tieneRolAdministrativo] Verificando por permisos...');
    const esAdmin = esRolAdministrativo(user.rol);
    if (esAdmin) {
      console.log('✅ [tieneRolAdministrativo] Rol administrativo detectado por permisos');
      return true;
    }
  }

  // Verificar por nombre del rol
  const roleName = typeof user.rol === 'string' 
    ? user.rol 
    : (user.rol?.nombre || user.rol?.name || user.role || '');

  const roleNameLower = roleName.toLowerCase().trim();
  console.log('🔍 [tieneRolAdministrativo] Nombre del rol:', roleNameLower);
  
  // Roles administrativos conocidos
  const esAdminPorNombre = roleNameLower === 'administrador' || 
         roleNameLower === 'admin' || 
         roleNameLower === 'empleado' || 
         roleNameLower === 'employee' ||
         roleNameLower === 'supervisor' ||
         roleNameLower === 'gerente' ||
         roleNameLower === 'manager';
  
  if (esAdminPorNombre) {
    console.log('✅ [tieneRolAdministrativo] Rol administrativo detectado por nombre:', roleNameLower);
    return true;
  }

  console.log('❌ [tieneRolAdministrativo] No es un rol administrativo');
  return false;
};

/**
 * Verifica si un usuario es cliente
 * @param {Object} user - Objeto del usuario
 * @returns {boolean} - true si el usuario es cliente
 */
export const isClient = (user) => {
  if (!user || !user.rol) {
    return false;
  }

  const roleName = typeof user.rol === 'string' 
    ? user.rol 
    : (user.rol?.nombre || user.rol?.name || '');

  const roleNameLower = roleName.toLowerCase();
  return roleNameLower === 'cliente' || roleNameLower === 'client';
};

/**
 * Verifica si un usuario es administrador
 * @param {Object} user - Objeto del usuario
 * @returns {boolean} - true si es administrador
 */
export const isAdmin = (user) => {
  if (!user || !user.rol) {
    return false;
  }

  // Verificar por ID de rol (1 = administrador)
  const roleId = user.rol?.id || user.id_rol || user.idRol;
  if (roleId === 1 || roleId === '1') {
    return true;
  }

  // Verificar por nombre
  const roleName = normalizeRole(user.rol || user.role);
  return roleName === 'administrador' || roleName === 'admin';
};

/**
 * Verifica si un usuario es empleado
 * @param {Object} user - Objeto del usuario
 * @returns {boolean} - true si es empleado
 */
export const isEmployee = (user) => {
  if (!user || !user.rol) {
    return false;
  }

  // Verificar por ID de rol (3 = empleado)
  const roleId = user.rol?.id || user.id_rol || user.idRol;
  if (roleId === 3 || roleId === '3') {
    return true;
  }

  // Verificar por nombre
  const roleName = normalizeRole(user.rol || user.role);
  return roleName === 'empleado' || roleName === 'employee';
};

/**
 * Verifica si un usuario es administrador o empleado
 * También verifica si tiene permisos administrativos (para roles personalizados)
 * @param {Object} user - Objeto del usuario
 * @returns {boolean} - true si es admin, empleado o tiene permisos administrativos
 */
export const isAdminOrEmployee = (user) => {
  if (!user || !user.rol) {
    return false;
  }

  // Primero verificar si tiene permisos administrativos (para roles personalizados)
  // Esto permite que roles como "Supervisor" con permisos administrativos puedan acceder
  if (tieneRolAdministrativo(user)) {
    console.log('✅ [isAdminOrEmployee] Usuario tiene permisos administrativos');
    return true;
  }

  // Verificar por ID de rol (roles estándar: 2=admin, 3=empleado según backend)
  const roleId = user.rol?.id || user.id_rol || user.idRol;
  if (roleId === 2 || roleId === '2' || roleId === 3 || roleId === '3') {
    console.log('✅ [isAdminOrEmployee] Usuario es admin o empleado por ID:', roleId);
    return true;
  }

  // Verificar por nombre
  const roleName = normalizeRole(user.rol || user.role);
  const esAdminPorNombre = roleName === 'administrador' || 
         roleName === 'admin' || 
         roleName === 'empleado' || 
         roleName === 'employee';
  
  if (esAdminPorNombre) {
    console.log('✅ [isAdminOrEmployee] Usuario es admin o empleado por nombre:', roleName);
    return true;
  }

  console.log('❌ [isAdminOrEmployee] Usuario no es admin ni empleado');
  return false;
};
