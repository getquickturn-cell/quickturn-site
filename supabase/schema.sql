-- QuickTurn database (run once in Supabase > SQL Editor)
-- Team workspace: every invited, signed-in user (Aaron, Danny) shares the same data.
-- Public sign-ups are OFF, so "authenticated" = invited team members only.

create table if not exists public.mechanics (
  id          text primary key,
  data        jsonb not null,               -- profile: business name, rates, phone, etc.
  sms_phone   text,                         -- normalized +1XXXXXXXXXX the mechanic texts from
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid()
);

create table if not exists public.invoices (
  id          text primary key,
  mechanic_id text references public.mechanics(id) on delete cascade,
  number      integer,
  status      text not null default 'Draft',
  total       numeric(12,2) not null default 0,
  data        jsonb not null,               -- the job: customer, unit, hours, parts...
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid()
);
create index if not exists invoices_mechanic_idx on public.invoices (mechanic_id, number desc);

-- Texts that mechanics send to the QuickTurn number (written by the sms-inbound function).
create table if not exists public.inbound_messages (
  id          bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  from_phone  text not null,
  mechanic_id text references public.mechanics(id) on delete set null,
  body        text,
  media       jsonb not null default '[]'::jsonb,   -- [{url, content_type}]
  status      text not null default 'new',          -- new | used | ignored
  invoice_id  text references public.invoices(id) on delete set null,
  twilio_sid  text unique
);
create index if not exists inbound_recent_idx on public.inbound_messages (status, received_at desc);

alter table public.mechanics        enable row level security;
alter table public.invoices         enable row level security;
alter table public.inbound_messages enable row level security;

drop policy if exists "team all mechanics" on public.mechanics;
create policy "team all mechanics" on public.mechanics for all to authenticated using (true) with check (true);

drop policy if exists "team all invoices" on public.invoices;
create policy "team all invoices" on public.invoices for all to authenticated using (true) with check (true);

drop policy if exists "team read messages" on public.inbound_messages;
create policy "team read messages" on public.inbound_messages for select to authenticated using (true);
drop policy if exists "team update messages" on public.inbound_messages;
create policy "team update messages" on public.inbound_messages for update to authenticated using (true) with check (true);
-- Inserts come only from the sms-inbound function (service role bypasses RLS).
