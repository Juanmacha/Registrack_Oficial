# 📋 Plan de Implementación: Mejora del Perfil de Cliente

## 🎯 Objetivo
Mejorar el diseño y funcionalidad del componente "Ver mi perfil" para clientes, alineándolo con el diseño del proyecto y corrigiendo bugs.

---

## 🔍 Problemas Identificados

### 1. **Diseño Inconsistente** ❌
- **Problema**: El diseño actual no coincide con el estilo del proyecto
- **Ubicación**: `src/features/auth/components/ProfileContent.jsx`
- **Evidencia**: 
  - Usa colores y estilos diferentes a los modales del proyecto
  - No sigue el patrón de diseño de `verDetalleCliente.jsx`
  - Falta estructura de secciones con iconos y colores consistentes

### 2. **Campo de Teléfono Innecesario** ❌
- **Problema**: El campo de teléfono aparece para clientes, pero los clientes no tienen ese campo en la base de datos
- **Ubicación**: Líneas 304-323 de `ProfileContent.jsx`
- **Evidencia**:
  - Validación requiere teléfono (líneas 69-73)
  - Campo se muestra siempre (líneas 304-323)
  - Se envía en la actualización (línea 118)

### 3. **Bug de Navegación Después de Editar** ❌
- **Problema**: Después de editar el perfil exitosamente, no se puede volver a entrar a "ver mi perfil"
- **Ubicación**: `ProfileContent.jsx` (handleSave) y `authContext.jsx` (updateUser)
- **Posibles causas**:
  - El estado del usuario no se actualiza correctamente después de editar
  - La navegación se bloquea por algún error silencioso
  - El token o la sesión se invalidan después de la actualización
  - El componente no se re-renderiza correctamente

### 4. **Bug de Redirección: Admin no puede ver su perfil** ❌
- **Problema**: Cuando un administrador hace clic en "Ver perfil", en lugar de mostrar su perfil, lo redirige al landing
- **Ubicación**: 
  - `src/features/dashboard/components/navBarGeneral.jsx` (línea 18)
  - `src/routes/routes.jsx` (línea 137)
  - `src/features/auth/components/clientRoute.jsx` (línea 47-51)
  - `src/features/landing/landing.jsx` (línea 14-19)
- **Flujo del problema**:
  1. Admin hace clic en "Ver perfil" → navega a `/profile`
  2. La ruta `/profile` redirige automáticamente a `/cliente/profile` (routes.jsx línea 137)
  3. `ClientRoute` verifica el rol y detecta que NO es cliente → redirige a `/` (landing)
  4. El componente `Landing` detecta que es admin → redirige a `/admin/dashboard`
  5. **Resultado**: Admin nunca puede ver su perfil, solo vuelve al dashboard
- **Causa raíz**:
  - No existe una ruta `/admin/profile` para administradores/empleados
  - La redirección `/profile` siempre va a `/cliente/profile`
  - `ClientRoute` bloquea el acceso a admin/empleado y los redirige al landing
  - `navBarGeneral.jsx` siempre navega a `/profile` sin importar el rol

---

## 📐 Diseño Actual vs Diseño Propuesto

### **Diseño Actual** ❌
```jsx
// Diseño simple con inputs básicos
<div className="bg-white rounded-2xl shadow-lg p-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <input className="bg-gray-50 border..." />
  </div>
</div>
```

### **Diseño Propuesto** ✅ (Basado en verDetalleCliente.jsx)
```jsx
// Diseño con secciones organizadas, iconos y colores consistentes
<div className="bg-white rounded-xl shadow border border-gray-200">
  {/* Header con icono */}
  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
    <div className="flex items-center space-x-3">
      <div className="bg-blue-100 p-2 rounded-full">
        <i className="bi bi-person text-blue-600 text-xl"></i>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">Mi Perfil</h2>
    </div>
  </div>
  
  {/* Secciones con colores */}
  <div className="p-6 space-y-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      {/* Campos de edición */}
    </div>
  </div>
</div>
```

---

## 🛠️ Plan de Implementación

### **Fase 1: Análisis y Preparación** (15 min)

