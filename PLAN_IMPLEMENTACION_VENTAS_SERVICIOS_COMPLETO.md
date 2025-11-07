# 📋 PLAN DE IMPLEMENTACIÓN: VENTAS DE SERVICIOS - CONEXIÓN COMPLETA CON API

**Fecha**: 28 de Octubre de 2025  
**Estado**: 🟡 En Análisis  
**Prioridad**: 🔴 **CRÍTICA**

---

## 📊 RESUMEN EJECUTIVO

Analizando la documentación de la API y el módulo actual de ventas de servicios para identificar qué funcionalidades ya están conectadas y cuáles faltan implementar.

---

## ✅ ESTADO ACTUAL DE LA CONEXIÓN

### **🔗 Ya Conectado a la API**

#### **1. SolicitudesApiService** (`solicitudesApiService.js`) - ✅ **COMPLETO**
```javascript
✅ getAllSolicitudes() - GET /api/gestion-solicitudes
✅ getMisSolicitudes() - GET /api/gestion-solicitudes/mias
✅ getSolicitudById() - GET /api/gestion-solicitudes/:id
✅ crearSolicitud() - POST /api/gestion-solicitudes/crear/:servicio
✅ editarSolicitud() - PUT /api/gestion-solicitudes/editar/:id
✅ anularSolicitud() - PUT /api/gestion-solicitudes/anular/:id
✅ buscarSolicitudes() - GET /api/gestion-solicitudes/buscar
✅ asignarEmpleado() - PUT /api/gestion-solicitudes/asignar-empleado/:id
✅ getEmpleadoAsignado() - GET /api/gestion-solicitudes/:id/empleado-asignado
✅ getEstadosDisponibles() - GET /api/gestion-solicitudes/:id/estados-disponibles
✅ getEstadoActual() - GET /api/gestion-solicitudes/:id/estado-actual

✅ transformarDatosParaAPI() - Transformación frontend → backend
✅ transformarRespuestaDelAPI() - Transformación backend → frontend
✅ mapearEstadoAPIaFrontend() - Mapeo de estados dinámicos
```

#### **2. ServiciosApiService** (`serviciosApiService.js`) - ✅ **COMPLETO**
```javascript
✅ getServicios() - GET /api/servicios
✅ getServicioById() - GET /api/servicios/:id
✅ updateServicio() - PUT /api/servicios/:id
✅ toggleVisibilidadServicio() - Cambiar visible_en_landing
✅ updateLandingData() - Actualizar landing_data
✅ updateProcessStates() - Actualizar process_states
```

#### **3. VentasService** (`ventasService.js`) - ✅ **PARCIALMENTE CONECTADO**
```javascript
✅ getInProcess() - Usa getAllSolicitudes() + transformar
✅ getByEstado() - Usa getAllSolicitudes() + filtrar + transformar
✅ buscarSolicitudes() - Usa buscarSolicitudes() + transformar
❌ crearVenta() - Usa MOCK, necesita usar crearSolicitud()
❌ actualizarVenta() - Usa MOCK, necesita usar editarSolicitud()
❌ anularVenta() - Usa MOCK, necesita usar anularSolicitud()
❌ agregarComentario() - Usa MOCK, no existe endpoint aún
```

---

## 🚧 FUNCIONALIDADES FALTANTES

### **📌 PRIORIDAD 1: CRÍTICO - Funcionalidades Básicas**

#### **1.1. Editar Venta (editarVenta.jsx)**
**Estado Actual**: ❌ Usa datos MOCK  
**Necesita**: Conectar con `PUT /api/gestion-solicitudes/editar/:id`

**Implementación**:
```javascript
// En editarVenta.jsx
import solicitudesApiService from '../services/solicitudesApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';

const handleGuardar = async (datos) => {
  const { getToken } = useAuth();
  const token = getToken();
  
  try {
    const datosAPI = solicitudesApiService.transformarDatosParaAPI(datos, venta.tipoSolicitud);
    await solicitudesApiService.editarSolicitud(venta.id, datosAPI, token);
    AlertService.success('Solicitud actualizada correctamente');
    onClose();
  } catch (error) {
    AlertService.error('Error al actualizar solicitud');
  }
};
```

