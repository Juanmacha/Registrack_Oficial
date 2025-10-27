# 🔍 INSTRUCCIONES PARA DEBUGGEAR EDICIÓN DE SERVICIOS

## 📋 PASOS PARA IDENTIFICAR EL PROBLEMA

### **1. 🚀 Iniciar la Aplicación**
```bash
cd Registrack_Frontend1
npm run dev
```

### **2. 🔍 Probar Cada Tipo de Edición**

#### **✅ PASO 1: Probar "Gestionar datos de landing" (DEBE FUNCIONAR)**
1. Ir a la página de servicios
2. Hacer clic en "Editar" en cualquier servicio
3. Seleccionar "Editar Datos para Landing Page"
4. Modificar algún campo (título, resumen, imagen)
5. Hacer clic en "Guardar"
6. **Verificar**: Debe funcionar correctamente

#### **❌ PASO 2: Probar "Página de información" (PROBLEMA)**
1. Hacer clic en "Editar" en cualquier servicio
2. Seleccionar "Editar Datos de Página de Información"
3. Modificar la descripción
4. Hacer clic en "Guardar"
5. **Observar**: Los logs en la consola del navegador

#### **❌ PASO 3: Probar "Gestión de proceso de estado" (PROBLEMA)**
1. Hacer clic en "Editar" en cualquier servicio
2. Seleccionar "Gestionar Estados del Proceso"
3. Agregar un nuevo estado o modificar uno existente
4. Hacer clic en "Guardar"
5. **Observar**: Los logs en la consola del navegador

### **3. 📊 Logs a Observar**

#### **En la Consola del Navegador:**
```javascript
// Logs del componente principal
🔧 [Servicios] Actualizando servicio X via API (tipo: info)...
🔍 [DEBUG] Tipo de edición: info
🔍 [DEBUG] Datos recibidos: {descripcion: "..."}
🔍 [DEBUG] Estructura de datos: {...}
🔍 [DEBUG] Servicio a editar: {...}

// Logs del servicio API
🔧 [ServiciosApiService] Actualizando info page data del servicio X...
🔍 [DEBUG] InfoPageData recibido: {...}
🔍 [DEBUG] Estructura de datos: {...}
🔍 [DEBUG] Servicio actual obtenido: {...}
🔍 [DEBUG] Datos de actualización preparados: {...}
🔍 [DEBUG] Estructura completa de datos: {...}

// Logs de la petición HTTP
🌐 [ServiciosApiService] URL: https://api-registrack-2.onrender.com/api/servicios/X
🔧 [ServiciosApiService] Config: {...}
📡 [ServiciosApiService] Response status: XXX
```

### **4. 🚨 Errores a Identificar**

#### **Si hay Error 500:**
```javascript
❌ [ServiciosApiService] Error response: {
  success: false, 
  error: {
    message: "...",
    code: "...",
    timestamp: "..."
  }
}
```

#### **Si hay Error 400:**
```javascript
❌ [ServiciosApiService] Error response: {
  message: "Error de validación",
  details: [...]
}
```

### **5. 📋 Información a Recopilar**

Para cada tipo de edición que falle, necesitamos:

#### **A. Datos que se envían:**
- ¿Qué estructura tienen los datos?
- ¿Están en el formato correcto?

#### **B. Respuesta del backend:**
- ¿Qué status code devuelve?
- ¿Cuál es el mensaje de error exacto?

#### **C. Comparación con landing:**
- ¿Qué diferencias hay entre los datos de landing y los otros tipos?

### **6. 🔧 Pasos de Debugging**

#### **Si falla "Página de información":**
1. Verificar la estructura de `info_page_data`
2. Comparar con la estructura de `landing_data` (que funciona)
3. Verificar que el backend espere la misma estructura

#### **Si falla "Gestión de proceso de estado":**
1. Verificar la estructura de `process_states`
2. Verificar que cada estado tenga los campos correctos
3. Verificar que el backend espere un array de estados

### **7. 📝 Reporte de Resultados**

Después de probar, reportar:

#### **✅ Lo que funciona:**
- Landing data: ✅/❌
- Info page data: ✅/❌  
- Process states: ✅/❌

#### **❌ Errores encontrados:**
- Status code: XXX
- Mensaje de error: "..."
- Datos enviados: {...}
- Estructura esperada vs enviada: ...

### **8. 🎯 Objetivo**

Identificar exactamente:
1. **¿Qué datos se están enviando?**
2. **¿Qué respuesta devuelve el backend?**
3. **¿Cuál es la diferencia con landing que sí funciona?**
4. **¿Qué estructura espera el backend?**

## 🔍 **¡IMPORTANTE!**

**Abre la consola del navegador (F12) antes de hacer las pruebas para ver todos los logs detallados que agregamos.**
