# 🚀 Fullscript Integration Deployment Checklist

## ✅ Immediate Actions Required

### 1. Deploy Edge Functions
```bash
# Deploy the new Fullscript lab order function
supabase functions deploy create-lab-order-fullscript

# Deploy the catalog sync function
supabase functions deploy sync-fullscript-catalog

# Deploy the enhanced webhook handler
supabase functions deploy fullscript-webhook
```

### 2. Run Database Migration
```bash
# Apply the migration to your Supabase database
supabase db push
```

### 3. Configure Fullscript API Credentials
You need to contact Fullscript to get:
- API Key and Secret
- Practitioner ID
- Webhook endpoints configured

They typically require:
- Business verification
- Practitioner credentials
- Compliance documentation

## 🔧 Environment Variables Setup

Add these to your Supabase Edge Functions environment:

```bash
# Fullscript API Configuration
FULLSCRIPT_API_KEY=your_fullscript_api_key
FULLSCRIPT_PRACTITIONER_ID=your_practitioner_id
FULLSCRIPT_CLIENT_ID=your_client_id
FULLSCRIPT_CLIENT_SECRET=your_client_secret
FULLSCRIPT_WEBHOOK_SECRET=your_webhook_secret

# OpenAI for lab analysis
OPENAI_API_KEY=your_openai_key

# Email service (Resend)
RESEND_API_KEY=your_resend_api_key

# Stripe for interpretation fees only
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 🧪 Testing Checklist

### Test Account Creation
- [ ] Sign up new user → Fullscript account auto-creates
- [ ] Check profiles table for `fullscript_account_id`
- [ ] Verify dispensary URL is set

### Test Lab Ordering
- [ ] Add labs to cart
- [ ] Proceed to checkout
- [ ] Verify order creates in database
- [ ] Check Fullscript treatment plan creation
- [ ] Test redirect to Fullscript checkout

### Test Error Scenarios
- [ ] Order with invalid lab IDs
- [ ] User without Fullscript account
- [ ] Fullscript API downtime (use mock mode)

### Test Webhook Events
- [ ] Order created webhook
- [ ] Order paid webhook
- [ ] Order shipped webhook
- [ ] Order completed webhook
- [ ] Order cancelled webhook
- [ ] Results ready webhook

## 📊 Database Verification

Run these queries to verify setup:

```sql
-- Check migration applied
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name LIKE 'fullscript%';

-- Check sync status
SELECT * FROM fullscript_sync_status ORDER BY last_sync_at DESC;

-- Check webhook processing
SELECT * FROM fullscript_webhooks ORDER BY created_at DESC LIMIT 10;
```

## 🔄 Fullscript Catalog Sync

### Initial Sync
```bash
# Trigger initial catalog sync
curl -X POST https://your-project.supabase.co/functions/v1/sync-fullscript-catalog \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Verify Sync Results
```sql
-- Check synced labs
SELECT COUNT(*) as total_labs,
       COUNT(fullscript_id) as synced_labs,
       COUNT(CASE WHEN fullscript_available = true THEN 1 END) as available_labs
FROM lab_panels;
```

## 🎯 Production Deployment Tips

### 1. Use Environment-Specific Keys
```bash
# Development
FULLSCRIPT_API_KEY=test_key_xxxxx

# Production  
FULLSCRIPT_API_KEY=live_key_xxxxx
```

### 2. Set Up Monitoring
- Monitor Edge Function execution times
- Track Fullscript API response times
- Alert on failed orders

### 3. Add Rate Limiting
Fullscript has API rate limits. Consider caching:
```typescript
// Cache lab catalog for 1 hour
const CACHE_KEY = 'fullscript_labs';
const CACHE_TTL = 3600; // 1 hour
```

## 📈 Dashboard Additions

Create admin views to monitor:

```sql
-- Orders by status
SELECT status, COUNT(*) 
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
GROUP BY status;

-- Failed Fullscript integrations
SELECT * FROM orders 
WHERE fullscript_order_id IS NULL 
AND notes LIKE '%Fullscript%error%';

-- Conversion funnel
SELECT 
  COUNT(DISTINCT user_id) as users_with_cart,
  COUNT(DISTINCT CASE WHEN status != 'abandoned' THEN user_id END) as users_ordered,
  COUNT(DISTINCT CASE WHEN status = 'paid' THEN user_id END) as users_paid
FROM orders;
```

## ⚡ Quick Wins

### 1. Add Loading States
The checkout already has loading states, but add skeleton loaders to lab browsing.

### 2. Add Price Comparison
Show savings compared to direct lab pricing:
```jsx
<Badge variant="success">Save ${(retailPrice - yourPrice).toFixed(2)}</Badge>
```

### 3. Add Trust Badges
```jsx
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  <Shield className="h-4 w-4" />
  <span>Secure checkout via Fullscript</span>
</div>
```

## 🔄 Ongoing Maintenance

- **Weekly**: Check sync status, review failed orders
- **Monthly**: Audit Fullscript webhook logs
- **Quarterly**: Review commission reports from Fullscript

## 🚨 Critical Missing Pieces

### 1. Fullscript Product Catalog Sync
You need to populate your `lab_panels` table with Fullscript lab IDs. The sync function is ready, but you need to:
- Run the initial sync
- Verify lab panel mappings
- Test order creation with synced labs

### 2. Webhook Endpoint Configuration
Configure these webhook endpoints in Fullscript:
- `https://your-project.supabase.co/functions/v1/fullscript-webhook`

Events to enable:
- `order.created`
- `order.paid`
- `order.shipped`
- `order.completed`
- `order.cancelled`
- `result.ready`

## 🎉 Success Metrics

Track these KPIs:
- Order conversion rate
- Fullscript integration success rate
- Average order value
- User satisfaction scores
- Commission revenue from Fullscript

## 📞 Support Contacts

- **Fullscript API Support**: [developer.fullscript.com](https://developer.fullscript.com)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **BiohackLabs.ai**: [your-support-email]

---

**Next Steps**: Complete the deployment checklist above, then test the integration thoroughly before going live with real users.
