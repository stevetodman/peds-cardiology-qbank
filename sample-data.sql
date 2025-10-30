-- Pediatric Cardiology sample content
-- Run inside the Supabase SQL editor after applying supabase-schema.sql

BEGIN;

-- Categories (idempotent)
INSERT INTO public.categories (name) VALUES
  ('Tetralogy of Fallot'),
  ('Ventricular Septal Defect'),
  ('Atrial Septal Defect'),
  ('Coarctation of the Aorta'),
  ('Kawasaki Disease')
ON CONFLICT (name) DO NOTHING;

-- Question 1: Tetralogy of Fallot hypercyanotic spell management
WITH category AS (
  SELECT id FROM public.categories WHERE name = 'Tetralogy of Fallot'
), existing_question AS (
  SELECT id FROM public.questions
  WHERE question_text = 'A 6-month-old with known Tetralogy of Fallot develops sudden cyanosis and irritability after crying. What is the most appropriate immediate intervention?'
), inserted_question AS (
  INSERT INTO public.questions (category_id, question_text, explanation)
  SELECT id,
         'A 6-month-old with known Tetralogy of Fallot develops sudden cyanosis and irritability after crying. What is the most appropriate immediate intervention?',
         'Hypercyanotic (tet) spells improve with knee-chest positioning, which increases systemic vascular resistance and reduces right-to-left shunting.'
  FROM category
  WHERE NOT EXISTS (SELECT 1 FROM existing_question)
  RETURNING id
), target_question AS (
  SELECT id FROM inserted_question
  UNION ALL
  SELECT id FROM existing_question
)
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT tq.id, option_text, is_correct
FROM target_question tq
CROSS JOIN LATERAL (
  VALUES
    ('Administer intravenous propranolol', FALSE),
    ('Apply knee-chest positioning', TRUE),
    ('Give supplemental oxygen only', FALSE),
    ('Intubate and hyperventilate immediately', FALSE)
) AS v(option_text, is_correct)
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_options qo
  WHERE qo.question_id = tq.id AND qo.option_text = v.option_text
);

-- Question 2: Ventricular septal defect management
WITH category AS (
  SELECT id FROM public.categories WHERE name = 'Ventricular Septal Defect'
), existing_question AS (
  SELECT id FROM public.questions
  WHERE question_text = 'A 2-month-old infant has a harsh holosystolic murmur at the left lower sternal border, poor feeding, and tachypnea. Echocardiogram confirms a large ventricular septal defect. What is the next best step in management?'
), inserted_question AS (
  INSERT INTO public.questions (category_id, question_text, explanation)
  SELECT id,
         'A 2-month-old infant has a harsh holosystolic murmur at the left lower sternal border, poor feeding, and tachypnea. Echocardiogram confirms a large ventricular septal defect. What is the next best step in management?',
         'Symptomatic large VSDs causing heart failure in infants are treated initially with medical therapy such as furosemide to control volume overload before considering surgical closure.'
  FROM category
  WHERE NOT EXISTS (SELECT 1 FROM existing_question)
  RETURNING id
), target_question AS (
  SELECT id FROM inserted_question
  UNION ALL
  SELECT id FROM existing_question
)
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT tq.id, option_text, is_correct
FROM target_question tq
CROSS JOIN LATERAL (
  VALUES
    ('Begin furosemide therapy', TRUE),
    ('Schedule immediate surgical repair', FALSE),
    ('Start prostaglandin E1 infusion', FALSE),
    ('Observe and re-evaluate at 1 year', FALSE)
) AS v(option_text, is_correct)
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_options qo
  WHERE qo.question_id = tq.id AND qo.option_text = v.option_text
);

