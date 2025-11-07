# ✅ Pre-Commit Checklist

## Before Pushing to GitHub

### 🔒 Security Check

- [ ] **`.env` file is NOT committed** (check with `git status`)
- [ ] **Database files are NOT committed** (`*.db` files)
- [ ] **No hardcoded credentials** in source code
- [ ] **`.gitignore` includes:**
  - `.env`
  - `backend/.env`
  - `backend/database/*.db`
  - `node_modules/`

### 📝 Configuration Files

- [ ] **`.env.example` has placeholder values only**
  - ✅ `EMAIL_USER=your-email@gmail.com`
  - ✅ `EMAIL_PASS=your-gmail-app-password-here`
  - ❌ NO real email addresses
  - ❌ NO real passwords

### 📚 Documentation

- [ ] **README.md** is up to date
- [ ] **SETUP_GUIDE.md** has clear instructions
- [ ] **All documentation files** are included

### 🧪 Testing

- [ ] **Backend starts without errors**
- [ ] **Frontend compiles successfully**
- [ ] **No console errors** in browser
- [ ] **Test scripts work** (optional)

### 🗑️ Cleanup

- [ ] **Remove test files** (if any):
  - `test-email.js` (optional - can keep for users)
  - `check-email-status.js` (optional - can keep for users)
  - Any personal test data

- [ ] **Remove temporary files**:
  - `*.log` files
  - `*.tmp` files
  - Editor-specific files

### 📦 Files to Commit

✅ **Safe to commit:**
- Source code (`.js`, `.ts`, `.tsx`, `.css`)
- `.env.example` (with placeholders)
- `package.json` and `package-lock.json`
- Documentation (`.md` files)
- `.gitignore`

❌ **NEVER commit:**
- `.env` (contains your credentials)
- `backend/database/*.db` (contains data)
- `node_modules/` (dependencies)
- Personal API keys or passwords

---

## Quick Verification Commands

### Check what will be committed:
```bash
git status
```

### Check for sensitive data:
```bash
# Search for your email in tracked files
git grep -i "suryasaketh76@gmail.com"

# Search for password patterns
git grep -i "EMAIL_PASS"
```

### Verify .env is ignored:
```bash
git check-ignore backend/.env
# Should output: backend/.env
```

### Verify database is ignored:
```bash
git check-ignore backend/database/retail_kpi.db
# Should output: backend/database/retail_kpi.db
```

---

## If You Accidentally Committed Sensitive Data

### Remove from Git history:
```bash
# Remove .env from Git (keeps local file)
git rm --cached backend/.env

# Remove database
git rm --cached backend/database/*.db

# Commit the removal
git commit -m "Remove sensitive files from tracking"
```

### If already pushed to GitHub:
1. **Change all passwords immediately**
2. **Revoke API keys**
3. **Generate new Gmail App Password**
4. **Update `.env` with new credentials**

---

## Final Check Before Push

```bash
# 1. Check status
git status

# 2. Review changes
git diff

# 3. Ensure .env is not staged
git ls-files | grep .env
# Should only show .env.example

# 4. Push safely
git push origin main
```

---

## ✅ You're Ready to Push!

Once all checks pass, you can safely push to GitHub:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

**Remember:** Users will need to create their own `.env` file using `.env.example` as a template!
