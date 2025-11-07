# 📋 Plan de Trabajo: Mejoras en Solicitud de Citas

**Fecha**: 4 de Noviembre de 2025  
**Módulo**: Gestión de Solicitudes de Citas

---

## 🔍 Análisis del Estado Actual

### ✅ **1. Conexión con la API**

**Estado**: ✅ **YA ESTÁ CONECTADO**

El módulo de solicitudes de citas está completamente conectado con la API:

- ✅ **Componente Principal**: `SolicitudesCitas.jsx`
  - Usa `solicitudesCitasApiService.getAllSolicitudesCitas()` para cargar datos
  - Maneja estados de respuesta correctamente
  
- ✅ **Servicio API**: `solicitudesCitasApiService.js`
  - Endpoints implementados:
    - `getAllSolicitudesCitas()` → GET `/api/gestion-solicitud-cita`
    - `aprobarSolicitudCita()` → PUT `/api/gestion-solicitud-cita/:id/gestionar`
    - `rechazarSolicitudCita()` → PUT `/api/gestion-solicitud-cita/:id/gestionar`

**Conclusión**: No requiere cambios en la conexión con la API.

---

## 🎯 Problemas Identificados

### **Problema 1: Modal se sobrepasa de la pantalla**
**Ubicación**: `TablaSolicitudesCitas.jsx` - Función `handleAprobar()`

**Problema**:
- El modal de SweetAlert tiene contenido HTML que puede desbordarse en pantallas pequeñas
- No tiene scroll ni límites de altura máxima
- Los campos de entrada pueden ser difíciles de usar en dispositivos móviles

**Solución**:
- Convertir el modal de SweetAlert a un componente React personalizado
- Agregar clases de Tailwind para control de altura y scroll
- Implementar `max-h-[90vh]` y `overflow-y-auto`

---

### **Problema 2: Campo de ID de empleado como input numérico**
**Ubicación**: `TablaSolicitudesCitas.jsx` - Línea 31

**Problema Actual**:
```javascript
<input id="empleadoId" type="number" class="swal2-input" placeholder="ID del empleado asignado" required>
```

**Problemas**:
- ❌ El usuario debe conocer el ID del empleado manualmente
- ❌ No hay validación visual de qué empleados están disponibles
- ❌ Propenso a errores (ID incorrecto, empleado inexistente)
- ❌ No muestra información del empleado (nombre, cargo)

**Solución**:
- ✅ Cambiar a un `<select>` con lista de empleados activos
- ✅ Cargar empleados desde `empleadosApiService.getAllEmpleados()`
- ✅ Mostrar nombre completo del empleado en el select
- ✅ Filtrar solo empleados activos
- ✅ Pre-seleccionar empleado si ya está asignado a la solicitud

---

## 📝 Plan de Implementación

### **Fase 1: Crear Componente Modal Personalizado**

**Archivo**: `Registrack_Frontend1/src/features/dashboard/pages/solicitudesCitas/components/ModalAprobarSolicitud.jsx`

**Componente Nuevo**:
```jsx
- Modal React personalizado (no SweetAlert)
- Estilos con Tailwind CSS
- Scroll interno si el contenido es grande
- Altura máxima: `max-h-[90vh]`
- Ancho máximo: `max-w-md` o `max-w-lg`
- Padding responsive
```

**Características**:
- ✅ No se sobrepasa de la pantalla
- ✅ Scroll interno si es necesario
- ✅ Responsive (mobile-friendly)
- ✅ Mejor UX que SweetAlert

---

### **Fase 2: Cargar Empleados desde API**

**En el componente `ModalAprobarSolicitud.jsx`**:

```javascript
// Estados
const [empleados, setEmpleados] = useState([]);
const [loadingEmpleados, setLoadingEmpleados] = useState(false);

// useEffect para cargar empleados
useEffect(() => {
  cargarEmpleados();
}, []);

const cargarEmpleados = async () => {
  setLoadingEmpleados(true);
  try {
    const result = await empleadosApiService.getAllEmpleados();
    if (result && result.success && Array.isArray(result.data)) {
      const empleadosActivos = result.data
        .filter(emp => 
          emp.estado_empleado !== false && 
          emp.estado_usuario !== false &&
          emp.estado_empleado !== 'Inactivo' &&
          emp.estado_usuario !== 'Inactivo'
        )
        .map(emp => ({
          id_empleado: emp.id_empleado,
          nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim(),
          nombre: emp.nombre || '',
          apellido: emp.apellido || ''
        }));
      setEmpleados(empleadosActivos);
    }
  } catch (error) {
    console.error('Error al cargar empleados:', error);
    alertService.error('Error', 'No se pudieron cargar los empleados');
  } finally {
    setLoadingEmpleados(false);
  }
};
```

