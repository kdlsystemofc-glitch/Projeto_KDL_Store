'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Preciso instalar algum programa?',
    a: 'Não. O KDL Store é 100% web. Acesse pelo navegador de qualquer computador, tablet ou celular. Sem instalação, sem configuração.',
  },
  {
    q: 'Tem período de teste gratuito?',
    a: 'Não oferecemos teste grátis. Cobramos porque entregamos valor real desde o primeiro dia. Mas se você não gostar, pode cancelar a qualquer momento sem multa.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Cobramos mensalmente no cartão de crédito. A cobrança é feita automaticamente todo mês. Você pode cancelar quando quiser, sem burocracia.',
  },
  {
    q: 'Posso mudar de plano depois?',
    a: 'Sim! Você pode fazer upgrade ou downgrade do plano a qualquer momento. O ajuste é feito proporcionalmente ao período restante.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim. Todos os dados são criptografados e armazenados em servidores seguros. Backups automáticos diários garantem que você nunca perca informações.',
  },
  {
    q: 'O sistema emite Nota Fiscal?',
    a: 'O KDL Store emite documentos internos de venda em PDF — comprovantes profissionais para o cliente. Para NF-e oficial, você precisará de um módulo fiscal específico (não incluído).',
  },
  {
    q: 'Quantos usuários posso ter?',
    a: 'Depende do plano: Starter (1 usuário), Pro (até 3 usuários), Premium (ilimitado). Usuários têm níveis de acesso: dono, gerente, vendedor e técnico.',
  },
  {
    q: 'Funciona para qualquer tipo de loja?',
    a: 'Sim! KDL Store foi pensado para qualquer tipo de pequeno comércio: som automotivo, roupas, eletrônicos, utilidades, beleza, pet shop e muito mais.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-label justify-center mx-auto w-fit">
            <span>❓</span> Perguntas frequentes
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Tire suas{' '}
            <span className="text-gradient">dúvidas</span>
          </h2>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="glass rounded-xl overflow-hidden transition-all duration-300"
              style={
                open === i
                  ? { borderColor: 'rgba(108,71,255,0.4)' }
                  : undefined
              }
            >
              <button
                id={`faq-btn-${i}`}
                className="w-full flex items-center justify-between p-6 text-left group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className="text-base font-semibold text-white/80 group-hover:text-white transition-colors"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {faq.q}
                </span>
                <span
                  className="text-white/40 ml-4 flex-shrink-0 transition-transform duration-300"
                  style={{
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                    color: open === i ? '#6C47FF' : undefined,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <div
                    className="h-px w-full mb-4"
                    style={{ background: 'rgba(108,71,255,0.2)' }}
                  />
                  <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div
          className="mt-12 glass rounded-2xl p-8 text-center"
          style={{ borderColor: 'rgba(108,71,255,0.2)' }}
        >
          <p className="text-white/60 mb-2">Ainda tem dúvidas?</p>
          <p className="font-semibold mb-6">Fale com a nossa equipe</p>
          <a
            href="mailto:suporte@kdlstore.com.br"
            id="faq-contact-btn"
            className="btn-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            suporte@kdlstore.com.br
          </a>
        </div>
      </div>
    </section>
  );
}
