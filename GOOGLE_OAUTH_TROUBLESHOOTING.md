# 🔧 Google OAuth Troubleshooting Guide

## 🚨 **Issue: Internal Service Error with Google Sign-In**

This is a common development issue. Let's fix it step by step.

## 🔍 **Step 1: Check Supabase Google OAuth Configuration**

### In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Check if **Google** is enabled
3. If enabled, verify **Client ID** and **Client Secret** are configured

### Common Issues:
- ❌ Google OAuth not configured
- ❌ Missing Client ID/Secret
- ❌ Incorrect redirect URLs
- ❌ Google Cloud Console not set up

## 🎯 **Quick Fix: Use Email/Password for Testing**

Since Google OAuth setup is complex, let's use email/password authentication for demo testing:

### Option 1: Test with Email/Password
1. Go to your app's signup page
2. Use **email/password** instead of Google
3. Create test account: `test@demo.com`
4. Proceed with testing

### Option 2: Fix Google OAuth (Advanced)
If you want to fix Google OAuth:

#### 1. Set up Google Cloud Console:
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project or select existing
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URIs:
  - `https://zhdjvfylxgtiphldjtqf.supabase.co/auth/v1/callback`

#### 2. Configure Supabase:
- Copy Client ID and Secret from Google Console
- Paste into Supabase Authentication → Providers → Google
- Save configuration

## 🧪 **Continue Testing with Email/Password**

Let's proceed with the demo testing using email/password authentication:

### Test User Accounts:
- `test@demo.com` / `password123`
- `demo@test.com` / `password123`
- `user@example.com` / `password123`

### Testing Steps:
1. **Sign up** with email/password
2. **Browse labs** at `/labs` or `/lab-catalog`
3. **Add labs to cart**
4. **Complete checkout**
5. **Verify order creation**

## 🔧 **Alternative: Test Without Authentication**

If you want to test the core functionality without authentication:

### Option 1: Bypass Auth for Testing
Temporarily modify your app to skip authentication for testing.

### Option 2: Use Existing User
If you have any existing users in your database, use those for testing.

## 📊 **Expected Results with Email/Password**

| Test | Expected Result |
|------|----------------|
| User Registration | ✅ Creates user in profiles table |
| Lab Browsing | ✅ Displays lab catalog |
| Shopping Cart | ✅ Full cart functionality |
| Checkout | ✅ Creates order with pending_manual status |
| Order Tracking | ✅ Shows in database |

## 🚨 **Common Auth Issues & Solutions**

### "Internal Service Error"
- **Cause:** Google OAuth not configured
- **Solution:** Use email/password or configure Google OAuth

### "Invalid credentials"
- **Cause:** Wrong email/password
- **Solution:** Check credentials or create new account

### "User already exists"
- **Cause:** Email already registered
- **Solution:** Use different email or sign in with existing account

### "Network error"
- **Cause:** Supabase connection issue
- **Solution:** Check internet connection and Supabase status

## 🎯 **Quick Test Plan**

### 1. Test Email/Password Signup:
```bash
# Create test user
Email: test@demo.com
Password: password123
```

### 2. Test Lab Ordering:
1. Sign in with test account
2. Browse labs
3. Add to cart
4. Checkout
5. Verify order in database

### 3. Check Database:
```sql
-- Check if user was created
SELECT id, email, created_at 
FROM profiles 
WHERE email = 'test@demo.com';

-- Check if order was created
SELECT order_number, status, total_amount, created_at
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
ORDER BY created_at DESC
LIMIT 5;
```

## 🚀 **Next Steps**

1. **Use email/password** for testing (recommended)
2. **Complete the demo testing plan**
3. **Document results** for Fullscript application
4. **Fix Google OAuth later** (optional)

## 💡 **Pro Tip**

For demo purposes, email/password authentication is perfectly fine. You can always add Google OAuth later when you're ready to go live with real users.

---

**Let's continue with email/password testing and get your demo mode working!** 🎉
