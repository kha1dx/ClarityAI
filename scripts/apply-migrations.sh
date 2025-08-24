#!/bin/bash

# Script to apply Supabase migrations
# Run this from the project root directory

set -e

echo "🚀 Starting Supabase database migration process..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "supabase/migrations" ]; then
    echo "❌ Migrations directory not found. Creating it..."
    mkdir -p supabase/migrations
fi

echo "📋 Available migrations:"
ls -la supabase/migrations/

echo ""
echo "🔧 Initializing Supabase project (if not already initialized)..."
supabase init 2>/dev/null || echo "   Project already initialized"

echo ""
echo "🔗 Linking to remote Supabase project..."
echo "   Project ID: pkbaenyoyrveaxlbuyrd"
supabase link --project-ref pkbaenyoyrveaxlbuyrd

echo ""
echo "📊 Checking current database status..."
supabase db remote show

echo ""
echo "🔄 Applying migrations to remote database..."
supabase db push

echo ""
echo "✅ Migration process completed!"
echo ""
echo "🔍 To verify the migration worked correctly:"
echo "   1. Check your Supabase dashboard at https://supabase.com/dashboard/project/pkbaenyoyrveaxlbuyrd"
echo "   2. Go to the 'Database' section and verify the tables were created"
echo "   3. Check the 'Authentication' > 'Policies' section to verify RLS policies"
echo ""
echo "📝 Next steps:"
echo "   1. Test user registration to ensure the profile trigger works"
echo "   2. Create a test conversation to verify the schema"
echo "   3. Generate TypeScript types with: supabase gen types typescript --project-id pkbaenyoyrveaxlbuyrd --schema public"