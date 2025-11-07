# 📋 Formularios Completos para Crear Solicitudes de Servicio

## 📌 Información General

Este documento contiene la especificación completa de todos los campos de formulario necesarios para crear solicitudes de servicio en el sistema Registrack. Cada servicio tiene campos específicos organizados por secciones lógicas.

**Endpoint Base:** `POST /api/gestion-solicitudes/crear/:servicio`

**Parámetro URL:**
- `:servicio` - ID numérico del servicio (obtener con `GET /api/servicios`)

**Headers Requeridos:**
```
Authorization: Bearer {token_jwt}
Content-Type: application/json
```

---

## 📊 Índice de Servicios

| # | Servicio | ID* | Campos Totales | Campos Requeridos |
|---|----------|-----|----------------|-------------------|
| 1 | Búsqueda de Antecedentes | Variable | 18 | 10 |
| 2 | Registro de Marca (Certificación de marca) | Variable | 28 | 19 |
| 3 | Renovación de Marca | Variable | 24 | 17 |
| 4 | Cesión de Marca | Variable | 27 | 20 |
| 5 | Presentación de Oposición | Variable | 22 | 17 |
| 6 | Respuesta de Oposición | Variable | 19 | 14 |
| 7 | Ampliación de Alcance | Variable | 15 | 12 |

*⚠️ **IMPORTANTE**: Los IDs son variables. Consultar `GET /api/servicios` para obtener los IDs reales.

---

## 🔧 Campos Comunes a Todos los Servicios

### Campos de Identificación del Solicitante

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `tipo_solicitante` | `string` | Depende del servicio | `"Natural"` o `"Jurídica"` | `"Natural"` | Tipo de persona que solicita |
| `nombres_apellidos` | `string` | Sí* | Min 3, Max 100 caracteres | `"Juan Pérez García"` | Nombre completo del solicitante |
| `tipo_documento` | `string` | Sí* | Ver valores válidos abajo | `"Cédula de Ciudadanía"` | Tipo de documento de identidad |
| `numero_documento` | `string` | Sí* | Min 6, Max 20 caracteres, solo números | `"1234567890"` | Número de documento de identidad |
| `correo` | `string` | Sí* | Formato email válido | `"juan.perez@email.com"` | Correo electrónico de contacto |
| `correo_electronico` | `string` | Alternativo | Formato email válido | `"juan.perez@email.com"` | Alias de `correo` |
| `telefono` | `string` | Sí* | Min 7, Max 20 caracteres | `"3001234567"` | Teléfono de contacto |
| `direccion` | `string` | Sí* | Min 5, Max 500 caracteres | `"Calle 123 #45-67"` | Dirección completa |
| `direccion_domicilio` | `string` | Alternativo | Min 5, Max 500 caracteres | `"Calle 123 #45-67"` | Alias de `direccion` |
| `pais` | `string` | Sí* | Min 3, Max 50 caracteres | `"Colombia"` | País de residencia |
| `pais_titular` | `string` | Alternativo | Min 3, Max 50 caracteres | `"Colombia"` | Alias de `pais` |
| `pais_residencia` | `string` | Alternativo | Min 3, Max 50 caracteres | `"Colombia"` | Alias de `pais` |
| `ciudad` | `string` | Opcional | Min 2, Max 50 caracteres | `"Bogotá"` | Ciudad de residencia (default: "Bogotá") |
| `ciudad_titular` | `string` | Alternativo | Min 2, Max 50 caracteres | `"Bogotá"` | Alias de `ciudad` |
| `ciudad_residencia` | `string` | Alternativo | Min 2, Max 50 caracteres | `"Bogotá"` | Alias de `ciudad` |
| `codigo_postal` | `string` | Opcional | Max 10 caracteres | `"110111"` | Código postal (default: "110111") |

**Valores Válidos para `tipo_documento`:**
- `"Cédula de Ciudadanía"` (Recomendado)
- `"Cédula de Extranjería"`
- `"Pasaporte"`
- `"NIT"`
- `"Tarjeta de Identidad"`
- También acepta abreviaciones: `"CC"`, `"CE"`, `"PA"`, `"TI"`, `"NIT"`

---

