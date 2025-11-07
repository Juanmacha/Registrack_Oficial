# 🚀 PROMPT PARA IMPLEMENTAR EDICIÓN DE PERMISOS Y PRIVILEGIOS EN ROLES

## 📋 DESCRIPCIÓN DEL PROBLEMA

Actualmente, el endpoint `PUT /api/gestion-roles/:id` solo permite actualizar el `nombre` y `estado` del rol, pero **NO permite actualizar los permisos y privilegios**. Esto es una limitación crítica porque:

1. ❌ No se pueden quitar permisos/privilegios de un rol existente
2. ❌ No se pueden agregar nuevos permisos/privilegios a un rol existente
3. ❌ No se pueden modificar permisos/privilegios específicos de un módulo
4. ❌ El frontend necesita poder editar completamente los permisos de un rol desde la interfaz

**Evidencia actual en la documentación de la API:**
- El endpoint `PUT /api/gestion-roles/:id` solo acepta `nombre` y `estado`
- Los permisos y privilegios se mantienen intactos cuando se actualiza un rol
- No existe un endpoint específico para actualizar solo los permisos de un rol

## 🎯 OBJETIVO

Modificar el endpoint `PUT /api/gestion-roles/:id` para que acepte y procese correctamente los permisos y privilegios en formato granular, permitiendo:

- ✅ Actualizar permisos completos de un rol
- ✅ Quitar permisos/privilegios específicos de un módulo
- ✅ Agregar nuevos permisos/privilegios a un rol existente
- ✅ Mantener la compatibilidad con el formato granular del frontend

## 🔧 CAMBIOS NECESARIOS

### 1. MODIFICAR EL CONTROLADOR `PUT /api/gestion-roles/:id`

El endpoint debe aceptar el campo `permisos` en el body de la solicitud y procesarlo igual que el endpoint `POST /api/gestion-roles`.

**Ubicación esperada:** `src/controllers/role.controller.js` o similar

### 2. MODIFICAR EL SERVICIO DE ROLES

El servicio debe actualizar las relaciones `RolPermisoPrivilegio` cuando se actualizan los permisos de un rol.

**Ubicación esperada:** `src/services/role.service.js` o similar

### 3. FUNCIONES DE TRANSFORMACIÓN REQUERIDAS

Reutilizar las funciones de transformación que ya existen para `POST /api/gestion-roles`:

- `transformPermisosToAPI()`: Convierte permisos del frontend al formato de la API
- `transformRoleToFrontend()`: Convierte rol de la API al formato del frontend

## 📊 ESTRUCTURAS DE DATOS

### MÓDULOS DISPONIBLES (18 módulos)

Según la documentación de la API, los módulos disponibles son:

```
usuarios, empleados, clientes, empresas, servicios, solicitudes, citas, 
pagos, roles, permisos, privilegios, seguimiento, archivos, tipo_archivos, 
formularios, detalles_orden, detalles_procesos, servicios_procesos
```

### ACCIONES DISPONIBLES (4 acciones por módulo)


```
crear, leer, actualizar, eliminar
```

### ESTRUCTURA DE ENTRADA ESPERADA (Frontend → API)

**Request:**
```http
PUT /api/gestion-roles/:id
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>

{
  "nombre": "Supervisor de Ventas",
  "estado": "Activo",
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "empresas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "archivos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "formularios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

### ESTRUCTURA DE RESPUESTA ESPERADA (API → Frontend)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Supervisor de Ventas",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "clientes": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "empleados": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      },
      "empresas": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "servicios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "solicitudes": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "citas": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "pagos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "roles": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      },
      "permisos": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      },
      "privilegios": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      },
      "seguimiento": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "archivos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "tipo_archivos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "formularios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "detalles_orden": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "detalles_procesos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "servicios_procesos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

## 🔧 CÓDIGO DE EJEMPLO PARA IMPLEMENTAR

### Función de Transformación de Permisos

```javascript
/**
 * Transforma permisos del formato frontend al formato de la API
 * @param {Object} permisosFrontend - Permisos en formato granular del frontend
 * @returns {Object} - { permisos: Array, privilegios: Array }
 */
