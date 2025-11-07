# 📋 Plan de Implementación - Agendar Cita desde Solicitud

## 🎯 Objetivo

Implementar la funcionalidad para agendar una cita asociada a una solicitud utilizando el endpoint `POST /api/gestion-citas/desde-solicitud/:idOrdenServicio` del backend. **El flujo redirige al calendario (`calendario.jsx`) con el modal de agendar cita pre-llenado automáticamente**, siguiendo el mismo patrón que las solicitudes de cita desde el landing.

---

## 📚 Información del Backend

### Endpoint
```
POST /api/gestion-citas/desde-solicitud/:idOrdenServicio
```

### Características según Documentación

1. **Datos Automáticos**: 
   - El `id_cliente` se obtiene automáticamente de la solicitud
   - El `tipo` de cita se toma automáticamente del tipo de servicio de la solicitud
   - No es necesario enviar estos campos

2. **Campos Requeridos** (basado en endpoint estándar de citas):
   - `fecha`: "YYYY-MM-DD" (string)
   - `hora_inicio`: "HH:MM:SS" (string)
   - `hora_fin`: "HH:MM:SS" (string)
   - `id_empleado`: number (ID del empleado asignado)

3. **Campos Opcionales**:
   - `modalidad`: "Presencial" | "Virtual" (string)
   - `observacion`: string (texto libre)
   - `estado`: string (default: "Programada")

4. **Validaciones del Backend**:
   - Fecha no puede ser pasada
   - Horario entre 07:00:00 y 18:00:00
   - `hora_inicio` < `hora_fin`
   - No puede traslapar con otra cita del mismo empleado (mismo día, ventana horaria)

5. **Funcionalidades Automáticas**:
   - Se crea un registro de seguimiento automático en la solicitud
   - Se envía email automático al cliente y empleado asignado
   - La cita queda vinculada con `id_orden_servicio`

---

## 🏗️ Plan de Implementación

### Fase 1: Preparación y Configuración

#### 1.1 Crear/Actualizar Servicio de API (`citasApiService.js`)
**Archivo:** `src/features/dashboard/services/citasApiService.js`

**Tarea:**
- [ ] Agregar método `crearCitaDesdeSolicitud(idOrdenServicio, datosCita, token)`
- [ ] Validar campos requeridos antes de enviar
- [ ] Manejar errores específicos del backend

**Método a implementar:**
```javascript
crearCitaDesdeSolicitud: async (idOrdenServicio, datosCita, token) => {
  // Validar: fecha, hora_inicio, hora_fin, id_empleado
  // Endpoint: POST /api/gestion-citas/desde-solicitud/:idOrdenServicio
  // Body: { fecha, hora_inicio, hora_fin, id_empleado, modalidad?, observacion? }
}
```

---

### Fase 2: Actualizar TablaVentasProceso para Redirigir al Calendario

#### 2.1 Actualizar `tablaVentasProceso.jsx`
**Archivo:** `src/features/dashboard/pages/gestionVentasServicios/components/tablaVentasProceso.jsx`

**Cambios necesarios:**

1. **Importar `useNavigate` de react-router-dom:**
   ```javascript
   import { useNavigate } from "react-router-dom";
   ```

2. **Agregar hook de navegación:**
   ```javascript
   const navigate = useNavigate();
   ```

3. **Modificar el onClick del botón "Agendar cita" en el dropdown:**
   ```javascript
   {
     icon: "bi bi-calendar-plus",
     label: "Agendar cita",
     title: "Agendar una cita asociada a esta solicitud",
     onClick: () => {
       // Guardar datos de la solicitud en localStorage para que calendario.jsx los detecte
       const solicitudParaAgendar = {
         idOrdenServicio: item.id,
         id_orden_servicio: item.id, // Para el endpoint
         clienteNombre: item.titular || item.nombrecompleto || '',
         clienteDocumento: item.cedula || item.documento || '',
         tipoDocumento: item.tipodedocumento || item.tipoDocumento || '',
         telefono: item.telefono || '',
         tipoSolicitud: item.tipoSolicitud || item.servicio || '',
         mensaje: item.observaciones || item.descripcion || '',
         // Datos adicionales de la solicitud para referencia
         solicitudData: item
       };
       
       localStorage.setItem('solicitudParaAgendar', JSON.stringify(solicitudParaAgendar));
       
       // Redirigir al calendario
       navigate('/admin/calendario');
     }
   }
   ```