#### 1.1 Verificar Estructura de Datos del Cliente
- [ ] Confirmar qué campos tiene el cliente en la base de datos
- [ ] Verificar si el campo `telefono` existe en la tabla `usuarios` para clientes
- [ ] Revisar la respuesta de la API al actualizar perfil

#### 1.2 Identificar el Bug de Navegación
- [ ] Revisar logs de consola después de editar
- [ ] Verificar si el token se mantiene después de actualizar
- [ ] Comprobar si el estado del usuario se actualiza en `authContext`
- [ ] Verificar si hay errores en la red (Network tab)

### **Fase 2: Corrección del Diseño** (45 min)

#### 2.1 Rediseñar el Componente ProfileContent
- [ ] Cambiar estructura para usar secciones con iconos
- [ ] Aplicar colores consistentes (azul para información personal)
- [ ] Usar el mismo patrón de diseño que `verDetalleCliente.jsx`
- [ ] Mejorar espaciado y tipografía
- [ ] Agregar iconos de Bootstrap Icons consistentes

#### 2.2 Mejorar Campos de Edición
- [ ] Cambiar inputs para que se vean más modernos
- [ ] Agregar iconos a cada campo
- [ ] Mejorar estados de focus y error
- [ ] Hacer el diseño responsive

#### 2.3 Mejorar Botones de Acción
- [ ] Usar botones con estilo consistente del proyecto
- [ ] Mejorar posicionamiento y espaciado
- [ ] Agregar iconos a los botones

### **Fase 3: Eliminar Campo de Teléfono** (15 min)

#### 3.1 Remover Campo de Teléfono para Clientes
- [ ] Eliminar campo de teléfono del formulario (solo para clientes)
- [ ] Remover validación de teléfono para clientes
- [ ] No enviar teléfono en la actualización para clientes
- [ ] Mantener teléfono para admin/empleado si lo necesitan

#### 3.2 Ajustar Layout
- [ ] Ajustar grid para que email ocupe todo el ancho en clientes
- [ ] O agregar otro campo relevante si es necesario

### **Fase 4: Corregir Bug de Navegación** (30 min)

#### 4.1 Investigar Causa del Bug
- [ ] Agregar logs detallados en `handleSave`
- [ ] Verificar qué devuelve `updateUser` después de editar
- [ ] Comprobar si `setUser` se ejecuta correctamente
- [ ] Verificar si hay errores en la actualización del contexto

#### 4.2 Soluciones Posibles
**Opción A: Problema en actualización del estado**
```javascript
// En handleSave, después de actualizar:
if (result.success) {
  // Forzar actualización del usuario en el contexto
  await updateUser(updatedData);
  // Recargar datos del usuario desde el servidor
  // O actualizar manualmente el estado
}
```

**Opción B: Problema en la navegación**
```javascript
// Después de guardar exitosamente:
if (result.success) {
  // No navegar, solo actualizar estado
  // El componente debería re-renderizarse automáticamente
}
```

**Opción C: Problema en el token/sesión**
```javascript
// Verificar que el token no se invalide
// Si se invalida, hacer refresh del token
```

#### 4.3 Implementar Solución
- [ ] Implementar la solución identificada
- [ ] Agregar manejo de errores mejorado
- [ ] Agregar feedback visual durante la actualización
- [ ] Probar que funciona correctamente

### **Fase 5: Corregir Bug de Redirección de Admin** (30 min)

#### 5.1 Crear Ruta para Admin/Empleado
- [ ] Agregar ruta `/admin/profile` en `routes.jsx`
- [ ] Colocar la ruta dentro de las rutas protegidas de `/admin` (dentro de `<EmployeeRoute>`)
- [ ] Usar el mismo componente `Profile` (ya maneja el layout según el rol)
- [ ] Verificar que la ruta esté accesible para admin y empleado

#### 5.2 Actualizar Navegación en navBarGeneral
- [ ] Importar `useAuth` y `isAdminOrEmployee` desde `roleUtils`
- [ ] Modificar `handleVerPerfil` para detectar el rol del usuario
- [ ] Si es admin/empleado, navegar a `/admin/profile`
- [ ] Si es cliente, navegar a `/cliente/profile`
- [ ] Agregar logs para debugging si es necesario

