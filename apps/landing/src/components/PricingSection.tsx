'use client';

import { ScrollReveal, StaggerReveal, StaggerItem } from './ParallaxKit';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '49', cents: '90', subtitle: 'Para quem está começando', popular: false,
    features: ['1 usuário', 'Até 300 produtos', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Relatórios básicos', 'Suporte por email'],
    missing: ['Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa'],
  },
  {
    id: 'pro', name: 'Pro', price: '69', cents: '90', subtitle: 'Para lojas em crescimento', popular: true,
    features: ['Até 3 usuários', 'Até 1.000 produtos', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Suporte prioritário'],
    missing: ['Múltiplos vendedores', 'Relatórios avançados', 'DRE Simplificado'],
  },
  {
    id: 'premium', name: 'Premium', price: '99', cents: '90', subtitle: 'Para operações completas', popular: false,
    features: ['Usuários ilimitados', 'Produtos ilimitados', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Múltiplos vendedores + comissão', 'Relatórios avançados', 'DRE Simplificado', 'Suporte premium VIP'],
    missing: [],
  },
];

export default function PricingSection() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  return (
    <section id="planos" style={{ background: '#F7F6F2', padding: '7rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <ScrollReveal direction="up">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C3D2E', marginBottom: '1rem' }}>
              Planos e preços
            </p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#111', marginBottom: '1.5rem' }}>
              Simples e{' '}
              <em style={{ fontStyle: 'italic', color: '#1C3D2E' }}>transparente.</em>
            </h2>
            <p style={{ fontSize: '1rem', color: '#888', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
              Planos mensais, sem fidelidade e sem letras miúdas. Cancele quando quiser.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {PLANS.map((plan) => (
            <StaggerItem key={plan.id} direction="up">
              <div
                style={{
                  background: plan.popular ? '#1C3D2E' : '#fff',
                  border: plan.popular ? 'none' : '1px solid #E0DDD5',
                  borderRadius: 20,
                  padding: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = plan.popular ? '0 20px 60px rgba(28,61,46,0.3)' : '0 10px 40px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    background: '#2A5C42',
                    color: 'rgba(255,255,255,0.8)',
                    textAlign: 'center',
                    fontSize: '0.7rem', fontWeight: 700,
                    padding: '0.5rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    Mais escolhido
                  </div>
                )}

                <div style={{ marginBottom: '2rem', marginTop: plan.popular ? '1.5rem' : 0 }}>
                  <p style={{
                    fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: plan.popular ? 'rgba(255,255,255,0.6)' : '#1C3D2E',
                    marginBottom: '1.25rem',
                    fontFamily: 'Inter, sans-serif',
                  }}>{plan.name}</p>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '1.1rem', fontWeight: 600,
                      color: plan.popular ? 'rgba(255,255,255,0.7)' : '#888',
                      marginTop: '0.5rem',
                      fontFamily: 'Inter, sans-serif',
                    }}>R$</span>
                    <span style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '4.5rem', fontWeight: 700, lineHeight: 1,
                      color: plan.popular ? '#fff' : '#111',
                      letterSpacing: '-0.03em',
                    }}>{plan.price}</span>
                    <span style={{
                      fontSize: '1.5rem', fontWeight: 700,
                      color: plan.popular ? 'rgba(255,255,255,0.7)' : '#888',
                      marginTop: '0.25rem',
                      fontFamily: 'Inter, sans-serif',
                    }}>,{plan.cents}</span>
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: plan.popular ? 'rgba(255,255,255,0.5)' : '#999',
                    fontFamily: 'Inter, sans-serif',
                  }}>{plan.subtitle} · por mês</p>
                </div>

                {/* CTA */}
                <a
                  href={`${storeUrl}/cadastro?plano=${plan.id}`}
                  id={`btn-plan-${plan.id}`}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '0.9rem', borderRadius: 999,
                    fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                    textDecoration: 'none', marginBottom: '2rem',
                    transition: 'all 0.2s ease',
                    background: plan.popular ? '#fff' : '#1C3D2E',
                    color: plan.popular ? '#1C3D2E' : '#fff',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = plan.popular ? '#E8EDE0' : '#2A5C42';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = plan.popular ? '#fff' : '#1C3D2E';
                  }}
                >
                  Começar com {plan.name}
                </a>

                {/* Separador */}
                <div style={{ height: 1, background: plan.popular ? 'rgba(255,255,255,0.1)' : '#E0DDD5', marginBottom: '1.5rem' }} />

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? 'rgba(255,255,255,0.6)' : '#1C3D2E'} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                      <span style={{ fontSize: '0.875rem', color: plan.popular ? 'rgba(255,255,255,0.8)' : '#444', fontFamily: 'Inter, sans-serif' }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.35 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? 'rgba(255,255,255,0.5)' : '#999'} strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      <span style={{ fontSize: '0.875rem', color: plan.popular ? 'rgba(255,255,255,0.5)' : '#aaa', fontFamily: 'Inter, sans-serif', textDecoration: 'line-through' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* Trust badges */}
        <ScrollReveal direction="up" delay={0.2}>
          <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
            {['💳 Cartão de crédito', '🔒 Pagamento seguro', '❌ Cancele quando quiser'].map(n => (
              <span key={n} style={{ fontSize: '0.875rem', color: '#999', fontFamily: 'Inter, sans-serif' }}>{n}</span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
