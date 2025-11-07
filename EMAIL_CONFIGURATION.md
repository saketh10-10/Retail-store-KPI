# Email Configuration Guide

## 🚨 Why You're Not Receiving Emails

The backend needs **SMTP email configuration** to send actual emails. Without this, emails are only logged to the console.

---

## ✅ How to Fix - Configure Email Sending

### Step 1: Edit `.env` file in backend folder

Open `d:\RETAILKPI\backend\.env` and add these lines:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

---

## 📧 For Gmail Users (Recommended)

### Option 1: Use App-Specific Password (Most Secure)

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification:**
   - Click "2-Step Verification"
   - Follow the steps to enable it

3. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

4. **Update `.env` file:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=suryasaketh12@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
   (Remove spaces from the app password)

### Option 2: Allow Less Secure Apps (Not Recommended)

1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps"
3. Use your regular Gmail password in `.env`

---

## 📧 For Other Email Providers

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Custom SMTP Server
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=alerts@yourdomain.com
EMAIL_PASS=your-password
```

---

## 🔄 Step 2: Restart Backend Server

After editing `.env`, restart the backend:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
cd backend
npm run start-db
```

---

## 🧪 Step 3: Test Email Sending

### Method 1: Via API (Recommended)

1. **Login as manager** to get auth token
2. **Send test email:**

```bash
curl -X POST http://localhost:5000/api/manager/settings/test-email \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Method 2: Via Frontend

1. Login as manager (username: `admin`, password: `admin123`)
2. Enter your email address
3. Create a billing transaction that reduces stock below 10
4. Check your email inbox!

---

## 📊 Example Complete `.env` File

```env
# Server Configuration
PORT=5000

# Weather API
WEATHER_API_KEY=your_openweather_api_key_here

# JWT Secret
JWT_SECRET=retail-kpi-secret-key-2024-change-this-in-production

# Email Configuration (REQUIRED FOR EMAIL ALERTS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=suryasaketh12@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

---

## 🎯 Testing Low Stock Alerts

### Scenario: Trigger Email Alert

1. **Login as manager:**
   - Username: `admin`
   - Password: `admin123`
   - Email: `your-email@gmail.com`

2. **Go to Billing page**

3. **Create a bill that reduces stock below 10:**
   - Search for "Soap" (has 100 units)
   - Add 95 units to bill
   - Create bill
   - Stock drops to 5 (below threshold of 10)

4. **Check your email!**
   - Subject: "Stock Alert – Soap Bar is running low"
   - Shows current stock, threshold, and price in ₹

---

## 🐛 Troubleshooting

### "Authentication failed" error

**Solution:** Use App-Specific Password for Gmail (see above)

### "Connection timeout" error

**Solution:** 
- Check your internet connection
- Try port 465 with `EMAIL_SECURE=true`
- Check firewall settings

### Email not received but no errors

**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Check backend console for logs
- Try sending test email via API

### Backend console shows "Email sent successfully" but no email

**Solution:**
- Email might be in spam folder
- SMTP credentials might be incorrect
- Try a different email provider

---

## 📝 Quick Setup Checklist

- [ ] Edit `backend/.env` file
- [ ] Add EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
- [ ] For Gmail: Generate App-Specific Password
- [ ] Restart backend server
- [ ] Login as manager and enter email
- [ ] Create billing transaction (reduce stock below 10)
- [ ] Check email inbox (and spam folder)

---

## 🎉 Success Indicators

✅ Backend console shows: `Low stock alert sent to your-email@gmail.com for Product Name`  
✅ Email received with subject: "Stock Alert – [Product] is running low"  
✅ Email shows product details and price in ₹  

---

## 💡 Without Email Configuration

If you don't configure SMTP:
- ✅ System still works normally
- ✅ Alerts are logged to backend console
- ❌ No actual emails are sent

**Console Output Example:**
```
Low stock alert sent to manager@example.com for Soap Bar
Email content:
Subject: Stock Alert – Soap Bar is running low
Body: Current Stock: 5 units, Threshold: 10 units, Price: ₹2.50
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` file** to Git (already in .gitignore)
2. ✅ **Use App-Specific Passwords** for Gmail
3. ✅ **Don't share your `.env` file** with anyone
4. ✅ **Use environment variables** in production
5. ✅ **Rotate passwords regularly**

---

## 📞 Need Help?

If emails still don't work after following this guide:

1. Check backend console for error messages
2. Verify SMTP settings with your email provider
3. Try a different email provider (Gmail is most reliable)
4. Test with a simple email first (test-email endpoint)

---

**Last Updated:** October 26, 2024  
**Status:** Email system ready - just needs SMTP configuration!
