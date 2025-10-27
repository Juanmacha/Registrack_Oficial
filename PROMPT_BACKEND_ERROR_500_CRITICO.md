# 🚨 ERROR 500 CRÍTICO - BACKEND CRASHEANDO

## 📅 **Fecha:** 28 de Septiembre de 2025

## 🔍 **PROBLEMA CONFIRMADO**

**Error 500: "Error interno del servidor"** - El backend está **crashando** cuando recibe peticiones `PUT /api/servicios/:id`.

### **📊 Evidencia del Frontend:**
```
❌ [ServiciosApiService] Error response: Object
🔍 [DEBUG] Error details: {
  "success": false,
  "error": {
    "message": "Error interno del servidor"
  }
}
```

## 🎯 **CAUSA PROBABLE**

El backend tiene un **bug crítico** en el controlador `PUT /api/servicios/:id` que está causando que el servidor falle completamente.

## 🔧 **SOLUCIÓN URGENTE REQUERIDA**

### **📋 Archivo a Revisar:**
`src/controllers/servicio.controller.js` - Función `updateServicio`

### **🚨 Posibles Causas del Error 500:**

1. **Error de sintaxis** en el código JavaScript
2. **Variable no definida** o `undefined`
3. **Error en base de datos** (conexión, query, etc.)
4. **Error en importación** de módulos
5. **Error en validación** de datos
6. **Error en transformación** de datos

### **🔍 CÓDIGO DE DEBUGGING PARA AGREGAR:**

```javascript
const updateServicio = async (req, res) => {
  try {
    console.log('🔧 [Backend] ===== INICIO UPDATE SERVICIO =====');
    console.log('🔧 [Backend] Request params:', req.params);
    console.log('🔧 [Backend] Request body:', req.body);
    console.log('🔧 [Backend] Request headers:', req.headers);
    
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('🔧 [Backend] ID del servicio:', id);
    console.log('🔧 [Backend] Datos de actualización:', updateData);
    
    // Verificar que el ID sea válido
    if (!id || isNaN(id)) {
      console.log('❌ [Backend] ID inválido:', id);
      return res.status(400).json({
        success: false,
        error: { message: "ID de servicio inválido" }
      });
    }
    
    // Verificar que hay datos para actualizar
    if (!updateData || Object.keys(updateData).length === 0) {
      console.log('❌ [Backend] No hay datos para actualizar');
      return res.status(400).json({
        success: false,
        error: { message: "No hay datos para actualizar" }
      });
    }
    
    console.log('🔧 [Backend] Obteniendo servicio de la base de datos...');
    
    // Obtener servicio actual
    const servicioActual = await Servicio.findByPk(id);
    
    if (!servicioActual) {
      console.log('❌ [Backend] Servicio no encontrado:', id);
      return res.status(404).json({
        success: false,
        error: { message: "Servicio no encontrado" }
      });
    }
    
    console.log('✅ [Backend] Servicio encontrado:', {
      id: servicioActual.id,
      nombre: servicioActual.nombre,
      visible_en_landing: servicioActual.visible_en_landing
    });
    
    // Verificar cambios
    let hayCambios = false;
    const cambiosDetectados = [];
    
    console.log('🔧 [Backend] Verificando cambios...');
    
    for (const key of Object.keys(updateData)) {
      const valorActual = servicioActual[key];
      const valorNuevo = updateData[key];
      
      console.log(`🔍 [Backend] Campo ${key}:`);
      console.log(`  - Actual:`, valorActual);
      console.log(`  - Nuevo:`, valorNuevo);
      
      let esDiferente = false;
      
      if (key === 'visible_en_landing') {
        esDiferente = Boolean(valorActual) !== Boolean(valorNuevo);
      } else if (key === 'landing_data' || key === 'info_page_data') {
        const actualJson = JSON.stringify(valorActual || {});
        const nuevoJson = JSON.stringify(valorNuevo || {});
        esDiferente = actualJson !== nuevoJson;
      } else {
        esDiferente = valorActual !== valorNuevo;
      }
      
      if (esDiferente) {
        hayCambios = true;
        cambiosDetectados.push(key);
        console.log(`✅ [Backend] Cambio detectado en ${key}`);
      } else {
        console.log(`ℹ️ [Backend] Sin cambios en ${key}`);
      }
    }
    
    console.log('🔍 [Backend] ¿Hay cambios?', hayCambios);
    console.log('🔍 [Backend] Campos con cambios:', cambiosDetectados);
    
    if (!hayCambios) {
      console.log('⚠️ [Backend] No hay cambios reales');
      return res.status(400).json({
        success: false,
        error: { message: "No hay datos para actualizar" }
      });
    }
    
    console.log('🔧 [Backend] Actualizando servicio en base de datos...');
    
    // Actualizar servicio
    await servicioActual.update(updateData);
    
    console.log('✅ [Backend] Servicio actualizado en base de datos');
    
    // Obtener servicio actualizado
    const servicioActualizado = await Servicio.findByPk(id);
    
    console.log('✅ [Backend] Servicio actualizado obtenido:', {
      id: servicioActualizado.id,
      visible_en_landing: servicioActualizado.visible_en_landing
    });
    
    // Formatear respuesta
    const respuesta = {
      success: true,
      message: "Servicio actualizado exitosamente",
      data: {
        id: servicioActualizado.id.toString(),
        nombre: servicioActualizado.nombre,
        descripcion_corta: servicioActualizado.descripcion_corta,
        visible_en_landing: servicioActualizado.visible_en_landing,
        landing_data: servicioActualizado.landing_data || {},
        info_page_data: servicioActualizado.info_page_data || {},
        route_path: servicioActualizado.route_path || `/pages/${servicioActualizado.nombre.toLowerCase().replace(/\s+/g, '-')}`,
        process_states: []
      }
    };
    
    console.log('✅ [Backend] Respuesta preparada:', respuesta);
    console.log('🔧 [Backend] ===== FIN UPDATE SERVICIO =====');
    
    res.json(respuesta);
    
  } catch (error) {
    console.error('❌ [Backend] ERROR CRÍTICO en updateServicio:', error);
    console.error('❌ [Backend] Stack trace:', error.stack);
    console.error('❌ [Backend] Error name:', error.name);
    console.error('❌ [Backend] Error message:', error.message);
    
    res.status(500).json({
      success: false,
      error: { 
        message: "Error interno del servidor",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};
```

