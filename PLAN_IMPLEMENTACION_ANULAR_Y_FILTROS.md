# 📋 PLAN DE IMPLEMENTACIÓN: Anular Solicitudes y Filtros Mejorados

## 📊 Análisis de la Documentación de la API vs Frontend Actual

### ✅ Endpoint de Anular Solicitudes

**Documentación API:**
```http
PUT /api/gestion-solicitudes/anular/:id
Authorization: Bearer <token>
Content-Type: application/json

Body: {
  "motivo": "Motivo de la anulación"
}
```

**Estado Actual del Frontend:**
- ✅ El servicio `solicitudesApiService.anularSolicitud()` ya existe
- ❌ **PROBLEMA CRÍTICO**: No envía el campo `motivo` en el body
- ❌ Solo hace un PUT sin body, lo que puede causar errores de validación en el backend

### 📌 Estados de Solicitudes según la API

**Estados disponibles:**
1. **Pendiente** → Solicitud creada, en espera de procesamiento
2. **Aprobada** → Solicitud aprobada (finalizada exitosamente)
3. **Rechazada** → Solicitud rechazada
4. **Anulada** → Solicitud cancelada

**Mapeo actual del frontend:**
```javascript
mapearEstadoAPIaFrontend(estadoAPI) {
  const mapeoEstados = {
    'Pendiente': 'Pendiente',     // ✅ Correcto
    'Aprobada': 'Finalizada',     // ✅ Correcto
    'Rechazada': 'Anulada',       // ⚠️ Mapea Rechazada a Anulada
    'Anulada': 'Anulada'          // ✅ Correcto
  };
  return mapeoEstados[estadoAPI] || estadoAPI || 'Pendiente';
}
```

### 🔍 Sistema de Filtros según la Documentación

**Endpoints disponibles:**
1. **GET /api/gestion-solicitudes** → Todas las solicitudes (admin/empleado)
2. **GET /api/gestion-solicitudes/mias** → Mis solicitudes (cliente)
3. **GET /api/gestion-solicitudes/buscar?search=TERMINO** → Búsqueda por término

**Estados del sistema de procesos:**
- Cada servicio tiene sus propios `process_states` dinámicos
- El estado actual se almacena en `OrdenServicio.estado`
- Los estados son strings dinámicos (no ENUM fijo)

---

## 🎯 PROBLEMAS IDENTIFICADOS EN EL FRONTEND

### 1. **Anulación de Solicitudes**

