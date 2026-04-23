# KDL Store — System Map

> **Documento vivo.** Atualizado a cada mudança significativa no código.
> Última atualização: 2026-04-23 | Fase 5 — Correções e melhorias: TenantContext, números sequenciais, auto-heal em todos os módulos, convite de usuários

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
10. [Próximos Passos](#10-próximos-passos)

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
| Framework | Next.js App Router | 16.2.4 |
| Linguagem | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Auth + DB | Supabase | último |
| Pagamentos | Stripe | último |
| Build | Turborepo | 2.x |
| Pacotes | pnpm workspaces | 9.x |

---

## 2. Landing Page (`apps/landing`)

**URL:** `kdlstore.com.br` | **Port dev:** 3000 | **Status:** ✅ Completo

### Estrutura de arquivos

```
apps/landing/
├── public/               # hero-video.mp4 (5MB) substituiu os 240 frames PNG
├── src/app/
│   ├── globals.css         # Design system com tokens CSS
│   ├── layout.tsx          # Root layout + SEO + Google Fonts
│   └── page.tsx            # Composição das seções
└── src/components/
    ├── Navbar.tsx            # Fixa, glassmorphism, mobile-friendly
    ├── HeroScrollAnimation.tsx  # Canvas scrubbing 40 frames (SSR-safe)
    ├── ProblemsSection.tsx   # 6 cards Antes/Depois
    ├── FeaturesSection.tsx   # 9 features grid
    ├── ForWhomSection.tsx    # 12 tipos de loja
    ├── PricingSection.tsx    # 3 planos com CTA → app.kdlstore.com.br/cadastro
    ├── FAQSection.tsx        # 8 perguntas accordion
    └── Footer.tsx            # Links + social
```

### Hero Animation
- **Técnica:** HTML5 Video Scrubbing (`/public/hero-video.mp4`)
- **Performance:** Substituiu o antigo uso de canvas e centenas de imagens PNG por um único arquivo de 5MB, resultando em carregamento instantâneo e uso de memória drásticamente menor.
- **Scroll:** `container height = 3600px + viewportHeight`; `video.currentTime = (scrolled/3600) * video.duration`
- **Suavidade:** Atualização no `requestAnimationFrame` limitando a atualização de tempo apenas se a diferença for > 0.01s.

### Design System Tokens

| Token | Valor |
|---|---|
| `--kdl-primary` | `#6C47FF` |
| `--kdl-accent` | `#00D4AA` |
| `--kdl-bg` | `#0A0A0F` |
| Fonte títulos | Outfit |
| Fonte corpo | Inter |

---

## 3. App da Loja (`apps/store`)

**URL:** `app.kdlstore.com.br` | **Port dev:** 3001 | **Status:** ✅ Completo

### Estrutura de arquivos

```
apps/store/
├── app/
│   ├── globals.css              # Design system (dark premium)
│   ├── layout.tsx               # Root layout + Google Fonts
│   ├── page.tsx                 # → redirect /login
│   ├── login/page.tsx           # Login com Supabase Auth
│   ├── cadastro/page.tsx        # Signup 2-step + seleção de plano
│   ├── api/
│   │   ├── auth/callback/route.ts       # Supabase OAuth callback
│   │   ├── checkout/route.ts            # Cria sessão Stripe Checkout
│   │   ├── webhook/stripe/route.ts      # Webhook Stripe (POST)
│   │   └── admin/create-user/route.ts   # Cria usuário convidado (service role)
│   └── app/                     # Rotas autenticadas
│       ├── layout.tsx            # Shell: Sidebar + Header + TenantProvider
│       ├── context.tsx           # TenantContext + useTenant() hook
│       ├── dashboard/page.tsx    # KPIs do dia + alertas
│       ├── pdv/page.tsx          # Ponto de Venda
│       ├── estoque/page.tsx      # CRUD de produtos + movimentações
│       ├── clientes/page.tsx     # CRUD de clientes
│       ├── fornecedores/page.tsx # CRUD de fornecedores + pedidos
│       ├── os/page.tsx           # Ordens de Serviço (pipeline)
│       ├── garantias/page.tsx    # Garantias digitais + acionamento
│       ├── financeiro/page.tsx   # Caixa + A Pagar + A Receber
│       ├── relatorios/page.tsx   # KPIs mensais + DRE simplificado
│       └── configuracoes/page.tsx # Loja + Usuários + Assinatura
├── components/
│   └── Sidebar.tsx              # Nav lateral com 9 módulos
├── lib/supabase/
│   ├── client.ts                # createBrowserClient
│   └── server.ts                # createServerClient (SSR + cookies)
└── middleware.ts                # Auth guard + redirect logic
```

### Middleware Auth (middleware.ts)

| Rota | Autenticado | Não autenticado |
|---|---|---|
| `/` | → `/app/dashboard` | → `/login` |
| `/login` | → `/app/dashboard` | ✅ exibe |
| `/cadastro` | → `/app/dashboard` | ✅ exibe |
| `/app/*` | ✅ exibe | → `/login` |

### Módulos do App

#### 🛒 PDV (`/app/pdv`)
- Busca de produto por nome/SKU com dropdown em tempo real
- Produtos exibem badge `🛡️ Xm garantia` quando `warranty_months > 0`
- Carrinho com edição inline de qty, preço unitário e desconto por item
- Adição de produto como **brinde** (preço = R$0,00)
- Busca e vinculação de cliente (opcional)
- **Cadastro rápido de cliente** direto no PDV: ao digitar nome não encontrado, aparece `+ Cadastrar "[nome]" agora` → mini modal com nome/telefone/CPF
- Desconto global em R$
- Campo de observações da venda
- 5 formas de pagamento: Dinheiro, Pix, Cartão Débito, Crédito, Prazo
- Parcelamento (2x a 12x) com cálculo automático da parcela
- **Número sequencial de venda**: exibido como `#0001`, gerado via `get_next_sale_number()` RPC (atômico, sem race condition)
- **Aba Histórico**: lista as últimas 20 vendas do dia + total do dia; botão `✕ Cancelar` com confirmação → restaura estoque + remove cash_transaction + remove accounts_receivable
- Ao finalizar:
  - Gera `sale_number` via RPC `get_next_sale_number`
  - Insere `sales` + `sale_items` (com auto-heal loop)
  - Decrementa estoque via `decrement_stock()` RPC
  - Insere `cash_transactions` (tipo: `in`)
  - Se prazo + cliente: gera `accounts_receivable` (N parcelas)

#### 📦 Estoque (`/app/estoque`)
- Tabela com todos os produtos filtráveis por nome/SKU/categoria
- Cálculo de margem em tempo real (% e badge colorido)
- Badge de estoque baixo (qty ≤ min_stock)
- Modal de cadastro/edição com: nome, SKU, categoria, custo, preço venda, estoque, estoque mínimo, unidade, **meses de garantia**
- Preview de margem no formulário
- Dica visual: "✅ Garantia de X meses será sugerida no PDV" quando `warranty_months > 0`
- Modal de movimentação: Entrada / Ajuste / Perda com motivo

#### 👥 Clientes (`/app/clientes`)
- Busca por nome, telefone (1 e 2), CPF/CNPJ, email (normaliza dígitos na busca)
- Painel lateral com histórico de compras (últimas 10)
- Modal completo: nome, telefone, telefone2, CPF/CNPJ, email, aniversário, endereço, observações internas
- Link direto WhatsApp (`wa.me/55...`)

#### 🔗 Fornecedores (`/app/fornecedores`)
- CRUD com nome empresa, contato, telefone, WhatsApp, email, prazo de pagamento, observações
- Botão **📦 Pedir** abre modal de pedido: seleciona produto do catálogo + descrição manual, qty, observações
- Pedido suporta múltiplos itens; insert bulk com auto-heal usando `removedCols Set`
- Registra em `supplier_orders`

#### 🔧 Ordens de Serviço (`/app/os`)
- Pipeline com 6 status: `quote → approved → in_progress → completed → billed → cancelled`
- Contadores de badge por status no header
- Form: cliente, técnico, descrição, valor, prazo, status visual
- Ao status `completed`: registra `completed_at`

#### 🛡️ Garantias (`/app/garantias`)
- Geração de **código único** `warranty_code` (ex: `KDL-A1B2C3`) via auto-heal loop
- Listagem com countdown de dias até vencimento (verde/amarelo/vermelho)
- Filtro por status (ativa/vencida/acionada)
- Counters: ativas, vencendo em 30d, vencidas
- Botão **⚡ Acionar**: cria OS vinculada + marca garantia como `claimed`

#### 💰 Financeiro (`/app/financeiro`)
- **Aba Caixa:** histórico de entradas/saídas (últimas 50)
- **Aba A Pagar:** lista com destaque para vencidos, botão "✓ Pagar", modal de nova conta
- **Aba A Receber:** parcelas com número, cliente, vencimento, botão "✓ Receber"
- Cards de resumo: saldo, total entradas, saídas, pendente pagar/receber

#### 📈 Relatórios (`/app/relatorios`)
- KPIs do mês corrente: vendas, faturamento, ticket médio, OS concluídas, receita OS
- Gráfico de barras (progress bar) por forma de pagamento
- Resumo de OS por status
- DRE Simplificado: receita vendas + receita OS = receita bruta

#### ⚙️ Configurações (`/app/configuracoes`)
- **Aba Loja:** edita nome da loja
- **Aba Usuários:** lista com nome/email/role/status; adiciona via `/api/admin/create-user`; ativa/desativa; define role
- **Aba Assinatura:** exibe plano + preço + status + link Stripe Portal + upgrade

### TenantContext (`app/app/context.tsx`)

Elimina 2 chamadas Supabase redundantes por navegação de página:
- O `layout.tsx` (Server Component) busca `tenantId`, `userId`, `storeName` uma única vez
- Injeta via `<TenantProvider>` que envolve todos os filhos
- Todas as páginas consomem via `const { tenantId, userId, storeName } = useTenant()`

### API Route: `/api/admin/create-user`

- Método: `POST`
- Autenticação: verifica que o chamador é `owner` ou `manager` do tenant
- Usa `SUPABASE_SERVICE_ROLE_KEY` no servidor (nunca exposto ao browser)
- Cria usuário via `supabaseAdmin.auth.admin.createUser` com `email_confirm: true`
- Metadados `{ is_invite: true, tenant_id, role, name }` → trigger `handle_new_user` vincula ao tenant existente

### Padrão Auto-Heal

Todos os formulários de save usam loop de resiliência contra colunas faltando no schema:
```ts
const removedCols = new Set<string>();
while (!success && attempts < 10) {
  const res = await supabase.from('table').insert(buildPayload());
  if (res.error) {
    const col = res.error.message.match(/'([^']+)' column/)?.[1];
    if (col) { removedCols.add(col); continue; }
    // erro fatal — break
  }
  success = true;
}
```

### IDs de elementos importantes

| Elemento | ID |
|---|---|
| Input busca PDV | `pdv-search` |
| Busca cliente PDV | `pdv-customer-search` |
| Desconto global | `pdv-global-discount` |
| Finalizar venda | `pdv-finalize` |
| Pagamento (radio) | `pdv-pay-{method}` |
| Novo produto | `estoque-novo-btn` |
| Formulário produto | `produto-form` |
| Salvar produto | `produto-save` |
| Nova OS | `os-nova-btn` |
| Acionar garantia | `gar-claim-{id8}` |
| Tab financeiro | `fin-tab-{caixa\|pagar\|receber}` |
| Portal assinatura | `subscription-portal-btn` |
| Login submit | `login-submit` |
| Cadastro próximo | `cadastro-next` |
| Cadastro pagar | `cadastro-pay` |

---

## 4. Portal Admin (`apps/admin`)

**URL:** `admin.kdlstore.com.br` | **Port dev:** 3002 | **Status:** ✅ Base completa

### Estrutura

```
apps/admin/
├── app/
│   ├── globals.css              # Design system (mais escuro/compacto)
│   ├── layout.tsx               # Root layout + noindex robots
│   ├── page.tsx                 # → redirect /dashboard
│   ├── dashboard/
│   │   ├── layout.tsx           # Shell: AdminSidebar + Header
│   │   └── page.tsx             # MRR/ARR + lojas por plano + recentes
│   ├── tenants/page.tsx         # Lista todas as lojas com plano/Stripe
│   └── assinaturas/page.tsx     # Assinaturas com links Stripe Dashboard
└── components/
    └── AdminSidebar.tsx          # Nav: Dashboard, Lojas, Assinaturas, Planos
```

### Acesso Admin
- Usa `SUPABASE_SERVICE_ROLE_KEY` — bypassa RLS completamente
- Nunca expor no client-side
- Adicionar autenticação de admin antes do deploy (middleware com cookie secreto)

### Módulos Admin

| Módulo | Rota | Dados |
|---|---|---|
| Dashboard | `/dashboard` | MRR, ARR, tenants por plano, últimas lojas |
| Lojas | `/tenants` | Todas as lojas, plano, status Stripe |
| Assinaturas | `/assinaturas` | Sub IDs com link direto → Stripe Dashboard |

---

## 5. Banco de Dados

**Provider:** Supabase (PostgreSQL) | **Schema:** `docs/schema.sql`

### Tabelas

| Tabela | Descrição | RLS |
|---|---|---|
| `plans` | 3 planos (starter/pro/premium) | leitura pública |
| `tenants` | Lojas (multi-tenant) | só vê o próprio |
| `users` | Extensão de auth.users | só vê do tenant |
| `categories` | Categorias de produtos | por tenant |
| `products` | Catálogo de produtos | por tenant |
| `stock_movements` | Histórico de movimentos | por tenant |
| `customers` | Clientes da loja | por tenant |
| `suppliers` | Fornecedores | por tenant |
| `supplier_orders` | Pedidos a fornecedores | por tenant |
| `sales` | Vendas finalizadas | por tenant |
| `sale_items` | Itens de cada venda | por tenant |
| `warranties` | Garantias emitidas | por tenant |
| `service_orders` | Ordens de serviço | por tenant |
| `accounts_receivable` | Parcelas a receber | por tenant |
| `accounts_payable` | Contas a pagar | por tenant |
| `cash_transactions` | Fluxo de caixa | por tenant |
| `admin_users` | Admins internos KDL | — |

### Colunas adicionadas (migration v1.1)

| Tabela | Coluna | Tipo | Descrição |
|---|---|---|---|
| `tenants` | `last_sale_number` | `integer default 0` | Contador atômico para numeração sequencial de vendas |
| `users` | `email` | `text` | Email do usuário (copiado do auth.users) |
| `products` | `warranty_months` | `integer default 0` | Meses de garantia padrão do produto |
| `sales` | `sale_number` | `integer` | Número sequencial da venda por tenant |
| `warranties` | `warranty_code` | `text` | Código único legível (ex: `KDL-A1B2C3`) |
| `suppliers` | `whatsapp` | `text` | WhatsApp do fornecedor |
| `suppliers` | `payment_terms` | `text` | Prazo/condições de pagamento |
| `suppliers` | `notes` | `text` | Observações internas |
| `supplier_orders` | `product_id` | `uuid → products` | Produto do catálogo vinculado ao pedido |

### Funções/Triggers

| Nome | Tipo | Descrição |
|---|---|---|
| `handle_new_user()` | trigger after insert auth.users | Cria tenant + user (signup normal) **ou** vincula ao tenant existente (is_invite=true) |
| `get_next_sale_number(tenant_id)` | RPC | Incrementa atomicamente `last_sale_number` e retorna o próximo número |
| `decrement_stock(product_id, qty)` | RPC | Decrementa estoque com `greatest(0, qty - n)` |
| `set_warranty_expiry()` | trigger before insert/update warranties | Calcula `expiry_date = issue_date + months` |
| `auth_tenant_id()` | helper SQL | Retorna `tenant_id` do usuário logado (usado no RLS) |

---

## 6. Integração Stripe

### Rotas de API (`apps/store/app/api/`)

| Rota | Método | Descrição |
|---|---|---|
| `/api/checkout` | POST | Cria sessão Stripe Checkout (cria/reutiliza customer) |
| `/api/webhook/stripe` | POST | Recebe eventos Stripe, sincroniza status no Supabase |
| `/api/auth/callback` | GET | Callback OAuth/email Supabase |

### Eventos Webhook tratados

| Evento Stripe | Ação no Supabase |
|---|---|
| `checkout.session.completed` | Vincula `stripe_customer_id` + `stripe_subscription_id` + ativa tenant |
| `customer.subscription.created` | Ativa tenant |
| `customer.subscription.updated` | Atualiza status tenant |
| `customer.subscription.deleted` | Suspende tenant |
| `invoice.payment_failed` | Suspende tenant |

### Configuração dos Planos no Stripe

Ao criar os produtos no Stripe, pegar o price_id e atualizar na tabela `plans`:
```sql
UPDATE plans SET stripe_price_id = 'price_xxx' WHERE name = 'starter';
UPDATE plans SET stripe_price_id = 'price_xxx' WHERE name = 'pro';
UPDATE plans SET stripe_price_id = 'price_xxx' WHERE name = 'premium';
```

---

## 7. Fluxos de Negócio

### Onboarding de novo lojista

```
Landing: clica "Começar agora" (plano selecionado)
  ↓
/cadastro?plano=pro  (passo 1: dados pessoais + loja + senha)
  ↓
/cadastro           (passo 2: resumo do pedido)
  ↓
POST /api/checkout  → Stripe Checkout Session criada
  ↓
Stripe Checkout     → cliente paga
  ↓
Webhook: checkout.session.completed
  ├── stripe_customer_id vinculado ao tenant
  ├── stripe_subscription_id salvo
  └── tenant.status = 'active'
  ↓
Cliente redirecionado para /app/dashboard
```

### Venda completa (PDV)

```
Busca produto → dropdown autocomplete
  ↓
Adiciona ao carrinho (qty, preço, desconto por item)
  ↓ [opcional] Adiciona brinde (is_gift=true, unit_price=0)
  ↓
Aplica desconto global + observações
  ↓
Seleciona cliente (para garantia / fiado)
  ↓ [não encontrado] → modal cadastro rápido (nome, telefone, CPF)
  ↓
Escolhe pagamento → [crédito] define parcelas
  ↓
Finaliza:
  ├── RPC get_next_sale_number() → sale_number sequencial
  ├── INSERT sales (com auto-heal)
  ├── INSERT sale_items
  ├── RPC decrement_stock() por produto
  ├── INSERT cash_transactions (in)
  └── [prazo] INSERT accounts_receivable (N parcelas)
```

### Cancelamento de venda (PDV → Histórico)

```
Usuário clica "✕ Cancelar" na venda do histórico
  ↓
Modal de confirmação
  ↓
UPDATE sales SET status='cancelled'
  ↓
Para cada sale_item: UPDATE products SET stock_qty = stock_qty + qty (restaura)
  ↓
DELETE cash_transactions WHERE reference_id = sale_id
  ↓
DELETE accounts_receivable WHERE sale_id = sale_id
```

### Garantia → OS

```
Busca garantia (produto / cliente / código)
  ↓
"⚡ Acionar" →
  ├── INSERT service_orders (status=approved, warranty_id vinculado)
  └── UPDATE warranties SET status='claimed'
  ↓
Técnico acessa OS → executa → status=completed
  ↓
Cobrança (se aplicável) → status=billed
```

---

## 8. Planos e Limites

| Funcionalidade | Starter R$49,90 | Pro R$69,90 | Premium R$99,90 |
|---|:---:|:---:|:---:|
| Usuários | 1 | 3 | Ilimitado |
| Produtos | 300 | 1.000 | Ilimitado |
| PDV + Descontos + Brindes | ✅ | ✅ | ✅ |
| Estoque + Movimentações | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ |
| Garantia Digital PDF | ✅ | ✅ | ✅ |
| Documento de Venda | ✅ | ✅ | ✅ |
| Relatórios básicos | ✅ | ✅ | ✅ |
| Fornecedores + Pedidos | ❌ | ✅ | ✅ |
| Ordens de Serviço | ❌ | ✅ | ✅ |
| Financeiro (caixa/pagar/receber) | ❌ | ✅ | ✅ |
| Parcelamento | ❌ | ✅ | ✅ |
| Exportação CSV/PDF | ❌ | ✅ | ✅ |
| Comissões de vendedores | ❌ | ❌ | ✅ |
| Relatórios avançados + DRE | ❌ | ❌ | ✅ |
| Programa de fidelidade | ❌ | ❌ | ✅ |
| Notificações WhatsApp | ❌ | ❌ | ✅ |
| Suporte | Email | Email prioritário | Prioritário |

---

## 9. Variáveis de Ambiente

### `apps/landing/.env.local`
```env
NEXT_PUBLIC_APP_URL=https://kdlstore.com.br
NEXT_PUBLIC_STORE_URL=https://app.kdlstore.com.br
NEXT_PUBLIC_ADMIN_URL=https://admin.kdlstore.com.br
```

### `apps/store/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=https://app.kdlstore.com.br
NEXT_PUBLIC_LANDING_URL=https://kdlstore.com.br
```

### `apps/admin/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_ADMIN_URL=https://admin.kdlstore.com.br
ADMIN_SECRET=uma_senha_muito_segura
```

---

## 10. Próximos Passos

### Supabase: ações necessárias

- [ ] Rodar `docs/schema.sql` no SQL Editor para criação do schema inicial
- [ ] Rodar `docs/migration_v1.1.sql` para aplicar colunas adicionadas na Fase 5
- [ ] Verificar que trigger `on_auth_user_created` está ativo após atualização do `handle_new_user()`
- [ ] Adicionar `SUPABASE_SERVICE_ROLE_KEY` nas variáveis de ambiente do Vercel (apps/store)

### Vercel: ações necessárias

- [ ] Criar 3 projetos no Vercel: landing, store, admin
- [ ] Configurar variáveis de ambiente de cada app
- [ ] Configurar domínios: `kdlstore.com.br`, `app.kdlstore.com.br`, `admin.kdlstore.com.br`

### Stripe: ações necessárias

- [ ] Criar conta Stripe → criar produtos/preços para os 3 planos
- [ ] Atualizar `stripe_price_id` nas plans: `UPDATE plans SET stripe_price_id = 'price_xxx' WHERE name = 'starter'`
- [ ] Configurar webhook apontando para `https://app.kdlstore.com.br/api/webhook/stripe`

### Fase 6 — Funcionalidades futuras

- [ ] Emissão automática de garantia no PDV quando produto tem `warranty_months > 0`
- [ ] Página pública de verificação de garantia `/garantia/[code]`
- [ ] Geração de PDF de venda e garantia (react-pdf)
- [ ] Exportação CSV nos relatórios
- [ ] Programa de fidelidade: acumulo e resgate de pontos (Premium)
- [ ] Integração WhatsApp para notificações (Premium) via Z-API ou Twilio
- [ ] Autenticação no portal admin (middleware com cookie secreto)
- [ ] Comissões de vendedores (Premium)
- [ ] Gerenciamento de categorias (CRUD de categories)

---

*Versão: 0.5.0 — Fase 5 Completa: TenantContext, números sequenciais, auto-heal universal, convite de usuários*
