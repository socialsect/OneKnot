# 🚨 URGENT: Security Fix - Exposed API Key

## What Happened
Your Firebase API key was exposed in the `firebase-config-template.txt` file that was committed to GitHub.

## ✅ IMMEDIATE ACTIONS REQUIRED

### Step 1: Regenerate Your Firebase API Key (CRITICAL)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **ONEKNOT (oneknot-8c49b)**
3. Navigate to **APIs & Services** → **Credentials**
4. Find the API key: `AIzaSyA5KgRgafHAMea93q36FwepBhTGhF-M5yY`
5. Click on it to edit
6. Click **"Regenerate key"** or **"Delete"** then create a new one
7. **Copy the new API key immediately**

### Step 2: Update Your Local .env File

1. Open your `.env` file in the project root
2. Replace the old API key with the new one:
   ```
   VITE_FIREBASE_API_KEY=YOUR_NEW_API_KEY_HERE
   ```
3. Save the file

### Step 3: Add API Key Restrictions (IMPORTANT)

In Google Cloud Console → Credentials → Your API Key:

1. Click **"Restrict key"**
2. Under **Application restrictions**, select **"HTTP referrers"**
3. Add your domains:
   - `https://oneknot.space/*`
   - `https://www.oneknot.space/*`
   - `https://oneknot.vercel.app/*`
   - `http://localhost:*` (for development)
4. Under **API restrictions**, select **"Restrict key"**
5. Select only the APIs you need:
   - Firebase Authentication API
   - Cloud Firestore API
   - Cloud Storage API
6. Click **Save**

### Step 4: Remove Exposed Key from GitHub

The `firebase-config-template.txt` file has been fixed to use placeholders instead of real credentials.

**You need to:**
1. Commit the fixed file
2. Push to GitHub to replace the exposed version

```bash
git add firebase-config-template.txt
git commit -m "Security: Remove exposed API key from template file"
git push origin main
```

**Note:** The old key will still be in Git history, but regenerating the key makes it useless.

### Step 5: Update Vercel Environment Variables

If you've already deployed to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_FIREBASE_API_KEY` with your new key
3. Redeploy your application

### Step 6: Verify Everything Works

1. Test your app locally with the new key
2. Test authentication (login/signup)
3. Test Firestore operations
4. Test Storage uploads
5. After deploying, test on production

---

## 🔒 Prevention for Future

### ✅ DO:
- Use `.env` file for real credentials (already in `.gitignore`)
- Use template files with placeholder values only
- Add API key restrictions in Google Cloud Console
- Review files before committing to Git

### ❌ DON'T:
- Commit `.env` files
- Put real credentials in template files
- Hardcode API keys in source code
- Share credentials in documentation

---

## 📋 Checklist

- [ ] Regenerated Firebase API key in Google Cloud Console
- [ ] Updated local `.env` file with new key
- [ ] Added API key restrictions (HTTP referrers + API restrictions)
- [ ] Committed fixed `firebase-config-template.txt` to Git
- [ ] Pushed changes to GitHub
- [ ] Updated Vercel environment variables (if deployed)
- [ ] Tested app with new key locally
- [ ] Tested app on production (if deployed)

---

## ⚠️ Important Notes

1. **The old API key is compromised** - Anyone who saw it can use it until you regenerate
2. **Regenerating invalidates the old key** - Your app will break until you update it
3. **API restrictions help** - Even if someone gets the key, restrictions limit what they can do
4. **Git history still has the old key** - But it's useless once regenerated

---

## 🆘 If You Need Help

If you're stuck:
1. Check Google Cloud Console for API usage (to see if the key was abused)
2. Review Firebase project settings
3. Check Vercel deployment logs if issues occur
