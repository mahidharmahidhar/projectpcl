# UPI Payment System - Testing Guide & API Examples

## Pre-requisites
- Backend running on `http://localhost:5000`
- Valid authentication token (JWT)
- At least one seller and buyer user account

## Testing the Payment Flow

### 1. Seller: Set UPI ID

**Endpoint**: `POST /api/payment/update-seller-upi`

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/update-seller-upi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -d '{
    "upiId": "9999999999@paytm"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "UPI ID updated successfully",
  "upiId": "9999999999@paytm"
}
```

### 2. Seller: Verify UPI ID is Set

**Endpoint**: `GET /api/payment/seller-upi`

**Request**:
```bash
curl http://localhost:5000/api/payment/seller-upi \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "upiId": "9999999999@paytm"
}
```

### 3. Buyer: Add Book to Cart & Proceed to Checkout

**Note**: This is done in frontend. Book should have:
- `id`: UUID
- `price`: amount
- `title`: book title
- `sellerId`: seller's UUID with UPI ID set

### 4. Buyer: Generate UPI QR Code

**Endpoint**: `POST /api/payment/generate-upi-qr`

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/generate-upi-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "bookId": "550e8400-e29b-41d4-a716-446655440000",
    "quantity": 1,
    "amount": 299
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  "upiId": "9999999999@paytm",
  "amount": 299,
  "orderId": "550e8400-e29b-41d4-a716-446655440001",
  "bookTitle": "The Great Book",
  "sellerName": "John Seller"
}
```

**Understanding the Response**:
- `qrCode`: Base64 encoded PNG image - display this to buyer
- `upiId`: Seller's UPI ID for reference
- `orderId`: Track this - needed for verification
- `amount`: Payment amount
- `bookTitle`: What they're buying
- `sellerName`: Who they're paying

### 5. Buyer: Verify UPI Payment

**Endpoint**: `POST /api/payment/verify-upi`

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/verify-upi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "upiTransactionId": "202404231234567890"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "orderId": "550e8400-e29b-41d4-a716-446655440001"
}
```

## Error Scenarios & Handling

### Error 1: Seller has not configured UPI

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/generate-upi-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d '{
    "bookId": "550e8400-e29b-41d4-a716-446655440000",
    "quantity": 1,
    "amount": 299
  }'
```

**Response** (500 error):
```json
{
  "success": false,
  "message": "Seller has not configured UPI payment"
}
```

**Solution**: Seller needs to set UPI ID using the update endpoint.

### Error 2: Invalid UPI ID Format

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/update-seller-upi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SELLER_TOKEN" \
  -d '{
    "upiId": "invalidupi"
  }'
```

**Response** (400 error):
```json
{
  "success": false,
  "message": "Invalid UPI ID format (e.g., 9999999999@paytm)"
}
```

**Solution**: UPI ID must contain @ symbol.

### Error 3: Book Not Found

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/generate-upi-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d '{
    "bookId": "00000000-0000-0000-0000-000000000000",
    "quantity": 1,
    "amount": 299
  }'
```

**Response** (404 error):
```json
{
  "success": false,
  "message": "Book not found"
}
```

### Error 4: Invalid Transaction ID

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/verify-upi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d '{
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "upiTransactionId": ""
  }'
```

**Response** (400 error):
```json
{
  "success": false,
  "message": "Please enter the UPI transaction ID"
}
```

### Error 5: Order Not Found

**Request**:
```bash
curl -X POST http://localhost:5000/api/payment/verify-upi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d '{
    "orderId": "00000000-0000-0000-0000-000000000000",
    "upiTransactionId": "202404231234567890"
  }'
```

**Response** (404 error):
```json
{
  "success": false,
  "message": "Order not found"
}
```

## Valid UPI IDs for Testing

Paytm:
- `9999999999@paytm`
- `9876543210@paytm`

HDFC Bank:
- `yourname@okhdfc`
- `9999999999@okhdfcbank`

ICICI Bank:
- `yourname@okicici`

Axis Bank:
- `yourname@okaxis`

Google Pay / Others:
- `yourname@upi`

## Frontend Test Checklist

### Checkout Component Flow

**Test Case 1: Successful Payment**
- [ ] Fill in all shipping details
- [ ] Click "Proceed to Payment"
- [ ] Verify QR code displays
- [ ] Verify seller info shows correctly
- [ ] Enter transaction ID
- [ ] Click "Verify Payment"
- [ ] See success message
- [ ] Modal closes

**Test Case 2: Back Button Works**
- [ ] In payment step, click "Back"
- [ ] Return to shipping step
- [ ] Previous address data preserved

**Test Case 3: Error Handling**
- [ ] Try payment without shipping address
- [ ] Should show error message
- [ ] Try payment without UPI ID entered
- [ ] Should show error message
- [ ] Check network error handling

### SellerSettings Component

**Test Case 1: Load Settings**
- [ ] Component loads
- [ ] Shows current UPI ID if set
- [ ] Input is editable

**Test Case 2: Update UPI ID**
- [ ] Enter new UPI ID
- [ ] Click Save
- [ ] See success message
- [ ] Message disappears after 3 seconds

**Test Case 3: Invalid UPI ID**
- [ ] Try without @
- [ ] Should show error
- [ ] Try empty
- [ ] Should show error

## Postman Collection Example

Save this as `dustyshelf-upi.postman_collection.json`:

```json
{
  "info": {
    "name": "DustyShelf UPI Payment",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Update Seller UPI",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"upiId\": \"9999999999@paytm\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/payment/update-seller-upi",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "payment", "update-seller-upi"]
        }
      }
    },
    {
      "name": "Get Seller UPI",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "http://localhost:5000/api/payment/seller-upi",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "payment", "seller-upi"]
        }
      }
    },
    {
      "name": "Generate UPI QR",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"bookId\": \"{{bookId}}\", \"quantity\": 1, \"amount\": 299}"
        },
        "url": {
          "raw": "http://localhost:5000/api/payment/generate-upi-qr",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "payment", "generate-upi-qr"]
        }
      }
    },
    {
      "name": "Verify UPI Payment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"orderId\": \"{{orderId}}\", \"upiTransactionId\": \"202404231234567890\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/payment/verify-upi",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "payment", "verify-upi"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "bookId",
      "value": ""
    },
    {
      "key": "orderId",
      "value": ""
    }
  ]
}
```

## Database Verification

After running payment flow, verify database:

```sql
-- Check if UPI ID was saved for seller
SELECT id, name, email, upiId FROM Users WHERE id = 'SELLER_UUID';

-- Check if order was created
SELECT id, buyerId, sellerId, totalAmount, paymentStatus, upiTransactionId, paymentMethod FROM Orders WHERE id = 'ORDER_UUID';

-- Check seller's books
SELECT id, title, price, sellerId FROM Books WHERE sellerId = 'SELLER_UUID';
```

## Performance Considerations

- QR code generation: ~50-100ms
- Verification: <50ms (no external API calls yet)
- Database queries: <100ms with proper indexing

## Debugging Tips

1. **Check console logs**: Frontend and backend console for errors
2. **Check network tab**: Verify API calls are reaching backend
3. **Verify tokens**: Ensure JWT tokens are valid
4. **Check database**: Verify records are being created
5. **Check CORS**: If frontend can't reach backend
6. **Check port**: Ensure backend is running on correct port

---

**Ready to test?** Start with the Seller Setup flow, then proceed to Buyer Payment flow!
