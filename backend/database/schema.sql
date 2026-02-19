-- OpenMindWell Database Schema
-- PostgreSQL 15+ with Row Level Security (RLS)
-- Apply this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLES
-- ========================================

-- Profiles table (user information)
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  is_moderator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table (chat rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (chat messages with crisis detection)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname VARCHAR(50), -- Denormalized for chat history
  content TEXT NOT NULL,
  risk_level VARCHAR(20) DEFAULT 'none' CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table (private journaling)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  mood INT CHECK (mood >= 1 AND mood <= 5),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits table (user habits)
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit logs table (habit completion tracking)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Resources table (mental health resources)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('hotline', 'article', 'exercise', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table (user reports for moderation)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteers table (moderators/peer supporters)
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'moderator',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Rooms policies (public read)
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  USING (TRUE);

-- Messages policies
CREATE POLICY "Users can view messages in any room"
  ON messages FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Journal entries policies (completely private)
CREATE POLICY "Users can only view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Resources policies (public read, admin write)
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  USING (TRUE);

-- Reports policies
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Moderators can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE volunteers.user_id = auth.uid()
      AND volunteers.is_active = TRUE
    )
  );

-- Volunteers policies
CREATE POLICY "Users can view active volunteers"
  ON volunteers FOR SELECT
  USING (is_active = TRUE);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_risk_level ON messages(risk_level) WHERE risk_level IN ('high', 'critical');
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-update updated_at for journal entries
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SEED DATA
-- ========================================

-- Insert default rooms
INSERT INTO rooms (id, name, description, category) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Anxiety Support', 'A safe space to discuss anxiety, panic attacks, and coping strategies', 'anxiety'),
  ('22222222-2222-2222-2222-222222222222', 'Depression Support', 'Share experiences and find understanding about depression', 'depression'),
  ('33333333-3333-3333-3333-333333333333', 'PTSD & Trauma', 'Support for those dealing with trauma and PTSD', 'trauma'),
  ('44444444-4444-4444-4444-444444444444', 'General Wellness', 'Discuss mental health, self-care, and daily challenges', 'general'),
  ('55555555-5555-5555-5555-555555555555', 'Student Support', 'Mental health support specifically for students', 'students'),
  ('66666666-6666-6666-6666-666666666666', 'Grief & Loss', 'Find support while grieving and processing loss', 'grief')
ON CONFLICT (id) DO NOTHING;

-- Insert default resources
INSERT INTO resources (title, description, url, category) VALUES
  (
    '988 Suicide & Crisis Lifeline',
    'Free, confidential 24/7 support for people in distress. Call or text 988.',
    'https://988lifeline.org',
    'hotline'
  ),
  (
    'Crisis Text Line',
    'Free 24/7 crisis support via text. Text HOME to 741741.',
    'https://www.crisistextline.org',
    'hotline'
  ),
  (
    'International Helplines',
    'Find crisis helplines in your country.',
    'https://findahelpline.com',
    'hotline'
  ),
  (
    'NAMI - National Alliance on Mental Illness',
    'Education, support, and advocacy for mental health.',
    'https://www.nami.org',
    'article'
  ),
  (
    '4-7-8 Breathing Exercise',
    'A simple breathing technique to reduce anxiety and promote calm.',
    'https://www.healthline.com/health/4-7-8-breathing',
    'exercise'
  ),
  (
    'Progressive Muscle Relaxation',
    'Learn to release physical tension and mental stress.',
    'https://www.anxietycanada.com/articles/progressive-muscle-relaxation/',
    'exercise'
  ),
  (
    'Grounding Techniques for Anxiety',
    '5-4-3-2-1 method and other grounding exercises.',
    'https://www.urmc.rochester.edu/behavioral-health-partners/bhp-blog/april-2018/5-4-3-2-1-coping-technique-for-anxiety.aspx',
    'article'
  ),
  (
    'Mental Health America Resources',
    'Screening tools, peer support, and educational materials.',
    'https://www.mhanational.org',
    'article'
  )
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Count tables (should return 9)
-- SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check seed data
-- SELECT COUNT(*) FROM rooms; -- Should be 6
-- SELECT COUNT(*) FROM resources; -- Should be 8
