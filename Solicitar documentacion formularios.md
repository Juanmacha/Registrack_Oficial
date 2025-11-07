# 📋 Prompt para Solicitar Documentación del Backend - Formularios de Solicitudes

## 📌 Propósito

Este documento sirve como **template/prompt** para solicitar documentación técnica completa del endpoint de creación de solicitudes de servicio. También incluye **las respuestas reales** basadas en el código actual del backend.

---

## 🎯 Prompt para el Backend/Equipo de Desarrollo

```
Necesito la documentación técnica EXACTA del endpoint para crear solicitudes de servicio en el backend.

Por favor, proporciona la siguiente información para el endpoint:

POST /api/gestion-solicitudes/crear/:servicio

1. **Parámetro URL:**
   - ¿Qué valor debe tener `:servicio`?
   - ¿Es el ID numérico del servicio o el nombre del servicio?
   - ¿Ejemplo: `/api/gestion-solicitudes/crear/1` o `/api/gestion-solicitudes/crear/Búsqueda%20de%20antecedentes`?

2. **Headers Requeridos:**
   - ¿Qué headers son obligatorios?
   - ¿Formato exacto del token de autorización?

3. **Body Request - Formato JSON:**
   Para cada tipo de servicio, necesito saber EXACTAMENTE qué campos espera el backend:
   - Lista completa de campos requeridos
   - Lista completa de campos opcionales
   - Nombre EXACTO de cada campo (case-sensitive)
   - Tipo de dato esperado (string, number, boolean, etc.)
   - Validaciones específicas (longitud mínima/máxima, formato, etc.)
   - ¿Cómo se deben enviar los archivos (logotipo)? ¿Base64? ¿Formato exacto del Base64?
   - Ejemplo JSON completo y funcional

4. **Mapeo de Campos:**
   - ¿El backend acepta campos con nombres alternativos (aliases)?
   - Por ejemplo: ¿acepta tanto `correo` como `correo_electronico`?
   - ¿Acepta tanto `nombres_apellidos` como `nombre_solicitante`?
   - Lista completa de aliases aceptados por campo

5. **Manejo de Archivos:**
   - ¿Cómo se deben enviar los archivos (PDFs, imágenes)?
   - ¿Formato Base64 completo con prefijo `data:image/jpeg;base64,` o solo el Base64?
   - ¿Tamaño máximo permitido por archivo?
   - ¿Tipos de archivo permitidos (PDF, JPG, PNG, etc.)?

6. **Validaciones del Backend:**
   - ¿Qué validaciones realiza el backend?
   - ¿Qué mensajes de error devuelve cuando falla una validación?
   - ¿Formato exacto de los mensajes de error?

7. **Respuesta Exitosa:**
   - ¿Qué estructura tiene la respuesta cuando la solicitud se crea exitosamente?
   - ¿Qué campos devuelve?
   - ¿Ejemplo JSON completo de respuesta exitosa?

8. **Errores Comunes:**
   - ¿Qué errores puede devolver el endpoint?
   - ¿Códigos de estado HTTP para cada tipo de error?
   - ¿Formato exacto de los mensajes de error?

9. **Límites y Restricciones:**
   - ¿Tamaño máximo del payload?
   - ¿Límite de caracteres por campo?
   - ¿Restricciones de rate limiting?

10. **Ejemplos Funcionales:**
    - ¿Puedes proporcionar ejemplos de requests que funcionen correctamente?
    - ¿Puedes compartir un curl o Postman collection con ejemplos funcionales?

11. **Cambios Recientes:**
    - ¿Ha habido cambios recientes en el formato esperado?
    - ¿Hay alguna versión específica de la API que deba usar?

12. **Logs y Debugging:**
    - ¿Dónde puedo ver los logs del backend cuando falla una solicitud?
    - ¿Qué información específica aparece en los logs cuando hay un error 500?

Por favor, proporciona esta información de forma clara y con ejemplos concretos. 
Esto es crítico para que el frontend pueda integrarse correctamente con el backend.
```

---

## ✅ RESPUESTAS BASADAS EN EL CÓDIGO ACTUAL

### 1. **Parámetro URL**

**Respuesta:**
- `:servicio` debe ser el **ID numérico** del servicio (no el nombre)
- Ejemplo: `/api/gestion-solicitudes/crear/1`
- Para obtener los IDs de servicios disponibles: `GET /api/servicios`

