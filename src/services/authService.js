/**
 * Servicio de Autenticación y Gestión de Usuario / Casos para LeyIA Chile
 * Maneja inicios de sesión (Google y Correo), historial de casos y documentos emitidos.
 */

const STORAGE_KEY_USER = 'leyia_user_session';
const STORAGE_KEY_CASES = 'leyia_user_saved_cases';
const STORAGE_KEY_DOCS = 'leyia_user_emitted_docs';

export const authService = {
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  loginWithGoogle() {
    const mockUser = {
      id: 'usr_google_' + Date.now(),
      name: 'Usuario LeyIA',
      email: 'usuario.leyia@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      provider: 'google',
      plan: 'pro', // 'free' | 'pro' ($5.990) | 'plus' ($9.990)
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },

  loginWithEmail(email, password) {
    const mockUser = {
      id: 'usr_email_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      provider: 'email',
      plan: 'starter',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },

  updatePlan(planType) {
    const currentUser = this.getUser();
    if (currentUser) {
      currentUser.plan = planType;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    }
    return currentUser;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  // Gestión de Historial de Casos Consultados
  getSavedCases() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CASES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCase(caseData) {
    const cases = this.getSavedCases();
    const newCase = {
      id: 'case_' + Date.now(),
      date: new Date().toLocaleDateString('es-CL'),
      timestamp: new Date().toISOString(),
      ...caseData
    };
    cases.unshift(newCase);
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
    return cases;
  },

  // Gestión de Documentos Emitidos
  getEmittedDocs() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DOCS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveEmittedDoc(docData) {
    const docs = this.getEmittedDocs();
    const newDoc = {
      id: 'doc_' + Date.now(),
      date: new Date().toLocaleDateString('es-CL'),
      ...docData
    };
    docs.unshift(newDoc);
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
    return docs;
  }
};
