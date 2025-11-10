# 🚨 CORRECCIÓN URGENTE: Columna `tipo_documento_cesionario` Demasiado Pequeña

## PROBLEMA

El backend está rechazando solicitudes de "Cesión de Marca" con el error:

```
"Data too long for column 'tipo_documento_cesionario' at row 1"
```

### Causa:

La columna `tipo_documento_cesionario` en la base de datos es demasiado pequeña para almacenar valores como:
- "Cédula de Ciudadanía" (22 caracteres)
- "Cédula de Extranjería" (22 caracteres)
- "Pasaporte" (9 caracteres)
- "Tarjeta de Identidad" (20 caracteres)

**Valor enviado:**
```json
{
  "tipo_documento_cesionario": "Cédula de Ciudadanía"
}
```

**Tamaño:** 22 caracteres

**Columna actual:** Probablemente `VARCHAR(20)` o menor

---

## ✅ SOLUCIÓN

Cambiar el tipo de columna `tipo_documento_cesionario` (y otras columnas relacionadas) a `VARCHAR(50)` o más grande.

### Comando SQL:

```sql
-- Cambiar tipo_documento_cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN tipo_documento_cesionario VARCHAR(50);

-- Verificar cambio
SHOW COLUMNS FROM orden_servicios WHERE Field = 'tipo_documento_cesionario';
```

---

## 🔍 VERIFICACIÓN DE OTRAS COLUMNAS

Revisar y corregir también estas columnas relacionadas con el cesionario que podrían tener el mismo problema:

### Columnas del Cesionario:
```sql
-- Verificar tamaño actual de columnas del cesionario
SHOW COLUMNS FROM orden_servicios 
WHERE Field IN (
  'tipo_documento_cesionario',
  'numero_documento_cesionario',
  'nombre_razon_social_cesionario',
  'representante_legal_cesionario',
  'nit_cesionario',
  'correo_cesionario',
  'telefono_cesionario',
  'direccion_cesionario'
);
```

### Comandos SQL Recomendados:

```sql
-- Tipo de documento del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN tipo_documento_cesionario VARCHAR(50);

-- Número de documento del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN numero_documento_cesionario VARCHAR(20);

-- Nombre o razón social del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN nombre_razon_social_cesionario VARCHAR(100);

-- Representante legal del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN representante_legal_cesionario VARCHAR(100);

-- NIT del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN nit_cesionario VARCHAR(20);

-- Correo del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN correo_cesionario VARCHAR(100);

-- Teléfono del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN telefono_cesionario VARCHAR(20);

-- Dirección del cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN direccion_cesionario VARCHAR(500);
```

---

## 📊 TAMAÑOS RECOMENDADOS

| Campo | Tamaño Recomendado | Razón |
|-------|-------------------|-------|
| `tipo_documento_cesionario` | `VARCHAR(50)` | Valores como "Cédula de Ciudadanía" (22 caracteres) |
| `numero_documento_cesionario` | `VARCHAR(20)` | Números de documento (máximo 20 dígitos) |
| `nombre_razon_social_cesionario` | `VARCHAR(100)` | Nombres completos o razones sociales |
| `representante_legal_cesionario` | `VARCHAR(100)` | Nombres completos |
| `nit_cesionario` | `VARCHAR(20)` | NITs (máximo 15 dígitos) |
| `correo_cesionario` | `VARCHAR(100)` | Correos electrónicos |
| `telefono_cesionario` | `VARCHAR(20)` | Números de teléfono |
| `direccion_cesionario` | `VARCHAR(500)` | Direcciones completas |

---

## 🧪 VERIFICACIÓN

Después de aplicar los cambios:

1. **Verificar columnas:**
```sql
SHOW COLUMNS FROM orden_servicios 
WHERE Field LIKE '%cesionario%';
```

2. **Probar creación de solicitud:**
   - Crear solicitud de Cesión de Marca
   - Usar `tipo_documento_cesionario: "Cédula de Ciudadanía"`
   - Verificar que se guarda correctamente

---

## ⚠️ NOTA IMPORTANTE

Este error es **diferente** al problema de validación condicional. Este es un problema de tamaño de columna en la base de datos.

**Problemas identificados en Cesión de Marca:**
1. ✅ **Tamaño de columna** (este documento) - `tipo_documento_cesionario` muy pequeña
2. ⚠️ **Validación condicional** (verificar) - Posible problema con campos de jurídica para tipo "Natural"

---

## 🔄 PASOS PARA IMPLEMENTAR

1. **Conectar a la base de datos:**
```bash
mysql -u [usuario] -p [nombre_base_datos]
```

2. **Ejecutar comandos SQL:**
```sql
-- Verificar columnas actuales
SHOW COLUMNS FROM orden_servicios WHERE Field LIKE '%cesionario%';

-- Aplicar cambios
ALTER TABLE orden_servicios 
MODIFY COLUMN tipo_documento_cesionario VARCHAR(50);

-- Verificar cambios
SHOW COLUMNS FROM orden_servicios WHERE Field = 'tipo_documento_cesionario';
```

3. **Probar:** Crear solicitud de Cesión de Marca con tipo "Natural"

---

## ✅ RESULTADO ESPERADO

Después de aplicar esta corrección:

- ✅ Las solicitudes de Cesión de Marca se guardarán correctamente
- ✅ El campo `tipo_documento_cesionario` aceptará valores como "Cédula de Ciudadanía"
- ✅ No habrá más errores de "Data too long for column"

---

**Prioridad:** 🔴 **CRÍTICA**  
**Tiempo estimado:** 5 minutos  
**Impacto:** Resuelve el error en Cesión de Marca  
**Relacionado con:** Problemas similares de columnas pequeñas en otros servicios

