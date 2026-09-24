import React, { useState, useEffect, useRef } from 'react';
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

export function LegalAssistant({ user, userPlan, onOpenPricing, onSaveDoc }) {
  const isSuperAdmin = user?.role === 'superadmin';
  const isProPlan = userPlan === 'pro' || userPlan === 'plus' || isSuperAdmin;
  const isPlusPlan = userPlan === 'plus' || isSuperAdmin;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [queryInput, setQueryInput] = useState('');
  const [anonymizedStatus, setAnonymizedStatus] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [privacyInfo, setPrivacyInfo] = useState(null);

  const resultRef = useRef(null);

  useEffect(() => {
    if (activeResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [activeResult]);

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

  // Contador de consultas realizadas en la sesión para usuarios del Plan Starter (Límite: 1 consulta)
  const [freeQueryCount, setFreeQueryCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('leyia_free_queries_used') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  const [analysisStep, setAnalysisStep] = useState(0);

  // Ejecutar el análisis con el servicio de IA y desambiguación jerárquica
  const handleRunAnalysis = async (textToAnalyze = queryInput) => {
    if (!textToAnalyze || textToAnalyze.trim().length === 0) return;

    // Verificar si el usuario está en Plan Starter (no suscrito) y ya usó su 1 consulta gratuita
    // Si el usuario está logueado y es superadmin, no hay límite.
    const usedQueries = user?.query_count !== undefined ? user.query_count : freeQueryCount;
    if (!isProPlan && usedQueries >= 1) {
      alert('🔒 Has alcanzado el límite de 1 consulta gratuita de prueba.\n\nPara continuar realizando consultas ilimitadas con la IA y acceder a los beneficios completos, suscríbete al Plan Legal Pro ($5.990) o Plus ($9.990).');
      if (onOpenPricing) onOpenPricing('pro');
      return;
    }

    setIsAnalyzing(true);
    setActiveResult(null);
    setAnalysisStep(1);

    const pInfo = securityService.generatePrivacyBadge();
    setPrivacyInfo(pInfo);

    try {
      const result = await aiService.processLegalQuery(textToAnalyze, selectedCategory);
      setActiveResult(result);

      if (result && result.title && user) {
        await authService.saveCase(result);
        await authService.incrementQueryCount();
      }

      // Si es plan gratis sin login, incrementar el contador de uso gratuito local
      if (!isProPlan && !user) {
        const newCount = freeQueryCount + 1;
        setFreeQueryCount(newCount);
        localStorage.setItem('leyia_free_queries_used', newCount.toString());
      }
    } catch (err) {
      console.error('Error en ejecución de análisis:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
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

        {!isProPlan && (
          <div style={{
            marginBottom: '0.85rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '0.5rem',
            background: freeQueryCount >= 1 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: freeQueryCount >= 1 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '0.8rem',
            color: freeQueryCount >= 1 ? '#f87171' : '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <span>
              {freeQueryCount >= 1 
                ? '🔒 Has alcanzado el límite de 1 consulta gratis de tu Plan Starter.' 
                : '🎁 Tienes 1 Consulta Legal Gratuita en tu Plan Starter.'}
            </span>
            <button
              onClick={() => onOpenPricing && onOpenPricing('pro')}
              style={{
                background: 'var(--primary-accent)',
                color: '#000',
                border: 'none',
                padding: '0.25rem 0.65rem',
                borderRadius: '0.375rem',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Ver Planes Ilimitados
            </button>
          </div>
        )}

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
      {!activeResult && !isAnalyzing && (
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
        <section className="result-card" ref={resultRef}>
          
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

          {/* Hechos y Problemas Jurídicos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="checklist-box" style={{ marginTop: 0 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#3b82f6', marginBottom: '1rem' }}>Hechos Relevantes</h3>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                {(activeResult.facts || []).map((fact, idx) => <li key={idx} style={{ marginBottom: '0.4rem' }}>{fact}</li>)}
              </ul>
            </div>
            <div className="checklist-box" style={{ marginTop: 0 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ef4444', marginBottom: '1rem' }}>Problemas Jurídicos</h3>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                {(activeResult.legalIssues || []).map((issue, idx) => <li key={idx} style={{ marginBottom: '0.4rem' }}>{issue}</li>)}
              </ul>
            </div>
          </div>

          {/* Normativa y Jurisprudencia */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 className="codes-section-title">
              <Scale size={18} color="#fbbf24" /> Normativa Aplicable y Jurisprudencia
            </h3>
            <div className="codes-grid">
              {(activeResult.applicableLaw || []).map((law, idx) => (
                <div key={`law-${idx}`} className="code-box">
                  <div className="code-article">Normativa</div>
                  <p className="code-desc">{law}</p>
                </div>
              ))}
              {(activeResult.jurisprudence || []).map((jur, idx) => (
                <div key={`jur-${idx}`} className="code-box">
                  <div className="code-article">Jurisprudencia</div>
                  <p className="code-desc">{jur}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Procedimiento y Plazos */}
          <div className="checklist-box" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> Procedimiento, Evidencia y Recomendaciones
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Procedimiento:</strong>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {(activeResult.procedure || []).map((step, idx) => <li key={idx} style={{ marginBottom: '0.4rem' }}>{step}</li>)}
              </ul>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Plazos:</strong>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {(activeResult.deadlines || []).map((deadline, idx) => <li key={idx} style={{ marginBottom: '0.4rem' }}>{deadline}</li>)}
              </ul>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Recomendaciones / Riesgos:</strong>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {(activeResult.recommendations || []).map((rec, idx) => <li key={`rec-${idx}`} style={{ marginBottom: '0.4rem' }}>{rec}</li>)}
                {(activeResult.risks || []).map((risk, idx) => <li key={`risk-${idx}`} style={{ marginBottom: '0.4rem', color: '#fca5a5' }}>Riesgo: {risk}</li>)}
              </ul>
            </div>
          </div>

          {/* Fuentes y Aviso */}
          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Fuentes de Verificación:</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {(activeResult.sources || []).map((source, idx) => <li key={idx}>{source}</li>)}
            </ul>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
              {activeResult.disclaimer || "LEYIA CHILE ENTREGA INFORMACIÓN Y ORIENTACIÓN JURÍDICA GENERAL BASADA EN LAS FUENTES DISPONIBLES. NO SUSTITUYE LA ASESORÍA DE UN ABOGADO. LA INFORMACIÓN PUEDE REQUERIR VERIFICACIÓN SEGÚN LA FECHA, JURISDICCIÓN Y ANTECEDENTES DEL CASO."}
            </p>
          </div>

          {/* Generador de Documentos y Minutas en Pro */}
          <DocumentGenerator
            documentList={activeResult.documentsAvailable || []}
            isProPlan={isProPlan}
            onOpenPricing={onOpenPricing}
          />

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