**Problema en `solicitudesApiService.js` línea 130:**
```javascript
async anularSolicitud(id, token) {
  try {
    console.log(`🔧 [SolicitudesApiService] Anulando solicitud ${id}...`);
    const solicitudAnulada = await this.makeRequest(`/api/gestion-solicitudes/anular/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
      // ❌ FALTA: body: JSON.stringify({ motivo: '...' })
    });
    // ...
  }
}
```

**Impacto:**
- El backend espera un campo `motivo` obligatorio
- Sin este campo, la petición puede fallar con error 400

### 2. **Filtros de Tabla "Ventas en Proceso"**

**Implementación actual en `tablaVentasProceso.jsx` línea 73-78:**
```javascript
const ventasEnProceso = ventasTransformadas.filter(v => {
  const esEnProceso = v.estado === 'Pendiente';
  return esEnProceso;
});
```

**Problema:**
- ✅ Solo muestra estados "Pendiente" (correcto para "en proceso")
- ⚠️ No considera estados dinámicos del sistema de `process_states`
- ⚠️ Debería mostrar solicitudes con cualquier estado que NO sea "Finalizada" o "Anulada"

### 3. **Filtros de Tabla "Ventas Finalizadas"**

**Implementación actual en `tablaVentasFin.jsx`:**
```javascript
const ventasFinalizadas = ventasTransformadas.filter(v => {
  const esFinalizada = v.estado === 'Finalizada' || v.estado === 'Anulada' || v.estado === 'Rechazada';
  return esFinalizada;
});
```

**Problema:**
- ✅ Muestra "Finalizada", "Anulada" y "Rechazada" (correcto)
- ⚠️ Mapeo de estados puede estar causando confusión: "Rechazada" se mapea a "Anulada"

### 4. **Sistema de Estados Dinámicos**

**Documentación API:**
- Cada servicio tiene sus propios `process_states`
- Estados disponibles: `GET /api/gestion-solicitudes/:id/estados-disponibles`
- Estado actual: `GET /api/gestion-solicitudes/:id/estado-actual`

**Frontend actual:**
- ✅ Métodos implementados: `getEstadosDisponibles()` y `getEstadoActual()`
- ❌ No se utilizan en las tablas para mostrar estados dinámicos
- ❌ No hay filtro por estado dinámico (solo "Pendiente", "Finalizada", "Anulada")

---

## 🛠️ PLAN DE IMPLEMENTACIÓN

### **Fase 1: Corregir Anulación de Solicitudes** ⏱️ 10 min

#### 1.1. Actualizar `solicitudesApiService.js`
**Ubicación:** `src/features/dashboard/pages/gestionVentasServicios/services/solicitudesApiService.js`

**Cambios:**
```javascript
// Antes (línea 130-145)
async anularSolicitud(id, token) {
  try {
    console.log(`🔧 [SolicitudesApiService] Anulando solicitud ${id}...`);
    const solicitudAnulada = await this.makeRequest(`/api/gestion-solicitudes/anular/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
      // ❌ FALTA body
    });
    return solicitudAnulada;
  } catch (error) {
    console.error(`❌ [SolicitudesApiService] Error anulando solicitud ${id}:`, error);
    throw error;
  }
}

// Después (CORREGIDO)
async anularSolicitud(id, motivo, token) {
  try {
    console.log(`🔧 [SolicitudesApiService] Anulando solicitud ${id} con motivo: ${motivo}...`);
    const solicitudAnulada = await this.makeRequest(`/api/gestion-solicitudes/anular/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        motivo: motivo || 'Anulación solicitada por el usuario'
      })
    });
    console.log('✅ [SolicitudesApiService] Solicitud anulada:', solicitudAnulada);
    return solicitudAnulada;
  } catch (error) {
    console.error(`❌ [SolicitudesApiService] Error anulando solicitud ${id}:`, error);
    throw error;
  }
}
```

#### 1.2. Actualizar `tablaVentasProceso.jsx`
**Ubicación:** `src/features/dashboard/pages/gestionVentasServicios/components/tablaVentasProceso.jsx`

**Cambios en `handleAnular` (aproximadamente línea 200-230):**
```javascript
// Buscar la función handleAnular y actualizar:
const handleAnular = async () => {
  if (!motivoAnular.trim()) {
    AlertService.error('Debes proporcionar un motivo para anular la solicitud.');
    return;
  }

  try {
    const token = authData.getToken();
    
    // ✅ Pasar el motivo como segundo parámetro
    await solicitudesApiService.anularSolicitud(
      datoSeleccionado.id, 
      motivoAnular.trim(), // ✅ NUEVO: Agregar motivo
      token
    );
    
    // Notificar a tablaVentasFin
    window.dispatchEvent(new CustomEvent('solicitudAnulada', { 
      detail: { id: datoSeleccionado.id } 
    }));
    
    setModalAnularOpen(false);
    setMotivoAnular('');
    AlertService.success('¡Venta anulada exitosamente!');
    refreshVentas();
  } catch (error) {
    console.error('❌ [TablaVentasProceso] Error al anular solicitud:', error);
    AlertService.error('Error al anular la venta: ' + error.message);
  }
};
```

---

### **Fase 2: Mejorar Sistema de Filtros por Estado** ⏱️ 20 min

#### 2.1. Actualizar Mapeo de Estados en `solicitudesApiService.js`

**Objetivo:** Mantener coherencia entre API y Frontend

**Cambios:**
```javascript
// línea 350-358
mapearEstadoAPIaFrontend(estadoAPI) {
  // Mapeo directo 1:1 para mayor claridad
  const mapeoEstados = {
    'Pendiente': 'En Proceso',      // ✅ NUEVO: Pendiente = En Proceso
    'Aprobada': 'Finalizada',       // ✅ Mantener
    'Rechazada': 'Rechazada',       // ✅ NUEVO: No mapear a Anulada
    'Anulada': 'Anulada'            // ✅ Mantener
  };
  
  const estadoMapeado = mapeoEstados[estadoAPI];
  if (estadoMapeado) {
    return estadoMapeado;
  }
  
  // Si no está en el mapeo, es un estado dinámico del process_state
  // Mantenerlo tal cual (e.g., "Verificación de Documentos")
  return estadoAPI || 'En Proceso';
}
```

#### 2.2. Actualizar Filtro en `tablaVentasProceso.jsx`

**Cambios (línea 73-78):**
```javascript
// Antes: Solo filtraba por "Pendiente"
const ventasEnProceso = ventasTransformadas.filter(v => {
  const esEnProceso = v.estado === 'Pendiente';
  return esEnProceso;
});