## 🧪 **PRUEBA DE VALIDACIÓN**

### **1. Probar con cURL:**
```bash
curl -X PUT "http://localhost:3000/api/servicios/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"visible_en_landing": false}'
```

### **2. Logs Esperados Después de la Corrección:**
```
🔧 [Backend] ===== INICIO UPDATE SERVICIO =====
🔧 [Backend] Request params: { id: '1' }
🔧 [Backend] Request body: { visible_en_landing: false }
🔧 [Backend] ID del servicio: 1
🔧 [Backend] Datos de actualización: { visible_en_landing: false }
🔧 [Backend] Obteniendo servicio de la base de datos...
✅ [Backend] Servicio encontrado: { id: 1, nombre: 'Búsqueda de Antecedentes', visible_en_landing: true }
🔧 [Backend] Verificando cambios...
🔍 [Backend] Campo visible_en_landing:
  - Actual: true
  - Nuevo: false
✅ [Backend] Cambio detectado en visible_en_landing
🔍 [Backend] ¿Hay cambios? true
🔍 [Backend] Campos con cambios: ['visible_en_landing']
🔧 [Backend] Actualizando servicio en base de datos...
✅ [Backend] Servicio actualizado en base de datos
✅ [Backend] Servicio actualizado obtenido: { id: 1, visible_en_landing: false }
✅ [Backend] Respuesta preparada: { success: true, message: 'Servicio actualizado exitosamente', data: {...} }
🔧 [Backend] ===== FIN UPDATE SERVICIO =====
```

## 🎯 **RESULTADO ESPERADO**

### **✅ Respuesta de Éxito:**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "nombre": "Búsqueda de Antecedentes",
    "visible_en_landing": false,
    "landing_data": {},
    "info_page_data": {},
    "route_path": "/pages/busqueda-de-antecedentes",
    "process_states": []
  }
}
```

## 🚀 **PASOS PARA IMPLEMENTAR**

1. **Abrir** `src/controllers/servicio.controller.js`
2. **Localizar** la función `updateServicio`
3. **Reemplazar** TODA la función con el código de debugging
4. **Verificar** que no haya errores de sintaxis
5. **Probar** con el cURL de ejemplo
6. **Verificar** que los logs muestren el flujo completo
7. **Identificar** dónde está fallando exactamente

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

- [ ] Función `updateServicio` completamente reemplazada
- [ ] Logs de debugging detallados agregados
- [ ] Manejo de errores mejorado
- [ ] Validaciones de entrada agregadas
- [ ] Pruebas con cURL realizadas
- [ ] Logs de éxito verificados
- [ ] Error 500 eliminado
- [ ] Frontend funcionando correctamente

---

**⚠️ URGENTE:** Este error 500 está impidiendo que el frontend funcione. Una vez implementado este código de debugging, podremos identificar exactamente dónde está fallando el backend y corregirlo definitivamente.