### Campos de Información de Empresa (Persona Jurídica)

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `tipo_entidad` | `string` | Sí* (si es Jurídica) | Ver valores válidos abajo | `"Sociedad por Acciones Simplificada"` | Tipo de entidad jurídica |
| `tipo_entidad_razon_social` | `string` | Alternativo | Ver valores válidos abajo | `"S.A.S."` | Alias de `tipo_entidad` |
| `razon_social` | `string` | Sí* (si es Jurídica) | Min 2, Max 100 caracteres | `"Mi Empresa S.A.S."` | Razón social de la empresa |
| `nombre_empresa` | `string` | Alternativo | Min 2, Max 100 caracteres | `"Mi Empresa S.A.S."` | Alias de `razon_social` |
| `nit_empresa` | `number` | Sí* (si es Jurídica) | Entero de 10 dígitos (1000000000 - 9999999999) | `9001234567` | NIT de la empresa (sin guión) |
| `nit` | `number` | Alternativo | Entero de 10 dígitos | `9001234567` | Alias de `nit_empresa` |
| `representante_legal` | `string` | Sí* (si es Jurídica) | Min 3, Max 100 caracteres | `"Carlos Rodríguez Martínez"` | Nombre del representante legal |
| `numero_nit_cedula` | `string` | Depende del servicio | Min 6, Max 20 caracteres | `"9001234567"` | Número de NIT o cédula del titular |

**Valores Válidos para `tipo_entidad`:**
- `"Sociedad por Acciones Simplificada"` o `"S.A.S."`
- `"Sociedad Anónima"` o `"S.A."`
- `"Sociedad Limitada"` o `"LTDA"`
- `"Empresa Unipersonal"` o `"E.U."`
- `"Sociedad en Comandita Simple"` o `"S. en C.S."`
- `"Sociedad en Comandita por Acciones"` o `"S. en C. por A."`

---

### Campos de Documentos y Poderes

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `poder_autorizacion` | `string` | Depende del servicio | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Poder de autorización para el registro |
| `poder_representante_autorizado` | `string` | Alternativo | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Alias de `poder_autorizacion` |
| `poder_registro_marca` | `string` | Opcional | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Poder específico para registro de marca |
| `certificado_camara_comercio` | `string` | Depende del servicio | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Certificado de cámara de comercio |
| `certificado_renovacion` | `string` | Depende del servicio | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Certificado de renovación |
| `documento_cesion` | `string` | Depende del servicio | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Documento de cesión |
| `documentos_oposicion` | `string` | Depende del servicio | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Documentos de oposición |
| `soportes` | `string` | Depende del servicio | Base64 string (PDF/Imagen) | `"data:application/pdf;base64,..."` | Documentos adicionales de soporte |

**Nota sobre archivos Base64:**
- Los archivos deben enviarse como strings en formato Base64
- Pueden incluir el prefijo `data:application/pdf;base64,` o `data:image/jpeg;base64,`
- Tamaño máximo recomendado: 5MB por archivo

---

### Campos de Marca/Producto

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `nombre_marca` | `string` | Depende del servicio | Min 2, Max 100 caracteres | `"Mi Marca Registrada"` | Nombre de la marca |
| `nombre_a_buscar` | `string` | Alternativo | Min 2, Max 100 caracteres | `"Mi Marca"` | Alias de `nombre_marca` (para búsquedas) |
| `clase_niza` | `string` | Depende del servicio | Max 50 caracteres | `"25"` o `"25, 28, 35"` | Clasificación internacional de productos/servicios |
| `clase_niza_actual` | `string` | Depende del servicio | Max 50 caracteres | `"25"` | Clase Niza actual del registro |
| `nuevas_clases_niza` | `string` | Depende del servicio | Max 200 caracteres | `"28, 35"` | Nuevas clases Niza a agregar |
| `tipo_producto_servicio` | `string` | Depende del servicio | Min 3, Max 50 caracteres | `"Productos alimenticios"` | Tipo de producto o servicio |
| `logotipo` | `string` | Depende del servicio | Base64 string (Imagen) | `"data:image/jpeg;base64,..."` | Logotipo de la marca en Base64 |

---

### Campos de Expedientes y Referencias

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `numero_expediente_marca` | `string` | Depende del servicio | Max 50 caracteres | `"2020-123456"` | Número de expediente de marca existente |
| `numero_registro_existente` | `string` | Depende del servicio | Max 50 caracteres | `"2020-567890"` | Número de registro actual |
| `marca_a_oponerse` | `string` | Depende del servicio | Max 100 caracteres | `"Marca Similar Confusa"` | Nombre de la marca contra la que se opone |
| `marca_opositora` | `string` | Depende del servicio | Max 100 caracteres | `"Marca que se Opuso"` | Nombre de la marca que presenta oposición |

