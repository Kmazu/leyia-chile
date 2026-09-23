import React, { useState } from 'react';
import { X, Mail, Lock, UserCheck, ShieldCheck, Globe, AlertCircle, User, CheckCircle2, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(true);
      await authService.loginWithGoogle();
      // Google OAuth iniciará redirección o popup
    } catch (err) {
      setErrorMsg(err.message || 'Error al conectar con Google OAuth.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccessMsg('Te hemos enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
      setIsLoading(false);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo enviar el correo de recuperación.');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden. Por favor verifica los campos.');
        }

        const result = await authService.registerWithEmail(email, password, username, name);
        if (result.requiresVerification) {
          setSuccessMsg('¡Cuenta creada exitosamente! Te hemos enviado un correo de verificación. Por favor confirma tu email.');
          setIsLoading(false);
        } else {
          onAuthSuccess(result.user);
          onClose();
        }
      } else {
        const user = await authService.loginWithEmail(email, password);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar tu solicitud.');
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary-accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            AUTENTICACIÓN SEGURA SUPABASE — LEYIA CHILE
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>
            {isForgotPassword ? 'Recuperar Contraseña' : (isRegister ? 'Crear Cuenta de Usuario' : 'Iniciar Sesión en LeyIA')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Accede a tu historial de consultas, expedientes y repositorio de documentos privados.
          </p>
        </div>

        {/* MENSAJES DE ERROR Y ÉXITO */}
        {errorMsg && (
          <div style={{
            padding: '0.65rem 0.85rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '0.5rem',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '0.65rem 0.85rem',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            borderRadius: '0.5rem',
            color: '#34d399',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {!isForgotPassword && (
          <>
            {/* BOTÓN GOOGLE OAUTH */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Globe size={18} color="#ea4335" /> Continuar con Google OAuth
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ padding: '0 0.5rem' }}>O con tu correo y usuario</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>
          </>
        )}

        {/* FORMULARIO RECUPERAR CONTRASEÑA */}
        {isForgotPassword ? (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Correo Electrónico Registrado</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="nombre@ejemplo.cl"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {isLoading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span onClick={() => setIsForgotPassword(false)} style={{ color: 'var(--primary-accent)', cursor: 'pointer', fontWeight: 600 }}>
                ← Volver a Iniciar Sesión
              </span>
            </div>
          </form>
        ) : (
          /* FORMULARIO LOGIN / REGISTRO */
          <form onSubmit={handleEmailAuth}>
            {isRegister && (
              <>
                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Nombre de Usuario (Único)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    placeholder="Ej: juanperez_ley"
                  />
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="nombre@ejemplo.cl"
              />
            </div>

            <div className="form-group" style={{ marginBottom: isRegister ? '0.85rem' : '0.5rem' }}>
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {isRegister && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Repite tu contraseña"
                />
              </div>
            )}

            {!isRegister && (
              <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                <span
                  onClick={() => {
                    setIsForgotPassword(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ fontSize: '0.78rem', color: 'var(--primary-accent)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {isLoading ? 'Procesando...' : (isRegister ? 'Crear Mi Cuenta' : 'Ingresar a mi Cuenta')}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isRegister ? '¿Ya tienes una cuenta? ' : '¿No tienes cuenta aún? '}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setIsForgotPassword(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ color: 'var(--primary-accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Inicia Sesión' : 'Regístrate'}
          </span>
        </div>
      </div>
    </div>
  );
}
