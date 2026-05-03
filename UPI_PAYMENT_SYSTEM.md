# UPI Payment System Implementation

## Overview
The dustyshelf bookstore now supports direct UPI payments. Sellers can enter their UPI ID when setting up their account, and buyers can scan a QR code to pay directly using their UPI app.

## Features

### For Sellers
- **UPI ID Management**: Sellers can set and update their UPI ID in seller settings
- **Direct Payments**: Receive direct payments from buyers without intermediaries
- **Order Tracking**: See all orders and payment status

### For Buyers
- **QR Code Scanning**: Simple QR code to scan for payment
- **Direct Payment**: Pay using any UPI app (Google Pay, PhonePe, Paytm, etc.)
- **Transaction Verification**: Enter UPI transaction ID to verify payment

## Database Changes

### User Model
Added `upiId` field to store seller's UPI ID:
```javascript
upiId: {
  type: DataTypes.STRING,
  allowNull: true,
  validate: {
    isEmail: false
  }
}
```

### Book Model
Added `sellerId` field to track which seller uploaded the book:
```javascript
sellerId: {
  type: DataTypes.UUID,
  allowNull: false,
  references: {
    model: 'Users',
    key: 'id'
  }
}
```

### Order Model
Enhanced with payment-related fields:
```javascript
paymentMethod: {
  type: DataTypes.ENUM('UPI', 'Card', 'Other'),
  defaultValue: 'UPI'
}
upiTransactionId: {
  type: DataTypes.STRING
}
buyerId: {
  type: DataTypes.UUID,
  allowNull: false
}
sellerId: {
  type: DataTypes.UUID,
  allowNull: false
}
```

## API Endpoints

### Payment Routes

#### 1. Generate UPI QR Code
- **Endpoint**: `POST /api/payment/generate-upi-qr`
- **Auth**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "bookId": "uuid",
    "quantity": 1,
    "amount": 299
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "qrCode": "data:image/png;base64,...",
    "upiId": "9999999999@paytm",
    "amount": 299,
    "orderId": "uuid",
    "bookTitle": "Book Title",
    "sellerName": "Seller Name"
  }
  ```

#### 2. Verify UPI Payment
- **Endpoint**: `POST /api/payment/verify-upi`
- **Auth**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "orderId": "uuid",
    "upiTransactionId": "123456789012345"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "orderId": "uuid"
  }
  ```

#### 3. Get Seller UPI ID
- **Endpoint**: `GET /api/payment/seller-upi`
- **Auth**: Required (Bearer token)
- **Response**:
  ```json
  {
    "success": true,
    "upiId": "9999999999@paytm"
  }
  ```

#### 4. Update Seller UPI ID
- **Endpoint**: `POST /api/payment/update-seller-upi`
- **Auth**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "upiId": "9999999999@paytm"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "UPI ID updated successfully",
    "upiId": "9999999999@paytm"
  }
  ```

## Frontend Components

### Checkout Component
Updated to show UPI QR code payment flow:

**Step 1: Shipping Details**
- Collect shipping address
- Generate UPI QR code

**Step 2: UPI Payment**
- Display seller information
- Show QR code
- Input for UPI transaction ID
- Verify payment

**Features**:
- Two-step checkout process
- Error handling
- Loading states
- Seller information display

### SellerSettings Component
New component for sellers to manage UPI settings:

**Features**:
- View current UPI ID
- Update UPI ID with validation
- Success/error messages
- Format validation (must contain @)

## UPI Format & Examples

Valid UPI ID formats:
- `9999999999@paytm` (Paytm)
- `name@okhdfc` (HDFC Bank)
- `email@okhdfcbank` (HDFC Bank)
- `9999999999@okhdfcbank` (HDFC Bank)
- `mobile@okaxis` (Axis Bank)
- `name@okicici` (ICICI Bank)
- `name@upi` (Generic UPI)

## Payment Flow

### Buyer's Journey
1. Add books to cart
2. Click checkout
3. Enter shipping address
4. Click "Proceed to Payment"
5. QR code is generated and displayed
6. Scan QR code with UPI app
7. Complete payment in UPI app
8. Enter transaction ID
9. Click "Verify Payment"
10. Order confirmed

### Seller's Setup
1. Log in to account
2. Go to Seller Settings
3. Enter UPI ID (e.g., 9999999999@paytm)
4. Click "Save UPI ID"
5. Now ready to receive payments

## Security Considerations

1. **UPI IDs are stored** in the database associated with seller accounts
2. **Transaction verification** requires entering the transaction ID (basic verification)
3. **In production**, integrate with actual UPI provider APIs for real-time verification
4. **Do NOT store sensitive data** - UPI itself is secure

## Future Enhancements

1. **Real UPI Verification**: Integrate with actual UPI providers (NPCI)
2. **Multi-seller Orders**: Handle orders with books from multiple sellers
3. **Automatic Settlement**: Track when payments are received and settle accounts
4. **Transaction History**: Dashboard showing all transactions
5. **Payment Status Updates**: Real-time notifications
6. **Refunds**: Implement refund mechanism
7. **Receipt Generation**: Email receipts to buyers
8. **Tax Calculation**: Add GST/tax calculations

## Installation & Setup

### Backend Dependencies
```bash
npm install qrcode
```

### Frontend Dependencies
```bash
npm install qrcode.react
```

### Environment Variables
No additional environment variables needed for basic UPI flow. For production verification:
- `UPI_API_KEY` - For integration with UPI providers
- `UPI_API_SECRET` - For integration with UPI providers

## Testing

### Test UPI IDs
- `9999999999@paytm` - Paytm
- `testuser@okhdfc` - HDFC
- `test@upi` - Generic

### Test Flow
1. Create seller account with UPI ID
2. Add book for sale
3. Log in as different user (buyer)
4. Add book to cart
5. Proceed to checkout
6. Verify QR code is generated
7. Enter test transaction ID
8. Verify order is created

## Troubleshooting

### Issue: "Seller has not configured UPI payment"
**Solution**: Ensure seller has entered UPI ID in seller settings

### Issue: "Invalid UPI ID format"
**Solution**: UPI IDs must contain @ symbol (e.g., 9999999999@paytm)

### Issue: QR code not generating
**Solution**: Check that book seller has valid UPI ID set

### Issue: Order not verifying
**Solution**: Enter correct transaction ID from UPI app confirmation

## File Changes Summary

### Modified Files
- `models/User.js` - Added upiId field
- `models/Book.js` - Added sellerId field
- `models/Order.js` - Enhanced with payment fields
- `controllers/paymentController.js` - Added UPI payment functions
- `routes/paymentRoutes.js` - Added UPI endpoints
- `src/components/Checkout.jsx` - Complete redesign for UPI

### New Files
- `src/components/SellerSettings.jsx` - Seller UPI management
- `UPI_PAYMENT_SYSTEM.md` - This documentation

## Support & Contact
For issues or questions about the UPI payment system, contact the development team.
