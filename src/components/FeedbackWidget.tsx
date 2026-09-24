import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Check, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';

export function FeedbackWidget({ queryTitle }) {
  const [submitted, setSubmitted] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleVote = async (isHelpful) => {
    await aiService.submitFeedback(queryTitle, isHelpful, commentText);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '0.85rem',
        padding: '0.85rem 1.25rem',
        marginTop: '1.5rem',
        fontSize: '0.85rem',
        color: '#34d399',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Check size={16} /> ¡Gracias por tu retroalimentación! Esto ayuda a que el motor de LeyIA aprenda y mejore continuamente.
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: '1rem',
      padding: '1.25rem',
      marginTop: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="#a855f7" /> ¿Fue útil e imprecisa esta orientación legal? (Retroalimentación de Aprendizaje)
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-secondary" 
            onClick={() => handleVote(true)}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <ThumbsUp size={14} /> Útil y Precisa
          </button>

          <button 
            className="btn-secondary"
            onClick={() => { setShowComment(true); handleVote(false); }}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <ThumbsDown size={14} /> Mejorable / Reportar
          </button>
        </div>
      </div>

      {showComment && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="¿Qué matiz o ley sugerirías ajustar en este caso?..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(10, 13, 20, 0.6)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              padding: '0.4rem 0.8rem',
              color: '#fff',
              fontSize: '0.8rem'
            }}
          />
          <button className="btn-secondary" onClick={() => handleVote(false)} style={{ fontSize: '0.75rem' }}>
            Enviar Sugerencia
          </button>
        </div>
      )}
    </div>
  );
}
