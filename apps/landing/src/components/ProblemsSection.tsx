'use client';

import { ScrollReveal, StaggerReveal, StaggerItem } from './ParallaxKit';

const PROBLEMS = [
  {
    number: '01',
    icon: '📦',
    pain: 'Sem controle de estoque',
    painDetail: 'Você vende o que não tem. Ou deixa de vender o que tem em excesso.',
    fix: 'Estoque em tempo real com alertas automáticos de reposição.',
  },
  {
    number: '02',
    icon: '🧾',
    pain: 'Nota no papel que some',
    painDetail: 'Um pedaço de papel rasgado como comprovante não gera confiança — nem no cliente, nem em você.',
    fix: 'PDV digital com documento de venda em PDF, profissional e rastreável.',
  },
  {
    number: '03',
    icon: '🔖',
    pain: 'Garantia colada no produto',
    painDetail: 'O papelzinho cai, o cliente volta reclamando e você não sabe o que vendeu nem quando.',
    fix: 'Certificado de garantia digital gerado automaticamente por produto vendido.',
  },
  {
    number: '04',
    icon: '📞',
    pain: 'Fornecedor só no telefone',
    painDetail: 'Ligar para cada fornecedor toda vez que precisa de algo é ineficiente e caro.',
    fix: 'Módulo de fornecedores com histórico completo de pedidos e contatos.',
  },
  {
    number: '05',
    icon: '💸',
    pain: 'Desconto sem margem',
    painDetail: 'Você dá desconto de cabeça e não sabe se ainda está lucrando.',
    fix: 'Desconto por item e global no PDV com margem calculada em tempo real.',
  },
  {
    number: '06',
    icon: '🏦',
    pain: 'Financeiro no caderninho',
    painDetail: 'Aluguel, luz, contas a pagar — tudo na memória ou num caderno perdido.',
    fix: 'Financeiro completo: contas a pagar/receber, fluxo de caixa e DRE.',
  },
];

export default function ProblemsSection() {
  return (
    <section id="problemas" style={{ background: '#F7F6F2', padding: '7rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <ScrollReveal direction="up">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', marginBottom: '5rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C3D2E', marginBottom: '1rem' }}>
                A realidade do pequeno comércio
              </p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#111', marginBottom: '1.5rem' }}>
                Sua loja merece mais<br />
                <em style={{ fontStyle: 'italic', color: '#1C3D2E' }}>do que improviso.</em>
              </h2>
              <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', maxWidth: 420 }}>
                Criamos o KDL Store depois de ver de perto como pequenas lojas ainda sobrevivem no limite — com anotações de papel e sistemas complexos. Não precisa ser assim.
              </p>
            </div>
            
            {/* Imagem real com cantos arredondados */}
            <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
              <div style={{ paddingBottom: '60%' }} /> {/* Aspect Ratio 5:3 */}
              <img 
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop" 
                alt="Anotações e planilhas" 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Grid de problemas */}
        <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1px', background: '#E0DDD5' }}>
          {PROBLEMS.map((p, i) => (
            <StaggerItem key={p.number} direction="up">
              <div
                style={{
                  background: '#F7F6F2',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  transition: 'background 0.3s ease',
                  cursor: 'default',
                  minHeight: 280,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#EDEAE0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#F7F6F2'; }}
              >
                {/* número + badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#999', fontWeight: 400 }}>{p.number}</span>
                  <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
                </div>

                {/* Problema */}
                <div>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.35rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                    {p.pain}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#888', lineHeight: 1.65, fontFamily: 'Inter, sans-serif' }}>
                    {p.painDetail}
                  </p>
                </div>

                {/* Separador */}
                <div style={{ height: 1, background: '#E0DDD5', margin: '0.25rem 0' }} />

                {/* Solução */}
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1C3D2E', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                    Com KDL Store
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {p.fix}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* CTA */}
        <ScrollReveal direction="up" delay={0.1}>
          <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <a
              href="#funcionalidades"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#1C3D2E', color: 'white',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                padding: '0.9rem 2.5rem', borderRadius: 999,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2A5C42'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1C3D2E'; }}
            >
              Ver como resolver
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
