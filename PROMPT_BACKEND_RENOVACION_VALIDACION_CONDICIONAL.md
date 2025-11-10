# 🔧 PROMPT PARA BACKEND: Corrección de Validación Condicional en Renovación de Marca

## 🚨 PROBLEMA CRÍTICO

El backend está requiriendo campos de "Jurídica" (`tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`) incluso cuando el `tipo_solicitante` es "Natural" en el servicio de **Renovación de Marca**.

### Error Actual:
```json
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": ["tipo_entidad", "razon_social", "nit_empresa", "representante_legal"],
  "camposRequeridos": [
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
    "tipo_entidad",        // ❌ NO debería ser requerido para "Natural"
    "razon_social",        // ❌ NO debería ser requerido para "Natural"
    "nit_empresa",         // ❌ NO debería ser requerido para "Natural"
    "representante_legal", // ❌ NO debería ser requerido para "Natural"
    "certificado_renovacion",
    "logotipo"
  ]
}
```

### Payload Enviado por el Frontend:
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Lucia Maturana",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "45678956",
  "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
  "telefono": "3001234567",
  "correo": "lucia@gmail.com",
  "pais": "Colombia",
  "nombre_marca": "Golink",
  "numero_expediente_marca": "456789",
  "certificado_renovacion": "data:image/jpeg;base64,...",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:image/jpeg;base64,...",
  "ciudad": "Bogotá",
  "clase_niza": "20",
  "tipo_entidad": "",           // ⚠️ Enviado como vacío para "Natural"
  "razon_social": "",           // ⚠️ Enviado como vacío para "Natural"
  "nit_empresa": "",            // ⚠️ Enviado como vacío para "Natural"
  "representante_legal": ""     // ⚠️ Enviado como vacío para "Natural"
}
```

---

## ✅ SOLUCIÓN REQUERIDA

### Validación Condicional Basada en `tipo_solicitante`

El backend debe validar los campos de manera condicional:

- **Si `tipo_solicitante === "Natural"`**: 
  - ✅ NO requerir: `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`
  - ✅ Requerir solo: `tipo_solicitante`, `nombres_apellidos`, `tipo_documento`, `numero_documento`, `direccion`, `telefono`, `correo`, `pais`, `nombre_marca`, `numero_expediente_marca`, `poder_autorizacion`, `certificado_renovacion`, `logotipo`

- **Si `tipo_solicitante === "Jurídica"`**: 
  - ✅ Requerir TODOS los campos, incluyendo: `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`

---

## 📋 CÓDIGO DE CORRECCIÓN

### Archivo: `src/controllers/solicitudes.controller.js`

**Ubicación:** En el método que valida los campos requeridos para "Renovación de marca" (buscar por `servicioEncontrado.nombre === "Renovación de Marca"` o similar)

### Código Actual (❌ INCORRECTO):
```javascript
// ❌ PROBLEMA: Validación que requiere campos de jurídica para TODOS
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

// Validar todos los campos
const camposFaltantes = camposRequeridos.filter(campo => {
  const valor = req.body[campo];
  return !valor || (typeof valor === 'string' && valor.trim() === '');
});

if (camposFaltantes.length > 0) {
  return res.status(400).json({
    mensaje: "Campos requeridos faltantes",
    camposFaltantes: camposFaltantes,
    camposRequeridos: camposRequeridos
  });
}
```

### Código Corregido (✅ CORRECTO):
```javascript
// ✅ SOLUCIÓN: Validación condicional basada en tipo_solicitante

// 1. Validar que tipo_solicitante sea válido
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
  "poder_autorizacion",
  "certificado_renovacion",
  "logotipo"
];

// 3. Validar campos base
const camposFaltantes = camposRequeridosBase.filter(campo => {
  const valor = req.body[campo];
  
  // Para archivos Base64, verificar que no esté vacío y que sea Base64 válido
  if (campo === "logotipo" || campo === "poder_autorizacion" || campo === "certificado_renovacion") {
    return !valor || (typeof valor === 'string' && !valor.startsWith('data:'));
  }
  
  // Para otros campos, verificar que no esté vacío
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
      // Para nit_empresa, debe ser un número válido entre 1000000000 y 9999999999
      const nit = Number(valor);
      return !valor || isNaN(nit) || nit < 1000000000 || nit > 9999999999;
    }
    
    // Para otros campos, verificar que no esté vacío
    return !valor || (typeof valor === 'string' && valor.trim() === '');
  });
  
  camposFaltantes.push(...camposFaltantesJuridica);
}

// 5. Si hay campos faltantes, retornar error
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

// ✅ Si llegamos aquí, todos los campos requeridos están presentes
// Continuar con el procesamiento de la solicitud...
```

---

## 🔍 VERIFICACIÓN ADICIONAL

### Validación de NIT para Jurídica:
```javascript
// Si es Jurídica, validar que el NIT sea válido
if (tipoSolicitante === "Jurídica") {
  const nitEmpresa = Number(req.body.nit_empresa);
  
  if (isNaN(nitEmpresa) || nitEmpresa < 1000000000 || nitEmpresa > 9999999999) {
    return res.status(400).json({
      mensaje: "nit_empresa debe ser un número válido entre 1000000000 y 9999999999",
      valor_recibido: req.body.nit_empresa
    });
  }
}
```

### Validación de Archivos Base64:
```javascript
// Validar que los archivos Base64 sean válidos
const archivosBase64 = ["logotipo", "poder_autorizacion", "certificado_renovacion"];

