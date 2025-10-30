# Production Readiness Checklist

Use this checklist to confirm the Pediatric Cardiology QBank is ready for a public launch.

## Environment & Infrastructure
- [ ] Supabase project configured with `supabase-schema.sql`
- [ ] Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) set for development, preview, and production
- [ ] Authentication redirect URLs updated with the production domain
- [ ] Row Level Security (RLS) policies verified for all tables

## Data & Content
- [ ] Pediatric cardiology sample data imported (see `sample-data.sql`)
- [ ] Real content reviewed for accuracy and tone
- [ ] Flashcards categorized correctly and render in the UI
- [ ] Study plan templates match learning objectives

## Quality Assurance
- [ ] `npm run lint` passes locally
- [ ] `npm test` passes locally
- [ ] `npm run build` completes without errors
- [ ] Manual walkthrough: sign up, start quiz, submit answers, review results
- [ ] Manual walkthrough: flashcards, study plan tasks, notebook entries

## Deployment
- [ ] Vercel project linked to the Git repository
- [ ] Production deployment triggered via `./deploy-vercel.sh` or Vercel UI
- [ ] Supabase production database seeded (if desired)
- [ ] Production URL smoke-tested end-to-end

## Post-Launch
- [ ] Monitoring/analytics enabled (Vercel, Supabase, or third-party)
- [ ] Support plan defined for user feedback and incidents
- [ ] Documentation shared with stakeholders
- [ ] Future backlog captured in project management tool
