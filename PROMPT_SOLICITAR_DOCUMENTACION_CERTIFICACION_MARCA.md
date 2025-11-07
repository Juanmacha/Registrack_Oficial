# 📋 Prompt para Solicitar Documentación del Backend - Certificación de Marca

## 🎯 Objetivo

Solicitar documentación técnica **EXACTA** y **COMPLETA** del endpoint para crear solicitudes de **Certificación de Marca** (servicio ID: 2) para poder integrarlo correctamente con el frontend.

---

## 📨 Mensaje para el Equipo de Backend

```
Hola equipo de backend,

Estamos teniendo problemas al integrar el frontend con el endpoint de creación de solicitudes 
para "Certificación de Marca" (servicio ID: 2). Actualmente recibimos un error 500 genérico 
sin detalles específicos, lo que dificulta el diagnóstico del problema.

Necesitamos la documentación técnica EXACTA y COMPLETA del siguiente endpoint:

POST /api/gestion-solicitudes/crear/2

Por favor, proporcionen la siguiente información de forma detallada:

## 1. Parámetro URL
- ¿El parámetro :servicio debe ser el ID numérico (2) o el nombre del servicio?
- ¿Hay alguna validación específica para este parámetro?

## 2. Headers Requeridos
- ¿Qué headers son obligatorios?
- Formato exacto del token de autorización
- ¿Se requiere algún header adicional?

## 3. Body Request - Estructura JSON EXACTA para Certificación de Marca

### 3.1. Campos Requeridos para Tipo "Natural"
Necesito saber EXACTAMENTE:
- Lista completa de campos obligatorios
- Nombre EXACTO de cada campo (case-sensitive)
- Tipo de dato esperado (string, number, boolean, etc.)
- Validaciones específicas (longitud, formato, etc.)
- ¿El campo `certificado_camara_comercio` es REQUERIDO o OPCIONAL para "Natural"?
- ¿Qué pasa si se envía `certificado_camara_comercio` para tipo "Natural"?

### 3.2. Campos Requeridos para Tipo "Jurídica"
- Lista completa de campos obligatorios
- ¿Qué campos adicionales se requieren cuando es "Jurídica"?
- ¿El campo `certificado_camara_comercio` es OBLIGATORIO para "Jurídica"?

### 3.3. Campos Opcionales
- Lista completa de campos opcionales
- ¿Qué campos pueden omitirse?
- ¿Qué valores por defecto se aplican?

### 3.4. Ejemplo JSON Completo y Funcional

Necesito ejemplos REALES que funcionen:

**Ejemplo 1: Tipo "Natural" (sin certificado_camara_comercio)**
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
  "numero_nit_cedula": "1234567890",
  "nombre_marca": "Mi Marca",
  "tipo_producto_servicio": "Productos alimenticios",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "ciudad": "Bogotá",
  "clase_niza": "25"
}
```

**Ejemplo 2: Tipo "Natural" (con certificado_camara_comercio - ¿es válido?)**
```json
{
  "tipo_solicitante": "Natural",
  // ... (mismos campos que arriba)
  "certificado_camara_comercio": "data:application/pdf;base64,..."  // ¿SE ACEPTA ESTO?
}
```

