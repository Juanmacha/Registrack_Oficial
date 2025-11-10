# 📋 PLAN DE IMPLEMENTACIÓN: Integración de Mis Procesos con API

## 🎯 OBJETIVO

Integrar el componente `misProcesos.jsx` con el endpoint `GET /api/gestion-solicitudes/mias` para que muestre las solicitudes reales del usuario autenticado desde la base de datos.

---

## 📊 ANÁLISIS ACTUAL

### Estado Actual:
1. **Endpoint API**: ✅ Ya existe `GET /api/gestion-solicitudes/mias`
2. **Servicio API**: ✅ Ya existe `solicitudesApiService.getMisSolicitudes(token)`
3. **Transformación**: ✅ Ya existe `transformarRespuestaDelAPI()` que convierte datos del backend al formato del frontend
4. **Hook de sincronización**: ✅ Ya existe `useSalesSync()` que maneja la carga asíncrona
5. **Componente**: ✅ Ya está estructurado para recibir datos transformados

### Problemas Identificados:
1. **❌ Servicios desde Mock**: `obtenerServicios()` usa `ServiceService.getAll()` (datos mock) en lugar de la API
2. **⚠️ Transformación de datos**: Ya funciona, pero puede necesitar ajustes para campos específicos
3. **⚠️ Manejo de errores**: El componente no muestra estados de carga ni errores claramente
4. **⚠️ Filtrado de estados**: La función `filtrarProcesos()` usa estados hardcodeados que pueden no coincidir con los del backend

---

## 🔧 IMPLEMENTACIÓN PROPUESTA

### **PASO 1: Actualizar `procesosService.js` para usar API de Servicios**

**Archivo**: `Registrack_Frontend1/src/features/dashboard/pages/misProcesos/services/procesosService.js`

**Cambios**:
1. ✅ **Ya funciona**: `getSolicitudesUsuario()` ya usa la API correctamente
2. ❌ **Actualizar**: `obtenerServicios()` para usar `serviciosApiService.getServicios()` en lugar de `ServiceService.getAll()`
3. ✅ **Mantener**: Fallback a datos mock si la API falla (para desarrollo)

**Código propuesto**:
```javascript
import serviciosApiService from '../../gestionVentasServicios/services/serviciosApiService';

export async function obtenerServicios() {
  try {
    // Intentar obtener desde API
    const servicios = await serviciosApiService.getServicios();
    return Array.isArray(servicios) ? servicios : [];
  } catch (error) {
    console.error('❌ [ProcesosService] Error obteniendo servicios desde API, usando datos mock:', error);
    // Fallback a datos mock
    const servs = ServiceService.getAll();
    return Array.isArray(servs) ? servs : [];
  }
}
```

---

### **PASO 2: Mejorar manejo de estados y errores en `misProcesos.jsx`**

**Archivo**: `Registrack_Frontend1/src/features/dashboard/pages/misProcesos/misProcesos.jsx`

**Cambios**:
1. ✅ **Mostrar estado de carga**: Agregar indicador de carga mientras se obtienen los datos
2. ✅ **Mostrar errores**: Mostrar mensajes de error claros si falla la carga
3. ✅ **Cargar servicios desde API**: Usar función async para cargar servicios
4. ✅ **Manejar casos vacíos**: Mostrar mensajes apropiados cuando no hay procesos

**Código propuesto**:
```javascript
// Cambiar obtenerServicios() a función async
useEffect(() => {
  const cargarServicios = async () => {
    try {
      const serviciosAPI = await obtenerServicios();
      setServicios(serviciosAPI);
    } catch (err) {
      console.error('Error cargando servicios:', err);
      setError('Ocurrió un error al cargar los servicios.');
    }
  };
  cargarServicios();
}, []);

// Agregar indicador de carga
if (loading) {
  return (
    <>
      <NavBarLanding />
      <div className="pt-32 p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando tus procesos...</p>
      </div>
    </>
  );
}

// Agregar manejo de errores
if (errorProcesos) {
  return (
    <>
      <NavBarLanding />
      <div className="pt-32 p-8 text-center text-red-600">
        <p className="font-bold">Error al cargar tus procesos</p>
        <p className="text-sm mt-2">{errorProcesos.message || 'Por favor, intenta recargar la página.'}</p>
      </div>
    </>
  );
}
```

