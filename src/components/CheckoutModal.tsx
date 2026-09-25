import React, { useState } from 'react';
import { X, ShoppingCart, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Sparkles, Lock, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/authService';

export function CheckoutModal({ isOpen, onClose, targetPlan, onUpgradeSuccess, user }) {
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const isPlus = targetPlan === 'plus';
  const planName = isPlus ? 'Plan Legal Plus (Ilimitado + Documentos)' : 'Plan Legal Pro (Consultas Ilimitadas)';
  const rawPrice = isPlus ? 9990 : 5990;
  const formattedPrice = isPlus ? '$9.990 CLP' : '$5.990 CLP';

  const handleFlowPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const token = await authService.getSessionToken();
      const response = await fetch('/api/flow-create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: targetPlan,
          userEmail: emailInput.trim() || 'cliente@leyia.cl',
          returnUrlOrigin: window.location.origin
        })
      });

      const data = await response.json();

      if (data.status === 'success' && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.message || 'No se pudo generar la orden de pago en Flow.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error al procesar pago con Flow:', err);
      setErrorMessage('Ocurrió un error de conexión con Flow.cl. Por favor reintenta.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '520px', padding: '1.75rem', background: '#0f172a', border: '1px solid rgba(217, 119, 6, 0.3)' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* CABECERA ESTILO CARRITO DE COMPRAS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', pb: '1rem', paddingBottom: '1rem' }}>
          <div style={{
            background: 'rgba(217, 119, 6, 0.15)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingCart size={22} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Carrito de Suscripción LeyIA
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Resumen del pedido y pago seguro vía Flow.cl
            </p>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* RESUMEN DEL ÍTEM EN CARRITO */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} /> Producto Seleccionado
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {planName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Acceso inmediato a la plataforma legal con IA
              </div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              {formattedPrice}
            </div>
          </div>

          {/* DETALLES Y BENEFICIOS CORTOS */}
          <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={14} color="#34d399" /> Consultas legales ilimitadas 24/7 con LeyIA
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={14} color="#34d399" /> Análisis e interpretación automatizada de contratos y leyes
            </div>
            {isPlus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} color="#34d399" /> Redacción y emisión automatizada de documentos jurídicos
              </div>
            )}
          </div>
        </div>

        {/* TOTAL A PAGAR */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(217, 119, 6, 0.08)',
          border: '1px solid rgba(217, 119, 6, 0.2)',
          borderRadius: '0.5rem',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem'
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Total a pagar hoy:</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b' }}>{formattedPrice}</span>
        </div>

        {/* CAMPO DE CORREO ELECTRONICO PARA EL COMPROBANTE */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Correo electrónico para recibir comprobante y acceso:
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="ejemplo@correo.cl"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* BANNER SEGURO FLOW */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem'
        }}>
          <ShieldCheck size={26} color="#34d399" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
            Pagos procesados de forma 100% cifrada por <strong style={{ color: '#fff' }}>Flow.cl</strong>. Acepta Webpay Plus, CuentaRUT, Redcompra, Crédito, Mach, Chek, Servipag y MercadoPago.
          </div>
        </div>

        {/* BOTÓN PAGAR CON FLOW */}
        <button
          onClick={handleFlowPayment}
          disabled={isProcessing}
          className="btn-primary"
          style={{
            width: '100%',
            justify: 'center',
            padding: '0.95rem',
            fontSize: '1rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            border: 'none',
            borderRadius: '0.5rem'
          }}
        >
          {isProcessing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={20} className="animate-spin" /> Conectando con Flow.cl...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} /> Pagar {formattedPrice} en Flow.cl <ArrowRight size={18} />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
