-- Sample Data for Pediatric Cardiology QBank
-- Run this in your Supabase SQL Editor to populate with test data

-- ============================================
-- SAMPLE QUESTIONS AND OPTIONS
-- ============================================

-- Question 1: Tetralogy of Fallot
INSERT INTO questions (question_text, explanation, subject, difficulty)
VALUES (
  'What are the four components of Tetralogy of Fallot?',
  'Tetralogy of Fallot consists of: 1) Ventricular septal defect (VSD), 2) Pulmonary stenosis, 3) Overriding aorta, and 4) Right ventricular hypertrophy. This is the most common cyanotic congenital heart disease presenting after the neonatal period.',
  'Congenital Heart Disease',
  'Medium'
) RETURNING id;

-- Add options for Question 1 (replace 1 with actual question_id if needed)
INSERT INTO question_options (question_id, option_text, is_correct)
VALUES
  ((SELECT id FROM questions WHERE question_text LIKE '%Tetralogy of Fallot%' LIMIT 1), 'VSD, pulmonary stenosis, overriding aorta, RV hypertrophy', true),
  ((SELECT id FROM questions WHERE question_text LIKE '%Tetralogy of Fallot%' LIMIT 1), 'ASD, pulmonary atresia, transposed great vessels, LV hypertrophy', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%Tetralogy of Fallot%' LIMIT 1), 'VSD, aortic stenosis, patent ductus arteriosus, biventricular hypertrophy', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%Tetralogy of Fallot%' LIMIT 1), 'ASD, tricuspid atresia, overriding pulmonary artery, RV hypertrophy', false);

-- Question 2: VSD
INSERT INTO questions (question_text, explanation, subject, difficulty)
VALUES (
  'What is the most common congenital heart defect?',
  'Ventricular septal defect (VSD) is the most common congenital heart defect, accounting for 30-40% of all cases. Most small VSDs close spontaneously in the first year of life.',
  'Congenital Heart Disease',
  'Easy'
);

INSERT INTO question_options (question_id, option_text, is_correct)
VALUES
  ((SELECT id FROM questions WHERE question_text LIKE '%most common congenital%' LIMIT 1), 'Ventricular Septal Defect (VSD)', true),
  ((SELECT id FROM questions WHERE question_text LIKE '%most common congenital%' LIMIT 1), 'Atrial Septal Defect (ASD)', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%most common congenital%' LIMIT 1), 'Patent Ductus Arteriosus (PDA)', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%most common congenital%' LIMIT 1), 'Tetralogy of Fallot', false);

-- Question 3: Coarctation
INSERT INTO questions (question_text, explanation, subject, difficulty)
VALUES (
  'A newborn with decreased femoral pulses and hypertension in the upper extremities most likely has which condition?',
  'Coarctation of the aorta typically presents with upper extremity hypertension and decreased or absent femoral pulses due to narrowing of the aorta, usually near the ductus arteriosus.',
  'Congenital Heart Disease',
  'Medium'
);

INSERT INTO question_options (question_id, option_text, is_correct)
VALUES
  ((SELECT id FROM questions WHERE question_text LIKE '%decreased femoral pulses%' LIMIT 1), 'Coarctation of the aorta', true),
  ((SELECT id FROM questions WHERE question_text LIKE '%decreased femoral pulses%' LIMIT 1), 'Patent ductus arteriosus', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%decreased femoral pulses%' LIMIT 1), 'Aortic stenosis', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%decreased femoral pulses%' LIMIT 1), 'Pulmonary stenosis', false);

-- Question 4: ASD
INSERT INTO questions (question_text, explanation, subject, difficulty)
VALUES (
  'Which physical exam finding is characteristic of an atrial septal defect (ASD)?',
  'ASD typically presents with a fixed split S2 heart sound that does not vary with respiration. This occurs because the ASD equalizes pressures between the atria throughout the respiratory cycle.',
  'Congenital Heart Disease',
  'Medium'
);

INSERT INTO question_options (question_id, option_text, is_correct)
VALUES
  ((SELECT id FROM questions WHERE question_text LIKE '%characteristic of an atrial septal%' LIMIT 1), 'Fixed split S2', true),
  ((SELECT id FROM questions WHERE question_text LIKE '%characteristic of an atrial septal%' LIMIT 1), 'Holosystolic murmur at the apex', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%characteristic of an atrial septal%' LIMIT 1), 'Continuous machinery murmur', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%characteristic of an atrial septal%' LIMIT 1), 'Diastolic rumble', false);

-- Question 5: Kawasaki Disease
INSERT INTO questions (question_text, explanation, subject, difficulty)
VALUES (
  'A 3-year-old with 5 days of fever, bilateral conjunctivitis, strawberry tongue, and a polymorphous rash should be treated with:',
  'This presentation is classic for Kawasaki disease. Treatment includes IVIG and aspirin to reduce the risk of coronary artery aneurysms. Treatment should be initiated within 10 days of fever onset.',
  'Acquired Heart Disease',
  'Easy'
);

INSERT INTO question_options (question_id, option_text, is_correct)
VALUES
  ((SELECT id FROM questions WHERE question_text LIKE '%strawberry tongue%' LIMIT 1), 'IVIG and aspirin', true),
  ((SELECT id FROM questions WHERE question_text LIKE '%strawberry tongue%' LIMIT 1), 'Antibiotics only', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%strawberry tongue%' LIMIT 1), 'Corticosteroids only', false),
  ((SELECT id FROM questions WHERE question_text LIKE '%strawberry tongue%' LIMIT 1), 'Observation only', false);

-- ============================================
-- SAMPLE FLASHCARDS
-- ============================================

INSERT INTO flashcards (front_text, back_text, category)
VALUES
  ('What are the 4 components of Tetralogy of Fallot?',
   '1. VSD (Ventricular Septal Defect)\n2. Pulmonary stenosis\n3. Overriding aorta\n4. Right ventricular hypertrophy',
   'Congenital Heart Disease'),

  ('What is the "egg on a string" appearance on chest X-ray?',
   'Transposition of the great arteries (TGA). The narrow mediastinum creates an egg-shaped cardiac silhouette.',
   'Congenital Heart Disease'),

  ('What medication is used to keep the ductus arteriosus open?',
   'Prostaglandin E1 (PGE1) - used in ductal-dependent cardiac lesions',
   'Congenital Heart Disease'),

  ('What are the diagnostic criteria for Kawasaki disease?',
   'Fever ≥5 days PLUS 4 of 5:\n1. Bilateral conjunctivitis\n2. Oral changes (strawberry tongue, cracked lips)\n3. Polymorphous rash\n4. Extremity changes (edema, erythema, peeling)\n5. Cervical lymphadenopathy (>1.5cm)',
   'Acquired Heart Disease'),

  ('What is the most common cause of heart failure in the first week of life?',
   'Hypoplastic left heart syndrome (HLHS)',
   'Congenital Heart Disease'),

  ('What murmur is described as "machinery-like"?',
   'Patent ductus arteriosus (PDA) - continuous murmur',
   'Congenital Heart Disease');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify data was inserted:
-- SELECT COUNT(*) FROM questions;
-- SELECT COUNT(*) FROM question_options;
-- SELECT COUNT(*) FROM flashcards;

-- View all questions with their options:
-- SELECT
--   q.id,
--   q.question_text,
--   q.subject,
--   array_agg(qo.option_text || ' (' || CASE WHEN qo.is_correct THEN 'CORRECT' ELSE 'incorrect' END || ')') as options
-- FROM questions q
-- JOIN question_options qo ON q.id = qo.question_id
-- GROUP BY q.id, q.question_text, q.subject;
