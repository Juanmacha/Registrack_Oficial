# 🔧 Implementación de Correcciones Críticas - Backend

## 📋 Resumen Ejecutivo

Este documento contiene las correcciones **CRÍTICAS** que deben implementarse en el backend para resolver los errores 500 en el endpoint `POST /api/gestion-solicitudes/crear/2` (Certificación de Marca).

**Prioridad:** 🔴 **URGENTE**  
**Tiempo estimado:** 30-45 minutos  
**Impacto:** Sin estas correcciones, los usuarios no pueden crear solicitudes de Certificación de Marca.

---

## 🚨 Problemas Identificados

1. **Error 500 por límite de payload** - Express rechaza payloads > 100KB
2. **Validación incorrecta** - `certificado_camara_comercio` requerido para personas naturales
3. **Campos de empresa requeridos incorrectamente** - Personas naturales deben enviar campos vacíos
4. **Errores 500 sin detalles** - Dificulta debugging en producción

---

## ✅ Corrección 1: Aumentar Límite de Payload

### **Archivo:** `app.js`  
### **Línea:** 47 (aproximadamente)

### **Problema:**
Express tiene un límite por defecto de **100KB** para `express.json()`, pero los payloads con archivos base64 pueden ser de **2.5MB o más**.

### **Solución:**

**ANTES:**
```javascript
app.use(express.json());
```

**DESPUÉS:**
```javascript
app.use(express.json({ limit: '10mb' }));
```

### **Código Completo del Cambio:**

```javascript
// Buscar esta línea en app.js (aproximadamente línea 47)
app.use(express.json());

// Reemplazar por:
app.use(express.json({ limit: '10mb' })); // Aumentar límite para archivos base64
```

### **Notas:**
- Si necesitas más espacio, puedes usar `'50mb'` pero 10MB debería ser suficiente
- Este cambio afecta a TODOS los endpoints, pero es necesario para manejar archivos
- Considera también aumentar el límite de `express.urlencoded()` si lo usas:

```javascript
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## ✅ Corrección 2: Validación Condicional de Campos

### **Archivo 1:** `src/config/tiposFormularios.js`  
### **Líneas:** 22-43 (aproximadamente)

### **Problema:**
Los campos `certificado_camara_comercio`, `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`, y `direccion_domicilio` están marcados como requeridos para TODOS los tipos de solicitante, pero solo deberían ser requeridos para tipo "Jurídica".

### **Solución:**

**ANTES:**
```javascript
"Registro de Marca (Certificación de marca)": [
  "tipo_solicitante",
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
  "certificado_camara_comercio",  // ⚠️ BUG: Requerido incluso para Natural
  "logotipo",
  "poder_autorizacion",
  "tipo_entidad",               // ⚠️ BUG: Requerido incluso para Natural
  "razon_social",               // ⚠️ BUG: Requerido incluso para Natural
  "nit_empresa",                // ⚠️ BUG: Requerido incluso para Natural
  "representante_legal",        // ⚠️ BUG: Requerido incluso para Natural
  "direccion_domicilio"         // ⚠️ BUG: Requerido incluso para Natural
]
```

**DESPUÉS:**
```javascript
"Registro de Marca (Certificación de marca)": [
  "tipo_solicitante",
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
  "logotipo",
  "poder_autorizacion"
  // ✅ Removidos: certificado_camara_comercio, tipo_entidad, razon_social, 
  //    nit_empresa, representante_legal, direccion_domicilio
  //    Estos se validarán condicionalmente en el controlador
]
```

---

### **Archivo 2:** `src/controllers/solicitudes.controller.js`  
### **Ubicación:** Después de la validación de campos requeridos (aproximadamente línea 422)

### **Solución: Agregar Validación Condicional**

Agregar este código **DESPUÉS** de la validación de campos requeridos existente:

```javascript
// Validación condicional para Certificación de Marca
if (servicioEncontrado.nombre === "Registro de Marca (Certificación de marca)") {
  const tipoSolicitante = req.body.tipo_solicitante;
  
  if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
    return res.status(400).json({
      mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
      valor_recibido: tipoSolicitante
    });
  }
  
  if (tipoSolicitante === "Jurídica") {
    // Para jurídica, estos campos son requeridos
    const camposJuridica = [
      "certificado_camara_comercio",
      "tipo_entidad",
      "razon_social",
      "nit_empresa",
      "representante_legal",
      "direccion_domicilio"
    ];
    
    const camposFaltantesJuridica = camposJuridica.filter(
      (campo) => {
        const valor = req.body[campo];
        // Validar que el campo existe y no está vacío
        if (campo === "nit_empresa") {
          // Para nit_empresa, debe ser un número válido
          return !valor || valor === "" || isNaN(Number(valor));
        }
        return !valor || valor.toString().trim() === "";
      }
    );
    
    if (camposFaltantesJuridica.length > 0) {
      return res.status(400).json({
        mensaje: "Campos requeridos faltantes para persona jurídica",
        camposFaltantes: camposFaltantesJuridica,
        tipo_solicitante: tipoSolicitante,
        camposRequeridos: camposJuridica
      });
    }
    
    // Validación adicional de NIT para jurídica
    const nitEmpresa = Number(req.body.nit_empresa);
    if (nitEmpresa < 1000000000 || nitEmpresa > 9999999999) {
      return res.status(400).json({
        mensaje: "NIT de empresa inválido",
        error: "NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)",
        valor_recibido: req.body.nit_empresa
      });
    }
  }
  // Para Natural, estos campos son opcionales (no se validan)
}
```

### **Ubicación Exacta en el Código:**

Buscar esta sección en `solicitudes.controller.js`:

```javascript
const camposFaltantes = camposRequeridos.filter(
  (campo) => !req.body[campo] || req.body[campo].toString().trim() === ""
);

