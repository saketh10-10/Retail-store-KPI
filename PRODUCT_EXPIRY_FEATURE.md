# Product Batch Tracking & Expiry Notification Feature

## Overview
This feature adds comprehensive batch tracking and automatic expiry notifications for products in the Retail KPI system.

## Features Implemented

### 1. **Product Batch Tracking**
- **Batch Number**: Each product can have a unique batch identifier
- **Manufacturing Date**: Track when the product was manufactured
- **Expiry Date**: Set expiration dates for perishable products
- **SKU Retention**: SKU field remains available for product identification

### 2. **Automatic Expiry Notifications**
- **Email Alerts**: Managers receive email notifications when products are within 10 days of expiry
- **Automatic Checking**: System checks for expiring products:
  - On server startup (after 5 seconds)
  - Every hour automatically
  - Can be manually triggered via API endpoint
- **Smart Notifications**: Each product/batch combination is notified only once to avoid spam

### 3. **Frontend Updates**
- **Enhanced Product Form**: 
  - Batch Number input field
  - Manufacturing Date picker
  - Expiry Date picker
- **Product Display**: Shows batch info, manufacturing date, and expiry date on product cards
- **Visual Indicators**: Color-coded badges for easy identification

## How to Use

### Adding/Editing Products with Batch Information

1. **Navigate to Product Management** page
2. **Click "Add New Product"** or **Edit** an existing product
3. **Fill in the new fields**:
   - **Batch Number**: e.g., "BATCH001", "LOT2024-10"
   - **Manufacturing Date**: Select from date picker
   - **Expiry Date**: Select from date picker
4. **Save** the product

### Email Configuration

To receive email notifications, configure your `.env` file in the `backend` folder:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**For Gmail users:**
1. Enable 2-factor authentication on your Google account
2. Generate an App-Specific Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

**Note**: If email is not configured, notifications will be logged to the console.

### Manual Expiry Check

Managers can manually trigger an expiry check:

**API Endpoint**: `POST /api/products/check-expiry`

**Headers**: 
```
Authorization: Bearer <manager_token>
```

**Response**:
```json
{
  "message": "Expiry check completed successfully"
}
```

## Email Notification Details

### When Notifications Are Sent
- Products with expiry dates within **10 days** or less
- Only sent once per product/batch/expiry date combination
- Sent to **all manager accounts** in the system

### Email Content Includes:
- Product name and SKU
- Batch number
- Manufacturing date
- Expiry date
- Days until expiry
- Current stock quantity
- Recommended actions

### Sample Email Preview:
```
Subject: ⚠️ Product Expiry Alert – "Milk" (Batch: BATCH008)

The product Milk (Batch: BATCH008) will expire in 7 days.

Product Details:
- Product Name: Milk
- SKU: MILK001
- Batch Number: BATCH008
- Manufacturing Date: 10/20/2024
- Expiry Date: 11/03/2024
- Days Until Expiry: 7 days
- Current Stock: 120 units

Recommended Actions:
- Consider offering discounts to move inventory faster
- Prioritize this product for promotional activities
- Review stock levels and adjust future orders
- Remove expired products from inventory immediately after expiry
```

## Backend Changes

### Files Modified:
1. **`backend/mock-server.js`**:
   - Added `batch_no`, `manufacturing_date`, `expiry_date` fields to product model
   - Implemented `checkExpiringProducts()` function
   - Added automatic expiry checking on startup and hourly intervals
   - Added manual trigger endpoint `/api/products/check-expiry`

2. **`backend/services/emailService.js`**:
   - Added `sendExpiryAlert()` function for expiry notifications
   - HTML and text email templates with product details

3. **`backend/.env.example`**:
   - Updated documentation for email configuration

## Frontend Changes

### Files Modified:
1. **`frontend/src/pages/ProductsPage.tsx`**:
   - Updated `Product` interface with new fields
   - Updated `ProductForm` interface with new fields
   - Added form inputs for batch number, manufacturing date, and expiry date
   - Added display of batch info on product cards

2. **`frontend/src/pages/ProductsPage.module.css`**:
   - Added styles for `.batch`, `.expiry`, and `.mfgDate` badges
   - Color-coded styling for visual distinction

## Sample Data

The system includes sample products with batch tracking:

| Product | Batch | Mfg Date | Expiry Date | Days to Expiry |
|---------|-------|----------|-------------|----------------|
| Sandwich | BATCH007 | 10/25/2024 | 11/05/2024 | ~9 days |
| Milk | BATCH008 | 10/20/2024 | 11/03/2024 | ~7 days |
| Bread | BATCH009 | 10/24/2024 | 11/01/2024 | ~5 days |

**Note**: These products will trigger expiry notifications when the server starts.

## Testing the Feature

### Test Expiry Notifications:

1. **Start the servers**: `npm start` from the root directory
2. **Wait 5 seconds** after backend starts
3. **Check the console** for expiry alert messages like:
   ```
   ⚠️ Product "Bread" (Batch: BATCH009) expires in 5 days
   ```
4. **Check email** (if configured) or console logs for notification details

### Test Product Management:

1. **Login as Manager**: username: `admin`, password: `admin123`
2. **Navigate to Products** page
3. **Add a new product** with batch information:
   - Name: "Test Product"
   - Batch: "TEST001"
   - Mfg Date: Today
   - Expiry Date: 5 days from today
4. **Verify** the product displays with batch information
5. **Wait for next hourly check** or manually trigger expiry check

## API Endpoints

### Get Products
```
GET /api/products
```
Returns products with batch information included.

### Create Product
```
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "price": 10.99,
  "sku": "PROD001",
  "batch_no": "BATCH001",
  "manufacturing_date": "2024-10-27",
  "expiry_date": "2024-12-27",
  "stock_quantity": 100,
  "category": "Food"
}
```

### Update Product
```
PUT /api/products/:id
Content-Type: application/json

{
  "batch_no": "BATCH002",
  "manufacturing_date": "2024-10-28",
  "expiry_date": "2024-12-28"
}
```

### Check Expiring Products (Manager Only)
```
POST /api/products/check-expiry
Authorization: Bearer <token>
```

## Technical Details

### Expiry Check Logic:
```javascript
const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

if (daysUntilExpiry <= 10 && daysUntilExpiry >= 0) {
  // Send notification
}
```

### Notification Tracking:
- Uses a `Set` to track notified products
- Key format: `${productId}-${batchNo}-${expiryDate}`
- Prevents duplicate notifications for the same batch

### Automatic Scheduling:
- **Startup check**: `setTimeout(checkExpiringProducts, 5000)`
- **Hourly check**: `setInterval(checkExpiringProducts, 60 * 60 * 1000)`

## Benefits

1. **Inventory Management**: Track product freshness and reduce waste
2. **Proactive Alerts**: Get notified before products expire
3. **Batch Traceability**: Identify and manage specific product batches
4. **Compliance**: Meet regulatory requirements for perishable goods
5. **Loss Prevention**: Take action on products nearing expiry

## Future Enhancements

Potential improvements:
- Dashboard widget showing products expiring soon
- Configurable notification threshold (currently 10 days)
- SMS notifications in addition to email
- Batch-wise stock reports
- Automatic discount suggestions for expiring products
- Integration with POS for FIFO (First In, First Out) selling

## Support

For issues or questions:
- Check console logs for error messages
- Verify email configuration in `.env`
- Ensure manager accounts have valid email addresses
- Test with sample products that expire soon

---

**Implementation Date**: October 27, 2024
**Version**: 1.0.0