**Código de referencia:**
```javascript
// api_Registrack/src/routes/solicitudes.routes.js
router.post("/crear/:servicio", roleMiddleware(["cliente", "administrador", "empleado"]), crearSolicitud);

// api_Registrack/src/controllers/solicitudes.controller.js
const servicioId = req.params.servicio;
const result = await servicioService.default.getServicioById(servicioId);
```

---

### 2. **Headers Requeridos**

**Respuesta:**
```http
Authorization: Bearer {token_jwt}
Content-Type: application/json
```

**Validación:**
- El token JWT es **obligatorio**
- El usuario debe estar autenticado (`req.user` debe existir)
- Roles permitidos: `cliente`, `administrador`, `empleado`

**Código de referencia:**
```javascript
// Middleware de autenticación aplicado en la ruta
if (!req.user) {
  return res.status(401).json({
    mensaje: "Usuario no autenticado",
    error: "Se requiere autenticación para crear solicitudes"
  });
}
```

---

### 3. **Body Request - Campos por Servicio**

#### **3.1. Búsqueda de Antecedentes**

**Campos Requeridos:**
```javascript
[
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "nombre_a_buscar",
  "tipo_producto_servicio",
  "logotipo"
]
```

**Ejemplo JSON Completo:**
```json
{
  "nombres_apellidos": "Juan Pérez García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan.perez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombre_a_buscar": "Mi Marca",
  "tipo_producto_servicio": "Productos alimenticios",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**Nota para Clientes vs Administradores:**
- **Cliente:** NO enviar `id_cliente` (se toma del token)
- **Administrador/Empleado:** DEBE enviar `id_cliente` (obligatorio)

---

#### **3.2. Registro de Marca (Certificación de marca)**

⚠️ **PROBLEMA ACTUAL**: Recibimos error 500 al crear solicitudes para tipo "Natural" cuando se incluye `certificado_camara_comercio`. Se requiere confirmación del backend sobre los campos requeridos/opcionales.

**Campos Requeridos - Tipo "Jurídica":**
```javascript
[
  "tipo_solicitante",        // Debe ser "Jurídica"
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "numero_nit_cedula",
  "nombre_marca",
  "tipo_producto_servicio",
  "certificado_camara_comercio",  // ✅ REQUERIDO para Jurídica
  "logotipo",
  "poder_autorizacion",
  "tipo_entidad",            // ✅ REQUERIDO para Jurídica
  "razon_social",            // ✅ REQUERIDO para Jurídica
  "nit_empresa",             // ✅ REQUERIDO para Jurídica
  "representante_legal",     // ✅ REQUERIDO para Jurídica
  "direccion_domicilio"      // ✅ REQUERIDO para Jurídica
]
```

**Campos Requeridos - Tipo "Natural":**
```javascript
[
  "tipo_solicitante",        // Debe ser "Natural"
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "numero_nit_cedula",       // Puede ser opcional, usar numero_documento si no se proporciona
  "nombre_marca",
  "tipo_producto_servicio",
  "logotipo",
  "poder_autorizacion"
  // ❓ certificado_camara_comercio: ¿REQUERIDO u OPCIONAL para Natural?
  // ❓ tipo_entidad, razon_social, nit_empresa, representante_legal, direccion_domicilio: NO se requieren para Natural
]
```

**❓ PREGUNTAS PENDIENTES AL BACKEND:**
1. ¿El campo `certificado_camara_comercio` es **REQUERIDO** u **OPCIONAL** para tipo "Natural"?
   - Si es OPCIONAL: ¿Qué pasa si se envía? ¿Se acepta o se rechaza?
   - Si es REQUERIDO: ¿Por qué? (Las personas naturales generalmente no tienen cámara de comercio)
2. ¿El tamaño del payload (~2.5MB con archivos base64) es demasiado grande?
3. ¿Cómo podemos obtener más detalles sobre los errores 500?

**Ejemplo JSON - Tipo "Jurídica" (COMPLETO):**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez Martínez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "direccion_domicilio": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos.rodriguez@email.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez Martínez",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "clase_niza": "42",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
}
```

