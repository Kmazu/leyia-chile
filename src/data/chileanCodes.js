/**
 * Base de Datos Legal Chilena Enriquecida y Motor de Análisis Inteligente
 * Cubre Código Penal (Incendio, Homicidios, Lesiones entre particulares, Hurto Menor), Ley Emilia, Ley Cholito,
 * Código Procesal Penal (Acuerdos Reparatorios), Código del Trabajo, Ley Devuélveme mi Casa, SERNAC y Familia.
 */

import { legalClassifierEngine } from '../services/legalClassifierEngine';

export const LEGAL_CATEGORIES = [
  { id: 'all', name: 'Todas las Áreas', icon: 'Scale' },
  { id: 'penal', name: 'Penal y Tránsito', icon: 'ShieldAlert' },
  { id: 'laboral', name: 'Derecho del Trabajo', icon: 'Briefcase' },
  { id: 'civil', name: 'Civil y Arriendos', icon: 'Home' },
  { id: 'consumidor', name: 'Consumidor (SERNAC)', icon: 'ShoppingCart' },
  { id: 'familia', name: 'Derecho de Familia', icon: 'Users' }
];

export const PRESET_SCENARIOS = [
  {
    id: 'agresion_vecino',
    category: 'penal',
    title: 'Agresión Física y Lesiones a Vecino',
    prompt: 'Mi tío fue y le pegó al vecino, ¿qué le pasará si lo denuncian?',
    tag: 'Art. 399 & 494 N° 5 CP',
    badge: 'Penal'
  },
  {
    id: 'hurto_escaso_valor',
    category: 'penal',
    title: 'Hurto de Especie de Escaso Valor',
    prompt: 'Ayer robé una manzana de un negocio y maté un pajarito en el patio, ¿me puede pasar algo?',
    tag: 'Art. 494 N° 19 CP',
    badge: 'Falta Menor'
  },
  {
    id: 'incendio_muerte',
    category: 'penal',
    title: 'Incendio de Inmueble con Personas',
    prompt: 'Ayer quemé mi casa con mi suegra adentro y me fui, ¿qué me puede pasar?',
    tag: 'Código Penal (Art. 474)',
    badge: 'Gravísimo'
  },
  {
    id: 'atropello_mascota',
    category: 'penal',
    title: 'Accidente / Atropello a Mascota',
    prompt: 'Ayer atropellé a un perrito en la mitad de la calle y me fui, ¿me puede pasar algo?',
    tag: 'Ley Cholito N° 21.020',
    badge: 'Policía Local'
  },
  {
    id: 'despido_injustificado',
    category: 'laboral',
    title: 'Despido Injustificado / Sin Finiquito',
    prompt: 'Me despidieron verbalmente por necesidades de la empresa pero no me enviaron carta ni me han pagado el finiquito.',
    tag: 'Código del Trabajo',
    badge: 'Alto Riesgo'
  },
  {
    id: 'no_pago_arriendo',
    category: 'civil',
    title: 'Arrendatario Moroso (No Pago de Renta)',
    prompt: 'Tengo un departamento arrendado y el inquilino lleva 3 meses sin pagar la renta ni los gastos comunes.',
    tag: 'Ley Devuélveme mi Casa',
    badge: 'Acción Civil'
  }
];

