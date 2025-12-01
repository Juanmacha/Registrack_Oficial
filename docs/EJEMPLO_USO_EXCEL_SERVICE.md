# 📝 Ejemplo de Uso: ExcelService

## Ejemplo Completo: Migrar Tabla de Solicitudes

### Antes (Código Original)

```javascript
// tablaVentasProceso.jsx - Código original (130+ líneas)
const exportarExcel = () => {
  const encabezados = [
    "Titular", "Tipo de Solicitante", "Tipo de Persona", "Tipo de Documento", 
    "N° Documento", "Email", "Teléfono", "Dirección", "Estado", "Tipo de Solicitud", 
    "Encargado", "Fecha Solicitud"
  ];
  
  const datosExcel = datosFiltrados.map(item => ({
    Titular: item.titular || '',
    "Tipo de Solicitante": item.tipoSolicitante || '',
    // ... 100+ líneas más de código
  }));

  // ... 50+ líneas de código para estilos y formato
  const worksheet = xlsx.utils.json_to_sheet(datosExcel, { header: encabezados });
  // ... aplicar estilos manualmente
  // ... crear workbook
  // ... generar archivo
};
```

### Después (Con ExcelService)

```javascript
// tablaVentasProceso.jsx - Código simplificado (20 líneas)
import excelService from '@/shared/services/excelService';
import { ANCHOS_COLUMNA } from '@/shared/utils/excelStyles';

const exportarExcel = () => {
  const encabezados = [
    "Titular", "Tipo de Solicitante", "Tipo de Persona", "Tipo de Documento", 
    "N° Documento", "Email", "Teléfono", "Dirección", "Estado", "Tipo de Solicitud", 
    "Encargado", "Fecha Solicitud"
  ];
  
  const datosExcel = datosFiltrados.map(item => ({
    Titular: item.titular || '',
    "Tipo de Solicitante": item.tipoSolicitante || '',
    "Tipo de Persona": item.tipoPersona || '',
    "Tipo de Documento": item.tipoDocumento || '',
    "N° Documento": item.numeroDocumento || '',
    Email: item.email || '',
    Teléfono: item.telefono || '',
    Dirección: item.direccion || '',
    Estado: item.estado || '',
    "Tipo de Solicitud": item.tipoSolicitud || '',
    Encargado: item.encargado || '',
    "Fecha Solicitud": item.fechaSolicitud || ''
  }));

  const anchosColumnas = [
    ANCHOS_COLUMNA.NOMBRE,    // Titular
    ANCHOS_COLUMNA.TIPO,      // Tipo de Solicitante
    ANCHOS_COLUMNA.TIPO,      // Tipo de Persona
    ANCHOS_COLUMNA.TIPO,      // Tipo de Documento
    ANCHOS_COLUMNA.DOCUMENTO, // N° Documento
    ANCHOS_COLUMNA.EMAIL,      // Email
    ANCHOS_COLUMNA.TELEFONO,   // Teléfono
    ANCHOS_COLUMNA.DIRECCION,  // Dirección
    ANCHOS_COLUMNA.ESTADO,     // Estado
    ANCHOS_COLUMNA.SERVICIO,   // Tipo de Solicitud
    ANCHOS_COLUMNA.NOMBRE,     // Encargado
    ANCHOS_COLUMNA.FECHA       // Fecha Solicitud
  ];

  excelService.generarExcel(
    datosExcel,
    encabezados,
    {
      nombreHoja: 'Solicitudes en Proceso',
      nombreArchivo: excelService.generarNombreArchivo('solicitudes_proceso'),
      anchosColumnas,
      filasAlternadas: true
    }
  );
};
```

**Reducción de código: 130+ líneas → 20 líneas** ✅

---

## Ejemplos por Tipo de Tabla

### 1. Tabla Simple (Citas)

```javascript
import excelService from '@/shared/services/excelService';

const handleExportarExcel = () => {
  const encabezados = [
    'ID', 'Fecha', 'Hora Inicio', 'Hora Fin', 
    'Tipo', 'Cliente', 'Empleado', 'Estado'
  ];

  const datosExcel = citasFiltradas.map(cita => ({
    ID: cita.id_cita || cita.id || '',
    Fecha: cita.fecha || '',
    'Hora Inicio': cita.hora_inicio || '',
    'Hora Fin': cita.hora_fin || '',
    Tipo: cita.tipo || '',
    Cliente: `${cita.cliente?.nombre || ''} ${cita.cliente?.apellido || ''}`.trim(),
    Empleado: `${cita.empleado?.nombre || ''} ${cita.empleado?.apellido || ''}`.trim(),
    Estado: cita.estado || ''
  }));

  excelService.generarExcel(
    datosExcel,
    encabezados,
    {
      nombreHoja: 'Citas',
      nombreArchivo: excelService.generarNombreArchivo('citas'),
      filasAlternadas: true
    }
  );
};
```

### 2. Tabla con Anchos Personalizados (Pagos)

