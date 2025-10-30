#!/bin/bash
# Deploy to Vercel Script

echo "🚀 Deploying to Vercel..."
echo ""
echo "Step 1: Install Vercel CLI"
npm install -g vercel

echo ""
echo "Step 2: Login to Vercel"
vercel login

echo ""
echo "Step 3: Deploy"
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "Remember to add environment variables in Vercel dashboard:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
