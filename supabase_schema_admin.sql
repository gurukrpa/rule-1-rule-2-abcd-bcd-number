-- Schema for admin login and rule data

-- Administrators table referencing Supabase auth users
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- User list with username, total hours and day count
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  total_hours integer not null check (total_hours between 1 and 10),
  day_count integer not null,
  created_at timestamp with time zone default now()
);

-- Daily information per user
create table if not exists day_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  entry_date date not null,
  total_hour integer not null,
  excel_file_url text,
  planet_selections jsonb,
  created_at timestamp with time zone default now(),
  unique(user_id, entry_date)
);

-- Rule data stored in JSON for IndexPage, Rule-1 and Rule-2
create table if not exists rule_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  entry_date date not null,
  rule_type text check (rule_type in ('index','rule1','rule2')),
  data jsonb not null,
  created_at timestamp with time zone default now()
);
