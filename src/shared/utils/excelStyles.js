/**
 * Estilos estándar para archivos Excel
 * Estos estilos se aplican a todos los reportes para mantener consistencia
 * 
 * Colores corporativos de la app:
 * - Azul encabezado: #174B8A (azul oscuro principal de la app)
 * - Azul alternativo: #083874 (azul más oscuro)
 * - Gris filas pares: #F2F2F2
 * - Blanco filas impares: #FFFFFF
 * - Bordes: #D0D0D0
 */
export const EXCEL_STYLES = {
  // Estilo para encabezados - Usando color principal de la app
  ENCABEZADO: {
    font: {
      bold: true,
      color: { rgb: 'FFFFFF' },
      sz: 11
    },
    fill: {
      fgColor: { rgb: '174B8A' } // Azul corporativo de la app (#174B8A)
    },
    alignment: {
      horizontal: 'center',
      vertical: 'center',
      wrapText: true
    },
    border: {
      top: { style: 'thin', color: { rgb: '174B8A' } },
      bottom: { style: 'thin', color: { rgb: '174B8A' } },
      left: { style: 'thin', color: { rgb: '174B8A' } },
      right: { style: 'thin', color: { rgb: '174B8A' } }
    }
  },

  // Estilo para filas impares (blanco)
  FILA_IMPAR: {
    font: {
      color: { rgb: '000000' },
      sz: 10
    },
    fill: {
      fgColor: { rgb: 'FFFFFF' }
    },
    alignment: {
      vertical: 'center',
      wrapText: true
    },
    border: {
      top: { style: 'thin', color: { rgb: 'D0D0D0' } },
      bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
      left: { style: 'thin', color: { rgb: 'D0D0D0' } },
      right: { style: 'thin', color: { rgb: 'D0D0D0' } }
    }
  },

  // Estilo para filas pares (gris claro)
  FILA_PAR: {
    font: {
      color: { rgb: '000000' },
      sz: 10
    },
    fill: {
      fgColor: { rgb: 'F2F2F2' }
    },
    alignment: {
      vertical: 'center',
      wrapText: true
    },
    border: {
      top: { style: 'thin', color: { rgb: 'D0D0D0' } },
      bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
      left: { style: 'thin', color: { rgb: 'D0D0D0' } },
      right: { style: 'thin', color: { rgb: 'D0D0D0' } }
    }
  }
};

/**
 * Anchos de columna estándar por tipo de dato
 * Usar estos valores para mantener consistencia en todas las tablas
 */
export const ANCHOS_COLUMNA = {
  ID: 10,
  NOMBRE: 25,
  EMAIL: 30,
  TELEFONO: 15,
  DOCUMENTO: 15,
  FECHA: 15,
  ESTADO: 15,
  DESCRIPCION: 50,
  COMENTARIOS: 60,
  DIRECCION: 35,
  MARCA: 30,
  SERVICIO: 25,
  MONTO: 15,
  TIPO: 20
};

