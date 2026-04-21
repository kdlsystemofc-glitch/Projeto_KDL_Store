'use client';

import { useState } from 'react';
import { ScrollReveal, StaggerReveal, StaggerItem, ParallaxElement } from './ParallaxKit';

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
    <section id="faq" style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0B1A 100%)', padding: '10rem 0', position: 'relative', overflow: 'hidden' }}>
      <ParallaxElement speed={0.4} style={{ position: 'absolute', top: '20%', left: '10%', pointerEvents: 'none' }}>
        <div style={{ width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(0,198,162,0.08) 0%, transparent 65%)' }} />
      </ParallaxElement>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        
        <div className="faq-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4rem', alignItems: 'start' }}>
          
          {/* Left Column: Header and CTA */}
          <div className="faq-header" style={{ gridColumn: 'span 5', position: 'sticky', top: '8rem' }}>
            <ScrollReveal direction="up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '0.4rem 1.25rem', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Dúvidas frequentes</span>
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.95)', marginBottom: '1.5rem' }}>
                <span style={{ 
                  fontFamily: 'Inter, serif', 
                  fontStyle: 'italic', 
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.6)',
                  marginRight: '8px'
                }}>Ainda tem</span>
                <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>perguntas?</span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', marginBottom: '3rem' }}>
                Reunimos as principais dúvidas de nossos clientes. Se não encontrar o que procura, fale com a gente.
              </p>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Precisa de mais ajuda?</p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '2rem', color: 'rgba(255,255,255,0.95)', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Nossa equipe está pronta.</p>
                <a
                  href="mailto:suporte@kdlstore.com.br"
                  id="faq-contact-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem', padding: '0.9rem 2rem', borderRadius: 100, textDecoration: 'none', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'white'; (e.currentTarget as HTMLAnchorElement).style.color = '#0A0A0F'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  Falar com suporte
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Accordion */}
          <div className="faq-list" style={{ gridColumn: 'span 7' }}>
            <StaggerReveal style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {FAQS.map((faq, i) => (
                <StaggerItem key={i} direction="up">
                <div
                  style={{
                    background: open === i ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${open === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 24, overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <button
                    id={`faq-btn-${i}`}
                    onClick={() => setOpen(open === i ? null : i)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem 2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: open === i ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.8)', letterSpacing: '-0.01em', paddingRight: '2rem' }}>
                      {faq.q}
                    </span>
                    <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: `1px solid ${open === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', background: open === i ? 'white' : 'transparent' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={open === i ? '#0A0A0F' : 'currentColor'} strokeWidth="2.5" style={{ transition: 'transform 0.3s ease', transform: open === i ? 'rotate(45deg)' : 'none' }}>
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </button>
                  {open === i && (
                    <div style={{ padding: '0 2rem 2rem' }}>
                      <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontFamily: 'Inter, sans-serif' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 991px) {
          .faq-container { display: flex !important; flexDirection: column !important; gap: 3rem !important; }
          .faq-header { position: static !important; }
        }
      `}</style>
    </section>
  );
}
