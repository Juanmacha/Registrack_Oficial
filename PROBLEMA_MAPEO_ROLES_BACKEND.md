# ⚠️ PROBLEMA CRÍTICO EN BACKEND - MAPEO DE ROLES

**Fecha**: 28 de Octubre de 2025  
**URGENCIA**: 🔴 **CRÍTICO**

---

## 🐛 PROBLEMA IDENTIFICADO

**El backend tiene un mapeo de roles INCORRECTO** que no coincide con la documentación estándar ni con las convenciones normales.

### **Mapeo Actual del Backend**:
- `id_rol=1` → `Cliente` ❌
- `id_rol=2` → `Administrador` ❌
- `id_rol=3` → `Empleado` ❌

### **Mapeo Estándar Esperado**:
- `id_rol=1` → `Administrador` ✅
- `id_rol=2` → `Empleado` ✅
- `id_rol=3` → `Cliente` ✅

---

## 📋 EVIDENCIA

**Logs del frontend**:
```
Usuario "Admin": id_rol=2 → Debería ser Administrador ✅ (pero con id_rol incorrecto)
Usuario "Manuel": id_rol=1 → Mapeado como Administrador ❌ (debería ser Cliente)
Usuario "María": id_rol=2 → Mapeado como Empleado ❌ (debería ser Administrador)
Usuario "Martin": id_rol=3 → Debería ser Cliente ✅ (pero con id_rol incorrecto)
```

---

## ✅ SOLUCIÓN TEMPORAL (FRONTEND)

He corregido el mapeo en el frontend para que coincida con el backend actual:

```javascript
// Mapeo corregido para coincidir con el backend
const obtenerNombreRol = (idRol) => {
  const rolesMap = {
    1: 'cliente',          // Backend usa id_rol=1 para cliente
    2: 'administrador',    // Backend usa id_rol=2 para administrador
    3: 'empleado'          // Backend usa id_rol=3 para empleado
  };
  return rolesMap[idRol] || 'cliente';
};

const obtenerIdRol = (nombreRol) => {
  const rolesMap = {
    'administrador': 2,  // Backend usa id_rol=2
    'empleado': 3,      // Backend usa id_rol=3
    'cliente': 1         // Backend usa id_rol=1
  };
  return rolesMap[nombreRol?.toLowerCase()] || 1;
};
```

**Esto SOLO corrige la visualización en el frontend**, pero el problema de raíz está en el BACKEND.

---

## 🔧 CORRECCIÓN NECESARIA EN BACKEND

**OPCIÓN 1: Corregir el backend** (RECOMENDADO)
- Modificar la base de datos para que los roles tengan IDs estándar
- Actualizar todos los registros existentes
- Mantener consistencia con la documentación

**OPCIÓN 2: Mantener el mapeo actual** (NO RECOMENDADO)
- Actualizar toda la documentación
- Aceptar que `id_rol=1` siempre será Cliente
- Riesgo de confusión con otros sistemas

---

## 📍 ARCHIVOS AFECTADOS EN FRONTEND

- ✅ `src/features/dashboard/pages/gestionUsuarios/gestionUsuarios.jsx` - CORREGIDO

---

## ⚠️ NOTA IMPORTANTE

Esta es una **corrección temporal** en el frontend para que funcione con el backend actual.  
**El backend DEBE ser corregido** para seguir estándares y evitar confusiones futuras.

---

**Problema Documentado** ⚠️  
**Corrección Temporal Aplicada** ✅

