# KDL Store - Contexto de Desenvolvimento (AI_CONTEXT)

Este documento foi preparado para orientar futuros agentes de Inteligência Artificial ou desenvolvedores que trabalharão no projeto **KDL Store**, fornecendo um resumo do stack, regras de negócio arquiteturais e peculiaridades importantes do sistema.

## 1. Visão Geral do Projeto
A KDL Store é um ERP e PDV focado em lojas de som automotivo e eletrônicos, operando no modelo SaaS (Software as a Service) Multi-Tenant.
O sistema é gerido no frontend via React (Next.js App Router) e no backend pelo Supabase (PostgreSQL + Auth + RLS).

## 2. Tech Stack & Ferramentas
* **Framework:** Next.js 14+ (App Router, diretório `apps/store/app/`)
* **Linguagem:** TypeScript
* **Estilização:** Vanilla CSS (`globals.css` com design system baseado em variáveis CSS `--kdl-*`). **Não** utiliza TailwindCSS.
* **Backend & Database:** Supabase (Client-side usage `@supabase/supabase-js`)
* **Gerenciamento de Pacotes:** `pnpm` gerenciando um monorepo via Turborepo (`apps/store` e `packages/`).

## 3. Arquitetura de Banco de Dados e Multi-Tenancy (CRÍTICO)
* O banco de dados funciona no paradigma **RLS (Row Level Security)**. Quase todas as tabelas possuem a coluna `tenant_id` (que referencia a tabela `tenants`).
* **Sempre** que realizar um `insert` ou `select` global no Supabase via cliente, deve-se explicitar ou garantir que o `tenant_id` esteja sendo manuseado, embora o RLS proteja vazamentos.
* A estrutura completa e atualizada do banco de dados encontra-se em `docs/schema.sql`. Antes de sugerir criação de tabelas, **consulte o schema.sql**.

## 4. Padrão de Auto-Healing (Anti-Cache) Supabase
Ao interagir com a API REST do Supabase via `@supabase/supabase-js`, o banco frequentemente sofre de "Schema Cache Delay" quando colunas novas são adicionadas (ex: erro `400 Bad Request: column "X" of relation "Y" does not exist`).
* **Padrão adotado no projeto:** Quase todas as funções de `save()` (ex: clientes, fornecedores, OS, garantias) possuem um loop `while (!success && attempts < 5)` com um regex que extrai o nome da coluna ausente do `res.error.message`, deleta essa propriedade do payload e tenta novamente (`delete payload[match[1]]`).
* Ao escrever novas rotinas de inserção de dados, **implemente esse fallback de auto-healing** para garantir a estabilidade.

## 5. Regras de Negócio Implementadas Recentemente
* **Estoque (Movimentação Avançada):** Há uma distinção clara entre "Ajuste/Perda" (para corrigir erros de inventário) e "Entrada de Mercadoria" (compras de fornecedor, que recebem `unit_cost`, `supplier_id` e criam lançamentos automáticos na tabela `accounts_payable`).
* **Fornecedores (Pedidos):** Pedidos aos fornecedores geram múltiplos registros na tabela `supplier_orders` (um para cada item), com as informações estimadas salvas em JSON na coluna `notes`. Isso permite receber os itens de forma parcial.
* **Garantias & OS:** O acionamento de uma garantia na tela respectiva cria automaticamente uma Ordem de Serviço na tela de `OS`.
* **WhatsApp Integration:** O fluxo de comunicação via WhatsApp não engatilha ações automáticas do banco, eles são botões `<a href="https://wa.me/...">` estáticos criados baseados nas rotinas já salvas, evitando perda de estado.

## 6. Diretrizes de UI/UX
* O projeto exige um nível altíssimo de estética "Premium".
* Botões utilizam as classes `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, etc.
* Ícones soltos de ações sempre devem ser envelopados com um atributo `title="Ação..."` para acessibilidade e UX (Tooltips).
* Tabelas são envolvidas na div `<div className="table-wrapper">`.

## 7. Como Continuar o Trabalho
Ao ler este documento, a nova IA deve:
1. Ler o arquivo `docs/schema.sql` para memorizar a estrutura relacional atual.
2. Identificar em qual página do diretório `apps/store/app/app/` o usuário quer trabalhar.
3. Seguir o padrão de estado e design já estabelecido, não reescrevendo em Tailwind ou adicionando dependências pesadas de terceiros sem aviso prévio.
