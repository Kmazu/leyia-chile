import React, { useState } from 'react';
import { FileText, Download, Check, Sparkles, Lock } from 'lucide-react';

export function DocumentGenerator({ documentList, isProPlan, onOpenPricing }) {
  const [downloadedDoc, setDownloadedDoc] = useState(null);

  const handleDownload = (doc) => {
    if (!isProPlan) {
      onOpenPricing();
      return;
    }

    // Generar archivo de texto simulando formato .DOCX / .PDF
    const content = `====================================================================
DOCUMENTO LEGAL GENERADO POR LEYIA CHILE — SANTIAGO DE CHILE
FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-CL')}
TÍTULO: ${doc.title.toUpperCase()}
====================================================================

AL TRIBUNAL / ORGANISMO COMPETENTE
PRESENTE

Por medio del presente documento, yo [NOMBRE COMPLETO], RUT [RUT], con domicilio en [DIRECCIÓN], Santiago de Chile, me dirijo respetuosamente para exponer y solicitar lo siguiente:

1. HECHOS:
Conforme a los hechos acaecidos e individualizados en el sistema de consulta de LeyIA Chile, se deja constancia de la situación y afectación de derechos amparada bajo la legislación vigente de la República de Chile.

2. FUNDAMENTOS DE DERECHO:
- Constitución Política de la República de Chile (Art. 19).
- Normativa específica del Código y Leyes chilenas vigentes.

3. POR TANTO;
SOLICITO TENER POR PRESENTADO ESTE DOCUMENTO Y DARLE EL TRAMITE LEGAL QUE CORRESPONDA.

____________________________________
FIRMA DEL INTERESADO / SOLICITANTE
RUT: [INGRESE SU RUT]

* Generado conforme a los estándares de LeyIA Chile. Este borrador debe ser revisado por un abogado habilitado.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.id}_LeyIA_Chile.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedDoc(doc.id);
    setTimeout(() => setDownloadedDoc(null), 3000);
  };

  if (!documentList || documentList.length === 0) return null;

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'rgba(99, 102, 241, 0.05)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#fbbf24" /> Plantillas y Minutas Legales Disponibles (Chile)
        </h4>

        {!isProPlan && (
          <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Lock size={12} /> Exclusivo Plan Pro
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        {documentList.map((doc) => (
          <div 
            key={doc.id}
            style={{
              background: 'rgba(10, 13, 20, 0.6)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.85rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{doc.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formato: {doc.format}</div>
            </div>

            <button
              onClick={() => handleDownload(doc)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.6rem',
                border: 'none',
                background: isProPlan ? 'var(--law-gold-gradient)' : 'rgba(255, 255, 255, 0.08)',
                color: isProPlan ? '#000' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.775rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {downloadedDoc === doc.id ? (
                <>
                  <Check size={14} color="#000" /> ¡Descargado!
                </>
              ) : isProPlan ? (
                <>
                  <Download size={14} /> Descargar
                </>
              ) : (
                <>
                  <Lock size={14} color="#a855f7" /> Desbloquear
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
