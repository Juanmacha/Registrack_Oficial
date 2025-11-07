/**
 * Utilidad para normalizar y verificar roles de usuarios
 * 
 * Este módulo proporciona funciones para trabajar con roles de usuarios
 * de manera consistente en toda la aplicación.
 * 
 * @module roleUtils
 */

/**
 * Normaliza el nombre del rol a formato estándar
 * @param {string|object} role - Rol del usuario (string o objeto)
 * @returns {string} Rol normalizado en minúsculas
 * 
 * @example
 * normalizeRole("Administrador") // "administrador"
 * normalizeRole({ nombre: "Empleado" }) // "empleado"
 * normalizeRole("CLIENTE") // "cliente"
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
  
  // Normalizar a minúsculas y eliminar espacios
  return roleName.toLowerCase().trim();
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {object} user - Usuario actual
 * @param {string|array} requiredRoles - Rol(es) requerido(s)
 * @returns {boolean} True si el usuario tiene el rol requerido
 * 
 * @example
 * hasRole(user, "administrador") // true o false
 * hasRole(user, ["administrador", "admin"]) // true si tiene cualquiera
 */
export const hasRole = (user, requiredRoles) => {
  if (!user) return false;
  
  const userRole = normalizeRole(user.rol || user.role);
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const normalizedRequiredRoles = roles.map(r => normalizeRole(r));
  
  return normalizedRequiredRoles.includes(userRole);
};

/**
 * Verifica si el usuario es administrador
 * @param {object} user - Usuario actual
 * @returns {boolean} True si es administrador
 * 
 * @example
 * isAdmin(user) // true o false
 */
export const isAdmin = (user) => {
  return hasRole(user, ['administrador', 'admin']);
};

/**
 * Verifica si el usuario es empleado
 * @param {object} user - Usuario actual
 * @returns {boolean} True si es empleado
 * 
 * @example
 * isEmployee(user) // true o false
 */
export const isEmployee = (user) => {
  return hasRole(user, ['empleado', 'employee']);
};

/**
 * Verifica si el usuario es cliente
 * @param {object} user - Usuario actual
 * @returns {boolean} True si es cliente
 * 
 * @example
 * isClient(user) // true o false
 */
export const isClient = (user) => {
  return hasRole(user, ['cliente', 'client']);
};

/**
 * Verifica si el usuario es admin o empleado
 * @param {object} user - Usuario actual
 * @returns {boolean} True si es admin o empleado
 * 
 * @example
 * isAdminOrEmployee(user) // true o false
 */
export const isAdminOrEmployee = (user) => {
  return isAdmin(user) || isEmployee(user);
};

/**
 * Obtiene el rol normalizado del usuario
 * @param {object} user - Usuario actual
 * @returns {string} Rol normalizado o cadena vacía
 * 
 * @example
 * getUserRole(user) // "administrador", "empleado", "cliente", ""
 */
export const getUserRole = (user) => {
  if (!user) return '';
  return normalizeRole(user.rol || user.role);
};

// Exportación por defecto con todas las funciones
export default {
  normalizeRole,
  hasRole,
  isAdmin,
  isEmployee,
  isClient,
  isAdminOrEmployee,
  getUserRole
};

