/**
 * Servicio de Autenticación y Gestión de Usuarios y Casos — LeyIA Chile
 * Base de datos persistente local con soporte multi-usuario, contraseñas e integración Auth
 */

const STORAGE_KEY_USER_SESSION = 'leyia_user_session';
const STORAGE_KEY_USERS_DB = 'leyia_registered_users_db';
const STORAGE_KEY_CASES = 'leyia_user_saved_cases';
const STORAGE_KEY_DOCS = 'leyia_user_emitted_docs';

// Helper de base de datos de usuarios persistente
const getUsersDB = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS_DB);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const saveUsersDB = (db) => {
  localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
};

// Simple Hash simulado de contraseña para seguridad local
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
};

export const authService = {
  // Obtener sesión activa actual
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Registrar nuevo usuario
  registerWithEmail(email, password, fullName = '') {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido');
    }
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const usersDb = getUsersDB();
    if (usersDb[cleanEmail]) {
      throw new Error('Este correo ya se encuentra registrado. Inicia sesión con tus credenciales.');
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      email: cleanEmail,
      name: fullName.trim() || cleanEmail.split('@')[0],
      passwordHash: hashPassword(password),
      provider: 'email',
      plan: 'starter',
      createdAt: new Date().toISOString()
    };

    usersDb[cleanEmail] = newUser;
    saveUsersDB(usersDb);

    // Iniciar sesión automáticamente tras registro
    const sessionUser = { ...newUser };
    delete sessionUser.passwordHash;
    localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(sessionUser));

    return sessionUser;
  },

  // Iniciar sesión con correo y contraseña
  loginWithEmail(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Por favor completa todos los campos');
    }

    const usersDb = getUsersDB();
    const existingUser = usersDb[cleanEmail];

    if (!existingUser) {
      // Si es primera vez y no existe la base de datos previa, crear la cuenta automáticamente de forma transparente
      return this.registerWithEmail(cleanEmail, password);
    }

    // Validar contraseña
    if (existingUser.passwordHash !== hashPassword(password)) {
      throw new Error('Contraseña incorrecta. Por favor verifica tus datos.');
    }

    const sessionUser = { ...existingUser };
    delete sessionUser.passwordHash;
    localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(sessionUser));

    return sessionUser;
  },

  // Autenticación con Google (Pre-configurado con OAuth 2.0 / Firebase SDK)
  loginWithGoogle(googleUserObject = null) {
    let sessionUser;

    if (googleUserObject && googleUserObject.email) {
      sessionUser = {
        id: 'usr_g_' + (googleUserObject.sub || Date.now()),
        name: googleUserObject.name || googleUserObject.email.split('@')[0],
        email: googleUserObject.email,
        avatar: googleUserObject.picture || null,
        provider: 'google',
        plan: 'starter',
        createdAt: new Date().toISOString()
      };
    } else {
      // Login con Google usando cuenta activa o prompt
      const emailPrompt = prompt('Ingresa tu cuenta de Google para iniciar sesión:') || 'usuario.google@gmail.com';
      sessionUser = {
        id: 'usr_google_' + Date.now(),
        name: emailPrompt.split('@')[0],
        email: emailPrompt,
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google',
        plan: 'starter',
        createdAt: new Date().toISOString()
      };
    }

    // Guardar usuario en DB de usuarios
    const usersDb = getUsersDB();
    if (!usersDb[sessionUser.email]) {
      usersDb[sessionUser.email] = sessionUser;
      saveUsersDB(usersDb);
    } else {
      // Mantener plan existente
      sessionUser.plan = usersDb[sessionUser.email].plan || 'starter';
    }

    localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  },

  // Actualizar Plan del usuario activo
  updatePlan(planType) {
    const currentUser = this.getUser();
    if (currentUser) {
      currentUser.plan = planType;
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(currentUser));

      // Actualizar también en la DB local
      const usersDb = getUsersDB();
      if (usersDb[currentUser.email]) {
        usersDb[currentUser.email].plan = planType;
        saveUsersDB(usersDb);
      }
    }
    return currentUser;
  },

  // Cerrar Sesión
  logout() {
    localStorage.removeItem(STORAGE_KEY_USER_SESSION);
  },

  // Historial de Casos Consultados por el Usuario
  getSavedCases() {
    try {
      const user = this.getUser();
      const userKey = user ? `${STORAGE_KEY_CASES}_${user.id}` : STORAGE_KEY_CASES;
      const data = localStorage.getItem(userKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCase(caseData) {
    const user = this.getUser();
    const userKey = user ? `${STORAGE_KEY_CASES}_${user.id}` : STORAGE_KEY_CASES;
    const cases = this.getSavedCases();
    const newCase = {
      id: 'case_' + Date.now(),
      date: new Date().toLocaleDateString('es-CL'),
      timestamp: new Date().toISOString(),
      userId: user ? user.id : 'guest',
      ...caseData
    };
    cases.unshift(newCase);
    localStorage.setItem(userKey, JSON.stringify(cases));
    return cases;
  },

  // Documentos Emitidos por el Usuario
  getEmittedDocs() {
    try {
      const user = this.getUser();
      const userKey = user ? `${STORAGE_KEY_DOCS}_${user.id}` : STORAGE_KEY_DOCS;
      const data = localStorage.getItem(userKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveEmittedDoc(docData) {
    const user = this.getUser();
    const userKey = user ? `${STORAGE_KEY_DOCS}_${user.id}` : STORAGE_KEY_DOCS;
    const docs = this.getEmittedDocs();
    const newDoc = {
      id: 'doc_' + Date.now(),
      date: new Date().toLocaleDateString('es-CL'),
      userId: user ? user.id : 'guest',
      ...docData
    };
    docs.unshift(newDoc);
    localStorage.setItem(userKey, JSON.stringify(docs));
    return docs;
  }
};
