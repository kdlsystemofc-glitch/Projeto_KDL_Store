'use client';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '49,90',
    subtitle: 'Para quem está começando',
    color: '#6C47FF',
    popular: false,
    features: [
      { label: '1 usuário', available: true },
      { label: 'Até 300 produtos', available: true },
      { label: 'PDV completo', available: true },
      { label: 'Descontos e brindes', available: true },
      { label: 'Controle de estoque', available: true },
      { label: 'Cadastro de clientes', available: true },
      { label: 'Documento de venda (PDF)', available: true },
      { label: 'Garantia digital (PDF)', available: true },
      { label: 'Relatórios básicos', available: true },
      { label: 'Fornecedores e pedidos', available: false },
      { label: 'Ordens de Serviço', available: false },
      { label: 'Contas a pagar/receber', available: false },
      { label: 'Fluxo de caixa', available: false },
      { label: 'Parcelamento', available: false },
      { label: 'Exportação CSV/PDF', available: false },
      { label: 'Múltiplos vendedores', available: false },
      { label: 'Relatórios avançados', available: false },
      { label: 'DRE Simplificado', available: false },
      { label: 'Suporte por email', available: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '69,90',
    subtitle: 'Para lojas em crescimento',
    color: '#00D4AA',
    popular: true,
    features: [
      { label: 'Até 3 usuários', available: true },
      { label: 'Até 1.000 produtos', available: true },
      { label: 'PDV completo', available: true },
      { label: 'Descontos e brindes', available: true },
      { label: 'Controle de estoque', available: true },
      { label: 'Cadastro de clientes', available: true },
      { label: 'Documento de venda (PDF)', available: true },
      { label: 'Garantia digital (PDF)', available: true },
      { label: 'Relatórios básicos', available: true },
      { label: 'Fornecedores e pedidos', available: true },
      { label: 'Ordens de Serviço', available: true },
      { label: 'Contas a pagar/receber', available: true },
      { label: 'Fluxo de caixa', available: true },
      { label: 'Parcelamento', available: true },
      { label: 'Exportação CSV/PDF', available: true },
      { label: 'Múltiplos vendedores', available: false },
      { label: 'Relatórios avançados', available: false },
      { label: 'DRE Simplificado', available: false },
      { label: 'Suporte por email', available: true },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '99,90',
    subtitle: 'Para operações completas',
    color: '#FF6B47',
    popular: false,
    features: [
      { label: 'Usuários ilimitados', available: true },
      { label: 'Produtos ilimitados', available: true },
      { label: 'PDV completo', available: true },
      { label: 'Descontos e brindes', available: true },
      { label: 'Controle de estoque', available: true },
      { label: 'Cadastro de clientes', available: true },
      { label: 'Documento de venda (PDF)', available: true },
      { label: 'Garantia digital (PDF)', available: true },
      { label: 'Relatórios básicos', available: true },
      { label: 'Fornecedores e pedidos', available: true },
      { label: 'Ordens de Serviço', available: true },
      { label: 'Contas a pagar/receber', available: true },
      { label: 'Fluxo de caixa', available: true },
      { label: 'Parcelamento', available: true },
      { label: 'Exportação CSV/PDF', available: true },
      { label: 'Múltiplos vendedores + comissão', available: true },
      { label: 'Relatórios avançados', available: true },
      { label: 'DRE Simplificado', available: true },
      { label: 'Suporte prioritário', available: true },
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="planos" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(108,71,255,0.5) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="section-label justify-center mx-auto w-fit">
            <span>💎</span> Planos e preços
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Simples,{' '}
            <span className="text-gradient">transparente</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Planos mensais, sem fidelidade e sem letras miúdas. Cancele quando quiser.
            Sem teste grátis — cobramos porque entregamos valor desde o primeiro dia.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? 'border-2'
                  : 'glass'
              }`}
              style={
                plan.popular
                  ? {
                      background: 'rgba(0,212,170,0.06)',
                      borderColor: plan.color,
                      boxShadow: `0 30px 80px ${plan.color}25`,
                    }
                  : undefined
              }
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute top-0 right-6 px-4 py-1.5 rounded-b-xl text-xs font-bold text-white"
                  style={{ background: plan.color }}
                >
                  ⭐ MAIS POPULAR
                </div>
              )}

              {/* Glow */}
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                style={{ background: plan.color, filter: 'blur(40px)' }}
              />

              {/* Plan header */}
              <div className="mb-8">
                <div
                  className="w-10 h-1.5 rounded-full mb-4"
                  style={{ background: plan.color }}
                />
                <div
                  className="text-sm font-bold mb-1 uppercase tracking-wider"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-white/40 text-lg">R$</span>
                  <span
                    className="text-5xl font-black"
                    style={{ fontFamily: 'Outfit, sans-serif', color: plan.popular ? plan.color : '#F4F4FF' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-white/40 mb-1">/mês</span>
                </div>
                <p className="text-sm text-white/40">{plan.subtitle}</p>
              </div>

              <a
                href={`${process.env.NEXT_PUBLIC_STORE_URL || ''}/cadastro?plano=${plan.id}`}
                id={`btn-plan-${plan.id}`}
                className="block text-center py-3.5 rounded-xl font-bold text-sm mb-8 transition-all duration-300 hover:opacity-90 hover:scale-105"
                style={
                  plan.popular
                    ? { background: plan.color, color: 'white' }
                    : {
                        background: `${plan.color}15`,
                        color: plan.color,
                        border: `1px solid ${plan.color}40`,
                      }
                }
              >
                Assinar {plan.name}
              </a>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.filter(f => f.available).map((feature, fi) => (
                  <div key={fi} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                      style={{ background: `${plan.color}20`, color: plan.color }}
                    >
                      ✓
                    </div>
                    <span className="text-sm text-white/70">{feature.label}</span>
                  </div>
                ))}
                {plan.features.filter(f => !f.available).map((feature, fi) => (
                  <div key={fi} className="flex items-center gap-3 opacity-30">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs bg-white/10 text-white/30">
                      ✗
                    </div>
                    <span className="text-sm text-white/40 line-through">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-sm text-white/35">
            <span>💳 Pagamento via cartão de crédito</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>🔒 Ambiente seguro</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>❌ Cancele quando quiser</span>
          </div>
        </div>
      </div>
    </section>
  );
}
