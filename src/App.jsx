import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LegalAssistant } from './components/LegalAssistant';
import { PricingModal } from './components/PricingModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { WorkflowSection } from './components/WorkflowSection';
import { TrustSection } from './components/TrustSection';
import { FaqSection } from './components/FaqSection';
import { authService } from './services/authService';
import { Scale, ExternalLink, ShieldCheck, Cpu, FileText, CheckCircle2 } from 'lucide-react';

export function App() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('starter'); // 'starter' | 'pro' ($5.990) | 'plus' ($9.990)
  
  // Modales
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [targetCheckoutPlan, setTargetCheckoutPlan] = useState('pro'); // 'pro' | 'plus'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Listas del Usuario
  const [savedCases, setSavedCases] = useState([]);
  const [emittedDocs, setEmittedDocs] = useState([]);

  useEffect(() => {
    // Cargar sesión guardada y datos de usuario
    const u = authService.getUser();
    if (u) {
      setUser(u);
      setUserPlan(u.plan || 'starter');
    }
    setSavedCases(authService.getSavedCases());
    setEmittedDocs(authService.getEmittedDocs());
  }, []);

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    setUserPlan(loggedUser.plan || 'starter');
    setSavedCases(authService.getSavedCases());
    setEmittedDocs(authService.getEmittedDocs());
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setUserPlan('starter');
    setIsDashboardOpen(false);
  };

  const handleOpenCheckout = (planToCheckout) => {
    setTargetCheckoutPlan(planToCheckout);
    setIsPricingOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpgradeSuccess = (upgradedPlan) => {
    setUserPlan(upgradedPlan);
    if (user) {
      const updated = authService.updatePlan(upgradedPlan);
      setUser(updated);
    }
    setIsCheckoutOpen(false);
  };

  const handleSaveEmittedDoc = (docData) => {
    const updatedDocs = authService.saveEmittedDoc(docData);
    setEmittedDocs(updatedDocs);
  };

  return (
    <div className="app-container">
      {/* Barra de Navegación Sticky */}
      <Navbar 
        user={user}
        userPlan={userPlan} 
        onOpenPricing={(plan) => {
          setTargetCheckoutPlan(plan || 'pro');
          setIsPricingOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* HERO & ASISTENTE LEGAL CON GEMINI 3.6 FLASH */}
      <LegalAssistant 
        userPlan={userPlan}
        onOpenPricing={(plan) => handleOpenCheckout(plan || 'plus')}
        onSaveDoc={handleSaveEmittedDoc}
      />

      {/* SECCIÓN 2: FLUJO DE TRABAJO EN 3 PASOS */}
      <WorkflowSection />

      {/* SECCIÓN 3: ORGANISMOS OFICIALES DE CHILE Y PRIVACIDAD */}
      <TrustSection />

      {/* SECCIÓN 4: PREGUNTAS FRECUENTES (FAQ ACCORDION) */}
      <FaqSection />

      {/* MODALES REUTILIZABLES */}
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)}
        userPlan={userPlan}
        onSelectPlanToCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        targetPlan={targetCheckoutPlan}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <UserDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenPricing={(plan) => handleOpenCheckout(plan)}
        savedCases={savedCases}
        emittedDocs={emittedDocs}
      />

      {/* Pie de Página Legal & Disclaimer de Responsabilidad */}
      <footer className="footer-disclaimer" style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
          <Scale size={18} color="var(--primary-accent)" /> LeyIA Chile — Inteligencia & Orientación Jurídica
        </div>

        <p style={{ maxWidth: '850px', margin: '0 auto 1.25rem', color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.6 }}>
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

        <div style={{ marginTop: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} LeyIA Chile. Protección de datos conforme a la Ley N° 19.628 sobre Protección de la Vida Privada.
        </div>
      </footer>
    </div>
  );
}
