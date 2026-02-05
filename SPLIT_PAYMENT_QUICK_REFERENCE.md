# Split Payment Quick Reference

Quick guide for understanding and working with the split payment system.

## 🎯 Core Concept

**60% Initial Payment** → Start Work → **40% Final Payment** → Client Approves → **Release Both**

---

## 💻 Code Changes Summary

### 1. Database Schema
```sql
-- Added to payments table
payment_type VARCHAR(20) CHECK IN ('full', 'initial', 'final')
```

### 2. TypeScript Types
```typescript
// types/index.ts
export type PaymentType = 'full' | 'initial' | 'final';

export interface Payment {
  // ... existing fields
  payment_type: PaymentType;
}
```

### 3. Payment Initialization
```typescript
// app/api/payments/initialize/route.ts

// Calculate payment amount based on type
const paymentAmount = paymentType === 'initial' 
  ? amount * 0.6  // 60%
  : paymentType === 'final'
  ? amount * 0.4  // 40%
  : amount;       // 100% (legacy)
```

### 4. Payment Verification
```typescript
// app/api/payments/verify/route.ts

// Update project status based on payment type
if (paymentType === 'initial' || paymentType === 'full') {
  // Start project on initial payment
  await supabase
    .from('projects')
    .update({ status: 'in_progress' })
    .eq('id', projectId);
}
// Final payment doesn't change status - keeps "completed"
```

### 5. Developer Submission
```typescript
// app/developer/projects/[id]/page.tsx

const submitDelivery = async () => {
  // Mark as completed
  await supabase
    .from('projects')
    .update({ status: 'completed' })
    .eq('id', projectId);

  // Notify client to pay final 40%
  await supabase.from('notifications').insert({
    title: 'Project Completed - Final Payment Required',
    message: 'Please pay the remaining 40%...',
  });
};
```

### 6. Client Payment UI
```typescript
// app/client/projects/[id]/page.tsx

// Check payment status
const [initialPaymentExists, setInitialPaymentExists] = useState(false);
const [finalPaymentExists, setFinalPaymentExists] = useState(false);

// Pay initial 60%
{project.status === "approved" && !initialPaymentExists && (
  <Button onClick={() => handlePayment('initial')}>
    Pay Initial 60%
  </Button>
)}

// Pay final 40%
{project.status === "completed" && !finalPaymentExists && (
  <Button onClick={() => handlePayment('final')}>
    Pay Final 40%
  </Button>
)}
```

### 7. Payment Release
```typescript
// app/client/projects/[id]/page.tsx

const acceptDelivery = async () => {
  // Check both payments made
  if (!initialPaymentExists || !finalPaymentExists) {
    toast.error("Both payments must be completed");
    return;
  }

  // Release both payments
  await supabase
    .from('payments')
    .update({ 
      status: 'released',
      release_date: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .in('payment_type', ['initial', 'final']);
};
```

---

## 📊 Payment Status Flow

```
Project Status    Payment Type    Amount    Action
═══════════════════════════════════════════════════════════
approved       →  initial        60%    → Client pays initial
in_progress    →  (working...)    -     → Developer works
completed      →  final          40%    → Client pays final
completed      →  (review...)     -     → Client reviews work
delivered      →  released       100%   → Both payments released
```

---

## 🔍 Check Payment Status

```typescript
// Check initial payment
const { data: initialPayment } = await supabase
  .from('payments')
  .select('*')
  .eq('project_id', projectId)
  .eq('payment_type', 'initial')
  .eq('status', 'escrowed')
  .maybeSingle();

// Check final payment
const { data: finalPayment } = await supabase
  .from('payments')
  .select('*')
  .eq('project_id', projectId)
  .eq('payment_type', 'final')
  .eq('status', 'escrowed')
  .maybeSingle();
```

---

## 🧮 Payment Calculations