---

### **PASO 3: Mejorar función `filtrarProcesos()` para usar estados dinámicos**

**Archivo**: `Registrack_Frontend1/src/features/dashboard/pages/misProcesos/services/procesosService.js`

**Cambios**:
1. ✅ **Estados dinámicos**: En lugar de hardcodear estados como "Aprobado", "Rechazado", etc., usar los estados del proceso del servicio
2. ✅ **Mejor detección**: Verificar si el estado actual está en la lista de estados finales del servicio

**Código propuesto**:
```javascript
export function filtrarProcesos(procesos, finalizados = false, servicios = []) {
  if (!Array.isArray(procesos)) return [];
  
  // Estados que siempre se consideran finalizados (compatibilidad)
  const estadosFinalesHardcodeados = ["Aprobado", "Rechazado", "Anulado", "Finalizado"];
  
  if (finalizados) {
    return procesos.filter((p) => {
      // Verificar si el estado está en los estados finales hardcodeados
      if (estadosFinalesHardcodeados.includes(p.estado)) {
        return true;
      }
      
      // Verificar si el estado está en los estados finales del servicio
      const servicio = servicios.find(s => s && s.nombre === p.tipoSolicitud);
      if (servicio && servicio.process_states) {
        const estadosFinales = servicio.process_states.filter(e => e.es_final === true);
        return estadosFinales.some(e => e.status_key === p.estado || e.name === p.estado);
      }
      
      return false;
    });
  } else {
    return procesos.filter((p) => {
      // Verificar si NO está en los estados finales hardcodeados
      if (estadosFinalesHardcodeados.includes(p.estado)) {
        return false;
      }
      
      // Verificar si NO está en los estados finales del servicio
      const servicio = servicios.find(s => s && s.nombre === p.tipoSolicitud);
      if (servicio && servicio.process_states) {
        const estadosFinales = servicio.process_states.filter(e => e.es_final === true);
        return !estadosFinales.some(e => e.status_key === p.estado || e.name === p.estado);
      }
      
      return true;
    });
  }
}
```

**Nota**: Si el backend no tiene el campo `es_final` en `process_states`, podemos usar el último estado del proceso como estado final.

---

### **PASO 4: Verificar y ajustar `transformarRespuestaDelAPI()` si es necesario**

**Archivo**: `Registrack_Frontend1/src/features/dashboard/pages/gestionVentasServicios/services/solicitudesApiService.js`

**Cambios**:
1. ✅ **Verificar campos**: Asegurar que todos los campos necesarios se transformen correctamente
2. ✅ **Campos específicos de Mis Procesos**: 
   - `nombreMarca` ✅ Ya se mapea
   - `expediente` ✅ Ya se mapea
   - `tipoSolicitud` ✅ Ya se mapea
   - `estado` ✅ Ya se mapea
   - `fechaCreacion` ✅ Ya se mapea
   - `fechaSolicitud` ✅ Ya se mapea (para mostrar en "Última actualización")
   - `pais` ✅ Ya se mapea
   - `nombreCompleto` ✅ Ya se mapea

**Verificación**: La función ya está bien implementada, solo necesita verificar que el backend devuelva los campos correctos.

---

### **PASO 5: Ajustar componente para usar servicios cargados desde API**

**Archivo**: `Registrack_Frontend1/src/features/dashboard/pages/misProcesos/misProcesos.jsx`

**Cambios**:
1. ✅ **Pasar servicios a `filtrarProcesos()`**: Para que pueda usar estados dinámicos
2. ✅ **Actualizar función de filtrado**: Usar servicios cargados desde API

