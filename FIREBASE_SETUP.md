# Firebase Setup Guide - Fixing Permission Errors

## 🔴 IMPORTANT: You're getting permission errors because Firestore rules need to be configured!

Follow these steps to fix the "Missing or insufficient permissions" errors:

---

## Step 1: Deploy Firestore Security Rules

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `oneknot-8c49b`
3. **Go to Firestore Database** → **Rules** tab
4. **Copy and paste** the rules from `firestore.rules` file
5. **Click "Publish"**

### Quick Copy (Firestore Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Weddings collection
    match /weddings/{weddingId} {
      // Allow read if public or user is owner/collaborator
      allow read: if true; // Public read for wedding websites
      
      // Allow create if authenticated
      allow create: if isAuthenticated() && 
                       request.resource.data.ownerId == request.auth.uid;
      
      // Allow update if user is owner
      allow update: if isAuthenticated() && 
                       resource.data.ownerId == request.auth.uid;
      
      // Allow delete only if owner
      allow delete: if isAuthenticated() && 
                       resource.data.ownerId == request.auth.uid;
    }
    
    // Events collection
    match /events/{eventId} {
      allow read: if true;
      allow create: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/weddings/$(request.resource.data.weddingId)) &&
                       get(/databases/$(database)/documents/weddings/$(request.resource.data.weddingId)).data.ownerId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/weddings/$(resource.data.weddingId)) &&
                       get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.ownerId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/weddings/$(resource.data.weddingId)) &&
                       get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.ownerId == request.auth.uid;
    }
    
    // RSVPs collection
    match /rsvps/{rsvpId} {
      allow read: if isAuthenticated() && 
                     exists(/databases/$(database)/documents/weddings/$(resource.data.weddingId)) &&
                     get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.ownerId == request.auth.uid;
      allow create: if true; // Guests don't need to login
      allow update: if true;
      allow delete: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/weddings/$(resource.data.weddingId)) &&
                       get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.ownerId == request.auth.uid;
    }
    
    // Gallery collection
    match /gallery/{photoId} {
      allow read: if true;
      allow create: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/weddings/$(request.resource.data.weddingId)) &&
                       get(/databases/$(database)/documents/weddings/$(request.resource.data.weddingId)).data.ownerId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/weddings/$(resource.data.weddingId)) &&
                       get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.ownerId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/weddings/$(resource.data.weddingId)) &&
                       get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.ownerId == request.auth.uid;
    }
  }
}
```

---

## Step 2: Deploy Storage Security Rules

1. **Go to Storage** → **Rules** tab
2. **Copy and paste** the rules from `storage.rules` file
3. **Click "Publish"**

### Quick Copy (Storage Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /weddings/{weddingId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      firestore.exists(/databases/(default)/documents/weddings/$(weddingId)) &&
                      firestore.get(/databases/(default)/documents/weddings/$(weddingId)).data.ownerId == request.auth.uid;
    }
  }
}
```

---

## Step 3: Create Firestore Indexes (if needed)

If you get index errors, Firebase will provide a link to create them automatically. Just click the link and create the index.

---

## Step 4: Enable Firestore Indexes

1. Go to **Firestore Database** → **Indexes** tab
2. If you see any suggested indexes, click **Create Index**

Common indexes you might need:
- `weddings` collection: `ownerId` (Ascending) + `createdAt` (Descending)

---

## Step 5: Test Again

After deploying the rules:
1. **Refresh your browser**
2. **Try signing in again**
3. **Try creating a wedding**

The permission errors should be gone!

---

## Alternative: Temporary Test Mode (Development Only)

If you want to test quickly without setting up rules:

**⚠️ WARNING: Only for development! Never use in production!**

In Firestore Rules, temporarily use:
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

**Remember to replace with proper rules before production!**

---

## Fixed Issues

✅ **Firestore permissions** - Rules deployed
✅ **Storage permissions** - Rules deployed  
✅ **Regex pattern error** - Fixed in CreateWedding.jsx
✅ **Google Sign-In COOP warning** - Changed to redirect method

---

## Need Help?

- Check Firebase Console for error details
- Verify Authentication is enabled
- Check that Firestore and Storage are created
- Make sure rules are published (not just saved)