**Ejemplo JSON - Tipo "Natural" (❓ REQUIERE CONFIRMACIÓN):**
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Pérez García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan.perez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "numero_nit_cedula": "1234567890",  // Opcional, puede ser igual a numero_documento
  "nombre_marca": "Mi Marca",
  "tipo_producto_servicio": "Productos alimenticios",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
  // ❓ "certificado_camara_comercio": ¿DEBE incluirse o NO para Natural?
  // NO incluir: tipo_entidad, razon_social, nit_empresa, representante_legal, direccion_domicilio
}
```

**⚠️ PROBLEMA ACTUAL - Error 500:**
- **Payload que causa error**: Tipo "Natural" con `certificado_camara_comercio` incluido
- **Tamaño del payload**: ~2.5MB (con archivos base64)
- **Error recibido**: 500 Internal Server Error (sin detalles específicos)
- **Fecha del problema**: Noviembre 2025
- **Estado**: 🔴 BLOQUEADO - Requiere confirmación del backend

---

#### **3.3. Renovación de Marca**

**Campos Requeridos:**
```javascript
[
  "tipo_solicitante",
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "nombre_marca",
  "numero_expediente_marca",
  "poder_autorizacion",
  "tipo_entidad",
  "razon_social",
  "nit_empresa",
  "representante_legal",
  "certificado_renovacion",
  "logotipo"
]
```

**Ejemplo JSON Completo:**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "María González",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1122334455",
  "direccion": "Avenida 19 #120-50",
  "telefono": "3156789012",
  "correo": "maria.gonzalez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "tipo_entidad": "Sociedad Anónima",
  "razon_social": "Empresa Renovación S.A.",
  "nit_empresa": 8005554443,
  "representante_legal": "María González",
  "nombre_marca": "Marca a Renovar",
  "numero_expediente_marca": "2020-123456",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "certificado_renovacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
}
```

---

#### **3.4. Cesión de Marca**

**Campos Requeridos:**
```javascript
[
  "tipo_solicitante",
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "nombre_marca",
  "numero_expediente_marca",
  "documento_cesion",
  "poder_autorizacion",
  "nombre_razon_social_cesionario",
  "nit_cesionario",
  "representante_legal_cesionario",
  "tipo_documento_cesionario",
  "numero_documento_cesionario",
  "correo_cesionario",
  "telefono_cesionario",
  "direccion_cesionario"
]
```

**Ejemplo JSON Completo:**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Pedro Sánchez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "5566778899",
  "direccion": "Calle 50 #10-20",
  "telefono": "3201112233",
  "correo": "pedro.sanchez@email.com",
  "pais": "Colombia",
  "ciudad": "Cali",
  "tipo_entidad": "Sociedad Limitada",
  "razon_social": "Empresa Cedente LTDA",
  "nit_empresa": 7003332221,
  "representante_legal": "Pedro Sánchez",
  "nombre_marca": "Marca a Ceder",
  "numero_expediente_marca": "2019-789012",
  "documento_cesion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "nombre_razon_social_cesionario": "Empresa Cesionaria S.A.",
  "nit_cesionario": "7005554443",
  "representante_legal_cesionario": "Diego Andrés Morales",
  "tipo_documento_cesionario": "Cédula de Ciudadanía",
  "numero_documento_cesionario": "9988776655",
  "correo_cesionario": "cesionario@email.com",
  "telefono_cesionario": "3188997766",
  "direccion_cesionario": "Avenida 19 #120-50, Bogotá"
}
```

---

#### **3.5. Presentación de Oposición**

**Campos Requeridos:**
```javascript
[
  "tipo_solicitante",
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "nit_empresa",
  "nombre_marca",
  "marca_a_oponerse",
  "poder_autorizacion",
  "tipo_entidad",
  "razon_social",
  "representante_legal",
  "argumentos_respuesta",
  "documentos_oposicion"
]
```

**Ejemplo JSON Completo:**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Ana Martínez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "3344556677",
  "direccion": "Carrera 15 #93-47",
  "telefono": "3112223344",
  "correo": "ana.martinez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Empresa Opositora S.A.S.",
  "nit_empresa": 9007778889,
  "representante_legal": "Ana Martínez",
  "nombre_marca": "Mi Marca Protegida",
  "marca_a_oponerse": "Marca Similar Confusa",
  "argumentos_respuesta": "La marca es similar y puede causar confusión en el mercado",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "documentos_oposicion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
}
```