#### 5.3 Mejorar Redirección de `/profile`
- [ ] Crear componente `ProfileRedirect.jsx` que detecte el rol y redirija
- [ ] Reemplazar la redirección estática en `routes.jsx`
- [ ] Asegurar que admin/empleado van a `/admin/profile`
- [ ] Asegurar que cliente va a `/cliente/profile`
- [ ] Manejar caso de usuario no autenticado (redirigir a login)

#### 5.4 Verificar Profile.jsx
- [ ] Verificar que el componente `Profile` funciona correctamente para admin
- [ ] Verificar que detecta correctamente el rol y renderiza el layout adecuado
- [ ] Asegurar que no hay conflictos entre las dos rutas (`/admin/profile` y `/cliente/profile`)
- [ ] Probar que el componente se renderiza correctamente desde ambas rutas

### **Fase 6: Testing y Validación** (20 min)

#### 6.1 Pruebas Funcionales
- [ ] Probar editar perfil como cliente
- [ ] Probar editar perfil como administrador
- [ ] Probar editar perfil como empleado
- [ ] Verificar que no aparece campo de teléfono para clientes
- [ ] Verificar que se puede volver a entrar al perfil después de editar
- [ ] Probar cancelar edición
- [ ] Probar validaciones de campos

#### 6.2 Pruebas de Diseño
- [ ] Verificar que el diseño es consistente con el proyecto
- [ ] Probar en diferentes tamaños de pantalla
- [ ] Verificar que los colores y estilos son correctos
- [ ] Verificar que los iconos se muestran correctamente
- [ ] Verificar que el layout de admin se muestra correctamente

#### 6.3 Pruebas de Navegación
- [ ] Probar flujo completo cliente: Ver perfil → Editar → Guardar → Ver perfil
- [ ] Probar flujo completo admin: Ver perfil → Editar → Guardar → Ver perfil
- [ ] Verificar que admin puede acceder a su perfil desde el navbar
- [ ] Verificar que cliente puede acceder a su perfil desde el navbar
- [ ] Verificar que no hay errores en consola
- [ ] Verificar que el estado se mantiene correctamente
- [ ] Verificar que no hay redirecciones incorrectas

---

## 📝 Cambios Específicos a Realizar

### **1. routes.jsx - Agregar Ruta de Perfil para Admin**

```jsx
// ANTES: Solo existe ruta para cliente
<Route path="/cliente" element={<ClientRoute>...</ClientRoute>}>
  <Route path="profile" element={<Profile />} />
</Route>

// DESPUÉS: Agregar ruta para admin/empleado
<Route path="/admin" element={<EmployeeRoute><AdminLayout /></EmployeeRoute>}>
  <Route path="dashboard" element={<Dashboard />} />
  {/* ... otras rutas ... */}
  <Route path="profile" element={<Profile />} />  {/* ✅ NUEVA RUTA */}
</Route>

// Mejorar redirección de /profile
// ANTES: Siempre redirige a /cliente/profile
<Route path="/profile" element={<Navigate to="/cliente/profile" replace />} />

// DESPUÉS: Redirección inteligente basada en rol
<Route path="/profile" element={<ProfileRedirect />} />
```

### **2. navBarGeneral.jsx - Navegación Inteligente**

```jsx
// ANTES: Siempre navega a /profile
const handleVerPerfil = () => {
  setMenuAbierto(false);
  navigate("/profile");
};

// DESPUÉS: Navegar según el rol
const handleVerPerfil = () => {
  setMenuAbierto(false);
  const userRole = user?.rol?.nombre || user?.role || 'cliente';
  const isAdminOrEmployee = userRole === 'administrador' || userRole === 'empleado' || 
                            userRole === 'admin' || userRole === 'employee';
  
  if (isAdminOrEmployee) {
    navigate("/admin/profile");  // ✅ Navegar a perfil de admin
  } else {
    navigate("/cliente/profile");  // ✅ Navegar a perfil de cliente
  }
};
```

### **3. Crear Componente ProfileRedirect (Opcional pero Recomendado)**

