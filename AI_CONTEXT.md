# KDL Store — AI Context

Guia essencial para agentes de IA ou desenvolvedores que continuarão o projeto.

## 1. Visão Geral

KDL Store é um ERP/PDV SaaS multi-tenant para o pequeno comércio brasileiro.
Monorepo Turborepo + pnpm com três apps Next.js 16:

| App | Porta | URL Vercel |
|---|---|---|
| `apps/landing` | 3000 | `projeto-kdl-store-landing.vercel.app` |
| `apps/store` | 3001 | `projeto-kdl-store-store.vercel.app` |
| `apps/admin` | 3002 | `projeto-kdl-store-admin.vercel.app` |

Documentação completa: `docs/SYSTEM_MAP.md`
Schema do banco: `docs/schema.sql` + migrations `docs/migration_v1.1.sql`, `v1.2.sql`, `v1.3.sql`

## 2. Stack (crítico)

- **Next.js 16 App Router** — não Tailwind, **CSS vanilla** com `globals.css` e tokens `--kdl-*`
- **TypeScript** — tipagem explícita em todos os estados e tipos de DB
- **Supabase** via `@supabase/supabase-js` (client-side em páginas interativas)
- **Sem bibliotecas de componentes** — botões usam classes `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-sm`
- Ícones de ação sempre com `title="..."` para acessibilidade
- Tabelas sempre em `<div className="table-wrapper">`

## 3. Multi-Tenancy e RLS

- Toda tabela de negócio tem `tenant_id uuid` com RLS: `using (tenant_id = auth_tenant_id())`
- `auth_tenant_id()` é uma SQL function que retorna o `tenant_id` do usuário logado
- Pages consomem `tenantId` e `userId` via `const { tenantId, userId, storeName } = useTenant()` (TenantContext)
- O `layout.tsx` em `app/app/` é Server Component — busca `tenantId` uma única vez e injeta via `TenantProvider`

## 4. Padrão Auto-Heal (obrigatório em todos os saves)

Supabase tem "Schema Cache Delay": colunas novas podem retornar erro 400 por alguns minutos.
**Toda função de save deve usar este padrão:**

```ts
const removedCols = new Set<string>();
let success = false, attempts = 0;
while (!success && attempts < 10) {
  attempts++;
  const payload: any = { ...basePayload };
  removedCols.forEach(c => delete payload[c]);
  const { error } = await supabase.from('tabela').insert(payload);
  if (error) {
    const col = error.message.match(/column "([^"]+)"/)?.[1]
              ?? error.message.match(/'([^']+)' column/)?.[1];
    if (col) { removedCols.add(col); continue; }
    throw error;
  }
  success = true;
}
```

## 5. Módulos implementados (Fase 8)

| Módulo | Arquivo | Features chave |
|---|---|---|
| PDV | `app/pdv/page.tsx` | variações, desconto progressivo, fidelidade, histórico, OS link |
| Estoque | `app/estoque/page.tsx` | CRUD + grade de variações inline |
| Clientes | `app/clientes/page.tsx` | CRUD + histórico + loyalty_points |
| Fornecedores | `app/fornecedores/page.tsx` | CRUD + pedidos multi-item + WhatsApp |
| OS | `app/os/page.tsx` | pipeline 6 status + pre-fill via query params |
| Garantias | `app/garantias/page.tsx` | código único + acionar → cria OS |
| Financeiro | `app/financeiro/page.tsx` | caixa + a pagar + a receber |
| Relatórios | `app/relatorios/page.tsx` | KPIs + DRE |
| Agenda | `app/agenda/page.tsx` | pets + agendamentos com pipeline de status |
| Configurações | `app/configuracoes/page.tsx` | loja + usuários + descontos + assinatura |
| Catálogo público | `app/catalogo/[slug]/page.tsx` | Server Component + service-role |

## 6. Regras de negócio importantes

### PDV — Variações (grade)
- `variantsMap: Record<product_id, Variant[]>` carregado no `useEffect`
- Se produto tem variantes, `handleProductSelect` abre picker modal → `addToCart(product, false, variant)`
- Chave do carrinho: `product.id::variant.id`
- Estoque via RPC `decrement_variant_stock(variant_id, qty)`

### PDV — Desconto progressivo
- `discount_rules` carregado no `useEffect`
- `useMemo` varre regras ativas, filtra as que satisfazem `min_amount` ou `min_qty`, pega a de maior `discount_pct`
- `autoDiscount = subtotal * bestRule.discount_pct / 100`

### PDV — Fidelidade
- 1 ponto por R$1 gasto → RPC `add_loyalty_points(customer_id, Math.floor(total))`
- Resgate: 100 pts = R$1 → `loyaltyDiscount = loyaltyPoints * 0.01`
- Caps em `subtotal - globalDisc - autoDiscount`
- Dedução via RPC `deduct_loyalty_points(customer_id, pts_used)`

### Numeração sequencial de vendas
- RPC `get_next_sale_number(tenant_id)` faz UPDATE atômico em `tenants.last_sale_number`
- Exibido como `#0001` (String(n).padStart(4,'0'))

### Catálogo público
- `lib/supabase/admin.ts` → `createAdminClient()` usa `SUPABASE_SERVICE_ROLE_KEY`
- Bypassa RLS — usar SOMENTE para leitura pública de produtos

## 7. Banco de dados — tabelas da Fase 8

```
product_variants  → id, tenant_id, product_id, name, sku, stock_qty, sale_price, cost_price
pets              → id, tenant_id, customer_id, name, species, breed, birth_date, notes
appointments      → id, tenant_id, customer_id, pet_id, title, appointment_date, duration_min, price, technician, status, notes
discount_rules    → id, tenant_id, name, min_qty, min_amount, discount_pct, is_active
```

RPCs da Fase 8: `decrement_variant_stock`, `deduct_loyalty_points`

Aplicar em ordem: `migration_v1.1.sql` → `v1.2.sql` → `v1.3.sql`

## 8. Variáveis de ambiente críticas

| Var | Onde obrigatória | Para quê |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `apps/store` + `apps/admin` | Catálogo público + API create-user |
| `STRIPE_SECRET_KEY` | `apps/store` | Checkout + webhook |
| `STRIPE_WEBHOOK_SECRET` | `apps/store` | Validar eventos Stripe |

## 9. Gaps conhecidos (não implementados)

- Estoque de variantes não é restaurado ao cancelar venda
- Pontos de fidelidade não são devolvidos ao cancelar venda
- Limites de plano (produtos/usuários) não são enforçados no runtime
- Exportação CSV/PDF não implementada
- Autenticação no portal admin (middleware com cookie secreto)