const transformPermisosToAPI = (permisosFrontend) => {
  if (!permisosFrontend || typeof permisosFrontend !== 'object') {
    return { permisos: [], privilegios: [] };
  }

  const permisos = [];
  const privilegiosSet = new Set();

  // Lista de módulos válidos según la documentación
  const modulosValidos = [
    'usuarios', 'empleados', 'clientes', 'empresas', 'servicios', 
    'solicitudes', 'citas', 'pagos', 'roles', 'permisos', 'privilegios',
    'seguimiento', 'archivos', 'tipo_archivos', 'formularios',
    'detalles_orden', 'detalles_procesos', 'servicios_procesos'
  ];

  // Acciones válidas
  const accionesValidas = ['crear', 'leer', 'actualizar', 'eliminar'];

  modulosValidos.forEach(modulo => {
    const moduloPermisos = permisosFrontend[modulo];
    
    if (moduloPermisos && typeof moduloPermisos === 'object') {
      // Verificar si el módulo tiene al menos una acción activa
      const tieneAccionActiva = accionesValidas.some(
        accion => moduloPermisos[accion] === true
      );

      if (tieneAccionActiva) {
        // Agregar el permiso del módulo
        permisos.push(`gestion_${modulo}`);

        // Agregar las acciones activas como privilegios
        accionesValidas.forEach(accion => {
          if (moduloPermisos[accion] === true) {
            privilegiosSet.add(accion);
          }
        });
      }
    }
  });

  return {
    permisos: permisos,
    privilegios: Array.from(privilegiosSet)
  };
};
```

### Controlador Actualizado

```javascript
// PUT /api/gestion-roles/:id
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, estado, permisos } = req.body;

    // Validar que el rol existe
    const rolExistente = await roleService.getById(id);
    if (!rolExistente) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // Preparar datos para actualización
    const updateData = {};

    // Actualizar nombre si se proporciona
    if (nombre !== undefined) {
      updateData.nombre = nombre.toLowerCase().trim();
    }

    // Actualizar estado si se proporciona
    if (estado !== undefined) {
      updateData.estado = estado === true || estado === 'Activo' || estado === 'activo' || estado === 1;
    }

    // Transformar y actualizar permisos si se proporcionan
    if (permisos !== undefined) {
      const { permisos: permisosAPI, privilegios } = transformPermisosToAPI(permisos);
      
      updateData.permisos = permisosAPI;
      updateData.privilegios = privilegios;
    }

    // Actualizar el rol (esto debe actualizar también las relaciones en la tabla intermedia)
    const rolActualizado = await roleService.updateRoleWithPermissions(id, updateData);

    // Transformar la respuesta al formato del frontend
    const transformedRole = transformRoleToFrontend(rolActualizado);

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: transformedRole
    });

  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el rol',
      error: error.message
    });
  }
};
```

### Servicio Actualizado (Ejemplo)

```javascript
/**
 * Actualiza un rol con sus permisos y privilegios
 * @param {number|string} id - ID del rol
 * @param {Object} updateData - Datos a actualizar (nombre, estado, permisos, privilegios)
 * @returns {Object} - Rol actualizado con relaciones
 */
