# 🚀 Retail Store KPI - Setup Guide

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- **Gmail account** (for email notifications - optional)

---

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Surya-saketh/Retail-store-KPI.git
cd Retail-store-KPI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

**IMPORTANT:** You must create your own `.env` file with your credentials.

```bash
# Copy the example file
cp .env.example .env

# Open .env and configure with your own values
```

Edit `backend/.env` and add your own credentials:

```env
# Weather API (Optional - for weather intelligence feature)
WEATHER_API_KEY=your_openweather_api_key_here

# Email Configuration (REQUIRED for email alerts)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com          # ← Your Gmail address
EMAIL_PASS=your-gmail-app-password-here  # ← Your Gmail App Password
```

#### 📧 How to Get Gmail App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Google account
3. Enable **2-Step Verification** (if not already enabled)
4. Select **"Mail"** and **"Windows Computer"**
5. Click **"Generate"**
6. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)
7. Remove spaces and paste in `.env`: `EMAIL_PASS=abcdefghijklmnop`

#### 🌤️ How to Get Weather API Key (Optional):

1. Go to: https://openweathermap.org/api
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env`: `WEATHER_API_KEY=your_key_here`

### 4. Start Backend Server

```bash
cd backend
npm run start-db
```

Backend will run on: `http://localhost:5000`

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 👥 Default Login Credentials

### Manager Account (Full Access)
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** All features (Dashboard, Analytics, Products, Billing, Trending)

### Cashier Account (Limited Access)
- **Username:** `cashier1`
- **Password:** `cashier123`
- **Access:** Billing page only

---

## 📧 Email Notification Setup

### For Managers:

1. **Login as manager** (username: `admin`, password: `admin123`)
2. **Email field will appear** - enter your email address
3. **Click Login**
4. You'll receive low stock alerts at this email when products fall below threshold

### Email Features:

- ✅ **Low Stock Alerts:** Sent when product quantity ≤ threshold (default: 10)
- ✅ **Product Expiry Alerts:** Sent when products are within 10 days of expiry
- ✅ **Automatic Monitoring:** Checks run on startup and every hour
- ✅ **Beautiful HTML Emails:** Professional templates with product details

---

## 🎯 Features Overview

### For Managers:
- 📊 **Dashboard:** Sales analytics, revenue charts, top products
- 🌤️ **Weather Intelligence:** Location-based weather insights
- 🔥 **Trending Products:** Most purchased, viewed, fastest selling
- 💰 **Billing:** Create bills, manage transactions
- 📦 **Products:** Add, edit, delete products with batch tracking
- 📧 **Email Alerts:** Low stock and expiry notifications

### For Cashiers:
- 💰 **Billing Only:** Create bills and process transactions

---

## 🗂️ Project Structure

```
Retail-store-KPI/
├── backend/
│   ├── database/          # SQLite database
│   ├── routes/            # API endpoints
│   ├── services/          # Email service
│   ├── middleware/        # Authentication
│   ├── .env.example       # Environment template
│   └── server.js          # Main server
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # Auth context
│   │   └── utils/         # API utilities
│   └── public/
└── README.md
```

---

## 🔒 Security Notes

### ⚠️ IMPORTANT:

1. **Never commit `.env` file** to Git (it's already in `.gitignore`)
2. **Change default passwords** in production
3. **Use strong JWT secret** in production
4. **Use Gmail App Password** (not regular password)
5. **Keep credentials private**

### What's Safe to Commit:
- ✅ `.env.example` (template with placeholders)
- ✅ Source code
- ✅ Documentation

### What to NEVER Commit:
- ❌ `.env` file (contains your credentials)
- ❌ `database/retail_kpi.db` (contains data)
- ❌ API keys or passwords

---

## 🧪 Testing the Setup

### 1. Test Backend:
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok"}`

### 2. Test Frontend:
Open browser: `http://localhost:3000`

### 3. Test Email Alerts:

**Option A: Manual Test**
```bash
cd backend
node test-email.js
```

**Option B: Via Application**
1. Login as manager and enter your email
2. Go to Billing page
3. Create a bill that reduces stock below 10
4. Check your email inbox (and spam folder)

---

## 📚 Additional Documentation

- **API_DOCUMENTATION.md** - Complete API reference
- **EMAIL_CONFIGURATION.md** - Detailed email setup
- **CASHIER_RESTRICTIONS.md** - Access control details
- **FEATURE_SETUP_GUIDE.md** - Feature explanations
- **COMPLETE_IMPLEMENTATION.md** - Full technical overview

---

## 🐛 Troubleshooting

### Backend won't start?
- Check if port 5000 is available
- Verify `npm install` completed successfully
- Check `.env` file exists and is configured

### Frontend won't start?
- Check if port 3000 is available
- Verify `npm install` completed successfully
- Ensure backend is running first

### Email not working?
- Verify Gmail App Password is correct (not regular password)
- Check spam/junk folder
- Ensure 2-Step Verification is enabled
- Check backend console for error messages
- Try running `node test-email.js` to test SMTP

### Can't login?
- Use default credentials: `admin` / `admin123`
- Clear browser cache and cookies
- Check backend is running on port 5000

---

## 🆘 Need Help?

1. Check the documentation files in the project
2. Review backend console for error messages
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are set correctly

---

## 🎉 You're All Set!

Once configured, you can:
- ✅ Login and manage your retail store
- ✅ Track inventory and sales
- ✅ Receive email alerts for low stock
- ✅ Monitor product expiry dates
- ✅ View trending products
- ✅ Generate bills and transactions

**Enjoy using Retail Store KPI!** 🚀

---

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created by Surya Saketh

GitHub: https://github.com/Surya-saketh/Retail-store-KPI