for (const campo of archivosBase64) {
  const valor = req.body[campo];
  
  if (!valor || typeof valor !== 'string' || !valor.startsWith('data:')) {
    return res.status(400).json({
      mensaje: `El campo ${campo} debe ser un archivo Base64 válido`,
      campo: campo
    });
  }
}
```

---

## 📊 RESUMEN DE CAMBIOS

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
- ✅ `nombre_marca`
- ✅ `numero_expediente_marca`
- ✅ `poder_autorizacion`
- ✅ `certificado_renovacion`
- ✅ `logotipo`
- ❌ `tipo_entidad` (NO requerido)
- ❌ `razon_social` (NO requerido)
- ❌ `nit_empresa` (NO requerido)
- ❌ `representante_legal` (NO requerido)

#### Para "Jurídica":
- ✅ Todos los campos de "Natural" +
- ✅ `tipo_entidad`
- ✅ `razon_social`
- ✅ `nit_empresa` (debe ser número válido entre 1000000000 y 9999999999)
- ✅ `representante_legal`

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
  "poder_autorizacion": "data:image/jpeg;base64,...",
  "certificado_renovacion": "data:image/jpeg;base64,...",
  "logotipo": "data:image/jpeg;base64,..."
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
  "nombre_marca": "Mi Marca",
  "numero_expediente_marca": "12345",
  "poder_autorizacion": "data:image/jpeg;base64,...",
  "certificado_renovacion": "data:image/jpeg;base64,...",
  "logotipo": "data:image/jpeg;base64,...",
  "tipo_entidad": "S.A.S",
  "razon_social": "Mi Empresa S.A.S",
  "nit_empresa": 9001234567,
  "representante_legal": "Juan Pérez"
}
```
**Resultado esperado:** ✅ Debe aceptar (con todos los campos)

### Caso 3: Jurídica sin campos de empresa
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Juan Pérez",
  // ... otros campos base ...
  // ❌ Faltan: tipo_entidad, razon_social, nit_empresa, representante_legal
}
```
**Resultado esperado:** ❌ Debe rechazar con error indicando campos faltantes

### Caso 4: Natural con campos de empresa (debe ignorarlos)
```json
{
  "tipo_solicitante": "Natural",
  // ... todos los campos base ...
  "tipo_entidad": "S.A.S",  // ⚠️ Presente pero NO requerido
  "razon_social": "Mi Empresa",  // ⚠️ Presente pero NO requerido
  "nit_empresa": 9001234567,  // ⚠️ Presente pero NO requerido
  "representante_legal": "Juan Pérez"  // ⚠️ Presente pero NO requerido
}
```
**Resultado esperado:** ✅ Debe aceptar (los campos de jurídica se ignoran para Natural)

---

## ⚠️ IMPORTANTE

1. **No remover campos del objeto**: Si el frontend envía campos de jurídica para "Natural", el backend puede ignorarlos, pero NO debe rechazarlos.

2. **Validación condicional**: La validación debe ser **condicional** basada en `tipo_solicitante`, no una lista fija de campos.

3. **Mensajes de error claros**: Los mensajes de error deben indicar claramente qué campos faltan y para qué tipo de solicitante.

4. **Consistencia**: Esta misma lógica debe aplicarse a otros servicios que tengan `tipo_solicitante` (Certificación, Cesión, Oposición, etc.).

---

## 🔄 PASOS PARA IMPLEMENTAR

1. **Identificar el archivo de controlador** que maneja "Renovación de Marca"
2. **Localizar la validación de campos requeridos** para este servicio
3. **Reemplazar la validación fija** con validación condicional basada en `tipo_solicitante`
4. **Probar con casos de prueba** (Natural y Jurídica)
5. **Verificar que los mensajes de error sean claros**

---

## 📝 NOTAS ADICIONALES

- Este mismo problema puede existir en otros servicios (Cesión, Oposición, etc.)
- La validación condicional debe aplicarse a todos los servicios que tienen `tipo_solicitante`
- El frontend ya maneja correctamente la lógica condicional, el problema está solo en el backend

---

## ✅ RESULTADO ESPERADO

Después de aplicar esta corrección:

- ✅ Los formularios de "Natural" funcionarán correctamente
- ✅ Los formularios de "Jurídica" seguirán requiriendo todos los campos
- ✅ Los mensajes de error serán claros y específicos
- ✅ No habrá más errores de "Campos requeridos faltantes" para "Natural"

---

**Prioridad:** 🔴 **CRÍTICA**  
**Tiempo estimado:** 15-30 minutos  
**Impacto:** Resuelve el error en Renovación de Marca para tipo "Natural"

