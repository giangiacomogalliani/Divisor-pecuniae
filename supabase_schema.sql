-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Groups Table
create table groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  currency text not null default 'EUR',
  invite_code text unique default substr(md5(random()::text), 0, 7),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users Table
create table users (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expenses Table
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  paid_by jsonb not null, -- Store as JSON: { "user_id": amount }
  split_details jsonb not null, -- Store as JSON: { "user_id": amount }
  category text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories Table (Optional, if we want custom categories per group)
create table categories (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  label text not null,
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Open for now for simplicity, can be tightened later)
alter table groups enable row level security;
alter table users enable row level security;
alter table expenses enable row level security;
alter table categories enable row level security;

create policy "Enable all access for all users" on groups for all using (true);
create policy "Enable all access for all users" on users for all using (true);
create policy "Enable all access for all users" on expenses for all using (true);
create policy "Enable all access for all users" on categories for all using (true);
