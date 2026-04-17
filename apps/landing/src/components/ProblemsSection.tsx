const PROBLEMS = [
  {
    icon: '📄',
    title: 'Sem controle de estoque',
    description: 'Sem saber o que tem na prateleira, vender o que não existe vira rotina.',
    solution: 'Estoque em tempo real com alertas automáticos de reposição.',
  },
  {
    icon: '🧾',
    title: 'Nota no papel',
    description: 'Um pedaço de papel rasgado como comprovante não gera confiança.',
    solution: 'PDV digital com documento de venda em PDF, profissional e rastreável.',
  },
  {
    icon: '🔧',
    title: 'Garantia colada no produto',
    description: 'Papelzinho colado no produto cai, rasga e o cliente fica sem cobertura.',
    solution: 'Certificado de garantia digital gerado automaticamente por produto vendido.',
  },
  {
    icon: '📞',
    title: 'Fornecedor no telefone',
    description: 'Ligar para fornecedor a cada pedido é ineficiente e confuso sem histórico.',
    solution: 'Módulo de fornecedores com registro de pedidos e histórico completo.',
  },
  {
    icon: '💰',
    title: 'Sem negociação registrada',
    description: 'Desconto dado de cabeça, sem rastro. Fica difícil saber a margem real.',
    solution: 'Desconto por item e global no PDV, tudo registrado com margem calculada.',
  },
  {
    icon: '💸',
    title: 'Sem controle financeiro',
    description: 'Aluguel, luz, contas a pagar — tudo na cabeça ou em caderninho perdido.',
    solution: 'Financeiro completo: contas a pagar/receber, fluxo de caixa e DRE.',
  },
];

export default function ProblemsSection() {
  return (
    <section id="problemas" style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: 120, background: 'linear-gradient(to bottom, transparent, rgba(108,71,255,0.5), transparent)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div className="section-label" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span>🎯</span> Problemas reais, respostas reais
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '1.25rem', color: '#F4F4FF' }}>
            Reconhece algum desses{' '}
            <span className="text-gradient">problemas?</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(244,244,255,0.5)', maxWidth: 560, margin: '0 auto' }}>
            Criamos o KDL Store depois de ver de perto como pequenas lojas ainda funcionam na base do improviso.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {PROBLEMS.map((p, i) => (
            <div
              key={i}
              className="card-hover"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '1.75rem',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(108,71,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: '1.25rem' }}>
                {p.icon}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,100,100,0.7)', display: 'block', marginBottom: '0.4rem' }}>Antes</span>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#F4F4FF' }}>{p.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(244,244,255,0.4)', lineHeight: 1.65, marginBottom: '1.25rem' }}>{p.description}</p>
              <div style={{ height: 1, background: 'linear-gradient(to right, rgba(108,71,255,0.3), rgba(0,212,170,0.3))', marginBottom: '1.25rem' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00D4AA', display: 'block', marginBottom: '0.4rem' }}>Com KDL Store</span>
              <p style={{ fontSize: '0.875rem', color: 'rgba(244,244,255,0.65)', lineHeight: 1.65 }}>{p.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
