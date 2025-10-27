# ERROR ESPECÍFICO EN BACKEND - EDITAR SERVICIOS

## 🔴 PROBLEMA IDENTIFICADO

El endpoint `PUT /api/servicios/:id` está devolviendo un **error 500** específicamente cuando se intenta **editar** un servicio (actualizar `landing_data`, `info_page_data`, o `process_states`).

### 📊 EVIDENCIA DETALLADA:

**✅ Lo que SÍ funciona:**
- GET `/api/servicios/:id` - Status 200 ✅
- Toggle de visibilidad - Funciona correctamente ✅
- Los datos se envían correctamente desde el frontend ✅

**❌ Lo que NO funciona:**
- PUT `/api/servicios/:id` para editar - Status 500 ❌

### 📋 DATOS QUE SE ENVÍAN CORRECTAMENTE:

```json
{
  "landing_data": {
    "imagen": "nueva_imagen.jpg",
    "titulo": "Búsqueda de Antecedentes - Actualizado",
    "resumen": "Verificamos la disponibilidad de tu marca comercial en la base de datos de la SIC"
  },
  "info_page_data": {
    "descripcion": "Este servicio permite verificar si una marca comercial ya está registrada o en proceso de registro. Información actualizada."
  },
  "visible_en_landing": false
}
```

### 🚨 ERROR ESPECÍFICO DEL BACKEND:

```json
{
  "success": false,
  "error": {
    "message": "Error interno del servidor al actualizar servicio",
    "code": "INTERNAL_ERROR",
    "timestamp": "2025-09-28T16:59:28.002Z"
  }
}
```

## 🛠️ POSIBLES CAUSAS EN EL BACKEND:

### 1. **Validación de Campos JSON**
El backend podría estar fallando al validar los campos `landing_data` e `info_page_data` como objetos JSON.

### 2. **Problema en la Base de Datos**
- Campo JSON no configurado correctamente
- Validación de esquema fallando
- Error en la consulta de actualización

### 3. **Problema en el Controlador**
- Error al procesar objetos anidados
- Validación de tipos fallando
- Error en la transformación de datos

## 🔧 SOLUCIÓN RECOMENDADA:

### 1. **Verificar el Modelo de Base de Datos**

Asegúrate de que los campos JSON estén configurados correctamente:

```javascript
// Para Sequelize
landing_data: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: {}
},
info_page_data: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: {}
}
```

### 2. **Verificar el Controlador**

Agrega logs detallados en el controlador:

```javascript
app.put('/api/servicios/:id', async (req, res) => {
  try {
    console.log('🔧 [Backend] Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('🔧 [Backend] ID del servicio:', req.params.id);
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Validar que el servicio existe
    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    
    console.log('🔧 [Backend] Servicio encontrado:', servicio.toJSON());
    
    // Intentar actualizar
    console.log('🔧 [Backend] Intentando actualizar...');
    await servicio.update(updateData);
    
    console.log('✅ [Backend] Actualización exitosa');
    res.json(servicio);
  } catch (error) {
    console.error('❌ [Backend] Error específico:', error);
    console.error('❌ [Backend] Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Error interno del servidor al actualizar servicio',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});
```

### 3. **Verificar Validaciones**

Si tienes validaciones en el modelo, asegúrate de que no estén causando problemas:

```javascript
// Ejemplo de validación que podría fallar
Servicio.addHook('beforeUpdate', (instance, options) => {
  console.log('🔧 [Backend] Hook beforeUpdate ejecutado');
  console.log('🔧 [Backend] Datos a actualizar:', instance.toJSON());
});
```

## 🧪 TESTING DIRECTO:

### Prueba con cURL:

```bash
curl -X PUT "https://api-registrack-2.onrender.com/api/servicios/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "landing_data": {
      "titulo": "Test",
      "resumen": "Test resumen",
      "imagen": "test.jpg"
    },
    "info_page_data": {
      "descripcion": "Test descripcion"
    },
    "visible_en_landing": true
  }'
```

## 📝 NOTAS IMPORTANTES:

- **El frontend está funcionando correctamente**
- **Los datos se envían en el formato correcto**
- **El problema está específicamente en el backend**
- **El GET funciona, el PUT falla**
- **Es un error interno del servidor, no de validación**

---

**Una vez que soluciones el error en el backend, la funcionalidad de edición funcionará perfectamente. Mientras tanto, el frontend usará datos mock como fallback.**
