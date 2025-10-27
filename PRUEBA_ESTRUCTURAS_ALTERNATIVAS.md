# 🔧 PRUEBA DE ESTRUCTURAS ALTERNATIVAS

## 🎯 **OBJETIVO**
Probar diferentes estructuras de datos para identificar cuál es la que el backend espera para **página de información** y **gestión de proceso de estado**.

## 🚀 **CAMBIOS IMPLEMENTADOS**

### **✅ Mejoras en el Servicio API:**

1. **🔍 Logs de error mejorados** - Ahora captura el mensaje específico del backend
2. **🔄 Estructuras alternativas** - Prueba automáticamente diferentes formatos
3. **📊 Fallback inteligente** - Si falla una estructura, prueba con otra

### **🧪 Estructuras que se Probarán:**

#### **Para Página de Información:**
1. **Estructura completa** (actual):
   ```json
   {
     "landing_data": {...},
     "info_page_data": {...},
     "visible_en_landing": true
   }
   ```

2. **Estructura alternativa** (nueva):
   ```json
   {
     "info_page_data": {...}
   }
   ```

#### **Para Gestión de Proceso de Estado:**
1. **Estructura completa** (actual):
   ```json
   {
     "landing_data": {...},
     "info_page_data": {...},
     "visible_en_landing": true,
     "process_states": [...]
   }
   ```

2. **Estructura alternativa 1** (nueva):
   ```json
   {
     "process_states": [...]
   }
   ```

3. **Estructura alternativa 2** (nueva):
   ```json
   {
     "procesos": [...]
   }
   ```

## 📋 **INSTRUCCIONES DE PRUEBA**

### **1. 🚀 Iniciar la Aplicación**
```bash
cd Registrack_Frontend1
npm run dev
```

### **2. 🔍 Probar Página de Información**

1. Ir a la página de servicios
2. Hacer clic en "Editar" en cualquier servicio
3. Seleccionar "Editar Datos de Página de Información"
4. Modificar la descripción
5. Hacer clic en "Guardar"
6. **Observar los logs** en la consola del navegador

### **3. 🔍 Probar Gestión de Proceso de Estado**

1. Hacer clic en "Editar" en cualquier servicio
2. Seleccionar "Gestionar Estados del Proceso"
3. Agregar un nuevo estado o modificar uno existente
4. Hacer clic en "Guardar"
5. **Observar los logs** en la consola del navegador

## 📊 **LOGS A OBSERVAR**

### **✅ Si funciona con estructura completa:**
```javascript
✅ [ServiciosApiService] Info page data actualizada: {...}
```

### **🔄 Si falla y prueba alternativa:**
```javascript
❌ [ServiciosApiService] Error actualizando info page data...
🔄 [ServiciosApiService] Probando con estructura alternativa...
🔍 [DEBUG] Probando estructura alternativa: {...}
✅ [ServiciosApiService] Info page data actualizada con estructura alternativa: {...}
```

### **❌ Si fallan todas las estructuras:**
```javascript
❌ [ServiciosApiService] Error actualizando info page data...
🔄 [ServiciosApiService] Probando con estructura alternativa...
❌ [ServiciosApiService] También falló con estructura alternativa: {...}
```

## 🎯 **RESULTADOS ESPERADOS**

### **Escenario 1: ✅ Funciona con estructura completa**
- **Resultado**: Los logs muestran éxito en el primer intento
- **Acción**: No se necesita cambio adicional

### **Escenario 2: ✅ Funciona con estructura alternativa**
- **Resultado**: Los logs muestran éxito en el segundo intento
- **Acción**: Actualizar el código para usar la estructura que funciona

### **Escenario 3: ❌ Fallan todas las estructuras**
- **Resultado**: Los logs muestran fallo en todos los intentos
- **Acción**: Revisar el backend para ver qué estructura espera

## 🔍 **INFORMACIÓN ADICIONAL**

### **Mensajes de Error Mejorados:**
Ahora los logs mostrarán el mensaje específico del backend:
```javascript
🔍 [DEBUG] Error details: {
  "success": false,
  "error": {
    "message": "Mensaje específico del backend",
    "code": "CÓDIGO_DE_ERROR",
    "details": {...}
  }
}
```

### **Fallback Automático:**
Si la estructura principal falla, automáticamente probará con estructuras alternativas sin que el usuario tenga que hacer nada.

## 📝 **REPORTE DE RESULTADOS**

Después de probar, reportar:

1. **¿Cuál estructura funcionó?**
2. **¿Qué mensaje de error específico devuelve el backend?**
3. **¿Funcionan ambas funcionalidades ahora?**

## 🎯 **OBJETIVO FINAL**

Identificar la estructura exacta que el backend espera para poder hacer que **página de información** y **gestión de proceso de estado** funcionen correctamente.
