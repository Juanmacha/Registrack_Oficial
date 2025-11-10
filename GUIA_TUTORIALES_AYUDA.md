# 📚 Guía: Sistema de Tutoriales en ayuda.jsx

## 🎯 ¿Cómo Funciona?

El sistema de tutoriales en `ayuda.jsx` permite mostrar guías paso a paso interactivas para ayudar a los usuarios a entender cómo usar la plataforma.

### 🔄 Flujo de Funcionamiento

1. **Página de Ayuda (`ayuda.jsx`)**
   - Muestra una lista de tutoriales disponibles
   - Cada tutorial tiene un botón "Ver Tutorial" que abre un modal
   - Los tutoriales están organizados por categorías (Registro, Login, Servicios, Seguimiento)

2. **Modal de Tutorial (`TutorialModal.jsx`)**
   - Se abre cuando el usuario hace clic en "Ver Tutorial"
   - Muestra los pasos del tutorial de forma interactiva
   - Permite navegar entre pasos (Anterior/Siguiente)
   - Muestra una barra de progreso
   - Muestra indicadores de pasos (puntos)

3. **Estructura de Datos**
   - Los tutoriales están definidos en el array `tutorialSteps` dentro de `ayuda.jsx`
   - Cada tutorial tiene:
     - `id`: Identificador único
     - `title`: Título del tutorial
     - `icon`: Icono React (componente)
     - `steps`: Array de pasos

4. **Cada Paso tiene:**
   - `step`: Número del paso
   - `title`: Título del paso
   - `description`: Descripción del paso
   - `image`: **Ruta de la imagen** (esto es lo que necesitas actualizar)
   - `tip`: Consejo adicional

---

## 📸 Cómo Actualizar las Imágenes

### 📍 Ubicación de las Imágenes

Las imágenes se encuentran en:
```
Registrack_Frontend1/public/images/
```

### 🔍 Imágenes Actuales en los Tutoriales

#### **Tutorial 1: Registro de Usuario**
- Paso 1: `/images/registrarseboton.png` ✅ Existe
- Paso 2: `/images/formularioregistro.png` ✅ Existe
- Paso 3: `/images/formulariolleno.png` ✅ Existe

#### **Tutorial 2: Iniciar Sesión**
- Paso 1: `/images/iniciarsesionboton.png` ✅ Existe
- Paso 2: `/images/llenarcredenciales.png` ✅ Existe
- Paso 3: `/images/iniciarsesionclick.png` ✅ Existe

#### **Tutorial 3: Adquirir Servicios**
- Paso 1: `/images/servicios.PNG` ✅ Existe
- Paso 2: `/images/servicios.PNG` ✅ Existe (repetida)
- Paso 3: `/images/formulariodeservicios.PNG` ✅ Existe
- Paso 4: `/images/services-step4.png` ❌ **NO EXISTE** (necesita ser agregada)

#### **Tutorial 4: Seguimiento de Procesos**
- Paso 1: `/images/misprocesos.png` ✅ Existe
- Paso 2: `/images/estadosmisprocesos.PNG` ✅ Existe
- Paso 3: `/images/actualizaciondeprocesos.PNG` ✅ Existe

---

## 🛠️ Pasos para Actualizar una Imagen

### **Opción 1: Reemplazar una imagen existente**

1. **Reemplaza el archivo en la carpeta:**
   ```
   Registrack_Frontend1/public/images/
   ```
   - Mantén el **mismo nombre** del archivo
   - Asegúrate de que el formato sea compatible (PNG, JPG, JPEG)

2. **Ejemplo:**
   - Si quieres actualizar la imagen del paso 1 de registro:
   - Reemplaza: `public/images/registrarseboton.png`
   - Mantén el mismo nombre: `registrarseboton.png`

### **Opción 2: Agregar una nueva imagen**

1. **Agrega la nueva imagen a:**
   ```
   Registrack_Frontend1/public/images/
   ```

2. **Actualiza la ruta en `ayuda.jsx`:**
   ```javascript
   // En el array tutorialSteps, encuentra el paso que necesitas actualizar
   {
     step: 4,
     title: 'Revisar y confirmar',
     description: '...',
     image: '/images/NUEVO_NOMBRE_IMAGEN.png', // ← Actualiza aquí
     tip: '...'
   }
   ```

3. **Ejemplo práctico:**
   - Si quieres agregar una imagen para el paso 4 de servicios:
   - Agrega: `public/images/paso4-servicios.png`
   - Actualiza en `ayuda.jsx` línea 117:
     ```javascript
     image: '/images/paso4-servicios.png', // Cambia de services-step4.png
     ```

---

## 📝 Ejemplo de Actualización

### **Caso: Actualizar imagen del paso 4 de "Adquirir Servicios"**

