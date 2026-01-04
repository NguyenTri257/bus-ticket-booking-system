# Payment Methods Guide

## Overview

The Bus Ticket Booking System supports multiple payment methods to provide flexibility and convenience for all users.

## Supported Payment Methods

1. **PayOS** - Cards and E-wallets
2. **Momo** - Mobile Wallet
3. **ZaloPay** - Digital Wallet
4. **Stripe** - International Cards

---

## 1. PayOS

### What is PayOS?

PayOS is a comprehensive payment gateway supporting:

- Credit cards (Visa, Mastercard, JCB)
- Debit cards
- Local e-wallets
- QR code payments

### How to Pay with PayOS

1. Select **"PayOS"** as payment method
2. Choose payment type:
   - Credit/Debit Card
   - E-wallet
   - QR Code
3. Enter payment details
4. Complete verification (3D Secure if required)
5. Confirm payment

### Card Payment Process

1. Enter card information:
   - Card number (16 digits)
   - Expiry date (MM/YY)
   - CVV (3 digits on back)
   - Cardholder name
2. Click "Pay"
3. Bank may send OTP to phone
4. Enter OTP to confirm
5. Payment processed instantly

### Supported Cards

- ✅ Visa
- ✅ Mastercard
- ✅ JCB
- ✅ Local bank cards

### Security Features

- PCI DSS compliant
- 3D Secure authentication
- SSL encryption
- Tokenization (card details not stored)

---

## 2. Momo

### What is Momo?

Momo is Vietnam's popular mobile wallet for:

- Instant payments
- No card needed
- QR code scanning
- Cashback rewards

### Prerequisites

- Momo app installed on phone
- Momo account with sufficient balance
- Internet connection

### How to Pay with Momo

**Method 1: QR Code**

1. Select **"Momo"** as payment method
2. QR code displayed on screen
3. Open Momo app on phone
4. Scan QR code
5. Confirm payment in app
6. Return to booking site

**Method 2: Deep Link**

1. Select **"Momo"** on mobile device
2. Automatically opens Momo app
3. Review payment details
4. Enter PIN/biometric
5. Confirm payment
6. Automatically returns to site

### Momo Payment Limits

- Minimum: 10,000 VND
- Maximum per transaction: 50,000,000 VND
- Daily limit: Based on account verification level

### Momo Benefits

- ⚡ Instant confirmation
- 🎁 Potential cashback offers
- 🔒 Secure with PIN/biometric
- 📱 No need to enter card details

---

## 3. ZaloPay

### What is ZaloPay?

ZaloPay is a digital wallet by Zalo:

- Integrated with Zalo messaging
- Quick payments
- Promotional offers
- Wide merchant acceptance

### Prerequisites

- ZaloPay app installed
- ZaloPay account
- Linked payment source (bank account or card)

### How to Pay with ZaloPay

1. Select **"ZaloPay"** as payment method
2. Enter phone number (if required)
3. Open ZaloPay app on phone
4. Review transaction details
5. Confirm with PIN or biometric
6. Payment processed
7. Return to booking page

### ZaloPay Payment Limits

- Minimum: 10,000 VND
- Maximum: Based on account tier
- Daily limit: Based on verification level

### ZaloPay Benefits

- 💰 Frequent promotions
- ⚡ Fast processing
- 🔐 Secure authentication
- 📊 Transaction history in app

---

## 4. Stripe (International Cards)

### What is Stripe?

Stripe is an international payment processor for:

- International credit cards
- Multiple currencies
- Worldwide travelers
- Foreign cards

### Supported Cards

- ✅ Visa
- ✅ Mastercard
- ✅ American Express
- ✅ Discover
- ✅ JCB
- ✅ Diners Club
- ✅ UnionPay

### How to Pay with Stripe

1. Select **"Stripe"** or **"Credit Card"**
2. Enter card details:
   - Card number
   - Expiry date
   - CVC/CVV
   - Cardholder name
   - Billing country
