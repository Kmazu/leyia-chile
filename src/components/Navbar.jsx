import React from 'react';
import { Scale, ShieldCheck, Sparkles, User, Zap } from 'lucide-react';

export function Navbar({ isProPlan, onOpenPricing, onTogglePlan }) {
  return (
    <header className="navbar">
      <a href="#" className="brand-logo">
        <div className="logo-icon">
          <Scale size={24} color="#ffffff" />
        </div>
        <div>
          <div className="brand-title">LeyIA Chile</div>
          <div className="brand-subtitle">Inteligencia Legal & Orientación</div>
        </div>
      </a>

      <div className="nav-actions">
        <div className="security-badge" title="Protección de datos conforme a la Ley 19.628 de Chile">
          <ShieldCheck size={16} />
          <span>Privacidad Ley 19.628</span>
        </div>

        <button 
          className={`plan-badge ${isProPlan ? 'pro' : 'free'}`}
          onClick={onOpenPricing}
        >
          {isProPlan ? (
            <>
              <Zap size={15} fill="#fff" />
              <span>PLAN PRO ILIMITADO</span>
            </>
          ) : (
            <>
              <Sparkles size={15} color="#a855f7" />
              <span>Plan Gratuito — (Actualizar a Pro)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
