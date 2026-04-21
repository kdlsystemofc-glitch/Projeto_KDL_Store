'use client';

import { ScrollReveal, ParallaxElement } from './ParallaxKit';

export default function Footer() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  return (
    <footer style={{ background: '#07060F', color: 'rgba(255,255,255,0.85)', padding: '5rem 0 2.5rem', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Brilho decorativo */}
      <ParallaxElement speed={0.3} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <div style={{ width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(108,71,255,0.14) 0%, transparent 70%)' }} />
      </ParallaxElement>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>

        {/* CTA final */}
        <ScrollReveal direction="up">
        <div style={{ textAlign: 'center', marginBottom: '5rem', padding: '3.5rem 2rem', background: 'linear-gradient(135deg, rgba(108,71,255,0.12), rgba(0,198,162,0.08))', border: '1px solid rgba(108,71,255,0.2)', borderRadius: 28 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6C47FF', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>
            ✦ Comece hoje
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, lineHeight: 1.15, color: 'rgba(255,255,255,0.93)', marginBottom: '1rem' }}>
            Sua loja organizada,<br />
            <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>do jeito que merece.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', maxWidth: 420, margin: '0 auto 2rem', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
            Junte-se a mais de 500 lojistas que já pararam de improvisar.
          </p>
          <a
            href="#planos"
            id="footer-cta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'white', color: '#0A0A0F', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1rem', padding: '0.95rem 2.5rem', borderRadius: 999, textDecoration: 'none', boxShadow: '0 0 50px rgba(108,71,255,0.3)', transition: 'transform 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
          >
            Começar agora
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </a>
        </div>
        </ScrollReveal>

        {/* Links */}
        <StaggerReveal staggerDelay={0.15} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }} className="footer-grid">
          {/* Brand */}
          <StaggerItem direction="up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #6C47FF, #00C6A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'Outfit, sans-serif' }}>K</div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>
                KDL <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Store</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.75, maxWidth: 280, fontFamily: 'Inter, sans-serif' }}>
              Sistema de gestão completo para o pequeno comércio brasileiro. Do estoque ao financeiro, tudo em um só lugar.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
              {[
                { id: 'footer-instagram', href: 'https://instagram.com/kdlstore', label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { id: 'footer-whatsapp', href: 'https://wa.me/5511999999999', label: 'WhatsApp', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
              ].map(s => (
                <a key={s.id} id={s.id} href={s.href} aria-label={s.label} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(108,71,255,0.2)'; el.style.borderColor = 'rgba(108,71,255,0.4)'; el.style.color = 'rgba(255,255,255,0.8)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = 'rgba(255,255,255,0.35)'; }}
                >
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </StaggerItem>

          {/* Produto */}
          <StaggerItem direction="up" delay={0.1}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Produto</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[['Funcionalidades', '#funcionalidades'], ['Planos', '#planos'], ['Para quem é?', '#paraquem'], ['FAQ', '#faq']].map(([label, href]) => (
                <li key={label}>
                  <a href={href} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)'; }}
                  >{label}</a>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Legal */}
          <StaggerItem direction="up" delay={0.2}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {['Termos de Uso', 'Política de Privacidade', 'Cookies'].map(item => (
                <li key={item}>
                  <a href="#" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)'; }}
                  >{item}</a>
                </li>
              ))}
            </ul>
            <a href={`${storeUrl}/login`} style={{ fontSize: '0.875rem', color: '#8B6FFF', textDecoration: 'none', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Entrar na minha conta →</a>
          </StaggerItem>
        </StaggerReveal>

        {/* Bottom bar */}
        <ScrollReveal direction="up" delay={0.3}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.18)', fontFamily: 'Inter, sans-serif' }}>© 2025 KDL Store. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C6A2', boxShadow: '0 0 8px #00C6A2' }} />
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.18)', fontFamily: 'Inter, sans-serif' }}>Sistema operacional</p>
          </div>
        </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
