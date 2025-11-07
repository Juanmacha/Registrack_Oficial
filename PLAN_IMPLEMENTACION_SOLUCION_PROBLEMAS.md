# 🚀 PLAN DE IMPLEMENTACIÓN - SOLUCIÓN DE PROBLEMAS ESTRUCTURALES

**Fecha de creación**: 28 de Octubre de 2025  
**Versión**: 1.0  
**Alcance**: Solución completa de todos los problemas estructurales identificados

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Fase 1: Seguridad y Protección de Rutas](#fase-1-seguridad-y-protección-de-rutas)
3. [Fase 2: Unificación de Sistemas](#fase-2-unificación-de-sistemas)
4. [Fase 3: Estandarización de Modales](#fase-3-estandarización-de-modales)
5. [Fase 4: Filtrado de Sidebar por Roles](#fase-4-filtrado-de-sidebar-por-roles)
6. [Fase 5: Limpieza y Optimización](#fase-5-limpieza-y-optimización)
7. [Validación y Testing](#validación-y-testing)
8. [Checklist Final](#checklist-final)

---

## 🎯 RESUMEN EJECUTIVO

### **OBJETIVO:**
Solución completa de todos los problemas estructurales identificados en el análisis, priorizando seguridad y consistencia.

### **ALCANCE:**
- ✅ Crear `ClientRoute` component
- ✅ Implementar protección anidada para rutas admin
- ✅ Proteger rutas públicas vulnerables
- ✅ Unificar sistemas de autenticación
- ✅ Estandarizar todos los modales
- ✅ Filtrar sidebar por roles
- ✅ Limpiar código duplicado

### **TIEMPO ESTIMADO:**
- **Fase 1**: 1-2 días (CRÍTICA)
- **Fase 2**: 2-3 días (MEDIA)
- **Fase 3**: 3-4 días (MEDIA)
- **Fase 4**: 1 día (BAJA)
- **Fase 5**: 1 día (BAJA)
- **Total**: 8-11 días

---

## 🔐 FASE 1: SEGURIDAD Y PROTECCIÓN DE RUTAS

**Prioridad**: 🔴 **CRÍTICA**  
**Tiempo estimado**: 1-2 días

### **OBJETIVO:**
Implementar protección de rutas por roles y crear el componente `ClientRoute`.

---

### **PASO 1.1: Crear Utilidad para Normalización de Roles**

**Archivo a crear**: `src/shared/utils/roleUtils.js`

```javascript
/**
 * Utilidad para normalizar y verificar roles de usuarios
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
 * Verifica si el usuario tiene un rol específico
 * @param {object} user - Usuario actual
 * @param {string|array} requiredRoles - Rol(es) requerido(s)
 * @returns {boolean} True si el usuario tiene el rol requerido
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
 */
export const isAdmin = (user) => {
  return hasRole(user, ['administrador', 'admin']);
};

/**
 * Verifica si el usuario es empleado
 * @param {object} user - Usuario actual
 * @returns {boolean} True si es empleado
 */
export const isEmployee = (user) => {
  return hasRole(user, ['empleado', 'employee']);
};

/**
 * Verifica si el usuario es cliente
 * @param {object} user - Usuario actual
 * @returns {boolean} True si es cliente
 */
export const isClient = (user) => {
  return hasRole(user, ['cliente', 'client']);
};

/**
 * Verifica si el usuario es admin o empleado
 * @param {object} user - Usuario actual
 * @returns {boolean} True si es admin o empleado
 */
export const isAdminOrEmployee = (user) => {
  return isAdmin(user) || isEmployee(user);
};

export default {
  normalizeRole,
  hasRole,
  isAdmin,
  isEmployee,
  isClient,
  isAdminOrEmployee
};
```

**✅ Validación**: 
- [ ] Archivo creado
- [ ] Funciones exportadas correctamente
- [ ] Pruebas unitarias pasando

---

### **PASO 1.2: Crear ClientRoute Component**

**Archivo a crear**: `src/features/auth/components/clientRoute.jsx`

```jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isClient } from "../../../shared/utils/roleUtils";

/**
 * Componente para proteger rutas que solo pueden acceder clientes
 * Redirige a login si no está autenticado
 * Redirige a landing si no es cliente
 */
const ClientRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('🔍 [ClientRoute] Verificando acceso:', { 
    isAuthenticated: isAuthenticated(), 
    user: user,
    userRole: user?.rol || user?.role 
  });

  // Verificar autenticación
  if (!isAuthenticated()) {
    console.log('❌ [ClientRoute] Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de cliente
  if (!user || !isClient(user)) {
    console.log('❌ [ClientRoute] Usuario no es cliente, redirigiendo a landing');
    return <Navigate to="/" replace />;
  }

  console.log('✅ [ClientRoute] Acceso permitido');
  return children;
};

export default ClientRoute;
```

**✅ Validación**: 
- [ ] Archivo creado
- [ ] Importa `useAuth` correctamente
- [ ] Usa `roleUtils` para verificación
- [ ] Redirige correctamente según el caso

---

### **PASO 1.3: Actualizar AdminRoute para usar useAuth**

**Archivo a modificar**: `src/features/auth/components/adminRoute.jsx`

**Código actual**:
```jsx
import React from "react";
import { Navigate } from "react-router-dom";
import authData from "../services/authData";

const AdminRoute = ({ children }) => {
  const isAuthenticated = authData.isAuthenticated();
  const user = authData.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== "Administrador") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
```

**Código actualizado**:
```jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdmin } from "../../../shared/utils/roleUtils";

/**
 * Componente para proteger rutas que solo pueden acceder administradores
 * Redirige a login si no está autenticado
 * Redirige a landing si no es administrador
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('🔍 [AdminRoute] Verificando acceso:', { 
    isAuthenticated: isAuthenticated(), 
    user: user,
    userRole: user?.rol || user?.role 
  });

  // Verificar autenticación
  if (!isAuthenticated()) {
    console.log('❌ [AdminRoute] Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de administrador
  if (!user || !isAdmin(user)) {
    console.log('❌ [AdminRoute] Usuario no es administrador, redirigiendo a landing');
    return <Navigate to="/" replace />;
  }

  console.log('✅ [AdminRoute] Acceso permitido');
  return children;
};

export default AdminRoute;
```

**✅ Validación**: 
- [ ] Migrado a `useAuth`
- [ ] Usa `roleUtils` para verificación
- [ ] Mantiene misma funcionalidad
- [ ] Logs de debugging agregados

---

### **PASO 1.4: Actualizar EmployeeRoute para usar roleUtils**

**Archivo a modificar**: `src/features/auth/components/employeeRoute.jsx`

**Código actual**:
```jsx
// ... código con lógica manual de roles ...
if (!user || (roleName !== "administrador" && roleName !== "Administrador" 
           && roleName !== "empleado" && roleName !== "Empleado")) {
  return <Navigate to="/" replace />;
}
```

**Código actualizado**:
```jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdminOrEmployee } from "../../../shared/utils/roleUtils";

/**
 * Componente para proteger rutas que pueden acceder administradores y empleados
 * Redirige a login si no está autenticado
 * Redirige a landing si no es admin o empleado
 */
const EmployeeRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('🔍 [EmployeeRoute] Verificando acceso:', { 
    isAuthenticated: isAuthenticated(), 
    user: user,
    userRole: user?.rol || user?.role 
  });

  // Verificar autenticación
  if (!isAuthenticated()) {
    console.log('❌ [EmployeeRoute] Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Verificar rol de admin o empleado
  if (!user || !isAdminOrEmployee(user)) {
    console.log('❌ [EmployeeRoute] Usuario sin permisos, redirigiendo a landing');
    return <Navigate to="/" replace />;
  }

  console.log('✅ [EmployeeRoute] Acceso permitido');
  return children;
};

export default EmployeeRoute;
```

**✅ Validación**: 
- [ ] Código simplificado
- [ ] Usa `roleUtils` para verificación
- [ ] Mantiene misma funcionalidad
- [ ] Logs de debugging mejorados

---

### **PASO 1.5: Reestructurar Rutas con Protección Anidada**

**Archivo a modificar**: `src/routes/routes.jsx`

**Código actual**:
```jsx
{/* Rutas protegidas para admin y empleados con layout común */}
<Route
  path="/admin"
  element={
    <EmployeeRoute>
      <AdminLayout />
    </EmployeeRoute>
  }
>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="gestionUsuarios" element={<GestionUsuarios />} />  {/* ❌ Solo admin */}
  <Route path="roles" element={<Roles />} />  {/* ❌ Solo admin */}
  <Route path="empleados" element={<Empleados />} />  {/* ❌ Solo admin */}
  {/* ... más rutas ... */}
</Route>

<Route path="/misprocesos" element={<MisProcesos/>}/>  {/* ❌ Pública */}
<Route path="/profile" element={<Profile />} />  {/* ❌ Pública */}
<Route path='/editProfile' element={<EditarProfile/>}/>  {/* ❌ Pública */}
```

**Código actualizado**:
```jsx
import ClientRoute from '../features/auth/components/clientRoute';

// ... otros imports ...

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/api-test" element={<ApiTest />} />
      
      {/* Páginas individuales de servicios */}
      <Route path="/pages/cesion-marca" element={<Cesion />} />
      <Route path="/pages/presentacion-oposicion" element={<Oposicion />} />
      <Route path="/pages/renovacion" element={<Renovacion />} />
      <Route path="/pages/busqueda" element={<Busqueda />} />
      <Route path="/pages/certificacion" element={<Certificacion />} />
      <Route path="/pages/ampliacion" element={<Ampliacion />} />
      <Route path="/ayuda" element={<Ayuda />} />

      {/* Layout para autenticación */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/codigoRecuperacion" element={<CodigoRecuperacion />} />
      </Route>

      {/* ✅ RUTAS PROTEGIDAS PARA CLIENTES */}
      <Route
        path="/cliente"
        element={
          <ClientRoute>
            <div className="min-h-screen bg-gray-50">
              <Outlet />
            </div>
          </ClientRoute>
        }
      >
        <Route path="misprocesos" element={<MisProcesos />} />
        <Route path="profile" element={<Profile />} />
        <Route path="editProfile" element={<EditarProfile />} />
      </Route>

      {/* ✅ RUTAS PROTEGIDAS PARA ADMIN Y EMPLEADOS */}
      <Route
        path="/admin"
        element={
          <EmployeeRoute>
            <AdminLayout />
          </EmployeeRoute>
        }
      >
        {/* ✅ Rutas accesibles para admin Y empleado */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="ventasServiciosProceso" element={<GestionVentasServiciosProceso />} />
        <Route path="ventasServiciosFin" element={<GestionVentasServiciosFin />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="gestionClientes" element={<GestionClientes />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="solicitudesCitas" element={<SolicitudesCitas />} />
        <Route path="solicitudesCitas-api" element={<SolicitudesCitasApi />} />

        {/* ✅ Rutas SOLO para administradores (anidadas) */}
        <Route element={<AdminRoute><Outlet /></AdminRoute>}>
          <Route path="gestionUsuarios" element={<GestionUsuarios />} />
          <Route path="roles" element={<Roles />} />
          <Route path="empleados" element={<Empleados />} />
        </Route>
      </Route>

      {/* ✅ Redirecciones para compatibilidad */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/misprocesos" element={<Navigate to="/cliente/misprocesos" replace />} />
      <Route path="/profile" element={<Navigate to="/cliente/profile" replace />} />
      <Route path="/editProfile" element={<Navigate to="/cliente/editProfile" replace />} />

      {/* Formularios anidados bajo un layout base */}
      <Route path="/formulario" element={<FormularioBase />}>
        <Route path="cesion" element={<FormularioNuevoPropietario />} />
        <Route path="busqueda" element={<FormularioBusqueda />} />
        <Route path="ampliacion" element={<FormularioAmpliacion />} />
        <Route path="renovacion" element={<FormularioRenovacion />} />
        <Route path="certificacion" element={<FormularioCertificacion />} />
        <Route path="oposicion" element={<FormularioOposicion />} />
        <Route path="respuesta" element={<FormularioRespuestaOposicion />} />
      </Route>

      <Route path="/crear-solicitud/:servicioId" element={<CrearSolicitudPage />} />

      {/* Rutas de prueba para sincronización */}
      <Route path="/test-sync" element={<TestSincronizacion />} />
      <Route path="/test-simple" element={<TestSimple />} />
      <Route path="/test-api" element={<TestApiConnection />} />
      <Route path="/test-forgot-password" element={<TestForgotPassword />} />
      <Route path="/test-auth" element={<TestAuthIntegration />} />
      <Route path="/test-connection" element={<TestConnection />} />
      <Route path="/test-auth-state" element={<TestAuthState />} />

      {/* Redirecciones para compatibilidad con URLs antiguas */}
      <Route path="/pages/cesionMarca" element={<Navigate to="/pages/cesion-marca" replace />} />
      <Route path="/pages/presentacionOposicion" element={<Navigate to="/pages/presentacion-oposicion" replace />} />

      {/* Ruta catch-all para URLs no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
```

**✅ Validación**: 
- [ ] `ClientRoute` importado
- [ ] Rutas de cliente protegidas
- [ ] Rutas de admin con protección anidada
- [ ] Redirecciones de compatibilidad funcionando

---

### **PASO 1.6: Actualizar Navegación para Nuevas Rutas**

**Archivos a modificar**:
- `src/features/dashboard/components/sideBarGeneral.jsx` (se actualizará en Fase 4)
- Cualquier componente que use `/misprocesos`, `/profile`, `/editProfile`

**Buscar y reemplazar**:
```jsx
// ❌ ANTES:
<Link to="/misprocesos">Mis Procesos</Link>
<Link to="/profile">Perfil</Link>
<Link to="/editProfile">Editar Perfil</Link>

// ✅ DESPUÉS:
<Link to="/cliente/misprocesos">Mis Procesos</Link>
<Link to="/cliente/profile">Perfil</Link>
<Link to="/cliente/editProfile">Editar Perfil</Link>
```

**✅ Validación**: 
- [ ] Todos los enlaces actualizados
- [ ] Navegación funcionando correctamente

---

## 🔄 FASE 2: UNIFICACIÓN DE SISTEMAS

**Prioridad**: 🟡 **MEDIA**  
**Tiempo estimado**: 2-3 días

### **OBJETIVO:**
Unificar todos los sistemas de autenticación en un solo sistema (`useAuth` context).

---

### **PASO 2.1: Auditoría de Uso de authData**

**Archivos a revisar**:
- Buscar todos los usos de `authData` en el proyecto

**Comando de búsqueda**:
```bash
grep -r "authData" src/
```

**Archivos afectados potencialmente**:
- `src/features/auth/services/authData.js`
- `src/features/auth/pages/login.jsx`
- `src/features/auth/pages/register.jsx`
- `src/features/auth/pages/profile.jsx`
- Cualquier otro archivo que importe `authData`

**✅ Validación**: 
- [ ] Lista completa de archivos que usan `authData`
- [ ] Documentado para migración

---

### **PASO 2.2: Migrar Componentes a useAuth**

**Estrategia**:
1. Migrar componente por componente
2. Probar después de cada migración
3. Marcar `authData` como deprecated después de migrar todo

**Ejemplo de migración**:

**ANTES** (usando `authData`):
```jsx
import authData from "../services/authData";

const MyComponent = () => {
  const isAuthenticated = authData.isAuthenticated();
  const user = authData.getUser();
  
  // ...
};
```

**DESPUÉS** (usando `useAuth`):
```jsx
import { useAuth } from "../../shared/contexts/authContext";

const MyComponent = () => {
  const { isAuthenticated, user } = useAuth();
  
  // ...
};
```

**✅ Validación**: 
- [ ] Todos los componentes migrados
- [ ] Funcionalidad mantenida
- [ ] Pruebas pasando

---

### **PASO 2.3: Marcar authData como Deprecated**

**Archivo a modificar**: `src/features/auth/services/authData.js`

**Agregar al inicio del archivo**:
```javascript
/**
 * @deprecated Este servicio está deprecado. Usa useAuth context en su lugar.
 * 
 * Este archivo se mantiene solo para compatibilidad temporal.
 * Se eliminará en la versión 2.0.0
 * 
 * Migración:
 * - ANTES: import authData from "../services/authData";
 *          const user = authData.getUser();
 * 
 * - DESPUÉS: import { useAuth } from "../../shared/contexts/authContext";
 *            const { user } = useAuth();
 */
```

**✅ Validación**: 
- [ ] Documentación de deprecación agregada
- [ ] Instrucciones de migración claras

---

### **PASO 2.4: Consolidar Servicios de Auth**

**Archivos a revisar**:
- `src/features/auth/services/authService.js`
- `src/features/auth/services/authServiceUpdated.js`
- `src/features/auth/services/authData.js`

**Decisión**: Elegir UN servicio como principal y deprecar los demás.

**Recomendación**: 
- **Principal**: `authServiceUpdated.js` (si es más moderno)
- **Deprecar**: `authService.js` y `authData.js`

**✅ Validación**: 
- [ ] Servicio principal identificado
- [ ] Servicios deprecados marcados
- [ ] Documentación de migración creada

---

## 🎨 FASE 3: ESTANDARIZACIÓN DE MODALES

**Prioridad**: 🟡 **MEDIA**  
**Tiempo estimado**: 3-4 días

### **OBJETIVO:**
Crear componente base `BaseModal` y migrar todos los modales existentes.

---

### **PASO 3.1: Crear Utilidad para Badges de Estado**

**Archivo a crear**: `src/shared/utils/badgeUtils.js`

```javascript
/**
 * Utilidad para generar badges de estado consistentes
 */

/**
 * Obtiene los colores para un badge de rol
 * @param {string} role - Rol del usuario
 * @returns {object} Objeto con clases CSS para el badge
 */
export const getRoleBadgeColors = (role) => {
  const roleLower = (role || '').toLowerCase();
  
  switch (roleLower) {
    case 'administrador':
    case 'admin':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      };
    case 'empleado':
    case 'employee':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      };
    case 'cliente':
    case 'client':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      };
  }
};

/**
 * Obtiene los colores para un badge de estado
 * @param {string} estado - Estado (activo/inactivo, etc.)
 * @returns {object} Objeto con clases CSS para el badge
 */
export const getEstadoBadgeColors = (estado) => {
  const estadoLower = (estado || '').toLowerCase();
  
  if (estadoLower === 'activo' || estadoLower === 'active') {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    };
  }
  
  if (estadoLower === 'inactivo' || estadoLower === 'inactive') {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    };
  }
  
  // Estados específicos de solicitudes
  if (estadoLower.includes('finalizado') || estadoLower.includes('finalized')) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    };
  }
  
  if (estadoLower.includes('anulado') || estadoLower.includes('cancelled')) {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    };
  }
  
  if (estadoLower.includes('pendiente') || estadoLower.includes('pending')) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    };
  }
  
  // Por defecto
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  };
};

/**
 * Genera un badge de rol
 * @param {string} role - Rol del usuario
 * @param {object} options - Opciones adicionales (size, icon, etc.)
 * @returns {JSX.Element} Badge de rol
 */
export const RoleBadge = ({ role, options = {} }) => {
  const colors = getRoleBadgeColors(role);
  const { size = 'sm', showIcon = false, className = '' } = options;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`
      inline-flex items-center space-x-2
      ${sizeClasses[size]}
      ${colors.bg} ${colors.text} ${colors.border}
      border rounded-full font-semibold
      ${className}
    `}>
      {showIcon && (
        <i className="bi bi-shield-check"></i>
      )}
      <span>{role || 'Usuario'}</span>
    </span>
  );
};

/**
 * Genera un badge de estado
 * @param {string} estado - Estado
 * @param {object} options - Opciones adicionales
 * @returns {JSX.Element} Badge de estado
 */
export const EstadoBadge = ({ estado, options = {} }) => {
  const colors = getEstadoBadgeColors(estado);
  const { size = 'sm', showIcon = false, className = '' } = options;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`
      inline-flex items-center space-x-2
      ${sizeClasses[size]}
      ${colors.bg} ${colors.text} ${colors.border}
      border rounded-full font-semibold
      ${className}
    `}>
      {showIcon && (
        <i className="bi bi-circle-fill text-xs"></i>
      )}
      <span>{estado || 'N/A'}</span>
    </span>
  );
};

export default {
  getRoleBadgeColors,
  getEstadoBadgeColors,
  RoleBadge,
  EstadoBadge
};
```

**✅ Validación**: 
- [ ] Archivo creado
- [ ] Funciones exportadas
- [ ] Badges consistentes

---

### **PASO 3.2: Crear BaseModal Component**

**Archivo a crear**: `src/shared/components/BaseModal.jsx`

```jsx
import React from 'react';
import { X } from 'lucide-react';

/**
 * Componente base para todos los modales del sistema
 * Proporciona estructura consistente: backdrop, header, contenido, footer
 * 
 * @param {boolean} isOpen - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título del modal
 * @param {string} headerGradient - Color del gradiente del header ('blue', 'green', 'purple', etc.)
 * @param {React.ReactNode} children - Contenido del modal
 * @param {array} footerActions - Array de acciones para el footer [{label, onClick, variant}]
 * @param {string} maxWidth - Ancho máximo del modal ('sm', 'md', 'lg', 'xl', '2xl', '4xl', '6xl')
 * @param {boolean} showCloseButton - Mostrar botón de cerrar en header
 */
const BaseModal = ({
  isOpen,
  onClose,
  title = '',
  headerGradient = 'blue',
  children,
  footerActions = [],
  maxWidth = '4xl',
  showCloseButton = true,
  headerIcon = null
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Colores del gradiente según el tipo
  const gradientColors = {
    blue: 'from-[#275FAA] to-[#163366]',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    red: 'from-red-600 to-red-800',
    gray: 'from-gray-600 to-gray-800'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  };

  const buttonVariants = {
    primary: 'bg-[#275FAA] text-white hover:bg-[#163366]',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all p-4"
      onClick={handleBackdropClick}
    >
      <div className={`
        bg-white rounded-2xl shadow-2xl w-full ${maxWidthClasses[maxWidth]}
        p-0 overflow-y-auto max-h-[90vh] relative border border-gray-200
        animate-in fade-in zoom-in duration-200
      `}>
        {/* Header con gradiente */}
        {title && (
          <div className={`
            sticky top-0 z-20 bg-gradient-to-r ${gradientColors[headerGradient] || gradientColors.blue}
            px-6 py-4 rounded-t-2xl shadow-sm
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {headerIcon && (
                  <div className="bg-white bg-opacity-20 p-2 rounded-full">
                    {headerIcon}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer con acciones */}
        {footerActions.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
            {footerActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  px-6 py-3 rounded-lg font-semibold
                  transition-all duration-200 shadow-lg hover:shadow-xl
                  transform hover:-translate-y-1
                  ${buttonVariants[action.variant || 'secondary']}
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
```

**✅ Validación**: 
- [ ] Archivo creado
- [ ] Props documentadas
- [ ] Estilos consistentes
- [ ] Funcionalidad completa

---

### **PASO 3.3: Migrar ProfileModal a BaseModal**

**Archivo a modificar**: `src/shared/components/ProfileModal.jsx`

**Estrategia**: Mantener ProfileModal como está (ya es el estándar), pero documentar que otros modales deben seguir su patrón.

**✅ Validación**: 
- [ ] ProfileModal sigue siendo el estándar de referencia

---

### **PASO 3.4: Migrar ModalVerDetalleServicio**

**Archivo a modificar**: `src/features/dashboard/pages/gestionVentasServicios/components/ModalVerDetalleServicio.jsx`

**Ejemplo de migración**:

```jsx
import React from 'react';
import BaseModal from '../../../../../shared/components/BaseModal';

const ModalVerDetalleServicio = ({ servicio, isOpen, onClose }) => {
  if (!isOpen || !servicio) return null;

  // ... lógica existente ...

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="VER DETALLE"
      headerGradient="blue"
      maxWidth="6xl"
      footerActions={[
        { label: 'Cerrar', onClick: onClose, variant: 'secondary' }
      ]}
      headerIcon={<i className="bi bi-eye text-white text-2xl"></i>}
    >
      {/* Contenido existente adaptado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* ... contenido ... */}
      </div>
    </BaseModal>
  );
};

export default ModalVerDetalleServicio;
```

**✅ Validación**: 
- [ ] Migrado a BaseModal
- [ ] Funcionalidad mantenida
- [ ] Estilos consistentes

---

### **PASO 3.5: Migrar Resto de Modales**

**Archivos a migrar**:
1. `verDetalleVenta.jsx`
2. `verDetalleCliente.jsx`
3. `verEmpleado.jsx`
4. `verDetalleUsuario.jsx`
5. `verRol.jsx`

**Estrategia**: Migrar uno por uno, siguiendo el mismo patrón.

**✅ Validación**: 
- [ ] Todos los modales migrados
- [ ] Estilos consistentes
- [ ] Funcionalidad mantenida

---

## 📋 FASE 4: FILTRADO DE SIDEBAR POR ROLES

**Prioridad**: 🟡 **MEDIA**  
**Tiempo estimado**: 1 día

### **OBJETIVO:**
Filtrar las opciones del sidebar según el rol del usuario.

---

### **PASO 4.1: Crear Función de Filtrado de Menu Items**

**Archivo a modificar**: `src/features/dashboard/components/sideBarGeneral.jsx`

**Agregar función de filtrado**:

```jsx
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdmin } from "../../../shared/utils/roleUtils";

const SideBarGeneral = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { setIsSidebarExpanded } = useSidebar();

  // ... código existente ...

  // ✅ Función para obtener items del menú según el rol
  const getMenuItemsForRole = (role) => {
    const allItems = [
      { label: "Dashboard", icon: TbLayoutGrid, to: "/admin/dashboard", roles: ['admin', 'empleado'] },
      { label: "Configuración", icon: TbSettings, to: "/admin/roles", roles: ['admin'] },
      { label: "Usuarios", icon: TbUser, to: "/admin/gestionUsuarios", roles: ['admin'] },
      { label: "Servicios", icon: TbBox, to: "/admin/servicios", roles: ['admin', 'empleado'] },
      { label: "Empleados", icon: TbUsers, to: "/admin/empleados", roles: ['admin'] },
      { label: "Clientes", icon: TbUserSquareRounded, to: "/admin/gestionClientes", roles: ['admin', 'empleado'] },
      { label: "Pagos", icon: TbCreditCard, to: "/admin/pagos", roles: ['admin', 'empleado'] },
      { label: "Citas", icon: TbCalendar, to: "/admin/calendario", roles: ['admin', 'empleado'] },
    ];

    // Filtrar items según el rol
    if (!user) return [];
    
    const userRole = (user.rol || user.role || '').toLowerCase();
    
    return allItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => role === userRole || 
        (userRole === 'administrador' && role === 'admin'));
    });
  };

  const menuItems = getMenuItemsForRole(user);

  // ... resto del código ...
};
```

**✅ Validación**: 
- [ ] Función de filtrado creada
- [ ] Items filtrados correctamente
- [ ] UI se actualiza según el rol

---

### **PASO 4.2: Actualizar Dropdown de Solicitudes**

**Agregar lógica para filtrar también el dropdown de solicitudes**:

```jsx
// Dropdown: Solicitudes - Solo admin y empleado
const solicitudesItems = [
  { label: "En Proceso", to: "/admin/ventasServiciosProceso", roles: ['admin', 'empleado'] },
  { label: "Finalizadas", to: "/admin/ventasServiciosFin", roles: ['admin', 'empleado'] },
];

// Filtrar según rol
const filteredSolicitudesItems = solicitudesItems.filter(item => {
  if (!item.roles) return true;
  const userRole = (user?.rol || user?.role || '').toLowerCase();
  return item.roles.some(role => role === userRole || 
    (userRole === 'administrador' && role === 'admin'));
});
```

**✅ Validación**: 
- [ ] Dropdown filtrado correctamente
- [ ] Funcionalidad mantenida

---

## 🧹 FASE 5: LIMPIEZA Y OPTIMIZACIÓN

**Prioridad**: 🟢 **BAJA**  
**Tiempo estimado**: 1 día

### **OBJETIVO:**
Limpiar código duplicado, mover archivos de prueba y consolidar servicios.

---

### **PASO 5.1: Mover Componentes de Prueba**

**Archivos a mover**:
- `src/components/TestApiConnection.jsx` → `src/__tests__/components/TestApiConnection.jsx`
- `src/components/TestAuthIntegration.jsx` → `src/__tests__/components/TestAuthIntegration.jsx`
- `src/components/TestForgotPassword.jsx` → `src/__tests__/components/TestForgotPassword.jsx`
- `src/components/TestSimple.jsx` → `src/__tests__/components/TestSimple.jsx`
- `src/components/TestSincronizacion.jsx` → `src/__tests__/components/TestSincronizacion.jsx`
- `src/components/TestConnection.jsx` → `src/__tests__/components/TestConnection.jsx`
- `src/components/TestAuthState.jsx` → `src/__tests__/components/TestAuthState.jsx`

**Actualizar rutas en `routes.jsx`** (si es necesario mantenerlas):

```jsx
{/* Rutas de prueba - Solo en desarrollo */}
{process.env.NODE_ENV === 'development' && (
  <>
    <Route path="/test-sync" element={<TestSincronizacion />} />
    <Route path="/test-simple" element={<TestSimple />} />
    {/* ... más rutas de prueba ... */}
  </>
)}
```

**✅ Validación**: 
- [ ] Archivos movidos
- [ ] Rutas actualizadas
- [ ] Imports corregidos

---

### **PASO 5.2: Eliminar Código Duplicado**

**Archivos a revisar**:
- Buscar funciones duplicadas
- Consolidar utilidades similares

**Ejemplo**:
```bash
# Buscar funciones duplicadas de badges
grep -r "getEstadoBadge" src/
```

**✅ Validación**: 
- [ ] Código duplicado identificado
- [ ] Funciones consolidadas
- [ ] Referencias actualizadas

---

### **PASO 5.3: Actualizar Documentación**

**Archivos a crear/actualizar**:
1. `README.md` - Actualizar con nuevas rutas y estructura
2. `CHANGELOG.md` - Documentar cambios
3. `MIGRATION_GUIDE.md` - Guía de migración para desarrolladores

**✅ Validación**: 
- [ ] Documentación actualizada
- [ ] Ejemplos claros
- [ ] Guías de migración completas

---

## ✅ VALIDACIÓN Y TESTING

### **CHECKLIST DE VALIDACIÓN POR FASE**

#### **FASE 1 - Seguridad**
- [ ] `roleUtils.js` creado y funcionando
- [ ] `ClientRoute` creado y funcionando
- [ ] `AdminRoute` migrado a `useAuth`
- [ ] `EmployeeRoute` actualizado con `roleUtils`
- [ ] Rutas reestructuradas correctamente
- [ ] Protección anidada funcionando
- [ ] Redirecciones funcionando
- [ ] Clientes solo acceden a sus rutas
- [ ] Empleados solo acceden a sus rutas
- [ ] Admins acceden a todas las rutas

#### **FASE 2 - Unificación**
- [ ] Todos los componentes migrados a `useAuth`
- [ ] `authData` marcado como deprecated
- [ ] Servicios consolidados
- [ ] Sin errores de consola

#### **FASE 3 - Estandarización**
- [ ] `badgeUtils.js` creado
- [ ] `BaseModal.jsx` creado
- [ ] Todos los modales migrados
- [ ] Estilos consistentes
- [ ] Iconos unificados

#### **FASE 4 - Sidebar**
- [ ] Sidebar filtra por roles
- [ ] Items correctos según rol
- [ ] Dropdown filtrado

#### **FASE 5 - Limpieza**
- [ ] Componentes de prueba movidos
- [ ] Código duplicado eliminado
- [ ] Documentación actualizada

---

### **PRUEBAS MANUALES**

#### **Prueba de Roles:**

1. **Como Administrador:**
   - [ ] Puede acceder a `/admin/dashboard`
   - [ ] Puede acceder a `/admin/gestionUsuarios`
   - [ ] Puede acceder a `/admin/roles`
   - [ ] Puede acceder a `/admin/empleados`
   - [ ] Ve todas las opciones en el sidebar

2. **Como Empleado:**
   - [ ] Puede acceder a `/admin/dashboard`
   - [ ] NO puede acceder a `/admin/gestionUsuarios` (redirige)
   - [ ] NO puede acceder a `/admin/roles` (redirige)
   - [ ] NO puede acceder a `/admin/empleados` (redirige)
   - [ ] Ve solo opciones permitidas en el sidebar

3. **Como Cliente:**
   - [ ] Puede acceder a `/cliente/misprocesos`
   - [ ] Puede acceder a `/cliente/profile`
   - [ ] NO puede acceder a `/admin/dashboard` (redirige)
   - [ ] Redirección desde `/misprocesos` funciona

4. **Sin Autenticación:**
   - [ ] NO puede acceder a `/admin/*` (redirige a login)
   - [ ] NO puede acceder a `/cliente/*` (redirige a login)
   - [ ] Puede acceder a rutas públicas

---

### **PRUEBAS DE MODALES**

1. **Apertura/Cierre:**
   - [ ] Todos los modales se abren correctamente
   - [ ] Todos los modales se cierran con botón X
   - [ ] Todos los modales se cierran con backdrop click
   - [ ] Todos los modales se cierran con ESC (opcional)

2. **Estilos:**
   - [ ] Todos tienen mismo backdrop
   - [ ] Todos tienen mismo header style
   - [ ] Todos tienen mismo footer style
   - [ ] Responsive en móvil

---

## 📊 CHECKLIST FINAL

### **ANTES DE DESPLEGAR:**

- [ ] Todas las fases completadas
- [ ] Todas las pruebas pasando
- [ ] Documentación actualizada
- [ ] Sin errores de consola
- [ ] Sin warnings críticos
- [ ] Código revisado por otro desarrollador
- [ ] Backup de código anterior
- [ ] Plan de rollback preparado

### **POST-DESPLIEGUE:**

- [ ] Verificar en producción
- [ ] Monitorear errores
- [ ] Recopilar feedback de usuarios
- [ ] Documentar problemas encontrados

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

1. **Día 1-2**: Fase 1 (Seguridad) - CRÍTICA
2. **Día 3-5**: Fase 2 (Unificación) - MEDIA
3. **Día 6-9**: Fase 3 (Estandarización) - MEDIA
4. **Día 10**: Fase 4 (Sidebar) - BAJA
5. **Día 11**: Fase 5 (Limpieza) + Testing Final - BAJA

---

## 📝 NOTAS IMPORTANTES

### **⚠️ ADVERTENCIAS:**

1. **No saltar fases**: Cada fase depende de la anterior
2. **Testing continuo**: Probar después de cada cambio importante
3. **Backup**: Hacer backup antes de cambios críticos
4. **Comunicación**: Informar al equipo de cambios en rutas

### **✅ BUENAS PRÁCTICAS:**

1. **Commits frecuentes**: Commitar después de cada paso completado
2. **Mensajes claros**: Usar mensajes descriptivos en commits
3. **Pull Requests**: Crear PRs para revisión
4. **Documentación**: Actualizar documentación en paralelo

---

## 📞 SOPORTE

Si encuentras problemas durante la implementación:

1. Revisar logs de consola
2. Verificar que todas las dependencias estén instaladas
3. Revisar que los imports estén correctos
4. Verificar que los contextos estén configurados
5. Consultar la documentación del análisis estructural

---

**Documento creado por**: Claude AI  
**Fecha**: 28 de Octubre de 2025  
**Versión**: 1.0  
**Próxima revisión**: Después de Fase 1

