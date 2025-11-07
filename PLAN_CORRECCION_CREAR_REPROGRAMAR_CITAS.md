# 🔧 Plan de Trabajo: Corrección de Crear y Reprogramar Citas

## 📋 Problema Identificado

### Error 500 al Crear/Reprogramar Citas

**Error específico:**
```
Cannot add or update a child row: a foreign key constraint fails 
("registrack_db"."citas", CONSTRAINT "citas_ibfk_1" FOREIGN KEY ("id_cliente") 
REFERENCES "usuarios" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE)
```

**Causa Raíz:**
- El código está enviando el número de documento (`cedula`) como `id_cliente`
- La API espera el `id_usuario` (ID numérico de la tabla usuarios) como `id_cliente`
- Línea problemática: `id_cliente: parseInt(formData.cedula) || 1`

**Datos enviados actualmente:**
```json
{
  "id_cliente": 1000646080,  // ❌ Este es el número de documento, NO el id_usuario
  "id_empleado": 11
}
```

**Lo que necesita la API:**
```json
{
  "id_cliente": 5,  // ✅ Este debe ser el id_usuario del cliente
  "id_empleado": 11
}
```

---

## ✅ Solución Propuesta

### Estrategia: Buscar/Crear Usuario antes de Crear Cita

1. **Buscar usuario existente** por documento usando la API de usuarios
2. Si existe, usar su `id_usuario` como `id_cliente`
3. Si NO existe, crear el usuario primero y luego usar su `id_usuario`
4. Enviar la cita con el `id_usuario` correcto

---

## 📝 Plan de Implementación

### Fase 1: Crear función auxiliar para obtener/buscar usuario por documento

**Archivo:** `src/features/dashboard/pages/gestionCitas/calendario.jsx`

**Tarea:** Crear función `obtenerIdUsuarioCliente()` que:
- Busque usuario por documento usando `userApiService.getAllUsers()`
- Filtre por documento y tipo de documento
- Retorne el `id_usuario` si existe
- Si no existe, cree el usuario y retorne su `id_usuario`

```javascript
const obtenerIdUsuarioCliente = async (tipoDocumento, documento, nombre, apellido, email, telefono) => {
  try {
    // 1. Buscar usuario existente por documento
    const usuariosResult = await userApiService.getAllUsers();
    if (usuariosResult.success && usuariosResult.users) {
      const usuarioExistente = usuariosResult.users.find(u => 
        u.documento === documento && 
        u.tipo_documento === tipoDocumento
      );
      
      if (usuarioExistente) {
        console.log('✅ [Calendario] Usuario encontrado:', usuarioExistente.id_usuario);
        return usuarioExistente.id_usuario;
      }
    }
    
    // 2. Si no existe, crear usuario nuevo
    console.log('📝 [Calendario] Usuario no encontrado, creando nuevo usuario...');
    const nuevoUsuario = {
      nombre: nombre,
      apellido: apellido,
      email: email || `${documento}@temporal.com`, // Email temporal si no se proporciona
      password: `Temp${documento}123`, // Password temporal
      tipoDocumento: tipoDocumento,
      documento: documento,
      telefono: telefono || '',
      roleId: 1 // Rol cliente (id_rol=1 según documentación)
    };
    
    const crearResult = await userApiService.createUser(nuevoUsuario);
    if (crearResult.success && crearResult.user) {
      console.log('✅ [Calendario] Usuario creado:', crearResult.user.id_usuario);
      return crearResult.user.id_usuario;
    } else {
      throw new Error('No se pudo crear el usuario: ' + crearResult.message);
    }
  } catch (error) {
    console.error('❌ [Calendario] Error al obtener/crear usuario:', error);
    throw error;
  }
};
```

---

### Fase 2: Actualizar función `handleGuardarCita` para usar `id_usuario` correcto

**Archivo:** `src/features/dashboard/pages/gestionCitas/calendario.jsx`

**Cambios necesarios:**

1. **Modificar creación de cita normal:**
```javascript
// ANTES (línea 547):
id_cliente: parseInt(formData.cedula) || 1,

// DESPUÉS:
// Obtener id_usuario del cliente
const idUsuarioCliente = await obtenerIdUsuarioCliente(
  formData.tipoDocumento,
  formData.cedula,
  formData.nombre,
  formData.apellido,
  '', // email (opcional, se generará temporal si no existe)
  formData.telefono
);

const citaData = {
  fecha: fechaBase,
  hora_inicio: formData.horaInicio.includes(':') && formData.horaInicio.split(':').length === 2 ? formData.horaInicio + ':00' : formData.horaInicio,
  hora_fin: formData.horaFin.includes(':') && formData.horaFin.split(':').length === 2 ? formData.horaFin + ':00' : formData.horaFin,
  tipo: formData.tipoCita,
  modalidad: "Presencial",
  id_cliente: idUsuarioCliente, // ✅ Usar id_usuario correcto
  id_empleado: idEmpleado,
  observacion: formData.detalle || '',
  cliente: {
    nombre: formData.nombre,
    apellido: formData.apellido,
    documento: formData.cedula,
    telefono: formData.telefono
  }
};
```

