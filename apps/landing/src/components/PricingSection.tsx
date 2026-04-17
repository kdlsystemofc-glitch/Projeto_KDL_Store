'use client';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '49,90', subtitle: 'Para quem está começando', color: '#6C47FF', popular: false,
    features: ['1 usuário', 'Até 300 produtos', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Relatórios básicos', 'Suporte por email'],
    missing: ['Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Múltiplos vendedores', 'Relatórios avançados', 'DRE Simplificado'],
  },
  {
    id: 'pro', name: 'Pro', price: '69,90', subtitle: 'Para lojas em crescimento', color: '#6C47FF', popular: true,
    features: ['Até 3 usuários', 'Até 1.000 produtos', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Exportação CSV/PDF', 'Suporte por email'],
    missing: ['Múltiplos vendedores + comissão', 'Relatórios avançados', 'DRE Simplificado'],
  },
  {
    id: 'premium', name: 'Premium', price: '99,90', subtitle: 'Para operações completas', color: '#FF6B47', popular: false,
    features: ['Usuários ilimitados', 'Produtos ilimitados', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Exportação CSV/PDF', 'Múltiplos vendedores + comissão', 'Relatórios avançados', 'DRE Simplificado', 'Suporte prioritário'],
    missing: [],
  },
];

export default function PricingSection() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  return (
    <section id="planos" style={{ padding: '6rem 0', background: 'white', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(108,71,255,0.2), transparent)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>
            <span>💎</span> Planos e preços
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', color: '#16113A' }}>
            Simples, <span className="text-gradient">transparente</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#6B6A8A', maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
            Planos mensais, sem fidelidade e sem letras miúdas. Cancele quando quiser.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{
              background: plan.popular ? 'linear-gradient(145deg, #6C47FF, #4F2FE8)' : 'white',
              border: plan.popular ? 'none' : '1.5px solid rgba(22,17,58,0.08)',
              borderRadius: 22,
              padding: '2.25rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: plan.popular ? '0 20px 60px rgba(108,71,255,0.3)' : '0 2px 16px rgba(22,17,58,0.05)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, right: '1.5rem', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.35rem 0.875rem', borderRadius: '0 0 10px 10px', letterSpacing: '0.08em' }}>
                  ⭐ MAIS POPULAR
                </div>
              )}
              {/* Glow for non-popular */}
              {!plan.popular && <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: plan.color, opacity: 0.06, filter: 'blur(30px)' }} />}

              {/* Plan name */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: plan.popular ? 'rgba(255,255,255,0.5)' : plan.color, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: plan.popular ? 'rgba(255,255,255,0.7)' : plan.color, marginBottom: '0.5rem' }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1rem', color: plan.popular ? 'rgba(255,255,255,0.6)' : '#A8A7C0', marginBottom: 4 }}>R$</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3.25rem', fontWeight: 900, lineHeight: 1, color: plan.popular ? 'white' : '#16113A' }}>{plan.price}</span>
                  <span style={{ color: plan.popular ? 'rgba(255,255,255,0.6)' : '#A8A7C0', marginBottom: 4, fontSize: '0.9rem' }}>/mês</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: plan.popular ? 'rgba(255,255,255,0.6)' : '#A8A7C0' }}>{plan.subtitle}</p>
              </div>

              {/* CTA */}
              <a href={`${storeUrl}/cadastro?plano=${plan.id}`} id={`btn-plan-${plan.id}`} style={{
                display: 'block', textAlign: 'center',
                padding: '0.875rem',
                borderRadius: 12,
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none',
                marginBottom: '1.75rem',
                transition: 'all 0.2s ease',
                background: plan.popular ? 'white' : plan.color,
                color: plan.popular ? '#6C47FF' : 'white',
                boxShadow: plan.popular ? '0 4px 20px rgba(0,0,0,0.1)' : `0 4px 16px ${plan.color}40`,
              }}>
                Assinar {plan.name}
              </a>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: plan.popular ? 'rgba(255,255,255,0.15)' : `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? 'white' : plan.color} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: plan.popular ? 'rgba(255,255,255,0.85)' : '#16113A' }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.3 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(22,17,58,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6B6A8A" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#6B6A8A', textDecoration: 'line-through' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['💳 Cartão de crédito', '🔒 Pagamento seguro', '❌ Cancele quando quiser'].map(n => (
              <span key={n} style={{ fontSize: '0.85rem', color: '#A8A7C0' }}>{n}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
