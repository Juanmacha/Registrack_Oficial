# 📋 Plan de Organización de Formularios - Correcciones y Estructura

**Fecha:** Enero 2026  
**Objetivo:** Organizar todos los formularios de solicitudes con estructura clara y validación condicional consistente

---

## 📊 Análisis de Formularios

### ✅ **Formulario de Certificación** (ESTADO: CORRECTO)
- ✅ Estructura clara con secciones bien definidas
- ✅ Validación condicional Natural vs Jurídica
- ✅ Manejo correcto de `certificado_camara_comercio` (solo Jurídica)
- ✅ Campos condicionales bien organizados
- ✅ UI organizada y clara

### ⚠️ **Formulario de Renovación** (REQUIERE CORRECCIÓN)
- ⚠️ Estructura confusa con opción "Titular" que luego se divide
- ⚠️ Necesita simplificarse como Certificación (directamente Natural/Jurídica)
- ⚠️ Validación condicional presente pero estructura confusa
- ⚠️ Necesita organización en secciones claras
- ✅ Manejo de campos condicionales correcto en API service

### ⚠️ **Formulario de Oposición** (REQUIERE CORRECCIÓN)
- ⚠️ Estructura confusa con opción "Titular" que luego se divide
- ⚠️ Necesita simplificarse como Certificación
- ⚠️ `nit_empresa` es SIEMPRE requerido (correcto según documentación)
- ⚠️ Necesita organización en secciones claras
- ⚠️ Validación condicional para campos de jurídica presente pero estructura confusa

### ⚠️ **Formulario de Cesión** (REQUIERE CORRECCIÓN)
- ⚠️ Estructura confusa con opción "Titular" que luego se divide
- ⚠️ Necesita simplificarse como Certificación
- ⚠️ Necesita organización en secciones claras
- ✅ Campos del cesionario bien organizados

### ✅ **Formulario de Ampliación** (ESTADO: CORRECTO)
- ✅ No tiene `tipo_solicitante` (solo datos del titular) - correcto
- ✅ Estructura clara
- ✅ Campos bien organizados

### ✅ **Formulario de Respuesta** (ESTADO: CORRECTO)
- ✅ No tiene `tipo_solicitante` (siempre requiere empresa) - correcto
- ✅ Estructura clara
- ✅ Campos bien organizados

---

## 🔧 Correcciones Necesarias

### **1. Formulario de Renovación**

#### **Problemas:**
1. Estructura confusa con opción "Titular" que luego se divide en Natural/Jurídica
2. Campos mezclados sin secciones claras
3. UI no sigue el mismo patrón que Certificación

#### **Correcciones:**
1. ✅ Simplificar: eliminar opción "Titular", usar directamente "Natural" o "Jurídica"
2. ✅ Organizar en secciones claras:
   - Sección 1: Información General (Tipo de Solicitante)
   - Sección 2: Datos del Solicitante/Empresa (condicional)
   - Sección 3: Información de la Marca
   - Sección 4: Documentos Requeridos
3. ✅ Validación condicional: `certificado_camara_comercio` solo para Jurídica (NO existe en Renovación, pero verificar campos similares)
4. ✅ UI consistente con Certificación

### **2. Formulario de Oposición**

#### **Problemas:**
1. Estructura confusa con opción "Titular" que luego se divide
2. Campos mezclados sin secciones claras
3. `nit_empresa` siempre requerido pero no está claro en la UI

#### **Correcciones:**
1. ✅ Simplificar: eliminar opción "Titular", usar directamente "Natural" o "Jurídica"
2. ✅ Organizar en secciones claras:
   - Sección 1: Información General (Tipo de Solicitante)
   - Sección 2: Datos del Solicitante/Empresa (condicional)
   - Sección 3: Información de las Marcas
   - Sección 4: Argumentos de la Oposición
   - Sección 5: Documentos Requeridos
3. ✅ Validación condicional: campos de jurídica solo para Jurídica
4. ✅ `nit_empresa` siempre requerido (marcar claramente)
5. ✅ UI consistente con Certificación

### **3. Formulario de Cesión**

#### **Problemas:**
1. Estructura confusa con opción "Titular" que luego se divide
2. Campos mezclados sin secciones claras
3. Información del cesionario bien organizada pero el cedente no

#### **Correcciones:**
1. ✅ Simplificar: eliminar opción "Titular", usar directamente "Natural" o "Jurídica"
2. ✅ Organizar en secciones claras:
   - Sección 1: Información General (Tipo de Solicitante)
   - Sección 2: Datos del Cedente (quien cede) - condicional
   - Sección 3: Información de la Marca
   - Sección 4: Datos del Cesionario (quien recibe)
   - Sección 5: Documentos Requeridos
