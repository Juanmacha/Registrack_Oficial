# 🚨 CORRECCIÓN URGENTE: Validación Condicional en Renovación de Marca

## PROBLEMA

El backend está rechazando solicitudes de "Renovación de Marca" con `tipo_solicitante: "Natural"` porque requiere campos que solo aplican para "Jurídica" (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`).

**Error actual:**
```
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": ["tipo_entidad", "razon_social", "nit_empresa", "representante_legal"]
}
```

## SOLUCIÓN

Implementar validación condicional en el controlador de "Renovación de Marca":

### Código a Reemplazar:

```javascript
// ❌ ANTES: Validación fija (INCORRECTO)
const camposRequeridos = [
  "tipo_solicitante",
  "nombres_apellidos",
  // ... otros campos ...
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

// 2. Campos base siempre requeridos
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

// 3. Validar campos base
const camposFaltantes = camposRequeridosBase.filter(campo => {
  const valor = req.body[campo];
  
  // Para archivos Base64
  if (campo === "logotipo" || campo === "poder_autorizacion" || campo === "certificado_renovacion") {
    return !valor || (typeof valor === 'string' && !valor.startsWith('data:'));
  }
  
  // Para otros campos
  return !valor || (typeof valor === 'string' && valor.trim() === '');
});

// 4. Si es Jurídica, validar campos adicionales
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

## RESUMEN

- **Para "Natural"**: NO requerir `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`
- **Para "Jurídica"**: SÍ requerir todos los campos, incluyendo los de empresa

## ARCHIVO A MODIFICAR

`src/controllers/solicitudes.controller.js` - Método que valida campos para "Renovación de Marca"

## PRIORIDAD

🔴 **CRÍTICA** - El formulario no funciona para tipo "Natural"

---

Ver documento completo: `PROMPT_BACKEND_RENOVACION_VALIDACION_CONDICIONAL.md`

