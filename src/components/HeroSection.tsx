import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Scale, Zap } from 'lucide-react';
import './HeroSection.css';

export function HeroSection({ onScrollToConsulta, onOpenPricing, onOpenAuth }) {
  const [query, setQuery] = useState('');

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onOpenAuth) onOpenAuth();
    }
  };

  return (
    <section className="hero-section" aria-label="Bienvenida a LeyIA Chile">
      
      {/* Background Orbs */}
      <div className="hero-orb orb-1"></div>
      <div className="hero-orb orb-2"></div>

      <div className="hero-content-modern">
        
        {/* Badge animado */}
        <div className="hero-badge-modern" role="status">
          <span className="badge-dot-modern" aria-hidden="true"></span>
          Inteligencia Artificial Legal — Chile 2024
        </div>

        {/* Título principal gigante */}
        <h1 className="hero-title-modern">
          Resuelve tu problema legal<br />
          <span className="hero-gradient-text">conversando con IA.</span>
        </h1>

        {/* Subtítulo */}
        <p className="hero-subtitle-modern">
          El primer agente de Inteligencia Artificial especializado en legislación chilena. Redacta documentos, analiza casos y resuelve dudas en segundos.
        </p>

        {/* Input gigante de Juztina style */}
        <form onSubmit={handleQuerySubmit} className="hero-search-box">
          <input 
            type="text" 
            placeholder="Escribe tu caso legal o duda aquí..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="hero-search-input"
          />
          <button type="submit" className="hero-search-button">
            <Sparkles size={18} />
            Consultar
          </button>
        </form>

        {/* CTAs Secundarios */}
        <div className="hero-trust-modern">
          <span><ShieldCheck size={14} className="text-emerald-400" /> Privacidad Garantizada</span>
          <span><Scale size={14} className="text-blue-400" /> Código Civil, Penal y Laboral</span>
          <span><Zap size={14} className="text-purple-400" /> Respuestas en 10 seg</span>
        </div>

      </div>
    </section>
  );
}
