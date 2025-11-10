# 🚨 CORRECCIÓN URGENTE: Validación Condicional en Múltiples Servicios

## PROBLEMA GENERAL

El backend está rechazando solicitudes con `tipo_solicitante: "Natural"` porque requiere campos que solo aplican para "Jurídica" (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`) en **múltiples servicios**.

---

## 📋 SERVICIOS AFECTADOS

### ✅ 1. Renovación de Marca
- **Estado:** ✅ **CORREGIDO** - Backend corregido
- **Campos problemáticos:** `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`
- **Documento:** `PROMPT_BACKEND_RENOVACION_VALIDACION_CONDICIONAL.md`

### ✅ 2. Presentación de Oposición
- **Estado:** ✅ **CORREGIDO** - Backend corregido
- **Campos problemáticos:** `tipo_entidad`, `razon_social`, `representante_legal`
- **Nota:** `nit_empresa` es SIEMPRE requerido (incluso para Natural)
- **Documento:** `PROMPT_BACKEND_OPOSICION_VALIDACION_CONDICIONAL.md`

### ⚠️ 3. Cesión de Marca
- **Estado:** ⚠️ **VERIFICAR** - Probable problema (no confirmado)
- **Campos problemáticos:** Probablemente `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal` (del cedente)
- **Nota:** Campos del cesionario son SIEMPRE requeridos (independiente del tipo de cedente)
- **Documento:** `PROMPT_BACKEND_CESION_VALIDACION_CONDICIONAL.md`

### ✅ 4. Certificación de Marca
- **Estado:** ✅ **FRONTEND CORRECTO** - Verificar backend
- **Nota:** Frontend ya tiene validación condicional correcta

---

## ✅ SERVICIOS QUE NO REQUIEREN CORRECCIÓN

### 5. Respuesta a Oposición
- **Estado:** ✅ **NO TIENE PROBLEMA**
- **Razón:** NO tiene `tipo_solicitante`, siempre requiere campos de empresa
- **Campos siempre requeridos:** `razon_social`, `nit_empresa`, `representante_legal`
- **Conclusión:** Backend está correcto si requiere estos campos siempre

### 6. Ampliación de Alcance
- **Estado:** ✅ **NO TIENE PROBLEMA**
- **Razón:** NO tiene `tipo_solicitante`, NO requiere campos de jurídica
- **Campos requeridos:** Solo `documento_nit_titular` (puede ser cédula o NIT)
- **Conclusión:** Backend está correcto si no requiere campos de jurídica

---

## 🎯 SOLUCIÓN UNIFICADA

Implementar validación condicional en **TODOS** los controladores que manejan servicios con `tipo_solicitante`.

### Código Base para Todos los Servicios:

```javascript
// ✅ Validación condicional base (usar en todos los servicios)

// 1. Validar tipo_solicitante
const tipoSolicitante = req.body.tipo_solicitante;

if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
  return res.status(400).json({
    mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
    valor_recibido: tipoSolicitante
  });
}

// 2. Definir campos base (siempre requeridos)
const camposRequeridosBase = [
  // ... campos específicos del servicio ...
];

