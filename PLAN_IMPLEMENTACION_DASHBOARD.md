# 📊 Plan de Implementación: Conexión Dashboard con API

## 📋 Resumen Ejecutivo

Este documento detalla el plan de implementación para conectar el módulo de dashboard del frontend con la API del backend. Actualmente, el dashboard utiliza datos simulados y necesita ser conectado con los endpoints reales de la API.

---

## 🔍 Análisis de Compatibilidad

### ✅ Endpoints API Disponibles

La API proporciona los siguientes endpoints para el dashboard:

1. **`GET /api/dashboard/ingresos?periodo=6meses`**
   - Análisis de ingresos por periodo (6 meses, 12 meses, custom)
   - Parámetros: `periodo` (6meses, 12meses, custom)

2. **`GET /api/dashboard/servicios?periodo=12meses`**
   - Resumen de servicios y estadísticas
   - Parámetros: `periodo` (6meses, 12meses, custom)

3. **`GET /api/dashboard/resumen?periodo=6meses`**
   - KPIs generales (ingresos totales, solicitudes, tasa de finalización, clientes activos)
   - Parámetros: `periodo` (6meses, 12meses, custom)

4. **`GET /api/dashboard/pendientes?format=json`**
   - Servicios pendientes
   - Parámetros: `format` (json, excel)

5. **`GET /api/dashboard/inactivas?format=json`**
   - Solicitudes inactivas (>30 días sin actualizar)
   - Parámetros: `format` (json, excel)

6. **`GET /api/dashboard/renovaciones-proximas?format=json`**
   - Marcas próximas a vencer (próximos 90 días)
   - Parámetros: `format` (json, excel)

### 📦 Componentes del Dashboard Actuales

1. **`GraficaIngresosPie`** (components/GraficaIngresosPie.jsx)
   - **Estado actual**: Datos simulados
   - **Necesita**: Endpoint `/api/dashboard/ingresos`
   - **Datos requeridos**: Ingresos por servicio, distribución porcentual

2. **`GraficaResumenServicios`** (components/GraficaResumenServicios.jsx)
   - **Estado actual**: Datos simulados
   - **Necesita**: Endpoint `/api/dashboard/servicios`
   - **Datos requeridos**: Servicios por estado (aprobado, en proceso, rechazado) por tipo de servicio

3. **`TablaServicios`** (components/tablaServicios.jsx)
   - **Estado actual**: Datos simulados
   - **Necesita**: Endpoint `/api/dashboard/inactivas`
   - **Datos requeridos**: Servicios con inactividad prolongada (>30 días)

4. **`TablaMarcasCertificadas`** (components/tablaMarcasCertificadas.jsx)
   - **Estado actual**: Datos simulados
   - **Necesita**: Endpoint `/api/dashboard/renovaciones-proximas`
   - **Datos requeridos**: Marcas certificadas próximas a vencer

### 🔄 Compatibilidad API vs Frontend

| Componente | Endpoint API | Estado | Compatibilidad |
|------------|--------------|--------|----------------|
| GraficaIngresosPie | `/api/dashboard/ingresos` | ✅ Disponible | 🟢 Compatible |
| GraficaResumenServicios | `/api/dashboard/servicios` | ✅ Disponible | 🟢 Compatible |
| TablaServicios | `/api/dashboard/inactivas` | ✅ Disponible | 🟢 Compatible |
| TablaMarcasCertificadas | `/api/dashboard/renovaciones-proximas` | ✅ Disponible | 🟢 Compatible |

**Resultado**: ✅ **100% Compatible** - Todos los endpoints necesarios están disponibles en la API.

---

## 🚀 Plan de Implementación

### **Fase 1: Infraestructura de Servicios API** ⏱️ Estimado: 2-3 horas

#### 1.1 Crear Servicio API para Dashboard
- **Archivo**: `src/features/dashboard/services/dashboardApiService.js`
- **Funcionalidad**: 
  - Métodos para cada endpoint del dashboard
  - Manejo de autenticación (JWT)
  - Manejo de errores
  - Transformación de datos si es necesario

#### 1.2 Actualizar Configuración de API
- **Archivo**: `src/shared/config/apiConfig.js`
- **Cambios**: Agregar endpoints del dashboard a la configuración

### **Fase 2: Hooks Personalizados** ⏱️ Estimado: 1-2 horas

