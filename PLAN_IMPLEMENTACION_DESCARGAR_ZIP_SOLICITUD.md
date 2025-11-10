# 📋 PLAN DE IMPLEMENTACIÓN: Descargar ZIP de Archivos de Solicitud

## 🎯 OBJETIVO

Conectar la opción "Descargar ZIP" en el menú de tres puntos de la tabla de solicitudes (administrador) con el endpoint del backend para descargar todos los archivos de una solicitud en formato ZIP.

---

## 📊 SITUACIÓN ACTUAL

### Frontend (tablaVentasProceso.jsx)
- ✅ Existe la opción "Descargar ZIP" en el menú de acciones (línea 758)
- ❌ Actualmente crea un ZIP manualmente usando JSZip desde archivos en memoria
- ❌ Solo incluye 4 archivos hardcodeados: `certificadoCamara`, `logotipoMarca`, `poderRepresentante`, `poderAutorizacion`
- ❌ No obtiene archivos desde el backend

### Backend (Documentación API)
- ✅ Existe `GET /api/archivos/:id/download` - Descargar un archivo individual
- ✅ Existe `GET /api/archivos/cliente/:idCliente` - Archivos de un cliente
- ⚠️ **NO ENCONTRADO**: Endpoint específico para descargar archivos de una solicitud en ZIP
- ✅ Los archivos pueden estar asociados con `id_orden_servicio` al subirlos

---

## 🔍 ANÁLISIS DEL PROBLEMA

### Opción 1: Endpoint Backend para ZIP de Solicitud (Recomendado)
Si el backend tiene un endpoint como:
- `GET /api/gestion-solicitudes/:id/archivos/zip` o
- `GET /api/archivos/solicitud/:idOrdenServicio/zip`

**Ventajas:**
- ✅ Más eficiente (el backend crea el ZIP)
- ✅ Incluye TODOS los archivos asociados a la solicitud
- ✅ No requiere múltiples requests
- ✅ El backend controla qué archivos incluir

### Opción 2: Obtener Archivos y Crear ZIP en Frontend
Si no existe el endpoint, implementar:
1. Obtener todos los archivos de la solicitud desde el backend
2. Descargar cada archivo
3. Crear ZIP en el frontend

**Desventajas:**
- ❌ Múltiples requests al backend
- ❌ Más lento
- ❌ Consume más recursos

---

## 📝 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Verificar/Identificar Endpoint Backend**

#### 1.1. Buscar endpoint en documentación
- [ ] Revisar documentación API completa para endpoint de ZIP de solicitud
- [ ] Verificar si existe `GET /api/gestion-solicitudes/:id/archivos/zip`
- [ ] Verificar si existe `GET /api/archivos/solicitud/:idOrdenServicio/zip`
- [ ] Verificar si existe `GET /api/archivos/orden/:idOrdenServicio/zip`

#### 1.2. Verificar endpoint en código backend (si es accesible)
- [ ] Buscar en código backend endpoints relacionados con archivos y solicitudes
- [ ] Verificar estructura de respuesta esperada

#### 1.3. Probar endpoint (si existe)
- [ ] Probar endpoint con Postman/curl
- [ ] Verificar formato de respuesta (ZIP blob)
- [ ] Verificar headers de respuesta (Content-Type, Content-Disposition)

---

### **FASE 2: Implementar Servicio API (archivosApiService.js)**

#### 2.1. Agregar método para descargar ZIP de solicitud

**Si el endpoint existe:**
```javascript
// GET /api/gestion-solicitudes/:id/archivos/zip
async downloadArchivosSolicitudZip(idOrdenServicio, token) {
  try {
    console.log(`🔧 [ArchivosApiService] Descargando ZIP de archivos de solicitud ${idOrdenServicio}...`);
    
    const response = await fetch(
      `${this.baseURL}/api/gestion-solicitudes/${idOrdenServicio}/archivos/zip`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    // Obtener nombre del archivo desde headers si está disponible
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `Archivos_Solicitud_${idOrdenServicio}.zip`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ [ArchivosApiService] ZIP descargado exitosamente');
    return { success: true, filename };
  } catch (error) {
    console.error('❌ [ArchivosApiService] Error descargando ZIP:', error);
    throw error;
  }
}
```

