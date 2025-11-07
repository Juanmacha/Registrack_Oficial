# 📅 Plan de Implementación: Modal Separado para Agendar Cita desde Solicitud

## 🎯 Objetivo

Separar los flujos de **agendar cita normal** vs **agendar cita desde solicitud** para evitar confusiones y errores 500. Crear un modal específico para citas desde solicitudes que use el endpoint correcto con los campos exactos que requiere.

---

## 📊 Análisis de la Situación Actual

### ❌ Problema Actual

El modal actual (`calendario.jsx`) mezcla dos flujos diferentes:
1. **Cita normal**: Requiere `id_cliente`, `id_empleado`, `fecha`, `hora_inicio`, `hora_fin`, `tipo`, `modalidad`, `observacion`
2. **Cita desde solicitud**: Requiere **SOLO** `fecha`, `hora_inicio`, `hora_fin`, `id_empleado`, `modalidad` (opcional), `observacion` (opcional)

Esto causa **Error 500** porque se envían campos innecesarios que el backend no espera.

---

## 🔍 Endpoints y Campos Requeridos

### Endpoint 1: POST /api/gestion-citas (Cita Normal)
```http
POST /api/gestion-citas
Authorization: Bearer <token>
Content-Type: application/json

{
  "fecha": "YYYY-MM-DD",
  "hora_inicio": "HH:MM:SS",
  "hora_fin": "HH:MM:SS",
  "tipo": "string",
  "modalidad": "string",
  "id_cliente": "number",
  "id_empleado": "number",
  "estado": "string (opcional, default: Programada)",
  "observacion": "string (opcional)"
}
```

### Endpoint 2: POST /api/gestion-citas/desde-solicitud/:idOrdenServicio ⭐ (Desde Solicitud)
```http
POST /api/gestion-citas/desde-solicitud/:idOrdenServicio
Authorization: Bearer <token>
Content-Type: application/json

{
  "fecha": "YYYY-MM-DD",
  "hora_inicio": "HH:MM:SS",
  "hora_fin": "HH:MM:SS",
  "id_empleado": "number",
  "modalidad": "string (opcional)",
  "observacion": "string (opcional)"
}
```

**Diferencias clave:**
- ❌ NO se envía `id_cliente` (se toma automáticamente de la solicitud)
- ❌ NO se envía `tipo` (se toma automáticamente del servicio)
- ✅ Solo se envía `fecha`, `hora_inicio`, `hora_fin`, `id_empleado`
- ✅ `modalidad` y `observacion` son opcionales

---

## 🏗️ Arquitectura de la Solución

### Componentes a Crear

```
Registrack_Frontend1/
└── src/
    └── features/
        └── dashboard/
            └── pages/
                └── gestionCitas/
                    ├── calendario.jsx (✅ Mantener para citas normales)
                    └── ModalAgendarDesdeSolicitud.jsx ⭐ NUEVO
```

---

## 📋 Plan de Implementación

### Fase 1: Restaurar Modal Normal (5 min)

#### Tarea 1.1: Revertir `calendario.jsx` a estado original
**Archivo:** `src/features/dashboard/pages/gestionCitas/calendario.jsx`

**Cambios:**
- ✅ Eliminar la lógica de `localStorage.getItem('solicitudParaAgendar')`
- ✅ Eliminar estado `solicitudAsociada`
- ✅ Eliminar `useEffect` que detecta solicitudes
- ✅ Restaurar validación original para citas normales
- ✅ Restaurar llamada a `POST /api/gestion-citas`

**Resultado:** Modal para crear citas normales funcionando como antes.

---

### Fase 2: Crear Nuevo Modal para Solicitudes (15 min)

#### Tarea 2.1: Crear Componente BaseModal
**Archivo:** `src/features/dashboard/pages/gestionCitas/ModalAgendarDesdeSolicitud.jsx`

