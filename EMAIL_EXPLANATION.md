# 📧 Email System Explanation

## ✅ How It Actually Works:

### Two Different Emails:

1. **SMTP Email (in `.env` file)** 
   - This is the Gmail account that **SENDS** the emails
   - Like a mail server - it sends emails on behalf of your system
   - You configure this ONCE in `.env` file
   - Example: `system-alerts@gmail.com` or any Gmail account you own

2. **Manager's Email (entered during login)**
   - This is **WHERE** the alerts are sent TO
   - Each manager enters their own email during login
   - Can be ANY email address (Gmail, Yahoo, Outlook, etc.)
   - Stored in database for that manager
   - Example: Manager enters `boss@company.com` → alerts go there

---

## 🔄 How Email Alerts Work:

```
Stock drops below 10
    ↓
System checks database for managers with alerts enabled
    ↓
Finds manager's email: boss@company.com
    ↓
Uses SMTP account (from .env) to SEND email
    ↓
Email sent FROM: system-alerts@gmail.com (your SMTP account)
Email sent TO: boss@company.com (manager's email from login)
```

---

## 📝 Example Setup:

### `.env` file (SMTP - the sender):
```env
EMAIL_USER=your-gmail-account@gmail.com  ← Your Gmail that sends emails
EMAIL_PASS=your-app-password             ← Password for that Gmail
```

### Manager Login (recipient):
```
Username: admin
Password: admin123
Email: manager@company.com  ← Manager enters THEIR email
```

### Result:
When stock is low, email is:
- **FROM:** your-gmail-account@gmail.com (SMTP account)
- **TO:** manager@company.com (manager's email)

---

## 🎯 Why Two Different Emails?

**SMTP Email (`.env`):**
- Technical requirement - Gmail needs credentials to send emails
- You set this up once
- Can be any Gmail account you control
- Like a "system email account"

**Manager's Email (login):**
- Business requirement - where alerts should go
- Each manager enters their own
- Can be any email provider
- Managers can change it anytime

---

## ✅ What You Need to Do:

1. **In `.env` file:** Put YOUR Gmail account (the one that will send emails)
2. **During login:** Manager enters THEIR email (where they want to receive alerts)

That's it! The system handles the rest.

---

## 🧪 Example Test:

**Your Setup:**
- `.env`: `EMAIL_USER=alerts@gmail.com` (your Gmail)
- Manager enters: `boss@company.com` (their email)

**What Happens:**
- Stock drops below 10
- System uses `alerts@gmail.com` to send email
- Email arrives at `boss@company.com`
- Manager receives the alert!

---

## 💡 Summary:

- ✅ **`.env` EMAIL_USER** = Your Gmail account (sends emails)
- ✅ **Manager's email** = Where alerts go (entered during login)
- ✅ **Managers choose their own email** - NOT hardcoded!
- ✅ **Each manager can have different email**
- ✅ **System is flexible** - managers enter any email they want

---

**Your concern was valid! Manager emails are NOT hardcoded - they enter their own email during login!** ✅