---

### Campos de Cesionario (Solo Cesión de Marca)

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `nombre_razon_social_cesionario` | `string` | Sí (Cesión) | Min 2, Max 100 caracteres | `"Empresa Cesionaria S.A."` | Nombre o razón social del cesionario |
| `nombre_cesionario` | `string` | Alternativo | Min 2, Max 100 caracteres | `"Empresa Cesionaria S.A."` | Alias de `nombre_razon_social_cesionario` |
| `nit_cesionario` | `string` | Sí (Cesión) | Max 20 caracteres | `"7005554443"` | NIT del cesionario |
| `tipo_documento_cesionario` | `string` | Sí (Cesión) | Ver valores de `tipo_documento` | `"Cédula de Ciudadanía"` | Tipo de documento del cesionario |
| `numero_documento_cesionario` | `string` | Sí (Cesión) | Min 6, Max 20 caracteres | `"9988776655"` | Número de documento del cesionario |
| `correo_cesionario` | `string` | Sí (Cesión) | Formato email válido | `"cesionario@email.com"` | Correo electrónico del cesionario |
| `telefono_cesionario` | `string` | Sí (Cesión) | Min 7, Max 20 caracteres | `"3188997766"` | Teléfono del cesionario |
| `direccion_cesionario` | `string` | Sí (Cesión) | Min 5, Max 500 caracteres | `"Avenida 19 #120-50, Bogotá"` | Dirección del cesionario |
| `representante_legal_cesionario` | `string` | Sí (Cesión) | Min 3, Max 100 caracteres | `"Diego Andrés Morales"` | Representante legal del cesionario |

---

### Campos de Argumentos y Descripciones

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `argumentos_respuesta` | `string` | Depende del servicio | Min 10, Max 2000 caracteres | `"La marca solicitada es similar..."` | Argumentos legales de respuesta |
| `descripcion_nuevos_productos_servicios` | `string` | Depende del servicio | Min 10, Max 2000 caracteres | `"Ampliación para incluir..."` | Descripción de nuevos productos/servicios |
| `descripcion_adicional` | `string` | Opcional | Max 1000 caracteres | `"Información adicional..."` | Descripción adicional del servicio |

---

### Campos Específicos de Ampliación de Alcance

| Campo API | Tipo | Requerido | Validación | Ejemplo | Descripción |
|-----------|------|-----------|------------|---------|-------------|
| `documento_nit_titular` | `string` | Sí (Ampliación) | Max 20 caracteres | `"9001122334"` | Documento o NIT del titular |
| `numero_nit_cedula` | `string` | Alternativo | Max 20 caracteres | `"9001122334"` | Alias de `documento_nit_titular` |
| `cedula` | `string` | Alternativo | Max 20 caracteres | `"1234567890"` | Número de cédula |

---

## 📝 Formularios por Servicio

### 1. Búsqueda de Antecedentes

**Campos Requeridos:** 10  
**Campos Totales:** 18

#### Sección 1: Información del Solicitante
```json
{
  "nombres_apellidos": "string (requerido)",
  "tipo_documento": "string (requerido)",
  "numero_documento": "string (requerido)",
  "direccion": "string (requerido)",
  "telefono": "string (requerido)",
  "correo": "string (requerido)",
  "pais": "string (requerido)",
  "ciudad": "string (opcional, default: 'Bogotá')",
  "codigo_postal": "string (opcional, default: '110111')"
}
```

#### Sección 2: Información de la Búsqueda
```json
{
  "nombre_a_buscar": "string (requerido)",
  "tipo_producto_servicio": "string (requerido)",
  "clase_niza": "string (opcional)",
  "logotipo": "string base64 (requerido)"
}
```

