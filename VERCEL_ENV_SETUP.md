# Add Environment Variables to Vercel

## Problem
Your app works locally but shows Firebase API key errors on your domain (`oneknot.space`). This is because environment variables from `.env` are NOT automatically deployed to Vercel.

## Solution: Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Find and click on your **OneKnot** project

### Step 2: Navigate to Environment Variables

1. Click on **Settings** (top navigation)
2. Click on **Environment Variables** (left sidebar)

### Step 3: Add Each Environment Variable

You need to add **ALL** of these variables. Click **Add New** for each one:

#### Firebase Variables:

1. **Variable Name:** `VITE_FIREBASE_API_KEY`
   - **Value:** Your Firebase API key (the one from Google Cloud Console)
   - **Environments:** Select all (Production, Preview, Development)

2. **Variable Name:** `VITE_FIREBASE_AUTH_DOMAIN`
   - **Value:** `oneknot-8c49b.firebaseapp.com`
   - **Environments:** Select all

3. **Variable Name:** `VITE_FIREBASE_PROJECT_ID`
   - **Value:** `oneknot-8c49b`
   - **Environments:** Select all

4. **Variable Name:** `VITE_FIREBASE_STORAGE_BUCKET`
   - **Value:** `oneknot-8c49b.firebasestorage.app`
   - **Environments:** Select all

5. **Variable Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - **Value:** `1045938150628`
   - **Environments:** Select all

6. **Variable Name:** `VITE_FIREBASE_APP_ID`
   - **Value:** `1:1045938150628:web:4368ab0ed5da250543a0f1`
   - **Environments:** Select all

#### EmailJS Variables (if you're using email invites):

7. **Variable Name:** `VITE_EMAILJS_PUBLIC_KEY`
   - **Value:** `Wg8eiCJOCtJ_3uRnl`
   - **Environments:** Select all

8. **Variable Name:** `VITE_EMAILJS_SERVICE_ID`
   - **Value:** `service_l1feu4e`
   - **Environments:** Select all

9. **Variable Name:** `VITE_EMAILJS_TEMPLATE_ID`
   - **Value:** `template_o804xg9`
   - **Environments:** Select all

### Step 4: Important Notes

- **Select ALL environments** (Production, Preview, Development) for each variable
- **No spaces** around the `=` sign (Vercel handles this automatically)
- **No quotes** around the values
- Make sure you're using the **correct API key** (the one from Google Cloud Console, not the expired one)

### Step 5: Redeploy Your Application

After adding all environment variables:

1. Go to the **Deployments** tab
2. Find your latest deployment
3. Click the **three dots** (⋯) menu
4. Click **Redeploy**
5. Or push a new commit to trigger a new deployment

### Step 6: Verify It's Working

1. Wait for the deployment to complete (usually 1-2 minutes)
2. Visit your domain: `https://oneknot.space`
3. Try logging in with Google
4. Check the browser console - the API key error should be gone!

## Quick Copy-Paste Checklist

Make sure you have these 9 variables in Vercel:

- [ ] `VITE_FIREBASE_API_KEY` = (your API key from Google Cloud Console)
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `oneknot-8c49b.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `oneknot-8c49b`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `oneknot-8c49b.firebasestorage.app`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = `1045938150628`
- [ ] `VITE_FIREBASE_APP_ID` = `1:1045938150628:web:4368ab0ed5da250543a0f1`
- [ ] `VITE_EMAILJS_PUBLIC_KEY` = `Wg8eiCJOCtJ_3uRnl`
- [ ] `VITE_EMAILJS_SERVICE_ID` = `service_l1feu4e`
- [ ] `VITE_EMAILJS_TEMPLATE_ID` = `template_o804xg9`

## If You Still See Errors

1. **Double-check the API key**: Make sure you copied the entire key from Google Cloud Console
2. **Check deployment logs**: In Vercel, go to your deployment → **Logs** tab to see if there are any build errors
3. **Clear browser cache**: Hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)
4. **Wait a few minutes**: Sometimes it takes a moment for environment variables to propagate

## Pro Tip: Update Firebase Authorized Domains

After deploying, make sure your domain is authorized in Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ONEKNOT**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add: `oneknot.space`
5. Add: `www.oneknot.space` (if you're using www)
6. `localhost` should already be there for development

This ensures Firebase Auth works on your production domain!
