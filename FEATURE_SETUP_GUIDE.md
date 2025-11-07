# Quick Setup Guide - New Features

## 🚀 Features Added

1. **Trending Products** - Amazon-style trending section with multiple filters
2. **Automatic Inventory Updates** - Stock decreases automatically on billing
3. **Manager Email Notifications** - Low stock alerts via email (prices in ₹)

---

## 📋 Quick Start (5 Steps)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Email (Optional but Recommended)

Create or update `backend/.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=suryasaketh12@gmail.com
EMAIL_PASS=your-app-specific-password
```

**For Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App passwords → Select "Mail" → Generate
4. Copy the 16-character password to `EMAIL_PASS`

> **Note:** Without email config, alerts will log to console only.

### Step 3: Start the Server
```bash
npm run start-db
```

You should see:
```
🚀 Retail KPI Backend Server running on port 5000
📊 Weather API: http://localhost:5000/api/location
🔐 Authentication: http://localhost:5000/api/auth
📦 Products: http://localhost:5000/api/products
💰 Billing: http://localhost:5000/api/billing
🔥 Trending: http://localhost:5000/api/trending
⚙️  Manager Settings: http://localhost:5000/api/manager/settings
❤️  Health Check: http://localhost:5000/api/health
```

### Step 4: Login as Manager

**Default Manager Credentials:**
- Username: `admin`
- Password: `admin123`

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Copy the `token` from the response.

### Step 5: Configure Manager Email

```bash
POST http://localhost:5000/api/manager/settings
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "notification_email": "suryasaketh12@gmail.com",
  "enable_low_stock_alerts": true
}
```

---

## 🧪 Testing the Features

### Test 1: View Trending Products

```bash
GET http://localhost:5000/api/trending?filter=most_purchased&limit=10
Authorization: Bearer <your_token>
```

**Available Filters:**
- `most_purchased` - Highest quantity sold
- `most_viewed` - Most viewed products
- `fastest_selling` - Highest sales velocity
- `highest_revenue` - Top revenue generators
- `recently_added` - Latest products

### Test 2: Create a Billing Transaction

```bash
POST http://localhost:5000/api/billing
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 95
    }
  ]
}
```

**What happens:**
1. ✅ Stock automatically decreases from 100 to 5
2. ✅ System detects stock (5) < threshold (10)
3. ✅ Email sent to manager: "Stock Alert – Soap Bar is running low"
4. ✅ Email shows price in ₹ (Rupees)

### Test 3: Send Test Email

```bash
POST http://localhost:5000/api/manager/settings/test-email
Authorization: Bearer <your_token>
```

Check your email inbox for the test message.

### Test 4: Track Product Views

```bash
POST http://localhost:5000/api/trending/view/1
Authorization: Bearer <your_token>
```

Then check most viewed:
```bash
GET http://localhost:5000/api/trending?filter=most_viewed
Authorization: Bearer <your_token>
```

---

## 📊 Database Changes

### New Tables
- **manager_settings** - Stores manager email and alert preferences

### Updated Tables
- **products** - Added columns:
  - `min_stock_threshold` (default: 10) - Minimum stock before alert
  - `view_count` (default: 0) - Track product views

---

## 🎯 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trending` | GET | Get trending products |
| `/api/trending/view/:id` | POST | Track product view |
| `/api/trending/categories` | GET | Get trending categories |
| `/api/manager/settings` | GET | Get manager settings |
| `/api/manager/settings` | POST | Save manager email |
| `/api/manager/settings/test-email` | POST | Send test email |
| `/api/manager/settings/toggle-alerts` | PATCH | Enable/disable alerts |

---

## 💡 Usage Tips

### Customize Stock Thresholds

Update individual product thresholds:
```bash
PUT http://localhost:5000/api/products/1
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "min_stock_threshold": 20
}
```

### Filter by Category

```bash
GET http://localhost:5000/api/trending?filter=most_purchased&category=Beverages
Authorization: Bearer <your_token>
```

### Change Time Period

```bash
GET http://localhost:5000/api/trending?filter=fastest_selling&days=7
Authorization: Bearer <your_token>
```

### Disable Alerts Temporarily

```bash
PATCH http://localhost:5000/api/manager/settings/toggle-alerts
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "enable": false
}
```

---

## 📧 Email Alert Format

When stock falls below threshold, managers receive:

**Subject:** Stock Alert – "Product Name" is running low

**Content:**
- ⚠️ Alert header
- Product name
- **Current stock** (highlighted in red)
- Minimum threshold
- **Price in ₹** (Indian Rupees)
- Action required message

---

## 🔧 Troubleshooting

### Email Not Sending?
1. Check `.env` file has correct credentials
2. For Gmail, use App-Specific Password (not regular password)
3. Check console logs for error messages
4. Try test email endpoint first

### No Trending Data?
1. Create some billing transactions first
2. Ensure bills have `status = 'completed'`
3. Check time period includes your transactions

### Stock Not Decreasing?
1. Verify billing transaction was successful
2. Check product stock in database
3. Look for error messages in console

### Alerts Not Triggering?
1. Verify manager email is configured
2. Check `enable_low_stock_alerts = 1`
3. Ensure stock <= threshold
4. Look at console logs for email status

---

## 📱 Integration with Frontend

### Display Trending Products

```javascript
// Fetch trending products
const response = await fetch('http://localhost:5000/api/trending?filter=most_purchased', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
// data.products contains trending items with prices in ₹
```

### Track Product Views

```javascript
// When user views a product detail page
await fetch(`http://localhost:5000/api/trending/view/${productId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Manager Settings Page

```javascript
// Get current settings
const settings = await fetch('http://localhost:5000/api/manager/settings', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Update email
await fetch('http://localhost:5000/api/manager/settings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notification_email: 'suryasaketh12@gmail.com',
    enable_low_stock_alerts: true
  })
});
```

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Email configured in `.env` (optional)
- [ ] Server starts without errors
- [ ] Can login as manager
- [ ] Manager email configured
- [ ] Test email received
- [ ] Billing transaction decreases stock
- [ ] Low stock alert email received
- [ ] Trending products endpoint returns data
- [ ] Product view tracking works
- [ ] Prices displayed in ₹ (Rupees)

---

## 🎉 You're All Set!

Your store management system now has:
- ✅ Trending Products (like Amazon)
- ✅ Automatic Inventory Updates
- ✅ Manager Email Notifications
- ✅ Prices in ₹ (Indian Rupees)

For detailed API documentation, see `API_DOCUMENTATION.md`.

---

## 📞 Need Help?

Check the console logs - all operations are logged for debugging:
- Email sending status
- Stock updates
- Alert triggers
- API requests

Happy selling! 🛍️
