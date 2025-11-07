# 📋 Plan de Implementación - Formularios Completos de Solicitudes de Servicio

## 🎯 Objetivo
Actualizar todos los formularios de creación de solicitudes para que se conecten correctamente con la API real, siguiendo la especificación completa de campos definida en `FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md`.

---

## 📊 Análisis de la Situación Actual

### ✅ Componentes Existentes

1. **Componente Principal:**
   - `CrearSolicitud.jsx` - Modal principal que gestiona el flujo de creación
   - Ubicación: `src/features/dashboard/pages/gestionVentasServicios/components/CrearSolicitud.jsx`

2. **Formularios Específicos por Servicio:**
   - `formularioBusqueda.jsx` - Búsqueda de Antecedentes
   - `formularioCertificacion.jsx` - Registro de Marca (Certificación de marca)
   - `formularioRenovacion.jsx` - Renovación de Marca
   - `formularioOposicion.jsx` - Presentación de Oposición
   - `formularioCesiondeMarca.jsx` - Cesión de Marca
   - `formularioAmpliacion.jsx` - Ampliación de Alcance
   - `formularioRespuesta.jsx` - Respuesta de Oposición
   - Ubicación: `src/shared/components/`

3. **Servicio API:**
   - `solicitudesApiService.js` - Servicio para conectar con la API
   - Ubicación: `src/features/dashboard/pages/gestionVentasServicios/services/solicitudesApiService.js`

### 🔍 Problemas Identificados

1. **Campos Faltantes:**
   - Los formularios no incluyen todos los campos requeridos según la documentación
   - Faltan campos específicos como `codigo_postal`, `numero_nit_cedula`, campos de cesionario, etc.

2. **Transformación de Datos:**
   - La función `transformarDatosParaAPI` solo cubre parcialmente los servicios
   - No maneja todos los campos según la especificación completa

3. **Validaciones:**
   - Las validaciones no están alineadas con los requerimientos de la API
   - Faltan validaciones específicas para cada servicio

4. **Manejo de Archivos:**
   - Los archivos se convierten a Base64, pero falta validación de tamaño y formato
   - No se manejan todos los tipos de documentos según el servicio

---

## 📝 Especificación de Campos por Servicio

### 1. Búsqueda de Antecedentes
**Campos Requeridos:** 10  
**Campos Totales:** 18

**Sección 1: Información del Solicitante**
- `nombres_apellidos` ✅ (requerido)
- `tipo_documento` ✅ (requerido)
- `numero_documento` ✅ (requerido)
- `direccion` ✅ (requerido)
- `telefono` ✅ (requerido)
- `correo` ✅ (requerido)
- `pais` ✅ (requerido)
- `ciudad` ✅ (opcional, default: "Bogotá")
- `codigo_postal` ❌ (opcional, default: "110111") - **FALTA**

**Sección 2: Información de la Búsqueda**
- `nombre_a_buscar` ✅ (requerido) - mapeado a `nombreMarca`
- `tipo_producto_servicio` ✅ (requerido)
- `clase_niza` ✅ (opcional)
- `logotipo` ❌ (requerido) - **FALTA** - mapeado a `logotipoMarca`

### 2. Registro de Marca (Certificación de marca)
**Campos Requeridos:** 19  
**Campos Totales:** 28

**Sección 1: Tipo de Solicitante**
- `tipo_solicitante` ✅ (requerido) - "Natural" o "Jurídica"

**Sección 2: Información del Solicitante**
- `nombres_apellidos` ✅ (requerido)
- `tipo_documento` ✅ (requerido)
- `numero_documento` ✅ (requerido)
- `numero_nit_cedula` ❌ (requerido) - **FALTA**
- `direccion` ✅ (requerido)
- `direccion_domicilio` ❌ (requerido) - **FALTA** (alias de `direccion`)
- `telefono` ✅ (requerido)
- `correo` ✅ (requerido)
- `pais` ✅ (requerido)
- `ciudad` ✅ (opcional)
- `codigo_postal` ❌ (opcional) - **FALTA**

**Sección 3: Información de la Empresa** (Solo si `tipo_solicitante = "Jurídica"`)
- `tipo_entidad` ✅ (requerido si Jurídica)
- `razon_social` ✅ (requerido si Jurídica)
- `nit_empresa` ✅ (requerido si Jurídica) - 10 dígitos
- `representante_legal` ✅ (requerido si Jurídica)

