# 🎉 BiohackLabs.ai - Final Setup Guide

## ✅ What's Already Working

- **Database Tables**: ✅ All created (orders, lab_analyses, profiles)
- **Edge Function**: ✅ Deployed (analyze-labs)
- **Frontend**: ✅ Complete and polished
- **Authentication**: ✅ Working

## 🔧 What You Need to Do (5 minutes)

### Step 1: Create Storage Bucket (2 minutes)

1. Go to: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/storage/buckets
2. Click "Create a new bucket"
3. Name: `lab-results`
4. Public: **No** (unchecked)
5. Click "Create bucket"

### Step 2: Create Environment File (1 minute)

Create a file called `.env.local` in your project root with this content:

```bash
# Supabase Configuration (already working)
VITE_SUPABASE_URL=https://zhdjvfylxgtiphldjtqf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZGp2ZnlseGd0aXBobGRqdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDMzODEsImV4cCI6MjA3MjgxOTM4MX0.VKESaxfzbabjj3Quz888Pv_N7WO8Pdws9zPxOFRmGhI

# Stripe Configuration (REQUIRED - create $19 product)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_INTERPRETATION_PRICE_ID=price_your_stripe_price_id_here

# OpenAI Configuration (REQUIRED - for AI analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Fullscript Configuration (optional for now)
VITE_FULLSCRIPT_PRACTITIONER_ID=your_practitioner_id_here
VITE_FULLSCRIPT_DISPENSARY_URL=https://us.fullscript.com/welcome/drzachconner

# App Configuration
VITE_APP_URL=http://localhost:5173
```

### Step 3: Set Up Stripe (2 minutes)

1. Go to: https://dashboard.stripe.com/test/products
2. Click "Create product"
3. Name: `Lab Interpretation Analysis`
4. Price: `$19.00 USD` (one-time)
5. Copy the Price ID (starts with `price_`)
6. Update your `.env.local` file with the real values

### Step 4: Set Up OpenAI (1 minute)

1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Update your `.env.local` file with the real key

## 🧪 Test Everything Works

Run this command to verify setup:

```bash
node complete-setup.js
```

You should see all green checkmarks ✅

## 🚀 Launch Your App

```bash
npm run dev
```

Go to http://localhost:5173 and test the complete flow:

1. **Sign up/Login** → Authentication works
2. **Upload lab PDF** → File upload works (no more "bucket not found" error)
3. **Pay $19** → Stripe checkout works
4. **Get AI analysis** → AI processes your labs
5. **View results** → Beautiful interactive report with supplement recommendations

## 💰 Revenue Model

- **$19 per analysis** (processed through Stripe)
- **25-35% commission** on supplement sales through Fullscript
- **Recurring customers** typically retest every 3-6 months

## 🎯 What's Next

Once you complete these 4 steps, your BiohackLabs.ai platform will be fully functional! The app is already polished and ready for users.

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf
- **Storage Buckets**: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/storage/buckets
- **Stripe Dashboard**: https://dashboard.stripe.com/test/products
- **OpenAI API Keys**: https://platform.openai.com/api-keys

---

**You're 95% done! Just need to create the storage bucket and add your API keys.**

