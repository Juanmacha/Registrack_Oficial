# 🚨 CORRECCIÓN URGENTE: Validación Condicional en Cesión de Marca

## PROBLEMA

El backend probablemente está rechazando solicitudes de "Cesión de Marca" con `tipo_solicitante: "Natural"` porque requiere campos que solo aplican para "Jurídica" (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`).

**Error esperado (similar a Renovación y Oposición):**
```json
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": ["tipo_entidad", "razon_social", "nit_empresa", "representante_legal"]
}
```

### Payload Enviado por el Frontend (tipo "Natural"):
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123",
  "telefono": "3001234567",
  "correo": "juan@example.com",
  "pais": "Colombia",
  "nombre_marca": "Mi Marca",
  "numero_expediente_marca": "12345",
  "documento_cesion": "data:application/pdf;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  // Campos del cesionario (siempre requeridos)
  "nombre_razon_social_cesionario": "Empresa Cesionaria",
  "nit_cesionario": "9001234567",
  "representante_legal_cesionario": "María González",
  "tipo_documento_cesionario": "Cédula de Ciudadanía",
  "numero_documento_cesionario": "9876543210",
  "correo_cesionario": "cesionario@example.com",
  "telefono_cesionario": "3009876543",
  "direccion_cesionario": "Calle 456"
  // ❌ NO se envían: tipo_entidad, razon_social, nit_empresa, representante_legal (del cedente)
}
```

---

## ✅ SOLUCIÓN

Implementar validación condicional en el controlador de "Cesión de Marca":

### Código a Reemplazar:

```javascript
// ❌ ANTES: Validación fija (INCORRECTO)
const camposRequeridos = [
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
  // Campos del cesionario (siempre requeridos)
  "nombre_razon_social_cesionario",
  "nit_cesionario",
  "representante_legal_cesionario",
  "tipo_documento_cesionario",
  "numero_documento_cesionario",
  "correo_cesionario",
  "telefono_cesionario",
  "direccion_cesionario",
  // ❌ Campos de jurídica del cedente (requeridos incluso para Natural)
  "tipo_entidad",        // ❌ Requerido incluso para Natural
  "razon_social",        // ❌ Requerido incluso para Natural
  "nit_empresa",         // ❌ Requerido incluso para Natural
  "representante_legal"  // ❌ Requerido incluso para Natural
];
```

### Código Correcto:

```javascript
// ✅ DESPUÉS: Validación condicional (CORRECTO)

// 1. Validar tipo_solicitante
const tipoSolicitante = req.body.tipo_solicitante;

if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
  return res.status(400).json({
    mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
    valor_recibido: tipoSolicitante
  });
}

// 2. Campos base siempre requeridos (para Natural y Jurídica)
const camposRequeridosBase = [
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
  // Campos del cesionario (SIEMPRE requeridos, independiente del tipo de cedente)
  "nombre_razon_social_cesionario",
  "nit_cesionario",
  "representante_legal_cesionario",
  "tipo_documento_cesionario",
  "numero_documento_cesionario",
  "correo_cesionario",
  "telefono_cesionario",
  "direccion_cesionario"
];

// 3. Validar campos base
const camposFaltantes = camposRequeridosBase.filter(campo => {
  const valor = req.body[campo];
  
  // Para archivos Base64
  if (campo === "documento_cesion" || campo === "poder_autorizacion") {
    return !valor || (typeof valor === 'string' && !valor.startsWith('data:'));
  }
  
  // Para otros campos
  return !valor || (typeof valor === 'string' && valor.trim() === '');
});

// 4. Si es Jurídica, validar campos adicionales del cedente
if (tipoSolicitante === "Jurídica") {
  const camposJuridica = [
    "tipo_entidad",
    "razon_social",
    "nit_empresa",
    "representante_legal"
  ];
  
  const camposFaltantesJuridica = camposJuridica.filter(campo => {
    const valor = req.body[campo];
    
    if (campo === "nit_empresa") {
      const nit = Number(valor);
      return !valor || isNaN(nit) || nit < 1000000000 || nit > 9999999999;
    }
    
    return !valor || (typeof valor === 'string' && valor.trim() === '');
  });
  
  camposFaltantes.push(...camposFaltantesJuridica);
}

// 5. Retornar error si hay campos faltantes
if (camposFaltantes.length > 0) {
  const camposRequeridosFinales = tipoSolicitante === "Jurídica" 
    ? [...camposRequeridosBase, "tipo_entidad", "razon_social", "nit_empresa", "representante_legal"]
    : camposRequeridosBase;
    
  return res.status(400).json({
    mensaje: "Campos requeridos faltantes",
    camposFaltantes: camposFaltantes,
    tipo_solicitante: tipoSolicitante,
    camposRequeridos: camposRequeridosFinales
  });
}

// ✅ Continuar con el procesamiento...
```

---

## RESUMEN

### Campos Requeridos por Tipo:

#### Para "Natural" (Cedente):
- ✅ `tipo_solicitante` = "Natural"
- ✅ `nombres_apellidos`
- ✅ `tipo_documento`
- ✅ `numero_documento`
- ✅ `direccion`
- ✅ `telefono`
- ✅ `correo`
- ✅ `pais`
- ✅ `nombre_marca`
- ✅ `numero_expediente_marca`
- ✅ `documento_cesion`
- ✅ `poder_autorizacion`
- ✅ Campos del cesionario (SIEMPRE requeridos):
  - `nombre_razon_social_cesionario`
  - `nit_cesionario`
  - `representante_legal_cesionario`
  - `tipo_documento_cesionario`
  - `numero_documento_cesionario`
  - `correo_cesionario`
  - `telefono_cesionario`
  - `direccion_cesionario`
- ❌ `tipo_entidad` (NO requerido para Natural)
- ❌ `razon_social` (NO requerido para Natural)
- ❌ `nit_empresa` (NO requerido para Natural)
- ❌ `representante_legal` (NO requerido para Natural)

#### Para "Jurídica" (Cedente):
- ✅ Todos los campos de "Natural" +
- ✅ `tipo_entidad` (del cedente)
- ✅ `razon_social` (del cedente)
- ✅ `nit_empresa` (del cedente)
- ✅ `representante_legal` (del cedente)

---

## 📋 NOTAS IMPORTANTES

1. **Campos del Cesionario**: Los campos del cesionario (`nombre_razon_social_cesionario`, `nit_cesionario`, etc.) son **SIEMPRE requeridos**, independientemente del tipo de cedente (Natural o Jurídica).

2. **Campos del Cedente**: Solo los campos de jurídica del cedente (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`) son condicionales basados en `tipo_solicitante`.

3. **Validación condicional**: La validación debe ser **condicional** basada en `tipo_solicitante`, no una lista fija de campos.

---

## 🧪 CASOS DE PRUEBA

### Caso 1: Natural con todos los campos base
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123",
  "telefono": "3001234567",
  "correo": "juan@example.com",
  "pais": "Colombia",
  "nombre_marca": "Mi Marca",
  "numero_expediente_marca": "12345",
  "documento_cesion": "data:application/pdf;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "nombre_razon_social_cesionario": "Empresa Cesionaria",
  "nit_cesionario": "9001234567",
  "representante_legal_cesionario": "María González",
  "tipo_documento_cesionario": "Cédula de Ciudadanía",
  "numero_documento_cesionario": "9876543210",
  "correo_cesionario": "cesionario@example.com",
  "telefono_cesionario": "3009876543",
  "direccion_cesionario": "Calle 456"
}
```
**Resultado esperado:** ✅ Debe aceptar (sin campos de jurídica del cedente)

### Caso 2: Jurídica con todos los campos
```json
{
  "tipo_solicitante": "Jurídica",
  // ... todos los campos de Natural ...
  "tipo_entidad": "S.A.S",
  "razon_social": "Mi Empresa S.A.S",
  "nit_empresa": 9001234567,
  "representante_legal": "Juan Pérez"
}
```
**Resultado esperado:** ✅ Debe aceptar (con todos los campos)

### Caso 3: Jurídica sin campos de empresa del cedente
```json
{
  "tipo_solicitante": "Jurídica",
  // ... otros campos base ...
  // ❌ Faltan: tipo_entidad, razon_social, nit_empresa, representante_legal
}
```
**Resultado esperado:** ❌ Debe rechazar con error indicando campos faltantes

---

## 🔍 VERIFICACIÓN

Para verificar si este servicio tiene el problema:

1. Crear solicitud de Cesión con `tipo_solicitante: "Natural"`
2. NO incluir campos de jurídica del cedente (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`)
3. SÍ incluir todos los campos del cesionario
4. Si el backend rechaza con error de campos faltantes → **PROBLEMA CONFIRMADO**

---

## 🔄 PASOS PARA IMPLEMENTAR

1. **Identificar el archivo de controlador** que maneja "Cesión de Marca"
2. **Localizar la validación de campos requeridos** para este servicio
3. **Reemplazar la validación fija** con validación condicional basada en `tipo_solicitante`
4. **Probar con casos de prueba** (Natural y Jurídica)
5. **Verificar que los mensajes de error sean claros**

---

## ✅ RESULTADO ESPERADO

Después de aplicar esta corrección:

- ✅ Los formularios de "Natural" funcionarán correctamente (no requieren campos de jurídica del cedente)
- ✅ Los formularios de "Jurídica" seguirán requiriendo todos los campos
- ✅ Los campos del cesionario siempre serán requeridos (independiente del tipo de cedente)
- ✅ Los mensajes de error serán claros y específicos

---

**Prioridad:** 🔴 **CRÍTICA** (si el problema existe)  
**Tiempo estimado:** 15-30 minutos  
**Impacto:** Resuelve el error en Cesión de Marca para tipo "Natural" (si existe)  
**Relacionado con:** `PROMPT_BACKEND_RENOVACION_VALIDACION_CONDICIONAL.md` y `PROMPT_BACKEND_OPOSICION_VALIDACION_CONDICIONAL.md`

---

## ⚠️ NOTA

Este documento se creó como **prevención** basado en el patrón observado en Renovación y Oposición. Si al probar Cesión de Marca NO aparece el error, entonces este servicio ya tiene la validación condicional correcta y no se necesita modificar.