**Sección 4: Información de la Marca**
- `nombre_marca` ✅ (requerido)
- `tipo_producto_servicio` ✅ (requerido)
- `clase_niza` ✅ (opcional)
- `logotipo` ✅ (requerido)

**Sección 5: Documentos**
- `certificado_camara_comercio` ✅ (requerido)
- `poder_autorizacion` ✅ (requerido)

### 3. Renovación de Marca
**Campos Requeridos:** 17  
**Campos Totales:** 24

Similar a Certificación, pero con:
- `numero_expediente_marca` ❌ (requerido) - **FALTA**
- `certificado_renovacion` ❌ (requerido) - **FALTA** (en vez de `certificado_camara_comercio`)

### 4. Cesión de Marca
**Campos Requeridos:** 20  
**Campos Totales:** 27

Similar a otros, pero con sección adicional:
- `nombre_razon_social_cesionario` ❌ (requerido) - **FALTA**
- `nit_cesionario` ❌ (requerido) - **FALTA**
- `tipo_documento_cesionario` ❌ (requerido) - **FALTA**
- `numero_documento_cesionario` ❌ (requerido) - **FALTA**
- `correo_cesionario` ❌ (requerido) - **FALTA**
- `telefono_cesionario` ❌ (requerido) - **FALTA**
- `direccion_cesionario` ❌ (requerido) - **FALTA**
- `representante_legal_cesionario` ❌ (requerido) - **FALTA**
- `documento_cesion` ❌ (requerido) - **FALTA**
- `numero_expediente_marca` ❌ (requerido) - **FALTA**

### 5. Presentación de Oposición
**Campos Requeridos:** 17  
**Campos Totales:** 22

Similar a Certificación, pero con:
- `marca_a_oponerse` ❌ (requerido) - **FALTA**
- `argumentos_respuesta` ❌ (requerido, Min 10 caracteres) - **FALTA**
- `documentos_oposicion` ❌ (requerido) - **FALTA**

### 6. Respuesta de Oposición
**Campos Requeridos:** 14  
**Campos Totales:** 19

Similar a otros, pero con:
- `razon_social` ❌ (requerido) - **FALTA**
- `nit_empresa` ❌ (requerido) - **FALTA**
- `representante_legal` ❌ (requerido) - **FALTA**
- `numero_expediente_marca` ❌ (requerido) - **FALTA**
- `marca_opositora` ❌ (requerido) - **FALTA**

### 7. Ampliación de Alcance
**Campos Requeridos:** 12  
**Campos Totales:** 15

Campos específicos:
- `documento_nit_titular` ❌ (requerido) - **FALTA**
- `numero_registro_existente` ❌ (requerido) - **FALTA**
- `nombre_marca` ❌ (requerido) - **FALTA**
- `clase_niza_actual` ❌ (requerido) - **FALTA**
- `nuevas_clases_niza` ❌ (requerido) - **FALTA**
- `descripcion_nuevos_productos_servicios` ❌ (requerido, Min 10 caracteres) - **FALTA**
- `soportes` ❌ (requerido) - **FALTA**

---

## 🔧 Plan de Implementación

### Fase 1: Actualización de Componentes Base

#### 1.1 Actualizar `CrearSolicitud.jsx`
**Tareas:**
- [ ] Agregar campo `codigo_postal` al estado inicial del formulario
- [ ] Mejorar la función `fileToBase64` para validar tamaño (máx 5MB) y formato
- [ ] Actualizar validaciones para incluir campos requeridos según servicio
- [ ] Mejorar manejo de errores de la API
- [ ] Agregar validación de campos antes de enviar a la API
- [ ] 🔥 **NUEVO:** Implementar lógica diferenciada por rol:
  - **Cliente:** NO enviar `id_cliente`, manejar estado "Pendiente de Pago"
  - **Admin/Empleado:** Requerir `id_cliente`, manejar activación automática
- [ ] 🔥 **NUEVO:** Integrar flujo de pago para clientes:
  - Mostrar opción de pago después de crear solicitud
  - Llamar a `POST /api/gestion-pagos/process-mock` con `orden_id`
  - Verificar `solicitud_activada: true` en respuesta
  - Actualizar estado de la solicitud después del pago exitoso

**Archivo:** `src/features/dashboard/pages/gestionVentasServicios/components/CrearSolicitud.jsx`

