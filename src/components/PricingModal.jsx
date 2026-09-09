import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, ShieldCheck, FileText, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export function PricingModal({ isOpen, onClose, isProPlan, onUpgradePro }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  if (!isOpen) return null;

  const handleSelectPro = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onUpgradePro();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'var(--primary-gradient)',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            color: '#fff'
          }}>
            PLANES LEYIA CHILE
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Desbloquea el Poder Legal Ilimitado
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Accede a estrategias jurídicas avanzadas, minutas descargables e informes listos para tu abogado.
          </p>
        </div>

        {/* Toggle Ciclo de Facturación */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '0.875rem', color: billingCycle === 'monthly' ? '#fff' : 'var(--text-muted)', fontWeight: 600 }}>
            Facturación Mensual
          </span>
          <div 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            style={{
              width: '50px',
              height: '26px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: billingCycle === 'annual' ? 'flex-end' : 'flex-start',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '9999px',
              background: 'var(--primary-accent)'
            }} />
          </div>
          <span style={{ fontSize: '0.875rem', color: billingCycle === 'annual' ? '#fff' : 'var(--text-muted)', fontWeight: 600 }}>
            Anual <span style={{ color: '#34d399', fontSize: '0.75rem' }}>(Ahorra 20%)</span>
          </span>
        </div>

        {/* Planes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          
          {/* Plan Gratuito */}
          <div style={{
            background: 'rgba(10, 13, 20, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>Plan Starter</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Para consultas puntuales</div>
              
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
                $0 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ siempre</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#d1d5db' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#34d399" /> 3 Consultas orientativas por día
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#34d399" /> Citas de leyes y códigos chilenos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#34d399" /> Anonimización de datos (Ley 19.628)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
                  <X size={16} color="#ef4444" /> Sin descarga de minutas Word/PDF
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
                  <X size={16} color="#ef4444" /> Sin dossier de informe para abogado
                </li>
              </ul>
            </div>

            <button 
              className="btn-secondary" 
              disabled={!isProPlan}
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
            >
              {!isProPlan ? 'Plan Actual' : 'Usar Versión Gratuita'}
            </button>
          </div>

          {/* Plan Pro */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
            border: '2px solid var(--primary-accent)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '1.25rem',
              background: 'var(--primary-gradient)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>
              MÁS POPULAR
            </div>

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={18} color="#a855f7" /> Plan Legal Pro
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Para ciudadanos y pymes</div>

              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
                {billingCycle === 'monthly' ? '$9.990 CLP' : '$7.990 CLP'}{' '}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ mes</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#fff' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#34d399" /> Consultas legales ILIMITADAS
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#34d399" /> Análisis estratégico de defensa penal/civil
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="#fbbf24" /> Generador de Minutas y Cartas (Word/PDF)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} color="#a855f7" /> Exportación de Dossier Certificado para Abogado
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="#34d399" /> Prioridad de soporte y respaldo legal
                </li>
              </ul>
            </div>

            <button 
              className="btn-analyze"
              onClick={handleSelectPro}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
            >
              {isProPlan ? '¡Plan Pro Activo!' : 'Obtener Plan Pro Ahora'}
            </button>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.775rem', color: 'var(--text-dim)' }}>
          💳 Pagos seguros con Flow, Webpay Plus, Mercado Pago o Khipu (Chile). Cancela en cualquier momento.
        </div>

      </div>
    </div>
  );
}