export const KNOWLEDGE_BASE = {
  agresion_vecino: {
    title: "Delito o Falta de Lesiones Corporales entre Particulares",
    category: "penal",
    subjectDetected: "Persona / Vecino (Lesiones)",
    riskLevel: "LESIONES Y PROCEDIMIENTO PENAL",
    riskColor: "#f97316",
    codesReferenced: [
      "Código Penal Chileno (Art. 399 - Lesiones Menos Graves)",
      "Código Penal Chileno (Art. 494 N° 5 - Lesiones Leves)",
      "Código Procesal Penal (Art. 241 - Acuerdos Reparatorios)"
    ],
    summary: "Agredir físicamente a un vecino constituye una falta o delito de Lesiones. La pena depende de la gravedad médica demostrada en el dato de atención de urgencia (SAPU/Hospital/SML). No arriesga presidio efectivo si es la primera vez y no hay secuelas graves.",
    legalDetails: [
      {
        article: "Art. 494 N° 5 - Lesiones Leves",
        description: "Si los golpes causaron solo hematomas o contusiones menores (recuperación menor a 7 días), se sanciona únicamente con multa de 1 a 4 UTM sin cárcel."
      },
      {
        article: "Art. 399 - Lesiones Menos Graves",
        description: "Si requirieron puntos o incapacidad de 8 a 30 días, la pena es presidio de 61 a 540 días, cumpliéndose en libertad (remisión condicional) si no registra antecedentes penales."
      },
      {
        article: "Art. 241 CPP - Acuerdo Reparatorio",
        description: "La ley chilena permite cerrar la causa penal mediante un Acuerdo Reparatorio (pago de gastos médicos o disculpa) sin ir a juicio ni quedar con antecedentes."
      }
    ],
    actionSteps: [
      "Esperar citación de la Fiscalía o solicitar asistencia de la Defensoría Penal Pública.",
      "Respetar de forma estricta cualquier prohibición de acercamiento (Art. 155 CPP).",
      "Evaluar proponer un Acuerdo Reparatorio para pagar gastos médicos y sobreseer la causa."
    ],
    documentsAvailable: [
      { id: 'minuta_acuerdo_reparatorio', title: 'Modelo de Propuesta de Acuerdo Reparatorio Lesiones', format: 'DOCX / PDF' }
    ],
    proStrategy: "Si no registra condenas previas, solicitar en la primera audiencia un Acuerdo Reparatorio o Suspensión Condicional con prohibición de acercamiento para no generar prontuario."
  },

  hurto_escaso_valor: {
    title: "Falta de Hurto de Especie de Escaso Valor",
    category: "penal",
    subjectDetected: "Fruta / Especie de Escaso Valor",
    riskLevel: "BAJO / FALTA MENOR",
    riskColor: "#34d399",
    codesReferenced: [
      "Código Penal Chileno (Art. 494 N° 19 - Hurto de Escaso Valor)",
      "Ley N° 19.473 (Ley de Caza y Fauna Silvestre)"
    ],
    summary: "Sustraer un objeto o fruta de valor ínfimo (como una manzana) sin violencia ni fuerza constituye una falta menor. No arriesga cárcel ni antecedentes graves. La muerte de un ave común no configura delito penal a menos que sea especie silvestre protegida.",
    legalDetails: [
      {
        article: "Art. 494 N° 19 - Código Penal",
        description: "El hurto de cosas cuyo valor no exceda de 1 UTM se sanciona con multa de 1 a 4 UTM en el Juzgado de Garantía o de Policía Local, sin pena privativa de libertad."
      },
      {
        article: "Fauna y Maltrato Animal",
        description: "La muerte accidental de un ave silvestre común no constituye delito penal. Solo las especies silvestres protegidas (Ley de Caza) o la crueldad intencional hacia mascotas ajenas (Art. 291 bis CP) conllevan sanciones."
      }
    ],
    actionSteps: [
      "En caso de citación, abonar la multa fijada por el juez.",
      "No requiere designación de defensor penal privado."
    ],
    documentsAvailable: [],
    proStrategy: "Solicitar el pago voluntario anticipado de la multa para obtener rebaja del 25% de la sanción."
  },

  greeting_welcome: {
    title: "¡Hola! Bienvenido a LeyIA Chile ⚖️",
    category: "general",
    subjectDetected: "Asistente de Inteligencia Legal",
    riskLevel: "INFORMACIÓN VIRTUAL",
    riskColor: "#6366f1",
    codesReferenced: [
      "Plataforma de Inteligencia Legal Adaptativa en Chile",
      "Cobertura: Código Penal, Civil, Trabajo, Tránsito, Consumidor y Familia"
    ],
    summary: "¡Hola! Soy el asistente virtual de LeyIA Chile. ¿En qué situación o duda legal sobre la legislación chilena te puedo ayudar hoy? Puedes redactar tu caso en lenguaje natural en el cuadro superior.",
    legalDetails: [
      {
        article: "Derecho Penal y Tránsito",
        description: "Consultas sobre accidentes de tránsito, Ley Emilia, Ley Cholito (mascotas), agresiones, hurtos y delitos en general."
      },
      {
        article: "Derecho del Trabajo",
        description: "Despidos injustificados, finiquitos, nulidad por Ley Bustos, autodespido y acoso laboral (Ley Karin)."
      },
      {
        article: "Civil, Arriendos y Consumidor",
        description: "Juicios de arriendo (Ley Devuélveme mi Casa 21.461), mes de garantía, embargos y garantía legal SERNAC."
      }
    ],
    actionSteps: [
      "Escribe tu caso en el cuadro de texto especificando qué ocurrió.",
      "Revisa la evaluación de riesgos, los artículos de ley aplicables y la hoja de ruta.",
      "Descarga minutas o exporta el informe dossier para tu abogado."
    ],
    documentsAvailable: [],
    proStrategy: "Para obtener el diagnóstico más exacto, incluye detalles de los sujetos involucrados y si hubo avisos o documentos firmados."
  },

  greeting_thanks: {
    title: "¡De nada! Estamos para ayudarte 🤝",
    category: "general",
    subjectDetected: "Asistente Virtual LeyIA",
    riskLevel: "CORTESÍA VIRTUAL",
    riskColor: "#10b981",
    codesReferenced: [
      "LeyIA Chile — Orientación y Resguardo Jurídico"
    ],
    summary: "¡Fue un gusto orientarte! Recuerda que puedes guardar o imprimir tu dossier preliminar si necesitas acudir a una consulta legal con un abogado o institución oficial.",
    legalDetails: [
      {
        article: "Resguardo de Información",
        description: "Tus datos han sido procesados conforme a la Ley 19.628 de Protección de Datos Personales de Chile."
      }
    ],
    actionSteps: [
      "Si tienes otra duda en el futuro, regresa a LeyIA Chile para analizarla en tiempo real."
    ],
    documentsAvailable: [],
    proStrategy: ""
  },

  incendio_muerte: {
    title: "Incendio de Lugar Habitado con Resultado de Muerte",
    category: "penal",
    subjectDetected: "Ser Humano (Persona)",
    riskLevel: "GRAVÍSIMO (PRESIDIO PERPETUO)",
    riskColor: "#dc2626",
    codesReferenced: [
      "Código Penal Chileno (Art. 474 y 475)",
      "Código Penal (Art. 391 N° 1 - Homicidio Calificado)",
      "Código Procesal Penal (Art. 140 - Prisión Preventiva)"
    ],
    summary: "Provocar un incendio en una casa u objeto habitado produciendo la muerte de una persona es uno de los delitos más gravosos en Chile. Conlleva la máxima pena privativa de libertad contemplada por la legislación nacional.",
    legalDetails: [
      {
        article: "Art. 474 - Código Penal de Chile",
        description: "El que incendiare edificio o casa habitada sufriendo muerte a causa del incendio, será castigado con presidio mayor en su grado máximo a PRESIDIO PERPETUO CALIFICADO."
      },
      {
        article: "Presidio Perpetuo Calificado (Ley N° 19.734)",
        description: "Implica privación de libertad de por vida, exigiendo un cumplimiento mínimo de 40 AÑOS DE CÁRCEL EFECTIVA antes de poder optar a cualquier beneficio intrapenitenciario."
      }
    ],
    actionSteps: [
      "Ponerse a disposición de Carabineros o la Fiscalía de forma inmediata asistido por un Abogado Defensor Penal.",
      "Designar defensa técnica penal especializada en delitos graves."
    ],
    documentsAvailable: [],
    proStrategy: "Acreditar la colaboración sustancial temprana (Art. 11 N° 9 CP) mediante la entrega voluntaria inmediata."
  },

  atropello_mascota: {
    title: "Accidente de Tránsito con Mascota / Ley de Tenencia Responsable",
    category: "penal",
    subjectDetected: "Animal de Compañía (Mascota)",
    riskLevel: "RESPONSABILIDAD CIVIL / JPL",
    riskColor: "#eab308",
    codesReferenced: [
      "Ley N° 21.020 (Ley Cholito de Tenencia Responsable)",
      "Código Penal Chileno (Art. 291 bis - Maltrato Animal)",
      "Ley N° 18.287 (Procedimiento ante Juzgados de Policía Local)"
    ],
    summary: "IMPORTANTE: El atropello fortuito de una mascota NO constituye delito de fuga de la Ley Emilia ni arriesga presidio por homicidio.",
    legalDetails: [
      {
        article: "Inaplicabilidad del Delito de Fuga de Ley Emilia",
        description: "Los Arts. 176 y 195 de la Ley de Tránsito y las penas de cárcel de 3 a 5 años por fuga NO se aplican a animales. Se reservan estrictamente para víctimas humanas."
      }
    ],
    actionSteps: [
      "Dar aviso al dueño del animal si es identificable o acudir a una unidad policial a dejar constancia del siniestro vial."
    ],
    documentsAvailable: [],
    proStrategy: "En accidentes viales con animales de compañía en la vía pública, la defensa en Policía Local se basa en la falta de cuidado del tenedor (Art. 12 Ley 21.020)."
  },

  atropello_fuga_humano: {
    title: "Accidente de Tránsito a Peatón con Lesiones/Muerte y Fuga",
    category: "penal",
    subjectDetected: "Ser Humano (Persona)",
    riskLevel: "CRÍTICO PENAL",
    riskColor: "#ef4444",
    codesReferenced: [
      "Ley de Tránsito N° 18.290 (Art. 176 y 195)",
      "Ley Emilia N° 20.770",
      "Código Penal Chileno (Art. 490, 492 y Art. 11 N° 9)"
    ],
    summary: "Darse a la fuga tras atropellar a un ser humano en Chile constituye un delito autónomo sancionado con cárcel e inhabilitación perpetua de licencia.",
    legalDetails: [
      {
        article: "Art. 176 - Ley N° 18.290",
        description: "Obliga a detenerse, prestar ayuda a la víctima humana y dar cuenta a Carabineros."
      }
    ],
    actionSteps: [
      "Presentarse voluntariamente ante Carabineros o Fiscalía a la brevedad."
    ],
    documentsAvailable: [],
    proStrategy: "Activar la atenuante del Art. 11 N° 9 del Código Penal a través de la entrega voluntaria."
  },

  despido_injustificado: {
    title: "Despido Verbal / Injustificado y Nulidad Ley Bustos",
    category: "laboral",
    subjectDetected: "Trabajador / Empleador",
    riskLevel: "ALTO RIESGO LABORAL",
    riskColor: "#f97316",
    codesReferenced: [
      "Código del Trabajo (Art. 160, 162, 168 y 177)",
      "Ley Bustos (Ley N° 19.631)"
    ],
    summary: "El despido verbal no existe en Chile. Todo despido requiere carta formal.",
    legalDetails: [
      {
        article: "Art. 162 - Ley Bustos",
        description: "Si las cotizaciones previsionales no están pagadas al día, el despido es nulo y se siguen devengando sueldos."
      }
    ],
    actionSteps: [
      "Ingresar reclamo en dt.gob.cl con ClaveÚnica."
    ],
    documentsAvailable: [],
    proStrategy: "Dejar constancia en la DT por impedimento de ingreso."
  },

  no_pago_arriendo: {
    title: "Cobro de Rentas y Restitución (Ley Devuélveme mi Casa)",
    category: "civil",
    subjectDetected: "Inmueble / Arrendamiento",
    riskLevel: "ACCIÓN CIVIL MONITORIA",
    riskColor: "#eab308",
    codesReferenced: [
      "Ley N° 21.461 (Ley Devuélveme mi Casa)"
    ],
    summary: "Permite la restitución precautoria del inmueble en plazos de 10 días tras notificar la demanda por no pago de rentas.",
    legalDetails: [
      {
        article: "Ley N° 21.461 - Medida Precautoria de Lanzamiento",
        description: "Permite el desalojo con fuerza pública si no se pagan rentas ni gastos comunes."
      }
    ],
    actionSteps: [
      "Enviar carta notarial de requerimiento."
    ],
    documentsAvailable: [],
    proStrategy: "Verificar firma notarial en el contrato."
  },

  garantia_producto: {
    title: "Garantía Legal del Consumidor 6x3",
    category: "consumidor",
    subjectDetected: "Consumidor / Producto",
    riskLevel: "DERECHO CONSUMIDOR",
    riskColor: "#06b6d4",
    codesReferenced: [
      "Ley N° 19.496 (Art. 19 y 20)",
      "Ley N° 21.398 Pro-Consumidor"
    ],
    summary: "Garantía de 6 meses para elegir libremente entre Cambio, Reparación o Devolución del dinero.",
    legalDetails: [
      {
        article: "Art. 20 - Triple Opción del Consumidor",
        description: "El consumidor elige libremente sin exigencias de cajas originales ni derivación forzada a servicio técnico."
      }
    ],
    actionSteps: [
      "Reclamar en el local con boleta."
    ],
    documentsAvailable: [],
    proStrategy: "Exigir la devolución del dinero si el consumidor así lo prefiere."
  },

  pension_alimentos: {
    title: "Incumplimiento de Pensión de Alimentos y Apremio",
    category: "familia",
    subjectDetected: "Familia / Menor de Edad",
    riskLevel: "EJECUTIVO DE FAMILIA",
    riskColor: "#8b5cf6",
    codesReferenced: [
      "Ley N° 21.389 (Registro Deudores)",
      "Ley N° 21.484 (Pago Efectivo AFP)"
    ],
    summary: "Registro de deudores, retención de licencias, impuesto a la renta y fondos de AFP.",
    legalDetails: [
      {
        article: "Ley N° 21.389 - Registro Nacional de Deudores",
        description: "Sanciona con suspensión de licencia de conducir y retención de devolución de impuestos."
      }
    ],
    actionSteps: [
      "Solicitar liquidación en ojv.pjud.cl."
    ],
    documentsAvailable: [],
    proStrategy: "Activar el cobro mediante retención de devolución de renta y fondos previsionales."
  }
};

