# 💳 Stripe Product Setup Guide

## 1. Create Your Lab Analysis Product

### Go to: https://dashboard.stripe.com/products

### Click "Add Product" and fill in:
- **Name**: Lab Analysis & Interpretation
- **Description**: AI-powered functional medicine lab analysis with personalized supplement recommendations
- **Price**: $19.00
- **Billing**: One-time
- **Currency**: USD

### After creating, copy the Price ID (starts with `price_`)

## 2. Update Your Local .env File

Add this line to your .env file:
```
VITE_STRIPE_INTERPRETATION_PRICE_ID=price_YOUR_PRICE_ID_HERE
```

## 3. Configure Webhook (Optional but recommended)

### In Stripe Dashboard → Developers → Webhooks:

1. Click "Add endpoint"
2. Endpoint URL: `https://zhdjvfylxgtiphldjtqf.supabase.co/functions/v1/verify-payment`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the signing secret (starts with `whsec_`)

## 4. Quick Test Checklist

- [ ] Product created in Stripe
- [ ] Price ID copied
- [ ] Price ID added to .env file
- [ ] Webhook configured (optional)
- [ ] Test mode enabled in Stripe

## 5. Test Credit Cards for Development

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

Use any future date for expiry and any 3 digits for CVC.

---

## 📊 Expected Flow

1. User uploads lab PDF → Creates order record
2. Redirects to Stripe Checkout with $19 price
3. User pays with card
4. Stripe webhook triggers → Updates order status to "paid"
5. Triggers AI analysis edge function
6. Analysis saved to database
7. User sees results page

---

## 🔍 Verify in Stripe Dashboard

After setup, you should see:
- Product listed in Products section
- Price ID visible
- Test mode indicator active
- Webhook endpoint (if configured)