**Código propuesto**:
```javascript
// Procesos filtrados (pasar servicios como parámetro)
const procesosActivos = filtrarProcesos(procesos, false, servicios);
const procesosHistorial = filtrarProcesos(procesos, true, servicios);
```

---

## 📝 RESUMEN DE CAMBIOS

### Archivos a Modificar:

1. **`procesosService.js`**
   - ✅ Cambiar `obtenerServicios()` a función async que use `serviciosApiService`
   - ✅ Mejorar `filtrarProcesos()` para usar estados dinámicos del servicio

2. **`misProcesos.jsx`**
   - ✅ Agregar indicador de carga
   - ✅ Agregar manejo de errores
   - ✅ Cambiar carga de servicios a async
   - ✅ Pasar servicios a `filtrarProcesos()`

3. **`solicitudesApiService.js`** (solo verificación)
   - ✅ Verificar que `transformarRespuestaDelAPI()` mapee todos los campos necesarios

---

## 🧪 PRUEBAS

### Casos de Prueba:

1. **✅ Carga exitosa**:
   - Usuario autenticado con solicitudes
   - Verificar que se muestren todas las solicitudes
   - Verificar que se muestren los estados correctos

2. **✅ Sin solicitudes**:
   - Usuario sin solicitudes
   - Verificar que se muestre mensaje "No tienes procesos registrados"

3. **✅ Error de API**:
   - Simular error de API
   - Verificar que se muestre mensaje de error apropiado

4. **✅ Estados dinámicos**:
   - Verificar que los estados del proceso se muestren correctamente según el servicio
   - Verificar que el timeline funcione con estados dinámicos

5. **✅ Filtrado**:
   - Verificar que el filtrado por servicio funcione
   - Verificar que el filtrado por búsqueda funcione
   - Verificar que la separación entre activos e historial funcione

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. **PASO 1**: Actualizar `obtenerServicios()` en `procesosService.js`
2. **PASO 2**: Mejorar manejo de estados y errores en `misProcesos.jsx`
3. **PASO 3**: Mejorar `filtrarProcesos()` para usar estados dinámicos
4. **PASO 4**: Verificar `transformarRespuestaDelAPI()` (solo verificación)
5. **PASO 5**: Ajustar componente para usar servicios cargados desde API

---

## ⚠️ CONSIDERACIONES

1. **Backend**: Verificar que el endpoint `GET /api/gestion-solicitudes/mias` devuelva todos los campos necesarios
2. **Estados**: Verificar que el backend devuelva los `process_states` correctos en cada servicio
3. **Fallback**: Mantener fallback a datos mock para desarrollo local
4. **Performance**: Considerar caché de servicios si se cargan frecuentemente
5. **Error handling**: Asegurar que los errores se manejen correctamente y no rompan la UI

---

## ✅ CHECKLIST

- [ ] Actualizar `obtenerServicios()` para usar API
- [ ] Agregar indicador de carga en `misProcesos.jsx`
- [ ] Agregar manejo de errores en `misProcesos.jsx`
- [ ] Mejorar `filtrarProcesos()` para usar estados dinámicos
- [ ] Pasar servicios a `filtrarProcesos()` en `misProcesos.jsx`
- [ ] Verificar que `transformarRespuestaDelAPI()` mapee todos los campos
- [ ] Probar carga exitosa
- [ ] Probar sin solicitudes
- [ ] Probar error de API
- [ ] Probar estados dinámicos
- [ ] Probar filtrado

---

## 📄 DOCUMENTACIÓN ADICIONAL

- **Endpoint API**: `GET /api/gestion-solicitudes/mias`
- **Servicio API**: `solicitudesApiService.getMisSolicitudes(token)`
- **Transformación**: `solicitudesApiService.transformarRespuestaDelAPI()`
- **Servicios API**: `serviciosApiService.getServicios()`

---

**Fecha**: 2025-01-XX  
**Autor**: Plan de implementación  
**Estado**: Pendiente de aprobación

