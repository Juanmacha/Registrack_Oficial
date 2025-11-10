# 🔴 CORRECCIÓN CRÍTICA BACKEND - Error de Base de Datos

**Fecha:** Enero 2026  
**Estado:** 🔴 **URGENTE - BLOQUEANDO**  
**Error Actual:** `Data too long for column 'poderparaelregistrodelamarca' at row 1`  
**Error Anterior:** `Data too long for column 'poderdelrepresentanteautorizado' at row 1` (RESUELTO)

---

## 📋 Problema Identificado

El backend está intentando guardar archivos base64 en columnas de la base de datos que son demasiado pequeñas. **TODAS las columnas que almacenan archivos necesitan ser cambiadas a TEXT o LONGTEXT**.

### Error Específico (Actual):
```
Error de base de datos
Data too long for column 'poderparaelregistrodelamarca' at row 1
```

### Contexto:
- **Tipo de solicitante:** Natural
- **Campo enviado:** `poder_autorizacion` (archivo PDF en base64, ~184KB)
- **Problema:** La columna `poderparaelregistrodelamarca` es demasiado pequeña (probablemente VARCHAR(255))
- **Tamaño del payload:** 0.36MB (371KB) - dentro del límite de 10MB del backend
- **Archivos enviados:**
  - `logotipo`: ~195KB (base64)
  - `poder_autorizacion`: ~184KB (base64)

### Error Anterior (Resuelto):
```
Error de base de datos
Data too long for column 'poderdelrepresentanteautorizado' at row 1
```
**Nota:** Este error ya no ocurre porque el frontend ahora NO envía campos de representante para Natural.

---

## 🔍 Análisis del Problema

### 1. Tipo de Columna en Base de Datos (PROBLEMA PRINCIPAL)

**⚠️ PROBLEMA CRÍTICO:** Todas las columnas que almacenan archivos base64 son demasiado pequeñas.

**Columnas afectadas:**
- `poderparaelregistrodelamarca` ❌ (causa error actual)
- `poderdelrepresentanteautorizado` ❌ (causará error si se usa)
- `certificado_camara_comercio` ❌ (causará error si se usa)
- `logotipo` ❌ (causará error si se usa)
- Otras columnas de archivos ❌

**Estado actual:**
- Probablemente: `VARCHAR(255)` o `VARCHAR(1000)` (límite pequeño, máximo ~1KB)
- **Necesita ser:** `LONGTEXT` para almacenar archivos base64 grandes (hasta varios MB)

**Ejemplo del problema:**
- Archivo PDF: ~140KB (original)
- Base64: ~184KB (aumenta ~33%)
- Columna actual: VARCHAR(255) = máximo 255 caracteres
- **Resultado:** ❌ Error "Data too long"

### 2. Mapeo de Campos (Ya Corregido en Frontend)

**✅ CORRECTO:** El frontend ahora mapea correctamente:
- `poder_autorizacion` → `poderparaelregistrodelamarca` (SIEMPRE)
- `poder_representante` → `poderdelrepresentanteautorizado` (SOLO para Jurídica)
- Para Natural: NO se envían campos de representante

### 3. Lógica de Guardado (Ya Corregido en Frontend)

**✅ CORRECTO:** El frontend NO envía campos de representante legal para Natural.

---

## ✅ Correcciones Necesarias en el Backend

### **Corrección 1: Verificar Mapeo de Campos**

**Archivo:** `src/controllers/solicitudes.controller.js` (o donde se procesan los datos)

**Problema:** El backend está mapeando `poder_autorizacion` a `poderdelrepresentanteautorizado`

**Solución:**
```javascript
// ❌ INCORRECTO (actual):
const datosParaGuardar = {
  poderdelrepresentanteautorizado: req.body.poder_autorizacion, // ❌ MAL - esto es para representante
  // ...
};

// ✅ CORRECTO:
const datosParaGuardar = {
  // Para poder_autorizacion (poder para el registro de la marca)
  poderparaelregistrodelamarca: req.body.poder_autorizacion, // ✅ Campo correcto
  
  // Para poder_representante (solo si es Jurídica y existe)
  ...(req.body.tipo_solicitante === 'Jurídica' && req.body.poder_representante ? {
    poderdelrepresentanteautorizado: req.body.poder_representante
  } : {}),
  
  // Para Natural, NO incluir campos de representante
  ...(req.body.tipo_solicitante === 'Natural' ? {} : {
    // Solo incluir campos de representante si es Jurídica
    representante_legal: req.body.representante_legal,
    // ...
  })
};
```

### **Corrección 2: Cambiar Tipo de Columna en Base de Datos (CRÍTICO)**

**Archivo:** Migración de base de datos

**Problema:** **TODAS las columnas que almacenan archivos base64 son demasiado pequeñas** (probablemente VARCHAR(255))

**⚠️ URGENTE:** El error actual es con `poderparaelregistrodelamarca`, pero **TODAS las columnas de archivos deben cambiarse**.

