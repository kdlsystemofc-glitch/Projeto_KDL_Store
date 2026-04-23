# KDL Store — System Map

> **Documento vivo.** Atualizado a cada mudança significativa no código.
> Última atualização: 2026-04-23 | Fase 8 — Variações (grade), Pets + Agenda, Regras de Desconto, Fidelidade

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral)
2. [Landing Page](#2-landing-page-appslanding)
3. [App da Loja](#3-app-da-loja-appsstore)
4. [Portal Admin](#4-portal-admin-appsadmin)
5. [Banco de Dados](#5-banco-de-dados)
6. [Integração Stripe](#6-integração-stripe)
7. [Fluxos de Negócio](#7-fluxos-de-negócio)
8. [Planos e Limites](#8-planos-e-limites)
9. [Variáveis de Ambiente](#9-variáveis-de-ambiente)
10. [Histórico de Migrações](#10-histórico-de-migrações)
11. [Pendências e Gaps Conhecidos](#11-pendências-e-gaps-conhecidos)

---

## 1. Visão Geral

```
┌──────────────────────────────────────────────────────────────┐
│                     KDL Store Monorepo                        │
│                   Turborepo + pnpm 9.x                        │
├──────────────┬──────────────────────┬────────────────────────┤
│ apps/landing │     apps/store        │      apps/admin         │
│ Next.js 16   │     Next.js 16        │      Next.js 16         │
│ Port 3000    │     Port 3001         │      Port 3002          │
│ kdlstore.    │  app.kdlstore.com.br  │  admin.kdlstore.com.br  │
│ com.br       │                       │                         │
├──────────────┴──────────────────────┴────────────────────────┤
│                      Supabase (PostgreSQL)                     │
│              Auth │ RLS │ Storage │ Realtime                   │
├──────────────────────────────────────────────────────────────┤
│                      Stripe                                    │
│         Checkout │ Webhooks │ Customer Portal │ Subscriptions  │
└──────────────────────────────────────────────────────────────┘
```

### Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js App Router | 16.x |
| Linguagem | TypeScript | 5.x |
| Styling | Vanilla CSS (`globals.css`, tokens `--kdl-*`) | — |
| Auth + DB | Supabase | último |
| Pagamentos | Stripe | último |
| Build | Turborepo | 2.x |
| Pacotes | pnpm workspaces | 9.x |

> **Sem Tailwind.** O projeto usa exclusivamente CSS vanilla com design tokens.

---

## 2. Landing Page (`apps/landing`)

**URL:** `projeto-kdl-store-landing.vercel.app` → `kdlstore.com.br` | **Port dev:** 3000 | **Status:** ✅ Completo

### Estrutura de arquivos

```
apps/landing/
├── public/               # hero-video.mp4 (5MB)
├── src/app/
│   ├── globals.css         # Design system com tokens CSS
│   ├── layout.tsx          # Root layout + SEO + Google Fonts
│   └── page.tsx            # Composição das seções
└── src/components/
    ├── Navbar.tsx
    ├── HeroScrollAnimation.tsx  # Video scrubbing via scroll
    ├── ProblemsSection.tsx
    ├── FeaturesSection.tsx
    ├── ForWhomSection.tsx
    ├── PricingSection.tsx       # 3 planos → CTA para /cadastro
    ├── FAQSection.tsx
    └── Footer.tsx
```

### Variáveis de ambiente (Vercel: `projeto-kdl-store-landing`)

```env
NEXT_PUBLIC_ADMIN_URL
NEXT_PUBLIC_STORE_URL
NEXT_PUBLIC_APP_URL
```

---

## 3. App da Loja (`apps/store`)

**URL:** `projeto-kdl-store-store.vercel.app` → `app.kdlstore.com.br` | **Port dev:** 3001 | **Status:** ✅ Completo

### Estrutura de arquivos

```
apps/store/
├── app/
│   ├── globals.css              # Design system (dark premium)
│   ├── layout.tsx               # Root layout + Google Fonts
│   ├── page.tsx                 # → redirect /login
│   ├── login/page.tsx           # Login com Supabase Auth
│   ├── cadastro/page.tsx        # Signup 2-step + seleção de plano
│   ├── catalogo/[slug]/page.tsx # Catálogo público (Server Component, service-role)
│   ├── api/
│   │   ├── auth/callback/route.ts       # Supabase OAuth callback
│   │   ├── checkout/route.ts            # Cria sessão Stripe Checkout
│   │   ├── webhook/stripe/route.ts      # Webhook Stripe (POST)
│   │   └── admin/create-user/route.ts   # Cria usuário convidado (service role)
│   └── app/                     # Rotas autenticadas
│       ├── layout.tsx            # Shell: Sidebar + Header + TenantProvider
│       ├── context.tsx           # TenantContext + useTenant() hook
│       ├── dashboard/page.tsx    # KPIs do dia + alertas de estoque
│       ├── pdv/page.tsx          # Ponto de Venda (completo)
│       ├── estoque/page.tsx      # CRUD de produtos + variações + movimentações
│       ├── clientes/page.tsx     # CRUD de clientes + histórico
│       ├── fornecedores/page.tsx # CRUD de fornecedores + pedidos
│       ├── os/page.tsx           # Ordens de Serviço (pipeline)
│       ├── garantias/page.tsx    # Garantias digitais + acionamento
│       ├── financeiro/page.tsx   # Caixa + A Pagar + A Receber
│       ├── relatorios/page.tsx   # KPIs mensais + DRE simplificado
│       ├── agenda/page.tsx       # Pets + Agendamentos (Fase 8)
│       └── configuracoes/page.tsx # Loja + Usuários + Descontos + Assinatura
├── components/
│   └── Sidebar.tsx              # Nav lateral — 11 módulos
├── lib/supabase/
│   ├── client.ts                # createBrowserClient
│   ├── server.ts                # createServerClient (SSR + cookies)
│   └── admin.ts                 # createAdminClient (service-role, para catálogo)
└── middleware.ts                # Auth guard + redirect logic
```

### Middleware Auth (`middleware.ts`)

| Rota | Autenticado | Não autenticado |
|---|---|---|
| `/` | → `/app/dashboard` | → `/login` |
| `/login` | → `/app/dashboard` | ✅ exibe |
| `/cadastro` | → `/app/dashboard` | ✅ exibe |
| `/app/*` | ✅ exibe | → `/login` |
| `/catalogo/*` | ✅ exibe | ✅ exibe (público) |

### Sidebar — seções e módulos

**Operações:** PDV, Estoque, Agenda
**Gestão:** Clientes, Fornecedores, OS, Garantias
**Financeiro:** Financeiro, Relatórios
**Config:** Configurações

### Módulos do App

#### 🛒 PDV (`/app/pdv`)
- Busca de produto por nome/SKU com dropdown em tempo real
- Badge `🛡️ Xm garantia` quando `warranty_months > 0`
- Carrinho com edição inline de qty, preço unitário e desconto por item
- Adição de produto como **brinde** (`is_gift=true`, preço = R$0,00)
- Busca e vinculação de cliente (opcional) + cadastro rápido inline
- **Variações (grade):** se produto tem variantes, abre picker modal com grade de botões (nome / estoque / preço)
- **Regras de desconto progressivo:** `useMemo` detecta melhor regra de `discount_rules` compatível com subtotal/qty; exibe nome da regra e aplica automaticamente
- **Programa de fidelidade:** checkbox "⭐ X pts = R$ Y disponíveis" ao selecionar cliente; desconto calculado como `pts * 0.01`; pontos deduzidos via RPC `deduct_loyalty_points` ao finalizar
- Desconto global em R$
- Observações da venda
- 5 formas de pagamento: Dinheiro, Pix, Cartão Débito, Crédito, Prazo
- Parcelamento (2x–12x) com cálculo automático da parcela
- **Número sequencial de venda:** `#0001`, gerado via `get_next_sale_number()` RPC (atômico)
- Resumo mostra: subtotal, desc. global, desc. automático (regra), desc. fidelidade, **total**
- **Aba Histórico:** últimas 20 vendas do dia + total; botão `✕ Cancelar` restaura estoque + remove transações
- Ao finalizar:
  - RPC `get_next_sale_number` → `sale_number`
  - INSERT `sales` + `sale_items` (com `variant_id` se aplicável)
  - Para variantes: RPC `decrement_variant_stock`; para produtos normais: `decrement_stock`
  - INSERT `cash_transactions` (tipo: `in`)
  - Se prazo + cliente: INSERT `accounts_receivable` (N parcelas)
  - Se `usePoints`: RPC `deduct_loyalty_points`
  - Botão "Criar OS de Instalação" → `/app/os?sale_id={uuid}&sale_label={label}&customer={nome}`

#### 📦 Estoque (`/app/estoque`)
- Tabela filtrável por nome/SKU/categoria
- Cálculo de margem em tempo real (badge colorido)
- Badge de estoque baixo (qty ≤ min_stock)
- Modal de cadastro/edição: nome, SKU, categoria, custo, preço, estoque, min_stock, unidade, warranty_months
- Preview de margem no formulário
- **Grade de variações:** seção "🎨 Grade de Variações" no modal de edição (somente produtos já salvos)
  - Lista variantes existentes: nome, SKU, badge estoque, preço, botão remover
  - Formulário inline para adicionar variante: nome, estoque, preço, SKU + botão "Add"
- Modal de movimentação: Entrada / Ajuste / Perda com motivo

#### 👥 Clientes (`/app/clientes`)
- Busca por nome, telefone, CPF/CNPJ, email
- Painel lateral com histórico de compras (últimas 10)
- Modal completo: nome, telefone, tel2, CPF/CNPJ, email, aniversário, endereço, obs
- Link WhatsApp (`wa.me/55...`)
- Campo `loyalty_points` exibido no painel lateral

#### 🔗 Fornecedores (`/app/fornecedores`)
- CRUD: nome empresa, contato, telefone, WhatsApp, email, prazo pagamento, obs
- Modal de pedido: multi-item (produto catálogo + manual), qty, obs; bulk insert com auto-heal
- Mensagem WhatsApp gerada automaticamente com itens do pedido

#### 🔧 Ordens de Serviço (`/app/os`)
- Pipeline: `quote → approved → in_progress → completed → billed → cancelled`
- Badge counters por status
- Form: cliente, técnico, descrição, valor, `estimated_date`, status
- Pré-preenchimento via query params: `?sale_id=`, `?sale_label=`, `?customer=` (vindo do PDV)
- `sale_id` (UUID) vincula OS à venda de origem
- `completed_at` registrado ao completar

#### 🛡️ Garantias (`/app/garantias`)
- Código único `warranty_code` (ex: `KDL-A1B2C3`) via auto-heal loop
- Countdown de dias até vencimento (verde/amarelo/vermelho)
- Filtro por status (ativa/vencida/acionada)
- "⚡ Acionar": cria OS vinculada + marca `claimed`

#### 💰 Financeiro (`/app/financeiro`)
- **Caixa:** histórico entradas/saídas (últimas 50)
- **A Pagar:** destaque para vencidos, botão "✓ Pagar", modal de nova conta
- **A Receber:** parcelas com vencimento, botão "✓ Receber"
- Cards de resumo: saldo, total entradas, saídas, pendente pagar/receber

#### 📈 Relatórios (`/app/relatorios`)
- KPIs do mês: vendas, faturamento, ticket médio, OS concluídas, receita OS
- Gráfico de barras por forma de pagamento
- Resumo OS por status
- DRE Simplificado

#### 📅 Agenda (`/app/agenda`) ← **Fase 8**
- **Aba Agendamentos:** timeline agrupada por data; cards com status colorido (borda esquerda)
  - Pipeline: `scheduled → confirmed → in_progress → completed → cancelled`
  - Ao completar com `price > 0`: INSERT `cash_transactions` automático
  - Link WhatsApp por agendamento
  - CRUD: cliente, pet vinculado, título, datetime, duração (min), preço, técnico, obs, status
- **Aba Pets:** CRUD de pets vinculados a clientes
  - Espécies: cachorro, gato, pássaro, coelho, outro
  - Campos: nome, cliente, espécie, raça, data nascimento, obs

#### ⚙️ Configurações (`/app/configuracoes`)
- **Aba Loja:** nome da loja, WhatsApp (para notificações)
- **Aba Usuários:** lista + convite via `/api/admin/create-user`; ativa/desativa; define role
- **Aba Descontos** ← **Fase 8:** CRUD de regras de desconto progressivo
  - Campos: nome, valor mínimo (R$) ou qtd mínima de itens, percentual de desconto
  - Toggle ativo/inativo
  - Preview ao vivo: "Pedidos acima de R$ X ganham Y% de desconto"
- **Aba Assinatura:** plano + status + link Stripe Portal + upgrade

### TenantContext (`app/app/context.tsx`)

O `layout.tsx` (Server Component) busca `tenantId`, `userId`, `storeName` uma única vez e injeta via `<TenantProvider>`. Todas as páginas consomem via `const { tenantId, userId, storeName } = useTenant()`.

### API Route: `/api/admin/create-user`

- POST — verifica que o chamador é `owner` ou `manager` do tenant
- Usa `SUPABASE_SERVICE_ROLE_KEY` no servidor
- `supabaseAdmin.auth.admin.createUser` com `email_confirm: true`
- Metadados `{ is_invite: true, tenant_id, role, name }` → trigger `handle_new_user` vincula ao tenant

### Catálogo Público (`/catalogo/[slug]`)

- Server Component com `createAdminClient()` (service-role, bypassa RLS)
- Busca tenant por `slug` + `status='active'`; retorna `notFound()` se inativo
- Lista produtos ativos com `stock_qty > 0`
- `generateMetadata` para SEO
- Requer `SUPABASE_SERVICE_ROLE_KEY` no Vercel

### Padrão Auto-Heal

Todos os formulários de save usam loop de resiliência contra colunas ausentes no schema cache do Supabase:

```ts
const removedCols = new Set<string>();
while (!success && attempts < 10) {
  const payload = buildPayload(removedCols);
  const res = await supabase.from('table').insert(payload);
  if (res.error) {
    const col = res.error.message.match(/column "([^"]+)"/)?.[1]
              ?? res.error.message.match(/'([^']+)' column/)?.[1];
    if (col) { removedCols.add(col); attempts++; continue; }
    break; // erro fatal
  }
  success = true;
}
```

---

## 4. Portal Admin (`apps/admin`)

**URL:** `projeto-kdl-store-admin.vercel.app` → `admin.kdlstore.com.br` | **Port dev:** 3002 | **Status:** ✅ Base completa

### Estrutura

```
apps/admin/
├── app/
│   ├── globals.css
│   ├── layout.tsx               # noindex robots
│   ├── page.tsx                 # → redirect /dashboard
│   ├── dashboard/
│   │   ├── layout.tsx           # AdminSidebar + Header
│   │   └── page.tsx             # MRR/ARR + lojas por plano
│   ├── tenants/page.tsx         # Lista lojas com plano/Stripe
│   └── assinaturas/page.tsx     # Subs com links Stripe Dashboard
└── components/
    └── AdminSidebar.tsx
```

### Variáveis de ambiente (Vercel: `projeto-kdl-store-admin`)

```env
NEXT_PUBLIC_ADMIN_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

> **Pendente:** adicionar autenticação no middleware admin antes de expor em produção.

---

## 5. Banco de Dados

**Provider:** Supabase (PostgreSQL) | **Schema base:** `docs/schema.sql`

### Tabelas

| Tabela | Descrição | RLS |
|---|---|---|
| `plans` | 3 planos (starter/pro/premium) | leitura pública |
| `tenants` | Lojas (multi-tenant) | só vê o próprio |
| `users` | Extensão de auth.users | só vê do tenant |
| `categories` | Categorias de produtos | por tenant |
| `products` | Catálogo de produtos | por tenant |
| `product_variants` | Grade/variações por produto | por tenant |
| `stock_movements` | Histórico de movimentos | por tenant |
| `customers` | Clientes da loja | por tenant |
| `pets` | Pets dos clientes | por tenant |
| `appointments` | Agendamentos | por tenant |
| `suppliers` | Fornecedores | por tenant |
| `supplier_orders` | Pedidos a fornecedores | por tenant |
| `sales` | Vendas finalizadas | por tenant |
| `sale_items` | Itens de cada venda | por tenant |
| `warranties` | Garantias emitidas | por tenant |
| `service_orders` | Ordens de serviço | por tenant |
| `accounts_receivable` | Parcelas a receber | por tenant |
| `accounts_payable` | Contas a pagar | por tenant |
| `cash_transactions` | Fluxo de caixa | por tenant |
| `discount_rules` | Regras de desconto progressivo | por tenant |
| `admin_users` | Admins internos KDL | — |

### Colunas adicionadas (migration v1.1 + v1.2 + v1.3)

| Tabela | Coluna | Tipo | Descrição |
|---|---|---|---|
| `tenants` | `last_sale_number` | `integer default 0` | Contador atômico para numeração sequencial |
| `tenants` | `whatsapp` | `text` | WhatsApp da loja para notificações |
| `users` | `email` | `text` | Email copiado do auth.users |
| `products` | `warranty_months` | `integer default 0` | Meses de garantia padrão |
| `sales` | `sale_number` | `integer` | Número sequencial por tenant |
| `warranties` | `warranty_code` | `text` | Código único legível (ex: `KDL-A1B2C3`) |
| `service_orders` | `sale_id` | `uuid → sales` | Venda de origem da OS |
| `sale_items` | `variant_id` | `uuid → product_variants` | Variante vendida |
| `suppliers` | `whatsapp` | `text` | WhatsApp do fornecedor |
| `suppliers` | `payment_terms` | `text` | Prazo de pagamento |
| `suppliers` | `notes` | `text` | Observações internas |
| `supplier_orders` | `product_id` | `uuid → products` | Produto do catálogo |

### Novas tabelas (migration v1.3)

#### `product_variants`
```sql
id uuid PK, tenant_id uuid, product_id uuid → products,
name text, sku text, stock_qty integer default 0,
sale_price numeric, cost_price numeric,
created_at timestamptz
```

#### `pets`
```sql
id uuid PK, tenant_id uuid, customer_id uuid → customers,
name text, species text, breed text, birth_date date, notes text,
created_at timestamptz
```

#### `appointments`
```sql
id uuid PK, tenant_id uuid, customer_id uuid, pet_id uuid → pets,
title text, appointment_date timestamptz, duration_min integer,
price numeric default 0, technician text,
status text default 'scheduled', notes text,
created_at timestamptz
```

#### `discount_rules`
```sql
id uuid PK, tenant_id uuid, name text,
min_qty integer, min_amount numeric,
discount_pct numeric, is_active boolean default true,
created_at timestamptz
```

### Funções/Triggers/RPCs

| Nome | Tipo | Descrição |
|---|---|---|
| `handle_new_user()` | trigger after insert auth.users | Cria tenant+user (signup) ou vincula tenant existente (invite) |
| `auth_tenant_id()` | helper SQL | Retorna `tenant_id` do usuário logado (RLS) |
| `get_next_sale_number(p_tenant_id)` | RPC | Incrementa atomicamente `last_sale_number` |
| `decrement_stock(p_product_id, p_qty)` | RPC | Decrementa estoque com `greatest(0, ...)` |
| `decrement_variant_stock(p_variant_id, p_qty)` | RPC | Decrementa estoque de variante |
| `add_loyalty_points(p_customer_id, p_points)` | RPC | Incrementa `loyalty_points` do cliente |
| `deduct_loyalty_points(p_customer_id, p_points)` | RPC | Deduz `loyalty_points` com piso em 0 |
| `set_warranty_expiry()` | trigger before insert/update warranties | Calcula `expiry_date = issue_date + warranty_months` |

---

## 6. Integração Stripe

### Rotas de API

| Rota | Método | Descrição |
|---|---|---|
| `/api/checkout` | POST | Cria sessão Stripe Checkout |
| `/api/webhook/stripe` | POST | Recebe eventos Stripe, sincroniza Supabase |
| `/api/auth/callback` | GET | Callback OAuth/email Supabase |

### Eventos Webhook tratados

| Evento Stripe | Ação no Supabase |
|---|---|
| `checkout.session.completed` | Vincula `stripe_customer_id` + `stripe_subscription_id` + ativa tenant |
| `customer.subscription.created` | Ativa tenant |
| `customer.subscription.updated` | Atualiza status tenant |
| `customer.subscription.deleted` | Suspende tenant |
| `invoice.payment_failed` | Suspende tenant |

---

## 7. Fluxos de Negócio

### Onboarding de novo lojista

```
Landing → clica "Começar agora" (plano selecionado)
  ↓
/cadastro?plano=pro  (passo 1: dados)
  ↓
/cadastro           (passo 2: resumo)
  ↓
POST /api/checkout  → Stripe Checkout Session
  ↓
Webhook checkout.session.completed
  └── tenant.status = 'active'
  ↓
Cliente redirecionado para /app/dashboard
```

### Venda completa (PDV)

```
Busca produto → dropdown autocomplete
  ↓
[produto tem variantes?] → picker modal → seleciona variação
  ↓
Adiciona ao carrinho (qty, preço, desconto por item)
  ↓
[opcional] Adiciona brinde (is_gift=true, unit_price=0)
  ↓
Aplica desconto global + observações
  ↓
[opcional] Seleciona cliente → [pontos disponíveis?] → toggle fidelidade
  ↓
[desconto automático] useMemo verifica discount_rules → aplica melhor regra
  ↓
Escolhe pagamento → [crédito] define parcelas
  ↓
Finaliza:
  ├── RPC get_next_sale_number() → sale_number
  ├── INSERT sales (com auto-heal)
  ├── INSERT sale_items (com variant_id)
  ├── RPC decrement_variant_stock() ou decrement_stock() por item
  ├── INSERT cash_transactions (in)
  ├── [prazo] INSERT accounts_receivable (N parcelas)
  └── [usePoints] RPC deduct_loyalty_points()
```

### Cancelamento de venda

```
Usuário clica "✕ Cancelar" no histórico
  ↓
UPDATE sales SET status='cancelled'
  ↓
Para cada sale_item: UPDATE products SET stock_qty += qty
  ↓
DELETE cash_transactions WHERE reference_id = sale_id
  ↓
DELETE accounts_receivable WHERE sale_id = sale_id
```

> ⚠️ **Gap conhecido:** variantes não têm estoque restaurado no cancelamento (somente `products.stock_qty`). Pontos de fidelidade resgatados também não são devolvidos.

### Garantia → OS

```
Busca garantia → "⚡ Acionar"
  ├── INSERT service_orders (status=approved, warranty_id vinculado)
  └── UPDATE warranties SET status='claimed'
  ↓
Técnico acessa OS → executa → status=completed → status=billed
```

### PDV → OS de Instalação

```
Venda finalizada → botão "Criar OS de Instalação"
  ↓
Navega para /app/os?sale_id={uuid}&sale_label=#0001&customer={nome}
  ↓
OS form pré-preenchido com cliente e sale_id vinculado
```

### Agendamento com cobrança

```
Agenda: cria/edita agendamento com price > 0
  ↓
Status muda para "completed"
  ↓
INSERT cash_transactions (in, amount=price, description=título)
```

---

## 8. Planos e Limites

| Funcionalidade | Starter R$49,90 | Pro R$69,90 | Premium R$99,90 |
|---|:---:|:---:|:---:|
| Usuários | 1 | 3 | Ilimitado |
| Produtos | 300 | 1.000 | Ilimitado |
| PDV + Descontos + Brindes | ✅ | ✅ | ✅ |
| Variações de produto (grade) | ✅ | ✅ | ✅ |
| Estoque + Movimentações | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ |
| Garantia Digital | ✅ | ✅ | ✅ |
| Relatórios básicos | ✅ | ✅ | ✅ |
| Fornecedores + Pedidos | ❌ | ✅ | ✅ |
| Ordens de Serviço | ❌ | ✅ | ✅ |
| Financeiro (caixa/pagar/receber) | ❌ | ✅ | ✅ |
| Parcelamento | ❌ | ✅ | ✅ |
| Agenda + Pets | ❌ | ✅ | ✅ |
| Regras de desconto progressivo | ❌ | ✅ | ✅ |
| Exportação CSV/PDF | ❌ | ✅ | ✅ |
| Comissões de vendedores | ❌ | ❌ | ✅ |
| Relatórios avançados + DRE | ❌ | ❌ | ✅ |
| Programa de fidelidade | ❌ | ❌ | ✅ |
| Notificações WhatsApp | ❌ | ❌ | ✅ |
| Catálogo público | ❌ | ❌ | ✅ |
| Suporte | Email | Email prioritário | Prioritário |

---

## 9. Variáveis de Ambiente

### `apps/landing` (Vercel: `projeto-kdl-store-landing`)
```env
NEXT_PUBLIC_ADMIN_URL=https://admin.kdlstore.com.br
NEXT_PUBLIC_STORE_URL=https://app.kdlstore.com.br
NEXT_PUBLIC_APP_URL=https://kdlstore.com.br
```

### `apps/store` (Vercel: `projeto-kdl-store-store`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # obrigatório para /catalogo/[slug]

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=https://app.kdlstore.com.br
NEXT_PUBLIC_LANDING_URL=https://kdlstore.com.br
```

### `apps/admin` (Vercel: `projeto-kdl-store-admin`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_ADMIN_URL=https://admin.kdlstore.com.br
```

---

## 10. Histórico de Migrações

| Arquivo | Fase | O que adiciona |
|---|---|---|
| `docs/schema.sql` | Base | Schema completo inicial |
| `docs/migration_v1.1.sql` | Fase 5 | `warranty_months`, `last_sale_number`, trigger `set_warranty_expiry`, RPC `get_next_sale_number` |
| `docs/migration_v1.2.sql` | Fase 6/7 | `warranty_code`, `sale_number`, `whatsapp` (tenants), `sale_id` (OS), `email` (users), RPCs `add_loyalty_points` |
| `docs/migration_v1.3.sql` | Fase 8 | `product_variants`, `pets`, `appointments`, `discount_rules`, `variant_id` em `sale_items`, RPCs `decrement_variant_stock` + `deduct_loyalty_points` |

**Para aplicar:** Supabase → SQL Editor → cole e execute cada migration em ordem.

---

## 11. Pendências e Gaps Conhecidos

| Item | Prioridade | Detalhes |
|---|---|---|
| Restaurar estoque de variantes no cancelamento | Média | `cancelSale()` no PDV restaura `products.stock_qty` mas não `product_variants.stock_qty` |
| Devolver pontos de fidelidade no cancelamento | Baixa | Pontos resgatados não são restituídos ao cancelar venda |
| Autenticação no portal admin | Alta | Middleware com cookie secreto antes de expor em produção |
| Emissão de PDF (venda + garantia) | Média | Planejado para fase futura com `react-pdf` |
| Exportação CSV nos relatórios | Média | Feature dos planos Pro/Premium não implementada |
| Comissões de vendedores | Baixa | Feature Premium planejada |
| Notificações WhatsApp automáticas | Baixa | Feature Premium via Z-API ou Twilio |
| Verificação pública de garantia `/garantia/[code]` | Média | Página pública para cliente verificar validade |
| Limites de plano enforçados no código | Alta | Tabela de planos existe mas limites não são verificados no runtime |

---

*Versão: 0.8.0 — Fases 1–8 completas*
