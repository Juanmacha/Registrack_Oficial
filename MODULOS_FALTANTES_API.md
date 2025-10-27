# 📋 MÓDULOS FALTANTES POR CONECTAR CON LA API

## 🎯 **RESUMEN EJECUTIVO**

Este documento identifica los módulos del frontend que aún **NO están conectados con la API real** y requieren migración de `mockDataService` a servicios API reales.

---

## ✅ **MÓDULOS YA CONECTADOS CON API REAL**

| Módulo | Estado | Archivo Principal | Servicio API |
|--------|--------|------------------|--------------|
| **Clientes** | ✅ Conectado | `gestionClientes.jsx` | `clientesApiService.js` |
| **Roles** | ✅ Conectado | `roles.jsx` | `rolesApiService.js` |
| **Solicitudes de Citas** | ✅ Conectado | `SolicitudesCitas.jsx` | `solicitudesCitasApiService.js` |
| **Usuarios** | ✅ Conectado | `gestionUsuarios.jsx` | `userApiService.js` |
| **Empleados** | ✅ Conectado | `empleados.jsx` | `empleadosApiService.js` |
| **Citas** | ✅ Conectado | `calendario.jsx` | `citasApiService.js` |
| **Servicios** | ✅ Conectado | `Servicios.jsx` | `serviciosApiService.js` |
| **Solicitudes/Procesos** | ✅ Conectado | `tablaVentasProceso.jsx` | `solicitudesApiService.js` |
| **Mis Procesos** | ✅ Conectado | `misProcesos.jsx` | `procesosService.js` |

---

## ✅ **MÓDULOS RECIÉN CONECTADOS**

### **1. 🛒 GESTIÓN DE VENTAS/SERVICIOS**
- **📊 Estado:** ✅ **COMPLETAMENTE CONECTADO** (Diciembre 2024)
- **🔧 Servicios API creados:**
  - `serviciosApiService.js` - Gestión completa de servicios
  - `solicitudesApiService.js` - Gestión completa de solicitudes/procesos
- **📋 Componentes actualizados:**
  - `Servicios.jsx` - Usa API real con fallback a mock
  - `tablaVentasProceso.jsx` - Usa API real con fallback a mock
  - `ventasService.js` - Funciones asíncronas con API
  - `procesosService.js` - Funciones asíncronas con API
- **🔗 Endpoints utilizados:**
  - `GET /api/servicios` - Obtener servicios
  - `PUT /api/servicios/:id` - Actualizar servicios
  - `GET /api/gestion-solicitudes` - Obtener solicitudes
  - `POST /api/gestion-solicitudes/crear/:servicio` - Crear solicitud
  - `PUT /api/gestion-solicitudes/editar/:id` - Editar solicitud
  - `PUT /api/gestion-solicitudes/anular/:id` - Anular solicitud
  - `GET /api/gestion-solicitudes/mias` - Mis solicitudes
  - `GET /api/gestion-solicitudes/buscar` - Buscar solicitudes

### **2. 📋 MIS PROCESOS**
- **📊 Estado:** ✅ **COMPLETAMENTE CONECTADO** (Diciembre 2024)
- **🔧 Servicios actualizados:**
  - `procesosService.js` - Usa API real con fallback a mock
  - `useAsyncDataSync.js` - Hook para datos asíncronos
- **📋 Componentes actualizados:**
  - `misProcesos.jsx` - Usa API real con fallback a mock
- **🔗 Endpoints utilizados:**
  - `GET /api/gestion-solicitudes/mias` - Mis solicitudes
  - `GET /api/gestion-solicitudes/buscar` - Buscar solicitudes

---

## ❌ **MÓDULOS FALTANTES POR CONECTAR**

### **1. 🛒 GESTIÓN DE VENTAS/SERVICIOS (LEGACY)**
- **📁 Ubicación:** `src/features/dashboard/pages/gestionVentasServicios/`
- **🔧 Archivos afectados:**
  - `components/Servicios.jsx` - Gestión de servicios
  - `components/CrearSolicitud.jsx` - Crear solicitudes
  - `components/editarVenta.jsx` - Editar ventas
  - `components/tablaVentasProceso.jsx` - Tabla de ventas en proceso
  - `components/tablaVentasFin.jsx` - Tabla de ventas finalizadas
  - `services/ventasService.js` - Servicio de ventas
  - `services/serviciosManagementService.js` - Servicio de gestión
