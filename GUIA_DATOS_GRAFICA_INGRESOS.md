# 📊 Guía: Datos Necesarios para la Gráfica de Ingresos

## 🎯 Objetivo
Esta guía explica qué datos necesitas ingresar en la base de datos para que la gráfica de ingresos (`GraficaIngresosPie`) muestre información.

## 📋 Estructura de Datos Requerida

### 1. **Tablas Necesarias**

La gráfica de ingresos utiliza datos de las siguientes tablas:
- `ordenes_servicio` - Órdenes de servicio creadas
- `servicios` - Servicios disponibles
- `gestion_pagos` - Pagos procesados
- `clientes` - Clientes asociados

### 2. **Datos Mínimos Requeridos**

Para que la gráfica muestre datos, necesitas:

#### ✅ **Paso 1: Crear Servicios**
```sql
-- Verificar que existan servicios en la tabla servicios
SELECT * FROM servicios;

-- Si no hay servicios, crear algunos:
INSERT INTO servicios (nombre, descripcion_corta, visible_en_landing, created_at, updated_at) VALUES
('Búsqueda de Antecedentes', 'Verificar disponibilidad de marca', true, NOW(), NOW()),
('Certificación de Marca', 'Certificar marca comercial', true, NOW(), NOW()),
('Renovación de Marca', 'Renovar certificación de marca', true, NOW(), NOW()),
('Presentación de Oposición', 'Presentar oposición a marca', true, NOW(), NOW()),
('Cesión de Marca', 'Ceder derechos de marca', true, NOW(), NOW()),
('Ampliación de Alcance', 'Ampliar alcance de certificación', true, NOW(), NOW());
```

#### ✅ **Paso 2: Crear Órdenes de Servicio**
```sql
-- Crear órdenes de servicio asociadas a servicios
-- Estas órdenes deben tener:
-- - id_servicio (ID del servicio)
-- - id_cliente (ID del cliente)
-- - fecha_creacion dentro del período que quieres visualizar (últimos 12 meses por defecto)
-- - estado diferente de 'Anulado'

INSERT INTO ordenes_servicio (
  id_servicio,
  id_cliente,
  estado,
  fecha_creacion,
  created_at,
  updated_at
) VALUES
(1, 1, 'En Proceso', DATE_SUB(NOW(), INTERVAL 2 MONTH), NOW(), NOW()),
(2, 1, 'Finalizado', DATE_SUB(NOW(), INTERVAL 3 MONTH), NOW(), NOW()),
(3, 1, 'En Proceso', DATE_SUB(NOW(), INTERVAL 1 MONTH), NOW(), NOW()),
(1, 2, 'Finalizado', DATE_SUB(NOW(), INTERVAL 4 MONTH), NOW(), NOW()),
(2, 2, 'Finalizado', DATE_SUB(NOW(), INTERVAL 5 MONTH), NOW(), NOW());
```

#### ✅ **Paso 3: Crear Pagos (MÁS IMPORTANTE)**
```sql
-- Crear pagos asociados a las órdenes de servicio
-- Los pagos deben tener:
-- - id_orden_servicio (ID de la orden de servicio)
-- - monto (cantidad del pago en pesos colombianos)
-- - estado = 'Completado' (para que se cuente como ingreso)
-- - fecha_pago dentro del período que quieres visualizar
-- - metodo_pago (opcional pero recomendado)

INSERT INTO gestion_pagos (
  id_orden_servicio,
  monto,
  estado,
  metodo_pago,
  fecha_pago,
  created_at,
  updated_at
) VALUES
-- Pagos para órdenes del último mes
(1, 150000, 'Completado', 'Transferencia bancaria', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW(), NOW()),
(2, 2000000, 'Completado', 'Transferencia bancaria', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW(), NOW()),

-- Pagos para órdenes de 2-3 meses atrás
(3, 800000, 'Completado', 'Efectivo', DATE_SUB(NOW(), INTERVAL 2 MONTH), NOW(), NOW()),
(4, 1500000, 'Completado', 'Transferencia bancaria', DATE_SUB(NOW(), INTERVAL 3 MONTH), NOW(), NOW()),

-- Pagos para órdenes de 4-5 meses atrás
(5, 1200000, 'Completado', 'Transferencia bancaria', DATE_SUB(NOW(), INTERVAL 4 MONTH), NOW(), NOW()),
(1, 500000, 'Completado', 'Efectivo', DATE_SUB(NOW(), INTERVAL 5 MONTH), NOW(), NOW());

-- IMPORTANTE: Los pagos con estado 'Pendiente' o 'Rechazado' NO se cuentan como ingresos
-- Solo los pagos con estado 'Completado' se incluyen en la gráfica
```

### 3. **Estructura de Datos que Espera la API**

La API `/api/dashboard/ingresos` debe devolver una estructura como esta:

```json
{
  "success": true,
  "data": {
    "periodo": "12meses",
    "total_ingresos": 7100000,
    "total_transacciones": 6,
    "ingresos_por_mes": [
      {
        "mes": "2024-11",
        "ingresos": 3500000,
        "servicios": [
          {
            "nombre": "Búsqueda de Antecedentes",
            "ingresos": 150000
          },
          {
            "nombre": "Certificación de Marca",
            "ingresos": 2000000
          }
        ]
      }
    ],
    "ingresos_por_servicio": [
      {
        "nombre": "Certificación de Marca",
        "ingresos": 3500000,
        "porcentaje": 49.3
      },
      {
        "nombre": "Búsqueda de Antecedentes",
        "ingresos": 2000000,
        "porcentaje": 28.2
      },
      {
        "nombre": "Renovación de Marca",
        "ingresos": 800000,
        "porcentaje": 11.3
      },
      {
        "nombre": "Ampliación de Alcance",
        "ingresos": 800000,
        "porcentaje": 11.3
      }
    ]
  }
}
```

## 🔍 Verificación de Datos

### **Consulta SQL para Verificar Pagos**
```sql
-- Verificar pagos completados en el último año
SELECT 
  s.nombre AS servicio,
  SUM(p.monto) AS total_ingresos,
  COUNT(p.id_pago) AS cantidad_pagos
FROM gestion_pagos p
INNER JOIN ordenes_servicio os ON p.id_orden_servicio = os.id_orden_servicio
INNER JOIN servicios s ON os.id_servicio = s.id_servicio
WHERE p.estado = 'Completado'
  AND p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY s.id_servicio, s.nombre
ORDER BY total_ingresos DESC;
```

### **Consulta SQL para Verificar Período Específico**
```sql
-- Verificar pagos en los últimos 6 meses
SELECT 
  s.nombre AS servicio,
  SUM(p.monto) AS total_ingresos,
  COUNT(p.id_pago) AS cantidad_pagos,
  DATE_FORMAT(p.fecha_pago, '%Y-%m') AS mes
FROM gestion_pagos p
INNER JOIN ordenes_servicio os ON p.id_orden_servicio = os.id_orden_servicio
INNER JOIN servicios s ON os.id_servicio = s.id_servicio
WHERE p.estado = 'Completado'
  AND p.fecha_pago >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY s.id_servicio, s.nombre, DATE_FORMAT(p.fecha_pago, '%Y-%m')
ORDER BY mes DESC, total_ingresos DESC;
```

## 📝 Script SQL Completo de Ejemplo

```sql
-- ============================================
-- SCRIPT PARA CREAR DATOS DE PRUEBA
-- ============================================

-- 1. Verificar/Crear servicios
INSERT INTO servicios (nombre, descripcion_corta, visible_en_landing, created_at, updated_at) 
SELECT * FROM (
  SELECT 'Búsqueda de Antecedentes' AS nombre, 'Verificar disponibilidad' AS descripcion_corta, true AS visible_en_landing, NOW() AS created_at, NOW() AS updated_at
  UNION ALL
  SELECT 'Certificación de Marca', 'Certificar marca comercial', true, NOW(), NOW()
  UNION ALL
  SELECT 'Renovación de Marca', 'Renovar certificación', true, NOW(), NOW()
  UNION ALL
  SELECT 'Presentación de Oposición', 'Presentar oposición', true, NOW(), NOW()
  UNION ALL
  SELECT 'Cesión de Marca', 'Ceder derechos', true, NOW(), NOW()
  UNION ALL
  SELECT 'Ampliación de Alcance', 'Ampliar alcance', true, NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE servicios.nombre = tmp.nombre);

-- 2. Obtener IDs de servicios y cliente (ajusta según tus datos)
SET @servicio1 = (SELECT id_servicio FROM servicios WHERE nombre = 'Búsqueda de Antecedentes' LIMIT 1);
SET @servicio2 = (SELECT id_servicio FROM servicios WHERE nombre = 'Certificación de Marca' LIMIT 1);
SET @servicio3 = (SELECT id_servicio FROM servicios WHERE nombre = 'Renovación de Marca' LIMIT 1);
SET @cliente1 = (SELECT id_cliente FROM clientes LIMIT 1);

-- 3. Crear órdenes de servicio (ajusta las fechas según el período que quieres ver)
INSERT INTO ordenes_servicio (id_servicio, id_cliente, estado, fecha_creacion, created_at, updated_at)
SELECT @servicio1, @cliente1, 'Finalizado', DATE_SUB(NOW(), INTERVAL 1 MONTH), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ordenes_servicio WHERE id_servicio = @servicio1 AND id_cliente = @cliente1 LIMIT 1);

-- 4. Crear pagos asociados a las órdenes
-- IMPORTANTE: Los pagos deben tener estado 'Completado' y fecha_pago dentro del período
INSERT INTO gestion_pagos (id_orden_servicio, monto, estado, metodo_pago, fecha_pago, created_at, updated_at)
SELECT 
  os.id_orden_servicio,
  150000 AS monto,
  'Completado' AS estado,
  'Transferencia bancaria' AS metodo_pago,
  DATE_SUB(NOW(), INTERVAL 20 DAY) AS fecha_pago,
  NOW() AS created_at,
  NOW() AS updated_at
FROM ordenes_servicio os
WHERE os.id_servicio = @servicio1
  AND os.id_cliente = @cliente1
  AND NOT EXISTS (
    SELECT 1 FROM gestion_pagos p 
    WHERE p.id_orden_servicio = os.id_orden_servicio 
    AND p.estado = 'Completado'
  )
LIMIT 1;
```