4. **Eliminar estado `modalAgendarCitaOpen`** (ya no es necesario):
   ```javascript
   // Eliminar: const [modalAgendarCitaOpen, setModalAgendarCitaOpen] = useState(false);
   ```

---

### Fase 3: Actualizar Calendario.jsx para Detectar Solicitudes

#### 3.1 Modificar `calendario.jsx`
**Archivo:** `src/features/dashboard/pages/gestionCitas/calendario.jsx`

**Cambios necesarios:**

El componente ya tiene un `useEffect` que detecta `solicitudParaAgendar` (líneas 202-249), pero necesita actualizarse para manejar también solicitudes de ventas/servicios con `id_orden_servicio`.

**Actualizar el useEffect existente:**
```javascript
// ✅ ACTUALIZADO: useEffect para detectar solicitudes desde localStorage y abrir modal automáticamente
useEffect(() => {
  const solicitudParaAgendar = localStorage.getItem('solicitudParaAgendar');
  if (solicitudParaAgendar) {
    try {
      const solicitudData = JSON.parse(solicitudParaAgendar);
      
      // Separar nombre completo en nombre y apellido si es necesario
      const nombreCompleto = solicitudData.clienteNombre || "";
      const partesNombre = nombreCompleto.trim().split(' ');
      const nombre = partesNombre[0] || "";
      const apellido = partesNombre.slice(1).join(' ') || "";
      
      // Prellenar el formulario con los datos de la solicitud
      setFormData({
        nombre: nombre,
        apellido: apellido,
        cedula: solicitudData.clienteDocumento || "",
        tipoDocumento: solicitudData.tipoDocumento || "",
        telefono: solicitudData.telefono || "",
        tipoCita: solicitudData.tipoSolicitud || "",
        horaInicio: "",
        horaFin: "",
        asesor: "",
        detalle: solicitudData.mensaje || "",
      });

      // ✅ NUEVO: Guardar id_orden_servicio en el estado del componente para usarlo al guardar
      // Usaremos un estado adicional o lo pasaremos al handler de guardar
      setSolicitudAsociada({
        idOrdenServicio: solicitudData.idOrdenServicio || solicitudData.id_orden_servicio,
        esDesdeSolicitud: true,
        solicitudData: solicitudData.solicitudData
      });

      // Abrir el modal automáticamente
      setShowModal(true);
      
      // Limpiar el localStorage para evitar que se abra nuevamente
      localStorage.removeItem('solicitudParaAgendar');
      
      // Mostrar mensaje informativo
      Swal.fire({
        icon: 'info',
        title: 'Datos cargados automáticamente',
        text: `Se han cargado los datos de la solicitud de ${solicitudData.clienteNombre}. Solo necesitas seleccionar la fecha, hora y el asesor.`,
        timer: 3000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Error al procesar solicitud para agendar:', error);
      localStorage.removeItem('solicitudParaAgendar');
    }
  }
}, []); // Solo se ejecuta una vez al montar el componente
```

**Agregar nuevo estado para manejar solicitud asociada:**
```javascript
const [solicitudAsociada, setSolicitudAsociada] = useState(null); // { idOrdenServicio, esDesdeSolicitud, solicitudData }
```

---

### Fase 4: Modificar Handler de Guardar en Calendario.jsx

#### 4.1 Actualizar `handleGuardarCita` en `calendario.jsx`

**Modificar el handler para detectar si viene de una solicitud:**

