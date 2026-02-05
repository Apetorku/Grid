# Resend Email Quick Reference

Quick reference for sending emails in GridNexus using Resend.

## Environment Variables

```bash
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional - defaults to onboarding@resend.dev (works without domain setup)
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Import

```typescript
import { resendClient } from '@/lib/resend/client'
```

## Send Email

```typescript
// Basic notification email
await resendClient.sendNotificationEmail(
  'client@example.com',
  'Payment Successful',
  'Your payment has been secured in escrow.'
)

// With action link
await resendClient.sendNotificationEmail(
  'client@example.com',
  'Meeting Started',
  'Join the meeting now!',
  'https://gridnexus.com/meetings/123'
)

// Async (don't wait for result)
resendClient.sendNotificationEmail(
  email,
  title,
  message,
  link
).catch(err => console.error('Email failed:', err))
```

## Check User Has Email

```typescript
const { data: userData } = await supabase
  .from('users')
  .select('email, role')
  .eq('id', userId)
  .single()

if (userData?.email && userData?.role === 'client') {
  // Send email
}
```

## Email Template Features

- GridNexus branding
- Professional HTML design
- Action button (optional)
- Responsive layout
- Dark blue theme (#1e3a8a)

## API Endpoints

### Manual Email Send
```bash
POST /api/email/send
Content-Type: application/json

{
  "to": "client@example.com",
  "title": "Test Email",
  "message": "Test message",
  "link": "https://gridnexus.com"
}
```

## Common Patterns

### Send to Client Only
```typescript
if (userData?.role === 'client' && userData.email) {
  resendClient.sendNotificationEmail(
    userData.email,
    title,
    message
  ).catch(err => console.error('Email failed:', err))
}
```

### Payment Success
```typescript
resendClient.sendNotificationEmail(
  clientEmail,
  'Payment Successful',
  'Your payment has been secured in escrow. The developer will start working on your project.',
  `${process.env.NEXT_PUBLIC_APP_URL}/client/projects/${projectId}`
)
```

### Meeting Started
```typescript
resendClient.sendNotificationEmail(
  clientEmail,
  'Meeting Started',
  'A meeting has been started for your project. Join now!',
  `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${sessionId}`
)
```

## Error Handling

```typescript
try {
  await resendClient.sendNotificationEmail(email, title, message)
} catch (error) {
  console.error('Email notification error:', error)
  // Don't fail the main request
}
```

## Limits

- **Free Tier**: 3,000 emails/month, 100/day
- **Paid**: $20/month for 50,000 emails
- **Rate Limit**: 10 requests/second

## Troubleshooting

**Email not sending?**
1. Check `RESEND_API_KEY` in `.env.local`
2. Verify `RESEND_FROM_EMAIL` is correct
3. Check Resend dashboard logs
4. Ensure recipient email is valid

**Goes to spam?**
1. Verify your domain in Resend
2. Add SPF/DKIM/DMARC records
3. Use professional language

## Resources

- Full setup: `RESEND_EMAIL_SETUP.md`
- Resend Docs: https://resend.com/docs
- Dashboard: https://resend.com/overview

---

**Quick Tip**: Always send emails asynchronously with `.catch()` to avoid blocking main requests!