- **📊 Servicio actual:** `mockDataService.SaleService`
- **🎯 Acciones requeridas:**
  - Crear `ventasApiService.js`
  - Crear `serviciosApiService.js`
  - Migrar CRUD de ventas/solicitudes
  - Migrar CRUD de servicios
  - Implementar estados de proceso
  - Conectar con sistema de archivos

### **2. 💰 GESTIÓN DE PAGOS**
- **📁 Ubicación:** `src/features/dashboard/pages/pagos/`
- **🔧 Archivos afectados:**
  - `components/tablaPagos.jsx` - Tabla de pagos
- **📊 Servicio actual:** `mockDataService.PaymentService`
- **🎯 Acciones requeridas:**
  - Crear `pagosApiService.js`
  - Migrar CRUD de pagos
  - Conectar con sistema de transacciones
  - Implementar estados de pago

### **3. 📊 MIS PROCESOS**
- **📁 Ubicación:** `src/features/dashboard/pages/misProcesos/`
- **🔧 Archivos afectados:**
  - `MisProcesos.jsx` - Página principal
  - `services/procesosService.js` - Servicio de procesos
- **📊 Servicio actual:** `mockDataService.SaleService`
- **🎯 Acciones requeridas:**
  - Crear `procesosApiService.js`
  - Migrar consulta de procesos por usuario
  - Conectar con sistema de seguimiento

### **4. 📈 DASHBOARD ADMINISTRATIVO**
- **📁 Ubicación:** `src/features/dashboard/pages/dashAdmin/`
- **🔧 Archivos afectados:**
  - `dashboard.jsx` - Dashboard principal
  - `components/GraficaResumenServicios.jsx` - Gráficas de resumen
- **📊 Servicio actual:** Múltiples servicios mock
- **🎯 Acciones requeridas:**
  - Crear `dashboardApiService.js`
  - Migrar estadísticas y métricas
  - Conectar gráficas con datos reales
  - Implementar KPIs del sistema

---

## 🔧 **ESTRUCTURA DE SERVICIOS API REQUERIDOS**

### **📁 Servicios a Crear:**
```
src/features/dashboard/services/
├── ventasApiService.js           # Gestión de ventas/solicitudes
├── serviciosApiService.js        # Gestión de servicios
├── pagosApiService.js            # Gestión de pagos
├── procesosApiService.js         # Procesos de usuario
└── dashboardApiService.js        # Estadísticas y métricas
```

### **📋 Patrón de Implementación:**
```javascript
// Ejemplo: usuariosApiService.js
import API_CONFIG from "../../../shared/config/apiConfig";
import axios from "axios";

class UsuariosApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // CRUD Methods
  async getAllUsuarios() { /* ... */ }
  async getUsuarioById(id) { /* ... */ }
  async createUsuario(usuarioData) { /* ... */ }
  async updateUsuario(id, usuarioData) { /* ... */ }
  async deleteUsuario(id) { /* ... */ }
}

export default new UsuariosApiService();
```

---

## 📊 **ENDPOINTS API DISPONIBLES**

Según la documentación API, los siguientes endpoints están disponibles:

### **✅ Endpoints Ya Implementados:**
- `GET/POST /api/gestion-clientes` - Clientes
- `GET/POST /api/gestion-roles` - Roles
- `GET/POST /api/solicitudes-citas` - Solicitudes de citas
- `GET/POST /api/gestion-usuarios` - Usuarios
- `GET/POST /api/gestion-empleados` - Empleados
- `GET/POST /api/gestion-citas` - Citas

### **❌ Endpoints Pendientes por Conectar:**
- `GET/POST /api/gestion-ventas` - Ventas/Servicios
- `GET/POST /api/gestion-pagos` - Pagos
- `GET/POST /api/procesos-usuario` - Procesos de usuario
- `GET/POST /api/dashboard-stats` - Estadísticas del dashboard

---

## 🎯 **PRIORIDADES DE IMPLEMENTACIÓN**

### **🔥 ALTA PRIORIDAD**
1. **Gestión de Ventas/Servicios** - Core business del sistema
2. **Dashboard Administrativo** - Métricas y estadísticas

### **🟡 MEDIA PRIORIDAD**
3. **Gestión de Pagos** - Flujo financiero
4. **Mis Procesos** - Experiencia de usuario

---

## 📋 **CHECKLIST DE MIGRACIÓN**

Para cada módulo, el programador debe:

