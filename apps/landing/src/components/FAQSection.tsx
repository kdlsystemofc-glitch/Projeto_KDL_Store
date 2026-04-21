'use client';

import { useState } from 'react';
import { ScrollReveal, StaggerReveal, StaggerItem } from './ParallaxKit';

const FAQS = [
  { q: 'Preciso instalar algum programa?', a: 'Não. O KDL Store é 100% web. Acesse pelo navegador de qualquer computador, tablet ou celular. Sem instalação, sem configuração.' },
  { q: 'Tem período de teste gratuito?', a: 'Não oferecemos teste grátis. Cobramos porque entregamos valor real desde o primeiro dia. Mas se você não gostar, pode cancelar a qualquer momento sem multa.' },
  { q: 'Como funciona o pagamento?', a: 'Cobramos mensalmente no cartão de crédito. A cobrança é feita automaticamente todo mês. Você pode cancelar quando quiser, sem burocracia.' },
  { q: 'Posso mudar de plano depois?', a: 'Sim! Você pode fazer upgrade ou downgrade do plano a qualquer momento. O ajuste é feito proporcionalmente ao período restante.' },
  { q: 'Meus dados ficam seguros?', a: 'Sim. Todos os dados são criptografados e armazenados em servidores seguros. Backups automáticos diários garantem que você nunca perca informações.' },
  { q: 'O sistema emite Nota Fiscal?', a: 'O KDL Store emite documentos internos de venda em PDF — comprovantes profissionais para o cliente. Para NF-e oficial, você precisará de um módulo fiscal específico (não incluído).' },
  { q: 'Quantos usuários posso ter?', a: 'Depende do plano: Starter (1 usuário), Pro (até 3 usuários), Premium (ilimitado). Usuários têm níveis de acesso: dono, gerente, vendedor e técnico.' },
  { q: 'Funciona para qualquer tipo de loja?', a: 'Sim! KDL Store foi pensado para qualquer tipo de pequeno comércio: som automotivo, roupas, eletrônicos, utilidades, beleza, pet shop e muito mais.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ background: '#fff', padding: '7rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* Layout 2 colunas — idêntico ao Ascone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '6rem', alignItems: 'start' }}>

          {/* Coluna esquerda: título fixo */}
          <div style={{ position: 'sticky', top: '6rem' }}>
            <ScrollReveal direction="up">
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C3D2E', marginBottom: '1rem' }}>
                FAQ
              </p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#111', marginBottom: '2rem' }}>
                Perguntas{' '}
                <em style={{ fontStyle: 'italic', color: '#1C3D2E' }}>frequentes</em>
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#888', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', marginBottom: '2.5rem' }}>
                Não encontrou o que procura? Fale com a nossa equipe.
              </p>
              <a
                href="mailto:suporte@kdlstore.com.br"
                id="faq-contact-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#1C3D2E', color: 'white',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.875rem',
                  padding: '0.8rem 1.75rem', borderRadius: 999,
                  textDecoration: 'none',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2A5C42'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1C3D2E'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Falar com suporte
              </a>
            </ScrollReveal>
          </div>

          {/* Coluna direita: accordion exato do Ascone */}
          <div>
            <StaggerReveal style={{ display: 'flex', flexDirection: 'column' }}>
              {FAQS.map((faq, i) => (
                <StaggerItem key={i} direction="up">
                  <div style={{ borderTop: '1px solid #E0DDD5' }}>
                    <button
                      id={`faq-btn-${i}`}
                      onClick={() => setOpen(open === i ? null : i)}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1.5rem 0',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1.1rem', fontWeight: 600,
                        color: open === i ? '#1C3D2E' : '#222',
                        lineHeight: 1.4,
                        transition: 'color 0.2s',
                        paddingRight: '2rem',
                      }}>
                        {faq.q}
                      </span>
                      {/* + / × igual ao Ascone */}
                      <span style={{
                        flexShrink: 0,
                        width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid #E0DDD5',
                        color: open === i ? '#1C3D2E' : '#666',
                        fontSize: '1.1rem',
                        fontWeight: 300,
                        transition: 'all 0.2s ease',
                        background: open === i ? '#E8EDE0' : 'transparent',
                      }}>
                        {open === i ? '×' : '+'}
                      </span>
                    </button>

                    {open === i && (
                      <div style={{ paddingBottom: '1.75rem' }}>
                        <p style={{
                          fontSize: '0.95rem', color: '#666',
                          lineHeight: 1.8, fontFamily: 'Inter, sans-serif',
                        }}>
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
              {/* Linha final */}
              <div style={{ borderTop: '1px solid #E0DDD5' }} />
            </StaggerReveal>
          </div>
        </div>

        {/* Estilos responsivos */}
        <style>{`
          @media (max-width: 768px) {
            #faq .faq-grid {
              grid-template-columns: 1fr !important;
              gap: 3rem !important;
            }
            #faq .faq-sticky {
              position: static !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