#### 1.2 Actualizar `solicitudesApiService.js`
**Tareas:**
- [ ] Completar la función `transformarDatosParaAPI` para todos los servicios
- [ ] Agregar mapeo de campos faltantes según la especificación
- [ ] Manejar campos alternativos (aliases) según la documentación
- [ ] Agregar validación de campos requeridos antes de enviar
- [ ] Mejorar manejo de archivos Base64
- [ ] 🔥 **NUEVO:** Implementar lógica de `id_cliente` según rol:
  - **Cliente:** NO incluir `id_cliente` en el body (tomado del token)
  - **Admin/Empleado:** Validar que `id_cliente` esté presente (requerido)
- [ ] 🔥 **NUEVO:** Manejar respuesta diferenciada:
  - **Cliente:** Esperar `estado: "Pendiente de Pago"`, `requiere_pago: true`, `monto_a_pagar`
  - **Admin/Empleado:** Esperar `estado: "Solicitud Recibida"` (primer proceso), `requiere_pago: false`

**Archivo:** `src/features/dashboard/pages/gestionVentasServicios/services/solicitudesApiService.js`

---

### Fase 2: Actualización de Formularios Específicos

#### 2.1 Formulario Busqueda (`formularioBusqueda.jsx`)
**Tareas:**
- [ ] Agregar campo `codigo_postal` (opcional, default: "110111")
- [ ] Agregar campo `logotipo` (requerido) - usar componente FileUpload
- [ ] Actualizar validaciones para incluir `logotipo`
- [ ] Asegurar que `nombre_a_buscar` se mapee correctamente

**Archivo:** `src/shared/components/formularioBusqueda.jsx`

#### 2.2 Formulario Certificacion (`formularioCertificacion.jsx`)
**Tareas:**
- [ ] Agregar campo `codigo_postal` (opcional)
- [ ] Agregar campo `numero_nit_cedula` (requerido)
- [ ] Agregar campo `direccion_domicilio` (requerido) - alias de `direccion`
- [ ] Actualizar validaciones para incluir nuevos campos
- [ ] Asegurar que `tipo_solicitante` acepte "Natural" o "Jurídica" (no "Titular")

**Archivo:** `src/shared/components/formularioCertificacion.jsx`

#### 2.3 Formulario Renovacion (`formularioRenovacion.jsx`)
**Tareas:**
- [ ] Agregar campo `numero_expediente_marca` (requerido)
- [ ] Cambiar `certificado_camara_comercio` por `certificado_renovacion`
- [ ] Agregar campo `codigo_postal` (opcional)
- [ ] Actualizar validaciones

**Archivo:** `src/shared/components/formularioRenovacion.jsx`

#### 2.4 Formulario Cesion (`formularioCesiondeMarca.jsx`)
**Tareas:**
- [ ] Agregar sección completa de información del Cesionario:
  - `nombre_razon_social_cesionario` (requerido)
  - `nit_cesionario` (requerido)
  - `tipo_documento_cesionario` (requerido)
  - `numero_documento_cesionario` (requerido)
  - `correo_cesionario` (requerido)
  - `telefono_cesionario` (requerido)
  - `direccion_cesionario` (requerido)
  - `representante_legal_cesionario` (requerido)
- [ ] Agregar campo `numero_expediente_marca` (requerido)
- [ ] Cambiar documento por `documento_cesion` (requerido)
- [ ] Actualizar validaciones

**Archivo:** `src/shared/components/formularioCesiondeMarca.jsx`

#### 2.5 Formulario Oposicion (`formularioOposicion.jsx`)
**Tareas:**
- [ ] Agregar campo `marca_a_oponerse` (requerido)
- [ ] Agregar campo `argumentos_respuesta` (requerido, Min 10 caracteres, textarea)
- [ ] Cambiar documento por `documentos_oposicion` (requerido)
- [ ] Agregar campo `codigo_postal` (opcional)
- [ ] Actualizar validaciones

**Archivo:** `src/shared/components/formularioOposicion.jsx`

#### 2.6 Formulario Respuesta (`formularioRespuesta.jsx`)
**Tareas:**
- [ ] Agregar campo `razon_social` (requerido)
- [ ] Agregar campo `nit_empresa` (requerido)
- [ ] Agregar campo `representante_legal` (requerido)
- [ ] Agregar campo `numero_expediente_marca` (requerido)
- [ ] Agregar campo `marca_opositora` (requerido)
- [ ] Actualizar validaciones

**Archivo:** `src/shared/components/formularioRespuesta.jsx`

