/**
 * Hook simplificado para verificar un permiso específico
 * Facilita la verificación de permisos en componentes
 * 
 * @param {string} modulo - Nombre del módulo (ej: 'gestion_usuarios', 'usuarios')
 * @param {string} accion - Acción a verificar (ej: 'crear', 'leer', 'editar', 'eliminar')
 * @returns {boolean} - true si tiene el permiso, false si no
 * 
 * @example
 * const puedeCrear = usePermiso('gestion_usuarios', 'crear');
 * const puedeEditar = usePermiso('usuarios', 'editar');
 */
import { usePermissions } from './usePermissions.js';

export const usePermiso = (modulo, accion) => {
  const { hasPermission, loading } = usePermissions();
  
  // Si está cargando, retornar false para evitar mostrar botones antes de verificar
  if (loading) {
    return false;
  }
  
  // Normalizar el módulo: si viene sin 'gestion_', agregarlo
  const moduloNormalizado = modulo.startsWith('gestion_') 
    ? modulo 
    : `gestion_${modulo}`;
  
  return hasPermission(moduloNormalizado, accion);
};

export default usePermiso;

