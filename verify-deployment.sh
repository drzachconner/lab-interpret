#!/bin/bash

# Fullscript Integration Deployment Verification Script
# This script helps verify that your deployment was successful

echo "🔍 Verifying Fullscript Integration Deployment..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run this from your project root."
    exit 1
fi

echo "✅ Supabase project detected"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase authentication verified"

# Check if project is linked
if ! supabase status &> /dev/null; then
    echo "❌ Project not linked. Please run:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase project linked"

# Check if functions are deployed
echo "🔍 Checking deployed functions..."

FUNCTIONS=("create-lab-order-fullscript" "sync-fullscript-catalog" "fullscript-webhook")

for func in "${FUNCTIONS[@]}"; do
    if supabase functions list | grep -q "$func"; then
        echo "✅ $func is deployed"
    else
        echo "❌ $func is not deployed"
        echo "   Run: supabase functions deploy $func"
    fi
done

# Check if migration was applied
echo "🔍 Checking database migration..."

# This is a simple check - in practice you'd query the database
if [ -f "supabase/migrations/20250925155948_add_fullscript_integration_fields.sql" ]; then
    echo "✅ Migration file exists"
    echo "   Run: supabase db push to apply migration"
else
    echo "❌ Migration file not found"
fi

# Check environment variables
echo "🔍 Checking environment variables..."
echo "   Go to Supabase Dashboard → Settings → Edge Functions → Environment Variables"
echo "   Add these variables:"
echo "   - FULLSCRIPT_API_KEY"
echo "   - FULLSCRIPT_PRACTITIONER_ID"
echo "   - FULLSCRIPT_CLIENT_ID"
echo "   - FULLSCRIPT_CLIENT_SECRET"
echo "   - FULLSCRIPT_WEBHOOK_SECRET"
echo "   - OPENAI_API_KEY"
echo "   - RESEND_API_KEY"

echo ""
echo "🎯 Next Steps:"
echo "1. Complete the deployment steps in IMMEDIATE_SETUP_GUIDE.md"
echo "2. Test your integration at /test-integration"
echo "3. Apply for Fullscript API access at https://developer.fullscript.com"
echo "4. Configure webhooks once you have API access"

echo ""
echo "📚 Documentation:"
echo "- IMMEDIATE_SETUP_GUIDE.md - Step-by-step setup"
echo "- DEPLOYMENT_CHECKLIST.md - Complete deployment guide"
echo "- FULLSCRIPT_INTEGRATION_SUMMARY.md - Implementation overview"

echo ""
echo "🎉 Verification complete!"