---

### **Fase 3: Implementar Select de Empleados**

**En el componente `ModalAprobarSolicitud.jsx`**:

```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    <FaUser className="inline text-gray-400 mr-1" />
    Empleado Asignado <span className="text-red-500">*</span>
    {loadingEmpleados && (
      <span className="ml-2 text-blue-600 text-xs">
        <i className="bi bi-arrow-repeat animate-spin"></i> Cargando...
      </span>
    )}
  </label>
  <select
    name="empleadoId"
    value={formData.empleadoId}
    onChange={handleInputChange}
    disabled={loadingEmpleados}
    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 ${
      loadingEmpleados ? 'opacity-50 cursor-not-allowed' : ''
    } ${touched.empleadoId && errores.empleadoId ? 'border-red-500' : 'border-gray-300'}`}
    required
  >
    <option value="">
      {loadingEmpleados ? 'Cargando empleados...' : 'Seleccionar empleado...'}
    </option>
    {empleados.map(emp => (
      <option key={emp.id_empleado} value={emp.id_empleado}>
        {emp.nombreCompleto}
      </option>
    ))}
  </select>
  {loadingEmpleados && empleados.length === 0 && (
    <p className="text-blue-600 text-xs mt-1 flex items-center">
      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
      Cargando empleados desde la base de datos...
    </p>
  )}
  {!loadingEmpleados && empleados.length === 0 && (
    <p className="text-yellow-600 text-xs mt-1 flex items-center">
      <i className="bi bi-exclamation-triangle mr-2"></i>
      No hay empleados disponibles. Verifica que existan empleados activos en el sistema.
    </p>
  )}
  {touched.empleadoId && errores.empleadoId && (
    <p className="text-red-600 text-xs mt-1">{errores.empleadoId}</p>
  )}
