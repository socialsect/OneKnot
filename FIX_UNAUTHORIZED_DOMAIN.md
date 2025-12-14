# Fix Firebase Unauthorized Domain Error

## Problem
You're seeing this error:
```
Firebase: Error (auth/unauthorized-domain)
```

This means your domain (`oneknot.space`) is not authorized in Firebase Authentication settings.

## Solution: Add Your Domain to Firebase Authorized Domains

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ONEKNOT (oneknot-8c49b)**

### Step 2: Navigate to Authentication Settings

1. In the left sidebar, click **Authentication**
2. Click on the **Settings** tab (gear icon at the top)
3. Scroll down to **Authorized domains**

### Step 3: Add Your Domain

You'll see a list of authorized domains. By default, Firebase includes:
- `localhost` (for development)
- `oneknot-8c49b.firebaseapp.com` (Firebase hosting)
- `oneknot-8c49b.web.app` (Firebase hosting)

**Add your custom domain:**

1. Click **Add domain** button
2. Enter: `oneknot.space`
3. Click **Add**

**If you're using www subdomain:**

1. Click **Add domain** again
2. Enter: `www.oneknot.space`
3. Click **Add**

### Step 4: Verify It's Added

After adding, you should see your domain in the list:
- ✅ `localhost`
- ✅ `oneknot-8c49b.firebaseapp.com`
- ✅ `oneknot-8c49b.web.app`
- ✅ `oneknot.space` (newly added)
- ✅ `www.oneknot.space` (if you added it)

### Step 5: Test It

1. Go back to your website: `https://oneknot.space`
2. Try logging in with Google Sign-In
3. The unauthorized domain error should be gone!

## Important Notes

- **Changes take effect immediately** - no need to redeploy
- **You can add up to 20 authorized domains** per Firebase project
- **Make sure you add both `oneknot.space` and `www.oneknot.space`** if you're using both
- **If you're using Vercel preview deployments**, you might also want to add `*.vercel.app` (but Firebase doesn't support wildcards, so you'd need to add specific preview URLs if needed)

## If You Still See Errors

1. **Double-check the domain**: Make sure you typed it exactly as it appears in your browser (no `https://`, no trailing slash)
2. **Check for typos**: `oneknot.space` not `oneknot.space.com` or `www.oneknot.space` (unless you're using www)
3. **Clear browser cache**: Hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)
4. **Wait a moment**: Sometimes it takes a few seconds for changes to propagate

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Selected ONEKNOT project
- [ ] Went to Authentication → Settings
- [ ] Added `oneknot.space` to authorized domains
- [ ] Added `www.oneknot.space` (if using www)
- [ ] Tested Google Sign-In on your domain

That's it! Once you add the domain, the error will be resolved immediately.