**Campos editables según API**:
- `pais`, `ciudad`, `codigo_postal`, `total_estimado` (>0)
- `tipodepersona`, `tipodedocumento`, `numerodedocumento`
- `nombrecompleto`, `correoelectronico`, `telefono`, `direccion`
- `tipodeentidadrazonsocial`, `nombredelaempresa`, `nit`
- `poderdelrepresentanteautorizado`, `poderparaelregistrodelamarca`

---

#### **1.2. Anular Venta (tablaVentasProceso.jsx)**
**Estado Actual**: ✅ YA CONECTADO  
**Estado**: Funciona correctamente  
**Verificación**: Confirmar que funciona con motivo

---

#### **1.3. Asignar Empleado**
**Estado Actual**: ⚠️ PARCIALMENTE IMPLEMENTADO  
**Componente**: `ModalAsignarEmpleado` (en tablaVentasProceso.jsx)

**Verificación Necesaria**:
1. ¿Existe modal de asignación?
2. ¿Está conectado a `asignarEmpleado()`?
3. ¿Muestra lista de empleados disponibles?

**Implementación Pendiente** (si falta):
```javascript
// Obtener lista de empleados
import empleadosApiService from '../../../../dashboard/services/empleadosApiService';

const cargarEmpleados = async () => {
  const { getToken } = useAuth();
  const token = getToken();
  const empleados = await empleadosApiService.getAllEmpleados(token);
  setEmpleadosDisponibles(empleados);
};

// Asignar empleado
const handleAsignar = async (idEmpleado) => {
  try {
    await solicitudesApiService.asignarEmpleado(solicitudId, idEmpleado, token);
    AlertService.success('Empleado asignado correctamente');
    onClose();
  } catch (error) {
    AlertService.error('Error al asignar empleado');
  }
};
```

---

### **📌 PRIORIDAD 2: IMPORTANTE - Funcionalidades de Gestión**

#### **2.1. Observaciones/Comentarios (observaciones.jsx)**
**Estado Actual**: ❌ Usa MOCK  
**Problema**: No existe endpoint específico de comentarios

**Opciones**:
1. **Usar Seguimiento**: Los comentarios van en `POST /api/seguimiento/crear`
   - Campo: `descripcion` o `comentarios`
   - Se asocia con `id_orden_servicio`
2. **Crear endpoint nuevo** (requiere backend)
   - POST `/api/gestion-solicitudes/:id/comentarios`
   - GET `/api/gestion-solicitudes/:id/comentarios`

**Implementación Sugerida** (Opción 1):
```javascript
import seguimientoApiService from '../services/seguimientoApiService';

const agregarComentario = async (solicitudId, comentario) => {
  const { getToken } = useAuth();
  const token = getToken();
  
  try {
    await seguimientoApiService.crearSeguimiento({
      id_orden_servicio: solicitudId,
      titulo: 'Comentario',
      descripcion: comentario
    }, token);
    AlertService.success('Comentario agregado');
  } catch (error) {
    AlertService.error('Error al agregar comentario');
  }
};
```

**⚠️ NECESARIO**: Crear `seguimientoApiService.js` si no existe

---

#### **2.2. Ver Detalle Venta (verDetalleVenta.jsx)**
**Estado Actual**: ✅ Ya usa `transformarRespuestaDelAPI`  
**Verificación**: Confimar que muestra todos los campos correctamente

**Campos que debe mostrar** (según API con 36 campos):
- Información básica (id, expediente, titular, marca, tipo)
- Estado actual y proceso
- Datos del solicitante (documento, teléfono, dirección)
- Datos de empresa (si aplica)
- Empleado asignado
- Fechas (creación, fin)
- Archivos adjuntos (si hay endpoint)

---

#### **2.3. Gestión de Estados**
**Estado Actual**: ✅ Backend tiene estados dinámicos  
**Verificación**: Confirmar que el frontend maneja correctamente:
- Estados dinámicos del `process_states` del servicio
- Estados terminales (`Anulada`, `Rechazada`, `Finalizada`)
- Cambio de estados (desde seguimiento)