**Estructura del Modal:**
```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/authContext';
import { getToken } from '@/shared/utils/tokenUtils';
import citasApiService from '@/features/dashboard/services/citasApiService';
import empleadosApiService from '@/features/dashboard/services/empleadosApiService';
import alertService from '@/shared/services/alertService';
import Swal from 'sweetalert2';

const ModalAgendarDesdeSolicitud = ({ 
  isOpen, 
  onClose, 
  solicitudData, 
  onSuccess 
}) => {
  // Estados
  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    asesor: '', // id_empleado
    detalle: '' // observacion
  });
  
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});

  // Cargar empleados al montar
  useEffect(() => {
    if (isOpen) {
      cargarEmpleados();
      // Prellenar con datos de la solicitud
      if (solicitudData) {
        prellenarFormulario();
      }
    }
  }, [isOpen, solicitudData]);

  const cargarEmpleados = async () => {
    try {
      const result = await empleadosApiService.getAllEmpleados();
      if (result && result.success && Array.isArray(result.data)) {
        const empleadosActivos = result.data
          .filter(emp => emp.estado_empleado !== false && emp.estado_usuario !== false)
          .map(emp => ({
            id_empleado: emp.id_empleado,
            nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim()
          }));
        setEmpleados(empleadosActivos);
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      alertService.error('Error', 'No se pudieron cargar los empleados');
    }
  };

  const prellenarFormulario = () => {
    // Pre-seleccionar asesor si viene en la solicitud
    if (solicitudData?.empleadoCompleto?.id_empleado) {
      setFormData(prev => ({
        ...prev,
        asesor: solicitudData.empleadoCompleto.id_empleado.toString()
      }));
    }
  };

  // Validaciones
  const validarFormulario = () => {
    const errors = {};
    
    if (!formData.fecha) {
      errors.fecha = 'La fecha es requerida';
    } else {
      const fechaSeleccionada = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaSeleccionada < hoy) {
        errors.fecha = 'No puedes seleccionar fechas pasadas';
      }
    }
    
    if (!formData.horaInicio) {
      errors.horaInicio = 'La hora de inicio es requerida';
    }
    
    if (!formData.horaFin) {
      errors.horaFin = 'La hora de fin es requerida';
    } else if (formData.horaInicio && formData.horaFin) {
      if (formData.horaInicio >= formData.horaFin) {
        errors.horaFin = 'La hora de fin debe ser posterior a la de inicio';
      }
    }
    
    if (!formData.asesor) {
      errors.asesor = 'Debes seleccionar un asesor';
    }
    
    setErrores(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejo de cambios
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        await alertService.error('Error', 'No se encontró token de autenticación');
        return;
      }
      
      // Obtener id_orden_servicio
      const idOrdenServicio = solicitudData?.idOrdenServicio || solicitudData?.id_orden_servicio;
      if (!idOrdenServicio) {
        await alertService.error('Error', 'No se encontró ID de solicitud');
        return;
      }
      
      // Construir payload según documentación
      const citaData = {
        fecha: formData.fecha,
        hora_inicio: formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2 
          ? formData.horaInicio + ':00' 
          : formData.horaInicio,
        hora_fin: formData.horaFin.includes(':') && formData.horaFin.split(':').length === 2 
          ? formData.horaFin + ':00' 
          : formData.horaFin,
        id_empleado: parseInt(formData.asesor)
      };
      
      // Campos opcionales
      if (formData.detalle && formData.detalle.trim()) {
        citaData.observacion = formData.detalle.trim();
      }
      
      console.log('📤 [ModalAgendarDesdeSolicitud] Creando cita desde solicitud...');
      console.log('📤 [ModalAgendarDesdeSolicitud] idOrdenServicio:', idOrdenServicio);
      console.log('📤 [ModalAgendarDesdeSolicitud] citaData:', citaData);
      
      // Llamar al endpoint específico
      const result = await citasApiService.crearCitaDesdeSolicitud(
        idOrdenServicio,
        citaData,
        token
      );
      
      if (result.success) {
        await alertService.success(
          'Cita creada exitosamente',
          `La cita ha sido agendada para ${solicitudData?.clienteNombre || 'el cliente'}`
        );
        
        // Cerrar modal y limpiar
        setFormData({
          fecha: '',
          horaInicio: '',
          horaFin: '',
          asesor: '',
          detalle: ''
        });
        setErrores({});
        setTouched({});
        
        // Notificar al calendario para refrescar
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } else {
        await alertService.error('Error', result.message || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('Error al crear cita:', error);
      await alertService.error('Error', error.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Agendar Cita - {solicitudData?.clienteNombre || 'Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Fecha */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de la Cita <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              onBlur={handleBlur}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {touched.fecha && errores.fecha && (
              <p className="text-red-600 text-xs mt-1">{errores.fecha}</p>
            )}
          </div>
          
          {/* Hora Inicio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {touched.horaInicio && errores.horaInicio && (
              <p className="text-red-600 text-xs mt-1">{errores.horaInicio}</p>
            )}
          </div>
          
          {/* Hora Fin */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="horaFin"
              value={formData.horaFin}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {touched.horaFin && errores.horaFin && (
              <p className="text-red-600 text-xs mt-1">{errores.horaFin}</p>
            )}
          </div>
          
          {/* Asesor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asesor <span className="text-red-500">*</span>
            </label>
            <select
              name="asesor"
              value={formData.asesor}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {empleados.map(emp => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombreCompleto}
                </option>
              ))}
            </select>
            {touched.asesor && errores.asesor && (
              <p className="text-red-600 text-xs mt-1">{errores.asesor}</p>
            )}
          </div>
          
          {/* Detalle (opcional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              name="detalle"
              value={formData.detalle}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Agregar detalles adicionales sobre la cita..."
            />
          </div>
          
          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgendarDesdeSolicitud;
```