## ⚠️ Puntos Importantes

### **1. Estado de los Pagos**
- ✅ **Estado 'Completado'**: Se cuenta como ingreso
- ❌ **Estado 'Pendiente'**: NO se cuenta como ingreso
- ❌ **Estado 'Rechazado'**: NO se cuenta como ingreso
- ❌ **Estado 'Cancelado'**: NO se cuenta como ingreso

### **2. Período de Tiempo**
- La gráfica muestra datos según el período seleccionado (por defecto: 12 meses)
- Los pagos deben tener `fecha_pago` dentro del período seleccionado
- Si cambias el período en el frontend, se recalculan los ingresos automáticamente

### **3. Relación de Datos**
- Cada pago debe estar asociado a una orden de servicio (`id_orden_servicio`)
- Cada orden de servicio debe estar asociada a un servicio (`id_servicio`)
- Cada orden de servicio debe estar asociada a un cliente (`id_cliente`)

### **4. Montos Mínimos**
- No hay monto mínimo requerido
- Los montos se muestran en pesos colombianos (COP)
- La gráfica suma todos los pagos completados por servicio

## 🧪 Probar los Datos

### **1. Verificar en la Base de Datos**
```sql
-- Ver todos los pagos completados
SELECT 
  p.id_pago,
  p.monto,
  p.estado,
  p.fecha_pago,
  s.nombre AS servicio,
  os.id_orden_servicio
FROM gestion_pagos p
INNER JOIN ordenes_servicio os ON p.id_orden_servicio = os.id_orden_servicio
INNER JOIN servicios s ON os.id_servicio = s.id_servicio
WHERE p.estado = 'Completado'
ORDER BY p.fecha_pago DESC;
```

### **2. Probar el Endpoint de la API**
```bash
# Probar el endpoint directamente
curl -X GET "http://localhost:3000/api/dashboard/ingresos?periodo=12meses" \
  -H "Authorization: Bearer <TU_TOKEN>"
```

### **3. Verificar en el Frontend**
1. Abre el dashboard en el navegador
2. La gráfica de ingresos debería mostrar los datos
3. Si no muestra datos, revisa la consola del navegador para ver los logs
4. Verifica que el período seleccionado coincida con las fechas de tus pagos

## 📊 Estructura de la Respuesta Esperada

La gráfica espera recibir datos en una de estas estructuras:

### **Opción 1: ingresos_por_servicio (Preferida)**
```json
{
  "data": {
    "ingresos_por_servicio": [
      { "nombre": "Certificación de Marca", "ingresos": 2000000 },
      { "nombre": "Búsqueda de Antecedentes", "ingresos": 150000 }
    ]
  }
}
```

### **Opción 2: ingresos_por_mes con servicios**
```json
{
  "data": {
    "ingresos_por_mes": [
      {
        "mes": "2024-11",
        "servicios": [
          { "nombre": "Certificación de Marca", "ingresos": 2000000 },
          { "nombre": "Búsqueda de Antecedentes", "ingresos": 150000 }
        ]
      }
    ]
  }
}
```

### **Opción 3: servicios directo**
```json
{
  "data": {
    "servicios": [
      { "nombre": "Certificación de Marca", "ingresos": 2000000 },
      { "nombre": "Búsqueda de Antecedentes", "ingresos": 150000 }
    ]
  }
}
```

## ✅ Checklist de Verificación

- [ ] Existen servicios en la tabla `servicios`
- [ ] Existen órdenes de servicio en la tabla `ordenes_servicio`
- [ ] Las órdenes de servicio están asociadas a servicios (`id_servicio`)
- [ ] Existen pagos en la tabla `gestion_pagos`
- [ ] Los pagos tienen estado `'Completado'`
- [ ] Los pagos están asociados a órdenes de servicio (`id_orden_servicio`)
- [ ] Las fechas de pago (`fecha_pago`) están dentro del período seleccionado
- [ ] Los montos de los pagos son mayores a 0
- [ ] El endpoint `/api/dashboard/ingresos` devuelve datos con `success: true`

## 🚀 Siguiente Paso

Una vez que tengas los datos en la base de datos:
1. Recarga la página del dashboard
2. La gráfica debería mostrar los ingresos por servicio
3. Puedes cambiar el período para ver diferentes rangos de tiempo
4. Los datos se actualizan automáticamente al cambiar el período

---

**Nota**: Si después de ingresar los datos la gráfica aún no muestra información, verifica:
1. Que el backend esté funcionando correctamente
2. Que el endpoint `/api/dashboard/ingresos` devuelva datos
3. Que las fechas de los pagos estén dentro del período seleccionado
4. Que los pagos tengan estado `'Completado'`

