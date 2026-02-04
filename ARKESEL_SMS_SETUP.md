# Arkesel SMS Integration - Setup Guide

## 📱 What is Arkesel?

Arkesel is a Ghana-based SMS service provider that allows you to send SMS notifications to your users. It's affordable, reliable, and easy to integrate.

## 💰 Pricing

- **~GH₵0.025 - GH₵0.030 per SMS**
- Bulk discounts available
- Minimum purchase: ~GH₵30 (1,000-1,200 SMS)
- No monthly fees, pay-as-you-go

## 🚀 Setup Instructions

### Step 1: Create Arkesel Account

1. Visit [https://arkesel.com](https://arkesel.com)
2. Click "Sign Up" or "Get Started"
3. Fill in your business details
4. Verify your email address
5. Complete your profile

### Step 2: Top Up Your Account

1. Log in to your Arkesel dashboard
2. Click "Top Up" or "Add Credit"
3. Choose your payment method (Mobile Money, Card, etc.)
4. Add at least GH₵30 to start

### Step 3: Get Your API Key

1. Go to your Arkesel dashboard
2. Navigate to **Settings** → **API Keys**
3. Copy your **API Key**
4. Keep it secure (don't share it publicly)

### Step 4: Register Sender ID (Optional but Recommended)

1. In your dashboard, go to **Sender IDs**
2. Click **"Register New Sender ID"**
3. Enter: **GridNexus** (or your preferred name)
4. Submit for approval (usually takes 1-2 business days)
5. Once approved, your SMS will show "GridNexus" as the sender

**Note:** Until approved, you can use a default sender ID like your phone number.

### Step 5: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Arkesel SMS Configuration
ARKESEL_API_KEY=your_actual_api_key_here
ARKESEL_SENDER_ID=GridNexus
```

### Step 6: Test Your Integration

Run this test to ensure everything works:

```bash
# In your project directory
npm run dev
```

Then test by creating a project or triggering a notification.

## 📋 When SMS Are Sent

GridNexus automatically sends SMS to **clients only** for these events:

1. ✅ **Project Accepted** - When developer accepts their project
2. 💰 **Payment Confirmed** - When payment is secured in escrow
3. 📦 **Project Completed** - When developer marks project as done
4. 🎉 **Project Delivered** - When work is submitted for review
5. 📹 **Meeting Started** - When developer starts a video meeting
6. 💬 **Important Messages** - Critical project updates

**Note:** Developers don't receive SMS (only clients do) to save costs.

## 🔧 How It Works

1. When a notification is created for a client
2. System checks if client has a phone number in their profile
3. If yes, sends SMS automatically via Arkesel
4. SMS delivery happens in the background (non-blocking)
5. If SMS fails, the in-app notification still works

## 📊 Monitoring SMS Usage

### Check Your Balance

You can check your SMS balance programmatically:

```typescript
import { arkeselClient } from '@/lib/arkesel/client'

const balance = await arkeselClient.checkBalance()
console.log(`SMS Credits: GHS ${balance.balance}`)
```

### Dashboard Monitoring

- Log in to [Arkesel Dashboard](https://arkesel.com/login)
- View sent messages
- Check delivery status
- Monitor balance
- Download reports

## 🎯 Phone Number Format

The system automatically formats phone numbers:

- **Input:** `0241234567` → **Output:** `233241234567`
- **Input:** `+233241234567` → **Output:** `233241234567`
- **Input:** `233241234567` → **Output:** `233241234567`

Clients should enter their phone numbers in any of these formats in their profile.

## 🛠️ Troubleshooting

### SMS Not Sending?

1. **Check API Key**: Ensure `ARKESEL_API_KEY` is correct in `.env.local`
2. **Check Balance**: Log in to Arkesel and verify you have credits
3. **Check Phone Number**: Ensure client has a valid phone number in their profile
4. **Check Logs**: Look at your terminal/console for error messages
5. **Verify Sender ID**: If using custom sender, ensure it's approved

### Common Errors

| Error | Solution |
|-------|----------|
| "Insufficient balance" | Top up your Arkesel account |
| "Invalid API key" | Check your API key in `.env.local` |
| "Invalid phone number" | Ensure phone number is in correct format |
| "Sender ID not approved" | Use default sender or wait for approval |

## 💡 Cost Optimization Tips

1. **Only send critical notifications via SMS**
2. **Use in-app notifications for non-urgent updates**
3. **SMS are only sent to clients, not developers** (already implemented)
4. **Monitor your usage weekly** to avoid running out of credits
5. **Buy in bulk** (e.g., 10,000 SMS) for better rates

## 📞 Support

### Arkesel Support
- Email: support@arkesel.com
- Phone: Check their website
- WhatsApp: Available on their contact page

### GridNexus SMS Support
If you encounter issues with the integration, check:
1. Server logs for error messages
2. Arkesel dashboard for delivery status
3. GitHub issues or contact your developer

## 🔐 Security Best Practices

1. ✅ Never commit your API key to Git
2. ✅ Use environment variables (`.env.local`)
3. ✅ Keep `.env.local` in `.gitignore`
4. ✅ Rotate API keys periodically
5. ✅ Monitor usage for suspicious activity

## 📈 Scaling

As your platform grows:

- **1,000 users**: ~GH₵90-150/month
- **5,000 users**: ~GH₵400-700/month
- **10,000+ users**: Contact Arkesel for enterprise pricing

Consider upgrading to bulk plans when you hit these thresholds.

---

## ✅ Quick Checklist

- [ ] Created Arkesel account
- [ ] Topped up account (min GH₵30)
- [ ] Copied API key
- [ ] Registered Sender ID (optional)
- [ ] Added credentials to `.env.local`
- [ ] Tested SMS sending
- [ ] Clients have phone numbers in profiles
- [ ] Monitoring dashboard bookmarked

---

**You're all set! 🎉** Clients will now receive SMS notifications for important events on GridNexus.
