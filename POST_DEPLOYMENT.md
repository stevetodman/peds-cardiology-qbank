# Post-Deployment Configuration

## Supabase Configuration

### 1. Authentication URLs

Go to: Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://peds-cardiology-qbank.vercel.app
```

**Redirect URLs (add these):**
```
https://peds-cardiology-qbank.vercel.app/**
https://peds-cardiology-qbank-6jrrbohnw-steven-todmans-projects.vercel.app/**
http://localhost:3000/**
```

### 2. Email Settings (Optional but Recommended)

Go to: Supabase Dashboard → Authentication → Email Templates

**For testing, you can:**
- Disable email confirmation: Auth → Providers → Email → Disable "Confirm email"
- Or customize email templates with your branding

### 3. Row Level Security (RLS) Policies

Verify these policies exist on your tables:

**profiles table:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

**questions & question_options tables:**
```sql
-- All authenticated users can read questions
CREATE POLICY "Authenticated users can read questions"
ON questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read question_options"
ON question_options FOR SELECT
TO authenticated
USING (true);
```

**sessions & session_answers tables:**
```sql
-- Users can manage their own sessions
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Same for session_answers
CREATE POLICY "Users can manage own answers"
ON session_answers FOR ALL
USING (auth.uid() = user_id);
```

**notes table:**
```sql
CREATE POLICY "Users can manage own notes"
ON notes FOR ALL
USING (auth.uid() = user_id);
```

**study_plan table:**
```sql
CREATE POLICY "Users can manage own study plan"
ON study_plan FOR ALL
USING (auth.uid() = user_id);
```

**flashcards table:**
```sql
CREATE POLICY "All authenticated users can read flashcards"
ON flashcards FOR SELECT
TO authenticated
USING (true);
```

### 4. Database Indexes (Performance)

For better performance, add these indexes:

```sql
-- Index on user_id columns for faster queries
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_session_answers_user_id ON session_answers(user_id);
CREATE INDEX idx_session_answers_session_id ON session_answers(session_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_study_plan_user_id ON study_plan(user_id);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
```

## Vercel Configuration

### Environment Variables

Ensure these are set in Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Important:** After adding/changing env vars, you must redeploy!

### Custom Domain (Optional)

1. Go to Vercel → Settings → Domains
2. Add your custom domain (e.g., `peds-cardio-qbank.com`)
3. Update DNS records as instructed
4. Add custom domain to Supabase redirect URLs

### Analytics (Optional)

Enable Vercel Analytics:
1. Go to Vercel → Analytics tab
2. Click "Enable"
3. Free tier includes 2,500 events/month

## Testing Checklist

After configuration:

- [ ] Visit production URL
- [ ] Sign up with test account
- [ ] Verify email (if enabled)
- [ ] Log in successfully
- [ ] Dashboard loads with correct user name
- [ ] Start a quiz session
- [ ] Answer questions
- [ ] View results
- [ ] Create a flashcard
- [ ] Add study plan item
- [ ] Create a note
- [ ] Sign out
- [ ] Sign in again

## Monitoring

### Error Tracking

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Uptime Monitoring

Use a free service like:
- UptimeRobot (https://uptimerobot.com)
- Better Uptime (https://betteruptime.com)

Set up alerts for when your site goes down.

## Next Steps

1. ✅ Test all features
2. 📝 Add more questions to database
3. 👥 Invite beta testers
4. 📊 Monitor usage and errors
5. 🎨 Customize branding (colors, logo)
6. 📱 Test on mobile devices
7. 🚀 Launch publicly!
