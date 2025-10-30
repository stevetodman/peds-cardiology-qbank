# QBank "Start Practice" Button Fix

## Problem
The "Start Practice" button in QBank is greyed out even though 3 questions exist in the database.

## Root Cause
The QBank page (`app/qbank/page.tsx`) requires:
1. Questions to be assigned to categories
2. The `categories` table to have data

Currently:
- The `categories` table is empty
- All questions have `category_id = NULL`

The code checks if `selectedCategories.length === 0` and disables the button when no categories are selected (line 159 in `app/qbank/page.tsx`).

## Solution

### Step 1: Add Categories to Database
Run the following SQL in your Supabase SQL Editor:

```sql
-- Insert categories
INSERT INTO categories (name)
VALUES
  ('Congenital Heart Disease'),
  ('Arrhythmias'),
  ('Heart Failure'),
  ('Acquired Heart Disease')
ON CONFLICT (name) DO NOTHING;

-- Update existing questions with category_id
UPDATE questions
SET category_id = (SELECT id FROM categories WHERE name = 'Congenital Heart Disease')
WHERE category_id IS NULL;
```

### Step 2: Verify the Fix
Run this query to confirm:

```sql
SELECT q.id, q.question_text, c.name as category
FROM questions q
LEFT JOIN categories c ON q.category_id = c.id
ORDER BY q.id;
```

You should see all 3 questions assigned to "Congenital Heart Disease".

### Step 3: Test in App
1. Refresh your app at peds-cardiology-qbank.vercel.app
2. Navigate to QBank
3. You should now see categories checkboxes
4. The "Start Practice" button should be enabled
5. Click it to start a quiz

## Expected Behavior After Fix
- Categories section will show 4 checkboxes (all selected by default)
- Button will be enabled
- Clicking "Start Practice Quiz" will create a session and navigate to the quiz

## Alternative: Complete Sample Data
For a more complete test setup, you can also run the updated `sample-data.sql` that includes categories from the start.
