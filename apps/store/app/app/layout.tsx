import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Busca dados do tenant/loja
  const { data: userData } = user
    ? await supabase.from('users').select('*, tenants(name, plan_id, status)').eq('id', user.id).single()
    : { data: null };

  const storeName = userData?.tenants?.name || 'Minha Loja';
  const userName = userData?.name || user?.email || '';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <header className="main-header">
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>Loja</p>
            <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>{storeName}</p>
          </div>

          {/* Plan status badge */}
          {userData?.tenants?.status === 'suspended' && (
            <a
              href="/configuracoes/assinatura"
              className="badge badge-danger"
              style={{ textDecoration: 'none' }}
            >
              ⚠ Assinatura inativa
            </a>
          )}

          {/* User info */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.375rem 0.75rem',
              background: 'var(--kdl-surface-2)',
              border: '1px solid var(--kdl-border)',
              borderRadius: 8, fontSize: '0.8rem',
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C47FF, #00D4AA)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: 'var(--kdl-text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
