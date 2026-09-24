import React from 'react';
import { Scale, ExternalLink, ShieldCheck, FileCheck, Building, CheckCircle2 } from 'lucide-react';

export function TrustSection() {
  const orgs = [
    {
      name: 'Dirección del Trabajo (DT)',
      desc: 'Fiscalización de cotizaciones impagas, finiquitos y reclamos laborales (Ley Bustos).',
      link: 'https://www.dt.gob.cl'
    },
    {
      name: 'Poder Judicial de Chile (PJUD)',
      desc: 'Consulta de causas penales, civiles, laborales y Juzgados de Familia.',
      link: 'https://www.pjud.cl'
    },
    {
      name: 'SERNAC Chile',
      desc: 'Protección al consumidor, garantía legal de 6 meses y mediación de reclamos.',
      link: 'https://www.sernac.cl'
    },
    {
      name: 'Corporación de Asistencia Judicial',
      desc: 'Orientación jurídica gratuita y patrocinio legal para personas vulnerables.',
      link: 'https://www.cajmetro.cl'
    }
  ];

  return (
    <section style={{ marginTop: '4rem', marginBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.35rem 0.85rem',
          borderRadius: '0.375rem',
          background: 'rgba(5, 150, 105, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(5, 150, 105, 0.3)',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
          textTransform: 'uppercase'
        }}>
          RESPALDO & MARCO LEGISLATIVO — CHILE
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          Conectado con las Instituciones Oficiales del Estado
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px', margin: '0 auto' }}>
          Toda la orientación jurídica de LeyIA se fundamenta directamente en las leyes, códigos y fallos de los tribunales chilenos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
        {orgs.map((org, i) => (
          <a
            key={i}
            href={org.link}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.6rem',
              padding: '1.25rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            className="trust-card"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{org.name}</h4>
                <ExternalLink size={14} color="var(--primary-accent)" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {org.desc}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.725rem', color: '#34d399', marginTop: '1rem', fontWeight: 600 }}>
              <CheckCircle2 size={12} /> Sitio Oficial del Estado
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