```javascript
const handleGuardarCita = async (e) => {
  e.preventDefault();
  
  // ... validaciones existentes ...
  
  // ✅ NUEVO: Si viene de una solicitud, usar endpoint específico
  if (solicitudAsociada && solicitudAsociada.esDesdeSolicitud && solicitudAsociada.idOrdenServicio) {
    // Usar el endpoint POST /api/gestion-citas/desde-solicitud/:idOrdenServicio
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        AlertService.error('Error', 'No se encontró token de autenticación');
        return;
      }

      const idOrdenServicio = parseInt(solicitudAsociada.idOrdenServicio);
      const citaData = {
        fecha: fechaBase,
        hora_inicio: formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2 
          ? formData.horaInicio + ':00' 
          : formData.horaInicio,
        hora_fin: formData.horaFin.includes(':') && formData.horaFin.split(':').length === 2 
          ? formData.horaFin + ':00' 
          : formData.horaFin,
        id_empleado: parseInt(formData.asesor) || 1,
        modalidad: "Presencial", // Por defecto
        observacion: formData.detalle || ''
      };

      console.log('📅 [Calendario] Creando cita desde solicitud...', { idOrdenServicio, citaData });
      const result = await citasApiService.crearCitaDesdeSolicitud(idOrdenServicio, citaData, token);
      
      if (result.success) {
        await alertService.success(
          "Cita agendada",
          result.message || "La cita se ha agendado exitosamente y está asociada a la solicitud.",
          { confirmButtonText: "Entendido" }
        );
        
        cerrarModal();
        // Limpiar estado de solicitud asociada
        setSolicitudAsociada(null);
        // Recargar citas desde la API
        await cargarCitasDesdeAPI();
      } else {
        await alertService.error(
          "Error al agendar cita",
          result.message || "No se pudo agendar la cita. Intenta de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error('💥 [Calendario] Error al agendar cita desde solicitud:', error);
      await alertService.error(
        "Error",
        error.message || "No se pudo agendar la cita. Intenta de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsLoading(false);
    }
    return; // Salir temprano si viene de solicitud
  }
  
  // ... resto del código existente para crear citas normales ...
};
```

**Actualizar `cerrarModal` para limpiar estado de solicitud:**
```javascript
function cerrarModal() {
  setShowModal(false);
  setModalDate(null);
  setSolicitudAsociada(null); // ✅ Limpiar estado de solicitud asociada
  setFormData({
    nombre: "",
    apellido: "",
    cedula: "",
    tipoDocumento: "",
    telefono: "",
    tipoCita: "",
    horaInicio: "",
    horaFin: "",
    asesor: "",
    detalle: "",
  });
  setErrores({});
  setTouched({});
}
```

**Nota:** El modal de agendar cita ya existe en `calendario.jsx` y se usa tanto para citas normales como para citas desde solicitudes. Solo necesitamos modificarlo para detectar si viene de una solicitud y usar el endpoint correcto.

---

### Fase 5: Actualizar Servicio de Citas

#### 4.1 Agregar método en `citasApiService.js`

**Archivo:** `src/features/dashboard/services/citasApiService.js`