#### 2.1 Crear Hook useDashboardData
- **Archivo**: `src/features/dashboard/hooks/useDashboardData.js`
- **Funcionalidad**:
  - Obtener datos del dashboard
  - Manejo de estados de carga
  - Manejo de errores
  - Refrescar datos

### **Fase 3: Conexión de Componentes** ⏱️ Estimado: 4-6 horas

#### 3.1 GraficaIngresosPie
- **Cambios**:
  - Reemplazar datos simulados con llamada a API
  - Agregar estado de carga
  - Agregar manejo de errores
  - Implementar filtros de periodo (mes/año)

#### 3.2 GraficaResumenServicios
- **Cambios**:
  - Reemplazar datos simulados con llamada a API
  - Agregar estado de carga
  - Agregar manejo de errores
  - Implementar filtros de periodo (día/semana/mes)

#### 3.3 TablaServicios
- **Cambios**:
  - Reemplazar datos simulados con llamada a API
  - Agregar estado de carga
  - Agregar manejo de errores
  - Mantener funcionalidad de búsqueda y filtrado

#### 3.4 TablaMarcasCertificadas
- **Cambios**:
  - Reemplazar datos simulados con llamada a API
  - Agregar estado de carga
  - Agregar manejo de errores
  - Mantener funcionalidad de búsqueda y ordenamiento

### **Fase 4: Mejoras y Optimizaciones** ⏱️ Estimado: 2-3 horas

#### 4.1 Optimización de Rendimiento
- Implementar caché de datos
- Debounce en búsquedas
- Lazy loading de componentes

#### 4.2 Mejoras de UX
- Skeleton loaders mientras cargan los datos
- Mensajes de error amigables
- Refresh manual de datos
- Indicadores de última actualización

#### 4.3 Testing
- Pruebas de integración
- Pruebas de manejo de errores
- Pruebas de estados de carga

---

## 📝 Detalles Técnicos

### Estructura del Servicio API

```javascript
// dashboardApiService.js
import API_CONFIG from '../../../shared/config/apiConfig';
import { getToken } from '../../../shared/utils/authUtils';

const dashboardApiService = {
  // Obtener ingresos por periodo
  getIngresos: async (periodo = '6meses') => {
    // Implementación
  },
  
  // Obtener resumen de servicios
  getServicios: async (periodo = '12meses') => {
    // Implementación
  },
  
  // Obtener KPIs generales
  getResumen: async (periodo = '6meses') => {
    // Implementación
  },
  
  // Obtener servicios pendientes
  getPendientes: async (format = 'json') => {
    // Implementación
  },
  
  // Obtener solicitudes inactivas
  getInactivas: async (format = 'json') => {
    // Implementación
  },
  
  // Obtener renovaciones próximas
  getRenovacionesProximas: async (format = 'json') => {
    // Implementación
  }
};
```

### Estructura del Hook

```javascript
// useDashboardData.js
import { useState, useEffect } from 'react';
import dashboardApiService from '../services/dashboardApiService';

export const useDashboardData = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Implementación
  
  return { data, loading, error, refetch };
};
```

### Transformación de Datos

#### Para GraficaIngresosPie:
- **API Response** → **Chart Data**
- Mapear servicios a labels
- Mapear ingresos a valores
- Calcular porcentajes

#### Para GraficaResumenServicios:
- **API Response** → **Service Summary**
- Agrupar por tipo de servicio
- Contar por estado (aprobado, en proceso, rechazado)

#### Para TablaServicios:
- **API Response** → **Table Data**
- Mapear campos de la API a campos de la tabla
- Calcular días de inactividad

#### Para TablaMarcasCertificadas:
- **API Response** → **Table Data**
- Mapear campos de la API a campos de la tabla
- Calcular días restantes hasta vencimiento

---

## ⚠️ Consideraciones Importantes

### 1. Autenticación
- Todos los endpoints requieren autenticación JWT
- El token debe estar en el header `Authorization: Bearer <token>`
- Manejar errores 401 (no autorizado) y redirigir al login

### 2. Manejo de Errores
- Errores de red
- Errores de autenticación
- Errores de servidor (500)
- Errores de datos (400)
- Mostrar mensajes amigables al usuario

### 3. Estados de Carga
- Mostrar skeleton loaders mientras cargan los datos
- Evitar "flash" de contenido vacío
- Manejar estados de "sin datos"

