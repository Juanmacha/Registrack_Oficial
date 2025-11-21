/**
 * Componente wrapper que combina verificación de roles básicos con permisos granular
 * Mantiene compatibilidad con AdminRoute y EmployeeRoute, pero agrega verificación de permisos
 */

import { PermissionGuard, AccessDenied } from './PermissionGuard.jsx';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext.jsx';

/**
 * Componente que protege rutas con verificación de permisos granular
 * 
 * @param {Object} props
 * @param {string} props.modulo - Nombre del módulo requerido (ej: 'gestion_usuarios')
 * @param {string} props.accion - Acción requerida (ej: 'leer', 'crear', 'editar', 'eliminar')
 * @param {boolean} props.requireAuth - Si es true, requiere autenticación (default: true)
 * @param {boolean} props.requireAdmin - Si es true, solo administradores pueden acceder
 * @param {boolean} props.requireEmployee - Si es true, requiere admin o empleado
 * @param {React.ReactNode} props.children - Contenido a renderizar
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene permiso
 */
export const ProtectedRoute = ({
  modulo,
  accion = 'leer',
  requireAuth = true,
  requireAdmin = false,
  requireEmployee = false,
  children,
  fallback = <AccessDenied />
}) => {
  const { isAuthenticated } = useAuth();

  // Verificar autenticación primero
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere admin o empleado, usar PermissionGuard con requireAdmin
  if (requireAdmin || requireEmployee) {
    return (
      <PermissionGuard
        modulo={modulo}
        accion={accion}
        requireAdmin={requireAdmin}
        fallback={fallback}
      >
        {children}
      </PermissionGuard>
    );
  }

  // Si solo requiere permiso específico
  if (modulo && accion) {
    return (
      <PermissionGuard
        modulo={modulo}
        accion={accion}
        fallback={fallback}
      >
        {children}
      </PermissionGuard>
    );
  }

  // Si no se especifica permiso, solo verificar autenticación
  return children;
};

export default ProtectedRoute;

