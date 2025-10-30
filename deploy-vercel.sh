#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${1:-.env.production}"
if [[ -f "$ENV_FILE" ]]; then
  echo "Loading environment variables from $ENV_FILE"
  set -a
  source "$ENV_FILE"
  set +a
fi

REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Error: required environment variable $var is not set." >&2
    echo "Set it in the environment or add it to $ENV_FILE." >&2
    exit 1
  fi
done

echo "Installing dependencies..."
npm install --prefer-offline

echo "Running lint..."
npm run lint

echo "Running tests..."
npm test

echo "Building application..."
npm run build

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Install it with 'npm install -g vercel' to continue." >&2
  exit 1
fi

if [[ -z "${VERCEL_ORG_ID:-}" || -z "${VERCEL_PROJECT_ID:-}" ]]; then
  echo "Vercel project is not linked. Run 'vercel link' once before deploying." >&2
  exit 1
fi

echo "Deploying with Vercel..."
vercel deploy --prod --yes
