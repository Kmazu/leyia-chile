import React from 'react';
import { Sparkles, Cpu, FileEdit, ArrowRight, ShieldCheck } from 'lucide-react';

export function WorkflowSection() {
  const steps = [
    {
      num: '01',
      title: 'Escribe tu Caso Legal',
      desc: 'Explica en tus propias palabras la situación laboral, penal, civil, de arriendo o consumo sin necesidad de usar lenguaje técnico.',
      icon: <FileEdit size={24} color="var(--primary-accent)" />
    },
    {
      num: '02',
      title: 'Análisis Gemini 3.6 Flash',
      desc: 'El motor NLU analiza los hechos, identifica el nivel de riesgo, cita los artículos exactos de las leyes chilenas y elabora la estrategia.',
      icon: <Cpu size={24} color="#60a5fa" />
    },
    {
      num: '03',
      title: 'Rellena e Imprime en PDF',
      desc: 'Accede al repositorio notarial (Plan Plus), completa los datos con RUT y genera el contrato o minuta listo para firma o notaría.',
      icon: <ShieldCheck size={24} color="#34d399" />
    }
  ];

  return (
    <section style={{ marginTop: '4rem', marginBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
          FLUJO DE TRABAJO INTELIGENTE
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          De la Consulta al Documento en 3 Pasos
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px', margin: '0 auto' }}>
          Diseñado para brindarte certeza legal y minutas ejecutivas listas para usar.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {steps.map((s, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '1.75rem',
              position: 'relative'
            }}
          >
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'rgba(255, 255, 255, 0.1)',
              position: 'absolute',
              top: '1rem',
              right: '1.25rem'
            }}>
              {s.num}
            </div>

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              {s.icon}
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              {s.title}
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
