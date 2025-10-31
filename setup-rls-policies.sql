-- Row Level Security (RLS) Policies Setup
-- Run this in Supabase SQL Editor after creating your tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- QUESTIONS & OPTIONS (READ-ONLY FOR USERS)
-- ============================================

CREATE POLICY "Authenticated users can read questions"
ON questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read question_options"
ON question_options FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON sessions FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- SESSION ANSWERS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own answers"
ON session_answers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
ON session_answers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
ON session_answers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers"
ON session_answers FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- NOTES TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
ON notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- STUDY PLAN TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own study plan"
ON study_plan FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study plan"
ON study_plan FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study plan"
ON study_plan FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study plan"
ON study_plan FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FLASHCARDS TABLE POLICIES
-- ============================================

CREATE POLICY "Authenticated users can read flashcards"
ON flashcards FOR SELECT
TO authenticated
USING (true);

-- Optional: Allow users to create their own flashcards
-- CREATE POLICY "Users can insert flashcards"
-- ON flashcards FOR INSERT
-- WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_answers_user_id ON session_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_session_answers_session_id ON session_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_user_id ON study_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that RLS is enabled on all tables:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Check all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