**Implementación Pendiente**:
```javascript
// En tablaVentasProceso.jsx o componente de seguimiento
const cambiarEstado = async (solicitudId, nuevoEstado) => {
  try {
    // Verificar estados disponibles
    const estadosDisponibles = await solicitudesApiService.getEstadosDisponibles(solicitudId, token);
    
    if (!estadosDisponibles.includes(nuevoEstado)) {
      AlertService.error('Estado no válido para este servicio');
      return;
    }
    
    // Crear seguimiento con cambio de estado
    await seguimientoApiService.crearSeguimiento({
      id_orden_servicio: solicitudId,
      titulo: 'Cambio de estado',
      descripcion: `Estado cambiado a: ${nuevoEstado}`,
      nuevo_proceso: nuevoEstado
    }, token);
    
    AlertService.success('Estado actualizado');
  } catch (error) {
    AlertService.error('Error al cambiar estado');
  }
};
```

---

### **📌 PRIORIDAD 3: NUEVAS FUNCIONALIDADES**

#### **3.1. Servicios API Service - Crear Seguimiento**
**Estado Actual**: ❌ NO EXISTE  
**Necesario**: Crear `seguimientoApiService.js`

**Implementación**:
```javascript
// services/seguimientoApiService.js
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class SeguimientoApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ [SeguimientoApiService] Error:', error);
      throw error;
    }
  }

  // GET /api/seguimiento/historial/:idOrdenServicio
  async getHistorial(idOrdenServicio, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Obteniendo historial de solicitud ${idOrdenServicio}...`);
      const historial = await this.makeRequest(`/api/seguimiento/historial/${idOrdenServicio}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ [SeguimientoApiService] Historial obtenido:', historial.length);
      return historial;
    } catch (error) {
      console.error('❌ [SeguimientoApiService] Error obteniendo historial:', error);
      throw error;
    }
  }

  // POST /api/seguimiento/crear
  async crearSeguimiento(datos, token) {
    try {
      console.log('🔧 [SeguimientoApiService] Creando seguimiento...', datos);
      const seguimiento = await this.makeRequest('/api/seguimiento/crear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(datos)
      });
      console.log('✅ [SeguimientoApiService] Seguimiento creado:', seguimiento);
      return seguimiento;
    } catch (error) {
      console.error('❌ [SeguimientoApiService] Error creando seguimiento:', error);
      throw error;
    }
  }

  // GET /api/seguimiento/:id
  async getSeguimientoById(id, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Obteniendo seguimiento ${id}...`);
      const seguimiento = await this.makeRequest(`/api/seguimiento/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ [SeguimientoApiService] Seguimiento obtenido:', seguimiento);
      return seguimiento;
    } catch (error) {
      console.error('❌ [SeguimientoApiService] Error obteniendo seguimiento:', error);
      throw error;
    }
  }

  // PUT /api/seguimiento/:id
  async updateSeguimiento(id, datos, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Actualizando seguimiento ${id}...`, datos);
      const seguimiento = await this.makeRequest(`/api/seguimiento/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(datos)
      });
      console.log('✅ [SeguimientoApiService] Seguimiento actualizado:', seguimiento);
      return seguimiento;
    } catch (error) {
      console.error('❌ [SeguimientoApiService] Error actualizando seguimiento:', error);
      throw error;
    }
  }

  // DELETE /api/seguimiento/:id
  async deleteSeguimiento(id, token) {
    try {
      console.log(`🔧 [SeguimientoApiService] Eliminando seguimiento ${id}...`);
      const seguimiento = await this.makeRequest(`/api/seguimiento/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ [SeguimientoApiService] Seguimiento eliminado:', seguimiento);
      return seguimiento;
    } catch (error) {
      console.error('❌ [SeguimientoApiService] Error eliminando seguimiento:', error);
      throw error;
    }
  }
}

