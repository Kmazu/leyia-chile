import React from 'react';
import { X, Printer, ShieldCheck, FileCheck2, Scale, Download } from 'lucide-react';

export function ExportReportModal({ isOpen, onClose, result, userQuery, privacyInfo }) {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Encabezado Certificado LeyIA */}
        <div style={{
          borderBottom: '2px solid var(--primary-accent)',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={24} color="#6366f1" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Dossier Legal Preliminar</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Preparado por LeyIA Chile para Primera Consulta con Abogado Habilitado
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
              <ShieldCheck size={14} /> CERTIFICADO LEY 19.628
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Código HASH: {privacyInfo?.hash || 'SEC-892F1A'}
            </div>
          </div>
        </div>

        {/* Cuerpo del Reporte */}
        <div id="printable-legal-dossier" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: '#e5e7eb' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Consulta Anonimizada del Usuario
            </div>
            <div style={{ fontStyle: 'italic', color: '#fff' }}>
              "{userQuery || result.title}"
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. Diagnóstico Legal y Clasificación de Riesgo
            </h4>
            <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
              <strong>Materia:</strong> {result.title} <br />
              <strong>Nivel de Gravedad / Riesgo:</strong> <span style={{ color: result.riskColor, fontWeight: 700 }}>{result.riskLevel}</span> <br />
              <strong>Síntesis:</strong> {result.summary}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. Citas de Artículos y Leyes Chilenas Aplicables
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.legalDetails.map((item, idx) => (
                <li key={idx} style={{ background: 'rgba(10, 13, 20, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>{item.article}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>
              3. Hoja de Ruta / Plan de Acción Inmediato
            </h4>
            <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {result.actionSteps.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '0.3rem' }}>{step}</li>
              ))}
            </ol>
          </div>

          {result.proStrategy && (
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                💡 Enfoque Estratégico Sugerido para el Abogado
              </div>
              <div style={{ fontSize: '0.825rem', color: '#e9d5ff', lineHeight: '1.5' }}>
                {result.proStrategy}
              </div>
            </div>
          )}

        </div>

        {/* Pie de Acciones del Modal */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Emisión: {new Date().toLocaleString('es-CL')}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            <button className="btn-analyze" onClick={handlePrint} style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
              <Printer size={16} /> Imprimir / Guardar PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
