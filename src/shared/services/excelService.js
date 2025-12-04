import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { EXCEL_STYLES } from '../utils/excelStyles';

/**
 * Servicio centralizado para generar archivos Excel con diseño consistente
 * Incluye logo de la empresa y colores corporativos
 * 
 * @example
 * import excelService from '@/shared/services/excelService';
 * 
 * const datos = [
 *   { Nombre: 'Juan', Email: 'juan@email.com' },
 *   { Nombre: 'María', Email: 'maria@email.com' }
 * ];
 * 
 * excelService.generarExcel(
 *   datos,
 *   ['Nombre', 'Email'],
 *   { nombreArchivo: 'clientes.xlsx' }
 * );
 */
class ExcelService {
  /**
   * Genera un archivo Excel con diseño estándar, logo y colores de la app
   * 
   * @param {Array<Object>} datos - Array de objetos con los datos a exportar
   * @param {Array<string>} encabezados - Array de strings con los nombres de las columnas
   * @param {Object} config - Configuración adicional
   * @param {string} config.nombreHoja - Nombre de la hoja (default: "Datos")
   * @param {string} config.nombreArchivo - Nombre del archivo (default: "reporte.xlsx")
   * @param {Array<number>} config.anchosColumnas - Array de anchos personalizados para cada columna
   * @param {boolean} config.filasAlternadas - Aplicar colores alternados (default: true)
   * @param {boolean} config.incluirFecha - Incluir fecha en el nombre del archivo (default: true)
   * @param {boolean} config.incluirLogo - Incluir logo de la empresa (default: true)
   * @param {string} config.titulo - Título del reporte (se muestra arriba del logo)
   */
  async generarExcel(datos, encabezados, config = {}) {
    const {
      nombreHoja = 'Datos',
      nombreArchivo = 'reporte.xlsx',
      anchosColumnas = null,
      filasAlternadas = true,
      incluirFecha = true,
      incluirLogo = true,
      titulo = null
    } = config;

    // Validar que hay datos
    if (!datos || datos.length === 0) {
      console.warn('⚠️ [ExcelService] No hay datos para exportar');
      return;
    }

    // Validar que los encabezados coinciden con las claves de los datos
    const primeraFila = datos[0];
    const clavesDisponibles = Object.keys(primeraFila);
    const encabezadosValidos = encabezados.filter(enc => clavesDisponibles.includes(enc));
    
    if (encabezadosValidos.length === 0) {
      console.error('❌ [ExcelService] Los encabezados no coinciden con los datos');
      return;
    }

    try {
      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(nombreHoja);

      let filaInicio = 1;

      // Agregar logo y título si está habilitado
      if (incluirLogo || titulo) {
        filaInicio = await this._agregarEncabezado(worksheet, titulo, incluirLogo, workbook, encabezados.length);
      }

      // Agregar encabezados de columnas
      worksheet.addRow(encabezados);
      const filaEncabezados = worksheet.getRow(filaInicio);
      
      // Aplicar estilos a encabezados
      this._aplicarEstiloEncabezados(filaEncabezados, encabezados.length);

      // Agregar datos
      datos.forEach((fila, index) => {
        const valores = encabezados.map(enc => fila[enc] || '');
        const filaDatos = worksheet.addRow(valores);
        
        // Aplicar estilos a filas de datos
        const esFilaPar = index % 2 === 0;
        this._aplicarEstiloFila(filaDatos, encabezados.length, filasAlternadas && esFilaPar);
      });

      // Aplicar anchos de columna
      if (anchosColumnas && Array.isArray(anchosColumnas)) {
        anchosColumnas.forEach((ancho, index) => {
          worksheet.getColumn(index + 1).width = ancho;
        });
      } else {
        // Anchos automáticos
        encabezados.forEach((_, index) => {
          worksheet.getColumn(index + 1).width = 20;
        });
      }

      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Generar nombre de archivo con fecha si está habilitado
      let nombreFinal = nombreArchivo;
      if (incluirFecha && !nombreArchivo.includes('_')) {
        nombreFinal = this.generarNombreArchivo(nombreArchivo.replace('.xlsx', ''));
      }

      // Descargar
      saveAs(blob, nombreFinal);
      
      console.log('✅ [ExcelService] Archivo Excel generado:', nombreFinal);
    } catch (error) {
      console.error('❌ [ExcelService] Error al generar Excel:', error);
      throw error;
    }
  }