-- Question 3: Atrial septal defect clinical finding
WITH category AS (
  SELECT id FROM public.categories WHERE name = 'Atrial Septal Defect'
), existing_question AS (
  SELECT id FROM public.questions
  WHERE question_text = 'A 5-year-old girl is evaluated for fatigue and frequent respiratory infections. Physical exam reveals a systolic ejection murmur at the left upper sternal border with a widely split, fixed S2. What additional finding is most consistent with this diagnosis?'
), inserted_question AS (
  INSERT INTO public.questions (category_id, question_text, explanation)
  SELECT id,
         'A 5-year-old girl is evaluated for fatigue and frequent respiratory infections. Physical exam reveals a systolic ejection murmur at the left upper sternal border with a widely split, fixed S2. What additional finding is most consistent with this diagnosis?',
         'An atrial septal defect typically produces increased pulmonary blood flow leading to right ventricular volume overload and right axis deviation on ECG.'
  FROM category
  WHERE NOT EXISTS (SELECT 1 FROM existing_question)
  RETURNING id
), target_question AS (
  SELECT id FROM inserted_question
  UNION ALL
  SELECT id FROM existing_question
)
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT tq.id, option_text, is_correct
FROM target_question tq
CROSS JOIN LATERAL (
  VALUES
    ('Left ventricular hypertrophy on ECG', FALSE),
    ('Right axis deviation on ECG', TRUE),
    ('Bounding femoral pulses', FALSE),
    ('Differential cyanosis of lower extremities', FALSE)
) AS v(option_text, is_correct)
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_options qo
  WHERE qo.question_id = tq.id AND qo.option_text = v.option_text
);

-- Question 4: Coarctation of the aorta acute management
WITH category AS (
  SELECT id FROM public.categories WHERE name = 'Coarctation of the Aorta'
), existing_question AS (
  SELECT id FROM public.questions
  WHERE question_text = 'A 3-day-old neonate presents with poor feeding, lethargy, and absent femoral pulses. Blood pressure is 75/40 mm Hg in the right arm and 48/30 mm Hg in the legs. What is the most appropriate immediate management?'
), inserted_question AS (
  INSERT INTO public.questions (category_id, question_text, explanation)
  SELECT id,
         'A 3-day-old neonate presents with poor feeding, lethargy, and absent femoral pulses. Blood pressure is 75/40 mm Hg in the right arm and 48/30 mm Hg in the legs. What is the most appropriate immediate management?',
         'Critically ill neonates with ductal-dependent systemic blood flow require prostaglandin E1 infusion to reopen the ductus arteriosus before surgical repair.'
  FROM category
  WHERE NOT EXISTS (SELECT 1 FROM existing_question)
  RETURNING id
), target_question AS (
  SELECT id FROM inserted_question
  UNION ALL
  SELECT id FROM existing_question
)
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT tq.id, option_text, is_correct
FROM target_question tq
CROSS JOIN LATERAL (
  VALUES
    ('Administer intravenous prostaglandin E1', TRUE),
    ('Give high-dose intravenous furosemide', FALSE),
    ('Perform balloon angioplasty immediately', FALSE),
    ('Start propranolol to reduce gradient', FALSE)
) AS v(option_text, is_correct)
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_options qo
  WHERE qo.question_id = tq.id AND qo.option_text = v.option_text
);

-- Question 5: Kawasaki disease treatment
WITH category AS (
  SELECT id FROM public.categories WHERE name = 'Kawasaki Disease'
), existing_question AS (
  SELECT id FROM public.questions
  WHERE question_text = 'A 4-year-old boy has 6 days of fever, bilateral conjunctivitis, cracked lips, swollen hands, and a polymorphous rash. What is the most appropriate next step in management?'
), inserted_question AS (
  INSERT INTO public.questions (category_id, question_text, explanation)
  SELECT id,
         'A 4-year-old boy has 6 days of fever, bilateral conjunctivitis, cracked lips, swollen hands, and a polymorphous rash. What is the most appropriate next step in management?',
         'High-dose intravenous immunoglobulin with high-dose aspirin should be administered promptly to reduce the risk of coronary artery aneurysms in Kawasaki disease.'
  FROM category
  WHERE NOT EXISTS (SELECT 1 FROM existing_question)
  RETURNING id
), target_question AS (
  SELECT id FROM inserted_question
  UNION ALL
  SELECT id FROM existing_question
)
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT tq.id, option_text, is_correct
FROM target_question tq
CROSS JOIN LATERAL (
  VALUES
    ('Administer intravenous immunoglobulin and high-dose aspirin', TRUE),
    ('Begin high-dose corticosteroids alone', FALSE),
    ('Start low-dose aspirin and observe', FALSE),
    ('Treat with azithromycin for atypical pneumonia', FALSE)
) AS v(option_text, is_correct)
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_options qo
  WHERE qo.question_id = tq.id AND qo.option_text = v.option_text
);

