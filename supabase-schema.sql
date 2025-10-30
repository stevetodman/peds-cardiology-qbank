-- UWorld-Style QBank Platform Database Schema
--
-- This SQL file contains the complete database schema for the QBank platform.
-- Execute this in your Supabase SQL editor to set up the database.

-- =====================================================
-- TABLES
-- =====================================================

-- Table: profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: categories (e.g. subjects/topics for questions/flashcards)
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Table: questions (QBank questions)
CREATE TABLE IF NOT EXISTS public.questions (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES public.categories (id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: question_options (multiple-choice options for each question)
CREATE TABLE IF NOT EXISTS public.question_options (
  id SERIAL PRIMARY KEY,
  question_id INT REFERENCES public.questions (id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table: sessions (a practice test session per user)
CREATE TABLE IF NOT EXISTS public.sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_questions INT,
  correct_count INT
);

-- Table: session_answers (answers to questions in a session)
CREATE TABLE IF NOT EXISTS public.session_answers (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES public.sessions (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  question_id INT REFERENCES public.questions (id),
  selected_option_id INT REFERENCES public.question_options (id),
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: flashcards (flashcard items for study)
CREATE TABLE IF NOT EXISTS public.flashcards (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES public.categories (id) ON DELETE SET NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL
);

-- Table: study_plan (user's study tasks)
CREATE TABLE IF NOT EXISTS public.study_plan (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: notes (user's personal notes)
CREATE TABLE IF NOT EXISTS public.notes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  question_id INT REFERENCES public.questions (id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Profiles: each user can access only their own profile
CREATE POLICY "Allow individual to read their profile"
  ON public.profiles FOR SELECT
  USING ( id = auth.uid() );

CREATE POLICY "Allow individual to update their profile"
  ON public.profiles FOR UPDATE
  USING ( id = auth.uid() )
  WITH CHECK ( id = auth.uid() );

CREATE POLICY "Allow individual to insert their profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( id = auth.uid() );

-- Categories: allow any authenticated user to read categories
CREATE POLICY "Authenticated can read categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING ( true );

-- Questions: allow any authenticated user to read questions
CREATE POLICY "Authenticated can read questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING ( true );

-- Question Options: allow read for authenticated
CREATE POLICY "Authenticated can read question options"
  ON public.question_options FOR SELECT
  TO authenticated
  USING ( true );

-- Sessions: users can only access their own sessions
CREATE POLICY "User can read own sessions"
  ON public.sessions FOR SELECT
  USING ( user_id = auth.uid() );

CREATE POLICY "User can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can update own sessions"
  ON public.sessions FOR UPDATE
  USING ( user_id = auth.uid() )
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can delete own sessions"
  ON public.sessions FOR DELETE
  USING ( user_id = auth.uid() );

-- Session Answers: users can access only their own answers
CREATE POLICY "User can read own session_answers"
  ON public.session_answers FOR SELECT
  USING ( user_id = auth.uid() );

CREATE POLICY "User can insert own session_answers"
  ON public.session_answers FOR INSERT
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can update own session_answers"
  ON public.session_answers FOR UPDATE
  USING ( user_id = auth.uid() )
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can delete own session_answers"
  ON public.session_answers FOR DELETE
  USING ( user_id = auth.uid() );

-- Flashcards: allow all authenticated users to read flashcards
CREATE POLICY "Authenticated can read flashcards"
  ON public.flashcards FOR SELECT
  TO authenticated
  USING ( true );

-- Study Plan: user can CRUD their own plan items
CREATE POLICY "User can read own study_plan"
  ON public.study_plan FOR SELECT
  USING ( user_id = auth.uid() );

CREATE POLICY "User can insert own study_plan"
  ON public.study_plan FOR INSERT
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can update own study_plan"
  ON public.study_plan FOR UPDATE
  USING ( user_id = auth.uid() )
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can delete own study_plan"
  ON public.study_plan FOR DELETE
  USING ( user_id = auth.uid() );

-- Notes: user can CRUD their own notes
CREATE POLICY "User can read own notes"
  ON public.notes FOR SELECT
  USING ( user_id = auth.uid() );

CREATE POLICY "User can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can update own notes"
  ON public.notes FOR UPDATE
  USING ( user_id = auth.uid() )
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "User can delete own notes"
  ON public.notes FOR DELETE
  USING ( user_id = auth.uid() );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_question_options_question ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_answers_session ON public.session_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_session_answers_user ON public.session_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_user ON public.study_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON public.flashcards(category_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles(id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
