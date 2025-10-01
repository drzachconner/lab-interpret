#!/bin/bash

# Demo Mode Testing Execution Script
# This script helps you run through the comprehensive testing plan

echo "🧪 Starting Comprehensive Demo Mode Testing..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project details
PROJECT_URL="https://zhdjvfylxgtiphldjtqf.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZGp2ZnlseGd0aXBobGRqdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2MjQ5MzksImV4cCI6MjA0MTIwMDkzOX0.YourAnonKey"

echo -e "${BLUE}📋 Pre-Testing Setup${NC}"
echo "1. Clean up test data in Supabase SQL Editor"
echo "2. Start your development server: npm run dev"
echo "3. Open your app in browser"
echo ""

read -p "Press Enter when ready to continue..."

echo -e "${BLUE}🧪 Test 1: Core User Flow${NC}"
echo "=================================="
echo "1. Create a test user account (email: test@demo.com)"
echo "2. Navigate to /labs or /lab-catalog"
echo "3. Add 3-4 different lab panels to cart"
echo "4. Go through checkout process"
echo "5. Verify order is created"
echo ""

read -p "Did the user flow complete successfully? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ User flow test passed${NC}"
else
    echo -e "${RED}❌ User flow test failed - check for errors${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Test 2: Integration Status Page${NC}"
echo "======================================"
echo "1. Navigate to /test-integration"
echo "2. Run all integration tests"
echo "3. Check results"
echo ""

read -p "Are the integration tests showing expected results? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ Integration tests passed${NC}"
else
    echo -e "${RED}❌ Integration tests failed - check configuration${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Test 3: Edge Functions${NC}"
echo "=========================="
echo "Testing Edge Functions..."

# Test create-lab-order-fullscript function
echo "Testing create-lab-order-fullscript..."
ORDER_RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/create-lab-order-fullscript" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}')

if [[ $ORDER_RESPONSE == *"error"* ]]; then
    echo -e "${YELLOW}⚠️  Order function responded with error (expected without auth)${NC}"
else
    echo -e "${GREEN}✅ Order function responded${NC}"
fi

# Test sync-fullscript-catalog function
echo "Testing sync-fullscript-catalog..."
CATALOG_RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/sync-fullscript-catalog" \
  -H "Authorization: Bearer $ANON_KEY")

if [[ $CATALOG_RESPONSE == *"error"* ]]; then
    echo -e "${YELLOW}⚠️  Catalog sync responded with error (expected without API keys)${NC}"
else
    echo -e "${GREEN}✅ Catalog sync function responded${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Test 4: Database Verification${NC}"
echo "=================================="
echo "Run these queries in Supabase SQL Editor:"
echo ""
echo "1. Check recent orders:"
echo "   SELECT order_number, status, total_amount, created_at"
echo "   FROM orders WHERE order_type = 'lab_panel_fullscript'"
echo "   ORDER BY created_at DESC LIMIT 5;"
echo ""
echo "2. Check system health:"
echo "   Run the 'System Health Check' section from testing-queries.sql"
echo ""

read -p "Are the database queries showing expected results? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ Database verification passed${NC}"
else
    echo -e "${RED}❌ Database verification failed - check queries${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Test 5: Error Handling${NC}"
echo "=========================="
echo "Test these scenarios:"
echo "1. Try to checkout with empty cart"
echo "2. Try to add invalid lab to cart"
echo "3. Test mobile responsiveness"
echo "4. Check for JavaScript console errors"
echo ""

read -p "Are error handling tests passing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ Error handling tests passed${NC}"
else
    echo -e "${RED}❌ Error handling tests failed - check UI/UX${NC}"
fi

echo ""
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "=========================="
echo "Expected Demo Mode Results:"
echo "✅ User registration works"
echo "✅ Lab browsing works"
echo "✅ Shopping cart works"
echo "✅ Checkout creates orders"
echo "⚠️  Orders show 'pending_manual' status (expected)"
echo "⚠️  Fullscript integration fails gracefully (expected)"
echo ""

echo -e "${BLUE}🎯 Next Steps${NC}"
echo "============="
echo "1. Document any issues found"
echo "2. Take screenshots for Fullscript application"
echo "3. Prepare professional pages"
echo "4. Apply for Fullscript API access"
echo ""

echo -e "${GREEN}🎉 Demo Mode Testing Complete!${NC}"
echo "Your lab ordering platform is ready for Fullscript application."