---

#### **3.6. Respuesta de Oposición**

**Campos Requeridos:**
```javascript
[
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "nit_empresa",
  "nombre_marca",
  "numero_expediente_marca",
  "marca_opositora",
  "poder_autorizacion",
  "razon_social",
  "representante_legal"
]
```

**Ejemplo JSON Completo:**
```json
{
  "nombres_apellidos": "Luis Fernández",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "7788990011",
  "direccion": "Calle 72 #10-20",
  "telefono": "3123334455",
  "correo": "luis.fernandez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "razon_social": "Empresa Respondedora S.A.",
  "nit_empresa": 8001112223,
  "representante_legal": "Luis Fernández",
  "nombre_marca": "Marca Defendida",
  "numero_expediente_marca": "2021-345678",
  "marca_opositora": "Marca que se Opuso",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
}
```

---

#### **3.7. Ampliación de Alcance**

**Campos Requeridos:**
```javascript
[
  "documento_nit_titular",
  "direccion",
  "ciudad",
  "pais",
  "correo",
  "telefono",
  "numero_registro_existente",
  "nombre_marca",
  "clase_niza_actual",
  "nuevas_clases_niza",
  "descripcion_nuevos_productos_servicios",
  "soportes"
]
```

**Ejemplo JSON Completo:**
```json
{
  "documento_nit_titular": "9001234567",
  "direccion": "Carrera 7 #32-16",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "correo": "ampliacion@email.com",
  "telefono": "3134445566",
  "numero_registro_existente": "2020-567890",
  "nombre_marca": "Marca a Ampliar",
  "clase_niza_actual": "25",
  "nuevas_clases_niza": "28, 35",
  "descripcion_nuevos_productos_servicios": "Ampliación para incluir calzado deportivo y servicios de retail",
  "soportes": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
}
```

---

### 4. **Mapeo de Campos (Aliases Aceptados)**

El backend acepta múltiples nombres para el mismo campo. Aquí está el mapeo completo:

| Campo Principal | Aliases Aceptados |
|----------------|-------------------|
| `correo` | `correo_electronico` |
| `nombres_apellidos` | `nombre_completo`, `nombre_representante` |
| `direccion` | `direccion_domicilio` |
| `pais` | `pais_titular`, `pais_residencia` |
| `ciudad` | `ciudad_titular`, `ciudad_residencia` |
| `tipo_entidad` | `tipo_entidad_razon_social` |
| `razon_social` | `nombre_empresa` |
| `nit_empresa` | `nit` |
| `poder_autorizacion` | `poder_representante_autorizado` |
| `nombre_marca` | `nombre_a_buscar` |
| `clase_niza` | `clase_niza_actual` |
| `tipo_solicitante` | `tipo_persona` |

**Código de referencia:**
```javascript
// api_Registrack/src/controllers/solicitudes.controller.js (líneas 699-712)
tipodepersona: req.body.tipo_solicitante || req.body.tipo_persona,
tipodedocumento: req.body.tipo_documento,
numerodedocumento: req.body.numero_documento,
nombrecompleto: req.body.nombres_apellidos || req.body.nombre_completo || req.body.nombre_representante,
correoelectronico: req.body.correo || req.body.correo_electronico,
telefono: req.body.telefono,
direccion: req.body.direccion || req.body.direccion_domicilio,
tipodeentidadrazonsocial: req.body.tipo_entidad || req.body.tipo_entidad_razon_social,
nombredelaempresa: req.body.nombre_empresa || req.body.razon_social,
nit: req.body.nit_empresa || req.body.nit,
poderdelrepresentanteautorizado: req.body.poder_representante_autorizado || req.body.poder_autorizacion,
```

---

### 5. **Manejo de Archivos**

**Formato Base64:**
- Los archivos deben enviarse como **strings en formato Base64**
- **Pueden incluir el prefijo** `data:image/jpeg;base64,` o `data:application/pdf;base64,`
- También se acepta **solo el Base64** sin prefijo

**Ejemplos válidos:**
```json
{
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "logotipo": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "certificado_camara_comercio": "JVBERi0xLjQKJeLjz9MK..."
}
```

