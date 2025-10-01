# 🧪 Comprehensive Demo Mode Testing Plan

## 🎯 **Testing Strategy Overview**

This plan will thoroughly test your Fullscript integration in demo mode to ensure everything works perfectly before applying for Fullscript API access.

## 📋 **Pre-Testing Setup**

### 1. Clean Test Data
```sql
-- Clean up any existing test data
DELETE FROM orders WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%test%'
) AND order_type = 'lab_panel_fullscript';

DELETE FROM profiles WHERE email LIKE '%test%';
```

### 2. Verify System Status
```sql
-- Check if Fullscript columns exist
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'fullscript%'
ORDER BY column_name;

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('fullscript_webhooks', 'fullscript_sync_status');
```

## 🧪 **Test 1: Core User Flow**

### Step 1: User Registration
1. Navigate to your app's signup page
2. Create account with email: `test@demo.com`
3. Verify user created in `profiles` table

### Step 2: Lab Browsing
1. Go to `/labs` or `/lab-catalog`
2. Browse available lab panels
3. Test search/filter functionality
4. Verify lab data displays correctly

### Step 3: Shopping Cart
1. Add 3-4 different lab panels to cart
2. Modify quantities
3. Remove items
4. Verify cart persists on page refresh

### Step 4: Checkout Process
1. Proceed to checkout
2. Fill out any required forms
3. Complete the checkout
4. **Expected:** Order created with `pending_manual` status

### Step 5: Verify Order Creation
```sql
-- Check recent orders
SELECT 
  order_number,
  status,
  total_amount,
  LEFT(notes, 100) as notes_preview,
  created_at
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
ORDER BY created_at DESC
LIMIT 5;

-- Verify order items
SELECT 
  o.order_number,
  oi.lab_panel_id,
  lp.display_name,
  oi.quantity,
  oi.unit_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN lab_panels lp ON oi.lab_panel_id = lp.id
WHERE o.order_type = 'lab_panel_fullscript'
ORDER BY o.created_at DESC
LIMIT 10;
```

## 🧪 **Test 2: Integration Status Page**

### Navigate to `/test-integration`
**Expected Results:**
- ✅ Database Migration: Should show PASS
- ✅ Edge Functions Deployed: Should show PASS
- ⚠️ Fullscript Account Setup: Expected to fail (no API keys)
- ⚠️ Lab Catalog Sync: Expected to fail (no API keys)

## 🧪 **Test 3: Error Handling**

### Test Edge Cases:
1. **Empty Cart Checkout**
   - Try to checkout with empty cart
   - **Expected:** Appropriate error message

2. **Invalid Lab Panel IDs**
   - Try to add non-existent lab to cart
   - **Expected:** Error handling

3. **Network Interruption**
   - Start checkout, disconnect network, reconnect
   - **Expected:** Graceful error handling

4. **Multiple Rapid Checkouts**
   - Create multiple orders quickly
   - **Expected:** All orders created successfully

## 🧪 **Test 4: Database Integrity**

### Verify Lab Catalog
```sql
-- Check active lab panels
SELECT 
  id,
  name,
  display_name,
  base_price,
  provider,
  sample_type,
  is_active
FROM lab_panels
WHERE is_active = true
ORDER BY display_name
LIMIT 10;

-- Check for missing pricing
SELECT COUNT(*) as panels_without_price
FROM lab_panels
WHERE is_active = true 
AND (base_price IS NULL OR base_price = 0);
```

### Verify Order Structure
```sql
-- Check order creation pattern
SELECT 
  status,
  COUNT(*) as count,
  AVG(total_amount) as avg_amount,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order
FROM orders
WHERE order_type = 'lab_panel_fullscript'
GROUP BY status;
```

## 🧪 **Test 5: Edge Functions**

### Test Function Responses
```bash
# Test create-lab-order-fullscript function
curl -X POST https://zhdjvfylxgtiphldjtqf.supabase.co/functions/v1/create-lab-order-fullscript \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test sync-fullscript-catalog function
curl -X POST https://zhdjvfylxgtiphldjtqf.supabase.co/functions/v1/sync-fullscript-catalog \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected:** Functions should respond (not 404), may show errors due to missing API keys

## 🧪 **Test 6: UI/UX Testing**

### Checklist:
- [ ] Lab catalog displays correctly
- [ ] Search/filter functionality works
- [ ] Cart updates properly
- [ ] Cart persists on page refresh
- [ ] Checkout form validation works
- [ ] Success/error messages display correctly
- [ ] Mobile responsive design works
- [ ] Loading states show during operations

## 🧪 **Test 7: Performance Testing**

### Database Performance
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM lab_panels 
WHERE is_active = true;

-- Check order creation time
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as orders_created,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_seconds
FROM orders
WHERE order_type = 'lab_panel_fullscript'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;
```

## 🧪 **Test 8: Create Monitoring View**

### Set Up Order Monitoring
```sql
-- Create monitoring view
CREATE OR REPLACE VIEW demo_order_stats AS
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending_manual' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
  SUM(total_amount) as daily_revenue
FROM orders
WHERE order_type = 'lab_panel_fullscript'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Query the view
SELECT * FROM demo_order_stats LIMIT 7;
```

## ✅ **Success Criteria**

Your demo mode is working correctly when:

- [ ] Orders consistently create with `pending_manual` status
- [ ] Notes field contains "Fullscript integration failed: No Fullscript account found"
- [ ] Order numbers generate sequentially
- [ ] Cart items properly transfer to `order_items`
- [ ] No 500 errors in Edge Function logs
- [ ] All UI components work smoothly
- [ ] Error messages are user-friendly
- [ ] Mobile experience is responsive

## 📊 **Test Results Documentation**

### Document These for Fullscript:
1. **Screenshots:**
   - Lab catalog page
   - Checkout flow
   - Order confirmation
   - Error messages

2. **Test Data:**
   - Number of test orders created
   - Average order value
   - Error rates
   - Performance metrics

3. **System Status:**
   - All components working
   - Error handling verified
   - User experience smooth

## 🚨 **Common Issues & Solutions**

### "Orders not creating"
- Check user authentication
- Verify lab panels exist
- Check browser console for errors

### "Integration tests failing"
- Verify Edge Functions are deployed
- Check environment variables
- Review function logs

### "UI not responsive"
- Check mobile viewport
- Test on different devices
- Verify CSS is loading

## 🎯 **Pre-Submission Checklist**

Before applying to Fullscript:

- [ ] Professional landing page exists
- [ ] Clear pricing ($19 interpretation fee) displayed
- [ ] Privacy policy and terms of service pages exist
- [ ] About page shows practitioner credentials
- [ ] Sample report or demo available
- [ ] All test orders create successfully
- [ ] Error messages are user-friendly
- [ ] No JavaScript console errors
- [ ] Mobile experience works well
- [ ] Performance is acceptable

## 🚀 **Next Steps After Testing**

1. **Fix any issues found** during testing
2. **Document test results** for Fullscript application
3. **Prepare professional pages** for Fullscript review
4. **Apply for Fullscript API access** at https://developer.fullscript.com
5. **Configure real API credentials** when approved

---

**Run through this complete testing plan and document your results. This thorough testing will make your Fullscript application much stronger!** 🎉
