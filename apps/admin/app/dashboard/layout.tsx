import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AdminSidebar />
      <div className="main">
        <header className="main-header">
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem' }}>KDL Store Admin</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-danger">🔴 Interno</span>
            <span style={{ padding: '0.3rem 0.625rem', background: 'var(--adm-s2)', border: '1px solid var(--adm-border)', borderRadius: 7, fontSize: '0.75rem', color: 'var(--adm-muted)' }}>admin@kdlstore.com.br</span>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
