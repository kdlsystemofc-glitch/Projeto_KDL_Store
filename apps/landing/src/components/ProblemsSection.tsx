'use client';

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
    description: 'Um pedaço de papel rasgado como comprovante de venda não gera confiança.',
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
    <section id="problemas" className="py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(108,71,255,0.5), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="section-label justify-center mx-auto w-fit">
            <span>🎯</span> Problemas reais, respostas reais
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Reconhece algum desses{' '}
            <span className="text-gradient">problemas?</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Criamos o KDL Store depois de ver de perto como pequenas lojas ainda funcionam
            na base do improviso. Cada funcionalidade resolve um problema real.
          </p>
        </div>

        {/* Problems grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROBLEMS.map((problem, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 card-hover group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110"
                style={{ background: 'rgba(108,71,255,0.12)' }}
              >
                {problem.icon}
              </div>

              {/* Before */}
              <div className="mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-wider mb-2 block"
                  style={{ color: 'rgba(255,100,100,0.7)' }}
                >
                  Antes
                </span>
                <h3
                  className="text-base font-bold mb-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {problem.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              {/* Divider */}
              <div
                className="h-px w-full my-4"
                style={{ background: 'linear-gradient(to right, rgba(108,71,255,0.3), rgba(0,212,170,0.3))' }}
              />

              {/* After */}
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-wider mb-2 block"
                  style={{ color: '#00D4AA' }}
                >
                  Com KDL Store
                </span>
                <p className="text-sm text-white/70 leading-relaxed">
                  {problem.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
