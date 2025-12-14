# 🚨 URGENT: Deploy Firestore Rules to Fix Permission Errors

You're getting permission errors because Firestore security rules haven't been deployed yet.

## Quick Fix (2 minutes):

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project: **oneknot-8c49b**

### Step 2: Deploy Firestore Rules
1. Click **Firestore Database** in the left menu
2. Click the **Rules** tab (at the top)
3. **DELETE** all existing rules
4. **COPY and PASTE** the rules below:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Weddings collection
    match /weddings/{weddingId} {
      // Allow public read (for wedding websites)
      allow read: if true;
      
      // Allow create if authenticated and user is setting themselves as owner
      allow create: if request.auth != null && 
                       request.resource.data.ownerId == request.auth.uid;
      
      // Allow update if user is the owner
      allow update: if request.auth != null && 
                       resource.data.ownerId == request.auth.uid;
      
      // Allow delete if user is the owner
      allow delete: if request.auth != null && 
                       resource.data.ownerId == request.auth.uid;
    }
    
    // Events collection
    match /events/{eventId} {
      // Allow public read
      allow read: if true;
      
      // Allow create if authenticated
      allow create: if request.auth != null;
      
      // Allow update if authenticated
      allow update: if request.auth != null;
      
      // Allow delete if authenticated
      allow delete: if request.auth != null;
    }
    
    // RSVPs collection
    match /rsvps/{rsvpId} {
      // Allow read if authenticated (for dashboard)
      allow read: if request.auth != null;
      
      // Allow create for anyone (guests don't need login)
      allow create: if true;
      
      // Allow update for anyone (guests can update their RSVP)
      allow update: if true;
      
      // Allow delete if authenticated
      allow delete: if request.auth != null;
    }
    
    // Gallery collection
    match /gallery/{photoId} {
      // Allow public read
      allow read: if true;
      
      // Allow create if authenticated
      allow create: if request.auth != null;
      
      // Allow update if authenticated
      allow update: if request.auth != null;
      
      // Allow delete if authenticated
      allow delete: if request.auth != null;
    }
  }
}
```

5. Click **Publish** button (top right)
6. Wait for "Rules published successfully" message

### Step 3: Deploy Storage Rules
1. Click **Storage** in the left menu
2. Click the **Rules** tab
3. **DELETE** all existing rules
4. **COPY and PASTE** the rules below:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /weddings/{weddingId}/{allPaths=**} {
      // Allow public read
      allow read: if true;
      
      // Allow write if authenticated
      allow write: if request.auth != null;
    }
  }
}
```

5. Click **Publish** button
6. Wait for "Rules published successfully" message

### Step 4: Test
1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Try signing in again**
3. **Try creating a wedding**

The permission errors should be **GONE**! ✅

---

## Visual Guide:

```
Firebase Console
├── Firestore Database
│   └── Rules tab ← CLICK HERE
│       └── Paste rules → Click "Publish"
│
└── Storage
    └── Rules tab ← CLICK HERE
        └── Paste rules → Click "Publish"
```

---

## Still Getting Errors?

1. **Make sure you clicked "Publish"** (not just "Save")
2. **Wait 10-20 seconds** for rules to propagate
3. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check browser console** for specific error messages
5. **Verify you're signed in** - check if `currentUser` exists

---

## Alternative: Temporary Test Mode (Development Only)

If you want to test quickly without restrictions:

⚠️ **WARNING: Only for development! Never use in production!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

This allows **anyone** to read/write everything. Use only for testing!

---

**After deploying rules, your app should work perfectly!** 🎉

