# 🚨 CORRECCIÓN URGENTE: Validación Condicional en Presentación de Oposición

## PROBLEMA

El backend está rechazando solicitudes de "Presentación de Oposición" con `tipo_solicitante: "Natural"` porque requiere campos que solo aplican para "Jurídica" (`tipo_entidad`, `razon_social`, `representante_legal`).

**Error actual:**
```json
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": ["tipo_entidad", "razon_social", "representante_legal"],
  "camposRequeridos": [
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
    "tipo_entidad",        // ❌ NO debería ser requerido para "Natural"
    "razon_social",        // ❌ NO debería ser requerido para "Natural"
    "representante_legal", // ❌ NO debería ser requerido para "Natural"
    "argumentos_respuesta",
    "documentos_oposicion"
  ]
}
```

### Payload Enviado por el Frontend:
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Pablo Machado",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "45678956",
  "direccion": "CL 56 # 92 - 108 TORRE 39",
  "telefono": "3127968093",
  "correo": "camiloep08181@gmail.com",
  "pais": "Colombia",
  "nit_empresa": 4356789076,  // ✅ SIEMPRE requerido (incluso para Natural)
  "nombre_marca": "Nine",
  "marca_a_oponerse": "Ninek",
  "argumentos_respuesta": "Me robo el eslogan y nombre parecido",
  "documentos_oposicion": "data:application/pdf;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "ciudad": "Bogotá"
  // ❌ NO se envían: tipo_entidad, razon_social, representante_legal (solo para Jurídica)
}
```

---

## ✅ SOLUCIÓN

Implementar validación condicional en el controlador de "Presentación de Oposición":

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
  "nit_empresa",          // ✅ SIEMPRE requerido
  "nombre_marca",
  "marca_a_oponerse",
  "poder_autorizacion",
  "argumentos_respuesta",
  "documentos_oposicion",
  "tipo_entidad",        // ❌ Requerido incluso para Natural
  "razon_social",        // ❌ Requerido incluso para Natural
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
  "nit_empresa",          // ✅ SIEMPRE requerido (incluso para Natural)
  "nombre_marca",
  "marca_a_oponerse",
  "poder_autorizacion",
  "argumentos_respuesta",
  "documentos_oposicion"
];

// 3. Validar campos base
const camposFaltantes = camposRequeridosBase.filter(campo => {
  const valor = req.body[campo];
  
  // Para archivos Base64
  if (campo === "poder_autorizacion" || campo === "documentos_oposicion") {
    return !valor || (typeof valor === 'string' && !valor.startsWith('data:'));
  }
  
  // Para nit_empresa, debe ser un número válido entre 1000000000 y 9999999999
  if (campo === "nit_empresa") {
    const nit = Number(valor);
    return !valor || isNaN(nit) || nit < 1000000000 || nit > 9999999999;
  }
  
  // Para otros campos
  return !valor || (typeof valor === 'string' && valor.trim() === '');
});

// 4. Si es Jurídica, validar campos adicionales
if (tipoSolicitante === "Jurídica") {
  const camposJuridica = [
    "tipo_entidad",
    "razon_social",
    "representante_legal"
  ];
  
  const camposFaltantesJuridica = camposJuridica.filter(campo => {
    const valor = req.body[campo];
    return !valor || (typeof valor === 'string' && valor.trim() === '');
  });
  
  camposFaltantes.push(...camposFaltantesJuridica);
}

// 5. Retornar error si hay campos faltantes
if (camposFaltantes.length > 0) {
  const camposRequeridosFinales = tipoSolicitante === "Jurídica" 
    ? [...camposRequeridosBase, "tipo_entidad", "razon_social", "representante_legal"]
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

#### Para "Natural":
- ✅ `tipo_solicitante` = "Natural"
- ✅ `nombres_apellidos`
- ✅ `tipo_documento`
- ✅ `numero_documento`
- ✅ `direccion`
- ✅ `telefono`
- ✅ `correo`
- ✅ `pais`
- ✅ `nit_empresa` (SIEMPRE requerido, incluso para Natural)
- ✅ `nombre_marca`
- ✅ `marca_a_oponerse`
- ✅ `poder_autorizacion`
- ✅ `argumentos_respuesta`
- ✅ `documentos_oposicion`
- ❌ `tipo_entidad` (NO requerido)
- ❌ `razon_social` (NO requerido)
- ❌ `representante_legal` (NO requerido)

#### Para "Jurídica":
- ✅ Todos los campos de "Natural" +
- ✅ `tipo_entidad`
- ✅ `razon_social`
- ✅ `representante_legal`

---

## 📋 DIFERENCIAS CON RENOVACIÓN

**IMPORTANTE:** En Oposición, `nit_empresa` es **SIEMPRE requerido** (incluso para Natural), a diferencia de Renovación donde solo se requiere para Jurídica.

---

## 🧪 CASOS DE PRUEBA

### Caso 1: Natural con todos los campos base (incluyendo nit_empresa)
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
  "nit_empresa": 9001234567,  // ✅ Requerido incluso para Natural
  "nombre_marca": "Mi Marca",
  "marca_a_oponerse": "Marca Opositora",
  "argumentos_respuesta": "Motivos de oposición",
  "documentos_oposicion": "data:application/pdf;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,..."
}
```
**Resultado esperado:** ✅ Debe aceptar (sin campos de jurídica)

