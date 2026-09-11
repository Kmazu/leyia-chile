import React, { useState } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export function DocumentFillModal({ isOpen, onClose, documentTemplate, onSaveDoc }) {
  const [formData, setFormData] = useState({
    userNombre: '',
    userRut: '',
    userDomicilio: '',
    userComuna: 'Santiago',
    counterpartNombre: '',
    counterpartRut: '',
    monto: '',
    hechos: ''
  });

  const [isPreview, setIsPreview] = useState(false);

  if (!isOpen || !documentTemplate) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrintDocument = () => {
    onSaveDoc({
      title: documentTemplate.title,
      templateId: documentTemplate.id,
      filledData: formData
    });
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary-accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            REPOSITORIO DE DOCUMENTOS OFICIALES — CHILE
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>
            {documentTemplate.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Completa los datos requeridos para generar el documento formateado listo para firma e impresión.
          </p>
        </div>

        {!isPreview ? (
          /* FORMULARIO DE DATOS */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo del Solicitante</label>
                <input 
                  type="text" 
                  name="userNombre" 
                  value={formData.userNombre} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: Juan Antonio Pérez Cotapos" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">RUT del Solicitante</label>
                <input 
                  type="text" 
                  name="userRut" 
                  value={formData.userRut} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: 15.432.890-K" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Domicilio (Calle y Número)</label>
                <input 
                  type="text" 
                  name="userDomicilio" 
                  value={formData.userDomicilio} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: Av. Providencia 1234, Depto 402" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Comuna y Ciudad</label>
                <input 
                  type="text" 
                  name="userComuna" 
                  value={formData.userComuna} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: Providencia, Santiago" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de la Contraparte (Si aplica)</label>
                <input 
                  type="text" 
                  name="counterpartNombre" 
                  value={formData.counterpartNombre} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: Empresa S.A. / Nombre Arrendatario" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">RUT de la Contraparte (Si aplica)</label>
                <input 
                  type="text" 
                  name="counterpartRut" 
                  value={formData.counterpartRut} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: 76.543.210-9" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Relación de Hechos o Cláusulas Específicas</label>
              <textarea 
                name="hechos" 
                rows={3} 
                value={formData.hechos} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="Describa brevemente la situación u objeto del documento..." 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setIsPreview(true)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Generar Vista Previa del Documento
              </button>
            </div>
          </div>
        ) : (
          /* VISTA PREVIA DEL DOCUMENTO PARA IMPRESIÓN */
          <div>
            <div 
              className="printable-document"
              style={{
                background: '#fff',
                color: '#000',
                padding: '2.5rem',
                borderRadius: '0.5rem',
                fontFamily: 'Times New Roman, serif',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #ddd'
              }}
            >
              <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                {documentTemplate.title.toUpperCase()}
              </div>

              <p style={{ marginBottom: '1rem' }}>
                En Santiago de Chile, a {new Date().toLocaleDateString('es-CL')}, comparece don(ña){' '}
                <strong>{formData.userNombre || '[NOMBRE SOLICITANTE]'}</strong>, cédula de identidad y RUT N°{' '}
                <strong>{formData.userRut || '[RUT]'}</strong>, domiciliado(a) en {formData.userDomicilio || '[DOMICILIO]'}, comuna de {formData.userComuna || '[COMUNA]'}, y expone:
              </p>

              <p style={{ marginBottom: '1rem' }}>
                <strong>PRIMERO:</strong> Que por medio del presente instrumento viene en individualizar la contraparte don(ña) o sociedad{' '}
                <strong>{formData.counterpartNombre || '[NOMBRE CONTRAPARTE]'}</strong>, RUT N°{' '}
                <strong>{formData.counterpartRut || '[RUT CONTRAPARTE]'}</strong>.
              </p>

              <p style={{ marginBottom: '1rem' }}>
                <strong>SEGUNDO:</strong> Que en relación a la materia de <em>{documentTemplate.title}</em>, se deja constancia expresamente de los siguientes hechos y fundamentos:
                <br />
                {formData.hechos || 'Se adjuntan los antecedentes legales vigentes conforme a la normativa de la República de Chile.'}
              </p>

              <p style={{ marginBottom: '2.5rem' }}>
                <strong>POR TANTO;</strong> Ruego a Ud. tener por presentado este documento y darle el trámite correspondiente.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '3rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                <div style={{ textAlign: 'center', borderTop: '1px solid #000', paddingTop: '0.5rem', width: '220px' }}>
                  Firma Solicitante<br />RUT: {formData.userRut || '___________'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsPreview(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Editar Datos
              </button>
              <button onClick={handlePrintDocument} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Printer size={16} /> Imprimir / Exportar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
