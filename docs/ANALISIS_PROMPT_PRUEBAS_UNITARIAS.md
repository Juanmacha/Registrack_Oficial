# 📋 ANÁLISIS DEL PROMPT DE PRUEBAS UNITARIAS

## 🎯 RESUMEN EJECUTIVO

Este documento analiza el prompt de pruebas unitarias (`PROMPT_PRUEBAS_UNITARIAS.md`) comparándolo con la implementación real del proyecto Registrack. Se identifican discrepancias, validaciones faltantes y recomendaciones para mejorar el prompt.

---

## ✅ ASPECTOS CORRECTOS DEL PROMPT

### 1. **Estructura General**
- ✅ La estructura AAA (Arrange-Act-Assert) está bien definida
- ✅ Los hooks de Jest (`beforeAll`, `beforeEach`, `afterEach`, `afterAll`) están correctamente descritos
- ✅ La organización de tests en archivos separados es apropiada

### 2. **Validaciones Básicas**
- ✅ Validación de campos requeridos está bien cubierta
- ✅ Validación de formato de email es correcta
- ✅ Validación de unicidad de documento y correo está contemplada

---

## ⚠️ DISCREPANCIAS CON EL PROYECTO REAL

### 1. **ESTRUCTURA DE DATOS DEL REGISTRO DE USUARIO**

#### ❌ **Problema: Inconsistencias en nombres de campos**

**En el prompt:**
```typescript
interface RegistroUsuario {
  tipo_documento: string;
  documento: string | number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  id_rol: number;
  telefono?: string;
}
```

**En el proyecto real (authApiService.js):**
```javascript
const requestData = {
  tipo_documento: userData.tipoDocumento || 'CC',
  documento: userData.documento,
  nombre: userData.nombre,
  apellido: userData.apellido,
  correo: userData.email,  // ⚠️ DIFERENCIA: usa 'correo' en API, 'email' en frontend
  contrasena: userData.password,  // ⚠️ DIFERENCIA: usa 'contrasena' en API, 'password' en frontend
  id_rol: userData.roleId || 3,  // ⚠️ DIFERENCIA: usa 'id_rol' en API, 'roleId' en frontend
  telefono: userData.telefono  // ⚠️ Campo opcional correcto
};
```

**En el frontend (register.jsx):**
```javascript
const formData = {
  firstName: "",      // ⚠️ DIFERENCIA: frontend usa camelCase
  lastName: "",
  documentType: "",
  documentNumber: "",
  email: "",          // ⚠️ DIFERENCIA
  phone: "",
  password: "",       // ⚠️ DIFERENCIA
  confirmPassword: ""
};
```

**🔧 Recomendación:**
- Actualizar el prompt para reflejar la transformación de datos entre frontend y backend
- Mencionar que el servicio de API (`authApiService`) hace la transformación de `email` → `correo`, `password` → `contrasena`
- Incluir tests para validar la transformación de datos en el servicio

---

### 2. **VALIDACIONES DE CONTRASEÑA**

#### ❌ **Problema: El prompt no menciona validaciones específicas del proyecto**

**En el prompt:**
- Mínimo 8 caracteres ✅
- Mayúsculas, minúsculas, números, caracteres especiales ✅
- Caracteres especiales: `!@#$%^&*` ✅

**En el proyecto real (passwordValidator.js):**
```javascript
// ✅ Mínimo 8 caracteres (correcto)
// ✅ Máximo 128 caracteres (FALTANTE en el prompt)
// ✅ Mayúsculas, minúsculas, números ✅
// ✅ Caracteres especiales: !@#$%^&* ✅
// ❌ VALIDACIÓN FALTANTE: Lista de contraseñas comunes bloqueadas (990+ contraseñas)
```

**🔧 Recomendación:**
- Agregar test para validar longitud máxima (128 caracteres)
- Agregar test para validar que contraseñas comunes sean rechazadas
- Incluir ejemplos de contraseñas comunes que deben ser bloqueadas

---

### 3. **TIPOS DE DOCUMENTO**

#### ❌ **Problema: Valores permitidos incompletos**

**En el prompt:**
```javascript
const tiposValidos = ["CC", "CE", "NIT", "Cédula de Ciudadanía", "Cédula de Extranjería"];
```

**En la documentación de la API:**
```
tipo_documento: String (CC, CE, TI, RC, NIT, PAS)
```

**🔧 Recomendación:**
- Actualizar el prompt con todos los tipos válidos: `CC`, `CE`, `TI`, `RC`, `NIT`, `PAS`
- Agregar test para cada tipo de documento válido
- Verificar si el backend acepta nombres completos como "Cédula de Ciudadanía" o solo códigos

---