const updateRoleWithPermissions = async (id, updateData) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Actualizar el rol básico
    const rol = await Rol.findByPk(id, { transaction });
    if (!rol) {
      throw new Error('Rol no encontrado');
    }

    if (updateData.nombre !== undefined) {
      rol.nombre = updateData.nombre;
    }
    if (updateData.estado !== undefined) {
      rol.estado = updateData.estado;
    }
    await rol.save({ transaction });

    // 2. Si se proporcionan permisos, actualizar las relaciones
    if (updateData.permisos !== undefined || updateData.privilegios !== undefined) {
      // Eliminar relaciones existentes
      await RolPermisoPrivilegio.destroy({
        where: { id_rol: id },
        transaction
      });

      // Obtener o crear permisos y privilegios
      const permisosInstances = await Promise.all(
        updateData.permisos.map(async (nombrePermiso) => {
          const [permiso] = await Permiso.findOrCreate({
            where: { nombre: nombrePermiso },
            defaults: { nombre: nombrePermiso },
            transaction
          });
          return permiso;
        })
      );

      const privilegiosInstances = await Promise.all(
        updateData.privilegios.map(async (nombrePrivilegio) => {
          const [privilegio] = await Privilegio.findOrCreate({
            where: { nombre: nombrePrivilegio },
            defaults: { nombre: nombrePrivilegio },
            transaction
          });
          return privilegio;
        })
      );

      // Crear nuevas relaciones
      const relaciones = [];
      permisosInstances.forEach(permiso => {
        privilegiosInstances.forEach(privilegio => {
          relaciones.push({
            id_rol: id,
            id_permiso: permiso.id_permiso,
            id_privilegio: privilegio.id_privilegio
          });
        });
      });

      if (relaciones.length > 0) {
        await RolPermisoPrivilegio.bulkCreate(relaciones, { transaction });
      }
    }

    await transaction.commit();

    // Retornar el rol con todas sus relaciones
    return await Rol.findByPk(id, {
      include: [
        {
          model: Permiso,
          through: { attributes: [] }
        },
        {
          model: Privilegio,
          through: { attributes: [] }
        }
      ]
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

## ✅ VALIDACIONES REQUERIDAS

1. **Validación de existencia del rol:**
   - Verificar que el rol existe antes de actualizar
   - Retornar 404 si no existe

2. **Validación de permisos:**
   - Verificar que el objeto `permisos` tiene la estructura correcta
   - Validar que solo se usan módulos válidos
   - Validar que solo se usan acciones válidas (`crear`, `leer`, `actualizar`, `eliminar`)

3. **Validación de nombre:**
   - No permitir nombres vacíos
   - Normalizar a minúsculas
   - Validar unicidad (si el nombre cambia)

4. **Validación de estado:**
   - Aceptar valores: `true`, `false`, `"Activo"`, `"activo"`, `"Inactivo"`, `"inactivo"`, `1`, `0`
   - Normalizar a booleano

## 🧪 CASOS DE PRUEBA

### Caso 1: Actualizar solo nombre y estado (sin permisos)
```http
PUT /api/gestion-roles/4
{
  "nombre": "Supervisor Senior",
  "estado": true
}
```
**Resultado esperado:** Solo se actualiza nombre y estado, permisos se mantienen.

### Caso 2: Actualizar solo permisos (sin nombre ni estado)
```http
PUT /api/gestion-roles/4
{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```
**Resultado esperado:** Solo se actualizan permisos, nombre y estado se mantienen.

### Caso 3: Actualizar todo (nombre, estado y permisos)
```http
PUT /api/gestion-roles/4
{
  "nombre": "Supervisor Senior",
  "estado": "Activo",
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    }
  }
}
```
**Resultado esperado:** Se actualizan todos los campos proporcionados.

### Caso 4: Quitar todos los permisos
```http
PUT /api/gestion-roles/4
{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```
**Resultado esperado:** El rol queda sin permisos asignados.

### Caso 5: Rol no encontrado
```http
PUT /api/gestion-roles/999
{
  "nombre": "Nuevo Rol"
}
```
**Resultado esperado:** 404 con mensaje "Rol no encontrado".

## 📝 NOTAS IMPORTANTES

1. **Compatibilidad hacia atrás:**
   - El endpoint debe seguir funcionando si solo se envía `nombre` y `estado` (comportamiento actual)
   - Los permisos son opcionales en el body

2. **Manejo de relaciones:**
   - Al actualizar permisos, se deben eliminar las relaciones antiguas y crear las nuevas
   - Usar transacciones para asegurar consistencia

3. **Formato de respuesta:**
   - La respuesta debe seguir el formato granular del frontend
   - Todos los módulos deben estar presentes en la respuesta (aunque sean `false`)

4. **Logging:**
   - Agregar logs para debugging
   - Registrar cambios en permisos para auditoría

## 🚀 PRIORIDAD

**ALTA** - Esta funcionalidad es crítica para la gestión completa de roles desde el frontend.

## 📅 FECHA DE SOLICITUD

Fecha: Noviembre 2025

---

**Nota:** Este prompt está basado en la documentación actual de la API (`documentacion api.md`) y en los formatos utilizados por el frontend (`rolesApiService.js` y `editarRol.jsx`).

