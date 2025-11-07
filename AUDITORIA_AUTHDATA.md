# 📋 AUDITORÍA DE USO DE `authData`

**Fecha**: 28 de Octubre de 2025  
**Objetivo**: Identificar todos los archivos que usan `authData` para migrarlos a `useAuth`

---

## 📊 RESUMEN

**Total de archivos que usan `authData`**: 12 archivos  
**Total de referencias**: 41 líneas

---

## 📁 ARCHIVOS IDENTIFICADOS

### **🔴 CRÍTICOS (Deben migrarse)**

| # | Archivo | Métodos Usados | Prioridad | Estado |
|---|---------|----------------|-----------|--------|
| 1 | `tablaVentasFin.jsx` | `getToken()` | 🔴 Alta | Pendiente |
| 2 | `tablaVentasProceso.jsx` | `getToken()` | 🔴 Alta | Pendiente |
| 3 | `CrearSolicitud.jsx` | `getToken()`, `getUserRole()`, `getUserId()` | 🔴 Alta | Pendiente |
| 4 | `Servicios.jsx` | `getToken()` | 🟡 Media | Pendiente |
| 5 | `ventasService.js` | `getToken()` | 🔴 Alta | Pendiente |
| 6 | `procesosService.js` | `getToken()` | 🟡 Media | Pendiente |

### **🟡 IMPORTANTES (Deben migrarse)**

| # | Archivo | Métodos Usados | Prioridad | Estado |
|---|---------|----------------|-----------|--------|
| 7 | `landing.jsx` | `getUser()` | 🟡 Media | Pendiente |
| 8 | `hero.jsx` | `getUser()` | 🟡 Media | Pendiente |
| 9 | `MisProcesos.jsx` | `getUser()` | 🟡 Media | Pendiente |
| 10 | `CrearSolicitudPage.jsx` | `getUser()` | 🟡 Media | Pendiente |

### **🟢 BAJOS (Pueden dejarse o migrar después)**

| # | Archivo | Métodos Usados | Prioridad | Estado |
|---|---------|----------------|-----------|--------|
| 11 | `authService.js` | `setToken()` | 🟢 Baja | ⚠️ Servicio interno |
| 12 | `TestSincronizacion.jsx` | Varios | 🟢 Baja | ⚠️ Componente de prueba |

---

## 🔍 DETALLE POR ARCHIVO

### **1. tablaVentasFin.jsx**
**Ubicación**: `src/features/dashboard/pages/gestionVentasServicios/components/`  
**Líneas**: 9, 40, 138  
**Uso**: `authData.getToken()`  
**Migración**: Usar `useAuth` → `getToken()` del contexto

---

### **2. tablaVentasProceso.jsx**
**Ubicación**: `src/features/dashboard/pages/gestionVentasServicios/components/`  
**Líneas**: 24, 53, 235, 789  
**Uso**: `authData.getToken()`  
**Migración**: Usar `useAuth` → `getToken()` del contexto

---

### **3. CrearSolicitud.jsx**
**Ubicación**: `src/features/dashboard/pages/gestionVentasServicios/components/`  
**Líneas**: 5, 200, 201, 234  
**Uso**: `authData.getToken()`, `authData.getUserRole()`, `authData.getUserId()`  
**Migración**: Usar `useAuth` → `getToken()`, `user.rol || user.role`, `user.id_usuario || user.id`

---

### **4. Servicios.jsx**
**Ubicación**: `src/features/dashboard/pages/gestionVentasServicios/components/`  
**Líneas**: 12, 83, 148  
**Uso**: `authData.getToken()`  
**Migración**: Usar `useAuth` → `getToken()` del contexto

---

### **5. ventasService.js**
**Ubicación**: `src/features/dashboard/pages/gestionVentasServicios/services/`  
**Líneas**: 9, 166, 193, 225  
**Uso**: `authData.getToken()`  
**Migración**: ⚠️ **PROBLEMA**: Servicio no es componente, no puede usar hooks  
**Solución**: Pasar token como parámetro o usar función helper

---

### **6. procesosService.js**
**Ubicación**: `src/features/dashboard/pages/misProcesos/services/`  
**Líneas**: 6, 15  
**Uso**: `authData.getToken()`  
**Migración**: ⚠️ **PROBLEMA**: Servicio no es componente  
**Solución**: Pasar token como parámetro o usar función helper

---

### **7. landing.jsx**
**Ubicación**: `src/features/landing/`  
**Líneas**: 8, 12  
**Uso**: `authData.getUser()`  
**Migración**: Usar `useAuth` → `user` del contexto

