# 📋 Prompt para Solicitar Documentación del Backend - Formularios de Solicitudes

## Prompt para el Backend/Equipo de Desarrollo

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

   **a) Búsqueda de Antecedentes:**
   - Lista completa de campos requeridos
   - Lista completa de campos opcionales
   - Nombre EXACTO de cada campo (case-sensitive)
   - Tipo de dato esperado (string, number, boolean, etc.)
   - Validaciones específicas (longitud mínima/máxima, formato, etc.)
   - ¿Cómo se deben enviar los archivos (logotipo)? ¿Base64? ¿Formato exacto del Base64?
   - Ejemplo JSON completo y funcional

   **b) Certificación de Marca:**
   - Misma información que arriba

   **c) Renovación de Marca:**
   - Misma información que arriba

   **d) Cesión de Marca:**
   - Misma información que arriba

   **e) Presentación de Oposición:**
   - Misma información que arriba

   **f) Respuesta de Oposición:**
   - Misma información que arriba

   **g) Ampliación de Alcance:**
   - Misma información que arriba

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

## Información Adicional que Puedes Agregar

Si el backend tiene documentación en Swagger/OpenAPI, Postman, o cualquier otro formato, también puedes solicitar:

```
Además, si tienes:
- Documentación Swagger/OpenAPI
- Postman Collection
- Documentación en formato Markdown/README
- Cualquier otro formato de documentación

Por favor, compártelo también.
```

---

## Contexto del Problema Actual

Si necesitas explicar por qué necesitas esta información, puedes agregar:

```
Actualmente estoy recibiendo un error 500 "Error interno del servidor" cuando intento crear solicitudes desde el frontend.

El frontend está enviando los siguientes datos:
- Formato antiguo: nombre_solicitante, documento_solicitante, correo_electronico, marca_a_buscar, etc.
- Formato nuevo: nombres_apellidos, tipo_documento, numero_documento, nombre_a_buscar, etc.
- Archivos en formato Base64 con prefijo data:image/jpeg;base64,

Necesito saber exactamente qué formato espera el backend para poder corregir el problema.
```

---

## Formato de Respuesta Esperado

Pide que la documentación se proporcione en este formato:

```
Por favor, proporciona la documentación en uno de estos formatos:

1. **Formato JSON Schema** (preferido):
   ```json
   {
     "endpoint": "POST /api/gestion-solicitudes/crear/:servicio",
     "parametro_url": {
       "tipo": "number|string",
       "ejemplo": 1,
       "descripcion": "..."
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
```

---

**Última actualización:** Enero 2025

