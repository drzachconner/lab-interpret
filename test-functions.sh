#!/bin/bash

# Test Fullscript Integration Functions
# This script tests your deployed Edge Functions

echo "🧪 Testing Fullscript Integration Functions..."

# Get your project URL and anon key
PROJECT_URL="https://zhdjvfylxgtiphldjtqf.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZGp2ZnlseGd0aXBobGRqdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2MjQ5MzksImV4cCI6MjA0MTIwMDkzOX0.YourAnonKey"

echo "📡 Testing Edge Functions..."

# Test 1: Catalog Sync Function
echo "1. Testing sync-fullscript-catalog..."
CATALOG_RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/sync-fullscript-catalog" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json")

echo "   Response: $CATALOG_RESPONSE"

# Test 2: Lab Order Function (will fail without auth, but function should exist)
echo "2. Testing create-lab-order-fullscript..."
ORDER_RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/create-lab-order-fullscript" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"labPanelIds":["test"],"userId":"test"}')

echo "   Response: $ORDER_RESPONSE"

# Test 3: Webhook Handler (will fail without proper webhook data, but function should exist)
echo "3. Testing fullscript-webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/fullscript-webhook" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}')

echo "   Response: $WEBHOOK_RESPONSE"

echo ""
echo "✅ Function tests completed!"
echo ""
echo "Expected results:"
echo "- Functions should return responses (not 404 errors)"
echo "- Catalog sync may fail due to missing API keys (expected)"
echo "- Order creation may fail due to missing auth (expected)"
echo "- Webhook may fail due to invalid data (expected)"
echo ""
echo "If you see 404 errors, the functions aren't deployed properly."
echo "If you see other errors, the functions are deployed but may need configuration."