-- Flashcards
INSERT INTO public.flashcards (category_id, front_text, back_text)
SELECT c.id,
       'Define the four anatomic components of Tetralogy of Fallot.',
       '1. Ventricular septal defect\n2. Overriding aorta\n3. Right ventricular outflow tract obstruction\n4. Right ventricular hypertrophy'
FROM public.categories c
WHERE c.name = 'Tetralogy of Fallot'
  AND NOT EXISTS (
    SELECT 1 FROM public.flashcards f
    WHERE f.front_text = 'Define the four anatomic components of Tetralogy of Fallot.'
  );

INSERT INTO public.flashcards (category_id, front_text, back_text)
SELECT c.id,
       'What postoperative complication is most associated with repaired Tetralogy of Fallot?',
       'Progressive pulmonary regurgitation leading to right ventricular dilation and arrhythmias.'
FROM public.categories c
WHERE c.name = 'Tetralogy of Fallot'
  AND NOT EXISTS (
    SELECT 1 FROM public.flashcards f
    WHERE f.front_text = 'What postoperative complication is most associated with repaired Tetralogy of Fallot?'
  );

INSERT INTO public.flashcards (category_id, front_text, back_text)
SELECT c.id,
       'Describe the typical murmur of a large ventricular septal defect.',
       'Harsh holosystolic murmur at the left lower sternal border often accompanied by a palpable thrill.'
FROM public.categories c
WHERE c.name = 'Ventricular Septal Defect'
  AND NOT EXISTS (
    SELECT 1 FROM public.flashcards f
    WHERE f.front_text = 'Describe the typical murmur of a large ventricular septal defect.'
  );

INSERT INTO public.flashcards (category_id, front_text, back_text)
SELECT c.id,
       'What physical exam finding is classic for an atrial septal defect?',
       'Fixed, widely split second heart sound (S2) due to delayed closure of the pulmonic valve.'
FROM public.categories c
WHERE c.name = 'Atrial Septal Defect'
  AND NOT EXISTS (
    SELECT 1 FROM public.flashcards f
    WHERE f.front_text = 'What physical exam finding is classic for an atrial septal defect?'
  );

INSERT INTO public.flashcards (category_id, front_text, back_text)
SELECT c.id,
       'How does critical coarctation of the aorta present in neonates?',
       'Poor feeding, lethargy, differential pulses, and possible shock once the ductus arteriosus closes.'
FROM public.categories c
WHERE c.name = 'Coarctation of the Aorta'
  AND NOT EXISTS (
    SELECT 1 FROM public.flashcards f
    WHERE f.front_text = 'How does critical coarctation of the aorta present in neonates?'
  );

INSERT INTO public.flashcards (category_id, front_text, back_text)
SELECT c.id,
       'What is the cornerstone acute therapy for Kawasaki disease?',
       'High-dose intravenous immunoglobulin plus high-dose aspirin administered within 10 days of fever onset.'
FROM public.categories c
WHERE c.name = 'Kawasaki Disease'
  AND NOT EXISTS (
    SELECT 1 FROM public.flashcards f
    WHERE f.front_text = 'What is the cornerstone acute therapy for Kawasaki disease?'
  );

COMMIT;
