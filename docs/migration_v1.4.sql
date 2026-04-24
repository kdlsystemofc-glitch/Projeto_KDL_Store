-- ============================================================
-- KDL Store — Migration v1.4
-- Execute no SQL Editor do Supabase (safe to re-run: IF NOT EXISTS)
-- ============================================================

-- Clientes: campos usados na UI mas ausentes no schema original
alter table customers add column if not exists phone2    text;
alter table customers add column if not exists birthday  date;
