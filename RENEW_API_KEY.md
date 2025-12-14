# Fix Expired Firebase API Key

## Problem
You're seeing this error:
```
Firebase: Error (auth/api-key-expired.-please-renew-the-api-key.)
```

Your Firebase API key has expired and needs to be renewed or replaced.

## Solution

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project: **ONEKNOT (oneknot-8c49b)**
3. If you don't see it, click the project dropdown at the top and select it

### Step 2: Navigate to API Credentials

1. In the left sidebar, go to **APIs & Services** → **Credentials**
2. Or search for "Credentials" in the top search bar

### Step 3: Find Your API Key

1. Look for the API key: `AIzaSyA5KgRgafHAMea93q36FwepBhTGhF-M5yY`
2. Click on it to open the details

### Step 4: Renew or Create New Key

**Option A: If there's a "Renew" button:**
- Click **Renew** or **Regenerate**
- Copy the new API key immediately

**Option B: If renewal isn't available:**
- Click **Delete** to remove the expired key
- Click **+ CREATE CREDENTIALS** at the top
- Select **API key**
- Copy the new API key immediately

### Step 5: Update Your `.env` File

Open your `.env` file and replace the old API key with the new one:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_NEW_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=oneknot-8c49b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oneknot-8c49b
VITE_FIREBASE_STORAGE_BUCKET=oneknot-8c49b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1045938150628
VITE_FIREBASE_APP_ID=1:1045938150628:web:4368ab0ed5da250543a0f1
VITE_EMAILJS_PUBLIC_KEY=Wg8eiCJOCtJ_3uRnl
VITE_EMAILJS_SERVICE_ID=service_l1feu4e
VITE_EMAILJS_TEMPLATE_ID=template_o804xg9
```

**Important:**
- Replace `YOUR_NEW_API_KEY_HERE` with the actual new key
- Make sure there are NO spaces around the `=` sign
- Make sure there are NO quotes around the value

### Step 6: Set API Key Restrictions (Recommended)

After creating the new key, set restrictions to improve security:

1. In the API key details page, scroll to **API restrictions**
2. Select **Restrict key**
3. Under **API restrictions**, select:
   - ✅ Identity Toolkit API
   - ✅ Cloud Firestore API
   - ✅ Cloud Storage API
4. Scroll to **Application restrictions**
5. Select **HTTP referrers (web sites)**
6. Add your domains:
   - `localhost:*` (for development)
   - `oneknot.space` (your production domain)
   - `*.vercel.app` (if using Vercel)
7. Click **Save**

### Step 7: Restart Dev Server

1. Stop your dev server (`Ctrl+C`)
2. Start it again:
   ```bash
   npm run dev
   ```
3. Hard refresh your browser (`Ctrl+Shift+R`)

### Step 8: Update Vercel (If Deployed)

If you've deployed to Vercel, update the environment variable there too:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your OneKnot project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_FIREBASE_API_KEY`
5. Click **Edit** and update with the new key
6. Redeploy your application

## Verify It's Working

After updating:
1. Try logging in with Google Sign-In
2. Check the browser console - you should NOT see the expired key error
3. If it works, you're all set!

## If You Still Have Issues

1. **Double-check the key**: Make sure you copied the entire key (they're long strings)
2. **Check for typos**: Ensure there are no extra spaces or characters
3. **Verify project**: Make sure you're using the key from the correct Firebase project
4. **Check restrictions**: If you set restrictions, make sure `localhost` is included for development
