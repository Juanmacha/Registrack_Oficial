import React, { useState } from 'react';
import { X } from 'lucide-react';

// Información detallada de los servicios
const SERVICE_DETAILS = {
  'Certificación de Marca': {
    descripcion: 'Certificar tu marca es asegurar legalmente tu identidad comercial y evitar que otros se beneficien de lo que tú construiste. Al hacerlo con nosotros, obtienes respaldo jurídico, asesoría profesional y más de 12 años de experiencia acompañando a emprendedores, empresas y visionarios en el registro nacional e internacional de sus marcas.',
    beneficios: [
      'Protección jurídica exclusiva sobre tu marca registrada.',
      'Asesoría experta con más de 12 años de experiencia.',
      'Trámite rápido, confiable y garantizado ante la Cámara de Comercio.',
      'Defensa legal ante oposiciones o conflictos por similitud.',
      'Mayor valor comercial y posicionamiento de tu marca en el mercado.'
    ],
    proceso: [
      { titulo: 'Consulta inicial', descripcion: 'Evaluamos la viabilidad de tu marca y te asesoramos sobre el proceso.' },
      { titulo: 'Recolección de documentos', descripcion: 'Te guiamos en la preparación de todos los documentos necesarios.' },
      { titulo: 'Presentación ante SIC', descripcion: 'Realizamos el trámite oficial ante la Superintendencia de Industria y Comercio.' },
      { titulo: 'Seguimiento y defensa', descripcion: 'Monitoreamos el proceso y defendemos tu marca ante cualquier oposición.' }
    ],
    requisitos: [
      'Documento de identidad del titular',
      'Certificado de existencia y representación legal',
      'Logotipo de la marca en alta resolución',
      'Clasificación de productos/servicios según Niza',
      'Poder de representación (si aplica)'
    ],
    tiempo: '6-8 meses',
    costo: 'Desde $2.500.000'
  },
  'Búsqueda de Antecedentes': {
    descripcion: 'Verifica si una marca, nombre comercial o logotipo ya está registrado o en proceso de trámite ante la SIC. Este análisis previo te ayuda a identificar posibles conflictos legales y marcas similares antes de iniciar el proceso de registro. Realizamos una búsqueda exhaustiva en bases de datos oficiales, analizando similitudes fonéticas, gráficas y conceptuales. Con más de 12 años de experiencia, te ofrecemos asesoría legal especializada para proteger tu marca.',
    beneficios: [
      'Evita registrar una marca que ya existe, ahorrando tiempo y recursos.',
      'Identifica similitudes que puedan generar conflictos legales futuros.',
      'Asegura la viabilidad de tu marca antes de iniciar el proceso de registro.',
      'Análisis exhaustivo por clase o categoría según la clasificación de Niza de la SIC.',
      'Asesoría legal completa durante todo el proceso de búsqueda.',
      'Reporte detallado con recomendaciones estratégicas para tu marca.',
      'Prevención de oposiciones y rechazos en etapas posteriores del registro.',
      'Identificación temprana de marcas similares que puedan afectar tu solicitud.'
    ],
    proceso: [
      { titulo: 'Análisis de viabilidad inicial', descripcion: 'Evaluamos tu propuesta de marca, analizamos las clases de productos o servicios que deseas proteger y definimos la estrategia de búsqueda más adecuada para tu caso específico.' },
      { titulo: 'Búsqueda exhaustiva en bases de datos', descripcion: 'Realizamos una búsqueda completa en las bases de datos oficiales de la SIC, verificando marcas registradas, en trámite y nombres comerciales similares o idénticos.' },
      { titulo: 'Análisis de similitudes y conflictos', descripcion: 'Evaluamos fonéticamente, gráficamente y conceptualmente las similitudes encontradas, identificando posibles conflictos y riesgos legales para tu marca.' },
      { titulo: 'Elaboración y entrega de reporte', descripcion: 'Te entregamos un informe completo y detallado con los resultados de la búsqueda, análisis de riesgos y recomendaciones legales para proteger tu marca de manera efectiva.' }
    ],
    requisitos: [
      'Nombre de la marca, logotipo o elemento distintivo a consultar',
      'Clasificación de productos o servicios según Niza (Clase Niza)',
      'Información completa del solicitante (nombre, documento de identidad, contacto)',
      'Descripción detallada del signo distintivo a registrar',
      'Especificación de las clases de productos o servicios de interés',
      'Imagen o diseño del logotipo (si aplica)'
    ],
    tiempo: '3-5 días hábiles',
    costo: 'Desde $150.000'
  },
  'Renovación de Marca': {
    descripcion: 'La renovación de marca es el proceso mediante el cual se extiende la vigencia de un registro de marca por períodos adicionales de 10 años, manteniendo así la protección legal sobre tu activo más valioso.',
    beneficios: [
      'Mantiene la protección legal de tu marca.',
      'Evita la pérdida de derechos exclusivos.',
      'Conserva el valor comercial acumulado.',
      'Proceso simplificado y ágil.',
      'Asesoría especializada en renovaciones.'
    ],
    proceso: [
      { titulo: 'Verificación de vencimiento', descripcion: 'Confirmamos las fechas de vencimiento de tu marca.' },
      { titulo: 'Preparación de documentos', descripcion: 'Recopilamos y organizamos la documentación necesaria.' },
      { titulo: 'Presentación de renovación', descripcion: 'Realizamos el trámite oficial ante la SIC.' },
      { titulo: 'Seguimiento del proceso', descripcion: 'Monitoreamos hasta la obtención del nuevo certificado.' }
    ],
    requisitos: [
      'Certificado de registro vigente',
      'Documento de identidad del titular',
      'Certificado de existencia y representación',
      'Poder de representación (si aplica)',
      'Comprobante de uso de la marca'
    ],
    tiempo: '2-3 meses',
    costo: 'Desde $1.800.000'
  },
  'Cesión de Marca': {
    descripcion: 'La cesión de marca es el proceso mediante el cual se transfiere la titularidad de una marca registrada de una persona natural o jurídica a otra, manteniendo todos los derechos y obligaciones asociados.',
    beneficios: [
      'Transferencia legal de titularidad.',
      'Mantiene todos los derechos de la marca.',
      'Proceso seguro y respaldado legalmente.',
      'Asesoría en valoración de marca.',
      'Documentación completa del proceso.'
    ],
    proceso: [
      { titulo: 'Evaluación de la cesión', descripcion: 'Analizamos la viabilidad legal de la transferencia.' },
      { titulo: 'Preparación de documentos', descripcion: 'Elaboramos el contrato de cesión y documentos legales.' },
      { titulo: 'Registro ante SIC', descripcion: 'Presentamos la solicitud de cambio de titularidad.' },
      { titulo: 'Seguimiento y certificación', descripcion: 'Monitoreamos hasta obtener el nuevo certificado.' }
    ],
    requisitos: [
      'Certificado de registro de la marca',
      'Documentos de identidad de cedente y cesionario',
      'Contrato de cesión debidamente firmado',
      'Certificados de existencia y representación',
      'Poder de representación (si aplica)'
    ],
    tiempo: '3-4 meses',
    costo: 'Desde $2.200.000'
  },
  'Ampliación de Alcance': {
    descripcion: 'La ampliación de alcance permite extender la protección de tu marca a nuevas clases de productos o servicios, ampliando así el campo de acción comercial de tu marca registrada.',
    beneficios: [
      'Amplía la protección de tu marca.',
      'Permite diversificar tu oferta comercial.',
      'Fortalece la posición competitiva.',
      'Proceso eficiente y especializado.',
      'Asesoría en estrategia comercial.'
    ],
    proceso: [
      { titulo: 'Análisis de nuevas clases', descripcion: 'Evaluamos las clases adicionales que deseas proteger.' },
      { titulo: 'Búsqueda de antecedentes', descripcion: 'Verificamos disponibilidad en las nuevas clases.' },
      { titulo: 'Preparación de solicitud', descripcion: 'Elaboramos la documentación para la ampliación.' },
      { titulo: 'Presentación y seguimiento', descripcion: 'Realizamos el trámite y monitoreamos el proceso.' }
    ],
    requisitos: [
      'Certificado de registro vigente',
      'Documento de identidad del titular',
      'Especificación de nuevas clases',
      'Certificado de existencia y representación',
      'Poder de representación (si aplica)'
    ],
    tiempo: '4-6 meses',
    costo: 'Desde $1.500.000'
  },
  'Presentación de Oposición': {
    descripcion: 'La presentación de oposición es el mecanismo legal mediante el cual puedes oponerte al registro de una marca que consideras similar o idéntica a la tuya, protegiendo así tus derechos de propiedad intelectual.',
    beneficios: [
      'Protege tus derechos de marca existente.',
      'Evita confusión en el mercado.',
      'Defiende tu posición competitiva.',
      'Asesoría legal especializada.',
      'Representación ante autoridades.'
    ],
    proceso: [
      { titulo: 'Análisis de similitud', descripcion: 'Evaluamos el grado de similitud entre las marcas.' },
      { titulo: 'Preparación de argumentos', descripcion: 'Desarrollamos la estrategia legal de oposición.' },
      { titulo: 'Presentación de oposición', descripcion: 'Realizamos el trámite oficial ante la SIC.' },
      { titulo: 'Seguimiento del proceso', descripcion: 'Monitoreamos y defendemos tu posición.' }
    ],
    requisitos: [
      'Certificado de marca registrada',
      'Documento de identidad del opositor',
      'Análisis de similitud detallado',
      'Pruebas de uso de la marca',
      'Poder de representación (si aplica)'
    ],
    tiempo: '6-12 meses',
    costo: 'Desde $3.000.000'
  },
  'Respuesta a Oposición': {
    descripcion: 'La respuesta a oposición es el proceso mediante el cual defiendes tu solicitud de marca cuando otra persona se opone a su registro, presentando argumentos legales y pruebas que respalden tu derecho al registro.',
    beneficios: [
      'Defiende tu solicitud de marca.',
      'Presenta argumentos legales sólidos.',
      'Mantiene la viabilidad de tu registro.',
      'Asesoría legal especializada.',
      'Representación ante autoridades.'
    ],
    proceso: [
      { titulo: 'Análisis de la oposición', descripcion: 'Evaluamos los argumentos presentados por el opositor.' },
      { titulo: 'Desarrollo de defensa', descripcion: 'Elaboramos la estrategia de respuesta legal.' },
      { titulo: 'Presentación de respuesta', descripcion: 'Realizamos el trámite oficial de respuesta.' },
      { titulo: 'Seguimiento del proceso', descripcion: 'Monitoreamos hasta la resolución final.' }
    ],
    requisitos: [
      'Solicitud de marca en trámite',
      'Documento de identidad del solicitante',
      'Análisis de diferencias entre marcas',
      'Pruebas de uso y distintividad',
      'Poder de representación (si aplica)'
    ],
    tiempo: '6-12 meses',
    costo: 'Desde $2.800.000'
  }
};

