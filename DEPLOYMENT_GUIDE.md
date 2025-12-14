# OneKnot Deployment Guide - Vercel + Custom Domain

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All code is committed to Git
- [ ] `.env` file is in `.gitignore` (already done ✓)
- [ ] Firebase project is set up and configured
- [ ] EmailJS is configured (optional but recommended)
- [ ] Firestore rules are deployed to Firebase
- [ ] Storage rules are deployed to Firebase

---

## 🚀 Step 1: Push to GitHub

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - OneKnot ready for deployment"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `oneknot` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license (you already have these)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/oneknot.git
git branch -M main
git push -u origin main
```

---

## 📦 Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/Login (use GitHub account for easy connection)
3. Click **"Add New Project"**
4. Import your `oneknot` repository from GitHub
5. Vercel will auto-detect it's a Vite project

### 2.2 Configure Build Settings
Vercel should auto-detect these, but verify:
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (default)
- **Output Directory:** `dist` (default)
- **Install Command:** `npm install` (default)

### 2.3 Add Environment Variables
**CRITICAL:** Add all these in Vercel project settings:

#### Firebase Variables:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

#### EmailJS Variables (Optional but recommended):
```
VITE_EMAILJS_PUBLIC_KEY=your-public-key
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
```

**How to add in Vercel:**
1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable one by one
3. Make sure to select **Production**, **Preview**, and **Development** environments
4. Click **Save**

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (usually 1-2 minutes)
3. You'll get a URL like `oneknot.vercel.app`

---

## 🌐 Step 3: Connect Custom Domain (oneknot.space)

### 3.1 Add Domain in Vercel
1. Go to your project → **Settings** → **Domains**
2. Enter `oneknot.space`
3. Click **Add**
4. Also add `www.oneknot.space` if you want www support

### 3.2 Configure DNS at Your Domain Registrar

Vercel will show you DNS records to add. Typically:

**For oneknot.space (root domain):**
- **Type:** A
- **Name:** @ (or leave blank)
- **Value:** `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)

**OR use CNAME (recommended):**
- **Type:** CNAME
- **Name:** @ (or leave blank)
- **Value:** `cname.vercel-dns.com`

**For www.oneknot.space:**
- **Type:** CNAME
- **Name:** www
- **Value:** `cname.vercel-dns.com`

**Important:** DNS propagation can take 24-48 hours, but usually works within a few hours.

### 3.3 Verify Domain
1. Vercel will automatically verify your domain
2. Once verified, SSL certificate is automatically provisioned (HTTPS)
3. Your site will be live at `https://oneknot.space`

---

## 🔥 Step 4: Update Firebase Authorized Domains

**CRITICAL:** You must add your custom domain to Firebase!

### 4.1 Add Domain to Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add:
   - `oneknot.space`
   - `www.oneknot.space`
   - `oneknot.vercel.app` (Vercel preview URL)
6. Click **Save**

### 4.2 Update Firebase Auth Domain (if needed)
If your `VITE_FIREBASE_AUTH_DOMAIN` is set to a specific domain, make sure it matches your Firebase project's default domain (usually `your-project.firebaseapp.com`). This should already be correct.

---

## ✅ Step 5: Verify Everything Works

### 5.1 Test Your Live Site
1. Visit `https://oneknot.space`
2. Test:
   - [ ] Homepage loads
   - [ ] Login works
   - [ ] Create wedding works
   - [ ] Dashboard loads
   - [ ] Public wedding website works
   - [ ] RSVP works
   - [ ] Gallery upload works

### 5.2 Test Email Invitations
1. Send a test invitation
2. Check if email is received
3. Click RSVP link in email
4. Verify it works

### 5.3 Check Console for Errors
1. Open browser DevTools (F12)
2. Check Console tab for any errors
3. Check Network tab for failed requests

---

## 🔄 Step 6: Continuous Deployment

**Good news:** Vercel automatically deploys on every push to GitHub!

### Workflow:
1. Make changes locally
2. Commit: `git add . && git commit -m "Your message"`
3. Push: `git push origin main`
4. Vercel automatically builds and deploys
5. Your site updates in 1-2 minutes

### Preview Deployments:
- Every pull request gets a preview URL
- Test changes before merging to main
- Production only updates when you merge to `main`

---

## 🛠️ Troubleshooting

### Domain Not Working?
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Verify domain in Vercel dashboard
- Check Firebase authorized domains

### Build Fails?
- Check environment variables are set correctly
- Verify all dependencies in `package.json`
- Check Vercel build logs for errors

### Firebase Errors?
- Verify all Firebase env variables are set
- Check Firebase authorized domains include your domain
- Verify Firestore rules are deployed
- Check Storage rules are deployed

### EmailJS Not Working?
- Verify EmailJS env variables are set
- Check EmailJS template is configured
- Test with a real email address

---

## 📝 Important Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Always set env variables in Vercel** - Don't rely on local `.env`
3. **Firebase rules must be deployed** - Use Firebase CLI or Console
4. **Storage rules must be deployed** - Use Firebase CLI or Console
5. **HTTPS is automatic** - Vercel provides free SSL certificates
6. **Custom domain is free** - No extra cost for custom domains on Vercel

---

## 🎉 You're Done!

Your OneKnot app should now be live at:
- **Production:** `https://oneknot.space`
- **Vercel URL:** `https://oneknot.vercel.app` (also works)

Both URLs will work, but your custom domain is the primary one.

---

## 🔐 Security Reminder

Before going live, make sure:
- [ ] Firestore security rules are properly configured
- [ ] Storage security rules are properly configured
- [ ] No sensitive data in client-side code
- [ ] Environment variables are set in Vercel (not in code)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Custom Domain Setup](https://vercel.com/docs/concepts/projects/domains)