**Tipos de archivo permitidos:**
- Imágenes: JPG, JPEG, PNG (para `logotipo`)
- Documentos: PDF (para certificados, poderes, documentos)

**Tamaño máximo recomendado:**
- 5MB por archivo (no hay validación estricta en el backend, pero se recomienda este límite)

**Código de referencia:**
```javascript
// Los archivos se almacenan directamente como strings Base64 en la base de datos
logotipo: req.body.logotipo,
certificado_camara_comercio: req.body.certificado_camara_comercio,
```

---

### 6. **Validaciones del Backend**

#### **6.1. Validaciones de Autenticación:**
- Usuario debe estar autenticado (`req.user` existe)
- Error 401 si no está autenticado

#### **6.2. Validaciones de Servicio:**
- El servicio debe existir en la base de datos
- Error 404 si el servicio no existe

#### **6.3. Validaciones de Campos Requeridos:**
- Se valida que todos los campos requeridos estén presentes
- Error 400 con lista de campos faltantes

**Código de referencia:**
```javascript
// Validación de campos requeridos
const camposRequeridos = requiredFields[servicioEncontrado.nombre] || [];
const camposFaltantes = camposRequeridos.filter(campo => !req.body[campo]);

if (camposFaltantes.length > 0) {
  return res.status(400).json({
    mensaje: "Campos requeridos faltantes",
    campos_faltantes: camposFaltantes,
    servicio: servicioEncontrado.nombre
  });
}
```

#### **6.4. Validaciones de Tipo de Persona:**
- `tipo_solicitante` debe ser `"Natural"` o `"Jurídica"`
- Si es `"Jurídica"`, se requieren campos adicionales (razon_social, nit_empresa, representante_legal, etc.)

#### **6.5. Validaciones de NIT:**
- `nit_empresa` o `nit` debe ser un número entero de 10 dígitos (1000000000 - 9999999999)
- **NO incluir el dígito de verificación con guión**
- Ejemplo correcto: `9001234567` (no `"900123456-1"`)

#### **6.6. Validaciones de Email:**
- Formato de email válido (validación básica)

#### **6.7. Validaciones de Rol:**
- **Cliente:** NO debe enviar `id_cliente` (se toma del token)
- **Administrador/Empleado:** DEBE enviar `id_cliente` (error 400 si falta)

**Mensajes de error típicos:**
```json
{
  "mensaje": "Campos requeridos faltantes",
  "campos_faltantes": ["nombres_apellidos", "correo"],
  "servicio": "Búsqueda de Antecedentes"
}
```

```json
{
  "mensaje": "Usuario no autenticado",
  "error": "Se requiere autenticación para crear solicitudes"
}
```

```json
{
  "mensaje": "Servicio no encontrado",
  "servicio": "999",
  "error": "El servicio solicitado no está disponible"
}
```

```json
{
  "mensaje": "id_cliente es requerido para administradores y empleados",
  "error": "Los administradores y empleados deben especificar el id_cliente"
}
```

---

### 7. **Respuesta Exitosa**

#### **7.1. Respuesta para Cliente (Requiere Pago):**

```json
{
  "success": true,
  "mensaje": "Solicitud creada. Pendiente de pago para activar.",
  "data": {
    "orden_id": 123,
    "estado": "Pendiente de Pago",
    "monto_a_pagar": 500000.00,
    "requiere_pago": true,
    "cliente": {
      "id_cliente": 45,
      "nombre": "Juan Pérez García"
    },
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes"
    },
    "empresa": {
      "id_empresa": 10,
      "nombre": "Mi Empresa S.A.S."
    }
  },
  "nextSteps": [
    "Procesar el pago usando POST /api/gestion-pagos/process-mock",
    "La solicitud se activará automáticamente después del pago exitoso"
  ]
}
```

#### **7.2. Respuesta para Administrador/Empleado (Activación Automática):**

```json
{
  "success": true,
  "mensaje": "Solicitud creada y activada exitosamente.",
  "data": {
    "orden_id": 124,
    "estado": "Solicitud Recibida",
    "monto_a_pagar": null,
    "requiere_pago": false,
    "cliente": {
      "id_cliente": 45,
      "nombre": "María González"
    },
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes"
    },
    "empresa": {
      "id_empresa": 10,
      "nombre": "Empresa Cliente S.A.S."
    },
    "proceso_actual": {
      "id_proceso": 1,
      "nombre": "Solicitud Recibida",
      "orden": 1
    }
  },
  "nextSteps": [
    "La solicitud está activa y lista para procesamiento",
    "Puedes asignar un empleado usando PUT /api/gestion-solicitudes/asignar-empleado/:id"
  ]
}
```

