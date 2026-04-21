'use client';

import { ScrollReveal, StaggerReveal, StaggerItem, ParallaxElement } from './ParallaxKit';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '49,90', subtitle: 'Para quem está começando', popular: false,
    color: '#6C47FF',
    features: ['1 usuário', 'Até 300 produtos', 'PDV completo', 'Documento de venda (PDF)', 'Garantia digital (PDF)', 'Suporte por email'],
    missing: ['Fornecedores', 'Contas a pagar/receber', 'DRE Simplificado'],
  },
  {
    id: 'pro', name: 'Pro', price: '69,90', subtitle: 'Para lojas em crescimento', popular: true,
    color: '#6C47FF',
    features: ['Até 3 usuários', 'Até 1.000 produtos', 'PDV completo', 'Descontos e brindes', 'Cadastro de clientes', 'Documento de venda e Garantia', 'Ordens de Serviço', 'Contas a pagar/receber', 'Fluxo de caixa e Parcelamento', 'Suporte prioritário'],
    missing: ['Relatórios avançados', 'DRE Simplificado'],
  },
  {
    id: 'premium', name: 'Premium', price: '99,90', subtitle: 'Para operações completas', popular: false,
    color: '#00C6A2',
    features: ['Usuários ilimitados', 'Produtos ilimitados', 'PDV completo', 'Estoque avançado', 'Contas a pagar/receber', 'Ordens de Serviço', 'DRE Simplificado', 'Relatórios avançados', 'Suporte premium VIP'],
    missing: [],
  },
];

export default function PricingSection() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  return (
    <section id="planos" style={{ background: '#0A0A0F', padding: '8rem 0', position: 'relative', overflow: 'hidden' }}>
      <ParallaxElement speed={0.3} style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <div style={{ width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(108,71,255,0.08) 0%, transparent 65%)' }} />
      </ParallaxElement>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        {/* Header Clean */}
        <ScrollReveal direction="up" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '0.4rem 1.25rem', marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Planos e preços</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.95)', marginBottom: '1.5rem' }}>
            <span style={{ 
              fontFamily: 'Inter, serif', 
              fontStyle: 'italic', 
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              marginRight: '8px'
            }}>Simples e</span>
            <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>transparente.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>Planos mensais, sem fidelidade e sem letras miúdas. Cancele quando quiser.</p>
        </ScrollReveal>

        {/* Cards - Clean Asymmetric Layout */}
        <StaggerReveal style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', alignItems: 'center' }}>
          {PLANS.map((plan) => (
            <StaggerItem key={plan.id} direction="up" style={{ flex: plan.popular ? '1 1 380px' : '1 1 320px', maxWidth: plan.popular ? 420 : 360 }}>
            <div
              style={{
                background: plan.popular ? '#FFFFFF' : 'rgba(255,255,255,0.02)',
                border: plan.popular ? 'none' : `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 32, 
                padding: plan.popular ? '3.5rem 2.5rem' : '2.5rem',
                position: 'relative', overflow: 'hidden',
                boxShadow: plan.popular ? '0 20px 80px rgba(108,71,255,0.15)' : 'none',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', color: 'white', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, padding: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Mais Escolhido
                </div>
              )}

              {/* Plan name + price */}
              <div style={{ marginBottom: '2.5rem', marginTop: plan.popular ? '1rem' : '0' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: plan.popular ? '#6C47FF' : 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', color: plan.popular ? '#0A0A0F' : 'rgba(255,255,255,0.8)', fontWeight: 600, marginTop: '0.4rem' }}>R$</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: plan.popular ? '#0A0A0F' : 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em' }}>{plan.price.split(',')[0]}</span>
                  <span style={{ fontSize: '1.25rem', color: plan.popular ? '#0A0A0F' : 'rgba(255,255,255,0.95)', fontWeight: 800, marginTop: '0.2rem' }}>,{plan.price.split(',')[1]}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: plan.popular ? '#666' : 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>{plan.subtitle}</p>
              </div>

              {/* CTA */}
              <a href={`${storeUrl}/cadastro?plano=${plan.id}`} id={`btn-plan-${plan.id}`} style={{ 
                display: 'block', textAlign: 'center', padding: '1rem', borderRadius: 100, 
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', marginBottom: '2.5rem', 
                transition: 'all 0.3s ease', 
                background: plan.popular ? '#0A0A0F' : 'rgba(255,255,255,0.05)', 
                color: plan.popular ? 'white' : 'rgba(255,255,255,0.9)', 
                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)'
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                if(plan.popular) { el.style.background = '#6C47FF'; el.style.boxShadow = '0 10px 30px rgba(108,71,255,0.3)'; }
                else { el.style.background = 'rgba(255,255,255,0.9)'; el.style.color = '#0A0A0F'; }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                if(plan.popular) { el.style.background = '#0A0A0F'; el.style.boxShadow = 'none'; }
                else { el.style.background = 'rgba(255,255,255,0.05)'; el.style.color = 'rgba(255,255,255,0.9)'; }
              }}>
                Começar com {plan.name}
              </a>

              {/* Features Clean */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: plan.popular ? '#E8FBF5' : 'rgba(0,198,162,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? '#00C6A2' : '#00C6A2'} strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: plan.popular ? '#333' : 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: plan.popular ? 0.4 : 0.3 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: plan.popular ? '#f0f0f0' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? '#999' : 'rgba(255,255,255,0.6)'} strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: plan.popular ? '#666' : 'rgba(255,255,255,0.5)', textDecoration: 'line-through', fontFamily: 'Inter, sans-serif' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* Trust badges */}
        <ScrollReveal direction="up" delay={0.2}>
        <div style={{ marginTop: '4rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {['💳 Cartão de crédito sem juros', '🔒 Pagamento 100% seguro', '❌ Cancele quando quiser'].map(n => (
            <span key={n} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{n}</span>
          ))}
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