3. Review amount (in VND or your currency)
4. Click "Pay"
5. May require additional verification
6. Payment confirmed

### Currency Support

- Primary: Vietnamese Dong (VND)
- Also accepts: USD, EUR, and others
- Automatic currency conversion applied
- Exchange rate displayed before payment

### Stripe Security

- PCI Level 1 certified
- 3D Secure 2.0
- Fraud detection
- Encrypted transactions

---

## Payment Process Overview

### General Flow

```
1. Review Booking
   ↓
2. Choose Payment Method
   ↓
3. Enter Payment Details
   ↓
4. Verify Transaction
   ↓
5. Payment Processed
   ↓
6. Booking Confirmed
   ↓
7. E-ticket Sent
```

### Payment Timeout

- **10-minute limit** from seat selection
- Timer displayed during checkout
- Payment must complete within time
- After timeout, booking auto-cancelled

### Processing Time

| Payment Method   | Processing Time      |
| ---------------- | -------------------- |
| PayOS (Card)     | Instant              |
| PayOS (E-wallet) | Instant              |
| Momo             | Instant              |
| ZaloPay          | Instant              |
| Stripe           | Instant to 2 minutes |

---

## Payment Status

### Successful Payment

Indicators:

- ✅ Success message on screen
- Green checkmark icon
- Booking reference generated
- Redirect to confirmation page
- Email sent within 2-5 minutes

### Pending Payment

Indicators:

- ⏳ Processing message
- Orange/yellow status
- Wait for confirmation
- Don't close browser
- Usually resolves in 1-2 minutes

### Failed Payment

Indicators:

- ❌ Error message
- Red warning icon
- Reason displayed
- Options to retry
- Booking remains pending (10-min window)

### Common Failure Reasons

- Insufficient funds
- Card declined by bank
- Incorrect card details
- CVV mismatch
- Expired card
- 3D Secure failed
- Network timeout
- Payment gateway error

---

## Payment Security

### Your Protection

All payment methods provide:

- **Encryption**: SSL/TLS for data transmission
- **Tokenization**: Card details not stored
- **PCI Compliance**: Industry standards met
- **Fraud Detection**: Suspicious transactions flagged
- **Secure Authentication**: OTP, PIN, biometric

### What We Don't Store

- Full card numbers
- CVV/CVC codes
- Card PINs
- Banking passwords
- E-wallet credentials

### What We Store

- Last 4 digits of card (for reference)
- Payment method used
- Transaction ID
- Payment status
- Timestamp

---

## Refunds

### Refund Process

1. **Cancellation**: User cancels booking
2. **Approval**: Automatic (based on policy)
3. **Processing**: 5-7 business days
4. **Refund**: To original payment method

### Refund Timeline

| Payment Method   | Refund Time        |
| ---------------- | ------------------ |
| PayOS (Card)     | 5-7 business days  |
| PayOS (E-wallet) | 3-5 business days  |
| Momo             | 3-5 business days  |
| ZaloPay          | 3-5 business days  |
| Stripe           | 5-10 business days |

### Refund Amount

Based on cancellation policy:

- 24+ hours before: 80% refund
- <24 hours: Subject to penalties
- No-show: No refund

**Example:**

```
Original: 937,000 VND
Refund (80%): 749,600 VND
Service fee (non-refundable): 37,000 VND
```

---

## Payment Receipts

### What You Receive

**Via Email:**

- Payment confirmation
- Receipt PDF
- Transaction details
- Booking reference
- E-ticket (after confirmation)

**Receipt Contents:**

- Date and time of payment
- Amount paid
- Payment method
- Transaction ID
- Booking reference
- Breakdown (subtotal, fees, total)

### Invoices

For formal invoices:

- Contact support after booking
- Provide:
  - Booking reference
  - Company name (if business)
  - Tax ID (if required)
- Invoice issued within 24-48 hours

---

## Troubleshooting

### Payment Not Going Through

