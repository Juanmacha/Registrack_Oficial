# 🐛 BUG BACKEND: Validación Incorrecta en Renovación de Marca

## 🚨 Problema

El backend está requiriendo campos de "Jurídica" (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`) incluso cuando el `tipo_solicitante` es "Natural".

### Error Actual:
```
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": ["tipo_entidad", "razon_social", "nit_empresa", "representante_legal"],
  "camposRequeridos": [
    "tipo_solicitante",
    "nombres_apellidos",
    ...
    "tipo_entidad",        // ❌ NO debería ser requerido para "Natural"
    "razon_social",        // ❌ NO debería ser requerido para "Natural"
    "nit_empresa",         // ❌ NO debería ser requerido para "Natural"
    "representante_legal", // ❌ NO debería ser requerido para "Natural"
    ...
  ]
}
```

## ✅ Solución Correcta

El backend debe validar condicionalmente estos campos:
- **Si `tipo_solicitante === "Natural"`**: NO requerir campos de jurídica
- **Si `tipo_solicitante === "Jurídica"`**: SÍ requerir campos de jurídica

## 🔧 Código de Corrección para Backend

### Archivo: `src/controllers/solicitudes.controller.js`

**Ubicación:** En la validación de campos requeridos para "Renovación de marca"

**ANTES (❌ INCORRECTO):**
```javascript
// Validación que requiere campos de jurídica para TODOS
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
  "poder_autorizacion",
  "certificado_renovacion",
  "logotipo",
  "tipo_entidad",        // ❌ Requerido incluso para Natural
  "razon_social",        // ❌ Requerido incluso para Natural
  "nit_empresa",         // ❌ Requerido incluso para Natural
  "representante_legal"  // ❌ Requerido incluso para Natural
];
```

**DESPUÉS (✅ CORRECTO):**
```javascript
// Validación condicional basada en tipo_solicitante
const tipoSolicitante = req.body.tipo_solicitante;

// Campos siempre requeridos (para Natural y Jurídica)
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
  "poder_autorizacion",
  "certificado_renovacion",
  "logotipo"
];

// Validar campos base
const camposFaltantes = camposRequeridosBase.filter(campo => {
  const valor = req.body[campo];
  return !valor || (typeof valor === 'string' && valor.trim() === '');
});

// Si es Jurídica, agregar validación de campos adicionales
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
      // Para nit_empresa, debe ser un número válido
      return !valor || valor === "" || isNaN(Number(valor));
    }
    return !valor || (typeof valor === 'string' && valor.toString().trim() === '');
  });
  
  camposFaltantes.push(...camposFaltantesJuridica);
}

// Si hay campos faltantes, retornar error
if (camposFaltantes.length > 0) {
  return res.status(400).json({
    mensaje: "Campos requeridos faltantes",
    camposFaltantes: camposFaltantes,
    tipo_solicitante: tipoSolicitante,
    camposRequeridos: tipoSolicitante === "Jurídica" 
      ? [...camposRequeridosBase, "tipo_entidad", "razon_social", "nit_empresa", "representante_legal"]
      : camposRequeridosBase
  });
}
```

## 📋 Validación Completa para Renovación de Marca

```javascript
// Validar que tipo_solicitante sea válido
if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
  return res.status(400).json({
    mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
    valor_recibido: tipoSolicitante
  });
}

// Campos base siempre requeridos
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
  "poder_autorizacion",
  "certificado_renovacion",
  "logotipo"
];

// Validar campos base
const camposFaltantes = camposRequeridosBase.filter(campo => {
  const valor = req.body[campo];
  
  // Para archivos (Base64), verificar que no esté vacío
  if (campo === "logotipo" || campo === "poder_autorizacion" || campo === "certificado_renovacion") {
    return !valor || (typeof valor === 'string' && !valor.startsWith('data:'));
  }
  
  // Para otros campos, verificar que no esté vacío
  return !valor || (typeof valor === 'string' && valor.trim() === '');
});

// Si es Jurídica, validar campos adicionales
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
      // Para nit_empresa, debe ser un número válido entre 1000000000 y 9999999999
      const nit = Number(valor);
      return !valor || isNaN(nit) || nit < 1000000000 || nit > 9999999999;
    }
    
    // Para otros campos, verificar que no esté vacío
    return !valor || (typeof valor === 'string' && valor.trim() === '');
  });
  
  camposFaltantes.push(...camposFaltantesJuridica);
}

// Si hay campos faltantes, retornar error
if (camposFaltantes.length > 0) {
  return res.status(400).json({
    mensaje: "Campos requeridos faltantes",
    camposFaltantes: camposFaltantes,
    tipo_solicitante: tipoSolicitante,
    camposRequeridos: tipoSolicitante === "Jurídica" 
      ? [...camposRequeridosBase, "tipo_entidad", "razon_social", "nit_empresa", "representante_legal"]
      : camposRequeridosBase
  });
}
```

## 🔍 Campos Requeridos por Tipo

### Para "Natural":
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
- ✅ `poder_autorizacion`
- ✅ `certificado_renovacion`
- ✅ `logotipo`
- ❌ `tipo_entidad` (NO requerido)
- ❌ `razon_social` (NO requerido)
- ❌ `nit_empresa` (NO requerido)
- ❌ `representante_legal` (NO requerido)

### Para "Jurídica":
- ✅ `tipo_solicitante` = "Jurídica"
- ✅ Todos los campos de "Natural" +
- ✅ `tipo_entidad`
- ✅ `razon_social`
- ✅ `nit_empresa`
- ✅ `representante_legal`

## ⚠️ Workaround Temporal en Frontend

El frontend actualmente envía estos campos como strings vacíos para "Natural" como workaround temporal:

```javascript
// Workaround temporal
if (tipoSolicitante === "Natural") {
  datosAPI.tipo_entidad = '';
  datosAPI.razon_social = '';
  datosAPI.nit_empresa = null;
  datosAPI.representante_legal = '';
}
```

**Este workaround NO es la solución correcta.** El backend debe corregir su validación para que estos campos no sean requeridos para "Natural".

## ✅ Solución Final

1. **Backend**: Corregir la validación condicional en el controlador de Renovación de marca
2. **Frontend**: Remover el workaround una vez que el backend esté corregido

## 📝 Notas

- Este mismo problema puede existir en otros servicios (Cesión, Oposición, etc.)
- La validación condicional debe aplicarse a todos los servicios que tienen `tipo_solicitante`
- El frontend ya maneja correctamente la lógica condicional, el problema está en el backend

---

**Prioridad:** 🔴 **ALTA**  
**Estado:** ⚠️ **Workaround temporal aplicado en frontend**  
**Solución:** 🔧 **Corrección requerida en backend**

