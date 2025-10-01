# 🚀 BiohackLabs Setup - Quick Action Guide

## Option A: Setup via Supabase Dashboard (Easier)

### 1️⃣ Create Storage Bucket & Apply Migrations
Go to: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/sql/new

Copy and paste the SQL from: `setup-storage-bucket.sql`

Then run the main migration:
Copy the contents of: `supabase/migrations/001_simplified_schema.sql`

### 2️⃣ Configure Stripe Product
1. Go to Stripe Dashboard: https://dashboard.stripe.com/products
2. Create new product: "Lab Analysis" - $19.00
3. Copy the Price ID (starts with price_)
4. Add to your .env file:
   ```
   VITE_STRIPE_INTERPRETATION_PRICE_ID=price_YOUR_ID_HERE
   ```

### 3️⃣ Add AI Service Keys
Go to: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/settings/functions

Add these environment variables:
```
OPENAI_API_KEY=sk-YOUR_KEY_HERE
# OR
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

### 4️⃣ Test the Application
```bash
# In your project directory:
cd "/Users/zachconnermba/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/lab-interpret"

# Install dependencies if needed
npm install

# Start the dev server
npm run dev
```

Then visit: http://localhost:5173

---

## Option B: Setup via CLI (If you want to install Supabase CLI)

### Install Supabase CLI
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Supabase CLI
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link your project
cd "/Users/zachconnermba/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/lab-interpret"
supabase link --project-ref zhdjvfylxgtiphldjtqf

# Apply migrations
supabase db push
```

---

## ✅ Quick Verification Tests

### Test 1: Check if tables exist
Run in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'lab_analyses', 'profiles');
```

### Test 2: Check storage bucket
```sql
SELECT * FROM storage.buckets WHERE id = 'lab-results';
```

### Test 3: Test file upload
1. Go to http://localhost:5173
2. Login/signup
3. Try uploading a PDF file
4. Check browser console for errors

---

## 🎯 Success Checklist
- [ ] Database tables created (orders, lab_analyses, profiles)
- [ ] Storage bucket 'lab-results' exists
- [ ] Stripe Price ID in .env file
- [ ] AI API key configured in Supabase
- [ ] Application runs without errors
- [ ] File upload works
- [ ] Payment flow redirects to Stripe

---

## 🆘 Need Help?
- Supabase Dashboard: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf
- Check logs: Dashboard → Logs → Edge Functions
- Test functions: Dashboard → Edge Functions → Select function → Test

Would you like me to help with Option A (Dashboard) or Option B (CLI)?