#### 2.7 Formulario Ampliacion (`formularioAmpliacion.jsx`)
**Tareas:**
- [ ] Agregar campo `documento_nit_titular` (requerido)
- [ ] Agregar campo `numero_registro_existente` (requerido)
- [ ] Agregar campo `nombre_marca` (requerido)
- [ ] Agregar campo `clase_niza_actual` (requerido)
- [ ] Agregar campo `nuevas_clases_niza` (requerido)
- [ ] Agregar campo `descripcion_nuevos_productos_servicios` (requerido, Min 10 caracteres, textarea)
- [ ] Cambiar documento por `soportes` (requerido)
- [ ] Actualizar validaciones

**Archivo:** `src/shared/components/formularioAmpliacion.jsx`

---

### Fase 3: Actualización de Transformación de Datos

#### 3.1 Completar `transformarDatosParaAPI` en `solicitudesApiService.js`
**Tareas:**
- [ ] Agregar caso para "Renovación de marca"
- [ ] Agregar caso para "Cesión de marca"
- [ ] Agregar caso para "Presentación de oposición"
- [ ] Agregar caso para "Respuesta a oposición"
- [ ] Agregar caso para "Ampliación de alcance"
- [ ] Mapear todos los campos según la especificación
- [ ] Manejar campos alternativos (aliases)
- [ ] Convertir archivos a Base64 correctamente
- [ ] Validar campos requeridos antes de enviar

---

### Fase 4: Validaciones y Mejoras

#### 4.1 Crear/Actualizar Servicio de Validación
**Tareas:**
- [ ] Crear o actualizar `validationService.js` con validaciones específicas:
  - Validación de email
  - Validación de teléfono (7-20 caracteres, solo números)
  - Validación de NIT (10 dígitos, 1000000000 - 9999999999)
  - Validación de documento (6-20 caracteres)
  - Validación de archivos (tamaño máx 5MB, formatos PDF/JPG/PNG)
  - Validación de Base64
- [ ] Agregar validaciones específicas por servicio

**Archivo:** `src/shared/utils/validationService.js` (o crear si no existe)

#### 4.2 Mejorar Manejo de Archivos
**Tareas:**
- [ ] Actualizar componente `FileUpload` para validar tamaño y formato
- [ ] Mejorar conversión a Base64 con manejo de errores
- [ ] Agregar preview de archivos antes de enviar
- [ ] Validar que los archivos sean Base64 válidos antes de enviar

---

### Fase 5: Pruebas y Validación

#### 5.1 Pruebas por Servicio
**Tareas:**
- [ ] Probar creación de solicitud para "Búsqueda de Antecedentes"
- [ ] Probar creación de solicitud para "Registro de Marca"
- [ ] Probar creación de solicitud para "Renovación de Marca"
- [ ] Probar creación de solicitud para "Cesión de Marca"
- [ ] Probar creación de solicitud para "Presentación de Oposición"
- [ ] Probar creación de solicitud para "Respuesta de Oposición"
- [ ] Probar creación de solicitud para "Ampliación de Alcance"

#### 5.2 Validaciones de Errores
**Tareas:**
- [ ] Probar con campos faltantes
- [ ] Probar con formatos inválidos
- [ ] Probar con archivos demasiado grandes
- [ ] Probar con tipos de archivo inválidos
- [ ] Probar con NIT inválido
- [ ] Verificar mensajes de error de la API

#### 5.3 Validaciones de Roles
**Tareas:**
- [ ] Probar como Cliente:
  - [ ] NO debe enviar `id_cliente`
  - [ ] Solicitud debe crearse con estado "Pendiente de Pago"
  - [ ] Respuesta debe incluir `requiere_pago: true` y `monto_a_pagar`
  - [ ] Probar flujo completo de pago con `POST /api/gestion-pagos/process-mock`
  - [ ] Verificar que la solicitud se active después del pago exitoso
- [ ] Probar como Administrador:
  - [ ] DEBE enviar `id_cliente` (error 400 si falta)
  - [ ] Solicitud debe activarse automáticamente con primer estado
  - [ ] Respuesta debe incluir `requiere_pago: false`
- [ ] Probar como Empleado:
  - [ ] DEBE enviar `id_cliente` (error 400 si falta)
  - [ ] Solicitud debe activarse automáticamente con primer estado
  - [ ] Respuesta debe incluir `requiere_pago: false`

