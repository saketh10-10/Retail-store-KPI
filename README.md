# 🛍️ Retail Store KPI Dashboard

A comprehensive retail management system with real-time analytics, inventory tracking, and automated email notifications.

## 📊 Overview

Retail Store KPI Dashboard is a full-stack web application designed to help retail store managers monitor key performance indicators (KPIs), manage inventory, track product expiry, and receive automated alerts for low stock situations.

The system features role-based access control, real-time analytics, trending product insights, and intelligent email notifications to ensure stores stay well-stocked and profitable.

---

## ✨ Key Features

### 📈 **Analytics & Monitoring**
- Real-time sales and revenue tracking
- Interactive charts and visualizations
- Top-selling products analysis
- Trending products with multiple filters

### 📦 **Inventory Management**
- Product CRUD operations with batch tracking
- Automatic stock updates on billing
- Low stock threshold monitoring
- Product expiry date tracking

### 📧 **Email Notifications**
- **Low Stock Alerts:** Automatic emails when products fall below threshold
- **Expiry Alerts:** Notifications when products are within 10 days of expiry
- Customizable manager email addresses
- Beautiful HTML email templates

### 🌤️ **Weather Intelligence**
- Location-based weather insights
- Weather-aware product recommendations
- Automatic location detection

### 💰 **Billing System**
- Quick bill creation with product search
- Automatic inventory updates
- Bill history and tracking
- Real-time stock validation

### 🔒 **Role-Based Access**
- **Managers:** Full access to all features
- **Cashiers:** Restricted to billing only
- Secure JWT authentication

### 🔥 **Trending Products**
- Most Purchased
- Most Viewed
- Fastest Selling
- Highest Revenue
- Recently Added
- Category filtering

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Surya-saketh/Retail-store-KPI.git
cd Retail-store-KPI
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (see SETUP_GUIDE.md)
npm run start-db
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Configure Email (Required)**

Edit `backend/.env` and add your Gmail credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**📖 See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions!**

---

## 👥 Default Credentials

**Manager (Full Access):**
- Username: `admin`
- Password: `admin123`

**Cashier (Billing Only):**
- Username: `cashier1`
- Password: `cashier123`

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **SQLite3** (Database)
- **JWT** (Authentication)
- **Nodemailer** (Email notifications)
- **bcryptjs** (Password hashing)

### Frontend
- **React** + **TypeScript**
- **React Router** (Navigation)
- **Context API** (State management)
- **CSS Modules** (Styling)

---

## 📁 Project Structure

```
Retail-store-KPI/
├── backend/
│   ├── database/          # SQLite database & schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Email service
│   ├── middleware/        # Auth middleware
│   └── server.js          # Express server
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # API utilities
│   └── public/
└── docs/                  # Documentation
```

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[EMAIL_CONFIGURATION.md](EMAIL_CONFIGURATION.md)** - Email setup guide
- **[COMPLETE_IMPLEMENTATION.md](COMPLETE_IMPLEMENTATION.md)** - Technical overview

---

## 🎯 Features in Detail

### Email Notification System
- Automatic monitoring every hour
- Smart notification tracking (no duplicate alerts)
- Customizable thresholds per product
- Manager email configuration during login
- Fallback to console logging if SMTP not configured

### Trending Products
- Multiple filter options (purchased, viewed, selling speed)
- Time period selection (7, 30, 60, 90 days)
- Category-based filtering
- Real-time statistics

### Role-Based Access
- Managers: Full system access
- Cashiers: Billing page only
- Protected routes (frontend + backend)
- JWT-based authentication

---

## 🔒 Security

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Environment variables for sensitive data
- ✅ `.env` file in `.gitignore`
- ✅ Role-based access control
- ✅ Input validation and sanitization

---

## 🧪 Testing

### Test Email Configuration
```bash
cd backend
node test-email.js
```

### Test API Health
```bash
curl http://localhost:5000/api/health
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Surya Saketh**

GitHub: [@Surya-saketh](https://github.com/Surya-saketh)

---

## 🙏 Acknowledgments

- OpenWeather API for weather data
- Nodemailer for email functionality
- React community for excellent documentation

---

**⭐ If you find this project useful, please give it a star!**
