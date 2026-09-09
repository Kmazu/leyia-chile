import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LegalAssistant } from './components/LegalAssistant';
import { PricingModal } from './components/PricingModal';
import { ShieldCheck, Scale, ExternalLink } from 'lucide-react';

export function App() {
  const [isProPlan, setIsProPlan] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const handleTogglePlan = () => {
    setIsProPlan(!isProPlan);
  };

  return (
    <div className="app-container">
      {/* Barra de Navegación */}
      <Navbar 
        isProPlan={isProPlan} 
        onOpenPricing={() => setIsPricingOpen(true)} 
        onTogglePlan={handleTogglePlan}
      />

      {/* Asistente e Inteligencia Legal */}
      <LegalAssistant 
        isProPlan={isProPlan} 
        onOpenPricing={() => setIsPricingOpen(true)} 
      />

      {/* Modal de Precios y Suscripciones */}
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)}
        isProPlan={isProPlan}
        onUpgradePro={() => setIsProPlan(true)}
      />

      {/* Pie de Página Legal & Disclaimer de Responsabilidad */}
      <footer className="footer-disclaimer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fff', fontWeight: 600 }}>
          <Scale size={16} color="#6366f1" /> LeyIA Chile — Inteligencia & Orientación Jurídica
        </div>

        <p style={{ maxWidth: '850px', margin: '0 auto 1.25rem', color: 'var(--text-muted)' }}>
          <strong>Aviso de Exención de Responsabilidad Legal (Disclaimer):</strong> La información provista por LeyIA Chile es de carácter netamente formativo, pedagógico u orientativo, y se basa en los códigos y leyes de la República de Chile (Código Penal, Civil, del Trabajo, Ley de Tránsito, Ley de Arriendos, entre otros). Esta plataforma <u>no constituye patrocinio ni asesoría legal formal</u> para representar causas en tribunales. Para la tramitación de juicios o representación oficial, se aconseja consultar con un(a) abogado(a) habilitado(a) o acudir a las instituciones del Estado.
        </p>

        {/* Enlaces a Organismos Oficiales de Chile */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.775rem' }}>
          <a href="https://www.dt.gob.cl" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            Dirección del Trabajo <ExternalLink size={12} />
          </a>
          <a href="https://www.sernac.cl" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            SERNAC <ExternalLink size={12} />
          </a>
          <a href="https://www.pjud.cl" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            Poder Judicial (PJUD) <ExternalLink size={12} />
          </a>
          <a href="https://www.cajmetro.cl" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            Corporación Asistencia Judicial <ExternalLink size={12} />
          </a>
        </div>

        <div style={{ marginTop: '1.25rem', color: 'var(--text-dim)', fontSize: '0.725rem' }}>
          © {new Date().getFullYear()} LeyIA Chile. Protección de datos conforme a la Ley N° 19.628 sobre Protección de la Vida Privada.
        </div>
      </footer>
    </div>
  );
}
