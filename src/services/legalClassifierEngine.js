/**
 * Motor NLU Desambiguador de Sujetos y Entidades para LeyIA Chile
 * Extrae dinámicamente el sujeto (Ser Humano, Mascota, Inmueble, Vecino/Lesiones, Trabajador, Consumidor)
 * sin forzar delitos rígidos cuando la IA analiza la consulta.
 */

export const legalClassifierEngine = {
  classifyQuery(userQuery) {
    if (!userQuery) return null;
    const text = userQuery.toLowerCase().trim();

    // 0. Saludos y Cortesía
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

    // Detección dinámica de sujeto y categoría
    if (action === 'arson' && (text.includes('suegra') || text.includes('persona') || text.includes('adentro') || text.includes('muerte'))) {
      return {
        matchedId: 'incendio_muerte',
        subjectDetected: 'Ser Humano (Persona)',
        subjectCategory: 'human_life',
        detectedCategory: 'penal',
        priorityLevel: 1,
        priorityLabel: 'CRÍTICO PENAL'
      };
    }

    if (text.includes('peg') || text.includes('golp') || text.includes('agred') || text.includes('pele')) {
      return {
        matchedId: 'agresion_vecino',
        subjectDetected: 'Persona / Vecino (Lesiones)',
        subjectCategory: 'human_injury',
        detectedCategory: 'penal',
        priorityLevel: 2,
        priorityLabel: 'LESIONES & PENAL'
      };
    }

    if (text.includes('manzana') || text.includes('fruta') || text.includes('dulce') || text.includes('chocman')) {
      return {
        matchedId: 'hurto_escaso_valor',
        subjectDetected: 'Fruta / Especie de Escaso Valor',
        subjectCategory: 'minor_theft',
        detectedCategory: 'penal',
        priorityLevel: 4,
        priorityLabel: 'FALTA MENOR'
      };
    }

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

    if (action === 'dismissal' || text.includes('trabaj') || text.includes('jefe') || text.includes('finiquito')) {
      return {
        matchedId: 'despido_injustificado',
        subjectDetected: 'Trabajador / Empleador',
        subjectCategory: 'employment',
        detectedCategory: 'laboral',
        priorityLevel: 2,
        priorityLabel: 'DERECHO LABORAL'
      };
    }

    if (action === 'unpaid_rent' || (text.includes('arriend') && !text.includes('queme')) || text.includes('inquilino')) {
      return {
        matchedId: 'no_pago_arriendo',
        subjectDetected: 'Inmueble / Arrendamiento',
        subjectCategory: 'property_real',
        detectedCategory: 'civil',
        priorityLevel: 3,
        priorityLabel: 'CIVIL & ARRIENDOS'
      };
    }

    if (text.includes('garantía') || text.includes('garantia') || text.includes('sernac') || text.includes('tienda')) {
      return {
        matchedId: 'garantia_producto',
        subjectDetected: 'Consumidor / Producto',
        subjectCategory: 'commercial',
        detectedCategory: 'consumidor',
        priorityLevel: 4,
        priorityLabel: 'DERECHO DEL CONSUMIDOR'
      };
    }

    if (text.includes('alimento') || text.includes('pensio') || text.includes('hijo')) {
      return {
        matchedId: 'pension_alimentos',
        subjectDetected: 'Familia / Menor de Edad',
        subjectCategory: 'family',
        detectedCategory: 'familia',
        priorityLevel: 2,
        priorityLabel: 'DERECHO DE FAMILIA'
      };
    }

    return {
      matchedId: 'custom_ai_query',
      subjectDetected: 'Consulta Dinámica con IA',
      subjectCategory: 'general',
      detectedCategory: 'penal',
      priorityLevel: 3,
      priorityLabel: 'IA DINÁMICA'
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
    if (text.includes('perro') || text.includes('perrito') || text.includes('gato') || text.includes('gatito') || text.includes('mascota') || text.includes('animal') || text.includes('pajarito') || text.includes('pájaro')) {
      return 'pet';
    }
    if (text.includes('suegra') || text.includes('persona') || text.includes('peaton') || text.includes('peatón') || text.includes('vecino') || text.includes('hombre') || text.includes('mujer') || text.includes('hijo')) {
      return 'human';
    }
    if (text.includes('casa') || text.includes('departamento') || text.includes('inmueble') || text.includes('propiedad')) {
      return 'property_real';
    }
    return 'general';
  },

  detectAction(text) {
    if (text.includes('queme') || text.includes('quemé') || text.includes('incendi')) return 'arson';
    if (text.includes('atropell')) return 'run_over';
    if (text.includes('despid') || text.includes('echaron')) return 'dismissal';
    if (text.includes('no paga') || text.includes('moros')) return 'unpaid_rent';
    return 'other';
  }
};
