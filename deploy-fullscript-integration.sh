#!/bin/bash

# Fullscript Integration Deployment Script
# This script deploys all the necessary components for Fullscript lab ordering

set -e  # Exit on any error

echo "🚀 Starting Fullscript Integration Deployment..."

# Check if supabase CLI is installed
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

echo "📦 Deploying Edge Functions..."

# Deploy the lab order function
echo "  Deploying create-lab-order-fullscript..."
supabase functions deploy create-lab-order-fullscript

# Deploy the catalog sync function
echo "  Deploying sync-fullscript-catalog..."
supabase functions deploy sync-fullscript-catalog

# Deploy the enhanced webhook handler
echo "  Deploying fullscript-webhook..."
supabase functions deploy fullscript-webhook

echo "🗄️  Applying Database Migration..."

# Apply database migration
supabase db push

echo "✅ Deployment Complete!"

echo ""
echo "🔧 Next Steps:"
echo "1. Configure Fullscript API credentials in Supabase dashboard"
echo "2. Set up webhook endpoints in Fullscript"
echo "3. Run initial catalog sync"
echo "4. Test the integration"
echo ""
echo "📚 See DEPLOYMENT_CHECKLIST.md for detailed instructions"

# Optional: Test the functions
read -p "🧪 Would you like to test the functions now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Testing functions..."
    
    # Test catalog sync
    echo "  Testing catalog sync..."
    curl -X POST "$(supabase status | grep 'API URL' | awk '{print $3}')/functions/v1/sync-fullscript-catalog" \
         -H "Authorization: Bearer $(supabase status | grep 'anon key' | awk '{print $3}')" \
         -H "Content-Type: application/json" || echo "  ⚠️  Catalog sync test failed (expected if no Fullscript API key)"
    
    echo "  ✅ Function tests completed"
fi

echo ""
echo "🎉 Fullscript integration is ready for configuration!"
