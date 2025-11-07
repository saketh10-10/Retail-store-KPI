# Low Stock Alert Feature

## Overview
Automatic low stock monitoring and email notifications for inventory management in the Retail KPI system.

## Features

### 1. **Automatic Low Stock Monitoring**
- **Threshold-Based Alerts**: Each product has a configurable minimum stock threshold
- **Automatic Checking**: System checks for low stock:
  - On server startup (after 6 seconds)
  - Every hour automatically
  - Can be manually triggered via API endpoint
- **Smart Notifications**: Each product is notified only once when stock drops below threshold
- **Auto-Reset**: Notifications reset when stock is replenished above threshold

### 2. **Email Notifications**
- **Manager Alerts**: All manager accounts receive email notifications
- **Detailed Information**: Includes product name, current stock, threshold, price, SKU, and category
- **Fallback**: If email is not configured, alerts are logged to console

## How It Works

### Stock Threshold Logic
```javascript
if (stock_quantity <= min_stock_threshold) {
  // Send low stock alert
}
```

### Sample Products with Low Stock

The system includes sample products with low stock to demonstrate the feature:

| Product | Current Stock | Threshold | Status |
|---------|--------------|-----------|--------|
| **Socks** | 8 units | 15 units | ⚠️ LOW STOCK |
| **Sunglasses** | 5 units | 10 units | ⚠️ LOW STOCK |
| **Sandwich** | 3 units | 10 units | ⚠️ LOW STOCK |

These products will trigger low stock alerts when the server starts!

## Email Notification Details

### When Notifications Are Sent
- When stock quantity drops to or below the minimum threshold
- Only sent once per product until stock is replenished
- Sent to **all manager accounts** in the system

### Email Content Includes:
- Product name and SKU
- Current stock quantity
- Minimum stock threshold
- Product price
- Product category
- Urgent action required message

### Sample Email Preview:
```
Subject: Stock Alert – "Socks" is running low

The current stock for Socks has dropped below the minimum threshold. 
Please restock soon to avoid stockouts.

Product Details:
- Product Name: Socks
- Current Stock: 8 units
- Minimum Threshold: 15 units
- Price: ₹5.00
- Category: Clothing
- SKU: SOCK001

Action Required: Please arrange for restocking this product as soon as 
possible to maintain optimal inventory levels.
```

## Configuration

### Setting Stock Thresholds

When creating or editing products, you can set the `min_stock_threshold`:

```javascript
{
  "name": "Product Name",
  "price": 10.99,
  "stock_quantity": 50,
  "min_stock_threshold": 20  // Alert when stock drops to 20 or below
}
```

**Default Threshold**: If not specified, the system uses a default threshold of 10 units.

### Email Configuration

Configure email in `backend/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

## API Endpoints

### Manual Low Stock Check (Manager Only)
```
POST /api/products/check-low-stock
Authorization: Bearer <manager_token>

Response:
{
  "message": "Low stock check completed successfully"
}
```

### Create/Update Product with Threshold
```
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "price": 10.99,
  "stock_quantity": 50,
  "min_stock_threshold": 20
}
```

## Backend Implementation

### Files Modified:
1. **`backend/mock-server.js`**:
   - Added `min_stock_threshold` field to all products
   - Implemented `checkLowStockProducts()` function
   - Added automatic checking on startup (6 seconds) and hourly
   - Added manual trigger endpoint `/api/products/check-low-stock`
   - Added `lowStockNotificationsSent` Set to track notifications

2. **`backend/services/emailService.js`**:
   - Existing `sendLowStockAlert()` function used
   - HTML and text email templates with product details

### Automatic Scheduling:
```javascript
// Check on startup (after 6 seconds)
setTimeout(checkLowStockProducts, 6000);

// Check every hour
setInterval(checkLowStockProducts, 60 * 60 * 1000);
```

### Notification Tracking:
- Uses a `Set` to track notified products
- Key format: `${productId}-${threshold}`
- Automatically resets when stock is replenished above threshold

## Testing the Feature

### Verify Low Stock Alerts:

1. **Start the servers**: `npm start` from the root directory
2. **Wait 6 seconds** after backend starts
3. **Check the console** for low stock alert messages:
   ```
   ⚠️ Low stock alert: "Socks" has 8 units (threshold: 15)
   Low stock alert email sent: <message-id>
   ```
4. **Check your email** (if configured) for low stock notifications

### Test with Custom Products:

1. **Login as Manager**: username: `admin`, password: `admin123`
2. **Create a product** with low stock:
   - Name: "Test Product"
   - Stock: 5
   - Threshold: 20
3. **Wait for next hourly check** or manually trigger via API
4. **Verify email notification** is received

## Console Output Example

When low stock is detected:
```
⚠️ Low stock alert: "Socks" has 8 units (threshold: 15)
Low stock alert email sent: <825cbb50-4fd1-2eb1-c8a0-b2d71ad92706@gmail.com>
Low stock alert email sent: <c05f5a28-770d-734e-28e8-0c8b31a87758@gmail.com>
⚠️ Low stock alert: "Sunglasses" has 5 units (threshold: 10)
Low stock alert email sent: <6b196e74-5d44-6057-554f-a2c2496563b2@gmail.com>
Low stock alert email sent: <dbe09b79-f2ed-0b8c-f624-8c59e67f7fad@gmail.com>
⚠️ Low stock alert: "Sandwich" has 3 units (threshold: 10)
Low stock alert email sent: <3df6490a-696f-19e3-80f1-a5b42f7693ac@gmail.com>
Low stock alert email sent: <81e80ebf-fcfe-f6c9-3656-81b601d47d73@gmail.com>
```

## Benefits

1. **Proactive Inventory Management**: Get notified before products run out
2. **Prevent Stockouts**: Maintain optimal inventory levels
3. **Automated Monitoring**: No manual checking required
4. **Customizable Thresholds**: Set different thresholds per product
5. **Multi-Manager Support**: All managers receive notifications

## Integration with Billing

The low stock alert system also integrates with the billing process:
- When a bill is created and stock drops below threshold, an alert is triggered
- This provides real-time notifications during sales

## Troubleshooting

### Not Receiving Emails?

1. **Check Email Configuration**: Verify `.env` file has correct SMTP settings
2. **Check Console Logs**: Emails are logged to console if SMTP is not configured
3. **Verify Manager Emails**: Ensure manager accounts have valid email addresses
4. **Check Spam Folder**: Low stock emails might be filtered as spam

### Email Configuration Not Working?

If you see this message:
```
Email configuration not found. Emails will be logged to console only.
```

**Solution**: 
- Add email configuration to `backend/.env` file
- Restart the backend server
- For Gmail, use an app-specific password (not your regular password)

### Console-Only Mode

Without email configuration, the system will log alerts to console:
```
=== LOW STOCK ALERT EMAIL ===
To: admin@retailkpi.com
Subject: Stock Alert – "Socks" is running low
[Email content here]
=============================
```

## Future Enhancements

Potential improvements:
- Dashboard widget showing low stock products
- Configurable notification frequency
- SMS notifications
- Slack/Teams integration
- Automatic purchase order generation
- Stock prediction based on sales trends
- Different threshold levels (warning, critical)

## Related Features

- **Product Expiry Notifications**: See `PRODUCT_EXPIRY_FEATURE.md`
- **Batch Tracking**: Track manufacturing and expiry dates
- **Billing System**: Automatic stock updates on sales

---

**Implementation Date**: October 27, 2024
**Version**: 1.0.0
**Status**: ✅ Active and Working
