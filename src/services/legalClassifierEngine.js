/**
 * Motor Desambiguador NLU y Clasificador Jerárquico del Ordenamiento Jurídico Chileno
 * Procesa en lenguaje natural:
 * 1. Saludos y Conversación Social ("hola", "gracias")
 * 2. Delitos Penales Graves (Incendio con muerte, Atropello persona, Robo en Lugar Habitado)
 * 3. Accidentes con Mascotas (Ley Cholito N° 21.020 / JPL)
 * 4. Derecho Laboral, Arriendos, Consumidor y Familia
 */

export const legalClassifierEngine = {
  classifyQuery(userQuery) {
    if (!userQuery) return null;
    const text = userQuery.toLowerCase().trim();

    // 0. DETECTOR DE SALUDOS Y CORTESÍA SOCIAL
    if (this.isGreeting(text)) {
      return {
        matchedId: 'greeting_welcome',
        subjectDetected: 'Interacción Inicial / Saludo',
        subjectCategory: 'greeting',
        detectedCategory: 'general',
        priorityLevel: 0,
        priorityLabel: 'ASISTENTE VIRTUAL'
      };
    }

    if (this.isThanks(text)) {
      return {
        matchedId: 'greeting_thanks',
        subjectDetected: 'Agradecimiento / Despedida',
        subjectCategory: 'greeting',
        detectedCategory: 'general',
        priorityLevel: 0,
        priorityLabel: 'CORTESÍA'
      };
    }

    const subject = this.detectSubject(text);
    const action = this.detectAction(text);

    // MATRIZ DE JERARQUÍA PENAL Y CASOS ESPECÍFICOS CHILENOS

    // 1. INCENDIO CON RESULTADO DE MUERTE / DAÑO A PERSONAS
    if (action === 'arson' && (text.includes('suegra') || text.includes('persona') || text.includes('adentro') || text.includes('alguien') || text.includes('muerte'))) {
      return {
        matchedId: 'incendio_muerte',
        subjectDetected: 'Ser Humano (Persona)',
        subjectCategory: 'human_life',
        detectedCategory: 'penal',
        priorityLevel: 1,
        priorityLabel: 'CRÍTICO PENAL'
      };
    }

    // 2. ROBO EN LUGAR HABITADO / DETENCIÓN Y APERCIBIMIENTO ART. 26 CPP
    if (text.includes('asalt') || text.includes('robe') || text.includes('robé') || text.includes('entre a la casa') || text.includes('entré a la casa') || text.includes('comisaria') || text.includes('comisaría') || text.includes('soltaron')) {
      return {
        matchedId: 'robo_lugar_habitado',
        subjectDetected: 'Inmueble / Propiedad Ajena (Robo Penal)',
        subjectCategory: 'penal_property',
        detectedCategory: 'penal',
        priorityLevel: 1,
        priorityLabel: 'ALTO RIESGO PENAL'
      };
    }

    // 3. ATROPELLO CON VÍCTIMA HUMANA (LEY EMILIA)
    if (action === 'run_over' && subject === 'human') {
      return {
        matchedId: 'atropello_fuga_humano',
        subjectDetected: 'Ser Humano (Persona)',
        subjectCategory: 'human_life',
        detectedCategory: 'penal',
        priorityLevel: 1,
        priorityLabel: 'CRÍTICO PENAL'
      };
    }

    // 4. ACCIDENTE CON MASCOTA (LEY CHOLITO N° 21.020 / JPL)
    if (subject === 'pet') {
      return {
        matchedId: 'atropello_mascota',
        subjectDetected: 'Animal de Compañía (Mascota)',
        subjectCategory: 'pet',
        detectedCategory: 'penal',
        priorityLevel: 2,
        priorityLabel: 'LEY CHOLITO & JPL'
      };
    }

    // 5. DERECHO DEL TRABAJO — Despidos, Nulidad Ley Bustos, Ley Karin
    if (action === 'dismissal' || text.includes('trabaj') || text.includes('jefe') || text.includes('finiquito') || text.includes('sueldo')) {
      return {
        matchedId: 'despido_injustificado',
        subjectDetected: 'Trabajador / Empleador',
        subjectCategory: 'employment',
        detectedCategory: 'laboral',
        priorityLevel: 2,
        priorityLabel: 'DERECHO LABORAL'
      };
    }

    // 6. ARRIENDOS — Ley Devuélveme mi Casa / Ley 18.101
    if (action === 'unpaid_rent' || (text.includes('arriend') && !text.includes('queme')) || text.includes('inquilino') || text.includes('renta')) {
      return {
        matchedId: 'no_pago_arriendo',
        subjectDetected: 'Inmueble / Arrendamiento',
        subjectCategory: 'property_real',
        detectedCategory: 'civil',
        priorityLevel: 3,
        priorityLabel: 'CIVIL & ARRIENDOS'
      };
    }

    // 7. CONSUMIDOR — Garantía Legal 6x3 SERNAC
    if (action === 'defective_product' || text.includes('garantía') || text.includes('garantia') || text.includes('sernac') || text.includes('tienda')) {
      return {
        matchedId: 'garantia_producto',
        subjectDetected: 'Consumidor / Producto',
        subjectCategory: 'commercial',
        detectedCategory: 'consumidor',
        priorityLevel: 4,
        priorityLabel: 'DERECHO DEL CONSUMIDOR'
      };
    }

    // 8. FAMILIA — Pensión de Alimentos
    if (text.includes('alimento') || text.includes('pensio') || text.includes('hijo') || text.includes('papito')) {
      return {
        matchedId: 'pension_alimentos',
        subjectDetected: 'Familia / Menor de Edad',
        subjectCategory: 'family',
        detectedCategory: 'familia',
        priorityLevel: 2,
        priorityLabel: 'DERECHO DE FAMILIA'
      };
    }

    // Fallback genérico asistido por IA
    return {
      matchedId: 'custom_ai_query',
      subjectDetected: 'Consulta Legal General',
      subjectCategory: 'general',
      detectedCategory: 'penal',
      priorityLevel: 3,
      priorityLabel: 'ORIENTACIÓN GENERAL'
    };
  },

  isGreeting(text) {
    const greetings = ['hola', 'hola!', 'holaa', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos', 'hola como estas', 'hola cómo estás', 'buenas'];
    return greetings.includes(text) || (text.length <= 15 && (text.startsWith('hola') || text.startsWith('buenos') || text.startsWith('buenas')));
  },

  isThanks(text) {
    const thanks = ['gracias', 'muchas gracias', 'chao', 'adios', 'adiós', 'excelente', 'vale', 'gracias!'];
    return thanks.includes(text) || text.startsWith('gracias') || text.startsWith('muchas gracias');
  },

  detectSubject(text) {
    if (text.includes('perro') || text.includes('perrito') || text.includes('gato') || text.includes('gatito') || text.includes('mascota') || text.includes('animal')) {
      return 'pet';
    }
    if (text.includes('suegra') || text.includes('persona') || text.includes('peaton') || text.includes('peatón') || text.includes('hombre') || text.includes('mujer') || text.includes('hijo') || text.includes('gente')) {
      return 'human';
    }
    if (text.includes('casa') || text.includes('departamento') || text.includes('inmueble') || text.includes('propiedad')) {
      return 'property_real';
    }
    if (text.includes('auto') || text.includes('vehiculo') || text.includes('camioneta') || text.includes('moto')) {
      return 'vehicle';
    }
    return 'general';
  },

  detectAction(text) {
    if (text.includes('queme') || text.includes('quemé') || text.includes('incendi') || text.includes('fuego')) return 'arson';
    if (text.includes('atropell')) return 'run_over';
    if (text.includes('despid') || text.includes('echaron') || text.includes('finiquito')) return 'dismissal';
    if (text.includes('no paga') || text.includes('moros') || text.includes('deuda')) return 'unpaid_rent';
    if (text.includes('fall') || text.includes('roto') || text.includes('garantia')) return 'defective_product';
    return 'other';
  }
};
