/**
 * Utilidades de autenticación para servicios (no componentes)
 * 
 * Estas funciones pueden usarse en servicios que NO son componentes React
 * y por lo tanto NO pueden usar hooks como useAuth.
 * 
 * @module authHelpers
 */

/**
 * Obtiene el token de autenticación desde localStorage
 * Compatible con múltiples claves para compatibilidad
 * 
 * @returns {string|null} Token de autenticación o null si no existe
 * 
 * @example
 * const token = getAuthToken();
 * if (token) {
 *   // Usar token en petición
 * }
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || 
         localStorage.getItem('token') || 
         null;
};

/**
 * Obtiene el usuario desde localStorage
 * 
 * @returns {object|null} Usuario almacenado o null si no existe
 * 
 * @example
 * const user = getAuthUser();
 * if (user) {
 *   const userId = user.id_usuario || user.id;
 * }
 */
export const getAuthUser = () => {
  try {
    const userStr = localStorage.getItem('user') || 
                    localStorage.getItem('authUser');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('❌ [authHelpers] Error parseando usuario:', error);
    return null;
  }
};

/**
 * Obtiene el rol del usuario desde localStorage
 * 
 * @returns {string|null} Rol del usuario o null si no existe
 * 
 * @example
 * const role = getAuthUserRole();
 * if (role === 'administrador') {
 *   // ...
 * }
 */
export const getAuthUserRole = () => {
  const user = getAuthUser();
  if (!user) return null;
  return user.rol || user.role || null;
};

/**
 * Obtiene el ID del usuario desde localStorage
 * 
 * @returns {number|string|null} ID del usuario o null si no existe
 * 
 * @example
 * const userId = getAuthUserId();
 * if (userId) {
 *   // Usar userId en petición
 * }
 */
export const getAuthUserId = () => {
  const user = getAuthUser();
  if (!user) return null;
  return user.id_usuario || user.id || null;
};

/**
 * Verifica si hay un token de autenticación válido
 * 
 * @returns {boolean} True si existe un token
 * 
 * @example
 * if (isAuthenticated()) {
 *   // Usuario está autenticado
 * }
 */
export const isAuthenticated = () => {
  return getAuthToken() !== null;
};

export default {
  getAuthToken,
  getAuthUser,
  getAuthUserRole,
  getAuthUserId,
  isAuthenticated
};