**Solución - Cambiar TODAS las columnas de archivos:**
```sql
-- ✅ CRÍTICO: Cambiar TODAS las columnas que almacenan archivos base64 a TEXT o LONGTEXT
-- Archivos pueden ser grandes (hasta varios MB en base64)

-- Para MySQL/MariaDB:
ALTER TABLE ordenes_servicio 
MODIFY COLUMN poderparaelregistrodelamarca LONGTEXT;

ALTER TABLE ordenes_servicio 
MODIFY COLUMN poderdelrepresentanteautorizado LONGTEXT;

ALTER TABLE ordenes_servicio 
MODIFY COLUMN certificado_camara_comercio LONGTEXT;

ALTER TABLE ordenes_servicio 
MODIFY COLUMN logotipo LONGTEXT;

-- ✅ También revisar otras columnas que puedan almacenar archivos:
-- (Ajustar según el esquema real de tu base de datos)

ALTER TABLE ordenes_servicio 
MODIFY COLUMN documento_cesion LONGTEXT;

ALTER TABLE ordenes_servicio 
MODIFY COLUMN certificado_renovacion LONGTEXT;

ALTER TABLE ordenes_servicio 
MODIFY COLUMN documentos_oposicion LONGTEXT;

ALTER TABLE ordenes_servicio 
MODIFY COLUMN soportes LONGTEXT;

-- ✅ Verificar que los cambios se aplicaron correctamente:
DESCRIBE ordenes_servicio;

-- Las columnas deben mostrar:
-- poderparaelregistrodelamarca | longtext | YES | NULL |
-- logotipo | longtext | YES | NULL |
-- etc.
```

**⚠️ IMPORTANTE:**
- **LONGTEXT** puede almacenar hasta **4GB** de datos (suficiente para archivos base64)
- **TEXT** puede almacenar hasta **64KB** (puede no ser suficiente para archivos grandes)
- **Recomendación:** Usar **LONGTEXT** para todas las columnas de archivos

### **Corrección 3: Validar que NO se Guarden Campos de Representante para Natural**

**Archivo:** `src/controllers/solicitudes.controller.js`

**Problema:** El backend intenta guardar campos de representante para Natural

**Solución:**
```javascript
// Antes de guardar, validar tipo_solicitante
if (req.body.tipo_solicitante === 'Natural') {
  // ❌ NO incluir campos de representante legal
  delete datosParaGuardar.poderdelrepresentanteautorizado;
  delete datosParaGuardar.representante_legal;
  delete datosParaGuardar.tipo_entidad;
  delete datosParaGuardar.razon_social;
  delete datosParaGuardar.nit_empresa;
  delete datosParaGuardar.direccion_domicilio;
  delete datosParaGuardar.certificado_camara_comercio;
  
  // ✅ Solo incluir campos de Natural
  // poder_autorizacion -> poderparaelregistrodelamarca (NO poderdelrepresentanteautorizado)
}
```

---

## 🔧 Implementación Paso a Paso

### **Paso 1: Verificar Mapeo Actual**

Revisar en el controlador cómo se mapean los campos:
```javascript
// Buscar dónde se procesa poder_autorizacion
// Verificar a qué columna se mapea
```

### **Paso 2: Corregir Mapeo**

Asegurar que:
- `poder_autorizacion` → `poderparaelregistrodelamarca` (SIEMPRE)
- `poder_representante` → `poderdelrepresentanteautorizado` (SOLO para Jurídica)

### **Paso 3: Crear Migración de Base de Datos**

Crear una migración para cambiar el tipo de columnas:
```javascript
// migrations/YYYYMMDDHHMMSS-change-file-columns-to-text.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ordenes_servicio', 'poderparaelregistrodelamarca', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.changeColumn('ordenes_servicio', 'poderdelrepresentanteautorizado', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.changeColumn('ordenes_servicio', 'certificado_camara_comercio', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.changeColumn('ordenes_servicio', 'logotipo', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    // Revertir cambios si es necesario
  }
};
```

### **Paso 4: Validar Lógica de Guardado**

Asegurar que para `tipo_solicitante = "Natural"`:
- NO se intenten guardar campos de representante legal
- NO se intente guardar en `poderdelrepresentanteautorizado`
- Solo se guarde en `poderparaelregistrodelamarca`

---

## 📊 Verificación

### **Test 1: Persona Natural**
```json
POST /api/gestion-solicitudes/crear/2
{
  "tipo_solicitante": "Natural",
  "poder_autorizacion": "data:application/pdf;base64,...",
  // ... otros campos
}
```

**Resultado esperado:**
- ✅ Se guarda en `poderparaelregistrodelamarca`
- ❌ NO se intenta guardar en `poderdelrepresentanteautorizado`
- ✅ No hay errores de "Data too long"

### **Test 2: Persona Jurídica**
```json
POST /api/gestion-solicitudes/crear/2
{
  "tipo_solicitante": "Jurídica",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "poder_representante": "data:application/pdf;base64,...",
  // ... otros campos
}
```

**Resultado esperado:**
- ✅ Se guarda `poder_autorizacion` en `poderparaelregistrodelamarca`
- ✅ Se guarda `poder_representante` en `poderdelrepresentanteautorizado`
- ✅ No hay errores de "Data too long"

---

## ⚠️ Notas Importantes

1. **No romper datos existentes:** La migración debe ser segura y no eliminar datos existentes
2. **Validar en ambos lados:** Tanto el backend como el frontend deben validar que no se envíen campos incorrectos
3. **Logs detallados:** Agregar logs para identificar dónde se está mapeando incorrectamente
4. **Pruebas exhaustivas:** Probar con archivos de diferentes tamaños (pequeños, medianos, grandes)

---

## 🚨 Prioridad

**URGENTE** - Este error está bloqueando la creación de solicitudes para personas Naturales.

---

## 📞 Contacto

Si necesitas más información sobre el error o la estructura del payload, revisar:
- `solicitudesApiService.js` - Cómo se construye el payload en el frontend
- Logs del backend - Ver dónde se está mapeando incorrectamente

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** 🔴 **PENDIENTE DE IMPLEMENTACIÓN EN BACKEND**