2. **Importar `userApiService`:**
```javascript
import userApiService from "../../../auth/services/userApiService.js";
```

---

### Fase 3: Actualizar función `handleReprogramarCita` (si es necesario)

**Nota:** La reprogramación normalmente no requiere cambiar el cliente, pero verificar que no esté usando documento como ID.

**Verificar:** La función `reprogramarCita` en `citasApiService.js` solo envía `fecha`, `hora_inicio`, `hora_fin`, `observacion` y `id_empleado` - NO incluye `id_cliente`, por lo que debería estar bien. Sin embargo, verificar que el endpoint del backend no esté esperando `id_cliente` en el body.

---

### Fase 4: Manejo de errores mejorado

**Agregar validaciones y mensajes de error claros:**

```javascript
if (!idUsuarioCliente) {
  await alertService.error(
    "Error al crear usuario",
    "No se pudo obtener o crear el usuario. Verifica los datos ingresados."
  );
  return;
}
```

---

## 🔍 Verificaciones Necesarias

### 1. Verificar estructura de respuesta de `userApiService.getAllUsers()`
- Confirmar que devuelve `{ success: true, users: [...] }`
- Verificar que cada usuario tiene `id_usuario`, `documento`, `tipo_documento`

### 2. Verificar estructura de respuesta de `userApiService.createUser()`
- Confirmar que devuelve `{ success: true, user: { id_usuario: ... } }`
- Verificar formato de datos requeridos para crear usuario

### 3. Verificar endpoint de reprogramar cita
- Confirmar que NO requiere `id_cliente` en el body
- Verificar que solo requiere `fecha`, `hora_inicio`, `hora_fin`, `observacion`, `id_empleado`

---

## 📊 Endpoints de la API Referenciados

### 1. GET /api/usuarios (Obtener todos los usuarios)
```bash
GET /api/usuarios
Authorization: Bearer <TOKEN>
```

### 2. POST /api/usuarios/registrar (Crear usuario)
```bash
POST /api/usuarios/registrar
Content-Type: application/json
Authorization: Bearer <TOKEN>
Body: {
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "password": "string",
  "tipoDocumento": "string",
  "documento": "string",
  "telefono": "string",
  "roleId": number
}
```

### 3. POST /api/gestion-citas (Crear cita)
```bash
POST /api/gestion-citas
Content-Type: application/json
Authorization: Bearer <TOKEN>
Body: {
  "fecha": "YYYY-MM-DD",
  "hora_inicio": "HH:MM:SS",
  "hora_fin": "HH:MM:SS",
  "tipo": "string",
  "modalidad": "string",
  "id_cliente": number,  // ✅ Debe ser id_usuario
  "id_empleado": number,
  "estado": "string (opcional)",
  "observacion": "string (opcional)"
}
```

---

## ⚠️ Consideraciones Importantes

1. **Crear usuario automáticamente puede tener implicaciones:**
   - El usuario creado tendrá password temporal
   - El email será temporal si no se proporciona
   - El usuario deberá actualizar sus datos después

2. **Alternativa:** Podríamos requerir que el usuario exista antes de crear la cita, mostrando un error claro si no existe.

3. **Validación de datos:** Asegurarse de que todos los campos requeridos estén presentes antes de crear el usuario.

---

## 🎯 Resultado Esperado

Después de implementar estos cambios:

✅ **Crear cita:** Funciona correctamente usando `id_usuario` válido
✅ **Reprogramar cita:** Funciona correctamente (ya no usa `id_cliente` incorrecto)
✅ **Manejo de errores:** Mensajes claros si no se puede obtener/crear usuario
✅ **Validaciones:** Verificación de datos antes de crear cita

---

## 📝 Checklist de Implementación

- [ ] Crear función `obtenerIdUsuarioCliente()` en `calendario.jsx`
- [ ] Importar `userApiService` en `calendario.jsx`
- [ ] Actualizar `handleGuardarCita()` para usar `id_usuario` correcto
- [ ] Verificar que `reprogramarCita` no incluya `id_cliente` incorrecto
- [ ] Agregar manejo de errores mejorado
- [ ] Probar creación de cita con usuario existente
- [ ] Probar creación de cita con usuario nuevo (creación automática)
- [ ] Probar reprogramación de cita
- [ ] Verificar logs en consola para debugging

---

## 🔗 Referencias

- Documentación API: `documentacion api.md` - Sección de Citas (línea 2245-2283)
- Servicio de Usuarios: `src/features/auth/services/userApiService.js`
- Servicio de Citas: `src/features/dashboard/services/citasApiService.js`

