# 🚀 Immediate Setup Guide - Fullscript Integration

## Step 1: Supabase Authentication & Project Setup

### 1.1 Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate with Supabase.

### 1.2 Link Your Project
```bash
# List your projects to find the correct one
supabase projects list

# Link to your specific project (replace with your project ref)
supabase link --project-ref YOUR_PROJECT_REF
```

### 1.3 Verify Connection
```bash
supabase status
```

## Step 2: Deploy Database Migration

```bash
# Apply the Fullscript integration migration
supabase db push
```

## Step 3: Deploy Edge Functions

```bash
# Deploy all three functions
supabase functions deploy create-lab-order-fullscript
supabase functions deploy sync-fullscript-catalog  
supabase functions deploy fullscript-webhook
```

## Step 4: Configure Environment Variables

Go to your Supabase Dashboard → Settings → Edge Functions → Environment Variables

Add these variables:

```bash
# Fullscript API (use placeholders until you get real keys)
FULLSCRIPT_API_KEY=pending_api_key
FULLSCRIPT_PRACTITIONER_ID=pending_practitioner_id
FULLSCRIPT_CLIENT_ID=pending_client_id
FULLSCRIPT_CLIENT_SECRET=pending_client_secret
FULLSCRIPT_WEBHOOK_SECRET=pending_webhook_secret

# These you should have already
OPENAI_API_KEY=your_actual_openai_key
RESEND_API_KEY=your_actual_resend_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Step 5: Test Your Setup

### 5.1 Create Test Page
Create `src/pages/TestIntegration.tsx`:

```tsx
import { FullscriptIntegrationTest } from '@/components/FullscriptIntegrationTest';

export default function TestIntegration() {
  return <FullscriptIntegrationTest />;
}
```

### 5.2 Add Route
Add to your router:
```tsx
<Route path="/test-integration" element={<TestIntegration />} />
```

### 5.3 Test Functions
Navigate to `/test-integration` and run the integration tests.

## Step 6: Prepare for Fullscript API

### 6.1 Apply for Fullscript Developer Account
1. Go to https://developer.fullscript.com
2. Apply for practitioner developer account
3. Provide required documentation:
   - Practitioner license/credentials
   - Business documentation
   - Integration description

### 6.2 Prepare Your Lab Catalog
Ensure your `lab_panels` table has accurate data for matching:

```sql
-- Check your current lab panels
SELECT id, name, display_name, provider, sample_type, base_price 
FROM lab_panels 
WHERE is_active = true 
LIMIT 10;
```

## Step 7: Mock Testing (While Waiting for API)

### 7.1 Test User Flow
1. Sign up a new user
2. Verify Fullscript account creation (will fail gracefully)
3. Browse lab panels
4. Add to cart
5. Proceed to checkout
6. Verify order creation in database

### 7.2 Test Error Handling
Your functions have fallback logic for when Fullscript isn't available:
- Orders still create in your database
- Users get appropriate error messages
- System remains functional

## Step 8: Once You Get Fullscript API Keys

### 8.1 Update Environment Variables
Replace placeholder values with real API keys in Supabase dashboard.

### 8.2 Test Fullscript Integration
```bash
# Test catalog sync
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/sync-fullscript-catalog \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test order creation
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/create-lab-order-fullscript \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"labPanelIds":["test"],"userId":"test"}'
```

### 8.3 Configure Webhooks
In Fullscript dashboard, set webhook URL:
```
https://YOUR_PROJECT.supabase.co/functions/v1/fullscript-webhook
```

## Step 9: Monitoring Setup

### 9.1 Create Admin Dashboard Query
```sql
-- Orders by status
SELECT status, COUNT(*) as count, SUM(total_amount) as revenue
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
GROUP BY status;
```

### 9.2 Set Up Alerts
Monitor these metrics:
- Failed order creation
- Fullscript API errors
- Webhook processing failures
- Catalog sync issues

## Step 10: Go Live Checklist

- [ ] Supabase project linked and functions deployed
- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] Fullscript API credentials obtained
- [ ] Lab catalog synced
- [ ] Webhook endpoints configured
- [ ] Test orders completed successfully
- [ ] Email notifications working
- [ ] Admin monitoring in place

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot find project ref"**
   - Run `supabase link --project-ref YOUR_PROJECT_REF`

2. **"Access token not provided"**
   - Run `supabase login`

3. **Functions fail to deploy**
   - Check environment variables are set
   - Verify function code syntax

4. **Database migration fails**
   - Check if you have the right permissions
   - Verify migration file syntax

### Getting Help

- Supabase Docs: https://supabase.com/docs
- Fullscript Docs: https://developer.fullscript.com
- Your implementation is in `FULLSCRIPT_INTEGRATION_SUMMARY.md`

## 🎯 Success Metrics

Track these weekly:
- Order conversion rate
- Fullscript integration success rate
- Average order value
- Commission revenue

---

**Ready to start?** Begin with Step 1 and work through each step. The integration is designed to work in "demo mode" until you get Fullscript API access.
