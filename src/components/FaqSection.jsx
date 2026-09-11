import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Scale, FileText, CreditCard } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: '¿Las minutas y contratos generados en el Plan Plus tienen validez legal en Chile?',
      answer: 'Sí. Todos los borradores y plantillas (Contrato de Arriendo Ley 21.461, Minutas por Lesiones, Cartas de Despido/Renuncia, Reclamos SERNAC y Poderes) están redactados estrictamente conforme al ordenamiento jurídico de la República de Chile. Pueden ser firmados ante notario público o presentarse directamente en las instituciones correspondientes.'
    },
    {
      question: '¿Cómo funciona el pago por Transferencia Bancaria Directa?',
      answer: 'Al seleccionar Transferencia Bancaria en la pasarela de pago, verás los datos oficiales de la cuenta de LeyIA Chile SpA (RUT 16.260.747-2, N° Cuenta 1010371658). Una vez realizada la transferencia, adjuntas la captura o comprobante en el módulo y tu Plan Pro ($5.990) o Plan Plus ($9.990) quedará activado inmediatamente.'
    },
    {
      question: '¿Qué nivel de privacidad tienen mis consultas según la legislación chilena?',
      answer: 'LeyIA Chile cumple en su totalidad con la Ley N° 19.628 sobre Protección de la Vida Privada. Antes de enviar cualquier consulta a la Inteligencia Artificial, el sistema anonimiza automáticamente nombres propios, RUTs, direcciones y teléfonos para asegurar confidencialidad absoluta.'
    },
    {
      question: '¿Puedo instalar LeyIA Chile como una aplicación en mi teléfono o computador?',
      answer: '¡Absolutamente! Haz clic en el botón "Instalar App" en la barra de navegación. LeyIA Chile se instalará como una aplicación independiente (PWA) en tu dispositivo Android, iPhone, Windows o Mac sin necesidad de abrir un navegador web.'
    },
    {
      question: '¿Cuál es la diferencia entre el Plan Pro ($5.990) y el Plan Plus ($9.990)?',
      answer: 'El Plan Pro ($5.990/mes) te otorga consultas ILIMITADAS en tiempo real con la IA de Gemini 3.6 Flash e historial de casos. El Plan Plus ($9.990/mes) incluye todo lo anterior MÁS el acceso exclusivo al Repositorio de Documentos Legales Rellenables con exportación e impresión en PDF notarial.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          PREGUNTAS FRECUENTES — CHILE
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          Resuelve tus Dudas sobre LeyIA Chile
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px', margin: '0 auto' }}>
          Conoce cómo opera la Inteligencia Artificial, la validez notarial de los documentos y las formas de pago.
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              style={{
                background: isOpen ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.7)',
                border: isOpen ? '1px solid var(--primary-accent)' : '1px solid var(--border-color)',
                borderRadius: '0.6rem',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '1rem'
                }}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  size={18} 
                  color="var(--primary-accent)"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0
                  }} 
                />
              </button>

              {isOpen && (
                <div style={{
                  padding: '0 1.5rem 1.25rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '1rem'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