---

### **8. hero.jsx**
**Ubicación**: `src/features/landing/components/`  
**Líneas**: 6, 261-262, 303-304  
**Uso**: `authData.getUser()`  
**Migración**: Usar `useAuth` → `user` del contexto

---

### **9. MisProcesos.jsx**
**Ubicación**: `src/features/dashboard/pages/misProcesos/`  
**Líneas**: 3, 19  
**Uso**: `authData.getUser()`  
**Migración**: Usar `useAuth` → `user` del contexto

---

### **10. CrearSolicitudPage.jsx**
**Ubicación**: `src/features/landing/pages/`  
**Líneas**: 5, 66, 112, 131  
**Uso**: `authData.getUser()`  
**Migración**: Usar `useAuth` → `user` del contexto

---

### **11. authService.js**
**Ubicación**: `src/features/auth/services/`  
**Líneas**: 1, 36, 54  
**Uso**: `authData.setToken()`  
**Estado**: ⚠️ **Servicio interno** - Puede mantenerse o migrar a usar el contexto

---

### **12. TestSincronizacion.jsx**
**Ubicación**: `src/components/`  
**Uso**: Varios métodos  
**Estado**: ⚠️ **Componente de prueba** - Mover a `__tests__/` en Fase 5

---

## 🔄 PLAN DE MIGRACIÓN

### **FASE A: Componentes React (Pueden usar hooks)**
1. ✅ `landing.jsx`
2. ✅ `hero.jsx`
3. ✅ `MisProcesos.jsx`
4. ✅ `CrearSolicitudPage.jsx`
5. ✅ `tablaVentasFin.jsx`
6. ✅ `tablaVentasProceso.jsx`
7. ✅ `CrearSolicitud.jsx`
8. ✅ `Servicios.jsx`

### **FASE B: Servicios (NO pueden usar hooks)**
9. ⚠️ `ventasService.js` - Requiere función helper
10. ⚠️ `procesosService.js` - Requiere función helper

### **FASE C: Archivos especiales**
11. ⚠️ `authService.js` - Evaluar si mantener o migrar
12. ⚠️ `TestSincronizacion.jsx` - Mover a `__tests__/` en Fase 5

---

## 📝 PATRÓN DE MIGRACIÓN

### **ANTES (authData):**
```javascript
import authData from '../../../../auth/services/authData';

const token = authData.getToken();
const user = authData.getUser();
const userRole = authData.getUserRole();
const userId = authData.getUserId();
```

### **DESPUÉS (useAuth):**
```javascript
import { useAuth } from '../../../../shared/contexts/authContext';

const { getToken, user } = useAuth();

const token = getToken();
// user ya está disponible directamente
const userRole = user?.rol || user?.role;
const userId = user?.id_usuario || user?.id;
```

---

## ⚠️ CASOS ESPECIALES

### **Servicios (NO pueden usar hooks):**

**PROBLEMA**: Los servicios son funciones puras, no componentes React, por lo que NO pueden usar hooks.

**SOLUCIÓN 1**: Pasar token como parámetro
```javascript
// ANTES
export const crearVenta = async (datos) => {
  const token = authData.getToken();
  // ...
};

// DESPUÉS
export const crearVenta = async (datos, token) => {
  // token se pasa como parámetro
  // ...
};
```

**SOLUCIÓN 2**: Crear función helper
```javascript
// src/shared/utils/authHelpers.js
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};
```

---

## ✅ CHECKLIST DE MIGRACIÓN

- [x] Crear función helper `getAuthToken()` para servicios
- [x] Migrar `landing.jsx`
- [x] Migrar `hero.jsx`
- [x] Migrar `MisProcesos.jsx`
- [x] Migrar `CrearSolicitudPage.jsx`
- [x] Migrar `tablaVentasFin.jsx`
- [x] Migrar `tablaVentasProceso.jsx`
- [x] Migrar `CrearSolicitud.jsx`
- [x] Migrar `Servicios.jsx`
- [x] Actualizar `ventasService.js` para usar helper
- [x] Actualizar `procesosService.js` para usar helper
- [ ] Probar todos los componentes migrados
- [ ] Verificar que no hay errores de consola
- [ ] Marcar `authData` como deprecated (opcional - se mantiene para compatibilidad)

---

**Documento creado por**: Claude AI  
**Fecha**: 28 de Octubre de 2025  
**Versión**: 1.0