**Código de referencia:**
```javascript
// api_Registrack/src/controllers/solicitudes.controller.js (líneas 853-905)
return res.status(201).json({
  success: true,
  mensaje: req.user.rol === 'cliente' 
    ? "Solicitud creada. Pendiente de pago para activar."
    : "Solicitud creada y activada exitosamente.",
  data: {
    orden_id: ordenActualizada.id_orden_servicio,
    estado: ordenActualizada.estado,
    monto_a_pagar: requierePago ? ordenActualizada.total_estimado : null,
    requiere_pago: requierePago,
    // ... más campos
  }
});
```

---

### 8. **Errores Comunes**

| Código HTTP | Error | Causa | Solución |
|-------------|-------|-------|----------|
| **400** | Campos requeridos faltantes | Faltan campos obligatorios | Revisar lista de campos requeridos por servicio |
| **400** | id_cliente es requerido | Admin/empleado no envió `id_cliente` | Agregar `id_cliente` al body |
| **401** | Usuario no autenticado | Token inválido o ausente | Verificar token JWT en header Authorization |
| **403** | Acceso denegado | Rol no permitido | Verificar que el usuario tenga rol `cliente`, `administrador` o `empleado` |
| **404** | Servicio no encontrado | ID de servicio inválido | Verificar ID con `GET /api/servicios` |
| **500** | Error interno del servidor | Error en el backend | Revisar logs del servidor |

**Ejemplos de respuestas de error:**

```json
{
  "mensaje": "Campos requeridos faltantes",
  "campos_faltantes": ["nombres_apellidos", "correo", "logotipo"],
  "servicio": "Búsqueda de Antecedentes"
}
```

```json
{
  "mensaje": "id_cliente es requerido para administradores y empleados",
  "error": "Los administradores y empleados deben especificar el id_cliente"
}
```

```json
{
  "mensaje": "Servicio no encontrado",
  "servicio": "999",
  "error": "El servicio solicitado no está disponible"
}
```

```json
{
  "mensaje": "Error interno del servidor",
  "error": "Error al crear la solicitud",
  "detalles": "SequelizeValidationError: ..."
}
```

---

### 9. **Límites y Restricciones**

**Tamaño máximo del payload:**
- No hay límite estricto configurado en el código
- Recomendado: máximo 10MB total (considerando archivos Base64)

**Límite de caracteres por campo:**
- Basado en las validaciones del modelo de base de datos
- Ver `FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md` para límites específicos por campo

**Rate limiting:**
- No hay rate limiting configurado actualmente

**Tamaño de archivos:**
- Recomendado: máximo 5MB por archivo
- No hay validación estricta en el backend

---

### 10. **Ejemplos Funcionales**

#### **10.1. cURL - Cliente crea solicitud (Búsqueda de Antecedentes):**

```bash
curl -X POST "https://api.registrack.com/api/gestion-solicitudes/crear/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nombres_apellidos": "Juan Pérez García",
    "tipo_documento": "Cédula de Ciudadanía",
    "numero_documento": "1234567890",
    "direccion": "Calle 123 #45-67",
    "telefono": "3001234567",
    "correo": "juan.perez@email.com",
    "pais": "Colombia",
    "ciudad": "Bogotá",
    "nombre_a_buscar": "Mi Marca",
    "tipo_producto_servicio": "Productos alimenticios",
    "clase_niza": "25",
    "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
  }'
```

#### **10.2. cURL - Administrador crea solicitud (Certificación de Marca):**

