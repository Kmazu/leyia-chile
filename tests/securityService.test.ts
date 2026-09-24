import { describe, it, expect, beforeEach } from 'vitest';
import { securityService } from '../src/services/securityService';

describe('securityService', () => {
  beforeEach(() => {
    // Limpiar sessionStorage antes de cada prueba
    sessionStorage.clear();
  });

  it('debe anonimizar nombres y RUTs en textos', () => {
    const texto = "El señor Juan Pérez con RUT 15.123.456-7 estuvo presente.";
    const result = securityService.anonymizeText(texto);
    const anonimizado = result.cleanText;
    
    expect(anonimizado).not.toContain("15.123.456-7");
    expect(anonimizado).toContain("[RUT_PROTEGIDO]");
  });

  it('debe inicializar el badge de privacidad y hashearlo', () => {
    const badge = securityService.generatePrivacyBadge();
    expect(badge).toHaveProperty('status');
    expect(badge.status).toBe('PROTEGIDO');
    expect(badge).toHaveProperty('hash');
    expect(badge.hash.startsWith('SEC-')).toBe(true);
  });
});
