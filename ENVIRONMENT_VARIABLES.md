# Environment Variables Setup

## Required Environment Variables

Add these environment variables to your Supabase Edge Functions environment and your local development environment:

### Supabase Configuration
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Fullscript API Configuration
Get these from your Fullscript developer account at https://developer.fullscript.com/

```bash
FULLSCRIPT_API_KEY=your_fullscript_api_key
FULLSCRIPT_PRACTITIONER_ID=your_practitioner_id
FULLSCRIPT_CLIENT_ID=your_client_id
FULLSCRIPT_CLIENT_SECRET=your_client_secret
FULLSCRIPT_WEBHOOK_SECRET=your_webhook_secret
```

### OpenAI for Lab Analysis
```bash
OPENAI_API_KEY=your_openai_key
```

### Stripe for Interpretation Fees Only
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Email Service (Resend)
```bash
RESEND_API_KEY=your_resend_api_key
```

### Other Services
```bash
VITE_APP_URL=https://your-domain.com
```

## Setting Up Environment Variables

### For Supabase Edge Functions:
1. Go to your Supabase dashboard
2. Navigate to Settings > Edge Functions
3. Add the environment variables in the "Environment Variables" section
4. Make sure to include all the Fullscript API keys

### For Local Development:
1. Create a `.env.local` file in your project root
2. Add all the environment variables listed above
3. Restart your development server

## Fullscript API Setup

1. Sign up for a Fullscript developer account at https://developer.fullscript.com/
2. Create a new application
3. Get your API credentials from the dashboard
4. Set up webhooks for order status updates
5. Configure your practitioner ID and dispensary settings

## Important Notes

- The Fullscript API handles all lab payments and pricing
- We only process the $19 interpretation fee through Stripe
- All lab orders are created as Fullscript treatment plans
- Users are redirected to Fullscript for secure payment processing
- Commission is handled automatically by Fullscript
