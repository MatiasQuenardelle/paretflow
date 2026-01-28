-- Create tasks table to store user tasks
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null, -- Stores the full task array as JSON
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create unique constraint so each user has only one row
create unique index if not exists tasks_user_id_idx on public.tasks(user_id);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policy: Users can only see their own tasks
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own tasks
create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
drop trigger if exists on_tasks_updated on public.tasks;
create trigger on_tasks_updated
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();