**Si el endpoint NO existe (Opción 2):**
```javascript
// Obtener archivos de solicitud y crear ZIP en frontend
async downloadArchivosSolicitudZip(idOrdenServicio, token) {
  try {
    console.log(`🔧 [ArchivosApiService] Obteniendo archivos de solicitud ${idOrdenServicio}...`);
    
    // 1. Obtener información de la solicitud para obtener id_cliente
    const solicitudResponse = await fetch(
      `${this.baseURL}/api/gestion-solicitudes/${idOrdenServicio}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    if (!solicitudResponse.ok) {
      throw new Error(`Error al obtener solicitud: ${solicitudResponse.status}`);
    }
    
    const solicitud = await solicitudResponse.json();
    const idCliente = solicitud.id_cliente || solicitud.cliente?.id_cliente;
    
    if (!idCliente) {
      throw new Error('No se pudo obtener el ID del cliente');
    }
    
    // 2. Obtener archivos del cliente
    const archivosResponse = await fetch(
      `${this.baseURL}/api/archivos/cliente/${idCliente}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    if (!archivosResponse.ok) {
      throw new Error(`Error al obtener archivos: ${archivosResponse.status}`);
    }
    
    const archivos = await archivosResponse.json();
    
    // 3. Filtrar archivos que pertenecen a esta solicitud
    const archivosSolicitud = archivos.filter(
      archivo => archivo.id_orden_servicio === parseInt(idOrdenServicio)
    );
    
    if (archivosSolicitud.length === 0) {
      throw new Error('No hay archivos asociados a esta solicitud');
    }
    
    // 4. Crear ZIP con JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // 5. Descargar cada archivo y agregarlo al ZIP
    for (const archivo of archivosSolicitud) {
      try {
        const fileResponse = await fetch(
          `${this.baseURL}/api/archivos/${archivo.id_archivo}/download`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (fileResponse.ok) {
          const blob = await fileResponse.blob();
          const filename = archivo.url_archivo || `archivo_${archivo.id_archivo}`;
          zip.file(filename, blob);
        }
      } catch (error) {
        console.warn(`⚠️ Error descargando archivo ${archivo.id_archivo}:`, error);
      }
    }
    
    // 6. Generar y descargar ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Archivos_Solicitud_${idOrdenServicio}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ [ArchivosApiService] ZIP creado y descargado exitosamente');
    return { success: true, archivosIncluidos: archivosSolicitud.length };
  } catch (error) {
    console.error('❌ [ArchivosApiService] Error creando ZIP:', error);
    throw error;
  }
}
```

---

### **FASE 3: Actualizar tablaVentasProceso.jsx**

#### 3.1. Reemplazar lógica actual de "Descargar ZIP"

**Ubicación:** `src/features/dashboard/pages/gestionVentasServicios/components/tablaVentasProceso.jsx`

**Líneas a modificar:** 756-798

**Cambios:**
1. Importar `archivosApiService`
2. Obtener token de autenticación
3. Reemplazar lógica de JSZip manual con llamada al servicio
4. Agregar manejo de errores con SweetAlert2
5. Agregar loading state durante la descarga

**Código propuesto:**
```javascript
{
  icon: "bi bi-file-earmark-zip",
  label: "Descargar ZIP",
  title: "Descargar documentos adjuntos",
  onClick: async () => {
    try {
      // Mostrar loading
      Swal.fire({
        title: 'Descargando archivos...',
        text: 'Por favor espera mientras se preparan los archivos',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const token = getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Obtener id_orden_servicio del item
      const idOrdenServicio = item.id || item.id_orden_servicio;
      if (!idOrdenServicio) {
        throw new Error('No se pudo obtener el ID de la solicitud');
      }
      
      // Llamar al servicio para descargar ZIP
      await archivosApiService.downloadArchivosSolicitudZip(idOrdenServicio, token);
      
      // Cerrar loading y mostrar éxito
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Descarga exitosa',
        text: 'Los archivos se han descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error descargando ZIP:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar',
        text: error.message || 'No se pudieron descargar los archivos. Por favor intenta nuevamente.',
        customClass: { popup: "swal2-border-radius" }
      });
    }
  }
}
```

---

### **FASE 4: Agregar Configuración en apiConfig.js (Opcional)**

Si el endpoint tiene una ruta específica, agregar a `apiConfig.js`:

```javascript
// Archivos
FILES: '/api/archivos',
UPLOAD_FILE: '/api/archivos/upload',
DOWNLOAD_FILE: (id) => `/api/archivos/${id}/download`,
CLIENT_FILES: (id) => `/api/archivos/cliente/${id}`,
SOLICITUD_FILES_ZIP: (id) => `/api/gestion-solicitudes/${id}/archivos/zip`, // Nuevo
```

---

### **FASE 5: Testing y Validación**

#### 5.1. Pruebas funcionales
- [ ] Probar descarga de ZIP con solicitud que tiene archivos
- [ ] Probar descarga de ZIP con solicitud sin archivos (debe mostrar mensaje apropiado)
- [ ] Probar descarga de ZIP con token inválido (debe mostrar error)
- [ ] Probar descarga de ZIP con solicitud inexistente (debe mostrar error)

#### 5.2. Pruebas de UX
- [ ] Verificar que se muestra loading durante la descarga
- [ ] Verificar que se muestra mensaje de éxito al completar
- [ ] Verificar que se muestra mensaje de error apropiado
- [ ] Verificar que el nombre del archivo ZIP es descriptivo

#### 5.3. Pruebas de rendimiento
- [ ] Verificar tiempo de descarga con pocos archivos (< 5)
- [ ] Verificar tiempo de descarga con muchos archivos (> 10)
- [ ] Verificar que no se bloquea la UI durante la descarga

---

## 🚨 CONSIDERACIONES IMPORTANTES

### 1. Endpoint Backend
- **Si el endpoint NO existe**, se debe implementar en el backend primero
- **Endpoint sugerido:** `GET /api/gestion-solicitudes/:id/archivos/zip`
- **Respuesta esperada:** ZIP file como blob con Content-Type: `application/zip`

### 2. Autenticación
- El endpoint debe requerir autenticación (Bearer token)
- Solo administradores y empleados deben poder descargar archivos

### 3. Archivos a incluir
- Todos los archivos asociados a la solicitud (`id_orden_servicio`)
- Incluir archivos subidos por el cliente y por empleados
- Incluir nombres descriptivos de archivos

### 4. Manejo de errores
- Si no hay archivos, mostrar mensaje apropiado
- Si hay error de red, mostrar mensaje de error
- Si el token expira, redirigir a login

### 5. Compatibilidad
- Asegurar que funciona en diferentes navegadores
- Asegurar que funciona con archivos grandes
- Asegurar que funciona con diferentes tipos de archivos

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend (si es necesario)
- [ ] Crear endpoint `GET /api/gestion-solicitudes/:id/archivos/zip`
- [ ] Implementar lógica para obtener archivos de la solicitud
- [ ] Implementar creación de ZIP en el backend
- [ ] Agregar validación de autenticación y autorización
- [ ] Agregar manejo de errores
- [ ] Probar endpoint con Postman

### Frontend
- [ ] Agregar método en `archivosApiService.js`
- [ ] Actualizar `tablaVentasProceso.jsx` para usar el nuevo servicio
- [ ] Agregar manejo de loading state
- [ ] Agregar manejo de errores con SweetAlert2
- [ ] Agregar configuración en `apiConfig.js` (si es necesario)
- [ ] Probar funcionalidad completa
- [ ] Verificar que funciona con diferentes casos de uso

---

## 🎯 RESULTADO ESPERADO

Al hacer clic en "Descargar ZIP" en el menú de tres puntos:
1. ✅ Se muestra un loading indicator
2. ✅ Se obtienen todos los archivos de la solicitud desde el backend
3. ✅ Se descarga un archivo ZIP con todos los archivos
4. ✅ Se muestra un mensaje de éxito
5. ✅ Si hay error, se muestra un mensaje de error apropiado

---

## 📝 NOTAS ADICIONALES

- El endpoint debe devolver un ZIP con todos los archivos asociados a la solicitud
- Los nombres de archivo deben ser descriptivos
- El ZIP debe incluir la estructura de carpetas si es necesario
- El tamaño del ZIP no debe exceder límites razonables (ej: 100MB)

---

**Fecha de creación:** 2025-11-08
**Estado:** ⏳ Pendiente de implementación
**Prioridad:** 🔴 Alta