// Después: Excluir solo finalizadas/anuladas
const ventasEnProceso = ventasTransformadas.filter(v => {
  // ✅ En proceso = TODO menos Finalizada, Anulada y Rechazada
  const esEnProceso = v.estado !== 'Finalizada' && 
                      v.estado !== 'Anulada' && 
                      v.estado !== 'Rechazada';
  console.log(`🔧 [useSalesSync] Venta ${v.id} - Estado: ${v.estado} - Es en proceso: ${esEnProceso}`);
  return esEnProceso;
});
```

#### 2.3. Actualizar Filtro en `tablaVentasFin.jsx`

**Verificar que el filtro sea correcto (NO cambiar si ya funciona):**
```javascript
// Debe mantener:
const ventasFinalizadas = ventasTransformadas.filter(v => {
  const esFinalizada = v.estado === 'Finalizada' || 
                       v.estado === 'Anulada' || 
                       v.estado === 'Rechazada';
  return esFinalizada;
});
```

---

### **Fase 3: Implementar Estados Dinámicos (OPCIONAL)** ⏱️ 30 min

**Nota:** Esta fase es opcional si deseas mostrar los estados dinámicos reales del `process_state` en vez de solo "En Proceso".

#### 3.1. Agregar columna de "Estado Detallado" en `tablaVentasProceso.jsx`

**Ubicación:** En el JSX de la tabla (aproximadamente línea 400-600)

**Cambios:**
```jsx
// Agregar una nueva columna después de "Estado"
<td>
  {getEstadoBadge(item.estado)}
</td>
<td className="text-center">
  {/* ✅ NUEVO: Mostrar estado detallado del process_state */}
  <span className="badge bg-info">
    {item.estadoDetallado || item.estado}
  </span>
