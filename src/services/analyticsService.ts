import posthog from 'posthog-js';

// Reemplazar con las keys reales cuando se despliegue a producción
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_placeholder_key_leyia';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export const analyticsService = {
  init() {
    if (typeof window !== 'undefined') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Configuración ESTRICTA de Privacidad
        persistence: 'memory', // No guarda cookies
        disable_session_recording: true, // No graba la pantalla del usuario
        opt_out_capturing_by_default: false,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: false, // Desactiva captura automática para evitar leer inputs sensibles (RUT, Nombres)
      });
    }
  },

  identifyUser(userId, role, plan) {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, {
        role: role,
        plan: plan,
      });
    }
  },

  reset() {
    if (typeof window !== 'undefined') {
      posthog.reset();
    }
  },

  trackEvent(eventName, properties = {}) {
    if (typeof window !== 'undefined') {
      posthog.capture(eventName, properties);
    }
  }
};