**Método a agregar:**
```javascript
// Crear cita asociada a una solicitud
crearCitaDesdeSolicitud: async (idOrdenServicio, datosCita, token) => {
  try {
    console.log(`📅 [CitasApiService] Creando cita desde solicitud ${idOrdenServicio}...`);
    console.log('📤 [CitasApiService] Datos de la cita:', datosCita);
    
    // Validar campos requeridos
    if (!datosCita.fecha || !datosCita.hora_inicio || !datosCita.hora_fin || !datosCita.id_empleado) {
      throw new Error('Faltan campos requeridos: fecha, hora_inicio, hora_fin, id_empleado');
    }
    
    // Construir payload según documentación
    const requestData = {
      fecha: datosCita.fecha,
      hora_inicio: datosCita.hora_inicio.includes(':') && datosCita.hora_inicio.split(':').length === 2 
        ? datosCita.hora_inicio + ':00' 
        : datosCita.hora_inicio,
      hora_fin: datosCita.hora_fin.includes(':') && datosCita.hora_fin.split(':').length === 2 
        ? datosCita.hora_fin + ':00' 
        : datosCita.hora_fin,
      id_empleado: parseInt(datosCita.id_empleado)
    };
    
    // Campos opcionales
    if (datosCita.modalidad) {
      requestData.modalidad = datosCita.modalidad;
    }
    
    if (datosCita.observacion && datosCita.observacion.trim()) {
      requestData.observacion = datosCita.observacion.trim();
    }
    
    console.log('📤 [CitasApiService] Payload final:', JSON.stringify(requestData, null, 2));
    
    // Llamar al endpoint específico
    const endpoint = `/api/gestion-citas/desde-solicitud/${idOrdenServicio}`;
    const response = await apiService.post(endpoint, requestData, token);
    
    console.log('✅ [CitasApiService] Cita creada exitosamente:', response);
    
    return {
      success: true,
      data: response.data || response,
      message: response.message || 'Cita agendada exitosamente'
    };
    
  } catch (error) {
    console.error('❌ [CitasApiService] Error al crear cita desde solicitud:', error);
    
    let errorMessage = 'Error al agendar la cita';
    
    if (error.response?.status === 400) {
      errorMessage = 'Datos inválidos: ' + (error.response.data?.mensaje || error.response.data?.message || '');
    } else if (error.response?.status === 409) {
      errorMessage = 'El empleado ya tiene una cita en ese horario';
    } else if (error.response?.status === 404) {
      errorMessage = 'La solicitud no existe';
    } else if (error.response?.data?.mensaje) {
      errorMessage = error.response.data.mensaje;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}
```

---

## 📝 Checklist de Implementación

### Fase 1: Servicio API
- [ ] Agregar método `crearCitaDesdeSolicitud` en `citasApiService.js`
- [ ] Validar estructura del payload
- [ ] Manejar errores específicos del backend
- [ ] Agregar logging para debugging

### Fase 2: Redirección en TablaVentasProceso
- [ ] Importar `useNavigate` de react-router-dom
- [ ] Modificar onClick del botón "Agendar cita" para guardar en localStorage
- [ ] Agregar navegación a `/admin/calendario`
- [ ] Eliminar estado `modalAgendarCitaOpen` (ya no es necesario)

### Fase 3: Actualizar Calendario.jsx
- [ ] Agregar estado `solicitudAsociada` para manejar solicitudes
- [ ] Actualizar useEffect existente para detectar `id_orden_servicio` en localStorage
- [ ] Modificar `handleGuardarCita` para detectar si viene de una solicitud
- [ ] Usar endpoint `crearCitaDesdeSolicitud` cuando `solicitudAsociada.esDesdeSolicitud === true`
- [ ] Actualizar `cerrarModal` para limpiar `solicitudAsociada`

### Fase 4: Testing
- [ ] Probar redirección desde tabla de solicitudes al calendario
- [ ] Verificar que el modal se abre automáticamente con datos pre-llenados
- [ ] Probar crear cita con todos los campos requeridos
- [ ] Probar validaciones de fecha (pasada, futura)
- [ ] Probar validaciones de horario (rango, inicio < fin)
- [ ] Probar con empleado seleccionado
- [ ] Probar con campos opcionales vacíos
- [ ] Verificar que se crea el seguimiento automático en la solicitud
- [ ] Verificar que la cita queda asociada con `id_orden_servicio`
- [ ] Probar manejo de errores (409 conflict, 404 not found, etc.)

---

## 🔍 Validaciones a Implementar

### Frontend
1. **Fecha**: 
   - No puede ser vacía
   - No puede ser pasada
   - Formato: YYYY-MM-DD

2. **Hora Inicio**:
   - No puede ser vacía
   - Debe estar entre 07:00 y 18:00
   - Formato: HH:MM

3. **Hora Fin**:
   - No puede ser vacía
   - Debe ser mayor que hora inicio
   - Debe estar entre 07:00 y 18:00
   - Formato: HH:MM

4. **Empleado**:
   - Debe estar seleccionado
   - Debe ser un ID válido

5. **Modalidad**:
   - Opcional (default: "Presencial")
   - Valores válidos: "Presencial" | "Virtual"