---

### Fase 3: Integrar Modal en Calendario (10 min)

#### Tarea 3.1: Actualizar `calendario.jsx`
**Archivo:** `src/features/dashboard/pages/gestionCitas/calendario.jsx`

**Cambios:**
```jsx
import ModalAgendarDesdeSolicitud from './ModalAgendarDesdeSolicitud';

const Calendario = () => {
  // ... código existente ...
  
  const [modalDesdeSolicitudOpen, setModalDesdeSolicitudOpen] = useState(false);
  const [solicitudParaAgendar, setSolicitudParaAgendar] = useState(null);

  // useEffect para detectar solicitudes desde localStorage
  useEffect(() => {
    const solicitudParaAgendar = localStorage.getItem('solicitudParaAgendar');
    if (solicitudParaAgendar) {
      try {
        const solicitudData = JSON.parse(solicitudParaAgendar);
        setSolicitudParaAgendar(solicitudData);
        setModalDesdeSolicitudOpen(true);
        localStorage.removeItem('solicitudParaAgendar');
      } catch (error) {
        console.error('Error al procesar solicitud para agendar:', error);
        localStorage.removeItem('solicitudParaAgendar');
      }
    }
  }, []);

  // Función para refrescar citas después de crear
  const handleCitaCreadaDesdeSolicitud = async () => {
    // Recargar citas del calendario
    await cargarCitas();
  };

  return (
    <div>
      {/* ... Calendario existente ... */}
      
      {/* Modal para citas normales (existente) */}
      {/* ... */}
      
      {/* Modal para citas desde solicitud (nuevo) */}
      <ModalAgendarDesdeSolicitud
        isOpen={modalDesdeSolicitudOpen}
        onClose={() => {
          setModalDesdeSolicitudOpen(false);
          setSolicitudParaAgendar(null);
        }}
        solicitudData={solicitudParaAgendar}
        onSuccess={handleCitaCreadaDesdeSolicitud}
      />
    </div>
  );
};

export default Calendario;
```

---

### Fase 4: Verificar Servicio API (5 min)

#### Tarea 4.1: Verificar `citasApiService.crearCitaDesdeSolicitud`
**Archivo:** `src/features/dashboard/services/citasApiService.js`

**Estado:** ✅ Ya existe y está correcto según documentación

**Payload que envía:**
```javascript
{
  fecha: "2025-11-11",
  hora_inicio: "09:00:00",
  hora_fin: "10:00:00",
  id_empleado: 1, // number
  observacion: "opcional" // solo si se proporciona
}
```

