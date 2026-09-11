import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonios = [
  {
    nombre: 'Carla M.',
    cargo: 'Arrendataria, Providencia',
    initials: 'CM',
    color: '#d97706',
    rating: 5,
    texto:
      'Mi arrendador quería echarme sin previo aviso. LeyIA me explicó mis derechos según la Ley 18.101 en menos de un minuto. Gracias a eso pude negociar y quedarme. ¡Increíble servicio!',
  },
  {
    nombre: 'Roberto A.',
    cargo: 'Trabajador de comercio, Concepción',
    initials: 'RA',
    color: '#10b981',
    rating: 5,
    texto:
      'Me despidieron y no sabía si el finiquito estaba correcto. LeyIA analizó mi situación, me mostró los artículos del Código del Trabajo y me dijo exactamente qué reclamar. Recuperé lo que me debían.',
  },
  {
    nombre: 'Sofía L.',
    cargo: 'Dueña de PYME, Santiago',
    initials: 'SL',
    color: '#6366f1',
    rating: 5,
    texto:
      'Uso LeyIA para revisar contratos antes de firmarlos. Me ahorra tiempo y dinero en consultas de abogados para cosas simples. El Plan Plus vale cada peso.',
  },
];

function StarRating({ count }) {
  return (
    <div className="testimonial-stars" aria-label={`${count} estrellas`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" aria-hidden="true" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="testimonials-section" aria-label="Testimonios de usuarios">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="section-eyebrow-badge">Lo que dicen nuestros usuarios</div>
        <h2 className="section-heading-main">
          Casos reales. Resultados reales.
        </h2>
        <p className="section-subheading-main">
          Más de 12.400 chilenos ya resolvieron sus dudas legales con LeyIA.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonios.map((t, i) => (
          <article key={i} className="testimonial-card" aria-label={`Testimonio de ${t.nombre}`}>
            <Quote
              size={28}
              color={t.color}
              style={{ opacity: 0.4, marginBottom: '1rem' }}
              aria-hidden="true"
            />
            <p className="testimonial-text">"{t.texto}"</p>
            <StarRating count={t.rating} />
            <div className="testimonial-author">
              <div
                className="testimonial-avatar"
                style={{ background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}
                aria-hidden="true"
              >
                {t.initials}
              </div>
              <div>
                <div className="testimonial-name">{t.nombre}</div>
                <div className="testimonial-role">{t.cargo}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Barra de stats bajo testimonios */}
      <div className="trust-stats-bar">
        <div className="trust-stat">
          <span className="trust-stat-number">+12.400</span>
          <span className="trust-stat-label">Consultas resueltas</span>
        </div>
        <div className="trust-stat-divider"></div>
        <div className="trust-stat">
          <span className="trust-stat-number">4.8 / 5</span>
          <span className="trust-stat-label">Calificación promedio</span>
        </div>
        <div className="trust-stat-divider"></div>
        <div className="trust-stat">
          <span className="trust-stat-number">98%</span>
          <span className="trust-stat-label">Usuarios satisfechos</span>
        </div>
        <div className="trust-stat-divider"></div>
        <div className="trust-stat">
          <span className="trust-stat-number">5</span>
          <span className="trust-stat-label">Códigos legales cubiertos</span>
        </div>
      </div>
    </section>
  );
}
