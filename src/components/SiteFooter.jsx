import React from 'react';
import { Scale, ExternalLink, Shield, Lock, MessageCircle } from 'lucide-react';

export function SiteFooter({ onOpenPricing }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      {/* Grid principal del footer */}
      <div className="footer-grid">

        {/* Columna 1: Marca */}
        <div className="footer-brand-col">
          <a href="/" className="brand-logo footer-logo-link" aria-label="LeyIA Chile - Inicio">
            <div className="logo-icon" aria-hidden="true">
              <Scale size={22} color="#0b0f19" />
            </div>
            <div>
              <div className="brand-title">LeyIA Chile</div>
              <div className="brand-subtitle">Orientación Jurídica IA</div>
            </div>
          </a>
          <p className="footer-brand-desc">
            Plataforma de inteligencia artificial para orientación legal basada en
            la legislación vigente de Chile. Rápido, confiable y disponible 24/7.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">
              <Lock size={12} aria-hidden="true" /> HTTPS Seguro
            </span>
            <span className="footer-badge">
              <Shield size={12} aria-hidden="true" /> Ley 19.628
            </span>
          </div>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <p className="footer-nav-title">Plataforma</p>
          <nav aria-label="Navegación del footer">
            <button
              className="footer-nav-link-btn"
              onClick={() => {
                const el = document.getElementById('consulta-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Consulta Legal
            </button>
            <button
              className="footer-nav-link-btn"
              onClick={() => onOpenPricing && onOpenPricing('pro')}
            >
              Planes y Precios
            </button>
            <button
              className="footer-nav-link-btn"
              onClick={() => {
                const el = document.getElementById('como-funciona');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Cómo Funciona
            </button>
            <button
              className="footer-nav-link-btn"
              onClick={() => {
                const el = document.getElementById('faq-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Preguntas Frecuentes
            </button>
          </nav>
        </div>

        {/* Columna 3: Legal y contacto */}
        <div>
          <p className="footer-nav-title">Legal & Contacto</p>
          <a
            href="mailto:privacidad@leyia.cl"
            className="footer-nav-link-a"
          >
            Política de Privacidad
          </a>
          <a
            href="mailto:soporte@leyia.cl"
            className="footer-nav-link-a"
          >
            Términos de Servicio
          </a>
          <a
            href="mailto:soporte@leyia.cl"
            className="footer-nav-link-a"
          >
            Contacto & Soporte
          </a>
          <a
            href="https://wa.me/56965025133?text=Hola%2C%20necesito%20información%20sobre%20LeyIA%20Chile"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-nav-link-a footer-whatsapp-link"
          >
            <MessageCircle size={13} aria-hidden="true" />
            WhatsApp Soporte
          </a>
        </div>
      </div>

      {/* Organismos oficiales de Chile */}
      <div className="footer-orgs">
        <p className="footer-orgs-label">Organismos oficiales de Chile:</p>
        <div className="footer-orgs-links">
          <a href="https://www.dt.gob.cl" target="_blank" rel="noreferrer" className="footer-org-link">
            Dirección del Trabajo <ExternalLink size={11} aria-hidden="true" />
          </a>
          <a href="https://www.sernac.cl" target="_blank" rel="noreferrer" className="footer-org-link">
            SERNAC <ExternalLink size={11} aria-hidden="true" />
          </a>
          <a href="https://www.pjud.cl" target="_blank" rel="noreferrer" className="footer-org-link">
            Poder Judicial <ExternalLink size={11} aria-hidden="true" />
          </a>
          <a href="https://www.cajmetro.cl" target="_blank" rel="noreferrer" className="footer-org-link">
            Corp. Asistencia Judicial <ExternalLink size={11} aria-hidden="true" />
          </a>
          <a href="https://www.bcn.cl" target="_blank" rel="noreferrer" className="footer-org-link">
            Biblioteca del Congreso <ExternalLink size={11} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Disclaimer legal */}
      <div className="footer-disclaimer-box">
        <p className="footer-disclaimer-text">
          <strong>Aviso Legal:</strong> LeyIA Chile es una herramienta de orientación e información
          jurídica basada en inteligencia artificial. No constituye asesoría legal profesional
          ni establece relación abogado-cliente. Para casos legales complejos o representación
          ante tribunales, consulte con un abogado habilitado. Información basada en legislación
          chilena vigente (Código Civil, Penal, del Trabajo, Ley 18.101, entre otros).
        </p>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} LeyIA Chile. Protección de datos conforme a la Ley N° 19.628.
        </p>
        <div className="footer-payments">
          <span>Pagos seguros vía:</span>
          <span className="payment-badge">Webpay</span>
          <span className="payment-badge">Transferencia</span>
          <span className="payment-badge">MercadoPago</span>
        </div>
      </div>
    </footer>
  );
}
