#!/bin/bash

echo "🚀 Setting up BiohackLabs.ai (Simplified Version)"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the lab-interpret directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f ".env.local" ]; then
    echo "📋 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys!"
else
    echo "✅ .env.local already exists"
fi

# Create necessary directories if they don't exist
echo "📁 Creating directory structure..."
mkdir -p src/components/ui 2>/dev/null
mkdir -p src/hooks 2>/dev/null
mkdir -p src/integrations/supabase 2>/dev/null
mkdir -p supabase/functions 2>/dev/null
mkdir -p supabase/migrations 2>/dev/null

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys:"
echo "   - Supabase URL and keys"
echo "   - Stripe publishable key and price ID"
echo "   - OpenAI API key"
echo "   - Your Fullscript dispensary URL"
echo ""
echo "2. Set up your Supabase project:"
echo "   supabase link --project-ref your-project-ref"
echo "   supabase db push"
echo ""
echo "3. Deploy Edge Functions:"
echo "   supabase functions deploy"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "Need help? Check the README.md file for detailed instructions."