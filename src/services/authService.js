import { supabase } from './supabaseClient';

const STORAGE_KEY_USER_SESSION = 'leyia_user_session';
const STORAGE_KEY_CASES = 'leyia_user_saved_cases';
const STORAGE_KEY_DOCS = 'leyia_user_emitted_docs';
const STORAGE_KEY_LEGAL_CASES = 'leyia_user_legal_expedientes';

export const authService = {
  // ── 1. SESIÓN Y PERFIL DE USUARIO ──

  async getUserSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        const local = localStorage.getItem(STORAGE_KEY_USER_SESSION);
        return local ? JSON.parse(local) : null;
      }

      // Intentar obtener de la tabla 'profiles'
      let profile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        profile = data;
      } catch (e) {
        console.info('Profile table standby fallback');
      }

      const userObject = {
        id: session.user.id,
        email: session.user.email,
        name: profile?.nombre || session.user.user_metadata?.full_name || session.user.user_metadata?.nombre || session.user.email.split('@')[0],
        username: profile?.username || session.user.user_metadata?.username || session.user.email.split('@')[0],
        avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
        provider: session.user.app_metadata?.provider || 'email',
        plan: profile?.plan || session.user.user_metadata?.plan || 'starter',
        emailConfirmed: !!session.user.email_confirmed_at
      };

      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(userObject));
      return userObject;
    } catch (e) {
      console.warn('Supabase session fetch warning, using local session:', e);
      const local = localStorage.getItem(STORAGE_KEY_USER_SESSION);
      return local ? JSON.parse(local) : null;
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // ── 2. AUTENTICACIÓN REAL SUPABASE AUTH ──

  async registerWithEmail(email, password, username = '', fullName = '') {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase() || cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido');
    }
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim() || cleanEmail.split('@')[0],
          nombre: fullName.trim() || cleanEmail.split('@')[0],
          username: cleanUsername
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Este correo electrónico ya se encuentra registrado. Por favor inicia sesión.');
      }
      throw new Error(error.message);
    }

    const newUser = {
      id: data.user?.id || 'usr_' + Date.now(),
      email: cleanEmail,
      username: cleanUsername,
      name: fullName.trim() || cleanEmail.split('@')[0],
      provider: 'email',
      plan: 'starter',
      emailConfirmed: false
    };

    localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(newUser));
    return { user: newUser, requiresVerification: !data.session };
  },

  async loginWithEmail(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Por favor ingresa tu correo y contraseña');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciales incorrectas. Revisa tu correo y contraseña.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Por favor confirma tu correo electrónico antes de iniciar sesión.');
      }
      throw new Error(error.message);
    }

    const sessionUser = await this.getUserSession();
    return sessionUser;
  },

  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      throw new Error('Error al conectar con Google OAuth: ' + error.message);
    }

    return data;
  },

  async resetPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido para enviar la recuperación');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    localStorage.removeItem(STORAGE_KEY_USER_SESSION);
  },

  // ── 3. GESTIÓN DE EXPEDIENTES JURÍDICOS (CARPETAS / CAUSAS) ──

  async getLegalCases() {
    const user = this.getUser();
    if (!user) {
      const local = localStorage.getItem(STORAGE_KEY_LEGAL_CASES);
      return local ? JSON.parse(local) : [];
    }

    try {
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      localStorage.setItem(`${STORAGE_KEY_LEGAL_CASES}_${user.id}`, JSON.stringify(data));
      return data || [];
    } catch (e) {
      const local = localStorage.getItem(`${STORAGE_KEY_LEGAL_CASES}_${user.id}`);
      return local ? JSON.parse(local) : [];
    }
  },

  async createLegalCase({ title, description, category = 'civil', status = 'activo' }) {
    const user = this.getUser();
    const newCaseLocal = {
      id: 'case_' + Date.now(),
      user_id: user ? user.id : 'guest',
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category.toLowerCase(),
      status: status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!user) {
      const cases = await this.getLegalCases();
      cases.unshift(newCaseLocal);
      localStorage.setItem(STORAGE_KEY_LEGAL_CASES, JSON.stringify(cases));
      return newCaseLocal;
    }

    try {
      const { data, error } = await supabase
        .from('legal_cases')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          description: description ? description.trim() : '',
          category: category.toLowerCase(),
          status: status
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      const cases = await this.getLegalCases();
      cases.unshift(newCaseLocal);
      localStorage.setItem(`${STORAGE_KEY_LEGAL_CASES}_${user.id}`, JSON.stringify(cases));
      return newCaseLocal;
    }
  },

  // ── 4. GESTIÓN DE CONSULTAS JURÍDICAS PERSISTENTES ──

  async getSavedCases() {
    const user = this.getUser();
    if (!user) {
      const data = localStorage.getItem(STORAGE_KEY_CASES);
      return data ? JSON.parse(data) : [];
    }

    try {
      const { data, error } = await supabase
        .from('legal_consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(c => ({
        id: c.id,
        date: new Date(c.created_at).toLocaleDateString('es-CL'),
        timestamp: c.created_at,
        query: c.question,
        result: { summary: c.response, category: c.category },
        caseId: c.case_id
      }));
    } catch (e) {
      const data = localStorage.getItem(`${STORAGE_KEY_CASES}_${user.id}`);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveCase(caseData) {
    const user = this.getUser();
    const newCase = {
      id: 'consult_' + Date.now(),
      date: new Date().toLocaleDateString('es-CL'),
      timestamp: new Date().toISOString(),
      userId: user ? user.id : 'guest',
      ...caseData
    };

    if (user && user.id) {
      try {
        await supabase
          .from('legal_consultations')
          .insert([{
            user_id: user.id,
            case_id: caseData.caseId || null,
            question: caseData.query || '',
            response: typeof caseData.result === 'string' ? caseData.result : caseData.result?.summary || '',
            category: caseData.category || caseData.result?.category || 'general'
          }]);
      } catch (e) {
        console.warn('Consultation save info:', e);
      }
    }

    const userKey = user ? `${STORAGE_KEY_CASES}_${user.id}` : STORAGE_KEY_CASES;
    const cases = await this.getSavedCases();
    cases.unshift(newCase);
    localStorage.setItem(userKey, JSON.stringify(cases));
    return cases;
  },

  // ── 5. GESTIÓN DE DOCUMENTOS JURÍDICOS ──

  async getEmittedDocs() {
    const user = this.getUser();
    if (!user) {
      const data = localStorage.getItem(STORAGE_KEY_DOCS);
      return data ? JSON.parse(data) : [];
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        docName: d.name,
        docType: d.document_type,
        date: new Date(d.created_at).toLocaleDateString('es-CL'),
        storagePath: d.storage_path,
        caseId: d.case_id
      }));
    } catch (e) {
      const data = localStorage.getItem(`${STORAGE_KEY_DOCS}_${user.id}`);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveEmittedDoc(docData) {
    const user = this.getUser();
    const newDoc = {
      id: 'doc_' + Date.now(),
      date: new Date().toLocaleDateString('es-CL'),
      userId: user ? user.id : 'guest',
      ...docData
    };

    if (user && user.id) {
      try {
        await supabase
          .from('documents')
          .insert([{
            user_id: user.id,
            case_id: docData.caseId || null,
            name: docData.docName || 'Documento Legal',
            document_type: docData.docType || 'PDF',
            storage_path: `users/${user.id}/docs/${Date.now()}.pdf`
          }]);
      } catch (e) {
        console.warn('Document save info:', e);
      }
    }

    const userKey = user ? `${STORAGE_KEY_DOCS}_${user.id}` : STORAGE_KEY_DOCS;
    const docs = await this.getEmittedDocs();
    docs.unshift(newDoc);
    localStorage.setItem(userKey, JSON.stringify(docs));
    return docs;
  },

  updatePlan(planType) {
    const currentUser = this.getUser();
    if (currentUser) {
      currentUser.plan = planType;
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(currentUser));
    }
    return currentUser;
  }
};
