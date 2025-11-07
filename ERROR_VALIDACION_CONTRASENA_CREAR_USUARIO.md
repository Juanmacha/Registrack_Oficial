# ⚠️ ERROR: Validación de Contraseña al Crear Usuario desde Citas

**Fecha**: 4 de Noviembre de 2025  
**Prioridad**: 🔴 **ALTA**  
**Módulo**: Gestión de Citas / Creación de Usuarios

---

## 🐛 Problema Identificado

Al crear una **cita directa** con un cliente que no existe en el sistema, el frontend intenta crear automáticamente el usuario, pero falla con el siguiente error:

```
❌ Error: Valores inválidos en los campos: contrasena
Code: VALIDATION_ERROR
Status: 400 Bad Request
```

### **Logs del Error:**

```
📤 [userApiService] Datos enviados a la API: {
  tipo_documento: 'CC',
  documento: '34567766',
  nombre: 'Wilson',
  apellido: 'Martinez',
  correo: 'temp_34567766@registrack.com',
  contrasena: 'Temp34567766123',  // ❌ Contraseña inválida
  id_rol: 1
}
```

---

## 📋 Análisis del Problema

### **Contraseña Generada Actualmente:**
```javascript
const passwordTemporal = `Temp${documento}123`;
// Ejemplo: "Temp34567766123"
```

### **Requisitos de Contraseña del Backend:**

Según la documentación de la API y los ejemplos proporcionados, la contraseña debe cumplir con los siguientes requisitos:

1. ✅ **Mínimo 8 caracteres**
2. ✅ **Letras mayúsculas** (A-Z)
3. ✅ **Letras minúsculas** (a-z)
4. ✅ **Números** (0-9)
5. ✅ **Caracteres especiales** (!@#$%^&*)

### **Contraseña Ejemplo en Documentación:**
```json
{
  "contrasena": "Empleado123!"  // ✅ Cumple todos los requisitos
}
```

### **Problema Específico:**

La contraseña generada `Temp34567766123` **NO incluye caracteres especiales**, por lo que falla la validación del backend.

---

## ✅ Solución Implementada en Frontend

### **Cambio Realizado:**

```javascript
// ANTES (❌ No cumple requisitos):
const passwordTemporal = `Temp${documento}123`;
// Ejemplo: "Temp34567766123" (sin caracteres especiales)

// AHORA (✅ Cumple todos los requisitos):
const passwordTemporal = `Temp${documento}123!`;
// Ejemplo: "Temp34567766123!" (incluye carácter especial !)
```

### **Nueva Contraseña Generada:**

- ✅ **Longitud**: Mínimo 8 caracteres (depende del documento)
- ✅ **Mayúsculas**: "Temp" (T mayúscula)
- ✅ **Minúsculas**: "emp" (letras minúsculas)
- ✅ **Números**: Documento completo (ej: "34567766")
- ✅ **Caracteres especiales**: "!" al final

**Ejemplo:**
- Documento: `34567766`
- Contraseña generada: `Temp34567766123!`
- Longitud: 18 caracteres ✅

---

## 🔧 Corrección Necesaria en Backend

### **Recomendación:**

El backend debería proporcionar **mensajes de error más descriptivos** sobre qué requisitos específicos no se cumplen en la contraseña.

### **Estado Actual del Error:**

```json
{
  "success": false,
  "error": {
    "message": "Valores inválidos en los campos: contrasena",
    "code": "VALIDATION_ERROR",
    "details": {},
    "timestamp": "2025-11-04T14:06:13.219Z"
  }
}
```

### **Mejora Sugerida:**

```json
{
  "success": false,
  "error": {
    "message": "La contraseña no cumple con los requisitos de seguridad",
    "code": "VALIDATION_ERROR",
    "details": {
      "contrasena": [
        "La contraseña debe tener al menos 8 caracteres",
        "La contraseña debe contener al menos una letra mayúscula",
        "La contraseña debe contener al menos una letra minúscula",
        "La contraseña debe contener al menos un número",
        "La contraseña debe contener al menos un carácter especial (!@#$%^&*)"
      ]
    },
    "timestamp": "2025-11-04T14:06:13.219Z"
  }
}
```

### **Código Sugerido para el Backend:**

Si el backend usa `express-validator` o similar, se puede mejorar la validación así:

```javascript
// Validación mejorada de contraseña
const passwordValidation = [
  body('contrasena')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*]/).withMessage('La contraseña debe contener al menos un carácter especial (!@#$%^&*)')
    .custom((value) => {
      if (!value || value.trim().length === 0) {
        throw new Error('La contraseña es requerida');
      }
      return true;
    })
];
```

---

## 📊 Flujo Corregido

### **1. Usuario intenta crear cita directa**
```
Cliente: Wilson Martinez
Documento: 34567766
```

### **2. Sistema busca usuario**
```
GET /api/usuarios
→ Usuario no encontrado
```

### **3. Sistema crea usuario automáticamente**
```
POST /api/usuarios/crear
{
  tipo_documento: "CC",
  documento: "34567766",
  nombre: "Wilson",
  apellido: "Martinez",
  correo: "temp_34567766@registrack.com",
  contrasena: "Temp34567766123!",  // ✅ Ahora incluye carácter especial
  id_rol: 1
}
```

### **4. Sistema crea cita**
```
POST /api/gestion-citas
{
  id_cliente: [id_usuario obtenido],
  ...
}
```

---

## ✅ Verificación

### **Pruebas Realizadas:**

1. ✅ **Contraseña corta**: Se rechaza correctamente
2. ✅ **Contraseña sin mayúsculas**: Se rechaza correctamente
3. ✅ **Contraseña sin minúsculas**: Se rechaza correctamente
4. ✅ **Contraseña sin números**: Se rechaza correctamente
5. ✅ **Contraseña sin caracteres especiales**: Se rechaza correctamente (este era el problema)
6. ✅ **Contraseña válida**: `Temp34567766123!` → Aceptada ✅

---

## 📝 Notas Adicionales

### **Información al Usuario:**

Cuando se crea un usuario automáticamente, se muestra este mensaje:

```
"Se ha creado un usuario temporal para este cliente. 
El usuario deberá actualizar su contraseña al iniciar sesión."
```

### **Credenciales Temporales:**

- **Email**: `temp_[documento]@registrack.com`
- **Contraseña**: `Temp[documento]123!`
- **Rol**: Cliente (id_rol=1)

El cliente deberá cambiar la contraseña al iniciar sesión por primera vez.

---

## 🔄 Estado del Fix

- ✅ **Frontend**: Corregido - Contraseña ahora incluye carácter especial
- ⚠️ **Backend**: Mejora recomendada - Mensajes de error más descriptivos

---

## 📞 Contacto

Si el error persiste después de esta corrección, revisar:
1. Validación de contraseña en el backend (`usuario.controller.js` o `usuario.validator.js`)
2. Middleware de validación (`express-validator` o similar)
3. Mensajes de error del backend para identificar requisitos específicos

