import React, { useState } from 'react';
import { X, User, Scale, FileText, CreditCard, LogOut, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { authService } from '../services/authService';

export function UserDashboardModal({ isOpen, onClose, user, onLogout, onOpenPricing, savedCases, emittedDocs }) {
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'docs' | 'plan'

  if (!isOpen || !user) return null;

  const planLabel = user.plan === 'plus' ? 'Plan Legal Plus ($9.990)' : user.plan === 'pro' ? 'Plan Legal Pro ($5.990)' : 'Plan Gratuito';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Cabecera del Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'var(--law-gold-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 800,
            fontSize: '1.2rem'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '0.1rem' }}>
              {user.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {user.email}
            </div>
          </div>

          <div>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '0.375rem',
              background: user.plan === 'plus' ? 'rgba(217, 119, 6, 0.2)' : user.plan === 'pro' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: user.plan === 'plus' ? '#f59e0b' : user.plan === 'pro' ? '#60a5fa' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {planLabel}
            </span>
          </div>
        </div>

        {/* Pestañas del Panel */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('cases')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'cases' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'cases' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Scale size={16} /> Mis Consultas ({savedCases ? savedCases.length : 0})
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'docs' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'docs' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> Mis Documentos ({emittedDocs ? emittedDocs.length : 0})
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'plan' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'plan' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CreditCard size={16} /> Suscripción
          </button>
        </div>

        {/* CONTENIDO PESTAÑA 1: CONSULTAS GUARDADAS */}
        {activeTab === 'cases' && (
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {!savedCases || savedCases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No tienes consultas guardadas aún. Realiza una búsqueda legal y presiona "Guardar Caso".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {savedCases.map((item) => (
                  <div key={item.id} style={{
                    background: '#1e293b',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{item.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> {item.date}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {item.summary}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
                      Sujeto: {item.subjectDetected} | Riesgo: {item.riskLevel}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: DOCUMENTOS EMITIDOS */}
        {activeTab === 'docs' && (
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {!emittedDocs || emittedDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No has generado documentos aún. Ingresa al repositorio de plantillas en el Plan Plus.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {emittedDocs.map((doc) => (
                  <div key={doc.id} style={{
                    background: '#1e293b',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emitido el: {doc.date}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                      Completado
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO PESTAÑA 3: SUSCRIPCIÓN */}
        {activeTab === 'plan' && (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                Estado Actual: <span style={{ color: 'var(--primary-accent)' }}>{planLabel}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {user.plan === 'plus' 
                  ? 'Tienes acceso ILIMITADO a consultas con Gemini 3.6 Flash y generación de documentos legales en PDF.'
                  : user.plan === 'pro'
                  ? 'Tienes acceso ILIMITADO a consultas legales con IA en tiempo real. Actualiza al Plan Plus para desbloquear documentos rellenables.'
                  : 'Estás usando la versión básica. Actualiza al Plan Pro ($5.990) o Plan Plus ($9.990) para potenciar tus consultas.'}
              </p>

              {user.plan !== 'plus' && (
                <button 
                  onClick={() => {
                    onClose();
                    onOpenPricing(user.plan === 'pro' ? 'plus' : 'pro');
                  }} 
                  className="btn-primary"
                >
                  {user.plan === 'pro' ? 'Mejorar a Plan Plus ($9.990)' : 'Mejorar a Plan Pro ($5.990)'}
                </button>
              )}
            </div>

            <button onClick={onLogout} className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
