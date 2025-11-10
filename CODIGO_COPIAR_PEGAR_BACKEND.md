# 📋 Código Listo para Copiar y Pegar - Correcciones Backend

Este documento contiene el código exacto que debe copiarse y pegarse en los archivos del backend.

---

## 🔧 Corrección 1: app.js

### **Ubicación:** Buscar `app.use(express.json());`

### **Reemplazar por:**

```javascript
app.use(express.json({ limit: '10mb' })); // Aumentar límite para archivos base64
```

### **Si también usas `express.urlencoded()`, actualizar:**

```javascript
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 🔧 Corrección 2: src/config/tiposFormularios.js

### **Ubicación:** Buscar la sección de "Registro de Marca (Certificación de marca)"

### **Código Completo a Reemplazar:**

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
]
```

**Nota:** Se removieron los campos: `certificado_camara_comercio`, `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`, `direccion_domicilio` porque ahora se validan condicionalmente.

---

## 🔧 Corrección 3: src/controllers/solicitudes.controller.js

### **Paso 1: Ubicación del código a agregar**

Buscar esta sección en el método `crearSolicitud`:

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

### **Paso 2: Agregar INMEDIATAMENTE DESPUÉS del bloque anterior:**

```javascript
// ============================================
// VALIDACIÓN CONDICIONAL PARA CERTIFICACIÓN DE MARCA
// ============================================
if (servicioEncontrado.nombre === "Registro de Marca (Certificación de marca)") {
  const tipoSolicitante = req.body.tipo_solicitante;
  
  // Validar que tipo_solicitante sea válido
  if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
    return res.status(400).json({
      mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
      valor_recibido: tipoSolicitante,
      valores_aceptados: ["Natural", "Jurídica"]
    });
  }
  
  // Si es persona jurídica, validar campos adicionales requeridos
  if (tipoSolicitante === "Jurídica") {
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
        valor_recibido: req.body.nit_empresa,
        rango_valido: "1000000000 - 9999999999"
      });
    }
  }
  // Para Natural, estos campos son opcionales (no se validan)
}
// ============================================
```

---

## 🔧 Corrección 4: src/controllers/solicitudes.controller.js - Manejo de Errores

### **Paso 1: Ubicación del código a reemplazar**

Buscar el bloque `catch` en el método `crearSolicitud`:

```javascript
} catch (error) {
  console.error('💥 Error en crearSolicitud:', error);
  return res.status(500).json({
    mensaje: "Error interno del servidor",
    error: process.env.NODE_ENV === 'development' ? error.message : "Error interno",
  });
}
```

### **Paso 2: Reemplazar TODO el bloque catch por:**

```javascript
} catch (error) {
  // Logging detallado para debugging
  console.error('💥 Error en crearSolicitud:', error);
  console.error('💥 Stack:', error.stack);
  console.error('💥 Request body size:', JSON.stringify(req.body || {}).length);
  console.error('💥 Request body keys:', Object.keys(req.body || {}));
  console.error('💥 Error name:', error.name);
  console.error('💥 Error message:', error.message);
  
  // Detectar errores comunes y proporcionar mensajes útiles
  let mensajeError = "Error interno del servidor";
  let detalles = {};
  
  // Error de payload demasiado grande
  if (error.message && (
    error.message.includes('request entity too large') ||
    error.message.includes('PayloadTooLargeError') ||
    error.message.includes('too large')
  )) {
    mensajeError = "El payload es demasiado grande. Límite actual: 100KB. Se requiere aumentar el límite en app.js";
    detalles = {
      tipo: "PayloadTooLarge",
      limite_actual: "100KB",
      solucion: "Aumentar express.json({ limit: '10mb' }) en app.js",
      tamaño_payload: JSON.stringify(req.body || {}).length,
      tamaño_mb: (JSON.stringify(req.body || {}).length / (1024 * 1024)).toFixed(2) + " MB"
    };
  } 
  // Error de validación de Sequelize
  else if (error.name === 'SequelizeValidationError') {
    mensajeError = "Error de validación en base de datos";
    detalles = {
      tipo: "ValidationError",
      errores: error.errors.map(e => ({
        campo: e.path,
        mensaje: e.message,
        valor: e.value,
        tipo: e.type
      }))
    };
  } 
  // Error de base de datos de Sequelize
  else if (error.name === 'SequelizeDatabaseError') {
    mensajeError = "Error de base de datos";
    detalles = {
      tipo: "DatabaseError",
      mensaje: error.message,
      sql: process.env.NODE_ENV === 'development' ? error.sql : undefined,
      codigo: error.parent?.code
    };
  } 
  // Error de conexión a base de datos
  else if (error.name === 'SequelizeConnectionError') {
    mensajeError = "Error de conexión a la base de datos";
    detalles = {
      tipo: "ConnectionError",
      mensaje: error.message
    };
  } 
  // Error de foreign key constraint
  else if (error.name === 'SequelizeForeignKeyConstraintError') {
    mensajeError = "Error de integridad referencial";
    detalles = {
      tipo: "ForeignKeyConstraintError",
      mensaje: error.message,
      tabla: error.table
    };
  } 
  // Otros errores
  else {
    detalles = {
      tipo: error.name || "UnknownError",
      mensaje: error.message
    };
  }
  
  // Respuesta con información detallada
  return res.status(500).json({
    mensaje: mensajeError,
    error: error.message,
    detalles: detalles,
    timestamp: new Date().toISOString(),
    // Solo incluir stack en desarrollo
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}
```

---

## 📝 Resumen de Archivos a Modificar

1. ✅ **app.js** - Línea ~47: Aumentar límite de `express.json()`
2. ✅ **src/config/tiposFormularios.js** - Líneas ~22-43: Remover campos condicionales
3. ✅ **src/controllers/solicitudes.controller.js** - Línea ~422: Agregar validación condicional
4. ✅ **src/controllers/solicitudes.controller.js** - Líneas ~907-913: Mejorar manejo de errores

---

## ✅ Verificación Post-Implementación

Después de implementar los cambios, verificar:

1. **Probar con Postman/cURL:**
   ```bash
   # Persona Natural sin certificado_camara_comercio
   curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/2" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "tipo_solicitante": "Natural",
       "nombres_apellidos": "Juan Gómez",
       ...
     }'
   ```

2. **Revisar logs del servidor:**
   - Debe mostrar información detallada de errores
   - No debe haber errores de "request entity too large"

3. **Probar con payload grande:**
   - Enviar solicitud con archivos base64 de ~2.5MB
   - Debe procesarse correctamente

---

## 🚨 Notas Importantes

- ⚠️ **Hacer backup** de los archivos antes de modificar
- ⚠️ **Probar en desarrollo** antes de producción
- ⚠️ **Revisar logs** después de cada cambio
- ⚠️ **Verificar que no se rompieron otras funcionalidades**

---

**Última actualización:** Enero 2026  
**Versión:** 1.0

