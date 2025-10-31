-- Add categories for pediatric cardiology
-- Run this in Supabase SQL Editor

-- Insert categories
INSERT INTO categories (name)
VALUES
  ('Congenital Heart Disease'),
  ('Arrhythmias'),
  ('Heart Failure'),
  ('Acquired Heart Disease')
ON CONFLICT (name) DO NOTHING;

-- Update existing questions with category_id
-- Assuming questions 1-3 are about congenital heart disease
UPDATE questions
SET category_id = (SELECT id FROM categories WHERE name = 'Congenital Heart Disease')
WHERE category_id IS NULL;

-- Verify the update
SELECT q.id, q.question_text, c.name as category
FROM questions q
LEFT JOIN categories c ON q.category_id = c.id
ORDER BY q.id;