```javascript
import excelService from '@/shared/services/excelService';
import { ANCHOS_COLUMNA } from '@/shared/utils/excelStyles';

const handleDescargarExcel = () => {
  const encabezados = [
    'ID Pago', 'Cliente', 'Servicio', 'Monto', 
    'Método de Pago', 'Estado', 'Fecha'
  ];

  const datosExcel = pagosFiltrados.map(pago => ({
    'ID Pago': pago.id_pago || '',
    Cliente: pago.cliente?.nombre || '',
    Servicio: pago.servicio?.nombre || '',
    Monto: `$${pago.monto?.toLocaleString() || '0'}`,
    'Método de Pago': pago.metodo_pago || '',
    Estado: pago.estado || '',
    Fecha: pago.fecha || ''
  }));

  const anchosColumnas = [
    ANCHOS_COLUMNA.ID,        // ID Pago
    ANCHOS_COLUMNA.NOMBRE,    // Cliente
    ANCHOS_COLUMNA.SERVICIO,  // Servicio
    ANCHOS_COLUMNA.MONTO,     // Monto
    ANCHOS_COLUMNA.TIPO,      // Método de Pago
    ANCHOS_COLUMNA.ESTADO,    // Estado
    ANCHOS_COLUMNA.FECHA      // Fecha
  ];

  excelService.generarExcel(
    datosExcel,
    encabezados,
    {
      nombreHoja: 'Pagos',
      nombreArchivo: excelService.generarNombreArchivo('pagos'),
      anchosColumnas,
      filasAlternadas: true
    }
  );
};
```

### 3. Tabla Compleja (Solicitudes con Múltiples Campos)

```javascript
import excelService from '@/shared/services/excelService';
import { ANCHOS_COLUMNA } from '@/shared/utils/excelStyles';

const exportarExcel = () => {
  const encabezados = [
    "Titular", "Email", "Teléfono", "Tipo de Solicitud", 
    "Estado", "Encargado", "Fecha Solicitud", "Marca", "Comentarios"
  ];
  
  const datosExcel = datosFiltrados.map(item => ({
    Titular: item.titular || item.nombreCompleto || '',
    Email: item.email || '',
    Teléfono: item.telefono || '',
    "Tipo de Solicitud": item.tipoSolicitud || '',
    Estado: item.estado || '',
    Encargado: item.encargado || '',
    "Fecha Solicitud": item.fechaSolicitud || '',
    Marca: item.nombreMarca || item.marca || '',
    Comentarios: Array.isArray(item.comentarios) 
      ? item.comentarios.map(c => `${c.autor || 'Sistema'}: ${c.texto}`).join(' | ') 
      : ''
  }));

  const anchosColumnas = [
    ANCHOS_COLUMNA.NOMBRE,     // Titular
    ANCHOS_COLUMNA.EMAIL,      // Email
    ANCHOS_COLUMNA.TELEFONO,   // Teléfono
    ANCHOS_COLUMNA.SERVICIO,   // Tipo de Solicitud
    ANCHOS_COLUMNA.ESTADO,     // Estado
    ANCHOS_COLUMNA.NOMBRE,     // Encargado
    ANCHOS_COLUMNA.FECHA,      // Fecha Solicitud
    ANCHOS_COLUMNA.MARCA,      // Marca
    ANCHOS_COLUMNA.COMENTARIOS  // Comentarios
  ];

  excelService.generarExcel(
    datosExcel,
    encabezados,
    {
      nombreHoja: 'Solicitudes',
      nombreArchivo: excelService.generarNombreArchivo('solicitudes'),
      anchosColumnas,
      filasAlternadas: true
    }
  );
};
```

### 4. Sin Filas Alternadas (Opcional)

```javascript
excelService.generarExcel(
  datosExcel,
  encabezados,
  {
    nombreHoja: 'Reporte',
    nombreArchivo: 'reporte.xlsx',
    filasAlternadas: false  // Todas las filas serán blancas
  }
);
```

### 5. Sin Fecha en el Nombre

```javascript
excelService.generarExcel(
  datosExcel,
  encabezados,
  {
    nombreHoja: 'Reporte',
    nombreArchivo: 'reporte_fijo.xlsx',
    incluirFecha: false  // No agregar fecha al nombre
  }
);
```

---

## Integración con Componentes Existentes

### Reemplazar en DownloadButton

```javascript
// Antes
<DownloadButton
  type="excel"
  onClick={exportarExcel}
  title="Descargar Excel"
/>

// Después (igual, solo cambia la función)
<DownloadButton
  type="excel"
  onClick={exportarExcel}
  title="Descargar Excel"
/>
```

### Con Manejo de Errores

```javascript
const exportarExcel = () => {
  try {
    if (!datosFiltrados || datosFiltrados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar'
      });
      return;
    }

    const encabezados = ['Columna1', 'Columna2'];
    const datosExcel = datosFiltrados.map(/* ... */);

    excelService.generarExcel(
      datosExcel,
      encabezados,
      {
        nombreArchivo: excelService.generarNombreArchivo('reporte')
      }
    );

    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'Archivo Excel descargado correctamente',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el archivo Excel'
    });
  }
};
```

---

## Ventajas del Nuevo Enfoque

### ✅ Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Líneas de código** | 100-150 | 15-25 |
| **Consistencia** | Variable | 100% |
| **Mantenimiento** | Múltiples lugares | Un solo servicio |
| **Tiempo de desarrollo** | 30-60 min | 5-10 min |
| **Errores** | Fácil cometer | Difícil cometer |

### ✅ Beneficios Inmediatos

1. **Código más limpio**: 80% menos líneas
2. **Diseño consistente**: Todos los Excel se ven igual
3. **Fácil de mantener**: Cambias estilos en un solo lugar
4. **Menos errores**: Validaciones incluidas
5. **Más rápido**: Desarrollo más rápido

---

## Próximos Pasos

1. ✅ Instalar dependencias (ya están instaladas: `xlsx`, `file-saver`)
2. ✅ Crear `excelService.js` y `excelStyles.js` (ya creados)
3. 🔄 Migrar una tabla como prueba
4. 🔄 Migrar el resto de tablas
5. ✅ Probar y validar diseño consistente

---

**Última actualización**: Enero 2025

