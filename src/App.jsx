import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LegalAssistant } from './components/LegalAssistant';
import { PricingModal } from './components/PricingModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { WorkflowSection } from './components/WorkflowSection';
import { TrustSection } from './components/TrustSection';
import { FaqSection } from './components/FaqSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { SiteFooter } from './components/SiteFooter';
import { WhatsAppFAB } from './components/WhatsAppFAB';
import { authService } from './services/authService';

export function App() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('starter'); // 'starter' | 'pro' ($5.990) | 'plus' ($9.990)

  // Modales
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [targetCheckoutPlan, setTargetCheckoutPlan] = useState('pro');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Listas del Usuario
  const [savedCases, setSavedCases] = useState([]);
  const [emittedDocs, setEmittedDocs] = useState([]);

  // Ref para scroll a la sección de consulta
  const consultaRef = useRef(null);

  useEffect(() => {
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

  const scrollToConsulta = () => {
    if (consultaRef.current) {
      consultaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

      {/* ── SECCIÓN 1: HERO LANDING PAGE ── */}
      <HeroSection
        onScrollToConsulta={scrollToConsulta}
        onOpenPricing={(plan) => {
          setTargetCheckoutPlan(plan || 'pro');
          setIsPricingOpen(true);
        }}
      />

      {/* ── SECCIÓN 2: ASISTENTE LEGAL IA (Herramienta principal) ── */}
      <div id="consulta-section" ref={consultaRef} style={{ scrollMarginTop: '2rem' }}>
        <LegalAssistant
          userPlan={userPlan}
          onOpenPricing={(plan) => handleOpenCheckout(plan || 'plus')}
          onSaveDoc={handleSaveEmittedDoc}
        />
      </div>

      {/* ── SECCIÓN 3: CÓMO FUNCIONA (3 pasos) ── */}
      <div id="como-funciona">
        <WorkflowSection />
      </div>

      {/* ── SECCIÓN 4: TESTIMONIOS & SOCIAL PROOF ── */}
      <TestimonialsSection />

      {/* ── SECCIÓN 5: ORGANISMOS OFICIALES Y PRIVACIDAD ── */}
      <TrustSection />

      {/* ── SECCIÓN 6: PREGUNTAS FRECUENTES ── */}
      <div id="faq-section">
        <FaqSection />
      </div>

      {/* ── MODALES REUTILIZABLES ── */}
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

      {/* ── FOOTER COMPLETO ── */}
      <SiteFooter
        onOpenPricing={(plan) => {
          setTargetCheckoutPlan(plan || 'pro');
          setIsPricingOpen(true);
        }}
      />

      {/* ── BOTÓN FLOTANTE WHATSAPP ── */}
      <WhatsAppFAB />

    </div>
  );
}