#### 5.4 Pruebas de Flujo de Pago
**Tareas:**
- [ ] Probar creación de solicitud como cliente
- [ ] Probar procesamiento de pago con `POST /api/gestion-pagos/process-mock`
- [ ] Verificar que `solicitud_activada: true` en respuesta del pago
- [ ] Verificar que el estado de la solicitud cambie después del pago
- [ ] Probar manejo de errores en el pago
- [ ] Probar actualización de UI después del pago exitoso

---

## 📋 Checklist de Implementación

### Preparación
- [ ] Revisar toda la documentación de la API
- [ ] Revisar `FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md`
- [ ] Identificar todos los campos faltantes
- [ ] Crear lista de mapeo de campos frontend → API

### Implementación Base
- [ ] Actualizar `CrearSolicitud.jsx`
- [ ] Actualizar `solicitudesApiService.js` - función `transformarDatosParaAPI`
- [ ] Crear/Actualizar `validationService.js`

### Implementación de Formularios
- [ ] Actualizar `formularioBusqueda.jsx`
- [ ] Actualizar `formularioCertificacion.jsx`
- [ ] Actualizar `formularioRenovacion.jsx`
- [ ] Actualizar `formularioCesiondeMarca.jsx`
- [ ] Actualizar `formularioOposicion.jsx`
- [ ] Actualizar `formularioRespuesta.jsx`
- [ ] Actualizar `formularioAmpliacion.jsx`

### Validaciones
- [ ] Agregar validaciones de campos requeridos
- [ ] Agregar validaciones de formato
- [ ] Agregar validaciones de archivos
- [ ] Agregar validaciones específicas por servicio

### Pruebas
- [ ] Probar cada formulario individualmente
- [ ] Probar flujo completo de creación
- [ ] Probar manejo de errores
- [ ] Probar con diferentes roles

---

## 🎨 Mejoras de UX Sugeridas

1. **Organización por Secciones:**
   - Usar acordeón o tabs para organizar los formularios en secciones lógicas
   - Sección 1: Tipo de Solicitante
   - Sección 2: Datos del Solicitante
   - Sección 3: Datos de Empresa (si aplica)
   - Sección 4: Información de la Marca
   - Sección 5: Documentos
   - Sección 6: Información Específica del Servicio

2. **Validaciones en Tiempo Real:**
   - Mostrar errores mientras el usuario escribe
   - Validar campos al perder el foco (onBlur)
   - Mostrar indicadores visuales de campos requeridos

3. **Mensajes de Error Claros:**
   - Mostrar mensajes específicos por campo
   - Mostrar lista de campos faltantes si hay error de la API
   - Mostrar mensajes de error de la API de forma clara

4. **Preview de Archivos:**
   - Mostrar preview de imágenes antes de enviar
   - Mostrar nombre y tamaño de archivos PDF
   - Permitir eliminar archivos antes de enviar

---

## ⚠️ Consideraciones Importantes

### 🔥 NUEVO - Sistema de Pago Diferenciado por Rol (Enero 2026)

#### 👤 Como CLIENTE:
- **Estado inicial:** "Pendiente de Pago" (NO se activa automáticamente)
- **NO enviar `id_cliente`:** Se toma automáticamente del token JWT
- **Respuesta incluye:**
  ```json
  {
    "success": true,
    "mensaje": "Solicitud creada. Pendiente de pago para activar.",
    "data": {
      "orden_id": 123,
      "estado": "Pendiente de Pago",
      "monto_a_pagar": 500000.00,
      "requiere_pago": true
    }
  }
  ```
- **Para activar la solicitud:**
  1. Procesar el pago usando `POST /api/gestion-pagos/process-mock` con el `orden_id`
  2. Si el pago es exitoso, la solicitud se activa automáticamente con el primer estado del proceso
  3. La respuesta del pago incluye `solicitud_activada: true` cuando se activa correctamente

#### 👨‍💼 Como ADMINISTRADOR/EMPLEADO:
- **Estado inicial:** Primer estado del proceso (se activa automáticamente)
- **DEBE enviar `id_cliente`:** Error 400 si falta (obligatorio)
- **Respuesta incluye:**
  ```json
  {
    "success": true,
    "mensaje": "Solicitud creada y activada exitosamente.",
    "data": {
      "orden_id": 123,
      "estado": "Solicitud Recibida",
      "monto_a_pagar": null,
      "requiere_pago": false
    }
  }
  ```
- **NO requiere pago por API:** El pago se procesa físicamente después

### 📋 Otras Consideraciones

