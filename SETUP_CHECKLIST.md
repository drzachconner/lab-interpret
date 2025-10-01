# ✅ BiohackLabs Setup Checklist

## 📋 IMMEDIATE ACTIONS (Do These Now!)

### 1️⃣ Database & Storage Setup (5 minutes)
- [ ] Go to: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/sql/new
- [ ] Copy contents of `COMPLETE_SETUP_V2.sql`
- [ ] Paste and click "RUN"
- [ ] Verify tables and policies were created (Tables 8+, Policies 15+)

### 2️⃣ AI API Key (3 minutes)
- [ ] Go to: https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/settings/functions
- [ ] Add ONE of these:
  - OpenAI: `OPENAI_API_KEY=sk-proj-YOUR_KEY`
  - Anthropic: `ANTHROPIC_API_KEY=sk-ant-YOUR_KEY`
  - Optionally set provider: `AI_PROVIDER=openai` (or `anthropic`)
  - Fullscript settings: `FULLSCRIPT_DISPENSARY_ID=drzachconner`, `FULLSCRIPT_PRACTITIONER_NAME=Dr. Zach Conner`

### 3️⃣ Stripe Product (5 minutes)
- [ ] Go to: https://dashboard.stripe.com/products
- [ ] Create product: "Lab Analysis" - $19.00
- [ ] Copy the Price ID (starts with `price_`)
- [ ] Update `.env` file with the Price ID

### 4️⃣ Install Node.js (10 minutes)
- [ ] Go to: https://nodejs.org
- [ ] Download LTS version
- [ ] Install it
- [ ] Restart Terminal

### 5️⃣ Run the Application (2 minutes)
```bash
cd "/Users/zachconnermba/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/lab-interpret"
npm install
npm run dev
```

---

## 🎯 SUCCESS INDICATORS

When everything is working, you should be able to:
1. ✅ Visit http://localhost:5173
2. ✅ Sign up / Login
3. ✅ Upload a PDF file
4. ✅ Get redirected to Stripe checkout
5. ✅ Complete payment
6. ✅ See AI analysis results

---

## 📂 REFERENCE FILES

| File | Purpose |
|------|---------|
| `COMPLETE_SETUP_V2.sql` | Enhanced database & storage setup |
| `ENV_VARIABLES_SETUP.md` | Environment variables guide |
| `STRIPE_SETUP.md` | Stripe configuration |
| `.env` | Local environment variables |
| `LIVING_CONTEXT.md` | Project status tracker |

---

## 🚨 TROUBLESHOOTING

### "Storage bucket error"
→ Run the COMPLETE_SETUP.sql script

### "Payment failed"
→ Check Stripe Price ID in .env

### "AI analysis failed"
→ Add OpenAI/Anthropic key in Supabase

### "npm: command not found"
→ Install Node.js first

---

## 📞 QUICK LINKS

- **Supabase Dashboard**: [Open Dashboard](https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf)
- **SQL Editor**: [Open SQL Editor](https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/sql/new)
- **Edge Functions**: [Open Functions Settings](https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/settings/functions)
- **Stripe Dashboard**: [Open Stripe](https://dashboard.stripe.com)

---

**Time to Complete**: ~25 minutes total