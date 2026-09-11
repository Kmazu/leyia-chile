import React, { useState } from 'react';
import { X, Check, Zap, ShieldCheck, FileText, Download, Lock } from 'lucide-react';

export function PricingModal({ isOpen, onClose, userPlan, onSelectPlanToCheckout }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.35rem 0.85rem',
            borderRadius: '0.375rem',
            background: 'rgba(217, 119, 6, 0.15)',
            color: '#f59e0b',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            textTransform: 'uppercase'
          }}>
            PLANES DE SUSCRIPCIÓN LEYIA CHILE
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
            Selecciona el Nivel de Cobertura Jurídica
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Consultas legales ilimitadas con la API de Gemini 3.6 Flash y repositorio de documentos en PDF.
          </p>
        </div>

        {/* Grid de 3 Planes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          
          {/* Plan Starter ($0) */}
          <div style={{
            background: '#1e293b',
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Plan Starter</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Para consultas esporádicas</div>
              
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
                $0 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ siempre</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> 3 Consultas por día
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> Citas de artículos chilenos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
                  <X size={14} color="#ef4444" /> Consultas ilimitadas
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
                  <X size={14} color="#ef4444" /> Documentos PDF rellenables
                </li>
              </ul>
            </div>

            <button 
              className="btn-secondary" 
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', fontSize: '0.8rem' }}
            >
              Usar Gratuito
            </button>
          </div>

          {/* Plan Pro ($5.990 CLP) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} color="#60a5fa" /> Plan Legal Pro
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Consultas Ilimitadas</div>

              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
                $5.990 CLP <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ mes</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem', color: '#fff' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> <strong>Consultas ILIMITADAS</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> Análisis con Gemini 3.6 Flash
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> Historial guardado de casos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
                  <X size={14} color="#ef4444" /> Documentos PDF rellenables
                </li>
              </ul>
            </div>

            <button 
              className="btn-primary"
              onClick={() => onSelectPlanToCheckout('pro')}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', background: '#2563eb', fontSize: '0.8rem' }}
            >
              {userPlan === 'pro' ? 'Plan Pro Activo' : 'Obtener Plan Pro ($5.990)'}
            </button>
          </div>

          {/* Plan Plus ($9.990 CLP) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '2px solid var(--primary-accent)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '1rem',
              background: 'var(--law-gold-gradient)',
              color: '#000',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.25rem',
              textTransform: 'uppercase'
            }}>
              RECOMENDADO
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--primary-accent)" /> Plan Legal Plus
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Consultas + Documentos PDF</div>

              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
                $9.990 CLP <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ mes</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem', color: '#fff' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> Todo lo del Plan Pro ($5.990)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> <strong>Generador de Documentos Rellenables</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> <strong>Exportación e Impresión PDF Notarial</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#34d399" /> Asistencia y soporte prioritario
                </li>
              </ul>
            </div>

            <button 
              className="btn-primary"
              onClick={() => onSelectPlanToCheckout('plus')}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', fontSize: '0.8rem' }}
            >
              {userPlan === 'plus' ? 'Plan Plus Activo' : 'Obtener Plan Plus ($9.990)'}
            </button>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          💳 Pagos vía Transferencia Bancaria (RUT 16.260.747-2) o Tarjetas / Webpay Plus. Cancela cuando lo requieras.
        </div>

      </div>
    </div>
  );
}
