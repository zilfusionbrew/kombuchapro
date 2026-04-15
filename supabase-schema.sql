-- KombuchaPro — Schéma Supabase
-- Copiez ce SQL dans Supabase > SQL Editor > New query > Run

-- Table batches
create table if not exists batches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  vol numeric default 50,
  phase text default 'F1',
  tea text,
  sugar numeric default 70,
  day_target integer default 10,
  temp_target numeric default 24,
  arome text,
  notes text,
  created_at timestamptz default now()
);

-- Table measures
create table if not exists measures (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  batch_id uuid references batches(id) on delete cascade not null,
  date date not null,
  phase text,
  ph numeric,
  brix numeric,
  temp numeric,
  day integer,
  notes text,
  created_at timestamptz default now()
);

-- Table recipes
create table if not exists recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text default '🍵',
  tea text,
  sugar numeric default 70,
  f2_ingredients text,
  f2_sugar numeric default 8,
  notes text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Row Level Security (chaque user voit ses données)
alter table batches enable row level security;
alter table measures enable row level security;
alter table recipes enable row level security;

create policy "Users see own batches" on batches for all using (auth.uid() = user_id);
create policy "Users see own measures" on measures for all using (auth.uid() = user_id);
create policy "Users see own recipes" on recipes for all using (auth.uid() = user_id);