#### Ejemplo Completo:
```json
{
  "nombres_apellidos": "Juan Pérez García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan.perez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombre_a_buscar": "Mi Marca",
  "tipo_producto_servicio": "Productos alimenticios",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

---

### 2. Registro de Marca (Certificación de marca)

**Campos Requeridos:** 19  
**Campos Totales:** 28

#### Sección 1: Tipo de Solicitante
```json
{
  "tipo_solicitante": "string (requerido) - 'Natural' o 'Jurídica'"
}
```

#### Sección 2: Información del Solicitante
```json
{
  "nombres_apellidos": "string (requerido)",
  "tipo_documento": "string (requerido)",
  "numero_documento": "string (requerido)",
  "numero_nit_cedula": "string (requerido)",
  "direccion": "string (requerido)",
  "direccion_domicilio": "string (requerido)",
  "telefono": "string (requerido)",
  "correo": "string (requerido)",
  "pais": "string (requerido)",
  "ciudad": "string (opcional)",
  "codigo_postal": "string (opcional)"
}
```

#### Sección 3: Información de la Empresa (Solo si tipo_solicitante = "Jurídica")
```json
{
  "tipo_entidad": "string (requerido si Jurídica)",
  "razon_social": "string (requerido si Jurídica)",
  "nit_empresa": "number (requerido si Jurídica) - 10 dígitos",
  "representante_legal": "string (requerido si Jurídica)"
}
```

#### Sección 4: Información de la Marca
```json
{
  "nombre_marca": "string (requerido)",
  "tipo_producto_servicio": "string (requerido)",
  "clase_niza": "string (opcional)",
  "logotipo": "string base64 (requerido)"
}
```

#### Sección 5: Documentos
```json
{
  "certificado_camara_comercio": "string base64 (requerido)",
  "poder_autorizacion": "string base64 (requerido)"
}
```

#### Ejemplo Completo (Persona Jurídica):
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "María González López",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "numero_nit_cedula": "9001234567",
  "direccion": "Avenida 68 #45-30",
  "direccion_domicilio": "Carrera 7 #32-16, Bogotá",
  "telefono": "3109876543",
  "correo": "maria.gonzalez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez Martínez",
  "nombre_marca": "Mi Marca Registrada",
  "tipo_producto_servicio": "Servicios de consultoría",
  "clase_niza": "35",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0x...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0x..."
}
```

---

### 3. Renovación de Marca

**Campos Requeridos:** 17  
**Campos Totales:** 24

#### Sección 1: Tipo de Solicitante
```json
{
  "tipo_solicitante": "string (requerido) - 'Natural' o 'Jurídica'"
}
```

#### Sección 2: Información del Solicitante
```json
{
  "nombres_apellidos": "string (requerido)",
  "tipo_documento": "string (requerido)",
  "numero_documento": "string (requerido)",
  "direccion": "string (requerido)",
  "telefono": "string (requerido)",
  "correo": "string (requerido)",
  "pais": "string (requerido)",
  "ciudad": "string (opcional)",
  "codigo_postal": "string (opcional)"
}
```

#### Sección 3: Información de la Empresa (Solo si tipo_solicitante = "Jurídica")
```json
{
  "tipo_entidad": "string (requerido si Jurídica)",
  "razon_social": "string (requerido si Jurídica)",
  "nit_empresa": "number (requerido si Jurídica)",
  "representante_legal": "string (requerido si Jurídica)"
}
```

#### Sección 4: Información de la Marca
```json
{
  "nombre_marca": "string (requerido)",
  "numero_expediente_marca": "string (requerido)",
  "clase_niza": "string (opcional)",
  "logotipo": "string base64 (requerido)"
}
```

#### Sección 5: Documentos
```json
{
  "certificado_renovacion": "string base64 (requerido)",
  "poder_autorizacion": "string base64 (requerido)"
}
```