```bash
curl -X POST "https://api.registrack.com/api/gestion-solicitudes/crear/2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "id_cliente": 45,
    "tipo_solicitante": "Jurídica",
    "nombres_apellidos": "María González",
    "tipo_documento": "Cédula de Ciudadanía",
    "numero_documento": "9876543210",
    "direccion": "Carrera 78 #90-12",
    "telefono": "3109876543",
    "correo": "maria.gonzalez@email.com",
    "pais": "Colombia",
    "ciudad": "Medellín",
    "tipo_entidad": "Sociedad por Acciones Simplificada",
    "razon_social": "Mi Empresa S.A.S.",
    "nit_empresa": 9001234567,
    "representante_legal": "María González",
    "numero_nit_cedula": "9001234567",
    "nombre_marca": "Marca Premium",
    "tipo_producto_servicio": "Servicios tecnológicos",
    "clase_niza": "42",
    "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
    "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
  }'
```

#### **10.3. Postman Collection:**

Ver archivo: `EJEMPLO_POSTMAN_PAGO_ANTES_ACTIVAR.md` para ejemplos completos de Postman con:
- Variables de entorno
- Pre-request scripts
- Tests automatizados
- Ejemplos para todos los servicios

---

### 11. **Cambios Recientes**

**Enero 2026:**
- ✅ **Flujo Diferenciado por Rol:**
  - **Clientes:** Crean solicitudes con estado "Pendiente de Pago" que requieren pago por API
  - **Administradores/Empleados:** Crean solicitudes que se activan automáticamente (pago físico posterior)
- ✅ **Campo `id_cliente` obligatorio para admin/empleado:**
  - Los administradores/empleados DEBEN enviar `id_cliente` en el body
  - Los clientes NO deben enviar `id_cliente` (se toma del token)

**Octubre 2025:**
- ✅ Validación dinámica de campos según tipo de servicio
- ✅ Mapeo de campos con aliases
- ✅ Creación automática de clientes, empresas y servicios si no existen

**Ver README.md para historial completo de cambios.**

---

### 12. **Logs y Debugging**

**Ubicación de logs:**
- Los logs se imprimen en la consola del servidor
- Formato: `console.log()` con emojis para facilitar identificación

**Logs típicos durante creación de solicitud:**
```
🚀 Iniciando creación de solicitud...
🔍 Debug - req.user: { id_usuario: 45, rol: 'cliente', ... }
✅ Usuario autenticado: 45 cliente
🔍 ID de servicio: 1
✅ Servicio encontrado: Búsqueda de Antecedentes
📋 Campos requeridos para Búsqueda de Antecedentes: [...]
✅ Todos los campos requeridos están presentes
🔍 Buscando cliente existente...
✅ Cliente encontrado con ID: 45
🔍 Buscando empresa existente...
✅ Empresa encontrada con ID: 10
✅ Orden de servicio creada con ID: 123
✅ Solicitud creada exitosamente
```

**Logs de error típicos:**
```
❌ Usuario no autenticado
❌ ID de servicio no proporcionado
❌ Servicio no encontrado: 999
❌ Campos requeridos faltantes: ["nombres_apellidos", "correo"]
❌ Error al crear la solicitud: SequelizeValidationError: ...
```

**Para debugging:**
1. Revisar los logs del servidor en tiempo real
2. Verificar que el token JWT sea válido
3. Verificar que todos los campos requeridos estén presentes
4. Verificar que el ID del servicio sea correcto
5. Verificar formato de archivos Base64

---

## ⚠️ PROBLEMAS ACTUALES Y ACCIONES PENDIENTES

### 🔴 Problema Crítico: Error 500 en Certificación de Marca (Tipo "Natural")

**Estado**: 🔴 **BLOQUEADO**

**Descripción del problema**:
- Al crear una solicitud de "Certificación de Marca" con `tipo_solicitante: "Natural"` y enviando el campo `certificado_camara_comercio`, el backend responde con error 500 genérico sin detalles específicos.
- El payload tiene un tamaño aproximado de ~2.5MB (incluye archivos base64).