// Crear mapeo de variantes de nombres para búsqueda flexible
const MAPEO_NOMBRES_SERVICIOS = {
  'búsqueda de antecedentes': 'Búsqueda de Antecedentes',
  'busqueda de antecedentes': 'Búsqueda de Antecedentes',
  'búsqueda de antecedente': 'Búsqueda de Antecedentes',
  'busqueda antecedentes': 'Búsqueda de Antecedentes',
  'certificación de marca': 'Certificación de Marca',
  'certificacion de marca': 'Certificación de Marca',
  'renovación de marca': 'Renovación de Marca',
  'renovacion de marca': 'Renovación de Marca',
  'cesión de marca': 'Cesión de Marca',
  'cesion de marca': 'Cesión de Marca',
  'ampliación de alcance': 'Ampliación de Alcance',
  'ampliacion de alcance': 'Ampliación de Alcance',
  'presentación de oposición': 'Presentación de Oposición',
  'presentacion de oposicion': 'Presentación de Oposición',
  'respuesta a oposición': 'Respuesta a Oposición',
  'respuesta a oposicion': 'Respuesta a Oposición'
};

const ServiceModal = ({ isOpen, onClose, servicio }) => {
  const [activeTab, setActiveTab] = useState('descripcion');

  if (!isOpen || !servicio) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Obtener información detallada del servicio - intentar múltiples formas de búsqueda
  const nombreServicio = servicio.nombre || servicio.landing_data?.titulo || '';
  
  // Buscar en SERVICE_DETAILS de forma flexible (case-insensitive y con variantes)
  const encontrarServiceDetails = (nombre) => {
    if (!nombre) return {};
    
    // Búsqueda exacta
    if (SERVICE_DETAILS[nombre]) return SERVICE_DETAILS[nombre];
    
    // Búsqueda en mapeo de variantes
    const nombreNormalizado = nombre.toLowerCase().trim();
    if (MAPEO_NOMBRES_SERVICIOS[nombreNormalizado]) {
      const nombreMapeado = MAPEO_NOMBRES_SERVICIOS[nombreNormalizado];
      if (SERVICE_DETAILS[nombreMapeado]) return SERVICE_DETAILS[nombreMapeado];
    }
    
    // Búsqueda case-insensitive en SERVICE_DETAILS
    const claveEncontrada = Object.keys(SERVICE_DETAILS).find(
      clave => clave.toLowerCase() === nombreNormalizado
    );
    
    if (claveEncontrada) return SERVICE_DETAILS[claveEncontrada];
    
    // Búsqueda parcial (por si el nombre contiene palabras clave)
    const palabrasClave = nombreNormalizado.split(' ').filter(p => p.length > 3);
    if (palabrasClave.length > 0) {
      const claveParcial = Object.keys(SERVICE_DETAILS).find(
        clave => palabrasClave.some(palabra => clave.toLowerCase().includes(palabra))
      );
      if (claveParcial) return SERVICE_DETAILS[claveParcial];
    }
    
    return {};
  };
  
  const serviceDetails = encontrarServiceDetails(nombreServicio) || 
                         encontrarServiceDetails(servicio.nombre) || 
                         encontrarServiceDetails(servicio.landing_data?.titulo) ||
                         {};
  
  // Log para debug
  console.log('🔍 [ServiceModal] Buscando información para servicio:', {
    nombre: servicio.nombre,
    titulo: servicio.landing_data?.titulo,
    nombreServicio: nombreServicio,
    encontrado: Object.keys(serviceDetails).length > 0,
    clavesDisponibles: Object.keys(SERVICE_DETAILS),
    serviceDetailsKeys: Object.keys(serviceDetails)
  });
  
  // Obtener estados del proceso del servicio
  const processStates = servicio.process_states || [];

  // Definir las pestañas disponibles
  const tabs = [
    { id: 'descripcion', label: 'Descripción' },
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'requisitos', label: 'Requisitos' },
    { id: 'informacion', label: 'Información' }
  ];

  // Renderizar contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'descripcion':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[#275FAA] mb-4 title-secondary">
                ¿Qué es {servicio.landing_data?.titulo || servicio.nombre}?
              </h3>
              <p className="text-gray-700 text-body leading-relaxed text-lg">
                {servicio.landing_data?.resumen || servicio.descripcion_corta || serviceDetails.descripcion || 'Este servicio te permite proteger y gestionar tu marca de manera profesional.'}
              </p>
            </div>
            {serviceDetails.descripcion && !servicio.landing_data?.resumen && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-700 text-body leading-relaxed">
                  {serviceDetails.descripcion}
                </p>
              </div>
            )}
            {serviceDetails.descripcion && servicio.landing_data?.resumen && servicio.landing_data?.resumen !== serviceDetails.descripcion && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-700 text-body leading-relaxed">
                  {serviceDetails.descripcion}
                </p>
              </div>
            )}
          </div>
        );

      case 'beneficios':
        return (
          <div>
            <h3 className="text-xl font-semibold text-[#275FAA] mb-4 title-secondary">
              Beneficios
            </h3>
            {serviceDetails.beneficios && serviceDetails.beneficios.length > 0 ? (
              <ul className="space-y-3">
                {serviceDetails.beneficios.map((beneficio, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-body">{beneficio}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-body">No hay información de beneficios disponible.</p>
            )}
          </div>
        );

      case 'requisitos':
        return (
          <div>
            <h3 className="text-xl font-semibold text-[#275FAA] mb-4 title-secondary">
              Requisitos
            </h3>
            {serviceDetails.requisitos && serviceDetails.requisitos.length > 0 ? (
              <ul className="space-y-2">
                {serviceDetails.requisitos.map((requisito, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-[#275FAA] rounded-full mt-2"></div>
                    <span className="text-gray-700 text-body">{requisito}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-body">No hay información de requisitos disponible.</p>
            )}
          </div>
        );

      case 'informacion':
        return (
          <div className="space-y-6">
            {/* Estados del Proceso */}
            {processStates && processStates.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-[#275FAA] title-secondary">
                  Estados del Proceso
                </h3>
                <div className="space-y-2">
                  {processStates.map((state, index) => (
                    <div key={state.id || index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex-shrink-0 w-7 h-7 bg-[#275FAA] text-white rounded-full flex items-center justify-center font-semibold text-xs">
                        {state.order || index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{state.name}</h4>
                        {state.descripcion && (
                          <p className="text-gray-600 text-xs mt-0.5">{state.descripcion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proceso (si existe en SERVICE_DETAILS pero no en process_states) */}
            {serviceDetails.proceso && (!processStates || processStates.length === 0) && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-[#275FAA] title-secondary">
                  Proceso
                </h3>
                <div className="space-y-2">
                  {serviceDetails.proceso.map((paso, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex-shrink-0 w-7 h-7 bg-[#275FAA] text-white rounded-full flex items-center justify-center font-semibold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{paso.titulo}</h4>
                        <p className="text-gray-600 text-xs mt-0.5">{paso.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional (Tiempo y Costo) */}
            {(serviceDetails.tiempo || serviceDetails.costo) && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#275FAA] title-secondary">
                  Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceDetails.tiempo && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-[#275FAA] mb-2 title-secondary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tiempo de Procesamiento
                      </h4>
                      <p className="text-gray-700 text-body font-medium">{serviceDetails.tiempo}</p>
                    </div>
                  )}
                  {serviceDetails.costo && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-[#275FAA] mb-2 title-secondary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Costo Aproximado
                      </h4>
                      <p className="text-gray-700 text-body font-medium">
                        {(() => {
                          // Extraer el valor numérico del costo (remover "Desde $" y puntos)
                          const costoMatch = serviceDetails.costo?.match(/Desde \$([0-9.,]+)/);
                          if (costoMatch) {
                            const costoCOP = parseInt(costoMatch[1].replace(/\./g, ''));
                            // Conversión aproximada COP a USD (usando tasa ~4,000 COP por USD)
                            const costoUSD = Math.round(costoCOP / 4000);
                            return `COP $${costoCOP.toLocaleString('es-CO')} / USD $${costoUSD.toLocaleString('en-US')}`;
                          }
                          return serviceDetails.costo;
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay información completa */}
            {(!processStates || processStates.length === 0) && 
             (!serviceDetails.proceso || serviceDetails.proceso.length === 0) && 
             !serviceDetails.tiempo && 
             !serviceDetails.costo && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-body">
                  La información detallada de este servicio está en proceso de actualización. 
                  Por favor, contacta con nuestro equipo para más información.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative">
          <img
            src={servicio.landing_data?.imagen || "/images/certificacion.jpg"}
            alt={servicio.landing_data?.titulo || servicio.nombre}
            className="w-full h-48 object-cover rounded-t-2xl"
            onError={e => { e.target.src = "/images/certificacion.jpg"; }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h2 className="text-2xl font-bold text-white title-primary">
              {servicio.landing_data?.titulo || servicio.nombre}
            </h2>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#275FAA] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-[#275FAA] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#163366] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
