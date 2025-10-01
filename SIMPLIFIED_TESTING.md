# 🧪 Simplified Demo Testing (Bypass Google OAuth)

## 🎯 **Quick Testing Approach**

Since Google OAuth is causing issues, let's test your lab ordering system using email/password authentication.

## ✅ **Step 1: Test User Registration**

### Use Email/Password Signup:
1. Go to your app's signup page
2. **Don't use Google** - use email/password instead
3. Create account with:
   - Email: `test@demo.com`
   - Password: `password123`

### Verify User Created:
Run this in Supabase SQL Editor:
```sql
SELECT id, email, created_at 
FROM profiles 
WHERE email = 'test@demo.com';
```

## ✅ **Step 2: Test Lab Browsing**

1. Navigate to `/labs` or `/lab-catalog`
2. Browse available lab panels
3. Verify lab data displays correctly
4. Test search/filter if available

## ✅ **Step 3: Test Shopping Cart**

1. Add 3-4 different lab panels to cart
2. Modify quantities
3. Remove items
4. Verify cart updates properly

## ✅ **Step 4: Test Checkout**

1. Proceed to checkout
2. Fill out any required forms
3. Complete the checkout process
4. **Expected:** Order created with `pending_manual` status

## ✅ **Step 5: Verify Order Creation**

Run this in Supabase SQL Editor:
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

-- Check order items
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

## ✅ **Step 6: Test Integration Status**

1. Navigate to `/test-integration`
2. Run all integration tests
3. **Expected Results:**
   - ✅ Database Migration: PASS
   - ✅ Edge Functions Deployed: PASS
   - ⚠️ Fullscript Account Setup: FAIL (expected)
   - ⚠️ Lab Catalog Sync: FAIL (expected)

## 🎯 **Expected Demo Mode Results**

| Component | Status | Expected Result |
|-----------|--------|----------------|
| User Registration | ✅ Working | Creates user in profiles table |
| Lab Browsing | ✅ Working | Displays lab catalog |
| Shopping Cart | ✅ Working | Full cart functionality |
| Checkout | ✅ Working | Creates orders in database |
| Order Status | ⚠️ Pending | Shows `pending_manual` status |
| Fullscript Integration | ⚠️ Pending | Fails gracefully (expected) |

## 🚨 **Troubleshooting Common Issues**

### "User registration fails"
- Check if email already exists
- Try different email address
- Check browser console for errors

### "Lab catalog not loading"
- Check if lab_panels table has data
- Verify lab_panels are marked as active
- Check network requests in browser

### "Checkout not working"
- Verify cart has items
- Check if CheckoutFlow component is imported
- Look for JavaScript errors in console

### "Order not created"
- Check user authentication
- Verify Edge Functions are deployed
- Check Supabase logs

## 📊 **Success Criteria**

Your demo mode is working correctly when:
- ✅ User can register with email/password
- ✅ Lab catalog displays properly
- ✅ Shopping cart works smoothly
- ✅ Checkout creates orders in database
- ✅ Orders show `pending_manual` status
- ✅ Integration tests show expected results

## 🚀 **Next Steps After Testing**

1. **Document test results** for Fullscript application
2. **Take screenshots** of working features
3. **Apply for Fullscript API access** at https://developer.fullscript.com
4. **Fix Google OAuth later** (optional)

## 💡 **Pro Tips**

- **Use multiple test accounts** to test different scenarios
- **Test on mobile** to verify responsive design
- **Check browser console** for any JavaScript errors
- **Document any issues** you find for later fixing

---

**Start with email/password testing and get your demo mode working!** 🎉
