# Deployment Guide

This document outlines how to promote the Pediatric Cardiology QBank application to production using Vercel and Supabase.

## 1. Prerequisites

- Node.js 18+ and npm
- Supabase project with the schema from `supabase-schema.sql`
- Supabase environment variables added to `.env.local`
- Vercel account with access to the production project
- (Optional) Vercel CLI installed locally: `npm install -g vercel`

## 2. Prepare Your Environment

1. Pull the latest code:
   ```bash
   git checkout work
   git pull
   ```
2. Install dependencies and run the automated checks:
   ```bash
   npm install
   npm run lint
   npm test
   npm run build
   ```
3. Ensure you can connect to Supabase using the credentials in `.env.local`.
4. (Optional) Load pediatric cardiology sample data:
   ```bash
   # In the Supabase SQL editor
   -- Run the commands from sample-data.sql
   ```

## 3. Deploy with Vercel (Web UI)

1. Visit [https://vercel.com/new](https://vercel.com/new).
2. Import the `stevetodman/peds-cardiology-qbank` repository.
3. Set the following environment variables for the **Production** environment:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** and wait for the build to finish (≈3 minutes).
5. Note the production domain and add it to Supabase **Authentication → URL Configuration**.

## 4. Deploy with the Vercel CLI

1. Install the CLI if needed:
   ```bash
   npm install -g vercel
   ```
2. Authenticate:
   ```bash
   vercel login
   ```
3. Link the project (one-time setup inside the repo directory):
   ```bash
   vercel link
   ```
4. Run the helper script to validate and deploy:
   ```bash
   ./deploy-vercel.sh
   ```
   The script will:
   - Load environment variables (from `.env.production` if present)
   - Run `npm install`, `npm run lint`, `npm test`, and `npm run build`
   - Trigger `vercel deploy --prod`

## 5. Post-Deployment Checklist

- Visit the production URL and run through authentication, QBank, flashcards, study plan, and notebook flows.
- In Supabase, update **Authentication → URL Configuration** with the production domain.
- Re-run the Supabase SQL from `sample-data.sql` in production if you want seeded content.
- Monitor Vercel and Supabase dashboards for errors.
- Share access with pilot users once verification is complete.