### Backend (se manejan automáticamente)
- Validación de solapamiento de horarios
- Validación de disponibilidad del empleado
- Validación de formato de fecha/hora
- Asignación automática de cliente y tipo

---

## 📊 Estructura de Datos

### Payload a Enviar
```javascript
{
  fecha: "2024-11-15",           // YYYY-MM-DD
  hora_inicio: "09:00:00",       // HH:MM:SS
  hora_fin: "10:00:00",          // HH:MM:SS
  id_empleado: 2,                // number
  modalidad: "Presencial",       // string (opcional)
  observacion: "Revisión de documentos"  // string (opcional)
}
```

### Respuesta Esperada
```javascript
{
  success: true,
  message: "Cita creada exitosamente",
  data: {
    id: 123,
    fecha: "2024-11-15",
    hora_inicio: "09:00:00",
    hora_fin: "10:00:00",
    tipo: "Certificación de Marca",
    modalidad: "Presencial",
    estado: "Programada",
    id_cliente: 5,
    id_empleado: 2,
    id_orden_servicio: 17,  // ✅ Asociada automáticamente
    observacion: "Revisión de documentos",
    cliente: { /* datos del cliente */ },
    empleado: { /* datos del empleado */ },
    seguimiento_creado: { /* seguimiento automático */ }
  }
}
```

---

## 🎨 Diseño del Modal

### Estilo según Matriz de Diseño

1. **Header**:
   - Fondo gris claro (`bg-gray-50`)
   - Borde inferior
   - Icono + Título + Botón cerrar

2. **Contenido**:
   - Sección informativa (azul claro) con datos automáticos
   - Formulario en grid responsive
   - Campos con labels y asteriscos para requeridos
   - Mensajes de error en rojo bajo cada campo

3. **Footer**:
   - Fondo gris claro
   - Botones: Cancelar (blanco) y Agendar (azul)
   - Botón Agendar deshabilitado mientras loading

---

## 🚀 Orden de Implementación Recomendado

1. **Primero**: Actualizar `citasApiService.js` con el método `crearCitaDesdeSolicitud`
2. **Segundo**: Modificar `tablaVentasProceso.jsx` para redirigir al calendario con datos en localStorage
3. **Tercero**: Actualizar `calendario.jsx` para detectar solicitudes y usar el endpoint correcto
4. **Cuarto**: Probar flujo completo de redirección y creación de cita
5. **Quinto**: Refinar UX y mensajes de error

---

## ⚠️ Notas Importantes

1. **Formato de Hora**: 
   - El backend espera formato `HH:MM:SS` pero los inputs de tiempo HTML dan `HH:MM`
   - Necesario agregar `:00` antes de enviar

2. **Datos Automáticos**:
   - NO enviar `id_cliente` ni `tipo` en el payload
   - El backend los obtiene automáticamente de la solicitud

3. **Seguimiento Automático**:
   - El backend crea un seguimiento automático cuando se crea la cita
   - No es necesario crear seguimiento manualmente

4. **Emails Automáticos**:
   - Se envían automáticamente al cliente y empleado
   - No requiere acción adicional del frontend

5. **LocalStorage y Navegación**:
   - Los datos de la solicitud se guardan en `localStorage` con la clave `'solicitudParaAgendar'`
   - El calendario detecta estos datos al montarse y limpia el localStorage después de usarlos
   - Este patrón es similar al usado para solicitudes de cita desde el landing

6. **Reutilización del Modal Existente**:
   - No es necesario crear un nuevo componente modal
   - El modal de `calendario.jsx` se reutiliza para citas normales y citas desde solicitudes
   - Solo se necesita diferenciar en el handler de guardar qué endpoint usar

---

## 📞 Próximos Pasos

Una vez implementado, probar:
1. Crear cita con éxito
2. Verificar que aparece en la lista de citas
3. Verificar que el seguimiento se creó automáticamente
4. Verificar que los emails se enviaron
5. Verificar que la cita tiene `id_orden_servicio` asociado

---

**Última actualización:** 2 de Noviembre de 2025

**Estado:** Plan listo para implementación

