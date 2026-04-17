'use client';

import { useState } from 'react';

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
    <section id="faq" style={{ padding: '6rem 0' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-label" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span>❓</span> Perguntas frequentes
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#F4F4FF' }}>
            Tire suas{' '}
            <span className="text-gradient">dúvidas</span>
          </h2>
        </div>

        {/* FAQ Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${open === i ? 'rgba(108,71,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}
            >
              <button
                id={`faq-btn-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '1.25rem 1.5rem',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: 'rgba(244,244,255,0.85)' }}>
                  {faq.q}
                </span>
                <span style={{ color: open === i ? '#6C47FF' : 'rgba(255,255,255,0.35)', flexShrink: 0, marginLeft: 16, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s ease, color 0.2s ease' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </button>
              {open === i && (
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <div style={{ height: 1, background: 'rgba(108,71,255,0.2)', marginBottom: '1.25rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'rgba(244,244,255,0.55)', lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div style={{ marginTop: '3rem', background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.18)', borderRadius: 18, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(244,244,255,0.5)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Ainda tem dúvidas?</p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1.5rem', color: '#F4F4FF', fontSize: '1.1rem' }}>Fale com a nossa equipe</p>
          <a href="mailto:suporte@kdlstore.com.br" id="faq-contact-btn" className="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            suporte@kdlstore.com.br
          </a>
        </div>
      </div>
    </section>
  );
}
