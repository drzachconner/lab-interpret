#!/bin/bash

# BiohackLabs Setup Verification Script
# Run this after completing all setup steps

echo "🔍 BiohackLabs Setup Verification"
echo "================================="
echo ""

# Check Node.js installation
echo "1. Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js installed: $(node -v)"
else
    echo "   ❌ Node.js not installed - Please install from https://nodejs.org"
    exit 1
fi

# Check npm installation
echo "2. Checking npm installation..."
if command -v npm &> /dev/null; then
    echo "   ✅ npm installed: $(npm -v)"
else
    echo "   ❌ npm not installed"
    exit 1
fi

# Check project directory
echo "3. Checking project directory..."
PROJECT_DIR="/Users/zachconnermba/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/lab-interpret"
if [ -d "$PROJECT_DIR" ]; then
    echo "   ✅ Project directory found"
    cd "$PROJECT_DIR"
else
    echo "   ❌ Project directory not found"
    exit 1
fi

# Check .env file
echo "4. Checking .env configuration..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    
    # Check for Stripe configuration
    if grep -q "VITE_STRIPE_INTERPRETATION_PRICE_ID=price_" .env; then
        echo "   ✅ Stripe Price ID configured"
    else
        echo "   ⚠️  Stripe Price ID not configured (still using placeholder)"
    fi
else
    echo "   ❌ .env file not found"
fi

# Check node_modules
echo "5. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ⚠️  Dependencies not installed - Run: npm install"
fi

echo ""
echo "================================="
echo "📋 Setup Status Summary:"
echo ""

# Summary
if command -v node &> /dev/null && [ -f ".env" ]; then
    echo "✅ Basic setup complete!"
    echo ""
    echo "📌 Next steps:"
    echo "1. Ensure you've run COMPLETE_SETUP.sql in Supabase"
    echo "2. Add AI API key to Supabase Edge Functions"
    echo "3. Update Stripe Price ID in .env file"
    echo "4. Run: npm install (if not done)"
    echo "5. Run: npm run dev"
    echo "6. Visit: http://localhost:5173"
else
    echo "❌ Setup incomplete - Please complete the steps above"
fi

echo ""
echo "For detailed instructions, see SETUP_CHECKLIST.md"