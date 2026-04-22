# DustyShelf API Documentation & Postman Examples

This document provides examples of API requests for the DustyShelf backend.

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication

### Register User
- **Method**: `POST`
- **URL**: `/auth/register`
- **Body**:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

### Login User
- **Method**: `POST`
- **URL**: `/auth/login`
- **Body**:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

### Google Sign-In
- **Method**: `POST`
- **URL**: `/auth/google-signin`
- **Body**:
```json
{
    "idToken": "FIREBASE_ID_TOKEN_FROM_FRONTEND"
}
```

---

## 2. Books

### Get All Books (with Pagination & Search)
- **Method**: `GET`
- **URL**: `/books?keyword=potter&pageNumber=1&condition=Good`

### Create Book (Admin Only)
- **Method**: `POST`
- **URL**: `/books`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:
```json
{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "price": 150,
    "condition": "Good",
    "description": "A classic novel about the American Dream.",
    "category": "Fiction",
    "stock": 5
}
```

---

## 3. Cart

### Get User Cart
- **Method**: `GET`
- **URL**: `/cart`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

### Add to Cart
- **Method**: `POST`
- **URL**: `/cart/add`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:
```json
{
    "bookId": "BOOK_MONGO_ID",
    "quantity": 1
}
```

---

## 4. Payments & Orders

### Create Razorpay Order
- **Method**: `POST`
- **URL**: `/payment/create-order`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:
```json
{
    "amount": 500,
    "currency": "INR"
}
```

### Verify Payment & Update Order
- **Method**: `POST`
- **URL**: `/payment/verify`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:
```json
{
    "razorpay_order_id": "order_ID_from_razorpay",
    "razorpay_payment_id": "pay_ID_from_razorpay",
    "razorpay_signature": "signature_from_razorpay",
    "dbOrderId": "INTERNAL_ORDER_ID"
}
```