</td>
```

#### 3.2. Actualizar `transformarRespuestaDelAPI` para incluir estado detallado

**Cambios en `solicitudesApiService.js` (línea 361-387):**
```javascript
transformarRespuestaDelAPI(respuestaAPI) {
  console.log('🔧 [SolicitudesApiService] Transformando respuesta de la API al frontend...', respuestaAPI);
  
  const respuestaFrontend = {
    id: respuestaAPI.id?.toString() || respuestaAPI.id_orden_servicio?.toString(),
    expediente: respuestaAPI.expediente || `EXP-${respuestaAPI.id || respuestaAPI.id_orden_servicio}`,
    titular: respuestaAPI.nombre_solicitante || respuestaAPI.nombre_completo_titular || respuestaAPI.titular || 'Sin titular',
    marca: respuestaAPI.marca_a_buscar || respuestaAPI.nombre_marca || respuestaAPI.marca || 'Sin marca',
    tipoSolicitud: respuestaAPI.servicio || respuestaAPI.tipoSolicitud || 'Sin servicio',
    encargado: respuestaAPI.encargado || 'Sin asignar',
    estado: this.mapearEstadoAPIaFrontend(respuestaAPI.estado),
    estadoDetallado: respuestaAPI.estado_detallado || respuestaAPI.estado, // ✅ NUEVO
    email: respuestaAPI.correo_electronico || respuestaAPI.correo_titular || respuestaAPI.email || '',
    telefono: respuestaAPI.telefono || respuestaAPI.telefono_titular || '',
    comentarios: respuestaAPI.comentarios || [],
    fechaCreacion: respuestaAPI.fecha_solicitud || respuestaAPI.fechaCreacion || new Date().toISOString(),
    fechaFin: respuestaAPI.fechaFin || null,
    // Campos adicionales de la API
    id_cliente: respuestaAPI.id_cliente,
    id_empresa: respuestaAPI.id_empresa,
    pais: respuestaAPI.pais,
    ciudad: respuestaAPI.ciudad,
    direccion: respuestaAPI.direccion
  };
  
  console.log('✅ [SolicitudesApiService] Respuesta transformada para frontend:', respuestaFrontend);
  return respuestaFrontend;
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Anulación con Motivo ✅
- [ ] 1.1. Actualizar firma de `anularSolicitud(id, motivo, token)` en `solicitudesApiService.js`
- [ ] 1.2. Agregar `body: JSON.stringify({ motivo })` en la petición
- [ ] 1.3. Actualizar llamada en `tablaVentasProceso.jsx` → `handleAnular()`
- [ ] 1.4. Verificar que el campo `motivoAnular` se pase correctamente
- [ ] **Prueba:** Anular una solicitud y verificar que aparezca en "Ventas Finalizadas"

### Fase 2: Filtros Mejorados ✅
- [ ] 2.1. Actualizar `mapearEstadoAPIaFrontend()` para distinguir "Rechazada" de "Anulada"
- [ ] 2.2. Cambiar filtro en `tablaVentasProceso.jsx` de `=== 'Pendiente'` a `!== Finalizada/Anulada/Rechazada`
- [ ] 2.3. Verificar filtro en `tablaVentasFin.jsx` (debe incluir Finalizada, Anulada, Rechazada)
- [ ] **Prueba:** Crear solicitud → Anular → Verificar que aparezca en "Ventas Finalizadas"
- [ ] **Prueba:** Filtrar por servicio y estado en ambas tablas

### Fase 3: Estados Dinámicos (Opcional) ⚠️
- [ ] 3.1. Agregar columna "Estado Detallado" en tabla
- [ ] 3.2. Actualizar `transformarRespuestaDelAPI()` para incluir `estadoDetallado`
- [ ] 3.3. Usar `getEstadosDisponibles()` para obtener estados del servicio
- [ ] **Prueba:** Verificar que se muestren estados dinámicos como "Verificación de Documentos"

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **PRIMERO:** Fase 1 (Anulación con motivo) → **CRÍTICO**
2. **SEGUNDO:** Fase 2.2 y 2.3 (Filtros de tablas) → **ALTA PRIORIDAD**
3. **TERCERO:** Fase 2.1 (Mapeo de estados) → **MEDIA PRIORIDAD**
4. **CUARTO:** Fase 3 (Estados dinámicos) → **OPCIONAL** (mejora visual)

---

## 📊 IMPACTO Y RIESGOS

### Impacto Positivo
- ✅ **Anulación correcta:** Las solicitudes anuladas aparecerán en "Ventas Finalizadas"
- ✅ **Filtros precisos:** Mayor claridad en el estado de las solicitudes
- ✅ **Conformidad con API:** Frontend alineado con documentación del backend

### Riesgos
- ⚠️ **Cambio de mapeo de estados:** Puede afectar UI existente (verificar todos los usos de `getEstadoBadge()`)
- ⚠️ **Dependencias:** Asegurar que `tablaVentasFin.jsx` escuche el evento `solicitudAnulada`

---

## 🔍 TESTING

### Escenarios de Prueba

1. **Anular solicitud con motivo:**
   - ✅ Crear solicitud → Estado "En Proceso"
   - ✅ Anular con motivo → Debe aparecer en "Ventas Finalizadas"
   - ✅ Verificar que no aparezca en "Ventas en Proceso"

2. **Filtros de tabla:**
   - ✅ Crear 3 solicitudes de diferentes servicios
   - ✅ Filtrar por servicio → Debe mostrar solo las correspondientes
   - ✅ Filtrar por estado → Debe actualizar correctamente

3. **Estados dinámicos (si se implementa Fase 3):**
   - ✅ Crear solicitud → Verificar estado inicial
   - ✅ Cambiar estado desde seguimiento
   - ✅ Verificar que el estado detallado se actualice en la tabla

---

## 📞 SOPORTE

Si encuentras algún problema durante la implementación:
1. Verifica los logs de consola (`console.log`)
2. Revisa que el token esté presente en las peticiones
3. Verifica que el backend esté devolviendo el formato esperado
4. Consulta la documentación de la API en `documentacion api.md`

---

**Estado del plan:** 📝 **PENDIENTE DE APROBACIÓN**

**Autor:** Cursor AI Assistant  
**Fecha:** 27 de Octubre de 2025  
**Versión:** 1.0

