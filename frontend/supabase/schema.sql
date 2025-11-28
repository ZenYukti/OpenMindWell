-- OpenMindWell Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_seed text default uuid_generate_v4()::text,
  bio text,
  is_online boolean default false,
  last_seen timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'user_' || substr(md5(random()::text), 0, 8),
    'Anonymous ' || substr(md5(random()::text), 0, 4)
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- CHAT ROOMS TABLE
-- ============================================
create table if not exists public.chat_rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  topic text default 'general',
  icon text default '💬',
  color text default '#6366f1',
  is_private boolean default false,
  is_active boolean default true,
  created_by uuid references public.profiles(id),
  member_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.chat_rooms enable row level security;

-- Policies
create policy "Chat rooms are viewable by everyone"
  on public.chat_rooms for select
  using (true);

create policy "Authenticated users can create rooms"
  on public.chat_rooms for insert
  with check (auth.uid() is not null);

create policy "Room creators can update their rooms"
  on public.chat_rooms for update
  using (auth.uid() = created_by);

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_flagged boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies
create policy "Messages are viewable by everyone"
  on public.messages for select
  using (true);

create policy "Authenticated users can insert messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================
create table if not exists public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  content text not null,
  mood integer check (mood >= 1 and mood <= 5),
  tags text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.journal_entries enable row level security;

-- Policies (PRIVATE - only owner can access)
create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- ============================================
-- HABITS TABLE
-- ============================================
create table if not exists public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  emoji text default '✨',
  color text default '#10b981',
  frequency text default 'daily', -- daily, weekly, etc.
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.habits enable row level security;

-- Policies
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- ============================================
-- HABIT LOGS TABLE
-- ============================================
create table if not exists public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date not null,
  completed_at timestamp with time zone default now(),
  unique(habit_id, date)
);

-- Enable RLS
alter table public.habit_logs enable row level security;

-- Policies
create policy "Users can view own habit logs"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own habit logs"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own habit logs"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

-- ============================================
-- MOOD ENTRIES TABLE
-- ============================================
create table if not exists public.mood_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood_score integer not null check (mood_score >= 1 and mood_score <= 5),
  energy_level integer default 3 check (energy_level >= 1 and energy_level <= 5),
  anxiety_level integer default 3 check (anxiety_level >= 1 and anxiety_level <= 5),
  notes text,
  tags text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.mood_entries enable row level security;

-- Policies
create policy "Users can view own mood entries"
  on public.mood_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own mood entries"
  on public.mood_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own mood entries"
  on public.mood_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own mood entries"
  on public.mood_entries for delete
  using (auth.uid() = user_id);

-- ============================================
-- ROOM MEMBERS TABLE (for private rooms)
-- ============================================
create table if not exists public.room_members (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member', -- member, moderator, admin
  joined_at timestamp with time zone default now(),
  unique(room_id, user_id)
);

-- Enable RLS
alter table public.room_members enable row level security;

-- Policies
create policy "Room members are viewable"
  on public.room_members for select
  using (true);

create policy "Users can join rooms"
  on public.room_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave rooms"
  on public.room_members for delete
  using (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_messages_room_id on public.messages(room_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_journal_entries_user_id on public.journal_entries(user_id);
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habit_logs_habit_id on public.habit_logs(habit_id);
create index if not exists idx_habit_logs_date on public.habit_logs(date);
create index if not exists idx_mood_entries_user_id on public.mood_entries(user_id);
create index if not exists idx_mood_entries_created_at on public.mood_entries(created_at desc);

-- ============================================
-- SEED DATA: Default Chat Rooms
-- ============================================
insert into public.chat_rooms (name, description, topic, icon) values
  ('General Support', 'A welcoming space to share and listen. No judgment, just support.', 'general', '💚'),
  ('Anxiety Corner', 'For those dealing with anxiety. Share coping strategies and support.', 'anxiety', '🌊'),
  ('Depression Support', 'A safe space to talk about depression. You''re not alone.', 'depression', '☀️'),
  ('Stress Relief', 'Let it out. Share what''s stressing you and find some peace.', 'stress', '🧘'),
  ('Relationship Talk', 'Discuss relationship challenges and get peer support.', 'relationships', '💕'),
  ('Late Night Thoughts', 'For those quiet hours when sleep won''t come.', 'general', '🌙')
on conflict do nothing;

-- ============================================
-- Enable Anonymous Auth in Supabase Dashboard
-- ============================================
-- Go to Authentication > Providers > Anonymous Users > Enable

-- ============================================
-- Configure Realtime
-- ============================================
-- Make sure messages table has realtime enabled (done above)