**Paso 1:** Agrega tu nueva imagen a `public/images/`
```
public/images/paso4-confirmacion-servicios.png
```

**Paso 2:** Actualiza `ayuda.jsx` (línea 117):
```javascript
{
  step: 4,
  title: 'Revisar y confirmar',
  description: 'Verifica toda la información ingresada antes de enviar la solicitud...',
  image: '/images/paso4-confirmacion-servicios.png', // ← Cambiado
  tip: 'Asegúrate de tener un método de pago disponible...'
}
```

---

## 🎨 Formatos de Imagen Soportados

- ✅ **PNG** (recomendado para capturas de pantalla)
- ✅ **JPG/JPEG** (para fotos)
- ✅ **GIF** (para animaciones, si es necesario)

### 📏 Tamaños Recomendados

- **Ancho:** 800px - 1200px
- **Alto:** 600px - 900px
- **Formato:** PNG con transparencia (si es necesario)

---

## 🔧 Estructura del Código

### **Archivo: `ayuda.jsx`**

```javascript
const tutorialSteps = [
  {
    id: 'servicios',
    title: 'Adquirir Servicios',
    icon: <FaShoppingCart className="text-orange-600" />,
    steps: [
      {
        step: 1,
        title: 'Explorar servicios',
        description: '...',
        image: '/images/servicios.PNG', // ← Ruta de la imagen
        tip: '...'
      },
      // ... más pasos
    ]
  },
  // ... más tutoriales
];
```

### **Archivo: `TutorialModal.jsx`**

El modal carga las imágenes así:
```javascript
<img
  src={currentStepData.image}  // ← Usa la ruta del paso
  alt={`Paso ${currentStepData.step}: ${currentStepData.title}`}
  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
  onError={() => handleImageError(currentStepData.image)} // Maneja errores
/>
```

---

## ⚠️ Problemas Comunes y Soluciones

### **1. Imagen no se muestra**
- ✅ Verifica que el archivo esté en `public/images/`
- ✅ Verifica que la ruta en el código sea correcta (debe empezar con `/images/`)
- ✅ Verifica que el nombre del archivo coincida exactamente (mayúsculas/minúsculas)
- ✅ Verifica la consola del navegador para ver errores 404

### **2. Imagen se ve distorsionada**
- ✅ Usa imágenes con proporciones adecuadas
- ✅ El modal ajusta automáticamente el tamaño, pero imágenes muy grandes pueden verse mal

### **3. Imagen no se actualiza después de cambiarla**
- ✅ Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
- ✅ Reinicia el servidor de desarrollo
- ✅ Verifica que el archivo se haya guardado correctamente

---

## 📋 Checklist para Actualizar Imágenes

- [ ] La imagen está en `public/images/`
- [ ] El nombre del archivo es correcto (sin espacios, caracteres especiales)
- [ ] La ruta en `ayuda.jsx` es correcta (`/images/nombre-archivo.png`)
- [ ] La imagen tiene un formato compatible (PNG, JPG, JPEG)
- [ ] El servidor de desarrollo se ha reiniciado (si es necesario)
- [ ] La caché del navegador se ha limpiado
- [ ] Se ha verificado que la imagen se muestra correctamente en el modal

---

## 🎯 Resumen Rápido

1. **Para reemplazar una imagen:**
   - Reemplaza el archivo en `public/images/` con el mismo nombre

2. **Para agregar una nueva imagen:**
   - Agrega el archivo en `public/images/`
   - Actualiza la ruta en `ayuda.jsx` en el paso correspondiente

3. **Rutas en el código:**
   - Siempre empiezan con `/images/`
   - Son relativas a la carpeta `public/`

4. **Ubicación del código:**
   - Archivo: `src/features/landing/pages/ayuda.jsx`
   - Array: `tutorialSteps` (líneas 29-151)
   - Propiedad: `image` dentro de cada `step`

---

## 🔍 Búsqueda Rápida de Imágenes

Para encontrar rápidamente qué imagen usa cada paso:

1. Abre `ayuda.jsx`
2. Busca el tutorial que necesitas (por ejemplo, "Adquirir Servicios")
3. Busca la propiedad `image` en cada paso
4. La ruta te indica qué archivo necesitas actualizar

---

## 💡 Tips Adicionales

- **Nombres de archivos:** Usa nombres descriptivos y en minúsculas
- **Organización:** Agrupa imágenes relacionadas con prefijos (ej: `servicios-paso1.png`, `servicios-paso2.png`)
- **Optimización:** Comprime las imágenes antes de subirlas para mejor rendimiento
- **Testing:** Siempre verifica que las imágenes se muestren correctamente después de actualizarlas

---

¿Necesitas ayuda con algo específico? ¡Dime qué imágenes necesitas actualizar y te ayudo a hacerlo! 🚀