#### Ejemplo Completo:
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Ana Martínez Díaz",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1122334455",
  "direccion": "Calle 100 #50-20",
  "telefono": "3201112233",
  "correo": "ana.martinez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "tipo_entidad": "Sociedad Limitada",
  "razon_social": "Empresa Renovadora Ltda.",
  "nit_empresa": 8009876543,
  "representante_legal": "Luis Fernando Herrera",
  "nombre_marca": "Marca a Renovar",
  "numero_expediente_marca": "2020-123456",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "certificado_renovacion": "data:application/pdf;base64,JVBERi0x...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0x..."
}
```

---

### 4. Cesión de Marca

**Campos Requeridos:** 20  
**Campos Totales:** 27

#### Sección 1: Tipo de Solicitante
```json
{
  "tipo_solicitante": "string (requerido) - 'Natural' o 'Jurídica'"
}
```

#### Sección 2: Información del Cedente (Quien cede)
```json
{
  "nombres_apellidos": "string (requerido)",
  "tipo_documento": "string (requerido)",
  "numero_documento": "string (requerido)",
  "direccion": "string (requerido)",
  "telefono": "string (requerido)",
  "correo": "string (requerido)",
  "pais": "string (requerido)",
  "ciudad": "string (opcional)",
  "codigo_postal": "string (opcional)"
}
```

#### Sección 3: Información de la Marca
```json
{
  "nombre_marca": "string (requerido)",
  "numero_expediente_marca": "string (requerido)"
}
```

#### Sección 4: Información del Cesionario (Quien recibe)
```json
{
  "nombre_razon_social_cesionario": "string (requerido)",
  "nit_cesionario": "string (requerido)",
  "tipo_documento_cesionario": "string (requerido)",
  "numero_documento_cesionario": "string (requerido)",
  "correo_cesionario": "string (requerido)",
  "telefono_cesionario": "string (requerido)",
  "direccion_cesionario": "string (requerido)",
  "representante_legal_cesionario": "string (requerido)"
}
```

#### Sección 5: Documentos
```json
{
  "documento_cesion": "string base64 (requerido)",
  "poder_autorizacion": "string base64 (requerido)"
}
```

#### Ejemplo Completo:
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Pedro Sánchez Ruiz",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "5566778899",
  "direccion": "Carrera 15 #95-40",
  "telefono": "3155566778",
  "correo": "pedro.sanchez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombre_marca": "Marca a Ceder",
  "numero_expediente_marca": "2019-789012",
  "nombre_razon_social_cesionario": "Empresa Cesionaria S.A.",
  "nit_cesionario": "7005554443",
  "tipo_documento_cesionario": "Cédula de Ciudadanía",
  "numero_documento_cesionario": "9988776655",
  "correo_cesionario": "cesionario@email.com",
  "telefono_cesionario": "3188997766",
  "direccion_cesionario": "Avenida 19 #120-50, Bogotá",
  "representante_legal_cesionario": "Diego Andrés Morales",
  "documento_cesion": "data:application/pdf;base64,JVBERi0x...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0x..."
}
```

---

### 5. Presentación de Oposición

**Campos Requeridos:** 17  
**Campos Totales:** 22

#### Sección 1: Tipo de Solicitante
```json
{
  "tipo_solicitante": "string (requerido) - 'Natural' o 'Jurídica'"
}
```

#### Sección 2: Información del Solicitante
```json
{
  "nombres_apellidos": "string (requerido)",
  "tipo_documento": "string (requerido)",
  "numero_documento": "string (requerido)",
  "direccion": "string (requerido)",
  "telefono": "string (requerido)",
  "correo": "string (requerido)",
  "pais": "string (requerido)",
  "ciudad": "string (opcional)",
  "codigo_postal": "string (opcional)"
}
```

#### Sección 3: Información de la Empresa (Solo si tipo_solicitante = "Jurídica")
```json
{
  "tipo_entidad": "string (requerido si Jurídica)",
  "razon_social": "string (requerido si Jurídica)",
  "nit_empresa": "number (requerido)",
  "representante_legal": "string (requerido si Jurídica)"
}
```

#### Sección 4: Información de las Marcas
```json
{
  "nombre_marca": "string (requerido)",
  "marca_a_oponerse": "string (requerido)"
}
```

#### Sección 5: Argumentos y Documentos
```json
{
  "argumentos_respuesta": "string (requerido) - Min 10 caracteres",
  "documentos_oposicion": "string base64 (requerido)",
  "poder_autorizacion": "string base64 (requerido)"
}
```

