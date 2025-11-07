# 🔑 How to Get Gmail App Password

## Quick Steps:

1. **Go to:** https://myaccount.google.com/apppasswords

2. **Sign in** with your Gmail account (suryasaketh12@gmail.com)

3. **Select:**
   - App: Mail
   - Device: Windows Computer

4. **Click "Generate"**

5. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

6. **Open:** `d:\RETAILKPI\backend\.env`

7. **Replace this line:**
   ```
   EMAIL_PASS=your-gmail-app-password-here
   ```
   
   **With:** (remove spaces from the password)
   ```
   EMAIL_PASS=abcdefghijklmnop
   ```

8. **Restart backend server:**
   - Stop current server (Ctrl+C)
   - Run: `npm run start-db`

9. **Test:**
   - Login as manager with your email
   - Create a bill that reduces stock below 10
   - Check your email!

---

## Note:
If you don't have 2-Step Verification enabled, you'll need to enable it first:
https://myaccount.google.com/security

---

**That's it! Once you add the real password, emails will be sent automatically!**
