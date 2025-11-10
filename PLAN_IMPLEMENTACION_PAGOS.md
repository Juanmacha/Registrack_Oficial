# 📋 Plan de Implementación: Integración del Módulo de Pagos con la API

## 🎯 Objetivo
Conectar el módulo de pagos del frontend con la API del backend, reemplazando los datos mock por datos reales obtenidos del servidor.

## 📊 Estado Actual

### Estructura Actual del Módulo
```
src/features/dashboard/pages/pagos/
├── pagos.jsx                    # Componente principal
├── components/
│   ├── tablaPagos.jsx          # Tabla de pagos (usa mock)
│   ├── verDetallePagos.jsx     # Modal de detalle
│   └── descargarExcelPagos.jsx # Descarga Excel
└── services/
    └── getEstadoPagoBadge.js   # Utilidad para badges
```

### Problemas Identificados
1. ❌ Usa `mockDataService` para obtener datos
2. ❌ Usa `PaymentContext` para pagos simulados
3. ❌ No conecta con la API del backend
4. ❌ Descarga de comprobante usa generación local (PDFKit)
5. ❌ Descarga Excel se genera en el frontend

## 🔌 Endpoints Disponibles en la API

Según la documentación (`documentacion api.md`), los siguientes endpoints están disponibles:

### 1. Listar Todos los Pagos
```http
GET /api/gestion-pagos
Authorization: Bearer <TOKEN>
```
**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id_pago": 1,
      "id_orden_servicio": 123,
      "monto": 1500000.00,
      "metodo_pago": "Transferencia bancaria",
      "fecha_pago": "2024-01-15T10:30:00.000Z",
      "estado": "Completado",
      "referencia": "TXN123456789",
      "observaciones": "Pago procesado correctamente",
      "transaction_id": "TXN-123456",
      "gateway": "mock",
      "numero_comprobante": "RC-202401-0001",
      "comprobante_url": "/api/gestion-pagos/1/comprobante",
      "verified_at": "2024-01-15T10:35:00.000Z",
      "verified_by": 1,
      "verification_method": "automatic"
    }
  ]
}
```

### 2. Obtener Pago por ID
```http
GET /api/gestion-pagos/:id
Authorization: Bearer <TOKEN>
```

### 3. Procesar Pago (Mock)
```http
POST /api/gestion-pagos/process-mock
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "id_orden_servicio": 123,
  "monto": 500000.00,
  "metodo_pago": "Tarjeta"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Pago procesado exitosamente. Solicitud activada.",
  "data": {
    "payment": { ... },
    "solicitud_activada": true
  }
}
```

### 4. Descargar Comprobante
```http
GET /api/gestion-pagos/:id/comprobante/download
Authorization: Bearer <TOKEN>
```
**Respuesta:** Archivo PDF descargable

### 5. Ver Comprobante (Preview)
```http
GET /api/gestion-pagos/:id/comprobante
Authorization: Bearer <TOKEN>
```
**Respuesta:** PDF para visualización

### 6. Reporte Excel
```http
GET /api/gestion-pagos/reporte/excel
Authorization: Bearer <TOKEN>
```
**Respuesta:** Archivo Excel descargable

### 7. Verificar Pago Manualmente
```http
POST /api/gestion-pagos/:id/verify-manual
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "observaciones": "Verificado manualmente por admin"
}
```

### 8. Simular Pago (Testing)
```http
POST /api/gestion-pagos/simular
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "id_orden_servicio": 123,
  "monto": 500000.00,
  "metodo_pago": "Tarjeta"
}
```

## 📝 Plan de Implementación

### Fase 1: Crear Servicio de API para Pagos ✅

**Archivo:** `src/features/dashboard/pages/pagos/services/pagosApiService.js`

**Funcionalidades:**
1. `getTodosLosPagos(token)` - Obtener todos los pagos
2. `getPagoPorId(id, token)` - Obtener pago específico
3. `procesarPagoMock(datos, token)` - Procesar pago simulado
4. `descargarComprobante(id, token)` - Descargar comprobante PDF
5. `verComprobante(id, token)` - Ver comprobante (preview)
6. `descargarReporteExcel(token)` - Descargar reporte Excel
7. `verificarPagoManual(id, observaciones, token)` - Verificar pago manualmente
8. `simularPago(datos, token)` - Simular pago (testing)

**Estructura del servicio:**
```javascript
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class PagosApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
  }

  async makeRequest(endpoint, options = {}) {
    // Lógica similar a solicitudesApiService
  }

  async getTodosLosPagos(token) {
    // GET /api/gestion-pagos
  }

  async getPagoPorId(id, token) {
    // GET /api/gestion-pagos/:id
  }

  async procesarPagoMock(datos, token) {
    // POST /api/gestion-pagos/process-mock
  }

  async descargarComprobante(id, token) {
    // GET /api/gestion-pagos/:id/comprobante/download
  }

  async verComprobante(id, token) {
    // GET /api/gestion-pagos/:id/comprobante
  }

  async descargarReporteExcel(token) {
    // GET /api/gestion-pagos/reporte/excel
  }

  async verificarPagoManual(id, observaciones, token) {
    // POST /api/gestion-pagos/:id/verify-manual
  }

  async simularPago(datos, token) {
    // POST /api/gestion-pagos/simular
  }
}

