import React, { useState } from 'react';
import { X, Mail, Lock, UserCheck, ShieldCheck, Globe, AlertCircle, User } from 'lucide-react';
import { authService } from '../services/authService';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = () => {
    try {
      setErrorMsg('');
      const user = authService.loginWithGoogle();
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al conectar con Google.');
    }
  };

  const handleEmailAuth = (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      let user;
      if (isRegister) {
        user = authService.registerWithEmail(email, password, name);
      } else {
        user = authService.loginWithEmail(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error en la autenticación.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
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
            ACCESO LEYIA CHILE
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>
            {isRegister ? 'Crear Cuenta de Usuario' : 'Iniciar Sesión en LeyIA'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Accede a tu historial de consultas y seguimiento de documentos.
          </p>
        </div>

        {/* MENSAJE DE ERROR */}
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

        {/* BOTÓN GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleAuth}
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
          <Globe size={18} color="#ea4335" /> Continuar con Cuenta Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ padding: '0 0.5rem' }}>O con tu correo electrónico</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* FORMULARIO CORREO */}
        <form onSubmit={handleEmailAuth}>
          {isRegister && (
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">Nombre y Apellido</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Ej: Juan Pérez"
              />
            </div>
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

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {isRegister ? 'Crear Mi Cuenta' : 'Ingresar a mi Cuenta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isRegister ? '¿Ya tienes una cuenta? ' : '¿No tienes cuenta aún? '}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
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