if (camposFaltantes.length > 0) {
  return res.status(400).json({
    mensaje: "Campos requeridos faltantes",
    camposFaltantes: camposFaltantes,
    camposRequeridos: camposRequeridos,
  });
}
```

**Agregar el código de validación condicional INMEDIATAMENTE DESPUÉS** de este bloque.

---

## ✅ Corrección 3: Mejorar Manejo de Errores 500

### **Archivo:** `src/controllers/solicitudes.controller.js`  
### **Ubicación:** Bloque catch del método `crearSolicitud` (aproximadamente líneas 907-913)

### **Problema:**
Los errores 500 solo muestran detalles en modo `development`, dificultando el debugging en producción.

### **Solución:**

**ANTES:**
```javascript
} catch (error) {
  console.error('💥 Error en crearSolicitud:', error);
  return res.status(500).json({
    mensaje: "Error interno del servidor",
    error: process.env.NODE_ENV === 'development' ? error.message : "Error interno",
  });
}
```

**DESPUÉS:**
```javascript
} catch (error) {
  console.error('💥 Error en crearSolicitud:', error);
  console.error('💥 Stack:', error.stack);
  console.error('💥 Request body size:', JSON.stringify(req.body || {}).length);
  console.error('💥 Request body keys:', Object.keys(req.body || {}));
  
  // Detectar errores comunes
  let mensajeError = "Error interno del servidor";
  let detalles = {};
  
  if (error.message && error.message.includes('request entity too large')) {
    mensajeError = "El payload es demasiado grande. Límite actual: 100KB. Se requiere aumentar el límite en app.js";
    detalles = {
      tipo: "PayloadTooLarge",
      limite_actual: "100KB",
      solucion: "Aumentar express.json({ limit: '10mb' }) en app.js",
      tamaño_payload: JSON.stringify(req.body || {}).length
    };
  } else if (error.name === 'SequelizeValidationError') {
    mensajeError = "Error de validación en base de datos";
    detalles = {
      tipo: "ValidationError",
      errores: error.errors.map(e => ({
        campo: e.path,
        mensaje: e.message,
        valor: e.value
      }))
    };
  } else if (error.name === 'SequelizeDatabaseError') {
    mensajeError = "Error de base de datos";
    detalles = {
      tipo: "DatabaseError",
      mensaje: error.message,
      sql: process.env.NODE_ENV === 'development' ? error.sql : undefined
    };
  } else {
    detalles = {
      tipo: error.name || "UnknownError",
      mensaje: error.message
    };
  }
  
  return res.status(500).json({
    mensaje: mensajeError,
    error: error.message,
    detalles: detalles,
    timestamp: new Date().toISOString()
  });
}
```

---

## 📝 Checklist de Implementación

- [ ] **Corrección 1:** Aumentar límite de payload en `app.js`
  - [ ] Modificar `express.json()` para incluir `{ limit: '10mb' }`
  - [ ] (Opcional) Modificar `express.urlencoded()` si se usa
  
- [ ] **Corrección 2:** Validación condicional
  - [ ] Remover campos condicionales de `tiposFormularios.js`
  - [ ] Agregar validación condicional en `solicitudes.controller.js`
  - [ ] Probar con persona Natural sin `certificado_camara_comercio`
  - [ ] Probar con persona Jurídica con todos los campos
  
- [ ] **Corrección 3:** Mejorar manejo de errores
  - [ ] Reemplazar bloque catch en `solicitudes.controller.js`
  - [ ] Probar que los errores muestran información útil
  
- [ ] **Pruebas:**
  - [ ] Probar con payload de 2.5MB
  - [ ] Probar con persona Natural sin campos de empresa
  - [ ] Probar con persona Jurídica con todos los campos
  - [ ] Verificar que los errores 500 muestran detalles útiles

---

## 🧪 Casos de Prueba

### **Caso 1: Persona Natural (Sin certificado_camara_comercio)**

```json
POST /api/gestion-solicitudes/crear/2
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Gómez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "465788",
  "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
  "telefono": "3001234567",
  "correo": "juan@email.com",
  "pais": "Colombia",
  "numero_nit_cedula": "23456789",
  "nombre_marca": "DEsports",
  "tipo_producto_servicio": "Venta de ropa",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,..."
}
```

**Resultado esperado:** ✅ 200 OK (sin campos de empresa)

---

### **Caso 2: Persona Jurídica (Con todos los campos)**

```json
POST /api/gestion-solicitudes/crear/2
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "direccion_domicilio": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos@email.com",
  "pais": "Colombia",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "certificado_camara_comercio": "data:application/pdf;base64,...",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez"
}
```

**Resultado esperado:** ✅ 200 OK

---

### **Caso 3: Persona Jurídica (Sin certificado_camara_comercio)**

```json
POST /api/gestion-solicitudes/crear/2
{
  "tipo_solicitante": "Jurídica",
  // ... otros campos ...
  // Sin certificado_camara_comercio
}
```

**Resultado esperado:** ❌ 400 Bad Request con mensaje específico

---

### **Caso 4: Payload Grande (2.5MB)**

```json
POST /api/gestion-solicitudes/crear/2
{
  // ... campos normales ...
  "logotipo": "data:image/jpeg;base64,...",  // ~195KB
  "poder_autorizacion": "data:application/pdf;base64,...",  // ~1.16MB
  "certificado_camara_comercio": "data:application/pdf;base64,..."  // ~1.16MB
}
```

**Resultado esperado:** ✅ 200 OK (después de aumentar límite)

---

## 📊 Resumen de Cambios

| Archivo | Línea Aprox. | Cambio | Prioridad |
|---------|--------------|--------|-----------|
| `app.js` | 47 | Aumentar `express.json({ limit: '10mb' })` | 🔴 CRÍTICA |
| `src/config/tiposFormularios.js` | 22-43 | Remover campos condicionales de lista requerida | 🔴 CRÍTICA |
| `src/controllers/solicitudes.controller.js` | ~422 | Agregar validación condicional | 🔴 CRÍTICA |
| `src/controllers/solicitudes.controller.js` | ~907-913 | Mejorar manejo de errores | 🟡 ALTA |

---

## ⚠️ Notas Importantes

1. **Backup:** Hacer backup de los archivos antes de modificar
2. **Testing:** Probar en ambiente de desarrollo antes de producción
3. **Logs:** Revisar logs después de implementar para verificar que funcionan
4. **Documentación:** Actualizar documentación de API si existe

---

## 📞 Soporte

Si tienes dudas durante la implementación:
1. Revisar los logs del servidor para ver errores específicos
2. Verificar que los cambios se aplicaron correctamente
3. Probar con Postman o cURL antes de probar desde el frontend

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** Listo para implementación

