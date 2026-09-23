import React, { useState } from 'react';
import { X, CreditCard, Building2, Upload, CheckCircle2, ShieldCheck, FileCheck, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function CheckoutModal({ isOpen, onClose, targetPlan, onUpgradeSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('webpay'); // 'webpay' | 'transfer'
  const [selectedBank, setSelectedBank] = useState('Santander');
  const [voucherFile, setVoucherFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const planName = targetPlan === 'plus' ? 'Plan Legal Plus' : 'Plan Legal Pro';
  const planPrice = targetPlan === 'plus' ? '$9.990 CLP' : '$5.990 CLP';

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVoucherFile(e.target.files[0]);
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    if (paymentMethod === 'webpay' || paymentMethod === 'flow') {
      try {
        const endpoint = paymentMethod === 'flow' ? '/api/flow-create' : '/api/payment-create';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: targetPlan,
            userEmail: 'cliente@leyia.cl',
            returnUrlOrigin: window.location.origin
          })
        });

        const data = await response.json();

        if (data.status === 'success' && data.url) {
          if (paymentMethod === 'flow') {
            window.location.href = data.url;
            return;
          }

          // Detectar si se está ejecutando dentro de la App Móvil Capacitor Nativa
          if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            try {
              const { Browser } = await import('@capacitor/browser');
              await Browser.open({ url: `${data.url}?token_ws=${data.token}` });
            } catch (capErr) {
              console.warn('Fallback standard redirect in mobile browser:', capErr);
              window.location.href = `${data.url}?token_ws=${data.token}`;
            }
          } else {
            // En Navegación Web: Crear y enviar formulario dinámico POST a Transbank
            const form = document.createElement('form');
            form.action = data.url;
            form.method = 'POST';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'token_ws';
            input.value = data.token;

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
          }
        } else {
          setErrorMessage(data.message || 'No se pudo iniciar la transacción.');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Error al conectar con el servidor de pagos:', err);
        setErrorMessage('Error de conexión con la pasarela de pagos. Por favor intenta nuevamente.');
        setIsProcessing(false);
      }
    } else {
      // Método de Transferencia Bancaria Manual con Comprobante
      setTimeout(() => {
        setIsProcessing(false);
        setIsCompleted(true);
        const txId = 'TX-LEYIA-' + Math.floor(100000 + Math.random() * 900000);
        setTransactionId(txId);

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        onUpgradeSuccess(targetPlan);
      }, 1800);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {!isCompleted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                background: 'rgba(217, 119, 6, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                textTransform: 'uppercase'
              }}>
                PASARELA OFICIAL DE PAGO SEGURA — CHILE
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                Suscripción {planName}
              </h2>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                {planPrice} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ mes</span>
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

            {/* Selector de Método de Pago */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('flow')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: paymentMethod === 'flow' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                  background: paymentMethod === 'flow' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                <CreditCard size={16} color={paymentMethod === 'flow' ? '#f59e0b' : 'var(--text-muted)'} />
                Flow.cl
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('webpay')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: paymentMethod === 'webpay' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                  background: paymentMethod === 'webpay' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                <CreditCard size={16} color={paymentMethod === 'webpay' ? '#f59e0b' : 'var(--text-muted)'} />
                Webpay
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: paymentMethod === 'transfer' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                  background: paymentMethod === 'transfer' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                <Building2 size={16} color={paymentMethod === 'transfer' ? '#f59e0b' : 'var(--text-muted)'} />
                Transferencia
              </button>
            </div>

            {/* OPCIÓN FLOW.CL */}
            {paymentMethod === 'flow' && (
              <div style={{
                background: '#1e293b',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={28} color="#f59e0b" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      Pasarela Oficial Flow.cl Chile
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Paga con Webpay, Servipag, Mach, Chek, Klap, MercadoPago o Crypto.
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  color: 'var(--text-muted)',
                  borderLeft: '3px solid var(--primary-accent)'
                }}>
                  Serás redirigido al portal seguro de Flow para completar tu transacción de forma cifrada.
                </div>
              </div>
            )}

            {/* OPCIÓN 1: WEBPAY Y TARJETAS */}
            {paymentMethod === 'webpay' && (
              <div style={{
                background: '#1e293b',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={28} color="#34d399" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      Transbank Webpay Plus
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Acepta Débito (CuentaRUT), Crédito, Prepago (Redcompra / MACH / Tenpo)
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  color: 'var(--text-muted)',
                  borderLeft: '3px solid var(--primary-accent)'
                }}>
                  Serás redirigido de forma segura al portal cifrado de Transbank para ingresar las credenciales de tu banco o aplicación bancaria.
                </div>
              </div>
            )}

            {/* OPCIÓN 2: TRANSFERENCIA BANCARIA */}
            {paymentMethod === 'transfer' && (
              <div style={{
                background: '#1e293b',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--primary-accent)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Datos Bancarios Oficiales de LeyIA Chile
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>Titular:</strong> LeyIA Chile SpA
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>RUT:</strong> 16.260.747-2
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>Banco:</strong> Banco Santander / Estado
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>N° Cuenta:</strong> 1010371658
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong style={{ color: '#fff' }}>Correo Confirmación:</strong> pagos@leyia.cl
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                  <label className="form-label">Subir Comprobante de Pago (PNG, JPG o PDF)</label>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                      id="voucher-input"
                    />
                    <label htmlFor="voucher-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={20} color="var(--primary-accent)" />
                      <span style={{ fontSize: '0.825rem', color: voucherFile ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                        {voucherFile ? `Archivo adjunto: ${voucherFile.name}` : 'Haz clic para adjuntar comprobante'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={18} className="animate-spin" /> Conectando con Transbank...
                </span>
              ) : (
                `Pagar ${planPrice} y Activar ${planName}`
              )}
            </button>
          </div>
        ) : (
          /* PANTALLA DE ÉXITO */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={54} color="#34d399" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>
              ¡Suscripción Activada con Éxito!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Tu cuenta ahora cuenta con el **{planName}** activo.
            </p>

            <div style={{
              background: '#1e293b',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
              textAlign: 'left'
            }}>
              <div><strong style={{ color: '#fff' }}>Comprobante N°:</strong> {transactionId}</div>
              <div><strong style={{ color: '#fff' }}>Plan:</strong> {planName}</div>
              <div><strong style={{ color: '#fff' }}>Monto:</strong> {planPrice}</div>
              <div><strong style={{ color: '#fff' }}>Estado:</strong> Aprobado y Confirmado</div>
            </div>

            <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Comenzar a Usar {planName}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

