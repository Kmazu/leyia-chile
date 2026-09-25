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
import AdminPanel from './components/AdminPanel';
import { authService } from './services/authService';
import { analyticsService } from './services/analyticsService';

export function App() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('starter'); // Starter plan is the default

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
    // Inicializar Analítica Privacy-First
    analyticsService.init();

    const initSession = async () => {
      const u = await authService.getUserSession();
      if (u) {
        setUser(u);
        setUserPlan(u.plan || 'starter');
        analyticsService.identifyUser(u.id, u.isSuperUser ? 'superadmin' : 'user', u.plan || 'starter');
      }
      const cases = await authService.getSavedCases();
      setSavedCases(cases);
      const docs = await authService.getEmittedDocs();
      setEmittedDocs(docs);
    };

    initSession();
  }, []);

  const handleAuthSuccess = async (loggedUser) => {
    setUser(loggedUser);
    setUserPlan(loggedUser.plan || 'starter');
    analyticsService.identifyUser(loggedUser.id, loggedUser.isSuperUser ? 'superadmin' : 'user', loggedUser.plan || 'starter');
    analyticsService.trackEvent('User Login', { provider: loggedUser.provider || 'email' });
    
    const cases = await authService.getSavedCases();
    setSavedCases(cases);
    const docs = await authService.getEmittedDocs();
    setEmittedDocs(docs);
  };

  const handleLogout = () => {
    authService.logout();
    analyticsService.trackEvent('User Logout');
    analyticsService.reset();
    setUser(null);
    setUserPlan('starter');
    setIsDashboardOpen(false);
  };

  const handleOpenCheckout = (planToCheckout) => {
    setTargetCheckoutPlan(planToCheckout);
    setIsPricingOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpgradeSuccess = async (upgradedPlan) => {
    setUserPlan(upgradedPlan);
    if (user) {
      const updated = await authService.updatePlan(upgradedPlan);
      setUser(updated);
    }
    setIsCheckoutOpen(false);
  };

  const handleSaveEmittedDoc = async (docData) => {
    const updatedDocs = await authService.saveEmittedDoc(docData);
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
          handleOpenCheckout(plan || 'pro');
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* ADMIN PANEL: Visible solo para superusuarios */}
      {user?.isSuperUser && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <AdminPanel />
        </div>
      )}

      {/* ── SECCIÓN 1: HERO LANDING PAGE ── */}
      <HeroSection
        onScrollToConsulta={scrollToConsulta}
        onOpenPricing={(plan) => {
          handleOpenCheckout(plan || 'pro');
        }}
      />

      {/* ── SECCIÓN 2: CÓMO FUNCIONA (3 pasos) ── */}
      <div id="como-funciona">
        <WorkflowSection />
      </div>

      {/* ── SECCIÓN 3: ASISTENTE LEGAL IA (Herramienta principal - Cuadro de Chat arriba) ── */}
      <div id="consulta-section" ref={consultaRef} style={{ scrollMarginTop: '2rem' }}>
        <LegalAssistant
          user={user}
          userPlan={userPlan}
          onOpenPricing={(plan) => handleOpenCheckout(plan || 'plus')}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSaveDoc={handleSaveEmittedDoc}
        />
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
          handleOpenCheckout(plan || 'pro');
        }}
      />

      {/* ── BOTÓN FLOTANTE WHATSAPP ── */}
      <WhatsAppFAB />

    </div>
  );
}
