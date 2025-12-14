# 🚀 Quick Start Guide - OneKnot

## Option 1: Start Without Firebase (UI Testing Only)

You can start the app immediately to see the UI, but Firebase features won't work:

```bash
npm run dev
```

The app will run on `http://localhost:5173` (or the next available port).

**Note**: Authentication and data features won't work without Firebase setup.

---

## Option 2: Full Setup with Firebase (Recommended)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Enable **Google Analytics** (optional but recommended)

### Step 2: Enable Firebase Services

#### A. Authentication
1. Go to **Authentication** > **Get Started**
2. Enable **Email/Password** sign-in method
3. Enable **Google** sign-in provider
   - Add your project's support email
   - Save

#### B. Firestore Database
1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (for development)
3. Select a location (choose closest to you)
4. Click **Enable**

#### C. Storage
1. Go to **Storage** > **Get Started**
2. Start in **test mode** (for development)
3. Use default location or choose one
4. Click **Done**

### Step 3: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register app with a nickname (e.g., "OneKnot Web")
5. **Copy the config object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### Step 4: Create .env File

1. In your project root (`oneknot` folder), create a file named `.env`
2. Add your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Important**: 
- Replace all values with your actual Firebase config
- Don't commit `.env` to git (it's already in `.gitignore`)
- All variables must start with `VITE_` for Vite to read them

### Step 5: Start the App

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Testing the App

### 1. Home Page
- Visit `http://localhost:5173`
- You should see the landing page

### 2. Sign Up / Login
- Click "Get Started" or "Sign In"
- Try Google Sign In or create an account with email
- After login, you'll be redirected to create a wedding

### 3. Create a Wedding
- Fill in partner names, date, city
- Choose a theme
- Generate or enter a custom slug
- Click "Create Wedding"

### 4. View Dashboard
- See your wedding overview
- Check statistics
- Access website and invite links

### 5. View Public Website
- Click "View Website" in dashboard
- Or visit: `http://localhost:5173/w/your-slug`

### 6. Test RSVP
- Go to an event page
- Fill in your name and email
- Submit RSVP (no login required)

---

## Troubleshooting

### App won't start
```bash
# Make sure dependencies are installed
npm install

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firebase errors
- Check that `.env` file exists and has correct values
- Verify all Firebase services are enabled
- Check browser console for specific error messages

### Authentication not working
- Verify Email/Password is enabled in Firebase Console
- Check that Google Sign-In is configured
- Ensure `.env` variables are correct

### Firestore errors
- Make sure Firestore is created and in test mode
- Check Firestore rules allow read/write (for development)

### Storage errors
- Verify Storage is enabled
- Check Storage rules allow uploads (for development)

---

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Next Steps

1. ✅ Set up Firebase (if not done)
2. ✅ Create `.env` file with config
3. ✅ Run `npm run dev`
4. ✅ Test authentication
5. ✅ Create a wedding
6. ✅ Explore all features!

---

## Need Help?

- Check `README.md` for detailed documentation
- Check `CHANGELOG.md` for all changes made
- Firebase Docs: https://firebase.google.com/docs

Happy coding! 🎉

