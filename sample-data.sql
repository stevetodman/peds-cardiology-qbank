-- Sample Data for Pediatric Cardiology QBank
-- Run this in Supabase SQL Editor to populate the database with test data
--
-- IMPORTANT: This will DELETE existing data and start fresh
-- Only run this if you want to reset all test data

-- =====================================================
-- CLEAN UP EXISTING DATA (in correct order to avoid FK violations)
-- =====================================================

DELETE FROM session_answers;
DELETE FROM sessions;
DELETE FROM question_options;
DELETE FROM questions;
DELETE FROM flashcards;
DELETE FROM categories;

-- Reset sequences
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE question_options_id_seq RESTART WITH 1;
ALTER SEQUENCE flashcards_id_seq RESTART WITH 1;

-- =====================================================
-- INSERT CATEGORIES
-- =====================================================

INSERT INTO categories (name) VALUES
  ('Congenital Heart Disease'),
  ('Arrhythmias'),
  ('Heart Failure'),
  ('Acquired Heart Disease');

-- =====================================================
-- INSERT QUESTIONS
-- =====================================================

INSERT INTO questions (category_id, question_text, explanation) VALUES
  (
    1, -- Congenital Heart Disease
    'What are the four components of Tetralogy of Fallot?',
    'Tetralogy of Fallot (TOF) consists of four main components: 1) Ventricular septal defect (VSD), 2) Right ventricular outflow tract obstruction (pulmonary stenosis), 3) Overriding aorta, 4) Right ventricular hypertrophy. TOF is the most common cyanotic congenital heart defect.'
  ),
  (
    1, -- Congenital Heart Disease
    'What is the most common congenital heart defect?',
    'Ventricular Septal Defect (VSD) is the most common congenital heart defect, accounting for approximately 25-30% of all congenital heart lesions. Small VSDs may close spontaneously, while larger defects may require surgical repair.'
  ),
  (
    1, -- Congenital Heart Disease
    'A newborn presents with weak femoral pulses, differential cyanosis, and a blood pressure difference between upper and lower extremities. What is the most likely diagnosis?',
    'This presentation is classic for Coarctation of the Aorta, which is a narrowing of the aorta typically occurring just distal to the left subclavian artery. The weak femoral pulses and blood pressure differential are pathognomonic findings.'
  );

-- =====================================================
-- INSERT QUESTION OPTIONS
-- =====================================================

-- Options for Question 1 (Tetralogy of Fallot)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (1, 'VSD, pulmonary stenosis, overriding aorta, RV hypertrophy', true),
  (1, 'ASD, pulmonary atresia, hypoplastic left heart, LV hypertrophy', false),
  (1, 'PDA, aortic stenosis, tricuspid atresia, RV hypertrophy', false),
  (1, 'VSD, aortic stenosis, overriding pulmonary artery, LV hypertrophy', false);

-- Options for Question 2 (Most common CHD)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (2, 'Ventricular Septal Defect (VSD)', true),
  (2, 'Atrial Septal Defect (ASD)', false),
  (2, 'Tetralogy of Fallot', false),
  (2, 'Patent Ductus Arteriosus (PDA)', false);

-- Options for Question 3 (Coarctation)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (3, 'Coarctation of the Aorta', true),
  (3, 'Interrupted Aortic Arch', false),
  (3, 'Patent Ductus Arteriosus', false),
  (3, 'Transposition of the Great Arteries', false);

-- =====================================================
-- INSERT FLASHCARDS
-- =====================================================

INSERT INTO flashcards (category_id, front_text, back_text) VALUES
  (
    1, -- Congenital Heart Disease
    'What is a "tet spell" and how is it managed?',
    'A hypercyanotic (tet) spell is a sudden increase in cyanosis in TOF patients. Management: 1) Knee-chest position, 2) Oxygen, 3) Morphine for sedation, 4) IV fluids, 5) Phenylephrine to increase systemic vascular resistance. Prevents shunting through VSD.'
  ),
  (
    2, -- Arrhythmias
    'What is the most common arrhythmia in children?',
    'Supraventricular Tachycardia (SVT) is the most common arrhythmia in children. Heart rate typically >220 bpm in infants or >180 bpm in children. Treatment: vagal maneuvers, adenosine if stable, synchronized cardioversion if unstable.'
  ),
  (
    1, -- Congenital Heart Disease
    'What is the significance of a continuous "machine-like" murmur?',
    'A continuous machine-like murmur is pathognomonic for Patent Ductus Arteriosus (PDA). Best heard at the left infraclavicular area. The murmur continues throughout systole and diastole due to continuous flow from aorta to pulmonary artery.'
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data was inserted correctly
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Questions:', COUNT(*) FROM questions
UNION ALL
SELECT 'Question Options:', COUNT(*) FROM question_options
UNION ALL
SELECT 'Flashcards:', COUNT(*) FROM flashcards;

-- Show questions with their categories
SELECT q.id, c.name as category, q.question_text
FROM questions q
JOIN categories c ON q.category_id = c.id
ORDER BY q.id;
