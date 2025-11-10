# 🚨 CORRECCIÓN: Columna `tipo_documento_cesionario` Demasiado Pequeña

## PROBLEMA

Error en Cesión de Marca:
```
"Data too long for column 'tipo_documento_cesionario' at row 1"
```

**Causa:** La columna `tipo_documento_cesionario` es muy pequeña (probablemente VARCHAR(20)) y no puede almacenar "Cédula de Ciudadanía" (22 caracteres).

## SOLUCIÓN

Cambiar el tipo de columna a `VARCHAR(50)`:

```sql
-- Cambiar tipo_documento_cesionario
ALTER TABLE orden_servicios 
MODIFY COLUMN tipo_documento_cesionario VARCHAR(50);

-- Verificar cambio
SHOW COLUMNS FROM orden_servicios WHERE Field = 'tipo_documento_cesionario';
```

## VERIFICAR OTRAS COLUMNAS DEL CESIONARIO

Revisar y corregir también estas columnas relacionadas:

```sql
-- Verificar tamaño actual
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

-- Aplicar cambios recomendados
ALTER TABLE orden_servicios 
MODIFY COLUMN tipo_documento_cesionario VARCHAR(50),
MODIFY COLUMN numero_documento_cesionario VARCHAR(20),
MODIFY COLUMN nombre_razon_social_cesionario VARCHAR(100),
MODIFY COLUMN representante_legal_cesionario VARCHAR(100),
MODIFY COLUMN nit_cesionario VARCHAR(20),
MODIFY COLUMN correo_cesionario VARCHAR(100),
MODIFY COLUMN telefono_cesionario VARCHAR(20),
MODIFY COLUMN direccion_cesionario VARCHAR(500);
```

## TAMAÑOS RECOMENDADOS

- `tipo_documento_cesionario`: VARCHAR(50) - Para valores como "Cédula de Ciudadanía"
- `numero_documento_cesionario`: VARCHAR(20)
- `nombre_razon_social_cesionario`: VARCHAR(100)
- `representante_legal_cesionario`: VARCHAR(100)
- `nit_cesionario`: VARCHAR(20)
- `correo_cesionario`: VARCHAR(100)
- `telefono_cesionario`: VARCHAR(20)
- `direccion_cesionario`: VARCHAR(500)

## PRIORIDAD

🔴 **CRÍTICA** - El formulario no funciona

---

Ver documento completo: `PROMPT_BACKEND_CESION_COLUMNA_PEQUENA.md`