/**
 * Analizador Inteligente
 */
export function analyzeCustomQuery(userQuery, categoryId = 'all') {
  if (!userQuery || userQuery.trim().length === 0) return null;

  const classification = legalClassifierEngine.classifyQuery(userQuery);

  if (classification && KNOWLEDGE_BASE[classification.matchedId]) {
    const baseEntry = KNOWLEDGE_BASE[classification.matchedId];
    return {
      ...baseEntry,
      subjectDetected: classification.subjectDetected,
      priorityLabel: classification.priorityLabel
    };
  }

  return {
    title: "Análisis Orientativo de Consulta Legal Personalizada",
    category: categoryId !== 'all' ? categoryId : 'penal',
    subjectDetected: classification?.subjectDetected || "Caso General",
    riskLevel: "REQUIERE EVALUACIÓN",
    riskColor: "#6366f1",
    codesReferenced: [
      "Código Civil de la República de Chile",
      "Código Penal / Leyes Especiales según Jurisdicción",
      "Constitución Política de la República de Chile (Art. 19 N° 3)"
    ],
    summary: `Basado en el análisis de tu consulta: "${userQuery.substring(0, 120)}...", la legislación chilena establece principios de debido proceso y responsabilidad legal aplicables al sujeto detectado (${classification?.subjectDetected || 'General'}).`,
    legalDetails: [
      {
        article: "Art. 19 N° 3 - Constitución Política de Chile",
        description: "Garantiza la igual protección de la ley en el ejercicio de los derechos y el derecho a la defensa jurídica."
      },
      {
        article: "Código Civil Art. 2314 - Responsabilidad Extracontractual",
        description: "El que ha cometido un delito o cuasidelito que ha inferido daño a otro, es obligado a la indemnización."
      }
    ],
    actionSteps: [
      "Recopilar antecedentes físicos o digitales del hecho.",
      "Verificar el tribunal u organismo competente (Juzgado de Letras, Policía Local, Inspección del Trabajo o Fiscalía).",
      "Consultar con un abogado habilitado para verificar plazos de prescripción."
    ],
    documentsAvailable: [
      { id: 'dossier_preliminar', title: 'Informe Sintetizado de Caso para Abogado', format: 'PDF / DOCX' }
    ],
    proStrategy: "Revisar los plazos de prescripción específicos según el tribunal competente."
  };
}