### 4. Formato de Datos
- Verificar estructura de respuesta de la API
- Transformar datos si es necesario
- Validar datos antes de renderizar

### 5. Periodos y Filtros
- Mapear periodos del frontend a periodos de la API
- Manejar periodos personalizados
- Actualizar datos cuando cambian los filtros

---

## 🧪 Plan de Pruebas

### Pruebas Unitarias
- ✅ Servicio API: Llamadas correctas a endpoints
- ✅ Transformación de datos: Datos correctamente transformados
- ✅ Manejo de errores: Errores manejados correctamente

### Pruebas de Integración
- ✅ Conexión con API: Datos obtenidos correctamente
- ✅ Renderizado de componentes: Componentes renderizan con datos reales
- ✅ Filtros: Filtros actualizan datos correctamente

### Pruebas de Usuario
- ✅ Carga de datos: Datos cargan correctamente
- ✅ Estados de carga: Estados de carga se muestran correctamente
- ✅ Manejo de errores: Errores se muestran correctamente
- ✅ Filtros: Filtros funcionan correctamente

---

## 📊 Métricas de Éxito

### Objetivos
- ✅ 100% de componentes conectados con API
- ✅ 0 datos simulados en producción
- ✅ Tiempo de carga < 2 segundos
- ✅ 0 errores de conexión
- ✅ Manejo de errores robusto

### KPIs
- Tasa de éxito de conexión: > 95%
- Tiempo de respuesta: < 2 segundos
- Tasa de errores: < 5%
- Satisfacción del usuario: > 4/5

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: Estructura de datos diferente
- **Probabilidad**: Media
- **Impacto**: Alto
- **Mitigación**: Verificar estructura de respuesta de la API antes de implementar

### Riesgo 2: Errores de autenticación
- **Probabilidad**: Baja
- **Impacto**: Alto
- **Mitigación**: Implementar manejo robusto de errores 401

### Riesgo 3: Performance
- **Probabilidad**: Media
- **Impacto**: Medio
- **Mitigación**: Implementar caché y optimización de llamadas

### Riesgo 4: Cambios en la API
- **Probabilidad**: Baja
- **Impacto**: Alto
- **Mitigación**: Documentar dependencias y versiones

---

## 📅 Cronograma Estimado

| Fase | Duración | Prioridad |
|------|----------|-----------|
| Fase 1: Infraestructura | 2-3 horas | 🔴 Alta |
| Fase 2: Hooks | 1-2 horas | 🟡 Media |
| Fase 3: Conexión | 4-6 horas | 🔴 Alta |
| Fase 4: Mejoras | 2-3 horas | 🟢 Baja |
| **Total** | **9-14 horas** | |

---

## ✅ Checklist de Implementación

### Fase 1: Infraestructura
- [ ] Crear `dashboardApiService.js`
- [ ] Agregar métodos para todos los endpoints
- [ ] Implementar manejo de autenticación
- [ ] Implementar manejo de errores
- [ ] Actualizar `apiConfig.js`

### Fase 2: Hooks
- [ ] Crear `useDashboardData.js`
- [ ] Implementar estados de carga
- [ ] Implementar manejo de errores
- [ ] Implementar refetch

### Fase 3: Conexión
- [ ] Conectar `GraficaIngresosPie`
- [ ] Conectar `GraficaResumenServicios`
- [ ] Conectar `TablaServicios`
- [ ] Conectar `TablaMarcasCertificadas`

### Fase 4: Mejoras
- [ ] Implementar skeleton loaders
- [ ] Implementar mensajes de error amigables
- [ ] Implementar refresh manual
- [ ] Optimizar rendimiento
- [ ] Pruebas completas

---

## 📚 Referencias

- [Documentación API](./documentacion%20api.md)
- [API Config](../src/shared/config/apiConfig.js)
- [Servicios API Existentes](../src/features/dashboard/services/)

---

## 🎯 Conclusión

El plan de implementación está diseñado para conectar completamente el dashboard con la API de manera robusta y eficiente. Todos los endpoints necesarios están disponibles y la compatibilidad es del 100%. La implementación se realizará en fases para facilitar el desarrollo y las pruebas.

**Estado Actual**: 🟡 Pendiente de implementación
**Prioridad**: 🔴 Alta
**Estimado**: 9-14 horas de desarrollo

