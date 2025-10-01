# 🧪 Demo Mode Testing Guide

## 🎯 **Your System Works RIGHT NOW!**

Even without Fullscript API credentials, your lab ordering platform is fully functional. Here's how to test everything:

## ✅ **What Works in Demo Mode**

### 1. **Complete User Flow**
- ✅ User registration and authentication
- ✅ Lab browsing and catalog display
- ✅ Shopping cart functionality
- ✅ Checkout process (creates orders in database)
- ✅ Order tracking and status updates
- ✅ Error handling with graceful fallbacks

### 2. **Expected Demo Mode Behavior**
- Orders create with status: `pending_manual` or `fullscript_error`
- Notes field shows: "Fullscript integration failed: No Fullscript account found for user"
- Users see appropriate "pending Fullscript" messages
- System remains fully functional for testing

## 🧪 **Testing Checklist**

### **Step 1: Test User Registration**
1. Go to your app's signup page
2. Create a new user account
3. Verify user is created in `profiles` table
4. Check for Fullscript account creation attempt (will fail gracefully)

### **Step 2: Test Lab Browsing**
1. Navigate to `/labs` or `/lab-catalog`
2. Browse available lab panels
3. Verify lab data displays correctly
4. Test search and filtering (if implemented)

### **Step 3: Test Shopping Cart**
1. Add multiple lab panels to cart
2. Verify cart updates correctly
3. Test quantity changes
4. Test item removal

### **Step 4: Test Checkout Flow**
1. Proceed to checkout
2. Fill out any required forms
3. Complete the checkout process
4. Verify order is created in database

### **Step 5: Verify Order Creation**
Run this SQL in Supabase SQL Editor:
```sql
SELECT 
  order_number,
  status,
  notes,
  total_amount,
  created_at
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
ORDER BY created_at DESC
LIMIT 10;
```

Expected results:
- Status: `pending_manual` or `fullscript_error`
- Notes: Contains "Fullscript integration failed"
- Order number: Generated correctly
- Total amount: Calculated properly

### **Step 6: Test Integration Status**
1. Navigate to `/test-integration`
2. Run the integration tests
3. Verify all components are working
4. Check error messages are appropriate

## 📊 **Database Verification Queries**

### Check Orders Table:
```sql
-- Recent orders
SELECT 
  id,
  order_number,
  status,
  total_amount,
  notes,
  created_at
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
ORDER BY created_at DESC
LIMIT 5;

-- Order status summary
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
GROUP BY status;
```

### Check Fullscript Integration Fields:
```sql
-- Verify migration applied
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'fullscript%';
```

### Check New Tables:
```sql
-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('fullscript_webhooks', 'fullscript_sync_status');
```

## 🎯 **Test Scenarios**

### **Scenario 1: New User Journey**
1. User signs up
2. Browses labs
3. Adds 3 different lab panels to cart
4. Proceeds to checkout
5. Completes order
6. **Expected:** Order created with `pending_manual` status

### **Scenario 2: Error Handling**
1. Try to checkout with empty cart
2. Try to checkout with invalid lab IDs
3. **Expected:** Appropriate error messages displayed

### **Scenario 3: Order Management**
1. Create multiple orders
2. Check order history
3. **Expected:** All orders visible with correct status

## 🔧 **Integration Test Component**

The `/test-integration` page will show you:
- ✅ Database migration status
- ✅ Fullscript account setup status
- ✅ Lab catalog sync status
- ✅ Edge function deployment status
- ✅ Webhook handler status

## 📱 **Mobile Testing**

Test on mobile devices:
- Lab browsing and selection
- Cart management
- Checkout flow
- Responsive design

## 🚨 **Common Issues & Solutions**

### **"Order not created"**
- Check if user is authenticated
- Verify lab panels exist in database
- Check Edge Function logs in Supabase dashboard

### **"Fullscript account creation failed"**
- **Expected behavior** without API keys
- Check logs for specific error messages
- Verify user profile creation

### **"Checkout not working"**
- Check if CheckoutFlow component is properly imported
- Verify cart has items
- Check for JavaScript errors in browser console

## 🎉 **Success Criteria**

Your demo mode is working correctly when:
- ✅ Users can register and login
- ✅ Lab browsing works smoothly
- ✅ Cart functionality is responsive
- ✅ Checkout creates orders in database
- ✅ Orders show appropriate pending status
- ✅ Error messages are user-friendly
- ✅ Integration test page shows expected results

## 📈 **Performance Testing**

### **Load Testing:**
- Create multiple orders quickly
- Test with large lab catalogs
- Verify database performance

### **Error Recovery:**
- Test network interruptions
- Test invalid data inputs
- Verify graceful error handling

## 🔄 **Next Steps After Testing**

Once demo mode is working perfectly:
1. **Apply for Fullscript API access** (https://developer.fullscript.com)
2. **Prepare professional pages** for Fullscript review
3. **Configure real API credentials** when approved
4. **Test with real Fullscript integration**
5. **Go live with real users**

---

**Your lab ordering platform is ready for testing!** 🚀

Start with the testing checklist above and verify everything works as expected. The system is designed to be fully functional even without Fullscript credentials.
