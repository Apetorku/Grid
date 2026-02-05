# Split Payment System (60% / 40%)

GridNexus now implements a split payment escrow system to protect both clients and developers:

## 💰 Payment Structure

**Total Project Cost** is split into two milestone payments:
- **60% Initial Payment** - Paid when project starts
- **40% Final Payment** - Paid when work is completed

Both payments are held securely in escrow until client approves the final delivery.

---

## 🔄 Complete Payment Flow

### 1. Project Creation & Bidding
```
Client creates project → Developer reviews → Developer accepts with final cost
```

### 2. Initial Payment (60%)
```
Project status: "approved"
↓
Client pays 60% of project cost
↓
Payment status: "escrowed" (held safely)
↓
Project status: "in_progress"
↓
Developer notified to start work
```

**Example:**
- Project cost: GH₵1,500
- Initial payment: GH₵900 (60%)
- Status: Held in escrow

### 3. Project Development
```
Project status: "in_progress"
↓
Developer works on project
↓
Developer and client communicate via chat
↓
Developer uploads deliverables
```

### 4. Work Completion
```
Developer marks project as "completed"
↓
System notifies client
↓
Client receives notification to pay remaining 40%
```

### 5. Final Payment (40%)
```
Project status: "completed"
↓
Client reviews completed work
↓
Client pays remaining 40%
↓
Payment status: "escrowed" (held safely)
↓
Both payments now in escrow
```

**Example:**
- Final payment: GH₵600 (40%)
- Total in escrow: GH₵1,500 (60% + 40%)

### 6. Client Approval & Payment Release
```
Project status: "completed" + Both payments escrowed
↓
Client reviews and approves work
↓
Project status: "delivered"
↓
BOTH payments (60% + 40%) released to developer
↓
Developer receives full GH₵1,500
```

---

## 🎯 Key Features

### For Clients:
✅ **Lower Initial Risk** - Only pay 60% upfront  
✅ **Work Guarantee** - Developer must complete before final payment  
✅ **Escrow Protection** - All funds secured until you approve  
✅ **Milestone Control** - Two payment checkpoints

### For Developers:
✅ **Upfront Capital** - Get 60% to start work  
✅ **Completion Incentive** - Final 40% on delivery
✅ **Payment Security** - Both payments guaranteed in escrow  
✅ **Professional Structure** - Industry-standard milestone system

---

## 📊 Payment Status Tracking

### Client Dashboard Shows:
```
Payment Progress:
✓ Initial Payment (60%): GH₵900 - Paid
  Final Payment (40%):  GH₵600 - Due on Completion
```

### Status Indicators:
- **"Pending"** - Payment not yet made
- **"✓ Paid"** - Payment secured in escrow
- **"Due Now"** - Payment required to proceed
- **"Released"** - Payment sent to developer

---

## 🔒 Security & Protection

### Escrow System:
1. **All payments go to Paystack escrow** - Not directly to developer
2. **Funds held securely** - Cannot be accessed until client approves
3. **Automatic release** - On client approval, both payments released together
4. **Dispute protection** - Platform admin can mediate if needed

### Client Protection:
- ✅ Money held until work approved
- ✅ Can review work before final payment
- ✅ Only full payment releases funds
- ✅ Can dispute if work unsatisfactory

### Developer Protection:
- ✅ 60% upfront to start work
- ✅ Guaranteed payment on completion
- ✅ Both payments released together
- ✅ Cannot work without initial payment

---

## 💳 Payment Methods

**All payments processed via Paystack:**
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Visa/Mastercard
- Bank Transfer
- All major Ghanaian payment methods

**Transaction Fees:** Paystack charges ~1.95% (paid by platform)

---

## 🚀 Implementation Details

### Database Schema
```sql
-- payments table has payment_type field
payment_type VARCHAR(20) CHECK IN ('full', 'initial', 'final')

-- 'full' = legacy 100% payment
-- 'initial' = 60% payment
-- 'final' = 40% payment
```

### Payment Calculation
```typescript
Initial Payment = Project Cost × 0.6  // 60%
Final Payment   = Project Cost × 0.4  // 40%
```