export default new PagosApiService();
```

### Fase 2: Actualizar Configuración de API ✅

**Archivo:** `src/shared/config/apiConfig.js`

**Agregar endpoints de pagos:**
```javascript
PAYMENTS: '/api/gestion-pagos',
PAYMENT_BY_ID: (id) => `/api/gestion-pagos/${id}`,
PAYMENT_PROCESS_MOCK: '/api/gestion-pagos/process-mock',
PAYMENT_COMPROBANTE: (id) => `/api/gestion-pagos/${id}/comprobante`,
PAYMENT_COMPROBANTE_DOWNLOAD: (id) => `/api/gestion-pagos/${id}/comprobante/download`,
PAYMENT_REPORTE_EXCEL: '/api/gestion-pagos/reporte/excel',
PAYMENT_VERIFY_MANUAL: (id) => `/api/gestion-pagos/${id}/verify-manual`,
PAYMENT_SIMULAR: '/api/gestion-pagos/simular',
```

### Fase 3: Actualizar Tabla de Pagos ✅

**Archivo:** `src/features/dashboard/pages/pagos/components/tablaPagos.jsx`

**Cambios:**
1. ❌ Eliminar dependencias de `mockDataService` y `PaymentContext`
2. ✅ Importar `pagosApiService`
3. ✅ Usar hook de autenticación para obtener token
4. ✅ Implementar `useState` y `useEffect` para cargar datos de la API
5. ✅ Manejar estados de carga y error
6. ✅ Actualizar función de descarga de comprobante para usar endpoint de API
7. ✅ Actualizar función de descarga Excel para usar endpoint de API
8. ✅ Mantener funcionalidad de búsqueda y paginación

**Estructura actualizada:**
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../shared/contexts/AuthContext';
import pagosApiService from '../services/pagosApiService';
import getEstadoPagoBadge from '../services/getEstadoPagoBadge';

const TablaPagos = () => {
  const { user, getToken } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ... resto de estados

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const datos = await pagosApiService.getTodosLosPagos(token);
      setPagos(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... resto de funciones
};
```

### Fase 4: Actualizar Modal de Detalle ✅

**Archivo:** `src/features/dashboard/pages/pagos/components/verDetallePagos.jsx`

**Cambios:**
1. ✅ Mostrar todos los campos disponibles del pago
2. ✅ Mostrar información de la orden de servicio asociada
3. ✅ Mostrar información de verificación (si está verificada)
4. ✅ Mostrar número de comprobante
5. ✅ Agregar botón para descargar comprobante si existe
6. ✅ Agregar botón para verificar pago manualmente (solo admin)

**Campos a mostrar:**
- ID de Pago
- Monto
- Fecha del Pago
- Método de Pago
- Estado
- Referencia/Transaction ID
- Número de Comprobante
- Gateway
- Observaciones
- ID Orden de Servicio
- Información de Verificación (verified_at, verified_by, verification_method)
- Comprobante URL (si existe)

### Fase 5: Actualizar Servicio de Badges ✅

**Archivo:** `src/features/dashboard/pages/pagos/services/getEstadoPagoBadge.js`

**Cambios:**
1. ✅ Ajustar para manejar estados de la API (string en lugar de boolean)
2. ✅ Estados posibles: "Completado", "Pendiente", "Fallido", "Verificado", etc.

**Estados a manejar:**
```javascript
const estados = {
  'Completado': { color: '#16a34a', texto: 'Completado' },
  'Pendiente': { color: '#f59e0b', texto: 'Pendiente' },
  'Fallido': { color: '#dc2626', texto: 'Fallido' },
  'Verificado': { color: '#2563eb', texto: 'Verificado' },
  // ... más estados
};
```

### Fase 6: Actualizar Descarga de Excel ✅

**Archivo:** `src/features/dashboard/pages/pagos/components/descargarExcelPagos.jsx`

**Cambios:**
1. ❌ Eliminar generación de Excel en el frontend
2. ✅ Usar endpoint de API: `GET /api/gestion-pagos/reporte/excel`
3. ✅ Manejar descarga de archivo desde el backend
4. ✅ Mostrar indicador de carga durante la descarga

### Fase 7: Actualizar Componente Principal ✅

**Archivo:** `src/features/dashboard/pages/pagos/pagos.jsx`

**Cambios:**
1. ✅ Verificar que la estructura actual sea compatible
2. ✅ Asegurar que los props se pasen correctamente
3. ✅ No debería requerir cambios significativos (ya está bien estructurado)

### Fase 8: Manejo de Errores y Estados de Carga ✅