### **🔧 Fase 1: Preparación**
- [ ] Revisar documentación API del módulo
- [ ] Identificar endpoints disponibles
- [ ] Analizar estructura de datos actual vs API
- [ ] Planificar transformaciones de datos

### **🚀 Fase 2: Implementación**
- [ ] Crear servicio API (`*ApiService.js`)
- [ ] Implementar métodos CRUD
- [ ] Configurar interceptores de autenticación
- [ ] Implementar manejo de errores
- [ ] Agregar logging para debugging

### **🔄 Fase 3: Migración**
- [ ] Reemplazar imports de `mockDataService`
- [ ] Actualizar componentes para usar API service
- [ ] Migrar funciones de carga de datos
- [ ] Actualizar manejo de estados
- [ ] Implementar loading states

### **🧪 Fase 4: Testing**
- [ ] Probar CRUD completo
- [ ] Verificar manejo de errores
- [ ] Validar transformaciones de datos
- [ ] Probar con datos reales
- [ ] Verificar compatibilidad con otros módulos

### **📚 Fase 5: Documentación**
- [ ] Documentar nuevos endpoints
- [ ] Actualizar guía técnica
- [ ] Documentar cambios en estructura de datos
- [ ] Crear ejemplos de uso

---

## 🚨 **CONSIDERACIONES IMPORTANTES**

### **⚠️ Compatibilidad**
- Mantener compatibilidad con módulos ya conectados
- No romper funcionalidad existente
- Preservar estructura de datos del frontend

### **🔒 Seguridad**
- Implementar autenticación en todos los servicios
- Validar tokens en cada request
- Manejar errores de autorización

### **📊 Performance**
- Implementar loading states
- Optimizar requests innecesarios
- Usar caching cuando sea apropiado

### **🐛 Debugging**
- Agregar logging detallado
- Implementar manejo de errores consistente
- Facilitar debugging en desarrollo

---

## 📞 **SOPORTE**

Para dudas sobre la implementación:

1. **Revisar documentación API** en `documentacion api.md`
2. **Consultar servicios ya implementados** como referencia:
   - `clientesApiService.js`
   - `rolesApiService.js`
   - `solicitudesCitasApiService.js`
3. **Revisar configuración API** en `apiConfig.js`
4. **Consultar con el equipo** para dudas específicas

---

**🎯 OBJETIVO:** Migrar todos los módulos de `mockDataService` a servicios API reales para tener un sistema completamente funcional y conectado con el backend.

**⏰ ESTIMADO:** 1-2 semanas de desarrollo para completar los 4 módulos pendientes.

---

## 🤖 **GUÍA PARA IMPLEMENTAR CONEXIONES API**

### **📋 CÓMO PEDIR LA IMPLEMENTACIÓN**

Para que el asistente de IA implemente las conexiones API de los módulos faltantes, sigue estos pasos:

#### **1. 🎯 FORMATO DE SOLICITUD**

```
Necesito que implementes la conexión API para el módulo [NOMBRE_DEL_MÓDULO]

Módulo: [Gestión de Ventas/Servicios | Gestión de Pagos | Mis Procesos | Dashboard Administrativo]
Prioridad: [Alta | Media]
Tiempo estimado: [X horas/días]
```

#### **2. 📝 EJEMPLOS DE SOLICITUDES**

**Ejemplo 1 - Gestión de Ventas/Servicios:**
```
Necesito que implementes la conexión API para el módulo Gestión de Ventas/Servicios

Módulo: Gestión de Ventas/Servicios
Prioridad: Alta
Archivos a conectar:
- components/Servicios.jsx
- components/CrearSolicitud.jsx
- components/editarVenta.jsx
- components/tablaVentasProceso.jsx
- components/tablaVentasFin.jsx
- services/ventasService.js
- services/serviciosManagementService.js

Servicios API a crear:
- ventasApiService.js
- serviciosApiService.js

Endpoints disponibles:
- GET/POST /api/gestion-ventas
- GET/POST /api/gestion-servicios
```

**Ejemplo 2 - Gestión de Pagos:**
```
Necesito que implementes la conexión API para el módulo Gestión de Pagos

Módulo: Gestión de Pagos
Prioridad: Media
Archivos a conectar:
- components/tablaPagos.jsx

Servicios API a crear:
- pagosApiService.js

Endpoints disponibles:
- GET/POST /api/gestion-pagos
```