  /**
   * Agrega encabezado con logo y título
   * @private
   */
  async _agregarEncabezado(worksheet, titulo, incluirLogo, workbook, numColumnas) {
    let filaActual = 1;
    const columnaLogo = 1; // Logo en la primera columna
    const columnaTitulo = 4; // Título empieza en la columna 4 (después del logo)

    // Agregar logo y título en la misma fila, uno al lado del otro
    if (incluirLogo || titulo) {
      // Configurar ancho de las columnas
      worksheet.getColumn(columnaLogo).width = 25; // Ancho aumentado para el logo más grande
      
      // Crear la fila para logo y título
      const filaEncabezado = worksheet.addRow([]);
      
      // Si hay logo, agregarlo en la primera columna
      if (incluirLogo) {
        try {
          // Cargar logo desde la carpeta public
          const response = await fetch('/images/certimarcaslogo.jpeg');
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const logo = workbook.addImage({
              buffer: arrayBuffer,
              extension: 'jpeg',
            });

            // Insertar logo en la primera columna con tamaño más grande
            worksheet.addImage(logo, {
              tl: { col: columnaLogo - 1, row: filaActual - 1 },
              ext: { width: 180, height: 90 } // Logo más grande y bien proporcionado
            });
            
            // Ajustar ancho de la segunda y tercera columna para espaciado
            worksheet.getColumn(2).width = 2;
            worksheet.getColumn(3).width = 2;
          }
        } catch (error) {
          console.warn('⚠️ [ExcelService] No se pudo cargar el logo:', error);
        }
      }

      // Agregar título al lado del logo (en la misma fila)
      if (titulo) {
        // Colocar título empezando en la columna 4, junto al logo
        filaEncabezado.getCell(columnaTitulo).value = titulo;
        filaEncabezado.getCell(columnaTitulo).font = { 
          size: 18, 
          bold: true, 
          color: { argb: 'FF174B8A' } // Color azul corporativo
        };
        filaEncabezado.getCell(columnaTitulo).alignment = { 
          horizontal: 'left', 
          vertical: 'middle' 
        };
        
        // Fusionar celdas para el título si hay espacio
        const columnaFinTitulo = Math.min(columnaTitulo + 5, numColumnas);
        if (columnaFinTitulo > columnaTitulo) {
          worksheet.mergeCells(filaActual, columnaTitulo, filaActual, columnaFinTitulo);
        }
      }
      
      // Ajustar altura de la fila para que quepa bien el logo más grande y título
      worksheet.getRow(filaActual).height = 95; // Altura aumentada para el logo más grande
      filaActual = 2;
      
      // Solo una fila vacía pequeña antes de la tabla para mantener cerca
      worksheet.insertRow(filaActual, []);
      worksheet.getRow(filaActual).height = 8;
      filaActual = filaActual + 1;
    }

    return filaActual;
  }

  /**
   * Aplica estilos a los encabezados
   * @private
   */
  _aplicarEstiloEncabezados(fila, numColumnas) {
    for (let i = 1; i <= numColumnas; i++) {
      const celda = fila.getCell(i);
      celda.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174B8A' } // Azul de la app
      };
      celda.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }, // Blanco
        size: 11
      };
      celda.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      celda.border = {
        top: { style: 'thin', color: { argb: 'FF174B8A' } },
        bottom: { style: 'thin', color: { argb: 'FF174B8A' } },
        left: { style: 'thin', color: { argb: 'FF174B8A' } },
        right: { style: 'thin', color: { argb: 'FF174B8A' } }
      };
    }
    
    // Ajustar altura de la fila de encabezados
    fila.height = 25;
  }

  /**
   * Aplica estilos a una fila de datos
   * @private
   */
  _aplicarEstiloFila(fila, numColumnas, esFilaPar) {
    const colorFondo = esFilaPar ? 'FFF2F2F2' : 'FFFFFFFF'; // Gris claro o blanco
    
    for (let i = 1; i <= numColumnas; i++) {
      const celda = fila.getCell(i);
      celda.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colorFondo }
      };
      celda.font = {
        color: { argb: 'FF000000' }, // Negro
        size: 10
      };
      celda.alignment = {
        vertical: 'middle',
        wrapText: true
      };
      celda.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
      };
    }
  }

  /**
   * Genera nombre de archivo con fecha
   * 
   * @param {string} prefijo - Prefijo del nombre del archivo
   * @returns {string} Nombre del archivo con formato: prefijo_YYYY-MM-DD.xlsx
   * 
   * @example
   * generarNombreArchivo('solicitudes') // 'solicitudes_2025-01-15.xlsx'
   */
  generarNombreArchivo(prefijo = 'reporte') {
    const fecha = new Date().toISOString().split('T')[0];
    return `${prefijo}_${fecha}.xlsx`;
  }
}

// Exportar instancia única (Singleton)
export default new ExcelService();
