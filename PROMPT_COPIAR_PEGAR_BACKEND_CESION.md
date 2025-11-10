# 🚨 CORRECCIÓN: Validación Condicional en Cesión de Marca

## PROBLEMA

El backend probablemente está rechazando solicitudes de "Cesión de Marca" con `tipo_solicitante: "Natural"` porque requiere campos que solo aplican para "Jurídica" (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal` del cedente).

## SOLUCIÓN

Implementar validación condicional en el controlador de "Cesión de Marca":

### Código Correcto:

```javascript
// ✅ Validación condicional (CORRECTO)

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
  // Campos del cesionario (SIEMPRE requeridos)
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

## RESUMEN

- **Para "Natural" (Cedente)**: NO requerir `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal` del cedente
- **Para "Jurídica" (Cedente)**: SÍ requerir todos los campos, incluyendo los de empresa del cedente
- **Campos del Cesionario**: SIEMPRE requeridos (independiente del tipo de cedente)

## ⚠️ IMPORTANTE

Los campos del cesionario (`nombre_razon_social_cesionario`, `nit_cesionario`, etc.) son **SIEMPRE requeridos**, independientemente del tipo de cedente. Solo los campos de jurídica del cedente son condicionales.

## ARCHIVO A MODIFICAR

`src/controllers/solicitudes.controller.js` - Método que valida campos para "Cesión de Marca"

## PRIORIDAD

🔴 **VERIFICAR PRIMERO** - Si el problema existe, aplicar corrección

---

Ver documento completo: `PROMPT_BACKEND_CESION_VALIDACION_CONDICIONAL.md`

