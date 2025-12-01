# 📝 Ejemplo de Uso: ExcelService con Logo y Colores de la App

## ✅ Características Implementadas

- ✅ **Logo de la empresa** incluido en todos los Excel
- ✅ **Colores corporativos** de la app (#174B8A)
- ✅ **Diseño consistente** en todos los reportes
- ✅ **Título opcional** del reporte

---

## 🎨 Colores de la App

Los Excel ahora usan los colores oficiales de la app:

- **Encabezados**: Azul #174B8A (color principal de la app)
- **Filas pares**: Gris claro #F2F2F2
- **Filas impares**: Blanco #FFFFFF
- **Bordes**: Gris #D0D0D0

---

## 📋 Ejemplo Básico

```javascript
import excelService from '@/shared/services/excelService';

const exportarExcel = () => {
  const encabezados = ['Titular', 'Email', 'Teléfono', 'Estado'];
  const datosExcel = datosFiltrados.map(item => ({
    Titular: item.titular || '',
    Email: item.email || '',
    Teléfono: item.telefono || '',
    Estado: item.estado || ''
  }));

  excelService.generarExcel(
    datosExcel,
    encabezados,
    {
      nombreHoja: 'Solicitudes',
      nombreArchivo: excelService.generarNombreArchivo('solicitudes')
    }
  );
};
```

**Resultado**: Excel con logo, colores de la app y diseño consistente ✅

---

## 📋 Ejemplo con Título

```javascript
excelService.generarExcel(
  datosExcel,
  encabezados,
  {
    nombreHoja: 'Reporte de Citas',
    nombreArchivo: excelService.generarNombreArchivo('citas'),
    titulo: 'Reporte Mensual de Citas - Enero 2025' // Título opcional
  }
);
```

**Resultado**: Excel con título, logo y colores ✅

---

## 📋 Ejemplo Completo (Solicitudes)

```javascript
import excelService from '@/shared/services/excelService';
import { ANCHOS_COLUMNA } from '@/shared/utils/excelStyles';

const exportarExcel = () => {
  const encabezados = [
    'Titular', 'Email', 'Teléfono', 'Tipo de Solicitud', 
    'Estado', 'Encargado', 'Fecha Solicitud'
  ];
  
  const datosExcel = datosFiltrados.map(item => ({
    Titular: item.titular || '',
    Email: item.email || '',
    Teléfono: item.telefono || '',
    'Tipo de Solicitud': item.tipoSolicitud || '',
    Estado: item.estado || '',
    Encargado: item.encargado || '',
    'Fecha Solicitud': item.fechaSolicitud || ''
  }));

  const anchosColumnas = [
    ANCHOS_COLUMNA.NOMBRE,    // Titular
    ANCHOS_COLUMNA.EMAIL,     // Email
    ANCHOS_COLUMNA.TELEFONO,  // Teléfono
    ANCHOS_COLUMNA.SERVICIO,  // Tipo de Solicitud
    ANCHOS_COLUMNA.ESTADO,    // Estado
    ANCHOS_COLUMNA.NOMBRE,    // Encargado
    ANCHOS_COLUMNA.FECHA      // Fecha Solicitud
  ];

  excelService.generarExcel(
    datosExcel,
    encabezados,
    {
      nombreHoja: 'Solicitudes en Proceso',
      nombreArchivo: excelService.generarNombreArchivo('solicitudes_proceso'),
      anchosColumnas,
      titulo: 'Reporte de Solicitudes en Proceso',
      incluirLogo: true, // Por defecto es true
      filasAlternadas: true // Por defecto es true
    }
  );
};
```

---

## ⚙️ Opciones de Configuración

### Todas las opciones disponibles:

```javascript
excelService.generarExcel(
  datos,
  encabezados,
  {
    // Nombre de la hoja de Excel
    nombreHoja: 'Datos', // default: 'Datos'
    
    // Nombre del archivo
    nombreArchivo: 'reporte.xlsx', // default: 'reporte.xlsx'
    
    // Anchos de columna personalizados
    anchosColumnas: [25, 30, 15, 20], // default: 20 para todas
    
    // Filas alternadas (gris/blanco)
    filasAlternadas: true, // default: true
    
    // Incluir fecha en el nombre del archivo
    incluirFecha: true, // default: true
    
    // Incluir logo de la empresa
    incluirLogo: true, // default: true
    
    // Título del reporte (opcional)
    titulo: 'Mi Reporte Personalizado' // default: null
  }
);
```

---

## 🚫 Deshabilitar Logo

Si por alguna razón no quieres el logo:

```javascript
excelService.generarExcel(
  datosExcel,
  encabezados,
  {
    incluirLogo: false // Sin logo
  }
);
```

---

## 📊 Estructura del Excel Generado

```
┌─────────────────────────────────────┐
│ Título del Reporte (opcional)       │
├─────────────────────────────────────┤
│ [LOGO DE LA EMPRESA]                │
├─────────────────────────────────────┤
│ Encabezado 1 │ Encabezado 2 │ ...   │ ← Azul #174B8A, texto blanco
├─────────────────────────────────────┤
│ Dato 1      │ Dato 2      │ ...   │ ← Blanco
│ Dato 3      │ Dato 4      │ ...   │ ← Gris claro #F2F2F2
│ Dato 5      │ Dato 6      │ ...   │ ← Blanco
│ ...                                 │
└─────────────────────────────────────┘
```

---

## 🔄 Migración desde Código Antiguo

### Antes (XLSX - sin logo, colores diferentes):

```javascript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const exportarExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(datosExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, 'reporte.xlsx');
};
```

### Después (ExcelService - con logo y colores):

```javascript
import excelService from '@/shared/services/excelService';

const exportarExcel = async () => {
  await excelService.generarExcel(
    datosExcel,
    encabezados,
    {
      nombreArchivo: excelService.generarNombreArchivo('reporte')
    }
  );
};
```

**Nota**: La función ahora es `async` porque carga el logo.

---

## ⚠️ Notas Importantes

1. **Función async**: `generarExcel` ahora es asíncrona porque carga el logo
2. **Logo**: Se carga desde `/images/logo.png` (debe estar en `public/images/`)
3. **Colores**: Todos los Excel usan los mismos colores de la app
4. **Compatibilidad**: ExcelJS es más potente que XLSX y permite imágenes

---

## 🎯 Ventajas del Nuevo Sistema

| Característica | Antes (XLSX) | Ahora (ExcelJS) |
|----------------|-------------|-----------------|
| Logo | ❌ No | ✅ Sí |
| Colores de la app | ⚠️ Diferentes | ✅ Consistentes |
| Título opcional | ❌ No | ✅ Sí |
| Imágenes | ❌ No | ✅ Sí |
| Estilos avanzados | ⚠️ Limitados | ✅ Completos |

---

**Última actualización**: Enero 2025