#### Ejemplo Completo:
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Laura Restrepo Mejía",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "3344556677",
  "direccion": "Calle 72 #10-15",
  "telefono": "3112233445",
  "correo": "laura.restrepo@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "tipo_entidad": "Sociedad Anónima",
  "razon_social": "Empresa Oponente S.A.",
  "nit_empresa": 6003344556,
  "representante_legal": "Andrés Felipe Vargas",
  "nombre_marca": "Mi Marca Protegida",
  "marca_a_oponerse": "Marca Similar Confusa",
  "argumentos_respuesta": "La marca solicitada es similar fonética y visualmente a nuestra marca registrada, lo que puede causar confusión en el público consumidor.",
  "documentos_oposicion": "data:application/pdf;base64,JVBERi0x...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0x..."
}
```

---

### 6. Respuesta de Oposición

**Campos Requeridos:** 14  
**Campos Totales:** 19

#### Sección 1: Información del Solicitante
```json
{
  "nombres_apellidos": "string (requerido)",
  "tipo_documento": "string (requerido)",
  "numero_documento": "string (requerido)",
  "direccion": "string (requerido)",
  "telefono": "string (requerido)",
  "correo": "string (requerido)",
  "pais": "string (requerido)",
  "ciudad": "string (opcional)",
  "codigo_postal": "string (opcional)"
}
```

#### Sección 2: Información de la Empresa
```json
{
  "razon_social": "string (requerido)",
  "nit_empresa": "number (requerido)",
  "representante_legal": "string (requerido)"
}
```

#### Sección 3: Información de las Marcas
```json
{
  "nombre_marca": "string (requerido)",
  "numero_expediente_marca": "string (requerido)",
  "marca_opositora": "string (requerido)"
}
```

#### Sección 4: Documentos
```json
{
  "poder_autorizacion": "string base64 (requerido)"
}
```

#### Ejemplo Completo:
```json
{
  "nombres_apellidos": "Roberto Camacho Torres",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "7788990011",
  "direccion": "Transversal 23 #45-89",
  "telefono": "3123344556",
  "correo": "roberto.camacho@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "razon_social": "Empresa Respondiente Ltda.",
  "nit_empresa": 5007788990,
  "representante_legal": "Sandra Milena Ramírez",
  "nombre_marca": "Mi Marca Original",
  "numero_expediente_marca": "2021-345678",
  "marca_opositora": "Marca que se Opuso",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0x..."
}
```

---

### 7. Ampliación de Alcance

**Campos Requeridos:** 12  
**Campos Totales:** 15

#### Sección 1: Información del Titular
```json
{
  "documento_nit_titular": "string (requerido)",
  "direccion": "string (requerido)",
  "ciudad": "string (requerido)",
  "pais": "string (requerido)",
  "correo": "string (requerido)",
  "telefono": "string (requerido)",
  "codigo_postal": "string (opcional)"
}
```

#### Sección 2: Información del Registro Existente
```json
{
  "numero_registro_existente": "string (requerido)",
  "nombre_marca": "string (requerido)",
  "clase_niza_actual": "string (requerido)",
  "nuevas_clases_niza": "string (requerido)",
  "descripcion_nuevos_productos_servicios": "string (requerido) - Min 10 caracteres"
}
```

#### Sección 3: Documentos
```json
{
  "soportes": "string base64 (requerido)"
}
```

#### Ejemplo Completo:
```json
{
  "documento_nit_titular": "9001122334",
  "direccion": "Carrera 11 #93-50",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "correo": "ampliacion@email.com",
  "telefono": "3134455667",
  "codigo_postal": "110111",
  "numero_registro_existente": "2020-567890",
  "nombre_marca": "Marca con Alcance Ampliado",
  "clase_niza_actual": "25",
  "nuevas_clases_niza": "28, 35",
  "descripcion_nuevos_productos_servicios": "Ampliación para incluir prendas de vestir (clase 25), juegos y juguetes (clase 28) y servicios de publicidad (clase 35)",
  "soportes": "data:application/pdf;base64,JVBERi0x..."
}
```

---

## 🎨 Estructura Recomendada para Modales Frontend

### Organización por Secciones (Acordeón o Tabs)

Cada formulario debe organizarse en secciones lógicas:

1. **Sección 1: Tipo de Solicitante** (Solo si aplica)
   - Radio buttons: `Natural` / `Jurídica`
   - Este campo condiciona otros campos

2. **Sección 2: Datos del Solicitante**
   - Formulario estándar con validaciones en tiempo real
   - Campos de texto, email, teléfono

3. **Sección 3: Datos de Empresa** (Solo si `tipo_solicitante = "Jurídica"`)
   - Campos específicos de empresa
   - Validación de NIT (10 dígitos)

4. **Sección 4: Información de la Marca**
   - Nombre de marca
   - Clase Niza
   - Tipo de producto/servicio
   - Upload de logotipo

5. **Sección 5: Documentos**
   - Upload de archivos (PDF/Imagen)
   - Convertir a Base64 antes de enviar
   - Mostrar preview de archivos cargados

6. **Sección 6: Información Específica del Servicio**
   - Campos únicos según el servicio
   - Ejemplo: Cesionario, Argumentos, etc.

---

## ⚠️ Validaciones Importantes

### Validaciones del Frontend (Antes de Enviar)

1. **Campos Requeridos:**
   - Verificar que todos los campos marcados como requeridos estén completos
   - Mostrar mensajes de error específicos por campo

2. **Formato de Email:**
   ```javascript
   /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   ```

3. **NIT de Empresa:**
   - Debe ser número entero
   - Entre 1000000000 y 9999999999 (10 dígitos)
   - Sin guiones ni espacios

4. **Número de Documento:**
   - Solo números
   - Entre 6 y 20 caracteres

5. **Teléfono:**
   - Solo números
   - Entre 7 y 20 caracteres

6. **Archivos Base64:**
   - Tamaño máximo: 5MB
   - Formatos permitidos: PDF, JPG, PNG
   - Validar antes de convertir a Base64

### Validaciones del Backend (Respuestas de Error)

El backend retornará errores en este formato:

```json
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": ["campo1", "campo2"],
  "camposRequeridos": ["campo1", "campo2", "campo3"]
}
```

---

## 🔄 Flujo de Creación de Solicitud

### Paso 1: Obtener Servicios Disponibles
```http
GET /api/servicios
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "data": [
    {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes",
      "precio_base": 100000.00
    },
    {
      "id_servicio": 2,
      "nombre": "Registro de Marca (Certificación de marca)",
      "precio_base": 500000.00
    }
  ]
}
```

### Paso 2: Mostrar Modal con Formulario
- Usar el ID del servicio seleccionado
- Mostrar solo los campos requeridos según el servicio
- Aplicar validaciones en tiempo real

### Paso 3: Enviar Solicitud
```http
POST /api/gestion-solicitudes/crear/{id_servicio}
Authorization: Bearer {token}
Content-Type: application/json