const seguimientoApiService = new SeguimientoApiService();
export default seguimientoApiService;
```

---

#### **3.2. Archivos API Service**
**Estado Actual**: ❌ NO EXISTE  
**Necesario**: Crear `archivosApiService.js` para subir/descargar archivos

**Implementación**:
```javascript
// services/archivosApiService.js
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class ArchivosApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
  }

  // POST /api/archivos/upload
  async uploadArchivo(formData, token) {
    try {
      console.log('🔧 [ArchivosApiService] Subiendo archivo...');
      const response = await fetch(`${this.baseURL}/api/archivos/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      const archivo = await response.json();
      console.log('✅ [ArchivosApiService] Archivo subido:', archivo);
      return archivo;
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error subiendo archivo:', error);
      throw error;
    }
  }

  // GET /api/archivos/:id/download
  async downloadArchivo(id, token) {
    try {
      console.log(`🔧 [ArchivosApiService] Descargando archivo ${id}...`);
      const response = await fetch(`${this.baseURL}/api/archivos/${id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Error ${response.status}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archivo-${id}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ [ArchivosApiService] Archivo descargado');
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error descargando archivo:', error);
      throw error;
    }
  }

  // GET /api/archivos/cliente/:idCliente
  async getArchivosPorCliente(idCliente, token) {
    try {
      console.log(`🔧 [ArchivosApiService] Obteniendo archivos del cliente ${idCliente}...`);
      const archivos = await this.makeRequest(`/api/archivos/cliente/${idCliente}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ [ArchivosApiService] Archivos obtenidos:', archivos.length);
      return archivos;
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error obteniendo archivos:', error);
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = { ...options };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ [ArchivosApiService] Error:', error);
      throw error;
    }
  }
}

const archivosApiService = new ArchivosApiService();
export default archivosApiService;
```

---

## 📋 PLAN DE IMPLEMENTACIÓN POR FASES

### **🟢 FASE 1: Servicios Base** (1-2 días)

#### **1.1. Crear seguimientoApiService.js**
- [x] Estructura base del servicio
- [ ] Implementar `getHistorial()`
- [ ] Implementar `crearSeguimiento()`
- [ ] Implementar `getSeguimientoById()`
- [ ] Implementar `updateSeguimiento()`
- [ ] Implementar `deleteSeguimiento()`
- [ ] Testing básico

#### **1.2. Crear archivosApiService.js**
- [x] Estructura base del servicio
- [ ] Implementar `uploadArchivo()`
- [ ] Implementar `downloadArchivo()`
- [ ] Implementar `getArchivosPorCliente()`
- [ ] Testing básico

---

### **🟡 FASE 2: Conectar Funcionalidades Existentes** (2-3 días)

#### **2.1. Conectar editarVenta.jsx**
- [ ] Reemplazar MOCK por `editarSolicitud()`
- [ ] Mapear campos del formulario a API
- [ ] Manejar errores y loading
- [ ] Testing

#### **2.2. Conectar observaciones.jsx**
- [ ] Usar seguimientoApiService para comentarios
- [ ] Ajustar formulario si es necesario
- [ ] Mostrar historial de comentarios
- [ ] Testing

#### **2.3. Verificar verDetalleVenta.jsx**
- [ ] Confirmar que muestra todos los campos
- [ ] Añadir sección de archivos si falta
- [ ] Mostrar historial de seguimiento
- [ ] Testing

---

### **🟠 FASE 3: Funcionalidades Avanzadas** (3-4 días)

#### **3.1. Implementar Gestión de Estados**
- [ ] Componente para cambiar estados
- [ ] Integrar con `getEstadosDisponibles()`
- [ ] Validar estados permitidos
- [ ] Crear seguimiento con cambio de estado
- [ ] Testing

#### **3.2. Conectar Crear Venta**
- [ ] Reemplazar MOCK por `crearSolicitud()`
- [ ] Manejar todos los tipos de servicio
- [ ] Validación de campos
- [ ] Redirigir después de crear
- [ ] Testing

#### **3.3. Implementar Asignación de Empleado**
- [ ] Crear/verificar modal de asignación
- [ ] Conectar con `asignarEmpleado()`
- [ ] Cargar lista de empleados
- [ ] Mostrar empleado actual
- [ ] Testing

---

### **🔴 FASE 4: Mejoras y Optimizaciones** (2-3 días)

#### **4.1. Manejo de Archivos**
- [ ] Upload de archivos en formularios
- [ ] Download de archivos en detalle
- [ ] Visualización de archivos
- [ ] Validación de tipos y tamaños
- [ ] Testing

#### **4.2. Optimizaciones**
- [ ] Cache de datos
- [ ] Loading states
- [ ] Manejo de errores mejorado
- [ ] Notificaciones toast
- [ ] Testing

#### **4.3. Refactorización de Servicios**
- [ ] Eliminar dependencias de MOCK
- [ ] Consolidar lógica de transformación
- [ ] Documentación de servicios
- [ ] Code review

---

## 📊 RESUMEN DE ARCHIVOS A MODIFICAR

### **✅ Archivos Ya Conectados**
1. ✅ `solicitudesApiService.js` - **COMPLETO**
2. ✅ `serviciosApiService.js` - **COMPLETO**
3. ✅ `ventasService.js` (parcialmente)
4. ✅ `tablaVentasProceso.jsx` (anular venta)
5. ✅ `tablaVentasFin.jsx` (listar)
6. ✅ `CrearSolicitud.jsx` (crear venta)
7. ✅ `verDetalleVenta.jsx` (ver detalle)

### **❌ Archivos Necesarios**
1. ❌ `seguimientoApiService.js` - **CREAR**
2. ❌ `archivosApiService.js` - **CREAR**
3. ❌ `empleadosApiService.js` - Verificar si existe

### **⚠️ Archivos a Modificar**
1. ⚠️ `editarVenta.jsx` - Conectar con API
2. ⚠️ `observaciones.jsx` - Conectar con seguimiento
3. ⚠️ `ventasService.js` - Eliminar MOCK, usar API
4. ⚠️ `tablaVentasProceso.jsx` - Añadir asignar empleado

---

## 🎯 OBJETIVOS FINALES

### **Funcionalidades Principales**
- ✅ Crear solicitudes (COMPLETO)
- ✅ Listar solicitudes (COMPLETO)
- ✅ Ver detalle (COMPLETO)
- ✅ Anular solicitudes (COMPLETO)
- ⚠️ Editar solicitudes (PENDIENTE)
- ⚠️ Asignar empleados (PARCIAL)
- ⚠️ Comentarios/Observaciones (PENDIENTE)
- ⚠️ Cambiar estados (PENDIENTE)
- ❌ Gestionar archivos (PENDIENTE)

### **Servicios Necesarios**
- ✅ Solicitudes (COMPLETO)
- ✅ Servicios (COMPLETO)
- ⚠️ Seguimiento (PENDIENTE)
- ⚠️ Archivos (PENDIENTE)
- ⚠️ Empleados (VERIFICAR)

---

## 📝 NOTAS IMPORTANTES

### **Transformación de Datos**
- ✅ Ya existe `transformarDatosParaAPI()` - Frontend → Backend
- ✅ Ya existe `transformarRespuestaDelAPI()` - Backend → Frontend
- ⚠️ Verificar que mapee correctamente todos los campos

### **Estados Dinámicos**
- ✅ Backend usa `process_states` del servicio
- ✅ Frontend debe mostrar estados dinámicos
- ⚠️ Verificar que el cambio de estado funcione

### **Error Handling**
- ⚠️ Implementar manejo de errores consistente
- ⚠️ Usar AlertService para notificaciones
- ⚠️ Loading states en todos los componentes

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Tareas | Tiempo Estimado |
|------|--------|----------------|
| **FASE 1** | Servicios base | 1-2 días |
| **FASE 2** | Conectar existentes | 2-3 días |
| **FASE 3** | Funcionalidades avanzadas | 3-4 días |
| **FASE 4** | Mejoras | 2-3 días |
| **TOTAL** | | **8-12 días** |

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Análisis completado**
2. ⬜ **Crear seguimientoApiService.js**
3. ⬜ **Crear archivosApiService.js**
4. ⬜ **Conectar editarVenta.jsx**
5. ⬜ **Conectar observaciones.jsx**
6. ⬜ **Implementar gestión de estados**
7. ⬜ **Testing completo**
8. ⬜ **Documentación**

---

**Plan Creado** ✅  
**Listo para Implementar** 🚀