### Project Status Flow
```
pending → approved → in_progress → completed → delivered
           ↑ 60%                     ↑ 40%      ↑ Release
```

---

## 📱 User Experience

### Client Flow:
1. **Accept Quote** → See "Pay Initial 60%" button
2. **Pay 60%** → Developer starts work
3. **Developer Completes** → See "Pay Final 40%" button
4. **Pay 40%** → Review work
5. **Approve Work** → Both payments released

### Developer Flow:
1. **Accept Project** → Wait for 60% payment
2. **Receive 60%** → Start working
3. **Complete Work** → Wait for 40% payment
4. **Receive 40%** → Wait for client approval
5. **Client Approves** → Receive full payment

---

## 🔔 Notifications

### SMS + Email Alerts:

**Initial Payment (60%):**
- Client: "Initial payment (60%) secured in escrow"
- Developer: "Initial payment received, start working"

**Final Payment (40%):**
- Client: "Final payment (40%) secured in escrow, review work"
- Developer: "Final payment received, awaiting approval"

**Project Completion:**
- Client: "Project completed - pay final 40% to review"  

**Payment Release:**
- Client: "All payments released to developer"
- Developer: "Payment received - GH₵X,XXX deposited"

---

## ⚙️ Configuration

### Environment Variables
```bash
# No new config needed!
# Uses existing Paystack integration
PAYSTACK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

### Feature Flags
```typescript
// All new projects use split payment by default
// Old projects continue with full payment (legacy)
```

---

## 🧪 Testing

### Test the Flow:

1. **Create Test Project**
   - Client: Create new project
   - Developer: Accept with GH₵1,000 cost

2. **Initial Payment**
   - Client: Pay 60% (GH₵600)
   - Use Paystack test cards
   - Verify: Status → "in_progress"

3. **Complete Work**
   - Developer: Mark as completed
   - Verify: Client gets notification

4. **Final Payment**
   - Client: Pay 40% (GH₵400)
   - Use Paystack test cards
   - Verify: Both payments in escrow

5. **Approve & Release**
   - Client: Accept delivery
   - Verify: Both payments released
   - Status → "delivered"

### Test Cards (Paystack):
```
Success: 5060 6666 6666 6666 666
Decline: 5060 0000 0000 0000 017
```

---

## 📋 Migration Notes

### Existing Projects:
- ✅ Old projects continue with single payment (payment_type = 'full')
- ✅ No disruption to ongoing projects
- ✅ New projects automatically use split payment

### Database Migration:
```sql
-- Run this SQL script in Supabase
-- File: database/ADD_SPLIT_PAYMENT_TYPE.sql

ALTER TABLE payments 
ADD COLUMN payment_type VARCHAR(20) DEFAULT 'full';

UPDATE payments 
SET payment_type = 'full' 
WHERE payment_type IS NULL;
```

---

## 🎓 Benefits Over Single Payment

| Feature | Single Payment (100%) | Split Payment (60%/40%) |
|---------|---------------------|------------------------|
| Client upfront cost | **High** (100%) | **Lower** (60%) |
| Developer start capital | **Higher** (100%) | **Good** (60%) |
| Client protection | Moderate | **High** (milestone check) |
| Work guarantee | Low | **High** (40% held) |
| Risk distribution | Uneven | **Balanced** |
| Industry standard | No | **Yes** ✓ |

---

## 📞 Support

**Questions about split payments?**
- Check project payment progress in sidebar
- Contact support@gridnexus.com
- Review transaction history in Paystack dashboard

**Dispute resolution:**
- Client and developer communicate first
- Contact platform admin if unresolved
- Manual payment release available if needed

---

## 📈 Future Enhancements

Possible future features:
- [ ] Custom milestone percentages (50/50, 70/30, etc.)
- [ ] Multiple milestones (33/33/34)
- [ ] Automatic partial releases on milestones
- [ ] Refund handling for cancelled projects
- [ ] Payment plans for large projects
- [ ] Invoice generation for each payment

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** ✅ Live in Production
