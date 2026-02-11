-- Create a table to store user data (JSON blob)
create table user_data (
  user_id uuid references auth.users not null primary key,
  data jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
alter table user_data enable row level security;

-- Policy: Users can only view their own data
create policy "Users can view their own data" on user_data
  for select using (auth.uid() = user_id);

-- Policy: Users can insert their own data
create policy "Users can insert their own data" on user_data
  for insert with check (auth.uid() = user_id);

-- Policy: Users can update their own data
create policy "Users can update their own data" on user_data
  for update using (auth.uid() = user_id);