{
  // ... campos del formulario
}
```

### Paso 4: Manejar Respuesta

**Éxito (201):**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "orden_id": 123,
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes"
    },
    "estado": "Pendiente",
    "fecha_solicitud": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": ["nombre_marca", "logotipo"],
  "camposRequeridos": ["nombre_marca", "logotipo", "tipo_producto_servicio"]
}
```

---

## 📱 Ejemplo de Implementación Frontend (React)

### Componente de Modal Genérico

```jsx
import React, { useState } from 'react';

const ModalCrearSolicitud = ({ servicio, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Obtener campos requeridos según el servicio
  const camposRequeridos = obtenerCamposRequeridos(servicio.nombre);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    const camposFaltantes = validarCamposRequeridos(formData, camposRequeridos);
    if (camposFaltantes.length > 0) {
      setErrors({ general: `Faltan campos: ${camposFaltantes.join(', ')}` });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/gestion-solicitudes/crear/${servicio.id_servicio}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        onSuccess(data);
        onClose();
      } else {
        setErrors({ general: data.mensaje || 'Error al crear solicitud' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (field, file) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ [field]: 'El archivo no puede exceder 5MB' });
      return;
    }

    const base64 = await convertToBase64(file);
    setFormData({ ...formData, [field]: base64 });
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        {/* Renderizar campos según el servicio */}
        {renderCampos(formData, setFormData, errors, camposRequeridos)}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Solicitud'}
        </button>
      </form>
    </div>
  );
};

// Función auxiliar para convertir archivo a Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export default ModalCrearSolicitud;
```

---

## 🔐 Notas de Seguridad

1. **Autenticación:**
   - Todos los endpoints requieren token JWT válido
   - El token debe incluirse en el header `Authorization: Bearer {token}`

2. **Validación de Roles:**
   - **Cliente:** El `id_cliente` se toma automáticamente del token
   - **Administrador/Empleado:** Debe incluir `id_cliente` en el body

3. **Archivos:**
   - Validar tamaño máximo (5MB recomendado)
   - Validar tipo de archivo (PDF, JPG, PNG)
   - Sanitizar nombres de archivo antes de procesar

4. **Datos Sensibles:**
   - No loguear datos completos en el frontend
   - No exponer tokens en consola del navegador

---

## 📞 Soporte

Para más información sobre la API, consultar:
- `README.md` - Documentación general de la API
- `GUIA_CAMPOS_SERVICIOS_POSTMAN.md` - Ejemplos de Postman
- Endpoint de servicios: `GET /api/servicios`

---

**Última actualización:** Enero 2025  
**Versión del Documento:** 1.0