✅ **Sin campos innecesarios** como `id_cliente`, `tipo`, etc.

---

### Fase 5: Probar Integración (10 min)

#### Tarea 5.1: Flujo Completo de Prueba

1. **Desde tablaVentasProceso.jsx:**
   - Click en "Agendar cita" de una solicitud
   - Redirige a `/admin/calendario`
   
2. **En calendario.jsx:**
   - Detecta `localStorage` con `solicitudParaAgendar`
   - Abre `ModalAgendarDesdeSolicitud` automáticamente
   - Modal muestra datos de la solicitud
   
3. **En ModalAgendarDesdeSolicitud:**
   - Usuario selecciona fecha, hora y asesor
   - Click en "Agendar Cita"
   - Llama a `POST /api/gestion-citas/desde-solicitud/:id`
   - Muestra éxito/error
   
4. **Resultado:**
   - Cita creada correctamente
   - Cita aparece en el calendario
   - Cita aparece en la solicitud (seguimiento automático)

---

## ✅ Checklist de Implementación

- [ ] **Fase 1:** Restaurar `calendario.jsx` a estado original para citas normales
- [ ] **Fase 2:** Crear `ModalAgendarDesdeSolicitud.jsx` con validaciones correctas
- [ ] **Fase 3:** Integrar modal en `calendario.jsx` con `useEffect` para localStorage
- [ ] **Fase 4:** Verificar que `citasApiService.crearCitaDesdeSolicitud` esté correcto
- [ ] **Fase 5:** Probar flujo completo desde tablaVentasProceso → calendario → modal → API
- [ ] **Fase 6:** Verificar que citas aparezcan correctamente en el calendario
- [ ] **Fase 7:** Verificar que se cree seguimiento automático en la solicitud

---

## 📊 Diferencias entre Modales

| Campo | Modal Normal | Modal Desde Solicitud |
|-------|-------------|----------------------|
| **Archivo** | `calendario.jsx` (integrado) | `ModalAgendarDesdeSolicitud.jsx` |
| **Endpoint** | `POST /api/gestion-citas` | `POST /api/gestion-citas/desde-solicitud/:id` |
| **Fecha** | ✅ Requerido | ✅ Requerido |
| **Hora Inicio** | ✅ Requerido | ✅ Requerido |
| **Hora Fin** | ✅ Requerido | ✅ Requerido |
| **Asesor** | ✅ Requerido (id_empleado) | ✅ Requerido (id_empleado) |
| **Cliente** | ✅ Requerido (id_cliente) | ❌ Automático |
| **Tipo** | ✅ Requerido | ❌ Automático |
| **Modalidad** | ✅ Requerido | ⚠️ Opcional |
| **Observacion** | ⚠️ Opcional | ⚠️ Opcional |
| **Datos prellenados** | ❌ No | ✅ Sí (nombre cliente, etc.) |

---

## 🎯 Beneficios de la Separación

1. ✅ **Sin conflictos**: Cada modal tiene su propio flujo y validaciones
2. ✅ **Código limpio**: Responsabilidades separadas y claras
3. ✅ **Sin errores 500**: Payloads correctos para cada endpoint
4. ✅ **Mejor UX**: Campo "tipo" solo aparece cuando es relevante
5. ✅ **Mantenible**: Fácil de modificar cada modal independientemente
6. ✅ **Testeable**: Cada modal se puede probar por separado

---

## 🚀 Tiempo Estimado Total

- **Fase 1:** 5 minutos
- **Fase 2:** 15 minutos
- **Fase 3:** 10 minutos
- **Fase 4:** 5 minutos (verificación)
- **Fase 5:** 10 minutos
- **Total:** ~45 minutos

---

## 📝 Notas Finales

- El modal normal (`calendario.jsx`) se mantiene **100% funcional** para citas independientes
- El nuevo modal (`ModalAgendarDesdeSolicitud.jsx`) maneja **SOLO** citas desde solicitudes
- Ambos usan el mismo servicio `citasApiService` pero métodos diferentes
- El usuario verá el modal correcto automáticamente según desde dónde viene
- Las citas aparecen correctamente en el calendario sin importar su origen

