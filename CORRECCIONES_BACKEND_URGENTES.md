# 🔴 **CORRECCIONES URGENTES PARA EL BACKEND**

## 📋 **RESUMEN DE PROBLEMAS IDENTIFICADOS**

### **Problema 1: Solicitudes anuladas NO aparecen en "Ventas Finalizadas"** ⚠️ CRÍTICO
**Síntoma:** Al anular una solicitud, desaparece de "Ventas en Proceso" pero NO aparece en "Ventas Finalizadas".

### **Problema 2: Filtros de servicios no funcionan correctamente** ⚠️ MEDIO
**Síntoma:** Los filtros de servicios en la tabla estaban usando datos mock en lugar de datos reales.

---

## 🔧 **PROBLEMA 1: ENDPOINT DE ANULAR SOLICITUD**

### **📍 Ubicación del Problema**
**Archivo:** `src/controllers/solicitudes.controller.js`  
**Endpoint:** `PUT /api/gestion-solicitudes/anular/:id`

### **🔍 Diagnóstico**

El endpoint `PUT /api/gestion-solicitudes/anular/:id` probablemente:
1. ❌ **NO está actualizando el campo `estado`** a "Anulada"
2. ❌ O está usando un valor diferente (ej: "Rechazada", null, o no lo actualiza)

### **✅ Solución Requerida**

El endpoint **DEBE** actualizar el campo `estado` de la solicitud a **"Anulada"** (con A mayúscula).

#### **Código Esperado:**

```javascript
// src/controllers/solicitudes.controller.js

// PUT /api/gestion-solicitudes/anular/:id
async anularSolicitud(req, res) {
  try {
    const { id } = req.params;
    
    // Buscar la solicitud
    const solicitud = await OrdenServicio.findByPk(id);
    
    if (!solicitud) {
      return res.status(404).json({ 
        error: 'Solicitud no encontrada' 
      });
    }
    
    // ✅ CRÍTICO: Actualizar el estado a "Anulada"
    await solicitud.update({
      estado: 'Anulada'  // ⚠️ Con A mayúscula
    });
    
    // 📧 Enviar email de notificación (opcional pero recomendado)
    try {
      const cliente = await Cliente.findByPk(solicitud.id_cliente, {
        include: [{ model: Usuario, as: 'user' }]
      });
      
      if (cliente?.user?.email) {
        await enviarEmailNotificacion({
          to: cliente.user.email,
          subject: 'Solicitud Anulada',
          html: `
            <h2>Solicitud #${solicitud.id} Anulada</h2>
            <p>Su solicitud ha sido anulada.</p>
            <p>Servicio: ${solicitud.servicio || 'N/A'}</p>
          `
        });
      }
    } catch (emailError) {
      console.error('Error enviando email de anulación:', emailError);
      // No fallar si el email falla
    }
    
    return res.status(200).json({
      success: true,
      message: 'Solicitud anulada correctamente',
      data: solicitud
    });
    
  } catch (error) {
    console.error('Error anulando solicitud:', error);
    return res.status(500).json({ 
      error: 'Error al anular la solicitud',
      details: error.message 
    });
  }
}
```

### **🔍 Verificación**

Después de aplicar la corrección, verifica:

1. **Base de datos:**
   ```sql
   SELECT id, servicio, estado FROM orden_servicio WHERE id = [ID_ANULADO];
   -- El estado DEBE ser "Anulada"
   ```

2. **Respuesta de la API:**
   ```bash
   curl -X PUT "http://localhost:3000/api/gestion-solicitudes/anular/1" \
     -H "Authorization: Bearer <TOKEN>"
   ```
   
   **Respuesta esperada:**
   ```json
   {
     "success": true,
     "message": "Solicitud anulada correctamente",
     "data": {
       "id": 1,
       "servicio": "Certificación de marca",
       "estado": "Anulada",  // ✅ DEBE decir "Anulada"
       ...
     }
   }
   ```

3. **Frontend:**
   - La solicitud debe desaparecer de "Ventas en Proceso"
   - La solicitud debe aparecer en "Ventas Finalizadas"

---

## 📊 **ESTADOS VÁLIDOS DEL SISTEMA**

Según la documentación de la API, los estados válidos son:

```javascript
const ESTADOS_VALIDOS = {
  PENDIENTE: 'Pendiente',      // Solicitud creada, en espera
  APROBADA: 'Aprobada',        // Solicitud aprobada (completada)
  RECHAZADA: 'Rechazada',      // Solicitud rechazada
  ANULADA: 'Anulada'           // Solicitud anulada por admin/empleado
};
```

### **Mapeo Frontend ↔ Backend:**

| Estado Backend | Estado Frontend | Tabla en Frontend |
|---------------|-----------------|-------------------|
| `Pendiente`   | `Pendiente`     | Ventas en Proceso |
| `Aprobada`    | `Finalizada`    | Ventas Finalizadas |
| `Rechazada`   | `Anulada`       | Ventas Finalizadas |
| `Anulada`     | `Anulada`       | Ventas Finalizadas |

---

## 🔍 **PROBLEMA 2: FILTROS DE SERVICIOS (YA CORREGIDO EN FRONTEND)**

### **✅ Solución Aplicada en Frontend**

**Archivo modificado:** `tablaVentasProceso.jsx` (líneas 114-127)