**Ejemplo 3: Tipo "Jurídica"**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez Martínez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos.rodriguez@email.com",
  "pais": "Colombia",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez Martínez",
  "direccion_domicilio": "Carrera 78 #90-12",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "certificado_camara_comercio": "data:application/pdf;base64,...",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "ciudad": "Medellín",
  "clase_niza": "42"
}
```

## 4. Manejo de Archivos (Base64)

### 4.1. Formato de Archivos
- ¿Cómo se deben enviar los archivos? ¿Base64 completo con prefijo `data:image/jpeg;base64,` o solo el Base64?
- ¿Se acepta el formato `data:application/pdf;base64,` para PDFs?
- ¿Se acepta el formato `data:image/jpeg;base64,` para imágenes?

### 4.2. Validaciones de Archivos
- ¿Tamaño máximo permitido por archivo?
- ¿Tipos de archivo permitidos (PDF, JPG, PNG, etc.)?
- ¿Hay validación de formato de base64?
- ¿Qué pasa si un archivo está mal formateado?

### 4.3. Tamaño del Payload
- ¿Hay un límite de tamaño total del payload JSON?
- ¿Cuál es el límite máximo de caracteres para el payload completo?
- Actualmente estamos enviando payloads de ~2.5MB (con archivos base64), ¿esto es aceptable?

## 5. Validaciones Específicas del Backend

### 5.1. Validaciones de Campos
- ¿Qué validaciones realiza el backend para cada campo?
- ¿Qué formato se espera para `tipo_documento`? (¿acepta "Cédula de Ciudadanía", "Cédula de Extranjería", etc.?)
- ¿Qué formato se espera para `numero_nit_cedula`? (¿string o number?)
- ¿Cómo se valida el `correo`? (¿regex específico?)
- ¿Cómo se valida el `telefono`? (¿formato específico?)

### 5.2. Validaciones de Tipo de Solicitante
- ¿Qué valores acepta `tipo_solicitante`? ("Natural", "Jurídica", ¿otros?)
- ¿Qué pasa si se envía un tipo no válido?
- ¿El backend valida que los campos condicionales (tipo_entidad, razon_social, etc.) estén presentes cuando es "Jurídica"?

### 5.3. Validaciones de Archivos
- ¿El backend valida que los archivos base64 sean válidos?
- ¿Qué pasa si un archivo base64 está corrupto o incompleto?
- ¿Hay validación de tipo MIME de los archivos?

## 6. Manejo de Errores

### 6.1. Errores de Validación (400)
- ¿Qué estructura tienen los mensajes de error cuando falla una validación?
- ¿Se devuelven los campos específicos que fallaron?
- Ejemplo de respuesta de error 400

### 6.2. Errores del Servidor (500)
- Actualmente recibimos errores 500 genéricos sin detalles
- ¿Cómo podemos obtener más información sobre estos errores?
- ¿Dónde podemos ver los logs del backend cuando ocurre un error 500?
- ¿Qué información aparece en los logs cuando falla una solicitud?

### 6.3. Códigos de Estado HTTP
- ¿Qué códigos de estado devuelve el endpoint?
- ¿Qué significa cada código?

## 7. Respuesta Exitosa

### 7.1. Estructura de Respuesta
- ¿Qué estructura tiene la respuesta cuando la solicitud se crea exitosamente?
- ¿Qué campos devuelve?
- Ejemplo JSON completo de respuesta exitosa

### 7.2. Flujo de Cliente vs Admin/Empleado
- ¿Hay diferencias en la respuesta según el rol del usuario?
- ¿Los clientes reciben una respuesta diferente a administradores/empleados?

## 8. Casos Especiales y Edge Cases

### 8.1. Certificado de Cámara de Comercio para "Natural"
- **PREGUNTA CRÍTICA**: ¿El campo `certificado_camara_comercio` es REQUERIDO u OPCIONAL para tipo "Natural"?
- Si es OPCIONAL: ¿qué pasa si se envía? ¿Se acepta o se rechaza?
- Si es REQUERIDO: ¿por qué? (las personas naturales generalmente no tienen cámara de comercio)

### 8.2. Campos Condicionales
- ¿Qué campos son condicionales según el tipo de solicitante?
- ¿Cómo se valida que los campos condicionales estén presentes cuando corresponden?

### 8.3. Campos Vacíos vs Campos Omitidos
- ¿El backend diferencia entre un campo vacío (`""`) y un campo omitido (`undefined`)?
- ¿Qué pasa si se envía un campo con valor vacío `""`?
- ¿Qué pasa si se envía un campo con valor `null`?

## 9. Limitaciones y Restricciones

### 9.1. Límites de Tamaño
- ¿Tamaño máximo del payload total?
- ¿Tamaño máximo por archivo?
- ¿Límite de caracteres por campo de texto?

### 9.2. Rate Limiting
- ¿Hay rate limiting configurado?
- ¿Cuántas solicitudes se pueden hacer por minuto/hora?

## 10. Logs y Debugging

### 10.1. Logs del Backend
- ¿Dónde puedo ver los logs del backend cuando falla una solicitud?
- ¿Qué información específica aparece en los logs cuando hay un error 500?
- ¿Puedo obtener logs más detallados para debugging?

### 10.2. Información de Debugging
- ¿Qué información adicional puedo incluir en las requests para facilitar el debugging?
- ¿Hay algún header especial para activar modo debug?

## 11. Datos que Estamos Enviando Actualmente

Para referencia, este es el payload que estamos enviando actualmente:

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
  "logotipo": "data:image/jpeg;base64,...",  // ~195KB en base64
  "poder_autorizacion": "data:application/pdf;base64,...",  // ~1.16MB en base64
  "numero_nit_cedula": "23456789",
  "certificado_camara_comercio": "data:application/pdf;base64,...",  // ~1.16MB en base64
  "ciudad": "Bogotá",
  "clase_niza": "34"
}
```

