'use client';

import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { section: 'Visão Geral', items: [{ href: '/dashboard', label: 'Dashboard', icon: '📊' }] },
  { section: 'Negócio', items: [
    { href: '/tenants', label: 'Lojas', icon: '🏪' },
    { href: '/assinaturas', label: 'Assinaturas', icon: '💳' },
    { href: '/planos', label: 'Planos', icon: '📋' },
  ]},
  { section: 'Sistema', items: [
    { href: '/configuracoes', label: 'Configurações', icon: '⚙️' },
  ]},
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div style={{ padding: '1rem 0.875rem', borderBottom: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6C47FF, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 12 }}>K</div>
        <div>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13 }}>KDL <span className="text-gradient">Admin</span></p>
          <p style={{ fontSize: 10, color: 'var(--adm-dim)' }}>Portal Interno</p>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '0.625rem' }}>
        {NAV.map(s => (
          <div key={s.section}>
            <p className="nav-section">{s.section}</p>
            {s.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <a key={item.href} href={item.href} id={`adm-nav-${item.href.slice(1)}`} className={`nav-item ${active ? 'active' : ''}`}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: '0.625rem', borderTop: '1px solid var(--adm-border)' }}>
        <div style={{ padding: '0.5rem 0.875rem', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ fontSize: '0.65rem', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔴 Área Restrita</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--adm-dim)', marginTop: 2 }}>Acesso interno KDL</p>
        </div>
      </div>
    </aside>
  );
}
