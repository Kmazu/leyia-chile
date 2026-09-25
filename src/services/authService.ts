import { supabase } from './supabaseClient';

export const authService = {
  // ── 1. SESIÓN Y PERFIL DE USUARIO ──

  async getUserSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        return null;
      }

      // Intentar obtener de la tabla 'profiles'
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const isSuperUser = profile?.role === 'superadmin';

      const userObject = {
        id: session.user.id,
        email: session.user.email,
        name: profile?.nombre || session.user.user_metadata?.full_name || session.user.user_metadata?.nombre || session.user.email.split('@')[0],
        username: profile?.username || session.user.user_metadata?.username || session.user.email.split('@')[0],
        avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
        provider: session.user.app_metadata?.provider || 'email',
        plan: isSuperUser ? 'plus' : (profile?.plan || 'starter'),
        isSuperUser: isSuperUser,
        emailConfirmed: !!session.user.email_confirmed_at
      };

      return userObject;
    } catch (e) {
      console.error('Supabase session fetch error:', e);
      return null;
    }
  },

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUser() {
    return await this.getUserSession();
  },

  async getSessionToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
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

    const isSuperUser = false;

    const newUser = {
      id: data.user?.id,
      email: cleanEmail,
      username: cleanUsername,
      name: fullName.trim() || cleanEmail.split('@')[0],
      provider: 'email',
      plan: 'starter',
      isSuperUser: isSuperUser,
      emailConfirmed: false
    };

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

    return await this.getUserSession();
  },

  async resetPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/?recovery=true`,
    });
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  async updatePassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) {
      throw new Error(error.message);
    }
    return true;
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

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout warning:', e);
    }
  },

  async incrementQueryCount() {
    // Obsoleto: El conteo de queries ahora se incrementa de manera segura
    // en el backend (/api/analyze.js) utilizando el rol de servicio.
  },

  // ── 3. GESTIÓN DE EXPEDIENTES JURÍDICOS (CARPETAS / CAUSAS) ──

  async getLegalCases() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching legal cases:', e);
      return [];
    }
  },

  async createLegalCase({ title, description, category = 'civil', status = 'activo' }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Debes estar autenticado para crear un caso.');

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
  },

  // ── 4. GESTIÓN DE CONSULTAS JURÍDICAS PERSISTENTES ──

  async getSavedCases() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

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
      console.error('Error fetching consultations:', e);
      return [];
    }
  },

  async saveCase(caseData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

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
      console.error('Consultation save error:', e);
    }

    return await this.getSavedCases();
  },

  // ── 5. GESTIÓN DE DOCUMENTOS JURÍDICOS ──

  async getEmittedDocs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

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
      console.error('Error fetching documents:', e);
      return [];
    }
  },

  async saveEmittedDoc(docData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

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
      console.error('Document save error:', e);
    }

    return await this.getEmittedDocs();
  },

  async updatePlan(planType) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado.');

    const { error } = await supabase
      .from('profiles')
      .update({ plan: planType })
      .eq('id', user.id);

    if (error) throw error;
    return await this.getUserSession();
  }
};
