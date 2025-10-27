# 🚨 PROBLEMA CRÍTICO: Backend No Guarda Process States

## 📋 **RESUMEN DEL PROBLEMA:**

El backend está **recibiendo correctamente** los `process_states` pero **NO los está guardando** en la base de datos. Después de la actualización, devuelve un array vacío `[]` en lugar de los estados enviados.

## 🔍 **EVIDENCIA DEL PROBLEMA:**

### **Frontend envía correctamente:**
```json
{
  "process_states": [
    {
      "id": "55",
      "name": "Solicitud Inicial",
      "order": 1,
      "status_key": "solicitud_inicial"
    },
    // ... 5 estados más ...
    {
      "id": "1759154709742",
      "name": "periodo de gracia",
      "order": 7,
      "status_key": "periodo_de_gracia"
    }
  ]
}
```

### **Backend responde incorrectamente:**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "process_states": []  ← ¡VACÍO! Debería tener 7 estados
  }
}
```

## 🎯 **CAUSA RAÍZ:**

El endpoint `PUT /api/servicios/:id` **NO está procesando correctamente** el campo `process_states` en la actualización.

## 🔧 **SOLUCIÓN REQUERIDA:**

### **1. Verificar el Controlador de Servicios:**

Busca el archivo del controlador de servicios (probablemente `servicio.controller.js` o similar) y verifica que el endpoint `PUT /api/servicios/:id` esté:

1. **Recibiendo el campo `process_states`** del body de la petición
2. **Validando que sea un array** válido
3. **Guardándolo en la base de datos** correctamente
4. **Devolviendo el campo actualizado** en la respuesta

### **2. Código de Ejemplo Esperado:**

```javascript
// En el controlador de actualización de servicios
const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      visible_en_landing, 
      landing_data, 
      info_page_data, 
      process_states  // ← ESTE CAMPO DEBE PROCESARSE
    } = req.body;

    // Validar que process_states sea un array
    if (process_states && !Array.isArray(process_states)) {
      return res.status(400).json({
        success: false,
        error: "process_states debe ser un array"
      });
    }

    // Actualizar en la base de datos
    const servicioActualizado = await Servicio.update({
      visible_en_landing,
      landing_data,
      info_page_data,
      process_states  // ← DEBE GUARDARSE
    }, {
      where: { id },
      returning: true
    });

    // Devolver el servicio actualizado CON process_states
    res.json({
      success: true,
      message: "Servicio actualizado exitosamente",
      data: servicioActualizado[0]  // ← DEBE INCLUIR process_states
    });

  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};
```

### **3. Verificar el Modelo de Servicio:**

Asegúrate de que el modelo `Servicio` tenga definido el campo `process_states`:

```javascript
// En el modelo Servicio
const Servicio = sequelize.define('Servicio', {
  // ... otros campos ...
  process_states: {
    type: DataTypes.JSON,  // ← DEBE SER JSON
    allowNull: true,
    defaultValue: []
  }
});
```

### **4. Verificar la Migración de Base de Datos:**

Asegúrate de que la tabla `servicios` tenga la columna `process_states`:

```sql
-- Verificar que existe la columna
DESCRIBE servicios;

-- Si no existe, agregarla:
ALTER TABLE servicios ADD COLUMN process_states JSON DEFAULT '[]';
```

## 🧪 **PRUEBA DE VERIFICACIÓN:**

### **1. Prueba con Postman:**

```bash
PUT https://api-registrack-2.onrender.com/api/servicios/1
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "visible_en_landing": true,
  "landing_data": {
    "titulo": "Test",
    "resumen": "Test"
  },
  "info_page_data": {
    "descripcion": "Test"
  },
  "process_states": [
    {
      "id": "test1",
      "name": "Estado Test 1",
      "order": 1,
      "status_key": "test1"
    },
    {
      "id": "test2", 
      "name": "Estado Test 2",
      "order": 2,
      "status_key": "test2"
    }
  ]
}
```

### **2. Respuesta Esperada:**

```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "nombre": "Búsqueda de Antecedentes",
    "visible_en_landing": true,
    "landing_data": { "titulo": "Test", "resumen": "Test" },
    "info_page_data": { "descripcion": "Test" },
    "process_states": [  ← ¡DEBE INCLUIR LOS ESTADOS!
      {
        "id": "test1",
        "name": "Estado Test 1",
        "order": 1,
        "status_key": "test1"
      },
      {
        "id": "test2",
        "name": "Estado Test 2", 
        "order": 2,
        "status_key": "test2"
      }
    ]
  }
}
```

## 🚨 **PRIORIDAD: CRÍTICA**

Este es un problema **crítico** que impide que la funcionalidad de gestión de estados de proceso funcione correctamente. El frontend está enviando los datos correctamente, pero el backend no los está procesando.

## 📝 **PASOS INMEDIATOS:**

1. **Revisar el controlador** de actualización de servicios
2. **Verificar el modelo** de Servicio
3. **Comprobar la base de datos** tiene la columna `process_states`
4. **Probar con Postman** para confirmar la corrección
5. **Verificar que la respuesta** incluya los `process_states` actualizados

## ✅ **CRITERIO DE ÉXITO:**

Después de la corrección, el backend debe devolver en la respuesta del `PUT /api/servicios/:id` el campo `process_states` con los mismos datos que se enviaron en la petición.

---

**Fecha:** 28 de Septiembre de 2025  
**Prioridad:** 🔴 CRÍTICA  
**Estado:** ⏳ PENDIENTE DE CORRECCIÓN
