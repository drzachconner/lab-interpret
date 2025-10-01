# Send Branded Email Function

This edge function handles sending branded emails for BiohackLabs.ai using Resend.

## Templates Available

- `confirm_signup` - Welcome email with account confirmation
- `reset_password` - Password reset email
- `magic_link` - Secure login link email
- `invite_user` - User invitation email

## Usage

Call this function with the following payload:

```json
{
  "to": "user@example.com",
  "subject": "Welcome to BiohackLabs.ai",
  "template": "confirm_signup",
  "confirmationUrl": "https://app.biohacklabs.ai/confirm?token=...",
  "userName": "John Doe"
}
```

## SMTP Configuration

Make sure to configure your Resend SMTP settings in Supabase Auth:
- From: support@biohacklabs.ai  
- SMTP Provider: Resend
- API Key: Set in RESEND_API_KEY secret