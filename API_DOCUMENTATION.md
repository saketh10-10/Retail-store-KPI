# Retail KPI API Documentation

## Overview
This document describes the new features added to the Retail KPI Management System:
- **Trending Products**: Display popular products with multiple filter options
- **Automatic Inventory Updates**: Stock automatically decreases after billing transactions
- **Manager Email Notifications**: Low stock alerts sent to managers via email

All prices are displayed in **Indian Rupees (₹)**.

---

## Table of Contents
1. [Trending Products API](#trending-products-api)
2. [Manager Settings API](#manager-settings-api)
3. [Enhanced Billing API](#enhanced-billing-api)
4. [Setup Instructions](#setup-instructions)

---

## Trending Products API

### Base URL
```
/api/trending
```

### 1. Get Trending Products

**Endpoint:** `GET /api/trending`

**Description:** Retrieve trending products based on various filters (similar to Amazon's trending section).

**Authentication:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| filter | string | most_purchased | Filter type: `most_purchased`, `most_viewed`, `fastest_selling`, `highest_revenue`, `recently_added` |
| limit | integer | 10 | Number of products to return |
| days | integer | 30 | Time period in days to analyze |
| category | string | - | Filter by product category (optional) |

**Example Request:**
```bash
GET /api/trending?filter=most_purchased&limit=10&days=30
Authorization: Bearer <your_token>
```

**Example Response:**
```json
{
  "filter": "most_purchased",
  "period_days": 30,
  "category": "all",
  "products": [
    {
      "id": 1,
      "name": "Soap Bar",
      "description": "Premium soap bar",
      "price": 2.50,
      "stock_quantity": 85,
      "category": "Personal Care",
      "sku": "SOAP001",
      "total_sold": 45,
      "order_count": 12,
      "total_revenue": 112.50
    }
  ],
  "summary": {
    "total_products": 15,
    "total_items_sold": 450,
    "total_revenue": 2500.75,
    "total_orders": 85
  }
}
```

**Filter Options:**
- **most_purchased**: Products with highest total quantity sold
- **most_viewed**: Products with highest view count
- **fastest_selling**: Products with highest sales velocity (sales per day)
- **highest_revenue**: Products generating the most revenue
- **recently_added**: Recently added products

---

### 2. Track Product View

**Endpoint:** `POST /api/trending/view/:id`

**Description:** Increment the view count for a product (used for "Most Viewed" tracking).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Product ID |

**Example Request:**
```bash
POST /api/trending/view/1
Authorization: Bearer <your_token>
```

**Example Response:**
```json
{
  "message": "Product view tracked"
}
```

---

### 3. Get Trending Categories

**Endpoint:** `GET /api/trending/categories`

**Description:** Get trending product categories based on sales data.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | integer | 30 | Time period in days to analyze |

**Example Response:**
```json
{
  "period_days": 30,
  "categories": [
    {
      "category": "Personal Care",
      "product_count": 5,
      "total_sold": 150,
      "total_revenue": 450.50,
      "order_count": 45
    }
  ]
}
```

---

## Manager Settings API

### Base URL
```
/api/manager/settings
```

### 1. Get Manager Settings

**Endpoint:** `GET /api/manager/settings`

**Description:** Retrieve the current manager's email notification settings.

**Authentication:** Required (Bearer Token, Manager role only)

**Example Response:**
```json
{
  "settings": {
    "id": 1,
    "user_id": 1,
    "notification_email": "suryasaketh12@gmail.com",
    "enable_low_stock_alerts": 1,
    "created_at": "2024-10-26T03:38:00.000Z",
    "updated_at": "2024-10-26T03:38:00.000Z"
  }
}
```

---

### 2. Create/Update Manager Settings

**Endpoint:** `POST /api/manager/settings`

**Description:** Create or update manager email notification settings.

**Authentication:** Required (Bearer Token, Manager role only)

**Request Body:**
```json
{
  "notification_email": "suryasaketh12@gmail.com",
  "enable_low_stock_alerts": true
}
```

**Example Response:**
```json
{
  "message": "Settings saved successfully",
  "settings": {
    "id": 1,
    "user_id": 1,
    "notification_email": "suryasaketh12@gmail.com",
    "enable_low_stock_alerts": 1,
    "created_at": "2024-10-26T03:38:00.000Z",
    "updated_at": "2024-10-26T03:38:00.000Z"
  }
}
```

---

### 3. Send Test Email

**Endpoint:** `POST /api/manager/settings/test-email`

**Description:** Send a test email to verify email configuration.

**Authentication:** Required (Bearer Token, Manager role only)

**Example Response:**
```json
{
  "message": "Test email sent successfully",
  "details": {
    "success": true,
    "messageId": "<message-id@example.com>"
  }
}
```

---

### 4. Toggle Low Stock Alerts

**Endpoint:** `PATCH /api/manager/settings/toggle-alerts`

**Description:** Enable or disable low stock email alerts.

**Authentication:** Required (Bearer Token, Manager role only)

**Request Body:**
```json
{
  "enable": true
}
```

**Example Response:**
```json
{
  "message": "Low stock alerts enabled",
  "settings": {
    "id": 1,
    "user_id": 1,
    "notification_email": "suryasaketh12@gmail.com",
    "enable_low_stock_alerts": 1,
    "created_at": "2024-10-26T03:38:00.000Z",
    "updated_at": "2024-10-26T03:38:00.000Z"
  }
}
```

---

## Enhanced Billing API

### Automatic Inventory Updates

When a billing transaction is created via `POST /api/billing`, the system now:

1. **Automatically decreases product stock** by the quantity purchased
2. **Checks if stock falls below the minimum threshold**
3. **Sends email alerts** to all managers who have:
   - Configured their notification email
   - Enabled low stock alerts

### Low Stock Alert Email Format

**Subject:**
```
Stock Alert – "Product Name" is running low
```

**Email Body Includes:**
- Product name
- Current stock level (highlighted in red)
- Minimum threshold
- Price in ₹ (Rupees)
- Action required message

**Example Email:**
```
⚠️ Low Stock Alert

Attention Required!
The current stock for Soap Bar has dropped below the minimum threshold. 
Please restock soon to avoid stockouts.

Product Details:
- Product Name: Soap Bar
- Current Stock: 8 units
- Minimum Threshold: 10 units
- Price: ₹2.50

Action Required: Please arrange for restocking this product as soon as possible.
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

The new `nodemailer` package will be installed automatically.

---

### 2. Configure Email Settings

Copy `.env.example` to `.env` and configure email settings:

```env
# Email Configuration (for low stock alerts)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**For Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App-Specific Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

**Note:** If email configuration is not provided, alerts will be logged to the console only.

---

### 3. Initialize Database

The database will automatically update with new tables when you start the server:

```bash
npm run start-db
```

**New Tables Added:**
- `manager_settings`: Stores manager email and notification preferences
- Updated `products` table with:
  - `min_stock_threshold`: Minimum stock level before alert (default: 10)
  - `view_count`: Track product views for trending analysis

---

### 4. Configure Manager Email

1. **Login as a manager** (username: `admin`, password: `admin123`)
2. **Set notification email:**
   ```bash
   POST /api/manager/settings
   {
     "notification_email": "suryasaketh12@gmail.com",
     "enable_low_stock_alerts": true
   }
   ```
3. **Test email configuration:**
   ```bash
   POST /api/manager/settings/test-email
   ```

---

### 5. Update Product Thresholds (Optional)

You can customize the minimum stock threshold for each product:

```bash
PUT /api/products/:id
{
  "min_stock_threshold": 15
}
```

---

## Usage Examples

### Example 1: Get Most Purchased Products (Last 7 Days)

```bash
curl -X GET "http://localhost:5000/api/trending?filter=most_purchased&days=7&limit=5" \
  -H "Authorization: Bearer <your_token>"
```

---

### Example 2: Get Fastest Selling Products in Beverages Category

```bash
curl -X GET "http://localhost:5000/api/trending?filter=fastest_selling&category=Beverages&limit=10" \
  -H "Authorization: Bearer <your_token>"
```

---

### Example 3: Track Product View

```bash
curl -X POST "http://localhost:5000/api/trending/view/1" \
  -H "Authorization: Bearer <your_token>"
```

---

### Example 4: Create Billing Transaction (Triggers Stock Alert)

```bash
curl -X POST "http://localhost:5000/api/billing" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 5
      }
    ]
  }'
```

If the product stock falls below the threshold after this transaction, all managers with enabled alerts will receive an email notification.

---

## Key Features Summary

✅ **Trending Products Section**
- Multiple filter options (Most Purchased, Most Viewed, Fastest Selling, etc.)
- Dynamic updates based on recent sales data
- Category filtering support
- Customizable time periods

✅ **Automatic Inventory Update**
- Stock automatically decreases on billing transactions
- Real-time inventory tracking
- Stock validation before purchase

✅ **Manager Email Notification System**
- Customizable manager email address
- Low stock threshold alerts
- Beautiful HTML email templates
- Toggle alerts on/off
- Test email functionality
- Prices displayed in ₹ (Rupees)

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/trending` | Get trending products | Required |
| POST | `/api/trending/view/:id` | Track product view | Required |
| GET | `/api/trending/categories` | Get trending categories | Required |
| GET | `/api/manager/settings` | Get manager settings | Manager only |
| POST | `/api/manager/settings` | Create/update settings | Manager only |
| POST | `/api/manager/settings/test-email` | Send test email | Manager only |
| PATCH | `/api/manager/settings/toggle-alerts` | Toggle alerts | Manager only |

---

## Testing the Features

1. **Start the server:**
   ```bash
   npm run start-db
   ```

2. **Login as manager:**
   ```bash
   POST /api/auth/login
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

3. **Configure email:**
   ```bash
   POST /api/manager/settings
   {
     "notification_email": "suryasaketh12@gmail.com"
   }
   ```

4. **Create some billing transactions** to generate trending data

5. **View trending products:**
   ```bash
   GET /api/trending?filter=most_purchased
   ```

6. **Test low stock alert** by creating a transaction that reduces stock below threshold

---

## Troubleshooting

### Email Not Sending
- Check `.env` file has correct email configuration
- For Gmail, ensure you're using an App-Specific Password
- Check console logs for error messages
- Try sending a test email via `/api/manager/settings/test-email`

### No Trending Data
- Ensure you have completed billing transactions in the database
- Check that bills have status = 'completed'
- Verify the time period (days parameter) includes transactions

### Low Stock Alerts Not Triggering
- Verify manager has configured email in settings
- Check that `enable_low_stock_alerts` is set to 1
- Ensure product's `stock_quantity` <= `min_stock_threshold`
- Check console logs for email sending status

---

## Support

For issues or questions, check the console logs for detailed error messages. All email operations are logged to the console for debugging purposes.
