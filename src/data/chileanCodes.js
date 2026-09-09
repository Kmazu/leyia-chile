/**
 * Base de Datos Legal Chilena Enriquecida y Motor de Análisis Inteligente
 * Cubre Código Penal (Incendio, Homicidios, Robo en Lugar Habitado, Atropello), Ley Emilia, Ley Cholito,
 * Código Procesal Penal (Apercibimiento Art. 26), Código del Trabajo, Ley Devuélveme mi Casa, SERNAC y Familia.
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
    id: 'robo_lugar_habitado',
    category: 'penal',
    title: 'Robo en Casa / Detención y Apercibimiento',
    prompt: 'Ayer asalté la casa de mi vecina y no había nadie pero me llevaron a la comisaría y me soltaron en la mañana, ¿qué me puede pasar?',
    tag: 'Art. 440 CP & Art. 26 CPP',
    badge: 'Penal'
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
    id: 'atropello_fuga_humano',
    category: 'penal',
    title: 'Atropello a Peatón y Fuga',
    prompt: 'Atropellé a una persona en el paso de cebra, me asusté y me di a la fuga.',
    tag: 'Ley Emilia & Tránsito',
    badge: 'Crítico'
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
  robo_lugar_habitado: {
    title: "Delito de Robo en Lugar Habitado y Procedimiento de Detención",
    category: "penal",
    subjectDetected: "Inmueble / Propiedad Ajena (Robo Penal)",
    riskLevel: "ALTO RIESGO PENAL (5 A 10 AÑOS)",
    riskColor: "#ef4444",
    codesReferenced: [
      "Código Penal Chileno (Art. 440 - Robo en Lugar Habitado)",
      "Código Procesal Penal (Art. 26 - Apercibimiento y Fijación de Domicilio)",
      "Código Procesal Penal (Art. 155 - Medidas Cautelares)"
    ],
    summary: "Ingresar a una vivienda ajena sin autorización utilizando fuerza o intromisión para sustraer especies constituye el delito de Robo en Lugar Habitado, sin importar que la propiedad estuviese vacía en ese instante.",
    legalDetails: [
      {
        article: "Art. 440 - Código Penal de Chile",
        description: "El Robo en Lugar Habitado o sus dependencias se sanciona con la pena de PRESIDIO MAYOR EN SU GRADO MÍNIMO (5 años y 1 día a 10 años de cárcel). El hecho de no haber moradores en ese instante no atenúa la calificación del inmueble."
      },
      {
        article: "Art. 26 CPP - ¿Por qué la salida en libertad provisional en la mañana?",
        description: "Haber sido soltado tras la detención NO significa absolución ni cierre del caso. Ocurre al quedar apercibido bajo el Art. 26 del CPP (fijación obligatoria de domicilio para citaciones de la Fiscalía)."
      },
      {
        article: "Art. 155 CPP - Medidas Cautelares en Libertad",
        description: "El tribunal puede imponer medidas cautelares inmediatas: prohibición absoluta de acercarse a la víctima/vecina y su domicilio, firma periódica y arraigo nacional."
      }
    ],
    actionSteps: [
      "Designar de inmediato un Abogado Defensor Penal (Defensoría Penal Pública o privado).",
      "Respetar de forma estricta la prohibición de acercarse a la propiedad o a la vecina para evitar arresto por desacato (Art. 240 CPC).",
      "Mantener el domicilio actualizado ante el Juzgado de Garantía para acudir a la audiencia de formalización cuando la Fiscalía cite."
    ],
    documentsAvailable: [
      { id: 'patrocinio_penal_robo', title: 'Modelo de Patrocinio y Poder Defensor Penal', format: 'DOCX / PDF' }
    ],
    proStrategy: "En juicios por Art. 440 CP, la defensa debe examinar el acta de detención por posibles vicios en la cadena de custodia o control de identidad, e intentar irreprochable conducta anterior (Art. 11 N° 6 CP) para mitigar la pena."
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
        description: "Consultas sobre accidentes de tránsito, Ley Emilia, Ley Cholito (mascotas), robo en lugar habitado, delitos y procedimientos penales."
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
    proStrategy: "Para obtener el diagnóstico más exacto, incluye detalles de los sujetos involucrados (personas, animales, propiedades) y si hubo avisos o documentos firmados."
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
      },
      {
        article: "Art. 391 N° 1 - Homicidio Calificado (Fuego / Alevosía)",
        description: "El uso del fuego como medio ejecutor actúa como circunstancia calificadora del homicidio, impidiendo cualquier rebaja de pena."
      },
      {
        article: "Art. 140 CPP - Medida Cautelar Obligatoria",
        description: "Por la gravedad del delito y la fuga, el Juez de Garantía decretará de forma ineludible la Prisión Preventiva por peligro para la sociedad y riesgo de fuga."
      }
    ],
    actionSteps: [
      "Ponerse a disposición de Carabineros o la Fiscalía de forma inmediata asistido por un Abogado Defensor Penal.",
      "No destruir ni alterar elementos en el sitio del suceso.",
      "Designar defensa técnica penal especializada en delitos graves."
    ],
    documentsAvailable: [
      { id: 'patrocinio_penal_grave', title: 'Modelo de Patrocinio Penal de Urgencia', format: 'DOCX / PDF' }
    ],
    proStrategy: "En delitos de esta envergadura la prisión preventiva es inevitable. La estrategia jurídica debe centrarse en acreditar la colaboración sustancial temprana (Art. 11 N° 9 CP) mediante la entrega voluntaria inmediata."
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
    summary: "IMPORTANTE: El atropello fortuito de una mascota NO constituye delito de fuga de la Ley Emilia ni arriesga presidio por homicidio. La Ley Emilia se reserva exclusivamente para lesiones o muerte de SERES HUMANOS.",
    legalDetails: [
      {
        article: "Inaplicabilidad del Delito de Fuga de Ley Emilia",
        description: "Los Arts. 176 y 195 de la Ley de Tránsito y las penas de cárcel de 3 a 5 años por fuga NO se aplican a animales. Se reservan strictly para víctimas humanas."
      },
      {
        article: "Art. 291 bis - Maltrato o Crueldad Animal",
        description: "Solo se configura delito penal de maltrato si existió INTENCIONALIDAD (dolo) o crueldad deliberada de atropellar al animal. Si fue un accidente fortuito, no hay delito penal."
      },
      {
        article: "Ley N° 21.020 y Responsabilidad Civil (JPL)",
        description: "Si la mascota tenía dueño y el conductor actuó con imprudencia, el dueño puede demandar en el Juzgado de Policía Local la indemnización de daños y gastos veterinarios."
      }
    ],
    actionSteps: [
      "Dar aviso al dueño del animal si es identificable o acudir a una unidad policial a dejar constancia del siniestro vial.",
      "Recopilar fotografías del estado de la calzada y señalización.",
      "En caso de reclamo del dueño, gestionar la declaración ante el Juzgado de Policía Local de la comuna."
    ],
    documentsAvailable: [
      { id: 'constancia_jpl_mascota', title: 'Minuta de Declaración Accidente con Mascota JPL', format: 'DOCX / PDF' }
    ],
    proStrategy: "En accidentes viales con animales de compañía en la vía pública, la defensa en Policía Local se basa en la responsabilidad del tenedor del animal por falta de cuidado al mantener la mascota suelta en la calzada (Art. 12 Ley 21.020)."
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
    summary: "Darse a la fuga tras atropellar a un ser humano en Chile constituye un delito autónomo sancionado con cárcel e inhabilitación perpetua de licencia, independientemente de la culpa inicial.",
    legalDetails: [
      {
        article: "Art. 176 - Ley N° 18.290",
        description: "Obliga a detenerse, prestar ayuda a la víctima humana y dar cuenta a Carabineros."
      },
      {
        article: "Art. 195 - Delito de Fuga y Omisión de Socorro",
        description: "Penas de presidio menor en su grado máximo (3 años y 1 día a 5 años) e INHABILITACIÓN PERPETUA para conducir."
      },
      {
        article: "Ley Emilia (Ley N° 20.770)",
        description: "Si había alcohol/drogas y fuga en lesiones graves/muerte, la pena es presidio mayor con CÁRCEL EFECTIVA OBLIGATORIA de 1 año."
      }
    ],
    actionSteps: [
      "Presentarse voluntariamente ante Carabineros o Fiscalía a la brevedad.",
      "Contactar inmediatamente un abogado defensor penal.",
      "No alterar el vehículo."
    ],
    documentsAvailable: [
      { id: 'minuta_defensa_fuga', title: 'Minuta de Presentación Voluntaria', format: 'DOCX / PDF' }
    ],
    proStrategy: "Activar la atenuante del Art. 11 N° 9 del Código Penal a través de la entrega voluntaria anticipada."
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
    summary: "El despido verbal no existe en Chile. Todo despido requiere carta formal. Si hay morosidad previsional, el despido es nulo (Ley Bustos).",
    legalDetails: [
      {
        article: "Art. 162 - Ley Bustos",
        description: "Si las cotizaciones previsionales no están pagadas al día, el despido es nulo y se siguen devengando sueldos."
      },
      {
        article: "Art. 168 - Reclamo en Inspección del Trabajo",
        description: "Plazo de 60 días hábiles para demandar por despido injustificado con recargos del 30% al 100%."
      }
    ],
    actionSteps: [
      "Ingresar reclamo en dt.gob.cl con ClaveÚnica.",
      "Firma finiquito obligatoriamente con Reserva de Derechos manuscrita."
    ],
    documentsAvailable: [
      { id: 'carta_reserva_derechos', title: 'Carta de Reserva de Derechos en Finiquito', format: 'DOCX / PDF' }
    ],
    proStrategy: "Dejar constancia en la DT por impedimento de ingreso para desacreditar la causal de inconcurrencia."
  },

  no_pago_arriendo: {
    title: "Cobro de Rentas y Restitución (Ley Devuélveme mi Casa)",
    category: "civil",
    subjectDetected: "Inmueble / Arrendamiento",
    riskLevel: "ACCIÓN CIVIL MONITORIA",
    riskColor: "#eab308",
    codesReferenced: [
      "Ley N° 21.461 (Ley Devuélveme mi Casa)",
      "Ley N° 18.101 de Arrendamiento Urbano"
    ],
    summary: "Permite la restitución precautoria del inmueble en plazos de 10 días tras notificar la demanda por no pago de rentas.",
    legalDetails: [
      {
        article: "Ley N° 21.461 - Medida Precautoria de Lanzamiento",
        description: "Permite el desalojo con fuerza pública si no se pagan rentas ni gastos comunes."
      }
    ],
    actionSteps: [
      "Enviar carta notarial de requerimiento.",
      "Demanda en Juicio Monitorio en Juzgado Civil."
    ],
    documentsAvailable: [
      { id: 'notificacion_arriendo_mora', title: 'Carta Notarial de Término de Arriendo', format: 'DOCX / PDF' }
    ],
    proStrategy: "Verificar firma notarial en el contrato para agilizar el lanzamiento."
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
      "Reclamar en el local con boleta.",
      "Ingresar reclamo en sernac.cl."
    ],
    documentsAvailable: [
      { id: 'reclamo_sernac_template', title: 'Minuta de Reclamo ante SERNAC', format: 'DOCX / PDF' }
    ],
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
      "Solicitar liquidación en ojv.pjud.cl.",
      "Solicitar retención de fondos de AFP."
    ],
    documentsAvailable: [
      { id: 'solicitud_liquidacion_pjud', title: 'Solicitud de Liquidación en PJUD', format: 'DOCX / PDF' }
    ],
    proStrategy: "Activar el cobro mediante retención de devolución de renta y fondos previsionales."
  }
};

/**
 * Analizador Inteligente con Desambiguación Jerárquica NLU
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
