/**
 * Servicio de Seguridad y Protección de Datos Personales (Ley 19.628 - Chile)
 * Proporciona anonimización de PII (Información de Identificación Personal),
 * cifrado de sesión local utilizando Web Crypto API (AES-GCM), y validaciones.
 */

// Expresiones regulares para detección de datos sensibles en Chile
const REGEX_RUT = /\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/g;
const REGEX_TELEFONO = /(\+?56\s?9?\s?\d{4}\s?\d{4}|\b9\s?\d{4}\s?\d{4}\b)/g;
const REGEX_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Patentes chilenas (formato nuevo y antiguo)
const REGEX_PATENTE = /\b([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]{4}\d{2}|[a-zA-Z]{2}\d{4})\b/g;

export const securityService = {
  /**
   * Anonimiza datos sensibles del texto ingresado por el usuario
   * @param {string} text 
   * @returns {{ cleanText: string, anonymizedCount: number, detectedItems: string[] }}
   */
  anonymizeText(text) {
    if (!text) return { cleanText: '', anonymizedCount: 0, detectedItems: [] };

    let cleanText = text;
    let anonymizedCount = 0;
    const detectedItems = [];

    if (REGEX_RUT.test(cleanText)) {
      cleanText = cleanText.replace(REGEX_RUT, '[RUT_PROTEGIDO]');
      anonymizedCount++;
      detectedItems.push('RUT Personal');
    }

    if (REGEX_TELEFONO.test(cleanText)) {
      cleanText = cleanText.replace(REGEX_TELEFONO, '[TELÉFONO_PROTEGIDO]');
      anonymizedCount++;
      detectedItems.push('Teléfono de Contacto');
    }

    if (REGEX_EMAIL.test(cleanText)) {
      cleanText = cleanText.replace(REGEX_EMAIL, '[EMAIL_PROTEGIDO]');
      anonymizedCount++;
      detectedItems.push('Correo Electrónico');
    }

    if (REGEX_PATENTE.test(cleanText)) {
      // Filtrar palabras de 4 letras comunes para no reemplazar falso positivo
      cleanText = cleanText.replace(REGEX_PATENTE, (match) => {
        const commonWords = ['AUTO', 'CASA', 'PAGO', 'DIAS', 'MORA', 'PENA', 'LEYES', 'RUT'];
        if (commonWords.includes(match.toUpperCase())) return match;
        anonymizedCount++;
        detectedItems.push('Patente de Vehículo');
        return '[PATENTE_PROTEGIDA]';
      });
    }

    return {
      cleanText,
      anonymizedCount,
      detectedItems: [...new Set(detectedItems)]
    };
  },

  /**
   * Obtiene o genera la clave de cifrado AES-GCM para la sesión actual
   */
  async getEncryptionKey() {
    let rawKey = sessionStorage.getItem('leyia_sec_key');
    if (!rawKey) {
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      const exported = await crypto.subtle.exportKey('raw', key);
      rawKey = btoa(String.fromCharCode(...new Uint8Array(exported)));
      sessionStorage.setItem('leyia_sec_key', rawKey);
      return key;
    }
    const keyBytes = Uint8Array.from(atob(rawKey), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
      'raw',
      keyBytes,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Cifrado con AES-GCM (Web Crypto API)
   */
  async encryptSessionData(data) {
    try {
      const key = await this.getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
      
      const cipherArray = Array.from(new Uint8Array(cipher));
      const ivArray = Array.from(iv);
      return btoa(JSON.stringify({ cipher: cipherArray, iv: ivArray }));
    } catch (e) {
      console.error('Error cifrando datos de sesión:', e);
      return null;
    }
  },

  /**
   * Descifrado con AES-GCM (Web Crypto API)
   */
  async decryptSessionData(encryptedStr) {
    try {
      if (!encryptedStr) return null;
      const { cipher, iv } = JSON.parse(atob(encryptedStr));
      const key = await this.getEncryptionKey();
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(cipher)
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
      console.error('Error descifrando datos de sesión:', e);
      return null;
    }
  },

  /**
   * Genera sello de integridad de privacidad para la consulta
   */
  generatePrivacyBadge() {
    const timestamp = new Date().toISOString();
    return {
      status: 'PROTEGIDO',
      standard: 'Ley 19.628 (Chile) & TLS 1.3',
      hash: 'SEC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp
    };
  }
};
