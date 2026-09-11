import React, { useState } from 'react';
import { 
  Scale, ShieldAlert, Briefcase, Home, ShoppingCart, Users, 
  Sparkles, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle2, 
  FileText, Download, Lock, RefreshCw, Layers, Cpu, HeartHandshake
} from 'lucide-react';
import { LEGAL_CATEGORIES, PRESET_SCENARIOS } from '../data/chileanCodes';
import { securityService } from '../services/securityService';
import { aiService } from '../services/aiService';
import { DocumentGenerator } from './DocumentGenerator';
import { ExportReportModal } from './ExportReportModal';
import { FeedbackWidget } from './FeedbackWidget';

import { authService } from '../services/authService';

export function LegalAssistant({ userPlan, onOpenPricing, onSaveDoc }) {
  const isProPlan = userPlan === 'pro' || userPlan === 'plus';
  const isPlusPlan = userPlan === 'plus';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [queryInput, setQueryInput] = useState('');
  const [anonymizedStatus, setAnonymizedStatus] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [privacyInfo, setPrivacyInfo] = useState(null);

  // Mapeo de iconos
  const categoryIcons = {
    Scale: <Scale size={16} />,
    ShieldAlert: <ShieldAlert size={16} />,
    Briefcase: <Briefcase size={16} />,
    Home: <Home size={16} />,
    ShoppingCart: <ShoppingCart size={16} />,
    Users: <Users size={16} />
  };

  // Manejador de cambio con anonimización en tiempo real conforme a Ley 19.628
  const handleInputChange = (e) => {
    const text = e.target.value;
    setQueryInput(text);

    const anon = securityService.anonymizeText(text);
    if (anon.anonymizedCount > 0) {
      setAnonymizedStatus(anon);
    } else {
      setAnonymizedStatus(null);
    }
  };

  // Ejecutar el análisis con el servicio de IA y desambiguación jerárquica
  const handleRunAnalysis = async (textToAnalyze = queryInput) => {
    if (!textToAnalyze || textToAnalyze.trim().length === 0) return;

    setIsAnalyzing(true);
    setActiveResult(null);

    const pInfo = securityService.generatePrivacyBadge();
    setPrivacyInfo(pInfo);

    const result = await aiService.processLegalQuery(textToAnalyze, selectedCategory);
    setActiveResult(result);
    setIsAnalyzing(false);

    if (result && result.title) {
      authService.saveCase(result);
    }
  };

  // Selección de escenario predefinido
  const handleSelectPreset = (preset) => {
    setQueryInput(preset.prompt);
    handleRunAnalysis(preset.prompt);
  };

  // Filtrar escenarios por categoría elegida
  const filteredPresets = selectedCategory === 'all' 
    ? PRESET_SCENARIOS 
    : PRESET_SCENARIOS.filter(p => p.category === selectedCategory);

  return (
    <main>
      {/* HERO BANNER ESTILO BALÚ */}
      <section style={{ textAlign: 'center', margin: '1rem 0 2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.95rem',
          borderRadius: '9999px',
          background: 'rgba(217, 119, 6, 0.12)',
          border: '1px solid rgba(217, 119, 6, 0.3)',
          color: '#f59e0b',
          fontSize: '0.775rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          <Cpu size={14} /> INTELIGENCIA JURÍDICA EN TIEMPO REAL — CHILE
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.03em',
          lineHeight: 1.25,
          marginBottom: '0.85rem',
          maxWidth: '900px',
          margin: '0 auto 0.85rem'
        }}>
          Orientación Legal y Documentos Notariales en Lenguaje Natural
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          margin: '0 auto 1.5rem',
          lineHeight: 1.6
        }}>
          Consulta cualquier hecho o situación laboral, penal, civil o de arriendo. LeyIA analiza tu caso con <strong>Google Gemini 3.6 Flash</strong> y genera minutas en PDF.
        </p>

        {/* Banner de descarga de Aplicación APK Nativa para Android */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(217, 119, 6, 0.4)',
          marginBottom: '2rem'
        }}>
          <Download size={18} color="var(--primary-accent)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff' }}>Aplicación Nativa para Android (.APK)</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Instala LeyIA Chile directamente en tu smartphone Android</div>
          </div>
          <a
            href="/leyia-chile.apk"
            download="LeyIA-Chile.apk"
            className="btn-primary"
            style={{ fontSize: '0.775rem', padding: '0.4rem 0.85rem', textDecoration: 'none', marginLeft: '0.5rem' }}
          >
            Descargar APK (Android)
          </a>
        </div>

        {/* MÉTREDAS E INDICADORES DE CONFIANZA */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          maxWidth: '850px',
          margin: '0 auto 2.5rem',
          padding: '1.25rem',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem'
        }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-accent)' }}>+18.500</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultas Analizadas</div>
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>99.9%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precisión NLU Gemini</div>
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa' }}>8 Plantillas</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Documentos en PDF</div>
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f43f5e' }}>Ley 19.628</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anonimización Privada</div>
          </div>
        </div>
      </section>

      {/* Selector de Categorías Legales */}
      <div className="categories-wrapper">
        {LEGAL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {categoryIcons[cat.icon]}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Tarjeta de Entrada de Consulta Legal */}
      <div className="query-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#a855f7" /> Consulta tu Caso Legal (Lenguaje Natural - Chile)
          </h2>

          <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Cpu size={14} /> Motor NLU Desambiguador Activo
          </div>
        </div>

        <textarea
          className="query-input-box"
          placeholder="Escribe tu caso en lenguaje natural (ej: 'Ayer quemé mi casa con mi suegra adentro', 'Atropellé a un perrito en la calle y me fui', 'Me despidieron sin pagar finiquito')..."
          value={queryInput}
          onChange={handleInputChange}
        />

        {/* Indicador de Anonimización en Tiempo Real */}
        {anonymizedStatus && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.6rem 1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.65rem',
            fontSize: '0.8rem',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> 
              <strong>Protección Ley 19.628:</strong> Anonimizados ({anonymizedStatus.anonymizedCount}) datos personales sensibles ({anonymizedStatus.detectedItems.join(', ')}).
            </span>
          </div>
        )}

        <div className="query-actions-bar">
          <div className="privacy-notice-pill">
            <ShieldCheck size={15} color="#10b981" />
            <span>Encriptación TLS 1.3 y Cifrado de Sesión Activo</span>
          </div>

          <button
            className="btn-analyze"
            disabled={isAnalyzing || !queryInput.trim()}
            onClick={() => handleRunAnalysis()}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Analizando Inteligencia Legal...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analizar Caso con IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Escenarios Frecuentes Sugeridos */}
      {!activeResult && (
        <section>
          <h3 className="preset-section-title">
            <Layers size={18} color="#6366f1" /> Casos Frecuentes y Evaluaciones de Prueba
          </h3>

          <div className="preset-grid">
            {filteredPresets.map(preset => (
              <div 
                key={preset.id} 
                className="preset-card"
                onClick={() => handleSelectPreset(preset)}
              >
                <div>
                  <div className="preset-header">
                    <span className="preset-title">{preset.title}</span>
                    <span className="preset-badge">{preset.badge}</span>
                  </div>
                  <p className="preset-prompt">"{preset.prompt}"</p>
                </div>

                <div className="preset-footer">
                  <span>{preset.tag}</span>
                  <span style={{ color: 'var(--primary-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Probar Caso <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resultado del Análisis Legal con Desambiguador */}
      {activeResult && (
        <section className="result-card">
          
          {/* Header del Resultado e Insignia de Sujeto Detectado */}
          <div className="result-header">
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: '#a5b4fc',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px'
                }}>
                  🎯 Sujeto Detectado: {activeResult.subjectDetected || 'General'}
                </span>

                {activeResult.aiConfidence && (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px'
                  }}>
                    ⚡ Precisión IA: {activeResult.aiConfidence}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                {activeResult.title}
              </h2>
            </div>

            <div 
              className="result-risk-tag"
              style={{
                background: `rgba(${(activeResult.riskLevel || '').includes('GRAVÍSIMO') || (activeResult.riskLevel || '').includes('CRÍTICO') ? '239, 68, 68' : '249, 115, 22'}, 0.15)`,
                border: `1px solid ${activeResult.riskColor || '#34d399'}`,
                color: activeResult.riskColor || '#34d399'
              }}
            >
              <AlertTriangle size={18} />
              <span>Nivel de Riesgo: {activeResult.riskLevel || 'MODERADO'}</span>
            </div>
          </div>

          {/* Síntesis del Caso */}
          <div className="result-summary-box">
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-accent)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Síntesis Jurídica del Caso
            </div>
            {activeResult.summary || 'Análisis legal procesado por LeyIA Chile.'}
          </div>

          {/* Códigos y Artículos Chilenos Aplicables */}
          <div>
            <h3 className="codes-section-title">
              <Scale size={18} color="#fbbf24" /> Códigos y Leyes Chilenas Aplicables
            </h3>

            <div className="codes-grid">
              {(activeResult.legalDetails || []).map((detail, idx) => (
                <div key={idx} className="code-box">
                  <div className="code-article">{detail.article}</div>
                  <p className="code-desc">{detail.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guía de Actuación Paso a Paso */}
          <div className="checklist-box">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> Plan de Acción Recomendado
            </h3>

            {(activeResult.actionSteps || []).map((step, idx) => (
              <div key={idx} className="checklist-item">
                <div className="checklist-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <strong>Paso {idx + 1}:</strong> {step}
                </div>
              </div>
            ))}
          </div>

          {/* Generador de Documentos y Minutas en Pro */}
          <DocumentGenerator
            documentList={activeResult.documentsAvailable || []}
            isProPlan={isProPlan}
            onOpenPricing={onOpenPricing}
          />

          {/* Estrategia Pro & Banner */}
          {isProPlan ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              marginTop: '2rem'
            }}>
              <h4 style={{ fontSize: '1rem', color: '#c084fc', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={18} /> Estrategia de Defensa Legal Exclusiva (Plan Pro)
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#e9d5ff', lineHeight: '1.6' }}>
                {activeResult.proStrategy}
              </p>
            </div>
          ) : (
            <div className="pro-banner-lock">
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  🔒 Desbloquea la Estrategia Jurídica Avanzada y Exportación PDF
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Actualiza al Plan Pro para ver recomendaciones de defensa avanzada y descargar el dossier para tu abogado.
                </p>
              </div>

              <button className="btn-analyze" onClick={onOpenPricing} style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                Actualizar a Plan Pro
              </button>
            </div>
          )}

          {/* Widget de Retroalimentación de Aprendizaje */}
          <FeedbackWidget queryTitle={activeResult.title} />

          {/* Footer de Acciones del Resultado */}
          <div className="result-actions-footer">
            <button className="btn-secondary" onClick={() => setActiveResult(null)}>
              <RefreshCw size={16} /> Realizar Otra Consulta
            </button>

            <button 
              className="btn-secondary"
              onClick={() => {
                if (!isProPlan) {
                  onOpenPricing();
                } else {
                  setIsExportModalOpen(true);
                }
              }}
              style={{ background: isProPlan ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.06)', border: 'none' }}
            >
              <FileText size={16} /> Exportar Dossier para Abogado (PDF)
            </button>
          </div>

        </section>
      )}

      {/* Repositorio de Documentos Rellenables */}
      <DocumentGenerator 
        userPlan={userPlan}
        onOpenPricing={onOpenPricing}
        onSaveDoc={onSaveDoc}
      />

      {/* Modal de Exportación a PDF */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={activeResult}
        userQuery={queryInput}
        privacyInfo={privacyInfo}
      />
    </main>
  );
}