```typescript
// Given project cost
const projectCost = 1500; // GH₵1,500

// Calculate payments
const initialPayment = projectCost * 0.6;  // GH₵900
const finalPayment = projectCost * 0.4;    // GH₵600

// Paystack requires amount in pesewas (cents)
const paystackAmount = Math.round(initialPayment * 100); // 90000 pesewas
```

---

## 🔔 Notification Messages

### Initial Payment
```typescript
// Client
"Initial payment (60%) secured in escrow."

// Developer
"Initial payment received. Start working on the project."
```

### Final Payment
```typescript
// Client
"Final payment (40%) secured in escrow. Review and approve work."

// Developer  
"Final payment received. Awaiting client approval."
```

### Completion
```typescript
// Client notification (when dev marks complete)
"Project completed - pay final 40% to review and approve."
```

---

## 🎨 UI Components

### Payment Progress Display
```tsx
<div className="space-y-2">
  <div className="flex justify-between">
    <span>Initial Payment (60%)</span>
    <span>{initialPaymentExists ? "✓ Paid" : "Pending"}</span>
  </div>
  <div>{formatCurrency(projectCost * 0.6)}</div>
  
  <div className="flex justify-between">
    <span>Final Payment (40%)</span>
    <span>{finalPaymentExists ? "✓ Paid" : "On Completion"}</span>
  </div>
  <div>{formatCurrency(projectCost * 0.4)}</div>
</div>
```

---

## ✅ Testing Checklist

- [ ] Create project → Developer accepts
- [ ] Client pays 60% → Status: "in_progress"
- [ ] Developer marks complete → Client notified
- [ ] Client pays 40% → Both payments in escrow
- [ ] Client approves → Both payments released
- [ ] Check Paystack dashboard for transactions
- [ ] Verify SMS/Email notifications sent

---

## 🐛 Troubleshooting

### Payment button not showing?
```typescript
// Check project status
console.log('Status:', project.status);
console.log('Initial paid:', initialPaymentExists);
console.log('Final paid:', finalPaymentExists);
```

### Payment not going through?
```typescript
// Check Paystack response
console.log('Paystack data:', data);
console.log('Payment amount:', amount * 100, 'pesewas');
```

### Wrong amount charged?
```typescript
// Verify calculation
const expected = paymentType === 'initial' ? amount * 0.6 : amount * 0.4;
console.log('Expected amount:', expected);
console.log('Actual amount:', paymentAmount);
```

---

## 📁 Modified Files

### Database
- `database/ADD_SPLIT_PAYMENT_TYPE.sql` - Schema update

### Types
- `types/index.ts` - Payment type definition

### Backend APIs
- `app/api/payments/initialize/route.ts` - Payment calculation
- `app/api/payments/verify/route.ts` - Status handling

### Frontend Pages
- `app/client/projects/[id]/page.tsx` - Client payment UI
- `app/developer/projects/[id]/page.tsx` - Completion trigger

### Documentation
- `SPLIT_PAYMENT_SYSTEM.md` - Full documentation
- `SPLIT_PAYMENT_QUICK_REFERENCE.md` - This file

---

## 🚀 API Endpoint Usage

### Initialize Payment
```bash
POST /api/payments/initialize
Content-Type: application/json

{
  "projectId": "uuid-here",
  "amount": 1500,
  "paymentType": "initial"  # or "final"
}
```

### Response
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "..."
}
```

---

## 💡 Best Practices

1. **Always check payment status** before showing payment buttons
2. **Validate both payments** before allowing approval
3. **Show clear progress** to clients (60% paid, 40% pending)
4. **Send notifications** at each milestone
5. **Handle errors gracefully** - payment failures shouldn't break flow
6. **Log transactions** for debugging
7. **Test with Paystack test cards** before production

---

## 📞 Need Help?

- Full documentation: `SPLIT_PAYMENT_SYSTEM.md`
- Paystack docs: https://paystack.com/docs
- Supabase docs: https://supabase.com/docs

---

**Last Updated:** February 2026
