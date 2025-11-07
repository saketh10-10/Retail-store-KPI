# Email Setup Guide - Low Stock Alerts

## ✅ What's Implemented

### 1. Manager Login with Email Field
- When you type "admin" or any username with "manager" in it, an **email field appears**
- Email is **required** for managers
- Email is validated (must be valid format)
- Email is saved automatically when manager logs in

### 2. Automatic Low Stock Alerts
- When a product's stock falls **below 10 units**, an email is sent automatically
- Email is sent to the manager's configured email address
- Email shows:
  - Product name
  - Current stock level
  - Minimum threshold (10)
  - Price in ₹ (Rupees)

---

## 🚀 How to Test

### Step 1: Configure Email (Optional but Recommended)

To actually **send emails**, configure your SMTP settings in `backend/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=suryasaketh12@gmail.com
EMAIL_PASS=your-app-specific-password
```

**For Gmail:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate a password for "Mail"
5. Use that 16-character password in `EMAIL_PASS`

**Without Email Config:**
- Alerts will be logged to the console instead
- You'll see the email content in the backend terminal

---

### Step 2: Login as Manager

1. Open `http://localhost:3000`
2. Enter username: **admin**
3. **Email field appears automatically!**
4. Enter email: **suryasaketh12@gmail.com**
5. Enter password: **admin123**
6. Click **Login**

---

### Step 3: Trigger Low Stock Alert

#### Option A: Create Billing Transaction
1. Go to **Billing** page
2. Search for a product (e.g., "Soap")
3. Add **95 units** to the bill (if product has 100 in stock)
4. Click **Create Bill**
5. Stock drops from 100 → 5 (below threshold of 10)
6. **Email sent automatically!**

#### Option B: Edit Product Directly (Manager Only)
1. Go to **Products** page
2. Find a product
3. Click **Edit**
4. Change stock to **8** (below 10)
5. Save
6. **Email sent automatically!**

---

## 📧 Email Format

**Subject:**
```
Stock Alert – "Soap Bar" is running low
```

**Body:**
```
⚠️ Low Stock Alert

Attention Required!
The current stock for Soap Bar has dropped below the minimum threshold. 
Please restock soon to avoid stockouts.

Product Details:
- Product Name: Soap Bar
- Current Stock: 5 units
- Minimum Threshold: 10 units
- Price: ₹2.50

Action Required: Please arrange for restocking this product as soon as possible.
```

---

## 🔧 How It Works

### Backend Flow:
1. **Billing transaction created** → `POST /api/billing`
2. **Stock updated** in database (quantity decreases)
3. **System checks** if new stock <= 10
4. **If yes**, queries all managers with alerts enabled
5. **Sends email** to each manager's configured email
6. **Email sent asynchronously** (doesn't block the transaction)

### Frontend Flow:
1. **User types "admin"** in username field
2. **Email field appears** automatically
3. **User enters email** and password
4. **On login**, email is saved to backend
5. **Manager receives alerts** at that email

---

## ⚙️ Customization

### Change Stock Threshold

Default is 10 units. To change for a specific product:

```bash
PUT http://localhost:5000/api/products/:id
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "min_stock_threshold": 20
}
```

### Change Manager Email

Managers can update their email anytime:

```bash
POST http://localhost:5000/api/manager/settings
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "notification_email": "newemail@example.com",
  "enable_low_stock_alerts": true
}
```

### Disable Alerts

```bash
PATCH http://localhost:5000/api/manager/settings/toggle-alerts
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "enable": false
}
```

---

## 🎯 Testing Checklist

- [ ] Backend server running (`npm run start-db` in backend folder)
- [ ] Frontend server running (`npm start` in frontend folder)
- [ ] Type "admin" in username field
- [ ] Email field appears below password
- [ ] Enter email address
- [ ] Login successful
- [ ] Create billing transaction that reduces stock below 10
- [ ] Check email inbox for alert (if SMTP configured)
- [ ] OR check backend console for email log (if no SMTP)

---

## 📊 Current Setup

### Default Manager Accounts:
- **Username:** admin
- **Password:** admin123
- **Role:** manager

- **Username:** manager1
- **Password:** manager123
- **Role:** manager

### Default Product Thresholds:
- All products: **10 units** (can be customized per product)

### Email Trigger:
- Automatic when stock <= threshold after billing transaction
- Sent to all managers with `enable_low_stock_alerts = 1`

---

## 🐛 Troubleshooting

### Email field not showing?
- Make sure username is "admin" or contains "manager"
- Check browser console for errors

### Email not received?
- Check backend console for email logs
- Verify SMTP settings in `.env`
- For Gmail, use App-Specific Password (not regular password)
- Check spam folder

### Alert not triggered?
- Verify stock fell below threshold (10 units)
- Check backend console for logs
- Ensure manager has configured email
- Ensure `enable_low_stock_alerts = 1`

---

## ✅ Summary

✅ Email field appears on login page for managers  
✅ Email is required for manager login  
✅ Email is validated and saved automatically  
✅ Low stock alerts sent when stock < 10 units  
✅ Email shows product details and price in ₹  
✅ Alerts sent automatically after billing transactions  
✅ Multiple managers can receive alerts  
✅ Email configuration is optional (logs to console if not configured)  

**Everything is working and ready to use!** 🎉
