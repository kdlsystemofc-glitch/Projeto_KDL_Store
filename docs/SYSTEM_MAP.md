# KDL Store — System Map

> **Documento vivo.** Atualizado a cada mudança significativa no código.
> Última atualização: 2025-04-17 | Fase 2 — Landing Page

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Módulo: Landing Page](#2-módulo-landing-page)
3. [Módulo: App da Loja](#3-módulo-app-da-loja) *(Em desenvolvimento)*
4. [Módulo: Portal Admin](#4-módulo-portal-admin) *(Em desenvolvimento)*
5. [Banco de Dados](#5-banco-de-dados)
6. [Fluxos de Negócio](#6-fluxos-de-negócio)
7. [Planos e Limites](#7-planos-e-limites)
8. [Variáveis de Ambiente](#8-variáveis-de-ambiente)

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    KDL Store Monorepo                     │
│                   (Turborepo + pnpm)                      │
├──────────────┬───────────────────┬──────────────────────┤
│  apps/landing│    apps/store     │     apps/admin        │
│  Next.js 16  │    Next.js 16     │     Next.js 16        │
│  Port 3000   │    Port 3001      │     Port 3002         │
│  kdlstore.   │  app.kdlstore.   │  admin.kdlstore.      │
│  com.br      │    com.br         │      com.br           │
├──────────────┴───────────────────┴──────────────────────┤
│                      Supabase                             │
│        PostgreSQL │ Auth │ Storage │ RLS                  │
├──────────────────────────────────────────────────────────┤
│                       Stripe                              │
│             Pagamentos │ Webhooks │ Assinaturas           │
└──────────────────────────────────────────────────────────┘
```

### Stack Completo

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | Next.js (App Router) | 16.2.4 |
| Linguagem | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Backend/DB | Supabase (PostgreSQL) | último |
| Auth | Supabase Auth | último |
| Pagamentos | Stripe | último |
| Build | Turborepo | 2.x |
| Gerenciador de pacotes | pnpm | 9.x |
| Deploy | Vercel | — |

---

## 2. Módulo: Landing Page

**Path:** `apps/landing/`  
**URL:** `kdlstore.com.br`  
**Port dev:** 3000  
**Status:** ✅ Fase 2 Completa

### 2.1 Estrutura de Arquivos

```
apps/landing/
├── public/
│   └── frames/               # 40 frames da animação hero (ezgif-frame-001..040.png)
├── src/
│   ├── app/
│   │   ├── globals.css        # Design system global
│   │   ├── layout.tsx         # Root layout com metadata e Google Fonts
│   │   └── page.tsx           # Página principal (composição das seções)
│   └── components/
│       ├── Navbar.tsx          # Navbar fixa glassmorphism
│       ├── HeroScrollAnimation.tsx  # Hero com canvas scrubbing (scroll animation)
│       ├── ProblemsSection.tsx # Seção Antes/Depois dos problemas
│       ├── FeaturesSection.tsx # Grid de funcionalidades
│       ├── ForWhomSection.tsx  # Para quem é? (12 tipos de loja)
│       ├── PricingSection.tsx  # Planos de preços
│       ├── FAQSection.tsx      # FAQ accordion
│       └── Footer.tsx          # Rodapé
└── package.json               # @kdl/landing
```

### 2.2 Componentes

#### `Navbar.tsx`
- **ID:** `nav-logo`, `nav-desktop`, `nav-cta`, `nav-mobile-toggle`, `nav-mobile-menu`
- **Tipo:** Client Component (`'use client'`)
- **Comportamento:** Fixed top, glassmorphism backdrop-blur, colapsa em mobile
- **Links:** Funcionalidades → `#funcionalidades`, Para quem é? → `#paraquem`, Planos → `#planos`, FAQ → `#faq`
- **CTAs:** "Entrar" → `https://app.kdlstore.com.br/login`, "Começar agora" → `#planos`

#### `HeroScrollAnimation.tsx`
- **Tipo:** Client Component
- **Técnica:** Canvas Scrubbing — 40 frames renderizados em `<canvas>` baseado em `scrollY`
- **Lógica de scroll:**
  - Container tem altura: `TOTAL_SCROLL (2400px) + viewportHeight`
  - Frame exibido = `Math.floor((scrolled / TOTAL_SCROLL) * 40)`
  - Frames pré-carregados via `Image()` antes da renderização
- **Loading:** Barra de progresso % enquanto carrega os 40 frames
- **Gradientes overlay:** Escurecem bordas para integrar com o design escuro
- **SSR safe:** `viewportHeight` iniciado como 900, atualizado no `useEffect` com `window.innerHeight`

#### `ProblemsSection.tsx`
- **ID:** `#problemas`
- **Conteúdo:** 6 cards com problema (Antes) + solução (Com KDL Store)
- **Problemas mapeados:**
  1. Sem controle de estoque
  2. Nota no papel
  3. Garantia colada no produto
  4. Fornecedor no telefone
  5. Sem negociação registrada
  6. Sem controle financeiro

#### `FeaturesSection.tsx`
- **ID:** `#funcionalidades`
- **Conteúdo:** 9 feature cards com ícone, título, descrição e tags coloridas
- **Módulos:**
  1. PDV Inteligente
  2. Controle de Estoque
  3. Garantia Digital
  4. Gestão de Clientes
  5. Fornecedores
  6. Ordens de Serviço
  7. Financeiro Completo
  8. Relatórios e Análises
  9. Documento de Venda

#### `ForWhomSection.tsx`
- **ID:** `#paraquem`
- **Conteúdo:** 12 tipos de loja com ícone e descrição

#### `PricingSection.tsx`
- **ID:** `#planos`
- **IDs dos botões:** `btn-plan-starter`, `btn-plan-pro`, `btn-plan-premium`
- **Planos:**
  - Starter R$49,90 → `?plano=starter`
  - Pro R$69,90 → `?plano=pro` *(MAIS POPULAR)*
  - Premium R$99,90 → `?plano=premium`
- **Redirect CTA:** `https://app.kdlstore.com.br/cadastro?plano={id}`

#### `FAQSection.tsx`
- **ID:** `#faq`
- **IDs:** `faq-btn-0` a `faq-btn-7`, `faq-contact-btn`
- **Comportamento:** Accordion toggle (open/close por índice)
- **8 perguntas mapeadas**

#### `Footer.tsx`
- **IDs:** `footer-instagram`, `footer-whatsapp`
- **Links:** Produto, Legal, Contato

### 2.3 Design System (globals.css)

| Token | Valor |
|---|---|
| `--kdl-primary` | `#6C47FF` (roxo) |
| `--kdl-accent` | `#00D4AA` (verde-água) |
| `--kdl-bg` | `#0A0A0F` |
| `--kdl-surface` | `#111118` |
| Fonte principal | Inter |
| Fonte de títulos | Outfit |

**Classes utilitárias:**
- `.text-gradient` — gradiente roxo→verde no texto
- `.glass` — glassmorphism com blur e border
- `.btn-primary` — botão gradiente com hover lift
- `.btn-secondary` — botão outline
- `.section-label` — chip de label de seção
- `.card-hover` — card com hover lift e border glow
- `.grid-pattern` — background com grade sutil

---

## 3. Módulo: App da Loja

**Path:** `apps/store/`  
**URL:** `app.kdlstore.com.br`  
**Port dev:** 3001  
**Status:** 🔄 Em desenvolvimento (Fase 3)

### 3.1 Módulos Planejados

| Módulo | Rota | Status |
|---|---|---|
| Login | `/login` | 🔄 |
| Cadastro | `/cadastro` | 🔄 |
| Dashboard | `/app/dashboard` | 🔄 |
| PDV | `/app/pdv` | 🔄 |
| Estoque | `/app/estoque` | 🔄 |
| Clientes | `/app/clientes` | 🔄 |
| Fornecedores | `/app/fornecedores` | 🔄 |
| Ordens de Serviço | `/app/os` | 🔄 |
| Garantias | `/app/garantias` | 🔄 |
| Financeiro | `/app/financeiro` | 🔄 |
| Relatórios | `/app/relatorios` | 🔄 |
| Configurações | `/app/configuracoes` | 🔄 |

---

## 4. Módulo: Portal Admin

**Path:** `apps/admin/`  
**URL:** `admin.kdlstore.com.br`  
**Port dev:** 3002  
**Status:** 🔄 Em desenvolvimento (Fase 4)

### 4.1 Módulos Planejados

| Módulo | Rota | Status |
|---|---|---|
| Login Admin | `/login` | 🔄 |
| Dashboard MRR | `/dashboard` | 🔄 |
| Lojas (Tenants) | `/tenants` | 🔄 |
| Assinaturas | `/assinaturas` | 🔄 |
| Planos | `/planos` | 🔄 |
| Suporte | `/suporte` | 🔄 |

---

## 5. Banco de Dados

**Provider:** Supabase (PostgreSQL)

### 5.1 Schema Principal

```sql
-- =====================================================
-- MULTI-TENANCY
-- =====================================================
tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  plan_id       UUID REFERENCES plans(id),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  status        TEXT DEFAULT 'active', -- active | suspended | cancelled
  created_at    TIMESTAMPTZ DEFAULT now()
)

plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,          -- 'starter' | 'pro' | 'premium'
  display_name  TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  max_users     INTEGER,                -- NULL = ilimitado
  max_products  INTEGER,                -- NULL = ilimitado
  stripe_price_id TEXT,
  features      JSONB,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
)

-- =====================================================
-- AUTH (extensão Supabase Auth)
-- =====================================================
users (
  id        UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  name      TEXT,
  role      TEXT DEFAULT 'seller', -- owner | manager | seller | technician
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- =====================================================
-- PRODUTOS E ESTOQUE
-- =====================================================
categories (
  id UUID PK, tenant_id UUID,
  name TEXT, parent_id UUID
)

products (
  id UUID PK, tenant_id UUID,
  name TEXT, sku TEXT,
  category_id UUID,
  cost_price NUMERIC(10,2),
  sale_price NUMERIC(10,2),
  stock_qty INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'un',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)

stock_movements (
  id UUID PK, tenant_id UUID,
  product_id UUID, user_id UUID,
  type TEXT, -- entry | exit | adjustment | loss
  qty INTEGER,
  reason TEXT,
  reference_type TEXT, -- sale | purchase_order | manual
  reference_id UUID,
  created_at TIMESTAMPTZ
)

-- =====================================================
-- CLIENTES E FORNECEDORES
-- =====================================================
customers (
  id UUID PK, tenant_id UUID,
  name TEXT, cpf_cnpj TEXT,
  phone TEXT, email TEXT,
  address JSONB,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ
)

suppliers (
  id UUID PK, tenant_id UUID,
  name TEXT, contact_name TEXT,
  phone TEXT, email TEXT,
  created_at TIMESTAMPTZ
)

-- =====================================================
-- VENDAS
-- =====================================================
sales (
  id UUID PK, tenant_id UUID,
  customer_id UUID, seller_id UUID,
  subtotal NUMERIC(10,2),
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2),
  payment_method TEXT, -- cash | pix | card | credit
  installments INTEGER DEFAULT 1,
  status TEXT DEFAULT 'completed', -- completed | cancelled | returned
  notes TEXT,
  created_at TIMESTAMPTZ
)

sale_items (
  id UUID PK, sale_id UUID,
  product_id UUID,
  qty INTEGER,
  unit_price NUMERIC(10,2),
  discount NUMERIC(10,2) DEFAULT 0,
  is_gift BOOLEAN DEFAULT false,
  subtotal NUMERIC(10,2)
)

-- =====================================================
-- GARANTIAS
-- =====================================================
warranties (
  id UUID PK, tenant_id UUID,
  sale_item_id UUID, sale_id UUID,
  customer_id UUID, product_id UUID,
  warranty_months INTEGER,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active', -- active | expired | claimed
  notes TEXT
)

-- =====================================================
-- ORDENS DE SERVIÇO
-- =====================================================
service_orders (
  id UUID PK, tenant_id UUID,
  customer_id UUID, technician_id UUID,
  warranty_id UUID, -- opcional: OS por garantia
  status TEXT, -- quote | approved | in_progress | completed | billed | cancelled
  description TEXT,
  price NUMERIC(10,2),
  estimated_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- =====================================================
-- FINANCEIRO
-- =====================================================
accounts_receivable (
  id UUID PK, tenant_id UUID,
  sale_id UUID, customer_id UUID,
  installment_number INTEGER,
  amount NUMERIC(10,2),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' -- pending | paid | overdue
)

accounts_payable (
  id UUID PK, tenant_id UUID,
  supplier_id UUID,
  description TEXT,
  category TEXT, -- rent | utilities | supplier | other
  amount NUMERIC(10,2),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending'
)

cash_transactions (
  id UUID PK, tenant_id UUID,
  type TEXT, -- in | out
  amount NUMERIC(10,2),
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ
)

-- =====================================================
-- ADMIN KDL
-- =====================================================
admin_users (
  id UUID PK,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'super_admin',
  created_at TIMESTAMPTZ
)
```

---

## 6. Fluxos de Negócio

### 6.1 Fluxo de Assinatura (Onboarding)

```
Landing Page
  ↓
Clica "Começar agora" → #planos
  ↓
Seleciona plano (Starter/Pro/Premium)
  ↓
Redireciona: app.kdlstore.com.br/cadastro?plano={id}
  ↓
Formulário: nome, email, senha, nome da loja
  ↓
Stripe Checkout (cartão de crédito)
  ↓
Webhook: stripe.checkout.session.completed
  ↓
  ├── Cria tenant no Supabase
  ├── Cria usuário auth com role 'owner'
  ├── Vincula stripe_subscription_id
  └── Envia email de boas-vindas
  ↓
Redirect → app.kdlstore.com.br/app/dashboard
```

### 6.2 Fluxo de Venda Completa

```
PDV: Busca produto
  ↓
Adiciona ao carrinho (qty, desconto por item)
  ↓ [opcional]
Adiciona brinde (produto com is_gift=true, valor=0)
  ↓
Aplica desconto global
  ↓
Seleciona / cadastra cliente
  ↓
Escolhe pagamento (dinheiro/pix/cartão/prazo)
  ↓ [se prazo/cartão]
Define parcelas → gera accounts_receivable
  ↓
Finaliza venda →
  ├── Insere sale + sale_items
  ├── Baixa stock_qty dos produtos
  ├── Gera cash_transaction (tipo: in)
  ├── Gera warranty por produto (se prazo configurado)
  ├── Gera PDF: Documento de Venda
  └── Gera PDF: Certificado(s) de Garantia
```

### 6.3 Fluxo de Garantia → OS

```
Cliente reclama garantia
  ↓
Busca por: cliente / produto / número garantia
  ↓
Sistema verifica: status = 'active' E data <= expiry_date
  ↓
Abre OS automaticamente (warranty_id vinculado)
  ↓
Técnico executa reparo (status: in_progress)
  ↓
Conclui OS (status: completed)
  ↓
Garantia: status = 'claimed'
  ↓
Notifica cliente (email/WhatsApp)
```

---

## 7. Planos e Limites

| Funcionalidade | Starter R$49,90 | Pro R$69,90 | Premium R$99,90 |
|---|:---:|:---:|:---:|
| Usuários | 1 | 3 | Ilimitado |
| Produtos | 300 | 1.000 | Ilimitado |
| PDV completo | ✅ | ✅ | ✅ |
| Descontos e brindes | ✅ | ✅ | ✅ |
| Controle de estoque | ✅ | ✅ | ✅ |
| Cadastro de clientes | ✅ | ✅ | ✅ |
| Documento de venda PDF | ✅ | ✅ | ✅ |
| Garantia digital PDF | ✅ | ✅ | ✅ |
| Relatórios básicos | ✅ | ✅ | ✅ |
| Fornecedores | ❌ | ✅ | ✅ |
| Pedidos de fornecedor | ❌ | ✅ | ✅ |
| Ordens de Serviço | ❌ | ✅ | ✅ |
| Contas a pagar/receber | ❌ | ✅ | ✅ |
| Fluxo de caixa | ❌ | ✅ | ✅ |
| Parcelamento | ❌ | ✅ | ✅ |
| Exportação CSV/PDF | ❌ | ✅ | ✅ |
| Múltiplos vendedores + comissão | ❌ | ❌ | ✅ |
| Relatórios avançados | ❌ | ❌ | ✅ |
| DRE Simplificado | ❌ | ❌ | ✅ |
| Programa de fidelidade | ❌ | ❌ | ✅ |
| Notificações WhatsApp | ❌ | ❌ | ✅ |
| Suporte | Email | Email | Prioritário |

---

## 8. Variáveis de Ambiente

### `apps/landing/.env.local`
```env
NEXT_PUBLIC_APP_URL=https://kdlstore.com.br
NEXT_PUBLIC_STORE_URL=https://app.kdlstore.com.br
NEXT_PUBLIC_ADMIN_URL=https://admin.kdlstore.com.br
```

### `apps/store/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://app.kdlstore.com.br
NEXT_PUBLIC_LANDING_URL=https://kdlstore.com.br
```

### `apps/admin/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_ADMIN_URL=https://admin.kdlstore.com.br
```

---

*Este documento é atualizado automaticamente a cada commit significativo.*  
*Versão: 0.2.0 — Fase 2 Landing Page Completa*