#### **3. 🔍 INFORMACIÓN ADICIONAL ÚTIL**

**Para cada solicitud, proporciona:**

- **📊 Estado actual:** ¿Qué servicio mock está usando actualmente?
- **🎯 Funcionalidades:** ¿Qué operaciones CRUD necesita?
- **📋 Datos específicos:** ¿Hay campos especiales o validaciones?
- **🔗 Dependencias:** ¿Se conecta con otros módulos ya implementados?

#### **4. 📋 CHECKLIST PRE-IMPLEMENTACIÓN**

Antes de solicitar, verifica:

- [ ] **Documentación API** - Revisa los endpoints disponibles en `documentacion api.md`
- [ ] **Estructura de datos** - Compara mock data vs API response
- [ ] **Dependencias** - Identifica qué módulos ya conectados necesita
- [ ] **Prioridad** - Define el orden de implementación
- [ ] **Testing** - Planifica cómo probar la implementación

#### **5. 🚀 PROCESO DE IMPLEMENTACIÓN**

**El asistente realizará:**

1. **📖 Análisis** - Revisará la documentación API y código actual
2. **🔧 Creación** - Creará los servicios API necesarios
3. **🔄 Migración** - Migrará los componentes de mock a API
4. **🧪 Testing** - Verificará que todo funcione correctamente
5. **📚 Documentación** - Actualizará la documentación si es necesario

#### **6. ⚠️ CONSIDERACIONES IMPORTANTES**

**Antes de implementar:**

- **🔒 Autenticación:** Asegúrate de que el token esté disponible
- **🌐 Backend:** Verifica que los endpoints estén funcionando
- **📊 Datos:** Confirma la estructura de datos del backend
- **🔗 Compatibilidad:** No romper módulos ya conectados

#### **7. 📞 SOPORTE POST-IMPLEMENTACIÓN**

**Después de implementar:**

- **🧪 Pruebas:** Testea todas las funcionalidades
- **🐛 Bugs:** Reporta errores específicos con logs
- **📈 Performance:** Verifica tiempos de respuesta
- **🔄 Iteraciones:** Solicita ajustes si es necesario

### **🎯 TEMPLATE DE SOLICITUD COMPLETA**

```
IMPLEMENTACIÓN API - [NOMBRE_MÓDULO]

📋 INFORMACIÓN BÁSICA:
- Módulo: [Nombre del módulo]
- Prioridad: [Alta/Media/Baja]
- Archivos afectados: [Lista de archivos]
- Servicios a crear: [Lista de servicios API]

🔧 DETALLES TÉCNICOS:
- Endpoints disponibles: [Lista de endpoints]
- Estructura de datos: [Descripción breve]
- Dependencias: [Módulos relacionados]

🧪 TESTING:
- Funcionalidades a probar: [Lista de pruebas]
- Datos de prueba: [Si los hay]
- Casos edge: [Casos especiales]

📞 SOPORTE:
- Contacto: [Tu información]
- Disponibilidad: [Horarios]
- Comunicación preferida: [Chat/Email]
```

### **💡 CONSEJOS ADICIONALES**

1. **🎯 Una solicitud a la vez** - Es mejor implementar módulo por módulo
2. **📊 Proporciona contexto** - Menciona el estado actual del sistema
3. **🔍 Sé específico** - Incluye detalles técnicos relevantes
4. **⏰ Planifica tiempo** - Reserva tiempo para testing y ajustes
5. **📚 Documenta cambios** - Mantén registro de lo implementado

### **🚀 EJEMPLO DE IMPLEMENTACIÓN EXITOSA**

```
✅ IMPLEMENTACIÓN COMPLETADA:

Módulo: Gestión de Ventas/Servicios
Estado: ✅ Conectado con API real
Servicios creados:
- ventasApiService.js ✅
- serviciosApiService.js ✅

Archivos migrados:
- components/Servicios.jsx ✅
- components/CrearSolicitud.jsx ✅
- components/editarVenta.jsx ✅
- components/tablaVentasProceso.jsx ✅
- components/tablaVentasFin.jsx ✅

Funcionalidades probadas:
- ✅ CRUD completo de ventas
- ✅ CRUD completo de servicios
- ✅ Estados de proceso
- ✅ Manejo de errores
- ✅ Loading states

Próximo paso: Implementar Gestión de Pagos
```

---

*Documento creado el: $(date)*
*Última actualización: $(date)*
