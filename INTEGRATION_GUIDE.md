# Quick Integration Guide - UPI Payment System

## What's Been Done ✅
- Installed dependencies (`qrcode`, `qrcode.react`)
- Updated database models with UPI fields
- Created payment controller with UPI functions
- Updated checkout to use QR code payment
- Created seller settings component
- Added comprehensive documentation

## Next Steps to Complete Implementation

### Step 1: Update Model Relationships (Optional but Recommended)

Edit `dustyshelf-backend/models/index.js`:

```javascript
const Book = require('./Book');
const User = require('./User');
const Order = require('./Order');

// Set up relationships
Book.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
User.hasMany(Book, { as: 'books', foreignKey: 'sellerId' });

Order.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Order.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

module.exports = {
  Book,
  User,
  Order
};
```

### Step 2: Integrate SellerSettings Component

Add to your seller dashboard/profile page:

```jsx
import SellerSettings from './components/SellerSettings';

export default function SellerDashboard() {
  return (
    <div>
      <SellerSettings />
      {/* Other seller components */}
    </div>
  );
}
```

### Step 3: Update Book Creation Endpoint

When sellers upload books, ensure `sellerId` is captured:

```javascript
// In bookController.js - createBook function
exports.createBook = async (req, res, next) => {
    try {
        const book = await Book.create({
            ...req.body,
            sellerId: req.user.id  // ✅ This sets the seller
        });
        res.status(201).json({ success: true, book });
    } catch (error) {
        next(error);
    }
};
```

### Step 4: Database Migration (If Using Sequelize Migrations)

If you have migrations set up, create a migration file:

```bash
# Run this from backend directory
npx sequelize-cli migration:create --name add_upi_fields
```

Then update the migration file with the schema changes.

### Step 5: Test the Payment Flow

1. **As a Seller**:
   - Log in
   - Navigate to Seller Settings
   - Enter UPI ID (e.g., `9999999999@paytm`)
   - Save

2. **As a Buyer**:
   - Browse and add books to cart
   - Click Checkout
   - Enter shipping address
   - Click "Proceed to Payment"
   - Verify QR code appears
   - In real scenario: Scan with UPI app and complete payment
   - Enter transaction ID and verify

### Step 6: API Configuration

Make sure your frontend API calls use the correct backend URL:

In `Checkout.jsx` and `SellerSettings.jsx`, update:
```javascript
// Change this URL to your actual backend URL
const API_URL = "http://localhost:5000"; // or your production URL
```

### Step 7: Error Handling (Production Ready)

Add to your backend error middleware:

```javascript
// In errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        // In production, don't expose full error
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
```

## Important Notes

### Payment Verification
Currently, the system:
1. Creates an order when QR is generated
2. Marks order as "Paid" when transaction ID is entered

**For production**, you should:
1. Integrate with actual UPI provider APIs (NPCI)
2. Verify transaction IDs in real-time
3. Implement webhook handlers for payment confirmation

### Multiple Sellers per Order
Current implementation assumes one book per order. If you need to support:
- Multiple books from different sellers in one checkout
- Split payments to multiple UPI accounts

You'll need to:
1. Create separate orders for each seller
2. Generate multiple QR codes
3. Track payments separately

### Security Checklist
- [ ] Never log UPI IDs in production
- [ ] Validate UPI IDs server-side
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on payment endpoints
- [ ] Add transaction ID validation
- [ ] Implement refund mechanism

## File Reference

### Modified Files
1. `dustyshelf-backend/models/User.js` - Added upiId
2. `dustyshelf-backend/models/Book.js` - Added sellerId
3. `dustyshelf-backend/models/Order.js` - Enhanced
4. `dustyshelf-backend/controllers/paymentController.js` - UPI functions
5. `dustyshelf-backend/routes/paymentRoutes.js` - New endpoints
6. `dustyshelf-react/src/components/Checkout.jsx` - UPI QR payment

### New Files
1. `dustyshelf-react/src/components/SellerSettings.jsx` - Seller UPI management
2. `UPI_PAYMENT_SYSTEM.md` - Full documentation

## Common Issues & Solutions

### "Seller has not configured UPI payment"
```
Cause: Seller hasn't entered UPI ID
Solution: Direct seller to Settings → Enter UPI ID
```

### "Invalid UPI ID format"
```
Cause: UPI ID doesn't contain @
Solution: Ensure format is correct (e.g., 9999999999@paytm)
```

### QR Code not displaying
```
Cause: qrcode.react not installed or import issue
Solution: npm install qrcode.react (in frontend)
          npm install qrcode (in backend)
```

### Payment endpoint 404
```
Cause: API URL or route path incorrect
Solution: Check backend URL in Checkout.jsx
          Check payment routes are registered in backend
```

## Useful Commands

```bash
# Backend
cd dustyshelf-backend
npm install qrcode
npm start

# Frontend
cd dustyshelf-react
npm install qrcode.react
npm run dev
```

## Support Endpoints

All endpoints require authentication (Bearer token):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payment/generate-upi-qr` | Generate QR code |
| POST | `/api/payment/verify-upi` | Verify payment |
| GET | `/api/payment/seller-upi` | Get seller UPI |
| POST | `/api/payment/update-seller-upi` | Update UPI ID |

## Production Deployment Checklist

- [ ] Test with real UPI apps
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Implement real payment verification
- [ ] Add payment webhooks
- [ ] Set up logging
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Add rate limiting
- [ ] Implement transaction history
- [ ] Set up automated backups
- [ ] Test refund process
- [ ] Document for team

## Next Phase Features

1. **Real UPI Integration**: Connect with NPCI/UPI providers
2. **Multi-seller Orders**: Handle split payments
3. **Payment Dashboard**: Track all transactions
4. **Automatic Settlements**: Auto-transfer funds to sellers
5. **Receipts**: Email/SMS receipts
6. **Refunds**: Automated refund processing
7. **Analytics**: Payment metrics and insights

---

**Questions?** Refer to `UPI_PAYMENT_SYSTEM.md` for detailed documentation.