// 3. Validar campos base
const camposFaltantes = camposRequeridosBase.filter(campo => {
  const valor = req.body[campo];
  
  // Para archivos Base64
  if (campo.includes('_') && (campo.includes('poder') || campo.includes('certificado') || 
      campo.includes('documento') || campo.includes('logotipo') || campo.includes('soporte'))) {
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
    "nit_empresa",         // ⚠️ NO requerido en todos los servicios
    "representante_legal"
  ];
  
  // ⚠️ ADAPTAR: Algunos servicios NO requieren nit_empresa para Jurídica
  // Ver detalles específicos por servicio abajo
  
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
    ? [...camposRequeridosBase, ...camposJuridica]
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

## 📝 DETALLES POR SERVICIO

### 1. Renovación de Marca

**Campos base requeridos:**
```javascript
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
```

**Campos de Jurídica:**
```javascript
const camposJuridica = [
  "tipo_entidad",
  "razon_social",
  "nit_empresa",         // ✅ Requerido para Jurídica
  "representante_legal"
];
```

**Archivo:** `src/controllers/solicitudes.controller.js`  
**Método:** Buscar validación para "Renovación de Marca" o "Renovación de marca"

---

### 2. Presentación de Oposición

**Campos base requeridos:**
```javascript
const camposRequeridosBase = [
  "tipo_solicitante",
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "nit_empresa",          // ⚠️ SIEMPRE requerido (incluso para Natural)
  "nombre_marca",
  "marca_a_oponerse",
  "poder_autorizacion",
  "argumentos_respuesta",
  "documentos_oposicion"
];
```

**Campos de Jurídica:**
```javascript
const camposJuridica = [
  "tipo_entidad",
  "razon_social",
  "representante_legal"
  // ⚠️ NO incluir nit_empresa aquí (ya está en campos base)
];
```

**Archivo:** `src/controllers/solicitudes.controller.js`  
**Método:** Buscar validación para "Presentación de Oposición" o "Presentación de oposición"

---

### 3. Cesión de Marca

**Campos base requeridos:**
```javascript
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
  // Campos del cesionario
  "nombre_razon_social_cesionario",
  "nit_cesionario",
  "representante_legal_cesionario",
  "tipo_documento_cesionario",
  "numero_documento_cesionario",
  "correo_cesionario",
  "telefono_cesionario",
  "direccion_cesionario"
];
```

**Campos de Jurídica (cedente):**
```javascript
const camposJuridica = [
  "tipo_entidad",
  "razon_social",
  "nit_empresa",         // ⚠️ Verificar si es requerido
  "representante_legal"
];
```

**Archivo:** `src/controllers/solicitudes.controller.js`  
**Método:** Buscar validación para "Cesión de Marca" o "Cesión de marca"

---

## 🔍 VERIFICACIÓN

### Servicios a Verificar:

1. ✅ **Renovación de Marca** - Confirmado problema
2. ✅ **Presentación de Oposición** - Confirmado problema
3. ⚠️ **Cesión de Marca** - Verificar (probable problema)
4. ✅ **Certificación de Marca** - Verificar backend (frontend ya correcto)

### Cómo Verificar:

1. Crear solicitud con `tipo_solicitante: "Natural"`
2. NO incluir campos de jurídica (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`)
3. Si el backend rechaza con error de campos faltantes → **PROBLEMA CONFIRMADO**

---

## 📋 CHECKLIST DE CORRECCIÓN

- [x] **Renovación de Marca**
  - [x] Implementar validación condicional
  - [x] Probar con tipo "Natural"
  - [x] Probar con tipo "Jurídica"
  - [x] Verificar mensajes de error
  - **Estado:** ✅ **COMPLETADO**

- [x] **Presentación de Oposición**
  - [x] Implementar validación condicional
  - [x] Verificar que `nit_empresa` es SIEMPRE requerido
  - [x] Probar con tipo "Natural"
  - [x] Probar con tipo "Jurídica"
  - [x] Verificar mensajes de error
  - **Estado:** ✅ **COMPLETADO**

- [ ] **Cesión de Marca**
  - [ ] Verificar si tiene el problema
  - [ ] Implementar validación condicional si es necesario
  - [ ] Probar con tipo "Natural"
  - [ ] Probar con tipo "Jurídica"
  - [ ] Verificar mensajes de error
  - **Estado:** ⚠️ **PENDIENTE VERIFICACIÓN**

- [ ] **Certificación de Marca**
  - [ ] Verificar backend (frontend ya correcto)
  - [ ] Implementar validación condicional si es necesario
  - [ ] Probar con tipo "Natural"
  - [ ] Probar con tipo "Jurídica"
  - [ ] Verificar mensajes de error
  - **Estado:** ⚠️ **PENDIENTE VERIFICACIÓN**

- [x] **Respuesta a Oposición**
  - [x] Verificar que NO requiere validación condicional
  - [x] Confirmar que siempre requiere campos de empresa
  - **Estado:** ✅ **NO REQUIERE CORRECCIÓN**

- [x] **Ampliación de Alcance**
  - [x] Verificar que NO requiere validación condicional
  - [x] Confirmar que NO requiere campos de jurídica
  - **Estado:** ✅ **NO REQUIERE CORRECCIÓN**

---

## ✅ RESULTADO ESPERADO

Después de aplicar estas correcciones:

- ✅ Todos los formularios de "Natural" funcionarán correctamente
- ✅ Todos los formularios de "Jurídica" seguirán requiriendo todos los campos
- ✅ Los mensajes de error serán claros y específicos
- ✅ No habrá más errores de "Campos requeridos faltantes" para "Natural"

---

## 📚 DOCUMENTOS RELACIONADOS

1. `PROMPT_BACKEND_RENOVACION_VALIDACION_CONDICIONAL.md` - Detalles completos para Renovación
2. `PROMPT_BACKEND_OPOSICION_VALIDACION_CONDICIONAL.md` - Detalles completos para Oposición
3. `PROMPT_COPIAR_PEGAR_BACKEND.md` - Versión corta para Renovación
4. `PROMPT_COPIAR_PEGAR_BACKEND_OPOSICION.md` - Versión corta para Oposición

---

**Prioridad:** 🔴 **CRÍTICA**  
**Tiempo estimado:** 1-2 horas (para todos los servicios)  
**Impacto:** Resuelve errores en múltiples formularios  
**Servicios afectados:** Renovación, Oposición, Cesión (posible), Certificación (verificar)

