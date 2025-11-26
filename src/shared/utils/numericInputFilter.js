/**
 * Utilidad para filtrar solo números en inputs
 * Previene que se muestren letras en campos numéricos como teléfono y documento
 */

/**
 * Filtra solo números de una cadena de texto
 * @param {string} value - Valor a filtrar
 * @param {Object} options - Opciones de filtrado
 * @param {boolean} options.allowPlus - Permite el símbolo + (útil para teléfonos internacionales)
 * @param {boolean} options.allowSpaces - Permite espacios (útil para formateo de teléfonos)
 * @param {boolean} options.allowDashes - Permite guiones (útil para formateo)
 * @param {boolean} options.allowParentheses - Permite paréntesis (útil para formateo de teléfonos)
 * @returns {string} - Valor filtrado con solo números
 */
export const filterNumericInput = (value, options = {}) => {
  // Si el valor es null, undefined o vacío, devolver cadena vacía
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const {
    allowPlus = false,
    allowSpaces = false,
    allowDashes = false,
    allowParentheses = false
  } = options;

  // Convertir a string
  let filtered = String(value);

  // Construir regex dinámicamente según opciones
  let regex = '';
  
  if (allowPlus) regex += '+';
  if (allowSpaces) regex += '\\s';
  if (allowDashes) regex += '-';
  if (allowParentheses) regex += '\\(\\)';
  
  // Remover todo excepto números y caracteres permitidos
  if (regex) {
    const allowedChars = `0-9${regex}`;
    filtered = filtered.replace(new RegExp(`[^${allowedChars}]`, 'g'), '');
  } else {
    // Solo números - remover cualquier cosa que no sea dígito
    filtered = filtered.replace(/\D/g, '');
  }

  return filtered;
};

/**
 * Handler para eventos onChange que filtra solo números
 * Útil para campos de número de documento
 * @param {Event} e - Evento del input
 * @param {Function} onChange - Función onChange original
 * @param {Object} options - Opciones de filtrado
 */
export const handleNumericChange = (e, onChange, options = {}) => {
  if (!e || !e.target) {
    return;
  }
  
  const originalValue = String(e.target.value || '');
  const filteredValue = filterNumericInput(originalValue, options);
  
  // Si el valor no cambió (ya era válido), pasar el evento normalmente
  if (originalValue === filteredValue) {
    if (onChange) {
      onChange(e);
    }
    return;
  }
  
  // Modificar directamente el valor del target antes de que React lo lea
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  
  if (nativeInputValueSetter) {
    // Usar el setter nativo para actualizar el valor del input
    nativeInputValueSetter.call(e.target, filteredValue);
  } else {
    e.target.value = filteredValue;
  }
  
  // Crear un evento input para que React lo detecte
  const inputEvent = new Event('input', { bubbles: true });
  e.target.dispatchEvent(inputEvent);
  
  // Llamar al onChange con el evento modificado
  // El valor ya está actualizado en e.target.value
  if (onChange) {
    onChange(e);
  }
};

/**
 * Handler para eventos onKeyDown que previene que se escriban caracteres no numéricos
 * @param {Event} e - Evento del teclado
 * @param {Object} options - Opciones de filtrado
 */
export const handleNumericKeyDown = (e, options = {}) => {
  const {
    allowPlus = false,
    allowSpaces = false,
    allowDashes = false,
    allowParentheses = false
  } = options;

  // Permitir teclas especiales (backspace, delete, tab, escape, enter, etc.)
  const teclasPermitidas = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];

  if (teclasPermitidas.includes(e.key)) {
    return; // Permitir la tecla
  }

  // Permitir Ctrl/Cmd + A, C, V, X (seleccionar, copiar, pegar, cortar)
  if (e.ctrlKey || e.metaKey) {
    if (['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return; // Permitir la combinación
    }
  }

  // Construir regex de caracteres permitidos
  let regexPermitido = /[0-9]/;
  
  if (allowPlus && e.key === '+') return;
  if (allowSpaces && e.key === ' ') return;
  if (allowDashes && e.key === '-') return;
  if (allowParentheses && (e.key === '(' || e.key === ')')) return;

  // Si la tecla no es un número ni un carácter permitido, prevenir la entrada
  if (!regexPermitido.test(e.key)) {
    e.preventDefault();
    return false;
  }
};

/**
 * Handler específico para teléfonos (permite +, espacios, guiones y paréntesis)
 * @param {Event} e - Evento del input
 * @param {Function} onChange - Función onChange original
 */
export const handlePhoneChange = (e, onChange) => {
  handleNumericChange(e, onChange, {
    allowPlus: true,
    allowSpaces: true,
    allowDashes: true,
    allowParentheses: true
  });
};

/**
 * Handler onKeyDown para teléfonos (permite formato telefónico)
 * @param {Event} e - Evento del teclado
 */
export const handlePhoneKeyDown = (e) => {
  handleNumericKeyDown(e, {
    allowPlus: true,
    allowSpaces: true,
    allowDashes: true,
    allowParentheses: true
  });
};

/**
 * Handler específico para números de documento (solo números)
 * @param {Event} e - Evento del input
 * @param {Function} onChange - Función onChange original
 */
export const handleDocumentNumberChange = (e, onChange) => {
  handleNumericChange(e, onChange, {
    allowPlus: false,
    allowSpaces: false,
    allowDashes: false,
    allowParentheses: false
  });
};

/**
 * Handler onKeyDown para números de documento (previene escribir letras)
 * @param {Event} e - Evento del teclado
 */
export const handleDocumentNumberKeyDown = (e) => {
  handleNumericKeyDown(e, {
    allowPlus: false,
    allowSpaces: false,
    allowDashes: false,
    allowParentheses: false
  });
};

/**
 * Handler para prevenir que se peguen letras (en eventos onPaste)
 * @param {Event} e - Evento de paste
 * @param {Object} options - Opciones de filtrado
 */
export const handleNumericPaste = (e, options = {}) => {
  e.preventDefault();
  const pastedText = (e.clipboardData || window.clipboardData).getData('text');
  const filtered = filterNumericInput(pastedText, options);
  
  // Insertar el texto filtrado en el input
  const input = e.target;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const currentValue = input.value;
  
  const newValue = currentValue.substring(0, start) + filtered + currentValue.substring(end);
  input.value = newValue;
  
  // Disparar evento input para que React lo capture
  const inputEvent = new Event('input', { bubbles: true });
  input.dispatchEvent(inputEvent);
  
  // Ajustar la posición del cursor
  const newCursorPos = start + filtered.length;
  input.setSelectionRange(newCursorPos, newCursorPos);
};