**Implementar en todos los componentes:**
1. ✅ Estados de carga (loading)
2. ✅ Manejo de errores (error messages)
3. ✅ Mensajes de éxito (SweetAlert2)
4. ✅ Validación de permisos (solo admin para algunas acciones)
5. ✅ Manejo de tokens expirados

### Fase 9: Testing y Validación ✅

**Pruebas a realizar:**
1. ✅ Cargar lista de pagos
2. ✅ Ver detalle de pago
3. ✅ Descargar comprobante
4. ✅ Descargar reporte Excel
5. ✅ Verificar pago manualmente (solo admin)
6. ✅ Procesar pago mock
7. ✅ Manejo de errores (sin token, token inválido, etc.)
8. ✅ Búsqueda y filtrado
9. ✅ Paginación

## 🔄 Flujo de Datos

```
Usuario → Componente → Servicio API → Backend → Base de Datos
                ↓
           Manejo de Estados
           (loading, error, success)
                ↓
           Actualización UI
```

## 📦 Dependencias Necesarias

Ya disponibles en el proyecto:
- ✅ `fetch` (nativo)
- ✅ `file-saver` (para descargas)
- ✅ `sweetalert2` (para mensajes)
- ✅ Contexto de autenticación (`useAuth`)
- ✅ Configuración de API (`apiConfig`)

## 🚨 Consideraciones Importantes

### Permisos
- **Todos los endpoints** requieren autenticación (JWT token)
- **Algunas acciones** (verificar pago manualmente) requieren rol de administrador
- **Verificar permisos** antes de mostrar opciones en la UI

### Manejo de Tokens
- ✅ Usar `getToken()` del contexto de autenticación
- ✅ Manejar tokens expirados (redirigir a login)
- ✅ Incluir token en headers de todas las peticiones

### Formato de Datos
- ✅ El backend devuelve datos en formato snake_case
- ✅ El frontend puede necesitar transformar a camelCase si es necesario
- ✅ Verificar estructura de respuesta en la documentación

### Estados de Pago
- ✅ Los estados pueden ser strings ("Completado", "Pendiente", etc.)
- ✅ Actualizar función `getEstadoPagoBadge` para manejar strings
- ✅ Verificar estados posibles en la documentación

### Descarga de Archivos
- ✅ Comprobantes: Usar endpoint `/comprobante/download`
- ✅ Excel: Usar endpoint `/reporte/excel`
- ✅ Manejar Content-Disposition header para nombres de archivo
- ✅ Usar `file-saver` para descargar archivos

## 📋 Checklist de Implementación

### Fase 1: Servicio API
- [ ] Crear `pagosApiService.js`
- [ ] Implementar `getTodosLosPagos`
- [ ] Implementar `getPagoPorId`
- [ ] Implementar `procesarPagoMock`
- [ ] Implementar `descargarComprobante`
- [ ] Implementar `verComprobante`
- [ ] Implementar `descargarReporteExcel`
- [ ] Implementar `verificarPagoManual`
- [ ] Implementar `simularPago`
- [ ] Agregar manejo de errores
- [ ] Agregar logging para debugging

### Fase 2: Configuración
- [ ] Agregar endpoints a `apiConfig.js`

### Fase 3: Componentes
- [ ] Actualizar `tablaPagos.jsx`
- [ ] Eliminar dependencias mock
- [ ] Integrar servicio API
- [ ] Actualizar `verDetallePagos.jsx`
- [ ] Actualizar `descargarExcelPagos.jsx`
- [ ] Actualizar `getEstadoPagoBadge.js`

### Fase 4: Testing
- [ ] Probar carga de pagos
- [ ] Probar ver detalle
- [ ] Probar descarga comprobante
- [ ] Probar descarga Excel
- [ ] Probar verificar pago
- [ ] Probar manejo de errores
- [ ] Probar permisos

## 🎯 Resultado Esperado

Al finalizar la implementación:
1. ✅ El módulo de pagos mostrará datos reales del backend
2. ✅ Se podrán descargar comprobantes desde el backend
3. ✅ Se podrá descargar reporte Excel desde el backend
4. ✅ Se podrá verificar pagos manualmente (admin)
5. ✅ Se eliminarán todas las dependencias de datos mock
6. ✅ Se manejarán correctamente los estados de carga y error
7. ✅ Se validarán permisos antes de mostrar opciones

## 📝 Notas Adicionales

### Compatibilidad con Datos Mock
- Durante la transición, se puede mantener compatibilidad con datos mock como fallback
- Una vez verificado que la API funciona correctamente, eliminar completamente los datos mock

### Migración de Datos
- Los pagos mock existentes en el contexto no se migrarán automáticamente
- Los usuarios deberán procesar nuevos pagos a través de la API

### Mejoras Futuras
- Agregar filtros avanzados (por fecha, estado, método de pago)
- Agregar gráficos de pagos (dashboard)
- Agregar exportación a otros formatos (CSV, PDF)
- Agregar notificaciones en tiempo real de nuevos pagos

