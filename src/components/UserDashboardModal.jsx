import React, { useState, useEffect } from 'react';
import { X, User, Scale, FileText, CreditCard, LogOut, CheckCircle2, ShieldCheck, Clock, FolderPlus, Folder, Plus, Search, Eye, Download, Tag } from 'lucide-react';
import { authService } from '../services/authService';

export function UserDashboardModal({ isOpen, onClose, user, onLogout, onOpenPricing, savedCases, emittedDocs }) {
  const [activeTab, setActiveTab] = useState('expedientes'); // 'expedientes' | 'consultas' | 'docs' | 'plan'
  const [legalCases, setLegalCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseCategory, setNewCaseCategory] = useState('civil');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadUserCases();
    }
  }, [isOpen, user]);

  const loadUserCases = async () => {
    try {
      const cases = await authService.getLegalCases();
      setLegalCases(cases);
    } catch (e) {
      console.warn('Error al cargar expedientes:', e);
    }
  };

  const handleCreateCaseSubmit = async (e) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;

    try {
      const created = await authService.createLegalCase({
        title: newCaseTitle,
        description: newCaseDesc,
        category: newCaseCategory,
        status: 'activo'
      });

      setLegalCases([created, ...legalCases]);
      setIsCreatingCase(false);
      setNewCaseTitle('');
      setNewCaseDesc('');
      setNewCaseCategory('civil');
    } catch (err) {
      alert('Error al crear expediente: ' + err.message);
    }
  };

  if (!isOpen || !user) return null;

  const planLabel = user.plan === 'plus' ? 'Plan Legal Plus ($9.990)' : user.plan === 'pro' ? 'Plan Legal Pro ($5.990)' : 'Plan Gratuito';

  // Filtrado de Consultas por Expediente seleccionado y término de búsqueda
  const filteredCases = (savedCases || []).filter(item => {
    const matchesSearch = searchTerm ? (
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.query && item.query.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : true;

    const matchesCase = selectedCaseId ? item.caseId === selectedCaseId : true;
    return matchesSearch && matchesCase;
  });

  const getCategoryBadgeColor = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'penal': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'civil': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' };
      case 'familia': return { bg: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.4)' };
      case 'laboral': return { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
      default: return { bg: 'rgba(217, 119, 6, 0.2)', color: '#f59e0b', border: 'rgba(217, 119, 6, 0.4)' };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Cabecera del Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--law-gold-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 800,
            fontSize: '1.2rem'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>
                {user.name}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                (@{user.username || user.email.split('@')[0]})
              </span>
              {user.isSuperUser && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  letterSpacing: '0.05em'
                }}>
                  👑 SUPERUSUARIO
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {user.email} {user.emailConfirmed ? '✓ Verificado' : '• Pendiente Verificación'}
            </div>
          </div>

          <div>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '0.375rem',
              background: user.isSuperUser ? 'rgba(16, 185, 129, 0.2)' : user.plan === 'plus' ? 'rgba(217, 119, 6, 0.2)' : user.plan === 'pro' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: user.isSuperUser ? '#34d399' : user.plan === 'plus' ? '#f59e0b' : user.plan === 'pro' ? '#60a5fa' : 'var(--text-muted)',
              border: user.isSuperUser ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {user.isSuperUser ? '⚡ Superusuario Ilimitado' : planLabel}
            </span>
          </div>
        </div>

        {/* Resumen Superior de Indicadores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#1e293b', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Folder size={24} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{legalCases.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📁 Expedientes Activos</div>
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scale size={24} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{savedCases ? savedCases.length : 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>💬 Consultas Almacenadas</div>
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} color="#34d399" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{emittedDocs ? emittedDocs.length : 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📄 Documentos Generados</div>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => { setActiveTab('expedientes'); setSelectedCaseId(null); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'expedientes' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'expedientes' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Folder size={16} /> Mis Expedientes ({legalCases.length})
          </button>

          <button
            onClick={() => setActiveTab('consultas')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'consultas' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'consultas' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Scale size={16} /> Consultas Jurídicas ({savedCases ? savedCases.length : 0})
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'docs' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'docs' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> Documentos PDF ({emittedDocs ? emittedDocs.length : 0})
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'plan' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'plan' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CreditCard size={16} /> Suscripción
          </button>
        </div>

        {/* ── PESTAÑA 1: GESTIÓN DE EXPEDIENTES Y CARPETAS ── */}
        {activeTab === 'expedientes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Organiza tus casos por área legal (Penal, Civil, Familia, Laboral).
              </div>
              <button
                onClick={() => setIsCreatingCase(!isCreatingCase)}
                className="btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Plus size={14} /> {isCreatingCase ? 'Cancelar' : '+ Nuevo Expediente'}
              </button>
            </div>

            {/* FORMULARIO CREAR EXPEDIENTE */}
            {isCreatingCase && (
              <form onSubmit={handleCreateCaseSubmit} style={{ background: '#1e293b', border: '1px solid var(--primary-accent)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-accent)', marginBottom: '0.75rem' }}>
                  Crear Nueva Carpeta Investigativa / Causa
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label">Título del Expediente</label>
                    <input
                      type="text"
                      required
                      value={newCaseTitle}
                      onChange={(e) => setNewCaseTitle(e.target.value)}
                      className="form-input"
                      placeholder="Ej: Problema de Arrendamiento Propiedad Santiago"
                    />
                  </div>
                  <div>
                    <label className="form-label">Materia Legal</label>
                    <select
                      value={newCaseCategory}
                      onChange={(e) => setNewCaseCategory(e.target.value)}
                      className="form-input"
                    >
                      <option value="civil">Civil</option>
                      <option value="penal">Penal</option>
                      <option value="familia">Familia</option>
                      <option value="laboral">Laboral</option>
                      <option value="comercial">Comercial</option>
                      <option value="tránsito">Tránsito</option>
                      <option value="constitucional">Constitucional</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Descripción o Notas Iniciales</label>
                  <input
                    type="text"
                    value={newCaseDesc}
                    onChange={(e) => setNewCaseDesc(e.target.value)}
                    className="form-input"
                    placeholder="Detalles sobre las partes involucradas, hechos o antecedentes..."
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                  Guardar Expediente
                </button>
              </form>
            )}

            {/* LISTADO DE EXPEDIENTES */}
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {legalCases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No tienes expedientes creados aún. Haz clic en "+ Nuevo Expediente" para agrupar tus consultas y documentos.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  {legalCases.map((c) => {
                    const badge = getCategoryBadgeColor(c.category);
                    return (
                      <div
                        key={c.id}
                        style={{
                          background: '#1e293b',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '0.25rem',
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              textTransform: 'uppercase'
                            }}>
                              {c.category}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                              {new Date(c.created_at || Date.now()).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                            {c.title}
                          </div>
                          {c.description && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {c.description}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setActiveTab('consultas');
                          }}
                          className="btn-secondary"
                          style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '0.35rem' }}
                        >
                          Ver Consultas del Expediente →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PESTAÑA 2: CONSULTAS JURÍDICAS ── */}
        {activeTab === 'consultas' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="Buscar en tus consultas previas..."
                />
              </div>

              {selectedCaseId && (
                <button
                  onClick={() => setSelectedCaseId(null)}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem' }}
                >
                  Ver Todas (Quitar Filtro Expediente)
                </button>
              )}
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {filteredCases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No se encontraron consultas registradas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {filteredCases.map((item) => (
                    <div key={item.id} style={{
                      background: '#1e293b',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      padding: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{item.title || item.query}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={12} /> {item.date}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {item.summary || (item.result && item.result.summary)}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
                        Materia: {item.result?.category || 'general'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PESTAÑA 3: DOCUMENTOS PDF ── */}
        {activeTab === 'docs' && (
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {!emittedDocs || emittedDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No has generado documentos en PDF aún. Puedes crearlos en la herramienta principal.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {emittedDocs.map((doc) => (
                  <div key={doc.id} style={{
                    background: '#1e293b',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{doc.docName || doc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tipo: {doc.docType || 'PDF'} | Fecha: {doc.date}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                      ✓ Almacenado
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PESTAÑA 4: SUSCRIPCIÓN ── */}
        {activeTab === 'plan' && (
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                Estado Actual: <span style={{ color: 'var(--primary-accent)' }}>{planLabel}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {user.plan === 'plus' 
                  ? 'Tienes acceso ILIMITADO a consultas con el Motor Jurídico IA y generación de expedientes y documentos jurídicos en PDF.'
                  : user.plan === 'pro'
                  ? 'Tienes acceso ILIMITADO a consultas jurídicas con IA en tiempo real. Actualiza al Plan Plus para desbloquear documentos rellenables.'
                  : 'Estás usando la versión básica. Actualiza al Plan Pro ($5.990) o Plan Plus ($9.990) para potenciar tus consultas.'}
              </p>

              {user.plan !== 'plus' && (
                <button 
                  onClick={() => {
                    onClose();
                    onOpenPricing(user.plan === 'pro' ? 'plus' : 'pro');
                  }} 
                  className="btn-primary"
                >
                  {user.plan === 'pro' ? 'Mejorar a Plan Plus ($9.990)' : 'Mejorar a Plan Pro ($5.990)'}
                </button>
              )}
            </div>

            <button onClick={onLogout} className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
