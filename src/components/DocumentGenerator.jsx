import React, { useState } from 'react';
import { FileText, Download, Printer, Lock, CheckCircle2, FileEdit } from 'lucide-react';
import { DocumentFillModal } from './DocumentFillModal';

export const CHILEAN_LEGAL_TEMPLATES = [
  {
    id: 'contrato_arriendo_ley21461',
    title: 'Contrato de Arriendo de Inmueble (Ley 21.461 Devuélveme mi Casa)',
    category: 'civil',
    format: 'PDF / Formulario Notarial'
  },
  {
    id: 'minuta_denuncia_lesiones',
    title: 'Minuta de Denuncia por Lesiones (Código Penal / CPP)',
    category: 'penal',
    format: 'PDF / Minuta Judicial'
  },
  {
    id: 'carta_despido_renuncia_dt',
    title: 'Carta de Despido / Renuncia Voluntaria (Código del Trabajo)',
    category: 'laboral',
    format: 'PDF / Carta DT'
  },
  {
    id: 'reclamo_sernac_ley19496',
    title: 'Reclamo y Solicitud ante el SERNAC (Ley 19.496 Protección Al Consumidor)',
    category: 'consumidor',
    format: 'PDF / Minuta SERNAC'
  },
  {
    id: 'poder_simple_notarial',
    title: 'Poder Simple Notarial / Administrativo para Trámites',
    category: 'general',
    format: 'PDF / Documento Notarial'
  },
  {
    id: 'solicitud_pension_alimentos_ley21389',
    title: 'Solicitud de Pensión de Alimentos y Retención (Ley 21.389)',
    category: 'familia',
    format: 'PDF / Solicitud Familia'
  },
  {
    id: 'declaracion_jurada_simple',
    title: 'Declaración Jurada Simple de Residencia o Ingresos',
    category: 'general',
    format: 'PDF / Declaración Notarial'
  },
  {
    id: 'contrato_servicios_honorarios',
    title: 'Contrato de Prestación de Servicios a Honorarios',
    category: 'laboral',
    format: 'PDF / Contrato Civil'
  }
];

export function DocumentGenerator({ userPlan, onOpenPricing, onSaveDoc }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);

  const isPlus = userPlan === 'plus';

  const handleSelectTemplate = (doc) => {
    if (!isPlus) {
      onOpenPricing('plus');
      return;
    }
    setSelectedDoc(doc);
    setIsFillModalOpen(true);
  };

  return (
    <div style={{
      marginTop: '2.5rem',
      padding: '1.75rem',
      background: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary-accent)" /> Repositorio de Documentos Rellenables de Chile (Plan Plus)
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Plantillas escriturales formateadas según las leyes de Chile para rellenar con tus datos y exportar a PDF.
          </p>
        </div>

        {!isPlus && (
          <button 
            onClick={() => onOpenPricing('plus')}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <Lock size={14} /> Desbloquear Plan Plus ($9.990)
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {CHILEAN_LEGAL_TEMPLATES.map((doc) => (
          <div 
            key={doc.id}
            style={{
              background: '#1e293b',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                {doc.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Formato: {doc.format}
              </div>
            </div>

            <button
              onClick={() => handleSelectTemplate(doc)}
              className={isPlus ? 'btn-primary' : 'btn-secondary'}
              style={{
                width: '100%',
                justify: 'center',
                fontSize: '0.8rem',
                padding: '0.5rem'
              }}
            >
              {isPlus ? (
                <>
                  <FileEdit size={14} /> Rellenar e Imprimir PDF
                </>
              ) : (
                <>
                  <Lock size={14} color="var(--primary-accent)" /> Requerido Plan Plus ($9.990)
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <DocumentFillModal 
        isOpen={isFillModalOpen}
        onClose={() => setIsFillModalOpen(false)}
        documentTemplate={selectedDoc}
        onSaveDoc={onSaveDoc}
      />
    </div>
  );
}
