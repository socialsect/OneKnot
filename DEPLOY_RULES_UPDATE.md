# 🔴 URGENT: Deploy Updated Firestore Rules

You're getting permission errors because the **invitations collection rules** need to be deployed!

## Quick Fix (2 minutes):

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project: **oneknot-8c49b**

### Step 2: Deploy Updated Firestore Rules
1. Click **Firestore Database** in the left menu
2. Click the **Rules** tab (at the top)
3. **COPY and PASTE** the complete rules below (replace everything):

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
    
    // Invitations collection
    match /invitations/{invitationId} {
      // Allow read if authenticated
      allow read: if request.auth != null;
      
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

4. Click **Publish** button (top right)
5. Wait for "Rules published successfully" message

### Step 3: Test Again
1. **Hard refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Go to Invite Guests page**
3. **Try sending an invitation**

The permission errors should be **GONE**! ✅

---

## EmailJS Error Fix

The "recipients address is empty" error means EmailJS isn't configured yet. This is **normal** if you haven't set up EmailJS.

### To Fix EmailJS:
1. Set up EmailJS (see `EMAIL_SMS_SETUP.md`)
2. Add to `.env`:
   ```env
   VITE_EMAILJS_PUBLIC_KEY=your-key
   VITE_EMAILJS_SERVICE_ID=your-service-id
   VITE_EMAILJS_TEMPLATE_ID=your-template-id
   ```
3. Restart dev server

**Note:** Invitations will still be saved to Firestore even if email fails. You can send emails later once EmailJS is configured.

---

## Summary

✅ **Firestore Rules** - Deploy the updated rules above
✅ **EmailJS** - Configure when ready (optional for now)
✅ **Invitations** - Will save to Firestore even without EmailJS

After deploying rules, the permission errors will be fixed!