1. **IDs de Servicios:**
   - Los IDs son variables, consultar `GET /api/servicios` para obtener los IDs reales
   - El endpoint usa el nombre del servicio en la URL: `/api/gestion-solicitudes/crear/{nombre_servicio}`

2. **Autenticación:**
   - Todos los endpoints requieren token JWT válido
   - El token debe incluirse en el header `Authorization: Bearer {token}`

3. **Roles - Diferencias en el Body:**
   | Campo | Cliente | Administrador/Empleado |
   |-------|---------|------------------------|
   | `id_cliente` | ❌ **NO enviar** (se toma del token) | ✅ **OBLIGATORIO** (error 400 si falta) |
   | `id_empresa` | ⚪ Opcional | ⚪ Opcional |
   | Otros campos | ✅ Iguales | ✅ Iguales |

4. **Archivos:**
   - Convertir a Base64 antes de enviar
   - Validar tamaño máximo (5MB recomendado)
   - Validar formato (PDF, JPG, PNG)
   - Pueden incluir prefijo `data:application/pdf;base64,` o `data:image/jpeg;base64,`

5. **Campos Alternativos:**
   - La API acepta campos alternativos (aliases)
   - Ejemplo: `correo` o `correo_electronico`, `direccion` o `direccion_domicilio`
   - Usar siempre el campo principal recomendado

6. **Flujo de Pago para Clientes:**
   - Después de crear la solicitud, el frontend debe mostrar opción de pago
   - Integrar con `POST /api/gestion-pagos/process-mock` para procesar el pago
   - Verificar `solicitud_activada: true` en la respuesta del pago
   - Actualizar el estado de la solicitud en el frontend después del pago exitoso

---

## 📞 Referencias

- **Documentación API:** `documentacion api.md`
- **Especificación de Formularios:** `FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md`
- **Endpoint Base:** `POST /api/gestion-solicitudes/crear/:servicio`
- **Servicio API:** `solicitudesApiService.js`

---

## 🚀 Orden de Implementación Recomendado

1. **Fase 1:** Actualizar componentes base (CrearSolicitud.jsx y solicitudesApiService.js)
2. **Fase 2:** Actualizar formularios uno por uno, empezando por los más simples:
   - FormularioBusqueda (más simple)
   - FormularioCertificacion (ya tiene muchos campos)
   - FormularioRenovacion (similar a Certificacion)
   - FormularioOposicion
   - FormularioRespuesta
   - FormularioCesion (más complejo, tiene cesionario)
   - FormularioAmpliacion (más complejo, tiene campos específicos)
3. **Fase 3:** Completar transformación de datos
4. **Fase 4:** Agregar validaciones
5. **Fase 5:** Pruebas exhaustivas

---

**Última actualización:** Enero 2026  
**Versión del Plan:** 1.1  
**Estado:** Pendiente de Aprobación

---

## 🔥 Cambios Importantes Identificados (Enero 2026)

### Sistema de Pago Diferenciado por Rol

**Cambio crítico:** El sistema ahora tiene un flujo diferenciado según el rol del usuario:

1. **Clientes:**
   - Crean solicitudes con estado "Pendiente de Pago"
   - NO se activan automáticamente
   - Requieren procesamiento de pago por API para activarse
   - NO deben enviar `id_cliente` (se toma del token)

2. **Administradores/Empleados:**
   - Crean solicitudes que se activan automáticamente
   - NO requieren pago por API (pago físico posterior)
   - DEBEN enviar `id_cliente` (obligatorio, error 400 si falta)

### Integración con Sistema de Pagos

**Nuevo endpoint:** `POST /api/gestion-pagos/process-mock`
- Procesa el pago de una solicitud
- Activa automáticamente la solicitud si el pago es exitoso
- Retorna `solicitud_activada: true` cuando se activa correctamente

### Impacto en la Implementación

1. **CrearSolicitud.jsx:**
   - Debe manejar el estado "Pendiente de Pago" para clientes
   - Debe mostrar opción de pago después de crear solicitud (solo clientes)
   - Debe integrar con el endpoint de procesamiento de pago

2. **solicitudesApiService.js:**
   - Debe NO incluir `id_cliente` para clientes
   - Debe validar que `id_cliente` esté presente para admin/empleado
   - Debe manejar respuestas diferenciadas según el rol

3. **Validaciones:**
   - Agregar validación de rol antes de enviar solicitud
   - Validar que admin/empleado incluyan `id_cliente`
   - Validar que cliente NO incluya `id_cliente`