**Payload total**: ~2.5MB en JSON
**Response actual**: 500 Internal Server Error (sin detalles)

## 12. Preguntas Específicas

1. **¿El campo `certificado_camara_comercio` es válido para tipo "Natural"?**
   - Si NO: ¿el backend debería rechazar la solicitud con un error 400 específico?
   - Si SÍ: ¿por qué está fallando con error 500?

2. **¿El tamaño del payload (~2.5MB) es demasiado grande?**
   - Si SÍ: ¿cuál es el límite máximo recomendado?
   - ¿Deberíamos comprimir los archivos antes de enviarlos?

3. **¿Hay algún campo que estamos enviando incorrectamente?**
   - Revisar la estructura del JSON que enviamos vs lo que el backend espera

4. **¿Cómo podemos obtener más detalles sobre los errores 500?**
   - Los errores actuales son muy genéricos y no ayudan a diagnosticar el problema

## 13. Formato de Respuesta Esperado

Por favor, proporcionen la información en uno de estos formatos:

1. **OpenAPI/Swagger Specification** (preferido)
2. **Documentación Markdown** con ejemplos claros
3. **Postman Collection** exportada
4. **Ejemplos de cURL** funcionales

## 14. Prioridad

Esta es una funcionalidad **CRÍTICA** para el sistema. El error 500 está bloqueando que los usuarios creen solicitudes de Certificación de Marca.

Agradezco su pronta respuesta y cualquier información adicional que puedan proporcionar.

Saludos,
Equipo de Frontend
```

---

## 📝 Notas Adicionales para el Frontend

### Datos Actuales que Enviamos:
- **Servicio ID**: 2
- **Tipo de Solicitante**: "Natural" o "Jurídica"
- **Payload tamaño**: ~2.5MB (con archivos base64)
- **Archivos incluidos**:
  - `logotipo`: imagen JPEG en base64 (~195KB)
  - `poder_autorizacion`: PDF en base64 (~1.16MB)
  - `certificado_camara_comercio`: PDF en base64 (~1.16MB) - **¿válido para "Natural"?**

### Errores Actuales:
- **Error 500**: Sin detalles específicos
- **Mensaje**: "Error interno del servidor"
- **Sin información de debugging**: No sabemos qué campo o validación está fallando

### Lo que Necesitamos:
1. Confirmación de si `certificado_camara_comercio` es válido para "Natural"
2. Límites de tamaño de payload y archivos
3. Estructura exacta de campos requeridos/opcionales
4. Mejor manejo de errores (400 con detalles específicos en lugar de 500 genérico)
5. Acceso a logs del backend para debugging

---

## 🔄 Próximos Pasos Después de Recibir la Documentación

1. Revisar la documentación recibida
2. Comparar con la implementación actual del frontend
3. Ajustar el código del frontend según la documentación exacta
4. Probar con ejemplos funcionales proporcionados por el backend
5. Validar que los errores sean más descriptivos (400 en lugar de 500)

---

**Fecha de solicitud**: $(Get-Date -Format "yyyy-MM-dd")
**Prioridad**: 🔴 **ALTA**
**Bloqueo actual**: Los usuarios no pueden crear solicitudes de Certificación de Marca debido a errores 500

