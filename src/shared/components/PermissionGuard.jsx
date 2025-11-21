/**
 * Componente para proteger rutas y acciones basado en permisos granular
 * Implementa el sistema de permisos granular del backend (Enero 2026)
 */

import { usePermissions } from '../hooks/usePermissions.js';

/**
 * Componente que renderiza children solo si el usuario tiene el permiso requerido
 * 
 * @param {Object} props
 * @param {string} props.modulo - Nombre del módulo requerido
 * @param {string} props.accion - Acción requerida
 * @param {Array} props.anyPermission - Array de { modulo, accion } - requiere al menos uno
 * @param {Array} props.allPermissions - Array de { modulo, accion } - requiere todos
 * @param {boolean} props.requireAdmin - Si es true, solo administradores pueden acceder
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene permiso
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si NO tiene permiso (opcional)
 * @param {boolean} props.showFallback - Si es false, no renderiza nada si no tiene permiso
 * @returns {React.ReactNode}
 */
export const PermissionGuard = ({
  modulo,
  accion,
  anyPermission,
  allPermissions,
  requireAdmin = false,
  children,
  fallback = null,
  showFallback = true
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, loading } = usePermissions();

  // Mostrar loading mientras se cargan los permisos
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando permisos...</p>
        </div>
      </div>
    );
  }

  // ✅ SIEMPRE verificar primero si es administrador (tienen acceso total)
  // Los administradores tienen acceso a todo, independientemente de los permisos específicos
  if (isAdmin()) {
    return children;
  }

  // Si requiere específicamente admin y no es admin, denegar acceso
  if (requireAdmin) {
    return showFallback ? fallback : null;
  }

  // Verificar permiso específico
  if (modulo && accion) {
    if (hasPermission(modulo, accion)) {
      return children;
    }
    return showFallback ? fallback : null;
  }

  // Verificar si tiene al menos uno de los permisos
  if (anyPermission && Array.isArray(anyPermission)) {
    if (hasAnyPermission(anyPermission)) {
      return children;
    }
    return showFallback ? fallback : null;
  }

  // Verificar si tiene todos los permisos
  if (allPermissions && Array.isArray(allPermissions)) {
    if (hasAllPermissions(allPermissions)) {
      return children;
    }
    return showFallback ? fallback : null;
  }

  // Si no se especifica ningún permiso, permitir acceso
  // (útil para casos donde solo se quiere verificar autenticación)
  return children;
};

/**
 * Hook de orden superior para proteger componentes
 * @param {React.Component} Component - Componente a proteger
 * @param {Object} permissionConfig - Configuración de permisos
 * @returns {React.Component} - Componente protegido
 */
export const withPermission = (Component, permissionConfig) => {
  return (props) => {
    return (
      <PermissionGuard {...permissionConfig}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
};

/**
 * Componente para mostrar mensaje de acceso denegado
 */
export const AccessDenied = ({ message = "No tienes permisos para acceder a esta sección." }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
        <div className="text-red-600 text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
        <p className="text-red-600">{message}</p>
        <p className="text-sm text-gray-600 mt-4">
          Si crees que esto es un error, contacta al administrador.
        </p>
      </div>
    </div>
  );
};

export default PermissionGuard;

