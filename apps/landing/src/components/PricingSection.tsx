'use client';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '49,90', subtitle: 'Para quem está começando', popular: false,
    color: '#6C47FF',
    features: ['1 usuário', 'Até 300 produtos', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Relatórios básicos', 'Suporte por email'],
    missing: ['Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Múltiplos vendedores', 'Relatórios avançados', 'DRE Simplificado'],
  },
  {
    id: 'pro', name: 'Pro', price: '69,90', subtitle: 'Para lojas em crescimento', popular: true,
    color: '#6C47FF',
    features: ['Até 3 usuários', 'Até 1.000 produtos', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Exportação CSV/PDF', 'Suporte por email'],
    missing: ['Múltiplos vendedores + comissão', 'Relatórios avançados', 'DRE Simplificado'],
  },
  {
    id: 'premium', name: 'Premium', price: '99,90', subtitle: 'Para operações completas', popular: false,
    color: '#00C6A2',
    features: ['Usuários ilimitados', 'Produtos ilimitados', 'PDV completo', 'Descontos e brindes', 'Controle de estoque', 'Cadastro de clientes', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Fornecedores e pedidos', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa', 'Parcelamento', 'Exportação CSV/PDF', 'Múltiplos vendedores + comissão', 'Relatórios avançados', 'DRE Simplificado', 'Suporte prioritário'],
    missing: [],
  },
];

export default function PricingSection() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  return (
    <section id="planos" style={{ background: '#0A0A0F', padding: '7rem 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(108,71,255,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C47FF', display: 'inline-block', boxShadow: '0 0 8px #6C47FF' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6C47FF' }}>Planos e preços</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.93)', marginBottom: '1.25rem' }}>
            Simples,{' '}
            <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>transparente.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', maxWidth: 460, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>Planos mensais, sem fidelidade e sem letras miúdas. Cancele quando quiser.</p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.popular
                  ? 'linear-gradient(145deg, #6C47FF 0%, #4F2FE8 100%)'
                  : 'rgba(255,255,255,0.03)',
                border: plan.popular ? 'none' : `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 24, padding: '2.25rem',
                position: 'relative', overflow: 'hidden',
                boxShadow: plan.popular ? '0 0 60px rgba(108,71,255,0.4)' : 'none',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, right: '1.5rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '0.35rem 0.875rem', borderRadius: '0 0 12px 12px', letterSpacing: '0.1em' }}>
                  ⭐ MAIS POPULAR
                </div>
              )}
              {!plan.popular && <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: plan.color, opacity: 0.07, filter: 'blur(40px)', pointerEvents: 'none' }} />}

              {/* Plan name + price */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: plan.popular ? 'rgba(255,255,255,0.5)' : plan.color, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: plan.popular ? 'rgba(255,255,255,0.65)' : plan.color, marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1rem', color: plan.popular ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)', marginBottom: 6 }}>R$</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, color: plan.popular ? 'white' : 'rgba(255,255,255,0.9)' }}>{plan.price}</span>
                  <span style={{ color: plan.popular ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)', marginBottom: 6, fontSize: '0.9rem' }}>/mês</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: plan.popular ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>{plan.subtitle}</p>
              </div>

              {/* CTA */}
              <a href={`${storeUrl}/cadastro?plano=${plan.id}`} id={`btn-plan-${plan.id}`} style={{ display: 'block', textAlign: 'center', padding: '0.9rem', borderRadius: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', marginBottom: '2rem', transition: 'all 0.2s ease', background: plan.popular ? 'white' : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: plan.popular ? '#6C47FF' : 'white', boxShadow: plan.popular ? '0 4px 20px rgba(0,0,0,0.2)' : `0 4px 20px ${plan.color}40` }}>
                Assinar {plan.name}
              </a>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: plan.popular ? 'rgba(255,255,255,0.15)' : `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? 'white' : plan.color} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: plan.popular ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.25 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontFamily: 'Inter, sans-serif' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: '3.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {['💳 Cartão de crédito', '🔒 Pagamento seguro', '❌ Cancele quando quiser'].map(n => (
            <span key={n} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
