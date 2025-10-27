# PROMPT PARA SOLUCIONAR ERROR 500 EN ENDPOINT PUT /api/servicios/:id

## 🔴 PROBLEMA IDENTIFICADO

El endpoint `PUT /api/servicios/:id` está devolviendo un **error 500** cuando se intenta actualizar la visibilidad de un servicio.

### 📊 EVIDENCIA DEL PROBLEMA:

**Frontend envía correctamente:**
```json
{
  "visible_en_landing": false,
  "landing_data": {
    "imagen": "nueva_imagen.jpg",
    "titulo": "Búsqueda de Antecedentes - Actualizado",
    "resumen": "Verificamos la disponibilidad de tu marca comercial en la base de datos de la SIC - Versión actualizada"
  },
  "info_page_data": {
    "descripcion": "Este servicio permite verificar si una marca comercial ya está registrada o en proceso de registro. Información actualizada."
  }
}
```

**Backend responde con:**
- ❌ **Error 500** (Internal Server Error)
- ❌ El cambio no se guarda en la base de datos
- ❌ Al recargar, el servicio sigue con `visible_en_landing: true`

## 🛠️ SOLUCIÓN REQUERIDA

### 1. **Verificar el Controlador de Servicios**

Asegúrate de que el controlador `/api/servicios/:id` (método PUT) esté:

```javascript
// Ejemplo de implementación correcta
app.put('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validar que el servicio existe
    const servicio = await Servicio.findById(id);
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    
    // Actualizar el servicio
    const servicioActualizado = await Servicio.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(servicioActualizado);
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});
```

### 2. **Verificar el Modelo de Servicio**

Asegúrate de que el modelo `Servicio` tenga:

```javascript
const servicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion_corta: { type: String, required: true },
  visible_en_landing: { type: Boolean, default: true },
  landing_data: {
    titulo: String,
    resumen: String,
    imagen: String
  },
  info_page_data: {
    descripcion: String
  },
  process_states: [{
    estado: String,
    descripcion: String,
    activo: Boolean
  }],
  route_path: String
}, {
  timestamps: true
});
```

### 3. **Verificar Validaciones**

Si tienes validaciones en el modelo, asegúrate de que no estén causando el error:

```javascript
// Ejemplo de validaciones que podrían causar problemas
servicioSchema.pre('save', function(next) {
  // Verificar que no haya validaciones que fallen
  next();
});
```

### 4. **Verificar Base de Datos**

Asegúrate de que:
- ✅ La conexión a la base de datos esté funcionando
- ✅ El servicio con ID 1 existe en la base de datos
- ✅ Los campos que se están actualizando existen en el esquema

### 5. **Logs de Debug**

Agrega logs detallados en el backend:

```javascript
app.put('/api/servicios/:id', async (req, res) => {
  try {
    console.log('🔧 [Backend] Actualizando servicio:', req.params.id);
    console.log('📊 [Backend] Datos recibidos:', req.body);
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar que el servicio existe
    const servicio = await Servicio.findById(id);
    console.log('🔍 [Backend] Servicio encontrado:', servicio ? 'Sí' : 'No');
    
    if (!servicio) {
      console.log('❌ [Backend] Servicio no encontrado');
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    
    // Actualizar el servicio
    console.log('🔄 [Backend] Actualizando servicio...');
    const servicioActualizado = await Servicio.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('✅ [Backend] Servicio actualizado:', servicioActualizado);
    res.json(servicioActualizado);
  } catch (error) {
    console.error('❌ [Backend] Error actualizando servicio:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});
```

## 🧪 TESTING

Después de implementar la solución:

1. **Probar el endpoint directamente:**
```bash
curl -X PUT http://tu-backend/api/servicios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "visible_en_landing": false,
    "landing_data": {
      "titulo": "Test",
      "resumen": "Test resumen"
    },
    "info_page_data": {
      "descripcion": "Test descripcion"
    }
  }'
```

2. **Verificar que el cambio se guarde:**
```bash
curl -X GET http://tu-backend/api/servicios/1
```

3. **Verificar en el frontend** que las cards se actualicen correctamente.

## 📝 NOTAS IMPORTANTES

- El frontend está funcionando correctamente
- El problema está en el backend (error 500)
- Los datos se están enviando correctamente
- El fallback a datos mock está funcionando
- Necesitamos que el backend guarde los cambios correctamente

---

**Una vez que implementes estos cambios, el frontend debería funcionar perfectamente sin necesidad de cambios adicionales.**