3. ✅ Validación condicional: campos de jurídica solo para Jurídica
4. ✅ UI consistente con Certificación

### **4. API Service (solicitudesApiService.js)**

#### **Problemas:**
1. Solo Certificación tiene lógica robusta para remover campos de jurídica para Natural
2. Otros servicios (Renovación, Oposición, Cesión) pueden enviar campos incorrectos

#### **Correcciones:**
1. ✅ Agregar lógica para remover campos de jurídica para Natural en:
   - Renovación de marca
   - Presentación de oposición
   - Cesión de marca
2. ✅ Asegurar que `poder_representante` NO se envía para Natural
3. ✅ Asegurar que campos de empresa NO se envían para Natural

---

## 📝 Estructura de Secciones (Modelo a Seguir)

### **Sección 1: Información General**
```jsx
<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
  <h3 className="text-lg font-bold text-gray-800 mb-4">
    Información General
  </h3>
  {/* Tipo de Solicitante */}
</div>
```

### **Sección 2: Datos del Solicitante/Empresa**
```jsx
{form.tipoSolicitante && (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
    <h3 className="text-lg font-bold text-gray-800 mb-4">
      {esJuridica ? 'Datos de la Empresa' : 'Datos del Solicitante'}
    </h3>
    {/* Campos comunes */}
    {/* Campos condicionales para Jurídica */}
  </div>
)}
```

### **Sección 3: Información Específica del Servicio**
```jsx
{form.tipoSolicitante && (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
    <h3 className="text-lg font-bold text-gray-800 mb-4">
      Información de la Marca / Servicio
    </h3>
    {/* Campos específicos */}
  </div>
)}
```

### **Sección 4: Documentos**
```jsx
{form.tipoSolicitante && (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
    <h3 className="text-lg font-bold text-gray-800 mb-4">
      Documentos Requeridos
    </h3>
    {/* Archivos condicionales */}
  </div>
)}
```

---

## ✅ Checklist de Implementación

### **Renovación:**
- [ ] Simplificar tipo_solicitante (eliminar "Titular")
- [ ] Organizar en secciones claras
- [ ] Validación condicional correcta
- [ ] UI consistente con Certificación
- [ ] Verificar campos condicionales en API service

### **Oposición:**
- [ ] Simplificar tipo_solicitante (eliminar "Titular")
- [ ] Organizar en secciones claras
- [ ] Validación condicional correcta
- [ ] Marcar `nit_empresa` como siempre requerido
- [ ] UI consistente con Certificación
- [ ] Verificar campos condicionales en API service

### **Cesión:**
- [ ] Simplificar tipo_solicitante (eliminar "Titular")
- [ ] Organizar en secciones claras
- [ ] Validación condicional correcta
- [ ] UI consistente con Certificación
- [ ] Verificar campos condicionales en API service

### **API Service:**
- [ ] Agregar lógica para remover campos de jurídica en Renovación
- [ ] Agregar lógica para remover campos de jurídica en Oposición
- [ ] Agregar lógica para remover campos de jurídica en Cesión
- [ ] Verificar que `poder_representante` NO se envía para Natural
- [ ] Verificar que campos de empresa NO se envían para Natural

---

## 🎨 Patrón de UI (Consistente)

### **Colores por Servicio:**
- **Certificación:** `emerald-600` / `teal-600`
- **Renovación:** `purple-600` / `violet-600`
- **Oposición:** `rose-600` / `red-500`
- **Cesión:** `amber-600` / `orange-600`
- **Ampliación:** `indigo-600` / `purple-500`
- **Respuesta:** `cyan-600` / `blue-500`

### **Estructura de Campos:**
- Campos comunes siempre visibles cuando hay `tipoSolicitante`
- Campos condicionales dentro de `{esJuridica && (...)}`
- Secciones con bordes y sombras consistentes
- Labels con asterisco (*) para campos requeridos
- Mensajes de error claros y específicos

---

## 📚 Referencias

- **Formulario de Referencia:** `formularioCertificacion.jsx`
- **API Service:** `solicitudesApiService.js`
- **Documentación Backend:** `DOCUMENTACION_TECNICA_ENDPOINT_CERTIFICACION_MARCA.md`

---

**Última actualización:** Enero 2026  
**Estado:** 🔄 En progreso

