# Update Environment Variables

## ⚠️ IMPORTANT SECURITY NOTE

**If `AIzaSyA5KgRgafHAMea93q36FwepBhTGhF-M5yY` is the SAME key that was exposed, you MUST regenerate it in Google Cloud Console!**

The exposed key is compromised and should not be reused. Please:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=oneknot-8c49b)
2. Regenerate the API key
3. Use the NEW key below

---

## 📝 Values to Update

### Update Your `.env` File

Create or update `.env` in the project root with these values:

```env
VITE_FIREBASE_API_KEY=AIzaSyA5KgRgafHAMea93q36FwepBhTGhF-M5yY
VITE_FIREBASE_AUTH_DOMAIN=oneknot-8c49b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oneknot-8c49b
VITE_FIREBASE_STORAGE_BUCKET=oneknot-8c49b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1045938150628
VITE_FIREBASE_APP_ID=1:1045938150628:web:4368ab0ed5da250543a0f1
```

### Update Vercel Environment Variables

If you've deployed to Vercel, add/update these in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

```
VITE_FIREBASE_API_KEY = AIzaSyA5KgRgafHAMea93q36FwepBhTGhF-M5yY
VITE_FIREBASE_AUTH_DOMAIN = oneknot-8c49b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = oneknot-8c49b
VITE_FIREBASE_STORAGE_BUCKET = oneknot-8c49b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 1045938150628
VITE_FIREBASE_APP_ID = 1:1045938150628:web:4368ab0ed5da250543a0f1
```

**Important:** Select all environments (Production, Preview, Development) when adding.

---

## ✅ Verification

After updating:
1. Restart your dev server: `npm run dev`
2. Test login/signup
3. Test creating a wedding
4. Test uploading to gallery

If everything works, the key is correctly configured!
