# 🔐 Environment Variables Setup Guide

## Go to: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/settings/functions

Click "Reveal Config" to see existing variables, then add these:

## 🤖 AI Service (REQUIRED - Choose ONE)

### Option A: OpenAI
```
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```
Get your key at: https://platform.openai.com/api-keys

### Option B: Anthropic Claude
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```
Get your key at: https://console.anthropic.com/settings/keys

## 💳 Stripe Configuration (REQUIRED)
```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```
Get from: https://dashboard.stripe.com/test/apikeys

## 📧 Email Service (OPTIONAL - for notifications)
```
RESEND_API_KEY=re_YOUR_KEY_HERE
```
Get from: https://resend.com/api-keys

## 🏥 Fullscript Integration (OPTIONAL - can add later)
```
FULLSCRIPT_API_KEY=pending_api_key
FULLSCRIPT_PRACTITIONER_ID=pending_practitioner_id
FULLSCRIPT_CLIENT_ID=pending_client_id
FULLSCRIPT_CLIENT_SECRET=pending_client_secret
FULLSCRIPT_WEBHOOK_SECRET=pending_webhook_secret
FULLSCRIPT_DISPENSARY_ID=drzachconner
FULLSCRIPT_PRACTITIONER_NAME=Dr. Zach Conner
AI_PROVIDER=openai
```
Apply for access at: https://developer.fullscript.com

---

## ⚡ Quick Test After Setup

### Test Storage Bucket:
Run in SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE id = 'lab-results';
```

### Test Tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'lab_analyses', 'profiles');
```

### Test Edge Function (after adding API key):
```bash
curl -X POST https://zhdjvfylxgtiphldjtqf.supabase.co/functions/v1/analyze-labs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZGp2ZnlseGd0aXBobGRqdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDMzODEsImV4cCI6MjA3MjgxOTM4MX0.VKESaxfzbabjj3Quz888Pv_N7WO8Pdws9zPxOFRmGhI" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```