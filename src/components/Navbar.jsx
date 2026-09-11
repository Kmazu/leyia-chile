import React, { useState, useEffect } from 'react';
import { Scale, Download, User, ShieldCheck, Zap, Sparkles, CreditCard } from 'lucide-react';

export function Navbar({ user, userPlan, onOpenPricing, onOpenAuth, onOpenDashboard }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert('Para instalar LeyIA Chile en tu dispositivo: abre el menú del navegador y selecciona "Agregar a la pantalla de inicio" o "Instalar Aplicación".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const getPlanBadge = () => {
    if (userPlan === 'plus') {
      return <span className="badge-pro" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#f59e0b' }}>PLAN PLUS ($9.990)</span>;
    }
    if (userPlan === 'pro') {
      return <span className="badge-pro" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>PLAN PRO ($5.990)</span>;
    }
    return <span className="badge-pro" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>PLAN STARTER</span>;
  };

  return (
    <nav className="navbar">
      <a href="/" className="brand-logo">
        <div className="logo-icon">
          <Scale size={24} color="#000" />
        </div>
        <div>
          <div className="brand-title">LeyIA Chile</div>
          <div className="brand-subtitle">Inteligencia & Orientación Jurídica</div>
        </div>
      </a>

      <div className="nav-actions">
        {/* Botón Descargar APK Android */}
        <a 
          href="/leyia-chile.apk"
          download="LeyIA-Chile.apk"
          className="btn-secondary"
          title="Descargar paquete APK Nativo para Android"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', textDecoration: 'none', color: 'var(--text-main)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
        >
          <Download size={14} color="var(--primary-accent)" /> Descargar APK Android
        </a>

        {/* Botón Instalar PWA */}
        <button 
          onClick={handleInstallApp}
          className="btn-secondary"
          title="Instalar LeyIA Chile en pantalla de inicio"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
        >
          Instalar Web App
        </button>

        {/* Badge del Plan Actual */}
        {getPlanBadge()}

        {/* Botón Ver Planes / Precios */}
        <button 
          className="btn-primary" 
          onClick={() => onOpenPricing('pro')}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
        >
          <CreditCard size={14} /> Planes & Tarifas
        </button>

        {/* Autenticación / Perfil de Usuario */}
        {user ? (
          <button 
            onClick={onOpenDashboard}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', borderColor: 'var(--primary-accent)' }}
          >
            <User size={14} color="var(--primary-accent)" /> Mi Cuenta
          </button>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <User size={14} /> Iniciar Sesión
          </button>
        )}
      </div>
    </nav>
  );
}