```jsx
// src/features/auth/components/ProfileRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdminOrEmployee, isClient } from "../../../shared/utils/roleUtils";

const ProfileRedirect = () => {
  const { user, loading } = useAuth();
  
  // Esperar a que se cargue el usuario
  if (loading) {
    return null; // O un spinner de carga
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdminOrEmployee(user)) {
    return <Navigate to="/admin/profile" replace />;
  }
  
  if (isClient(user)) {
    return <Navigate to="/cliente/profile" replace />;
  }
  
  // Por defecto, redirigir a landing
  return <Navigate to="/" replace />;
};

export default ProfileRedirect;
```

**Nota**: Este componente es útil para mantener compatibilidad con URLs antiguas (`/profile`) y asegurar que siempre se redirija al perfil correcto según el rol.

### **4. Actualizar profile.jsx para manejar ambas rutas**

El componente `Profile` ya maneja correctamente el layout según el rol (líneas 44-73), así que solo necesitamos asegurar que funciona correctamente cuando se accede desde `/admin/profile`.

### **4. ProfileContent.jsx - Rediseño Completo**

#### Cambios en la estructura:
```jsx
// ANTES: Diseño simple
<div className="bg-white rounded-2xl shadow-lg p-8">
  <input className="bg-gray-50..." />
</div>

// DESPUÉS: Diseño con secciones
<div className="bg-white rounded-xl shadow border border-gray-200">
  {/* Header */}
  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
    <div className="flex items-center space-x-3">
      <div className="bg-blue-100 p-2 rounded-full">
        <i className="bi bi-person text-blue-600 text-xl"></i>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">Mi Perfil</h2>
    </div>
  </div>
  
  {/* Contenido */}
  <div className="p-6">
    <div className="space-y-6">
      {/* Sección de Información Personal */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <i className="bi bi-person text-blue-600 text-lg"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {/* Campos de edición aquí */}
        </div>
      </div>
    </div>
  </div>
</div>
```

#### Cambios en los campos:
```jsx
// ANTES: Input simple
<input 
  type="text" 
  name="firstName"
  className="bg-gray-50 border..."
/>

// DESPUÉS: Input con icono y mejor estilo
<div className="space-y-2">
  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
    <i className="bi bi-person text-blue-500"></i>
    <span>Nombre</span>
  </label>
  <input 
    type="text" 
    name="firstName"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
  />
</div>
```

### **2. Eliminar Campo de Teléfono para Clientes**

```jsx
// ANTES: Campo siempre visible
<div>
  <label>Teléfono</label>
  <input name="phone" />
</div>

// DESPUÉS: Solo mostrar para admin/empleado
{!isClient && (
  <div>
    <label>Teléfono</label>
    <input name="phone" />
  </div>
)}
```

### **3. Corregir Validación**

```jsx
// ANTES: Validación siempre requiere teléfono
if (!data.phone.trim()) {
  newErrors.phone = 'El teléfono es requerido';
}

// DESPUÉS: Solo validar teléfono si no es cliente
if (!isClient && !data.phone.trim()) {
  newErrors.phone = 'El teléfono es requerido';
}
```

### **4. Corregir Envío de Datos**

```jsx
// ANTES: Siempre envía teléfono
const updatedData = {
  nombre: formData.firstName,
  apellido: formData.lastName,
  correo: formData.email,
  telefono: formData.phone  // ❌ No debería enviarse para clientes
};

// DESPUÉS: Solo enviar teléfono si no es cliente
const updatedData = {
  nombre: formData.firstName,
  apellido: formData.lastName,
  correo: formData.email,
  ...(isClient ? {} : { telefono: formData.phone })  // ✅ Solo si no es cliente
};
```

### **5. Corregir Bug de Navegación**

```jsx
// En handleSave, después de actualizar exitosamente:
const handleSave = async () => {
  // ... validación ...
  
  try {
    const result = await updateUser(updatedData);
    
    if (result.success) {
      // ✅ Asegurar que el estado se actualiza
      setOriginalData(formData);
      setIsEditing(false);
      
      // ✅ Mostrar alerta
      await alertService.success(...);
      
      // ✅ Forzar re-render del componente
      // El useEffect debería actualizar automáticamente
      // Pero si no, podemos forzar una actualización
      
      // ✅ Verificar que el usuario se actualizó en el contexto
      // Si no, recargar desde el servidor
    }
  } catch (error) {
    // ... manejo de errores ...
  }
};
```

