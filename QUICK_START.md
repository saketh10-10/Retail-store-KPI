# 🚀 Quick Start Guide

## Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start-db

# Terminal 2 - Frontend
cd frontend
npm start
```

**Open:** `http://localhost:3000`

---

## 👥 Login Credentials

### Cashier (Billing Only)
```
Username: cashier1
Password: cashier123
Access: Billing page only
```

### Manager (Full Access)
```
Username: admin
Password: admin123
Email: your-email@gmail.com (enter any valid email)
Access: All pages
```

---

## 📧 Enable Email Alerts (Optional)

Edit `backend/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Gmail App Password:** https://myaccount.google.com/apppasswords

**Then restart backend!**

---

## ✅ What Works

- ✅ Cashiers: Billing only
- ✅ Managers: All pages
- ✅ Trending Products page
- ✅ Email field for managers
- ✅ Stock alerts when < 10 units
- ✅ All prices in ₹ (Rupees)

---

## 🎯 Quick Test

1. **Login as cashier** → See only Billing
2. **Login as manager** → See all pages
3. **Go to Trending** → See filters and stats
4. **Create bill** (95 units of Soap) → Stock drops to 5
5. **Check email** → Low stock alert (if SMTP configured)

---

## 📚 Documentation

- `FINAL_SUMMARY.md` - Complete overview
- `EMAIL_CONFIGURATION.md` - Email setup
- `CASHIER_RESTRICTIONS.md` - Access control

---

**That's it! You're ready to go! 🎉**