Los servicios y estados disponibles ahora se obtienen dinámicamente de las ventas reales en lugar de datos mock.

**Antes:**
```javascript
// ❌ Usaba datos mock
const servicios = mockDataService.getServices();
setServiciosDisponibles(['Todos', ...servicios.map(s => s.nombre)]);
```

**Ahora:**
```javascript
// ✅ Usa datos reales de la API
const serviciosUnicos = Array.from(new Set(ventasEnProceso.map(v => v.tipoSolicitud))).filter(Boolean);
setServiciosDisponibles(['Todos', ...serviciosUnicos]);
```

---

## 📝 **CHECKLIST DE VERIFICACIÓN**

### **Backend (Tu tarea):**
- [ ] Abrir `src/controllers/solicitudes.controller.js`
- [ ] Localizar la función `anularSolicitud` o el endpoint `PUT /api/gestion-solicitudes/anular/:id`
- [ ] Asegurar que actualiza el campo `estado` a `'Anulada'`
- [ ] Reiniciar el servidor backend
- [ ] Probar el endpoint con curl o Postman
- [ ] Verificar en la base de datos que el estado es "Anulada"

### **Frontend (Ya completado):**
- [✅] Conectar anulación con API real
- [✅] Agregar evento de refresh entre tablas
- [✅] Filtrar solicitudes anuladas en "Ventas Finalizadas"
- [✅] Corregir filtros de servicios (usar datos reales)
- [✅] Agregar logs de debug detallados

---

## 🧪 **PRUEBA COMPLETA DESPUÉS DE LA CORRECCIÓN**

### **Paso 1: Crear una solicitud de prueba**
```bash
curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/Certificación%20de%20marca" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "pais": "Colombia",
    "ciudad": "Bogotá",
    "nombre_marca": "Test Marca",
    ...
  }'
```

### **Paso 2: Anotar el ID de la solicitud creada**
```json
{
  "success": true,
  "data": {
    "id": 123,  // ⬅️ Anotar este ID
    "estado": "Pendiente",
    ...
  }
}
```

### **Paso 3: Anular la solicitud**
```bash
curl -X PUT "http://localhost:3000/api/gestion-solicitudes/anular/123" \
  -H "Authorization: Bearer <TOKEN>"
```

### **Paso 4: Verificar el estado**
```bash
curl -X GET "http://localhost:3000/api/gestion-solicitudes/123" \
  -H "Authorization: Bearer <TOKEN>"
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": 123,
    "estado": "Anulada",  // ✅ DEBE ser "Anulada"
    ...
  }
}
```

### **Paso 5: Verificar en el frontend**
1. Ir a "Ventas en Proceso" → La solicitud NO debe estar
2. Ir a "Ventas Finalizadas" → La solicitud SÍ debe estar con badge "Anulada"

---

## 📧 **NOTIFICACIONES POR EMAIL (OPCIONAL)**

Si quieres que el sistema envíe emails al anular solicitudes, asegúrate de:

1. **Obtener el email del cliente:**
   ```javascript
   const cliente = await Cliente.findByPk(solicitud.id_cliente, {
     include: [{ model: Usuario, as: 'user' }]
   });
   const emailCliente = cliente?.user?.email;
   ```

2. **Enviar el email:**
   ```javascript
   await enviarEmailNotificacion({
     to: emailCliente,
     subject: 'Solicitud Anulada',
     html: `
       <h2>Solicitud Anulada</h2>
       <p>Su solicitud #${solicitud.id} ha sido anulada.</p>
       <p><strong>Servicio:</strong> ${solicitud.servicio}</p>
       <p><strong>Fecha de anulación:</strong> ${new Date().toLocaleDateString()}</p>
     `
   });
   ```

---

## 🎯 **RESULTADO ESPERADO FINAL**

Después de aplicar las correcciones:

✅ **Al anular una solicitud:**
1. El estado en la base de datos cambia a "Anulada"
2. La solicitud desaparece de "Ventas en Proceso"
3. La solicitud aparece en "Ventas Finalizadas" con badge rojo "Anulada"
4. Se envía email de notificación al cliente (opcional)

✅ **Filtros de servicios:**
1. Los filtros muestran solo los servicios que existen en las ventas reales
2. Al filtrar, se muestran correctamente las solicitudes del servicio seleccionado

---

## 📞 **CONTACTO PARA DUDAS**

Si después de aplicar la corrección sigue sin funcionar:

1. **Envíame los logs del backend** cuando se ejecuta el endpoint de anular
2. **Envíame la respuesta JSON** del endpoint `PUT /api/gestion-solicitudes/anular/:id`
3. **Verifica en la base de datos** el valor exacto del campo `estado` después de anular

---

## 📌 **RESUMEN EJECUTIVO**

| Problema | Estado | Acción Requerida |
|----------|--------|------------------|
| Solicitudes anuladas no aparecen en "Ventas Finalizadas" | ⚠️ Backend | Actualizar `estado` a `"Anulada"` en el endpoint de anular |
| Filtros de servicios no funcionan | ✅ Frontend | Ya corregido |
| Logs de debug insuficientes | ✅ Frontend | Ya agregados |
| Sistema de eventos entre tablas | ✅ Frontend | Ya implementado |

**🔴 ACCIÓN INMEDIATA:** Corregir el endpoint `PUT /api/gestion-solicitudes/anular/:id` en el backend.