---

## 🎨 Paleta de Colores a Usar

Basado en el diseño del proyecto:

- **Header**: `bg-gray-50` con `border-gray-200`
- **Sección Principal**: `bg-blue-50` con `border-blue-200`
- **Iconos**: `text-blue-600` con fondo `bg-blue-100`
- **Inputs Focus**: `focus:ring-blue-500` y `focus:border-blue-500`
- **Botones**:
  - Editar: `bg-blue-600 hover:bg-blue-700`
  - Guardar: `bg-green-600 hover:bg-green-700`
  - Cancelar: `bg-gray-500 hover:bg-gray-600`

---

## 📋 Checklist de Implementación

### **Preparación**
- [ ] Revisar estructura de datos del cliente en la API
- [ ] Verificar campos disponibles para clientes
- [ ] Identificar causa exacta del bug de navegación

### **Diseño**
- [ ] Rediseñar header con icono y título
- [ ] Crear sección de "Información Personal" con estilo azul
- [ ] Mejorar inputs con iconos y mejor estilo
- [ ] Mejorar botones de acción
- [ ] Hacer diseño responsive

### **Funcionalidad**
- [ ] Eliminar campo de teléfono para clientes
- [ ] Ajustar validación para no requerir teléfono en clientes
- [ ] Ajustar envío de datos para no incluir teléfono en clientes
- [ ] Corregir bug de navegación después de editar

### **Testing**
- [ ] Probar editar perfil como cliente
- [ ] Verificar que no aparece teléfono
- [ ] Verificar que se puede volver a entrar después de editar
- [ ] Probar validaciones
- [ ] Probar en diferentes pantallas

---

## ⚠️ Consideraciones Importantes

1. **Compatibilidad con Admin/Empleado**: 
   - El campo de teléfono debe mantenerse para admin y empleado
   - Usar `isClient` para condicionar la visibilidad

2. **Actualización del Estado**:
   - Asegurar que `updateUser` en `authContext` actualiza correctamente el estado
   - Verificar que el componente se re-renderiza después de actualizar

3. **Manejo de Errores**:
   - Agregar manejo de errores robusto
   - Mostrar mensajes claros al usuario

4. **Responsive Design**:
   - Asegurar que el diseño funciona en móviles
   - Probar en diferentes tamaños de pantalla

---

## 🚀 Orden de Implementación Recomendado

1. **Primero**: Corregir bug de redirección de admin (crítico, bloquea funcionalidad)
2. **Segundo**: Eliminar campo de teléfono (más rápido, menos riesgo)
3. **Tercero**: Corregir bug de navegación después de editar (crítico para funcionalidad)
4. **Cuarto**: Rediseñar componente (mejora visual, menos crítico)

---

## 📊 Estimación de Tiempo

- **Fase 1 (Análisis)**: 15 minutos
- **Fase 2 (Diseño)**: 45 minutos
- **Fase 3 (Eliminar teléfono)**: 15 minutos
- **Fase 4 (Bug navegación)**: 30 minutos
- **Fase 5 (Bug redirección admin)**: 30 minutos
- **Fase 6 (Testing)**: 20 minutos

**Total estimado**: ~2.5 horas

---

## ✅ Criterios de Aceptación

1. ✅ El diseño es consistente con el resto del proyecto
2. ✅ No aparece campo de teléfono para clientes
3. ✅ Se puede editar el perfil y volver a entrar sin problemas
4. ✅ Las validaciones funcionan correctamente
5. ✅ El diseño es responsive
6. ✅ No hay errores en consola
7. ✅ El estado del usuario se actualiza correctamente
8. ✅ **Los administradores pueden ver su perfil correctamente** (nuevo)
9. ✅ **Los empleados pueden ver su perfil correctamente** (nuevo)
10. ✅ **La navegación desde el navbar funciona para todos los roles** (nuevo)
11. ✅ **No hay redirecciones incorrectas al landing** (nuevo)

---

**Fecha de creación**: 2025-01-09
**Prioridad**: Alta
**Estado**: Pendiente de aprobación