</div>
```

---

### **Fase 4: Actualizar TablaSolicitudesCitas.jsx**

**Cambios**:

1. **Importar el nuevo componente**:
```javascript
import ModalAprobarSolicitud from './components/ModalAprobarSolicitud';
```

2. **Agregar estado para controlar el modal**:
```javascript
const [mostrarModalAprobar, setMostrarModalAprobar] = useState(false);
const [solicitudAprobar, setSolicitudAprobar] = useState(null);
```

3. **Reemplazar función `handleAprobar`**:
```javascript
const handleAprobar = (solicitud) => {
  setSolicitudAprobar(solicitud);
  setMostrarModalAprobar(true);
};
```

4. **Agregar función para manejar éxito**:
```javascript
const handleAprobarSuccess = async (empleadoId, horaFin, observacion) => {
  try {
    const result = await solicitudesCitasApiService.aprobarSolicitudCita(
      solicitudAprobar.id,
      empleadoId,
      horaFin,
      observacion
    );

    if (result.success) {
      await alertService.success('¡Solicitud Aprobada!', 'La solicitud ha sido aprobada y se ha creado la cita automáticamente.');
      cargarSolicitudes();
      setMostrarModalAprobar(false);
      setSolicitudAprobar(null);
    } else {
      await alertService.error('Error', result.message);
    }
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    await alertService.error('Error', 'Error al aprobar la solicitud');
  }
};
```

5. **Agregar el componente modal al JSX**:
```jsx
{mostrarModalAprobar && solicitudAprobar && (
  <ModalAprobarSolicitud
    isOpen={mostrarModalAprobar}
    onClose={() => {
      setMostrarModalAprobar(false);
      setSolicitudAprobar(null);
    }}
    solicitud={solicitudAprobar}
    onSuccess={handleAprobarSuccess}
  />
)}
```

---

## 📋 Estructura del Nuevo Modal

### **Campos del Formulario**:

1. **Información de la Solicitud** (solo lectura):
   - Cliente: Nombre completo
   - Fecha solicitada: `solicitud.fecha_solicitada`
   - Hora solicitada: `solicitud.hora_solicitada`

2. **Campos Editables**:
   - **Hora de Fin**: `<input type="time">` (requerido)
   - **Empleado Asignado**: `<select>` con lista de empleados (requerido)
   - **Observaciones**: `<textarea>` (opcional)

---

## ✅ Checklist de Implementación

### **Paso 1: Crear Componente Modal**
- [ ] Crear archivo `ModalAprobarSolicitud.jsx`
- [ ] Implementar estructura básica del modal
- [ ] Agregar estilos para evitar overflow
- [ ] Agregar botones de cerrar y enviar

### **Paso 2: Integrar Carga de Empleados**
- [ ] Importar `empleadosApiService`
- [ ] Agregar estado para empleados
- [ ] Implementar función `cargarEmpleados()`
- [ ] Agregar loading state y mensajes de error

### **Paso 3: Implementar Select de Empleados**
- [ ] Crear `<select>` con lista de empleados
- [ ] Filtrar solo empleados activos
- [ ] Agregar indicador de carga
- [ ] Agregar mensaje si no hay empleados

### **Paso 4: Actualizar TablaSolicitudesCitas**
- [ ] Importar nuevo componente modal
- [ ] Reemplazar función `handleAprobar`
- [ ] Agregar función `handleAprobarSuccess`
- [ ] Renderizar modal en el JSX

### **Paso 5: Validaciones**
- [ ] Validar que se seleccione un empleado
- [ ] Validar que se ingrese hora de fin
- [ ] Validar que hora de fin sea mayor que hora de inicio
- [ ] Mostrar mensajes de error apropiados

### **Paso 6: Pruebas**
- [ ] Probar en pantalla grande
- [ ] Probar en pantalla pequeña (móvil)
- [ ] Probar con muchos empleados
- [ ] Probar sin empleados disponibles
- [ ] Probar con carga lenta de empleados

---

## 🎨 Especificaciones de Diseño

### **Modal**:
- **Ancho máximo**: `max-w-md` (448px) o `max-w-lg` (512px)
- **Altura máxima**: `max-h-[90vh]`
- **Scroll**: `overflow-y-auto` en el contenido
- **Padding**: `p-6` o `p-4`
- **Responsive**: Adaptable a móviles

### **Select de Empleados**:
- **Estilo**: Similar al select del modal de agendar cita
- **Icono**: `<FaUser />` antes del label
- **Loading**: Spinner animado mientras carga
- **Disabled**: Cuando está cargando

---

## 📝 Notas Adicionales

1. **Pre-selección de Empleado**:
   - Si la solicitud ya tiene un empleado asignado (`solicitud.id_empleado_asignado` o `solicitud.empleado_asignado`), pre-seleccionarlo en el select

2. **Hora de Inicio**:
   - La hora de inicio viene de `solicitud.hora_solicitada`
   - Solo se permite editar la hora de fin

3. **Observaciones**:
   - Campo opcional
   - Se puede usar para notas adicionales sobre la aprobación

---

## 🔄 Flujo Completo

1. Usuario hace clic en "Aprobar" en una solicitud pendiente
2. Se abre el modal personalizado `ModalAprobarSolicitud`
3. El modal carga automáticamente los empleados desde la API
4. El usuario selecciona un empleado del select (no ingresa ID manualmente)
5. El usuario ingresa la hora de fin
6. El usuario puede agregar observaciones (opcional)
7. Al hacer clic en "Aprobar", se envía la solicitud a la API
8. Si es exitoso, se muestra mensaje de éxito y se recarga la lista
9. Si hay error, se muestra mensaje de error

---

## ✅ Resultado Esperado

### **Antes**:
- ❌ Modal de SweetAlert con HTML inline
- ❌ Campo de texto para ID de empleado
- ❌ Puede desbordarse en pantallas pequeñas
- ❌ Usuario debe conocer IDs manualmente

### **Después**:
- ✅ Modal React personalizado
- ✅ Select con lista de empleados
- ✅ No se desborda (scroll interno)
- ✅ Mejor UX y menos errores
- ✅ Responsive y mobile-friendly

