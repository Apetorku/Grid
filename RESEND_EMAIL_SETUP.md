# Resend Email Notification Setup

This guide explains how to set up and use Resend email notifications in GridNexus.

## Overview

GridNexus uses **Resend** (https://resend.com) to send email notifications to clients about important events like:
- New notifications
- Payment confirmations
- Meeting invitations
- Project updates

**Free Tier**: 3,000 emails/month, 100 emails/day
**Cost after free tier**: $20/month for 50,000 emails

## Setup Instructions

### 1. Create a Resend Account

1. Visit https://resend.com
2. Sign up with your email
3. Verify your email address
4. Access your dashboard

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Create a new API key or copy the existing one
4. The key format looks like: `re_xxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Verify Your Domain (Optional but Recommended)

**For testing/development**: You can skip this step and use `onboarding@resend.dev` (Resend's free sending address)

**For production**: Verify your domain for professional emails:

1. Go to **Domains** in your Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `gridnexus.com`)
4. Add the DNS records provided by Resend to your domain's DNS settings:
   - SPF record
   - DKIM record
   - DMARC record
5. Wait for verification (usually takes a few minutes to a few hours)

**Without domain verification**: Emails sent from `onboarding@resend.dev` ✅ Works immediately
**With domain verification**: Emails sent from `noreply@yourdomain.com` ✅ More professional

### 4. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here

# Option 1: No domain (works immediately, perfect for testing)
RESEND_FROM_EMAIL=onboarding@resend.dev

# Option 2: Custom domain (only after verifying your domain)
# RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important Notes**:
- Use your actual API key from Resend dashboard
- Start with `onboarding@resend.dev` - it works immediately without any domain setup
- Upgrade to your own domain later when you're ready for production
- Never commit your actual API key to version control

## How It Works

### Email Sending Flow

1. **Event Triggered**: Payment, meeting, or notification created
2. **User Role Check**: System checks if recipient is a client
3. **Email Check**: Verifies client has an email address
4. **Email Sent**: Resend API sends branded HTML email
5. **Async Execution**: Email sending doesn't block the main request

### Email Template

Emails are sent with a professional HTML template including:
- GridNexus branding
- Notification title
- Message content
- Action button (if link provided)
- Footer with unsubscribe option

### Code Example

```typescript
import { resendClient } from '@/lib/resend/client'

// Send notification email
await resendClient.sendNotificationEmail(
  'client@example.com',
  'Payment Successful',
  'Your payment has been secured in escrow.',
  'https://gridnexus.com/client/projects/123'
)
```

## Email Notifications in GridNexus

### 1. General Notifications (`/api/notifications`)
- Sends email to clients for all notification types
- Includes optional link to relevant page

### 2. Payment Notifications (`/api/payments/verify`)
- Sent when payment is successfully verified
- Links to the project page
- Confirms payment is in escrow

### 3. Meeting Notifications (`/api/meetings/create`)
- Sent when a meeting is started
- Includes join meeting link
- Only sent to clients

## Testing

### Test Email Sending

Use the manual email API endpoint:

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "title": "Test Notification",
    "message": "This is a test email from GridNexus",
    "link": "https://gridnexus.com/client"
  }'
```

### Check Email Logs

1. Go to your Resend dashboard
2. Navigate to **Logs** section
3. View sent emails, delivery status, and any errors
4. Check bounce rates and open rates

## Troubleshooting

### Emails Not Sending

**Check API Key**:
```bash
# Verify environment variable is set
echo $RESEND_API_KEY
```

**Check Logs**:
- Browser console for frontend errors
- Server logs for backend errors
- Resend dashboard for delivery issues

**Common Issues**:
1. Invalid API key → Check `.env.local` file
2. Invalid FROM email → Use `onboarding@resend.dev` if no domain verified
3. Rate limiting → Free tier limited to 100 emails/day
4. Blocked by recipient → Check spam folder

### Can I Use It Without a Domain?

**YES!** You can start sending emails immediately using `onboarding@resend.dev` without any domain setup. This is perfect for:
- Development and testing
- MVP/early stage projects  
- Learning and experimentation

When you're ready for production, you can verify your own domain for more professional emails.

### Email Goes to Spam

**Solutions**:
1. Verify your domain with Resend
2. Add proper DNS records (SPF, DKIM, DMARC)
3. Don't use spammy language in subject/body
4. Keep content professional and relevant

## Cost Management

### Free Tier: 3,000 emails/month

**Current Implementation Saves Costs**:
- ✅ Only sends to clients (not developers)
- ✅ Sends async (doesn't retry on failure)
- ✅ Only sends for critical events
- ✅ No automatic retries (one attempt only)

### Estimated Monthly Costs

**Small Scale** (10 clients, 5 projects/month):
- ~150 emails/month
- **Cost**: FREE

**Medium Scale** (50 clients, 25 projects/month):
- ~750 emails/month
- **Cost**: FREE

**Large Scale** (200 clients, 100 projects/month):
- ~3,000 emails/month
- **Cost**: FREE (at free tier limit)

**Enterprise Scale** (500+ clients):
- 7,500+ emails/month
- **Cost**: $20/month (50,000 emails included)

## Best Practices

1. **Verify Your Domain**: Professional emails from your domain
2. **Monitor Logs**: Check Resend dashboard regularly
3. **Test Thoroughly**: Send test emails before production
4. **Handle Errors**: Email failures logged but don't break app
5. **Keep Content Clean**: Professional, concise messages
6. **Include Links**: Direct users to relevant pages
7. **Provide Context**: Clear subject lines and content

## Dual Notification System

GridNexus uses **both SMS and Email** for redundancy:

**SMS (Arkesel)**:
- Instant delivery
- High open rate
- Best for urgent notifications
- Cost: ~GH₵0.025-0.030 per SMS

**Email (Resend)**:
- Free up to 3,000/month
- Detailed information
- Professional branding
- Better for non-urgent updates

**Strategy**:
- Critical events → SMS + Email
- Non-critical → Email only
- Cost-effective and reliable

## Support

**Resend Documentation**: https://resend.com/docs
**Resend Status**: https://status.resend.com
**GridNexus Support**: support@gridnexus.com

## Files Reference

- `/lib/resend/client.ts` - Resend client implementation
- `/app/api/email/send/route.ts` - Manual email sending API
- `/app/api/notifications/route.ts` - Auto email on notifications
- `/app/api/payments/verify/route.ts` - Email on payment success
- `/app/api/meetings/create/route.ts` - Email on meeting start

---

**Last Updated**: January 2025
**Version**: 1.0.0