### Caso 2: Jurídica con todos los campos
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123",
  "telefono": "3001234567",
  "correo": "juan@example.com",
  "pais": "Colombia",
  "nit_empresa": 9001234567,
  "nombre_marca": "Mi Marca",
  "marca_a_oponerse": "Marca Opositora",
  "argumentos_respuesta": "Motivos de oposición",
  "documentos_oposicion": "data:application/pdf;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "tipo_entidad": "S.A.S",
  "razon_social": "Mi Empresa S.A.S",
  "representante_legal": "Juan Pérez"
}
```
**Resultado esperado:** ✅ Debe aceptar (con todos los campos)

### Caso 3: Jurídica sin campos de empresa
```json
{
  "tipo_solicitante": "Jurídica",
  // ... otros campos base ...
  // ❌ Faltan: tipo_entidad, razon_social, representante_legal
}
```
**Resultado esperado:** ❌ Debe rechazar con error indicando campos faltantes

### Caso 4: Natural sin nit_empresa
```json
{
  "tipo_solicitante": "Natural",
  // ... otros campos base ...
  // ❌ Falta: nit_empresa
}
```
**Resultado esperado:** ❌ Debe rechazar (nit_empresa es SIEMPRE requerido)

---

## 📝 NOTAS IMPORTANTES

1. **`nit_empresa` es SIEMPRE requerido**: A diferencia de otros servicios, en Oposición el `nit_empresa` es requerido incluso para personas naturales.

2. **Validación condicional**: La validación debe ser **condicional** basada en `tipo_solicitante`, no una lista fija de campos.

3. **Mensajes de error claros**: Los mensajes de error deben indicar claramente qué campos faltan y para qué tipo de solicitante.

4. **Consistencia**: Esta misma lógica debe aplicarse a otros servicios que tengan `tipo_solicitante` (Renovación, Cesión, etc.).

---

## 🔄 PASOS PARA IMPLEMENTAR

1. **Identificar el archivo de controlador** que maneja "Presentación de Oposición"
2. **Localizar la validación de campos requeridos** para este servicio
3. **Reemplazar la validación fija** con validación condicional basada en `tipo_solicitante`
4. **Probar con casos de prueba** (Natural y Jurídica)
5. **Verificar que los mensajes de error sean claros**

---

## ✅ RESULTADO ESPERADO

Después de aplicar esta corrección:

- ✅ Los formularios de "Natural" funcionarán correctamente (solo requieren `nit_empresa`, no otros campos de jurídica)
- ✅ Los formularios de "Jurídica" seguirán requiriendo todos los campos
- ✅ Los mensajes de error serán claros y específicos
- ✅ No habrá más errores de "Campos requeridos faltantes" para "Natural"

---

**Prioridad:** 🔴 **CRÍTICA**  
**Tiempo estimado:** 15-30 minutos  
**Impacto:** Resuelve el error en Presentación de Oposición para tipo "Natural"  
**Relacionado con:** `PROMPT_BACKEND_RENOVACION_VALIDACION_CONDICIONAL.md` (mismo problema en Renovación)

