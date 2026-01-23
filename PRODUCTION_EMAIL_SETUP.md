# Production Email Configuration for GridNexus

## Using Resend (Recommended)

### **Why Resend?**
- Modern developer-friendly API
- Free: 3,000 emails/month, 100 emails/day
- Great documentation and Next.js integration
- Excellent deliverability
- No credit card required for free tier

---

## **Quick Setup (5 minutes)**

### **Step 1: Create Resend Account**
1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address

### **Step 2: Get API Key**
1. After login, go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name it: "GridNexus Production"
4. Select permissions: **Sending access**
5. Click **Create**
6. **Copy the API key** (starts with `re_`)

### **Step 3: Configure Domain (Optional but Recommended)**
**Option A: Use Resend's Domain (Quick Start)**
- No setup needed
- Sender: `onboarding@resend.dev`
- Good for testing and MVP

**Option B: Add Your Domain (Professional)**
1. In Resend dashboard, click **Domains**
2. Click **Add Domain**
3. Enter your domain: `gridnexus.com`
4. Add these DNS records to your domain provider:

```
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT  
Name: @
Value: v=spf1 include:resend.com ~all

Type: MX
Priority: 10
Value: feedback-smtp.resend.com
```

5. Wait for verification (usually 5-10 minutes)
6. Use: `noreply@yourdomain.com`

### **Step 4: Configure in Supabase**
1. Go to your Supabase Dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**
4. Scroll to **SMTP Settings**
5. Toggle **"Enable Custom SMTP"**

**Enter these values:**
```
SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP User: resend
SMTP Password: re_xxxxxxxxxxxx (your API key from Step 2)

Sender Email: noreply@yourdomain.com
  (or onboarding@resend.dev if using their domain)
  
Sender Name: GridNexus
```

6. Click **Save**

### **Step 5: Test Email Sending**
1. In your app, try signing up a new user
2. Check email delivery
3. Verify confirmation link works

**Check Resend logs:**
- Go to Resend dashboard → **Logs**
- See all sent emails and delivery status

---

## **Update Environment Variables**

Add to your `.env.local`:

```bash
# Resend Configuration (Optional - for direct API usage)
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## **Supabase URL Configuration**

Make sure these are set correctly:

**In Supabase Dashboard → Authentication → URL Configuration:**

```
Site URL: https://yourdomain.com

Redirect URLs (whitelist):
https://yourdomain.com/auth/callback
https://yourdomain.com/client
https://yourdomain.com/developer
```

---

## **Email Templates (Optional Customization)**

In Supabase → Authentication → Email Templates, customize:

### **Confirm Signup:**
```html
<h2>Welcome to GridNexus!</h2>
<p>Hi {{ .Name }},</p>
<p>Thanks for signing up! Click the button below to verify your email:</p>
<a href="{{ .ConfirmationURL }}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Confirm Email
</a>
<p>Or copy this link: {{ .ConfirmationURL }}</p>
```

### **Reset Password:**
```html
<h2>Reset Your Password</h2>
<p>Click the button below to reset your GridNexus password:</p>
<a href="{{ .ConfirmationURL }}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Reset Password
</a>
```

---

## **Monitoring & Analytics**

### **Resend Dashboard**
- **Logs**: See all sent emails
- **Analytics**: Delivery rates, opens, clicks
- **Webhooks**: Get notified of bounces/complaints

### **Set up Webhooks (Optional)**
1. In Resend dashboard → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/webhooks/email`
3. Select events: `email.delivered`, `email.bounced`, `email.complained`

---

## **Rate Limits**

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for MVP and testing

**Paid Tier ($20/month):**
- 50,000 emails/month
- No daily limit
- Priority support

---

## **Troubleshooting**

### **Emails Not Sending**
1. Check SMTP credentials in Supabase
2. Verify API key is correct and has sending permissions
3. Check Resend logs for errors
4. Ensure sender email matches verified domain

### **Emails Going to Spam**
1. Verify your domain with Resend
2. Add SPF, DKIM, DMARC records
3. Use a verified sender email
4. Avoid spam trigger words in subject/content

### **Still See "Rate Limit Exceeded"**
1. Make sure Custom SMTP is **enabled** in Supabase
2. Wait 5 minutes for changes to propagate
3. Try signup again
4. Check Resend dashboard for delivery status

---

## **Testing Checklist**

- [ ] Created Resend account
- [ ] Got API key
- [ ] Configured SMTP in Supabase
- [ ] Set correct sender email
- [ ] Updated Site URL in Supabase
- [ ] Added redirect URLs
- [ ] Tested signup with new email
- [ ] Email received successfully
- [ ] Confirmation link works
- [ ] Checked Resend logs

---

## **Alternative: Direct Resend API (Advanced)**

For more control, use Resend's API directly instead of SMTP:

```bash
npm install resend
```

Create `lib/email.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: 'GridNexus <noreply@yourdomain.com>',
    to,
    subject: 'Welcome to GridNexus!',
    html: `<h1>Welcome ${name}!</h1>`,
  })
}
```

---

## **Support**

- **Resend Docs**: https://resend.com/docs
- **Supabase SMTP Guide**: https://supabase.com/docs/guides/auth/auth-smtp
- **Resend Discord**: https://resend.com/discord