**Check:**

1. Card expiry date
2. Sufficient balance
3. Correct CVV
4. Billing address (if required)
5. International transaction enabled
6. Card not blocked

**Try:**

- Different payment method
- Different card
- Contact bank
- Clear browser cache
- Try different browser/device

### Payment Deducted But Booking Not Confirmed

**Don't panic!**

1. Wait 10 minutes (sometimes delayed)
2. Check email confirmation
3. Lookup booking (if guest)
4. Check bank statement for transaction ID
5. Contact support with:
   - Transaction ID
   - Amount
   - Date/time
   - Email used

### Duplicate Charge

If charged twice:

1. Check bank statement carefully
2. One may be authorization hold (refunded automatically)
3. Contact support with transaction IDs
4. Provide payment proof
5. Refund processed if confirmed

### Refund Not Received

If refund delayed:

1. Check refund timeline (5-10 business days)
2. Verify with bank
3. Contact support with:
   - Booking reference
   - Cancellation date
   - Original payment proof

---

## Tips for Smooth Payment

1. **Prepare Payment Method**: Have details ready
2. **Stable Internet**: Use reliable connection
3. **Sufficient Balance**: Ensure funds available
4. **Enable International**: If using foreign card
5. **Check Limits**: Wallet/card daily limits
6. **Don't Refresh**: During processing
7. **Save Confirmation**: Screenshot success page
8. **Verify Email**: Correct and accessible
9. **Work Within Time**: 10-minute window
10. **Contact Support**: If issues arise

---

## Frequently Asked Questions

### Q: Which payment method is fastest?

**A:** All methods process instantly. Momo and ZaloPay are quickest due to fewer fields to enter.

### Q: Can I pay cash?

**A:** No, all payments are online. No cash payments accepted.

### Q: Can I pay at bus station?

**A:** No, payment must be completed online during booking.

### Q: Is it safe to enter card details?

**A:** Yes, all payment gateways are PCI compliant with bank-level security.

### Q: Can I split payment between two cards?

**A:** No, full amount must be paid with single payment method.

### Q: Can I pay with gift cards?

**A:** Depends on payment method. Some e-wallets accept gift card top-ups.

### Q: What if I'm abroad?

**A:** Use Stripe for international cards or PayOS if your card supports international transactions.

### Q: Are there extra fees?

**A:** System service fee (3% + 10,000 VND) is included in total. Payment gateways don't charge extra.

### Q: Can I cancel payment midway?

**A:** Yes, close payment window or click "Cancel". Booking remains pending (10-min limit applies).

### Q: Do I need to register card?

**A:** No registration needed. Enter details each time (unless using saved cards in wallet apps).

---

## Payment Method Comparison

| Feature       | PayOS     | Momo    | ZaloPay | Stripe  |
| ------------- | --------- | ------- | ------- | ------- |
| Cards         | ✅        | ❌      | ❌      | ✅      |
| E-wallet      | ✅        | ✅      | ✅      | ❌      |
| QR Code       | ✅        | ✅      | ✅      | ❌      |
| International | Limited   | ❌      | ❌      | ✅      |
| Speed         | Instant   | Instant | Instant | Instant |
| App Required  | ❌        | ✅      | ✅      | ❌      |
| Cashback      | Sometimes | Often   | Often   | ❌      |

---

## Contact Support

For payment issues:

- 💬 **Live Chat**: Instant help
- 📧 **Email**: support@yourdomain.com
- 📞 **Phone**: +84 (0) 123 456 789
- 🕐 **Hours**: 24/7

**When contacting, provide:**

- Booking reference (if available)
- Transaction ID
- Payment method used
- Amount charged
- Error message (if any)
- Screenshot (if possible)

---

## Related Guides

- [User Guide](./01-user-guide.md) - Complete platform guide
- [Booking Guide](./02-booking-guide.md) - Detailed booking steps
- [Guest Checkout](./03-guest-checkout.md) - Book without account
