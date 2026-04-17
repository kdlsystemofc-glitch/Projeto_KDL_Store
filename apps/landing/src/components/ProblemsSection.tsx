'use client';

const PROBLEMS = [
  { icon: '📄', title: 'Sem controle de estoque', description: 'Sem saber o que tem na prateleira, vender o que não existe vira rotina.', solution: 'Estoque em tempo real com alertas automáticos de reposição.' },
  { icon: '🧾', title: 'Nota no papel', description: 'Um pedaço de papel rasgado como comprovante não gera confiança.', solution: 'PDV digital com documento de venda em PDF, profissional e rastreável.' },
  { icon: '🔧', title: 'Garantia colada no produto', description: 'Papelzinho colado no produto cai, rasga e o cliente fica sem cobertura.', solution: 'Certificado de garantia digital gerado automaticamente por produto vendido.' },
  { icon: '📞', title: 'Fornecedor no telefone', description: 'Ligar para fornecedor a cada pedido é ineficiente e confuso.', solution: 'Módulo de fornecedores com registro de pedidos e histórico completo.' },
  { icon: '💰', title: 'Desconto sem registro', description: 'Desconto dado de cabeça, sem rastro. Fica difícil saber a margem real.', solution: 'Desconto por item e global no PDV, tudo registrado com margem calculada.' },
  { icon: '💸', title: 'Sem controle financeiro', description: 'Aluguel, luz, contas a pagar — tudo na cabeça ou em caderninho perdido.', solution: 'Financeiro completo: contas a pagar/receber, fluxo de caixa e DRE.' },
];

export default function ProblemsSection() {
  return (
    <section id="problemas" style={{ padding: '6rem 0', background: 'white', position: 'relative' }}>
      {/* Divider top */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: 80, background: 'linear-gradient(to bottom, transparent, rgba(108,71,255,0.3))' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>
            <span>🎯</span> Problemas reais, respostas reais
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', color: '#16113A' }}>
            Reconhece algum desses{' '}
            <span className="text-gradient">problemas?</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#6B6A8A', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            Criamos o KDL Store depois de ver de perto como pequenas lojas ainda funcionam na base do improviso.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} className="kdl-card" style={{ padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(108,71,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: '1.25rem' }}>
                {p.icon}
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E05252', display: 'block', marginBottom: '0.35rem' }}>Antes</span>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#16113A', marginBottom: '0.5rem' }}>{p.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B6A8A', lineHeight: 1.6, marginBottom: '1.25rem' }}>{p.description}</p>
              <div style={{ height: 1, background: 'linear-gradient(to right, rgba(108,71,255,0.2), rgba(0,198,162,0.2))', marginBottom: '1.25rem' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00C6A2', display: 'block', marginBottom: '0.35rem' }}>Com KDL Store</span>
              <p style={{ fontSize: '0.875rem', color: '#16113A', lineHeight: 1.6, fontWeight: 500 }}>{p.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