**Payload que causa el error**:
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Gómez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "465788",
  "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
  "telefono": "3001234567",
  "correo": "juanmanuelmachadomaturana1@gmail.com",
  "pais": "Colombia",
  "nombre_marca": "DEsports",
  "tipo_producto_servicio": "Venta de ropa",
  "logotipo": "data:image/jpeg;base64,...",  // ~195KB
  "poder_autorizacion": "data:application/pdf;base64,...",  // ~1.16MB
  "numero_nit_cedula": "23456789",
  "certificado_camara_comercio": "data:application/pdf;base64,...",  // ~1.16MB - ❓ ¿VÁLIDO PARA "Natural"?
  "ciudad": "Bogotá",
  "clase_niza": "34"
}
```

**Error recibido**:
```json
{
  "success": false,
  "error": {
    "message": "Error interno del servidor",
    "code": "INTERNAL_ERROR",
    "details": {
      "details": "Error interno del servidor"
    },
    "timestamp": "2025-11-07T12:18:09.431Z"
  }
}
```

**Preguntas críticas para el backend**:

1. ❓ **¿El campo `certificado_camara_comercio` es REQUERIDO u OPCIONAL para tipo "Natural"?**
   - Si es **OPCIONAL**: ¿Qué pasa si se envía? ¿Se acepta o se rechaza?
   - Si es **REQUERIDO**: ¿Por qué? (Las personas naturales generalmente no tienen cámara de comercio)

2. ❓ **¿El tamaño del payload (~2.5MB con archivos base64) es demasiado grande?**
   - ¿Cuál es el límite máximo del payload aceptado?
   - ¿Hay algún límite de tamaño por archivo?

3. ❓ **¿Cómo podemos obtener más detalles sobre los errores 500?**
   - Los errores actuales son muy genéricos sin información específica
   - ¿Dónde podemos ver los logs del backend cuando ocurre un error 500?
   - ¿Qué información aparece en los logs cuando falla una solicitud?

4. ❓ **¿Hay alguna validación específica que esté fallando?**
   - ¿El backend valida que los campos condicionales (tipo_entidad, razon_social, etc.) NO estén presentes cuando es "Natural"?
   - ¿Hay alguna validación de formato de base64 que esté fallando?

**Acciones tomadas**:
- ✅ Corregido error de sintaxis en el frontend (variable duplicada)
- ✅ Mejorado el manejo de errores en el frontend
- ✅ Creado prompt detallado para solicitar documentación al backend
- ✅ Documentado el problema y las preguntas críticas

**Acciones pendientes**:
- ⏳ **ESPERANDO RESPUESTA DEL BACKEND** sobre:
  - Confirmación de campos requeridos/opcionales para tipo "Natural"
  - Límites de tamaño de payload y archivos
  - Acceso a logs para debugging
  - Ejemplos JSON funcionales para tipo "Natural"

**Referencias**:
- Ver `PROMPT_SOLICITAR_DOCUMENTACION_CERTIFICACION_MARCA.md` para el prompt completo
- Ver `PROMPT_COPIA_PEGAR_BACKEND.txt` para versión concisa del prompt

**Fecha del problema**: Noviembre 2025
**Prioridad**: 🔴 **ALTA** - Bloquea funcionalidad crítica

---

## 📚 Documentación Adicional

Para más detalles, consultar:

1. **`FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md`** - Especificación completa de todos los campos por servicio
2. **`README.md`** - Documentación general de la API
3. **`EJEMPLO_POSTMAN_PAGO_ANTES_ACTIVAR.md`** - Ejemplos de Postman con flujo completo
4. **`PROMPT_SOLICITAR_DOCUMENTACION_CERTIFICACION_MARCA.md`** - Prompt detallado para solicitar documentación al backend
5. **`PROMPT_COPIA_PEGAR_BACKEND.txt`** - Versión concisa del prompt para enviar al backend

---

## 🔄 Formato de Respuesta Esperado del Backend

Si necesitas solicitar esta información al equipo de backend, pide que la proporcionen en uno de estos formatos:

1. **Formato JSON Schema** (preferido):
   ```json
   {
     "endpoint": "POST /api/gestion-solicitudes/crear/:servicio",
     "parametro_url": {
       "tipo": "number",
       "ejemplo": 1,
       "descripcion": "ID numérico del servicio"
     },
     "headers": {
       "Authorization": "Bearer {token}",
       "Content-Type": "application/json"
     },
     "body": {
       "Búsqueda de Antecedentes": {
         "campos_requeridos": {
           "campo1": {
             "tipo": "string",
             "validacion": "min:3, max:100",
             "ejemplo": "valor ejemplo"
           }
         },
         "campos_opcionales": {...},
         "ejemplo_completo": {...}
       }
     }
   }
   ```

2. **Formato Markdown** con ejemplos claros

3. **Postman Collection** exportada

4. **Swagger/OpenAPI** specification

---

**Última actualización:** Enero 2026