### 4. **ROLES VÁLIDOS**

#### ❌ **Problema: El prompt no refleja la realidad del sistema de roles**

**En el prompt:**
```javascript
test('debe aceptar solo roles válidos (1, 2, 3)', async () => {
  const rolesValidos = [1, 2, 3];
  const rolInvalido = 999;
  // ...
});
```

**En la documentación de la API (Enero 2026):**
```javascript
// El sistema ahora acepta roles personalizados (id_rol > 3)
// El rol debe existir en la base de datos y estar activo
// No hay límite de id_rol (puede ser > 10 para roles personalizados)
```

**🔧 Recomendación:**
- Actualizar el prompt para reflejar que el sistema acepta roles dinámicos
- El test debe validar que el rol existe en la BD y está activo, no solo que sea 1, 2 o 3
- Agregar test para roles personalizados (id_rol > 3)
- Agregar test para roles inactivos (deben ser rechazados)

---

### 5. **SISTEMA DE PAGOS - ESTRUCTURA COMPLETAMENTE DIFERENTE**

#### ❌ **Problema crítico: El prompt describe un sistema de pagos genérico que no existe en el proyecto**

**En el prompt:**
```typescript
interface RegistroPago {
  id_orden_servicio: number;
  monto: number;
  metodo_pago: string;
  fecha_pago: string;
  estado: string;
  referencia: string;
  observaciones?: string;
}
```

**En el proyecto real:**
El sistema de pagos funciona de manera completamente diferente:

1. **No hay endpoint `crearPago` genérico**
   - El pago se procesa a través de `POST /api/gestion-pagos/process-mock`
   - Este endpoint procesa el pago Y activa automáticamente la solicitud

2. **Campos diferentes:**
```javascript
// Endpoint real: POST /api/gestion-pagos/process-mock
{
  orden_id: number,        // ⚠️ No es "id_orden_servicio"
  monto?: number,          // ⚠️ Opcional (se toma del total_estimado)
  metodo_pago: string      // ✅ Correcto
  // fecha_pago: NO se envía (se establece automáticamente)
  // estado: NO se envía (se establece automáticamente como "Pagado")
  // referencia: NO existe en este endpoint
  // observaciones: NO existe en este endpoint
}
```

3. **Métodos de pago válidos:**
```javascript
// En el proyecto real (según documentación):
"Transferencia bancaria"  // ⚠️ El prompt dice "Transferencia bancaria" ✅
"Tarjeta de crédito"      // ⚠️ El prompt dice "Tarjeta de crédito" ✅
"Efectivo"                // ✅ Correcto
"Cheque"                  // ✅ Correcto
// También menciona "Tarjeta" como método válido en algunos lugares
```

4. **Estados de pago:**
```javascript
// En el proyecto real, el estado se establece automáticamente:
// - "Pagado" cuando el pago se procesa exitosamente
// - El usuario no puede establecer el estado manualmente en el procesamiento
```

**🔧 Recomendación CRÍTICA:**
- **ELIMINAR** toda la sección de "Registro de Pago" del prompt actual
- **REEMPLAZAR** con tests para el endpoint real `process-mock`
- Los tests deben validar:
  - ✅ Que el pago se procesa correctamente
  - ✅ Que la solicitud se activa automáticamente después del pago
  - ✅ Que el monto se toma automáticamente del `total_estimado` si no se proporciona
  - ✅ Que el monto proporcionado debe coincidir exactamente con el `total_estimado`
  - ✅ Que `fecha_pago` se establece automáticamente
  - ✅ Que el estado se establece como "Pagado" automáticamente
  - ✅ Que el `orden_id` debe existir y la orden debe estar en estado "Pendiente de Pago"
  - ✅ Validación de métodos de pago permitidos

---

### 6. **VALIDACIONES DE MONTO**

#### ❌ **Problema: El prompt no refleja las validaciones reales**

**En el prompt:**
```javascript
test('debe rechazar monto con más de 2 decimales', async () => {
  // ...
});
```

**En el proyecto real:**
- El monto debe coincidir **exactamente** con el `total_estimado` de la orden
- El monto es **opcional** (se toma automáticamente del servicio)
- Si se proporciona, se valida que coincida exactamente

**🔧 Recomendación:**
- Agregar test para validar que el monto coincide exactamente con `total_estimado`
- Agregar test para validar que si no se proporciona monto, se toma del servicio
- El test de decimales puede no ser necesario si el backend maneja esto automáticamente

---

### 7. **FECHA DE PAGO**

#### ❌ **Problema: El prompt permite establecer fecha manualmente**

**En el prompt:**
```typescript
fecha_pago: string; // Fecha en formato ISO (YYYY-MM-DD)
```

