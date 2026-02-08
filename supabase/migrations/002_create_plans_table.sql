-- Create plans table to store user plans
-- Run this in your Supabase SQL editor

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null, -- Stores the full plan object as JSON
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create unique constraint so each user has only one row
create unique index if not exists plans_user_id_idx on public.plans(user_id);

-- Enable RLS
alter table public.plans enable row level security;

-- Policy: Users can only see their own plan
create policy "Users can view own plan"
  on public.plans for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own plan
create policy "Users can insert own plan"
  on public.plans for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own plan
create policy "Users can update own plan"
  on public.plans for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own plan
create policy "Users can delete own plan"
  on public.plans for delete
  using (auth.uid() = user_id);

-- Trigger for updated_at (reuse existing handle_updated_at function)
drop trigger if exists on_plans_updated on public.plans;
create trigger on_plans_updated
  before update on public.plans
  for each row execute procedure public.handle_updated_at();
