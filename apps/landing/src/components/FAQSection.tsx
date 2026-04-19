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
    <section id="faq" style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0B1A 100%)', padding: '7rem 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(0,198,162,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,198,162,0.1)', border: '1px solid rgba(0,198,162,0.2)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C6A2', display: 'inline-block', boxShadow: '0 0 8px #00C6A2' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00C6A2' }}>Perguntas frequentes</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.93)' }}>
            Suas dúvidas,{' '}
            <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>respondidas.</span>
          </h2>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3.5rem' }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: open === i ? 'rgba(108,71,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${open === i ? 'rgba(108,71,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16, overflow: 'hidden',
                transition: 'all 0.25s ease',
              }}
            >
              <button
                id={`faq-btn-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.35rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: open === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)' }}>
                  {faq.q}
                </span>
                <span style={{ flexShrink: 0, marginLeft: 16, transition: 'transform 0.25s ease, color 0.2s ease', transform: open === i ? 'rotate(45deg)' : 'none', color: open === i ? '#6C47FF' : 'rgba(255,255,255,0.25)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </button>
              {open === i && (
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <div style={{ height: 1, background: 'rgba(108,71,255,0.2)', marginBottom: '1.125rem' }} />
                  <p style={{ fontSize: '0.925rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontFamily: 'Inter, sans-serif' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact box */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>Ainda tem dúvidas?</p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '1.75rem', color: 'rgba(255,255,255,0.88)', fontSize: '1.2rem' }}>Nossa equipe está pronta para ajudar.</p>
          <a
            href="mailto:suporte@kdlstore.com.br"
            id="faq-contact-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #6C47FF, #00C6A2)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.95rem', padding: '0.875rem 2rem', borderRadius: 999, textDecoration: 'none', boxShadow: '0 0 30px rgba(108,71,255,0.3)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            suporte@kdlstore.com.br
          </a>
        </div>
      </div>
    </section>
  );
}