**En el proyecto real:**
- La `fecha_pago` se establece **automáticamente** cuando el estado es "Pagado"
- El usuario NO envía la fecha en el procesamiento de pago

**🔧 Recomendación:**
- Eliminar tests de validación de formato de fecha del procesamiento
- Agregar test para validar que la fecha se establece automáticamente
- Las validaciones de fecha pueden estar en otros endpoints (GET, reportes, etc.)

---

### 8. **REFERENCIA Y OBSERVACIONES**

#### ❌ **Problema: Estos campos no existen en el procesamiento de pago**

**En el prompt:**
```typescript
referencia: string;        // Referencia de la transacción (debe ser único)
observaciones?: string;    // Observaciones opcionales sobre el pago
```

**En el proyecto real:**
- El sistema genera automáticamente un `numero_comprobante` (formato: `RC-YYYYMM-XXXX`)
- No hay campo `referencia` en el procesamiento
- No hay campo `observaciones` en el procesamiento
- Existe un campo `transaction_id` que se genera automáticamente

**🔧 Recomendación:**
- Eliminar tests relacionados con `referencia` y `observaciones` del procesamiento
- Agregar tests para validar la generación automática de `numero_comprobante`
- Agregar tests para validar la generación automática de `transaction_id`

---

## 📝 VALIDACIONES FALTANTES EN EL PROMPT

### 1. **Política de Privacidad**
El frontend valida que el usuario acepte la política de privacidad antes de registrarse. Esta validación NO está en el prompt.

**🔧 Recomendación:**
- Agregar test para validar que se rechaza el registro si no se acepta la política

### 2. **Confirmación de Contraseña**
El frontend tiene un campo `confirmPassword` que debe coincidir con `password`. Esta validación NO está en el prompt.

**🔧 Recomendación:**
- Agregar test para validar que las contraseñas coinciden

### 3. **Longitud Máxima de Contraseña**
El proyecto valida que la contraseña no exceda 128 caracteres. Esta validación NO está en el prompt.

**🔧 Recomendación:**
- Agregar test para validar longitud máxima (128 caracteres)

### 4. **Contraseñas Comunes Bloqueadas**
El proyecto tiene una lista de 990+ contraseñas comunes que están bloqueadas. Esta validación NO está en el prompt.

**🔧 Recomendación:**
- Agregar test para validar que contraseñas comunes son rechazadas
- Incluir ejemplos de contraseñas comunes de la lista

### 5. **Validación de Teléfono**
El prompt menciona validación de teléfono pero no incluye tests específicos.

**En la documentación:**
```
telefono: String opcional (7-20 caracteres, formato: `+57 300 123 4567` o `3001234567`)
```

**🔧 Recomendación:**
- Agregar tests para validar formato de teléfono
- Validar longitud (7-20 caracteres)
- Validar formatos permitidos

### 6. **Activación Automática de Solicitudes**
El sistema activa automáticamente las solicitudes después del pago. Esta funcionalidad NO está en el prompt.

**🔧 Recomendación:**
- Agregar tests para validar que la solicitud se activa después del pago
- Validar que el estado cambia de "Pendiente de Pago" al primer estado del proceso

### 7. **Monto Automático del Servicio**
El sistema toma el monto automáticamente del `total_estimado` si no se proporciona. Esta funcionalidad NO está en el prompt.

**🔧 Recomendación:**
- Agregar tests para validar que el monto se toma automáticamente
- Validar que si se proporciona monto, debe coincidir exactamente

---

## 🎯 RECOMENDACIONES GENERALES

### 1. **Separar Tests de Frontend y Backend**
El prompt mezcla conceptos de frontend y backend. Recomendación:
- Crear dos secciones: "Pruebas de Servicios/API" y "Pruebas de Componentes React"
- Los tests unitarios del prompt actual deberían ser para servicios/API
- Crear una sección separada para tests de componentes React (usando React Testing Library)

### 2. **Actualizar Estructura de Archivos**
La estructura propuesta está bien, pero debería reflejar mejor la organización del proyecto:

```
tests/
├── unit/
│   ├── services/
│   │   ├── authApiService.test.js      # Tests del servicio de autenticación
│   │   ├── paymentApiService.test.js   # Tests del servicio de pagos (si existe)
│   │   └── validationService.test.js   # Tests de validaciones
│   ├── utils/
│   │   ├── passwordValidator.test.js   # Tests del validador de contraseñas
│   │   └── sanitizer.test.js           # Tests del sanitizador
│   └── components/                     # Tests de componentes React
│       └── Register.test.jsx
├── integration/
│   └── registro-completo.test.js
└── setup/
    ├── jest.config.js
    └── test-db.js
```

