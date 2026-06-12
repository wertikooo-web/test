create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  answers jsonb not null,
  score integer not null,
  profile_type text not null,
  barriers text[] not null default '{}',
  expectations text[] not null default '{}'
);

alter table public.responses enable row level security;

create policy "Allow public insert responses"
on public.responses for insert
to anon
with check (true);

create policy "Allow public read responses"
on public.responses for select
to anon
using (true);

create policy "Allow public delete responses"
on public.responses for delete
to anon
using (true);
