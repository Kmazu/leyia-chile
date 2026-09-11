import React, { useEffect, useRef } from 'react';
import { Scale, Zap, Shield, ChevronDown } from 'lucide-react';

export function HeroSection({ onScrollToConsulta, onOpenPricing }) {
  const heroRef = useRef(null);

  const scrollToConsulta = () => {
    if (onScrollToConsulta) {
      onScrollToConsulta();
    } else {
      const el = document.getElementById('consulta-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" ref={heroRef} aria-label="Bienvenida a LeyIA Chile">

      {/* Columna izquierda: Texto y CTAs */}
      <div className="hero-content">

        {/* Badge animado */}
        <div className="hero-badge" role="status">
          <span className="badge-dot" aria-hidden="true"></span>
          IA Legal activa — Legislación chilena 2024
        </div>

        {/* Título principal */}
        <h1 className="hero-title">
          Tu Abogado Virtual{' '}
          <span className="hero-title-accent">Disponible 24/7</span>
        </h1>

        {/* Subtítulo */}
        <p className="hero-subtitle">
          Analiza tu situación legal en segundos. Sin tecnicismos. Sin esperar.
          Basado en <strong>Código Civil, Penal, Laboral y Ley de Arriendos</strong> de Chile.
        </p>

        {/* Stats */}
        <div className="hero-stats" aria-label="Estadísticas del servicio">
          <div className="stat-item">
            <span className="stat-number">+12.400</span>
            <span className="stat-label">Consultas resueltas</span>
          </div>
          <div className="stat-divider" aria-hidden="true"></div>
          <div className="stat-item">
            <span className="stat-number">4.8 ⭐</span>
            <span className="stat-label">Calificación usuarios</span>
          </div>
          <div className="stat-divider" aria-hidden="true"></div>
          <div className="stat-item">
            <span className="stat-number">&lt;30 seg</span>
            <span className="stat-label">Tiempo de análisis</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="hero-cta-group">
          <button
            className="btn-hero-primary"
            onClick={scrollToConsulta}
            id="hero-cta-primary"
            aria-label="Ir a la herramienta de consulta legal gratuita"
          >
            <Zap size={18} aria-hidden="true" />
            Consultar Gratis Ahora
          </button>
          <button
            className="btn-hero-secondary"
            onClick={() => onOpenPricing && onOpenPricing('pro')}
            id="hero-cta-pricing"
            aria-label="Ver planes y precios"
          >
            Ver Planes →
          </button>
        </div>

        {/* Trust badges */}
        <div className="hero-trust" aria-label="Garantías del servicio">
          <span><Shield size={13} aria-hidden="true" /> Datos cifrados</span>
          <span>🇨🇱 Ley chilena vigente</span>
          <span>✓ Sin tarjeta para empezar</span>
        </div>
      </div>

      {/* Columna derecha: Visual / Mockup */}
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-mockup-card">
          <div className="mockup-header">
            <Scale size={20} color="var(--primary-accent)" />
            <span className="mockup-title">Análisis Legal en Curso</span>
            <span className="mockup-status">
              <span className="mockup-dot"></span>
              Activo
            </span>
          </div>

          <div className="mockup-query">
            <p className="mockup-query-label">Consulta del usuario</p>
            <p className="mockup-query-text">
              "Mi empleador me despidió sin aviso y no quiere pagarme el finiquito completo..."
            </p>
          </div>

          <div className="mockup-divider"></div>

          <div className="mockup-result">
            <p className="mockup-result-label">Análisis LeyIA</p>
            <div className="mockup-result-badge legal-badge-green">⚖️ Derecho Laboral — Alta Prioridad</div>
            <p className="mockup-result-text">
              Según el <strong>Art. 161 del Código del Trabajo</strong>, tienes derecho a indemnización por años de servicio más aviso previo de 30 días o pago equivalente...
            </p>
            <div className="mockup-laws-row">
              <span className="mockup-law-tag">Art. 161 CT</span>
              <span className="mockup-law-tag">Art. 163 CT</span>
              <span className="mockup-law-tag">DT Ley 21.327</span>
            </div>
          </div>

          <div className="mockup-footer">
            <span className="mockup-action">📄 Generar Carta de Exigencia</span>
            <span className="mockup-action">📋 Estrategia Legal</span>
          </div>
        </div>

        {/* Floating cards decorativas */}
        <div className="hero-float-card hero-float-left">
          <span className="float-icon">🔒</span>
          <div>
            <div className="float-title">Datos Anónimos</div>
            <div className="float-sub">Ley 19.628 Chile</div>
          </div>
        </div>

        <div className="hero-float-card hero-float-right">
          <span className="float-icon">⚡</span>
          <div>
            <div className="float-title">Respuesta Inmediata</div>
            <div className="float-sub">Gemini Flash AI</div>
          </div>
        </div>
      </div>

      {/* Flecha scroll down */}
      <button
        className="hero-scroll-hint"
        onClick={scrollToConsulta}
        aria-label="Desplazarse hacia abajo"
      >
        <ChevronDown size={22} />
      </button>
    </section>
  );
}