### 3. **Agregar Tests de Integración**
El prompt menciona tests de integración pero no los desarrolla. Recomendación:
- Agregar ejemplos de tests de integración
- Incluir tests que validen el flujo completo: registro → creación de solicitud → procesamiento de pago → activación

### 4. **Mocks y Configuración**
El prompt no especifica qué mocks se necesitan. Recomendación:
- Especificar mocks necesarios para:
  - API Service (`apiService`)
  - localStorage
  - Fetch/Axios
  - Base de datos (si se usan tests de integración)

### 5. **Casos Edge Faltantes**
- ✅ Contraseña con 128 caracteres (máximo permitido)
- ✅ Contraseña con 129 caracteres (debe fallar)
- ✅ Documento con solo números vs string
- ✅ Email con diferentes dominios
- ✅ Teléfono con y sin código de país
- ✅ Rol inactivo (debe rechazarse)
- ✅ Orden de servicio ya pagada (no debe permitir doble pago)

---

## 📊 RESUMEN DE CAMBIOS NECESARIOS

| Sección | Estado | Prioridad | Acción Requerida |
|---------|--------|-----------|------------------|
| Estructura de datos usuario | ⚠️ Parcial | Alta | Actualizar para reflejar transformación frontend → backend |
| Validaciones contraseña | ⚠️ Incompleto | Alta | Agregar tests de longitud máxima y contraseñas comunes |
| Tipos de documento | ⚠️ Incompleto | Media | Actualizar lista de tipos válidos |
| Roles válidos | ❌ Incorrecto | Alta | Cambiar de validación estática (1,2,3) a validación dinámica (existe y activo) |
| Sistema de pagos | ❌ Incorrecto | **CRÍTICA** | Eliminar sección actual y reescribir completamente para `process-mock` |
| Validaciones monto | ⚠️ Incompleto | Alta | Agregar validación de coincidencia exacta con `total_estimado` |
| Fecha de pago | ❌ Incorrecto | Alta | Eliminar validaciones manuales, agregar test de asignación automática |
| Referencia/Observaciones | ❌ No existe | Media | Eliminar del prompt |
| Política de privacidad | ❌ Faltante | Alta | Agregar test |
| Confirmación contraseña | ❌ Faltante | Alta | Agregar test |
| Validación teléfono | ⚠️ Incompleto | Media | Agregar tests específicos |
| Activación automática solicitud | ❌ Faltante | Alta | Agregar tests |

---

## ✅ CHECKLIST DE ACTUALIZACIÓN DEL PROMPT

### Sección de Registro de Usuario
- [ ] Actualizar estructura de datos para reflejar transformación frontend → backend
- [ ] Agregar test de política de privacidad
- [ ] Agregar test de confirmación de contraseña
- [ ] Agregar test de longitud máxima de contraseña (128 caracteres)
- [ ] Agregar test de contraseñas comunes bloqueadas
- [ ] Actualizar lista de tipos de documento (CC, CE, TI, RC, NIT, PAS)
- [ ] Actualizar validación de roles (dinámica en lugar de estática)
- [ ] Agregar tests de validación de teléfono

### Sección de Registro de Pago
- [ ] **ELIMINAR** toda la sección actual
- [ ] **REESCRIBIR** para el endpoint `process-mock`
- [ ] Agregar test de activación automática de solicitud
- [ ] Agregar test de monto automático del servicio
- [ ] Agregar test de validación de monto (coincidencia exacta)
- [ ] Agregar test de fecha automática
- [ ] Agregar test de estado automático ("Pagado")
- [ ] Agregar test de generación de `numero_comprobante`
- [ ] Agregar test de generación de `transaction_id`
- [ ] Eliminar tests de `referencia` y `observaciones`
- [ ] Actualizar métodos de pago válidos según el proyecto

### Estructura General
- [ ] Separar tests de servicios y componentes
- [ ] Agregar sección de mocks necesarios
- [ ] Agregar ejemplos de tests de integración
- [ ] Actualizar estructura de archivos según organización del proyecto

---

## 🔗 REFERENCIAS

### Archivos del Proyecto Relevantes:
- `src/features/auth/services/authApiService.js` - Servicio de autenticación
- `src/features/auth/pages/register.jsx` - Componente de registro
- `src/shared/utils/passwordValidator.js` - Validador de contraseñas
- `documentacion api.md` - Documentación de la API
- `jest.config.js` - Configuración de Jest

### Documentación de la API:
- Registro de usuario: `POST /api/usuarios/registrar`
- Procesamiento de pago: `POST /api/gestion-pagos/process-mock`

---

**Fecha de análisis:** Enero 2026
**Versión del proyecto analizada:** v7.3
**Última actualización:** Enero 2026
