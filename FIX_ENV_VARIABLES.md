# Fix Firebase API Key Error

## Problem
You're seeing this error:
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
GET https://identitytoolkit.googleapis.com/v1/projects?key=your-api-key 400 (Bad Request)
```

This means your `.env` file is either missing, empty, or the dev server hasn't been restarted.

## Solution

### Step 1: Create/Update `.env` File

Create a file named `.env` in the project root (`c:\Users\LENOVO\OneDrive\Desktop\oneknot\.env`) with these exact values:

```env
VITE_FIREBASE_API_KEY=AIzaSyA5KgRgafHAMea93q36FwepBhTGhF-M5yY
VITE_FIREBASE_AUTH_DOMAIN=oneknot-8c49b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oneknot-8c49b
VITE_FIREBASE_STORAGE_BUCKET=oneknot-8c49b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1045938150628
VITE_FIREBASE_APP_ID=1:1045938150628:web:4368ab0ed5da250543a0f1
```

**Important:**
- Make sure there are NO spaces around the `=` sign
- Make sure there are NO quotes around the values
- The file must be named exactly `.env` (not `.env.txt` or anything else)

### Step 2: Restart Your Dev Server

**Vite requires a full restart to pick up environment variables.**

1. Stop your current dev server (press `Ctrl+C` in the terminal where it's running)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 3: Verify It's Working

After restarting, check the browser console. You should NOT see the "your-api-key" error anymore.

Try logging in - it should work now.

## If It Still Doesn't Work

1. **Check the file location**: The `.env` file must be in the project root (same folder as `package.json`)

2. **Check for typos**: Make sure all variable names start with `VITE_` and match exactly:
   - `VITE_FIREBASE_API_KEY` (not `FIREBASE_API_KEY`)
   - `VITE_FIREBASE_AUTH_DOMAIN` (not `FIREBASE_AUTH_DOMAIN`)
   - etc.

3. **Clear browser cache**: Sometimes old cached values cause issues. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

4. **Check if the API key is valid**: If you regenerated the key, make sure you're using the NEW key, not the old exposed one.

## Quick Check Command

To verify your `.env` file exists and has content, run this in PowerShell:

```powershell
Get-Content .env
```

If it shows your environment variables, the file is correct. Just restart the dev server.
