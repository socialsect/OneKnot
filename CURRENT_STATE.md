# OneKnot — Current Application State Documentation

**Last Updated:** Based on codebase analysis  
**Purpose:** Single source of truth for current application state  
**Audience:** Developers joining the project

---

## 1. High-Level Product Overview

### What OneKnot Is Intended to Be
OneKnot is a modern wedding platform designed for Gen Z couples. It provides a **single link** (`oneknot.app/w/:slug`) that contains:
- Digital wedding invitations
- Public wedding website
- Event management and timeline
- RSVP system (no login required for guests)
- Shared photo/video gallery
- AI-powered "Find My Photos" feature (placeholder UI only)

### Problem It Solves
Traditional wedding planning involves multiple tools and platforms:
- Separate invitation services
- Wedding website builders
- RSVP tracking spreadsheets
- Photo sharing via WhatsApp/Google Drive
- Manual guest list management

OneKnot consolidates all of this into **one shareable link**, making it easier for couples to manage their wedding and for guests to access everything they need.

### Target Audience
- **Primary:** Gen Z couples planning their wedding
- **Secondary:** Wedding guests (who need no account to RSVP or view content)

### Current Maturity Level
**Status: PROTOTYPE / v0 / PARTIAL PRODUCT**

The application has:
- ✅ Core wedding creation flow
- ✅ Basic dashboard
- ✅ Public wedding website
- ✅ Event management (CRUD)
- ✅ RSVP system (functional but basic)
- ✅ Gallery upload/view
- ✅ Digital invite preview
- ⚠️ Email/SMS invitations (partially implemented - EmailJS integration exists but requires configuration)
- ❌ AI face recognition (UI only, no backend)
- ⚠️ Collaboration features (data structure exists, but no invitation flow or permission enforcement)

**NOT PRODUCTION READY** - Missing critical security, validation, and polish.

---

## 2. Tech Stack Overview

### Frontend

**Framework:**
- React 18.3.1 (JavaScript only, no TypeScript)
- React Router DOM 6.28.0 for client-side routing

**Build Tool:**
- Vite 7.2.4 (fast development server and build)

**Styling System:**
- Tailwind CSS 3.4.13 (utility-first CSS)
- Custom component classes defined in `src/index.css`:
  - `.btn-primary` - Pink primary buttons
  - `.btn-secondary` - White buttons with pink border
  - `.input-field` - Form input styling
- Custom color palette (pink/purple theme) in `tailwind.config.js`
- Framer Motion 11.3.24 for animations

**Routing:**
- React Router DOM with BrowserRouter
- Route definitions in `src/App.jsx`

**Animation Libraries:**
- Framer Motion for page transitions and component animations

**Icons:**
- Lucide React 0.561.0 (primary icon library)
- React Icons 5.5.0 (secondary icon library)

### Backend / Services

**Firebase Services Currently Used:**
1. **Firebase Authentication**
   - Email/Password authentication
   - Google Sign-In (via redirect, not popup)
   - Auth state management via `AuthContext`

2. **Cloud Firestore**
   - Primary database
   - Collections: `weddings`, `events`, `rsvps`, `gallery`, `invitations`
   - Real-time queries (though not using real-time listeners - using `getDocs`)

3. **Firebase Storage**
   - Photo/video uploads
   - Storage path: `weddings/{weddingId}/{timestamp}_{filename}`

**Firebase Services Planned but NOT Implemented:**
- Firebase Cloud Messaging (FCM) - Not used
- Firebase Functions - Not used (no backend functions)
- Firebase Analytics - Not configured
- Firebase Hosting - Not configured (using Vite dev server)

**Third-Party Services:**
- **EmailJS** (`@emailjs/browser` 4.4.1) - For sending email invitations
  - ⚠️ Requires environment variables: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
  - ⚠️ Email sending will fail silently if not configured
- **SMS Service** - NOT IMPLEMENTED (placeholder code exists in `InviteGuests.jsx`)

---

## 3. Project Structure Breakdown

### Root Directory
```
oneknot/
├── .env.example          # Template for environment variables
├── .gitignore            # Git ignore rules
├── CHANGELOG.md          # Development history
├── DEPLOY_RULES.md       # Deployment documentation
├── EMAIL_SMS_SETUP.md    # Email/SMS setup guide
├── EMAIL_TEMPLATE_SETUP.md # EmailJS template configuration
├── FIREBASE_SETUP.md     # Firebase setup instructions
├── firestore.rules       # Firestore security rules
├── storage.rules         # Firebase Storage security rules
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js        # Vite build configuration
├── public/               # Static assets
│   └── vite.svg
└── src/                  # Source code
```

### `/src` Directory Structure

**`/src/pages`** - Page Components (Route Handlers)
- `Home.jsx` - Landing page (public)
- `Login.jsx` - Authentication page (email/password + Google)
- `CreateWedding.jsx` - Wedding creation form (protected)
- `Dashboard.jsx` - Main dashboard showing wedding stats (protected)
- `WeddingWebsite.jsx` - Public wedding website (`/w/:slug`)
- `InvitePreview.jsx` - Digital invite preview page (`/invite/:slug`)
- `EventDetails.jsx` - Individual event page with RSVP (`/event/:eventId`)
- `EventsManagement.jsx` - Event CRUD interface (protected)
- `ContactsManagement.jsx` - Collaborators and guests list (protected)
- `InviteGuests.jsx` - Send email/SMS invitations (protected)
- `Gallery.jsx` - Photo/video gallery (`/gallery/:weddingId`)
- `FindMyPhotos.jsx` - AI face recognition placeholder (`/find-my-photos/:weddingId`)

**`/src/components`** - Reusable Components
- `ProtectedRoute.jsx` - Route guard that redirects to `/login` if not authenticated

**`/src/contexts`** - React Context Providers
- `AuthContext.jsx` - Authentication state and methods
  - Exports: `useAuth()` hook
  - Provides: `currentUser`, `signInWithGoogle()`, `signUp()`, `login()`, `logout()`
- `WeddingContext.jsx` - Wedding data management
  - Exports: `useWedding()` hook
  - Provides: `weddings[]`, `currentWedding`, `createWedding()`, `getWeddingBySlug()`, `getWeddingById()`, `getUserWeddings()`, `updateWedding()`

**`/src/config`** - Configuration
- `firebase.js` - Firebase initialization
  - Exports: `auth`, `db` (Firestore), `storage`
  - Reads config from environment variables

**Entry Points:**
- `src/main.jsx` - React app entry point, renders `<App />` with React.StrictMode
- `src/App.jsx` - Main app component with all route definitions
- `src/index.css` - Global styles and Tailwind imports
- `src/style.css` - (Not used, empty or minimal)

### Key Files and Their Purpose

**`src/App.jsx`**
- Defines all application routes
- Wraps app in `AuthProvider` and `WeddingProvider`
- Route structure documented in Section 4

**`src/contexts/AuthContext.jsx`**
- Manages Firebase Auth state
- Handles Google Sign-In via redirect (to avoid COOP issues)
- Checks for redirect result on mount
- Provides loading state while auth initializes

**`src/contexts/WeddingContext.jsx`**
- Manages wedding data operations
- Automatically loads user's weddings on mount
- Provides CRUD operations for weddings
- ⚠️ Does NOT enforce ownership checks in context (relies on Firestore rules)

**`firestore.rules`**
- Security rules for Firestore collections
- ⚠️ **CRITICAL SECURITY ISSUES** (see Section 9)

**`storage.rules`**
- Security rules for Firebase Storage
- ⚠️ **CRITICAL SECURITY ISSUES** (see Section 9)

---

## 4. Routing & Navigation

### Route Definitions (from `src/App.jsx`)

#### Public Routes (No Authentication Required)

**`/` - Home Page**
- **Component:** `Home.jsx`
- **Access:** Public (guests and authenticated users)
- **Purpose:** Landing page with feature highlights
- **Features:**
  - Shows "Get Started" button if not logged in
  - Shows "Dashboard" link if logged in
  - Marketing content about OneKnot features

**`/login` - Authentication Page**
- **Component:** `Login.jsx`
- **Access:** Public
- **Purpose:** User sign-in and sign-up
- **Features:**
  - Email/password sign-up
  - Email/password sign-in
  - Google Sign-In (redirect method)
  - Toggle between sign-up and sign-in modes
  - Redirects to `/create` after successful authentication

**`/w/:slug` - Public Wedding Website**
- **Component:** `WeddingWebsite.jsx`
- **Access:** Public (anyone with the link)
- **Purpose:** Public-facing wedding website
- **Features:**
  - Hero section with couple names and date
  - Story section (if provided)
  - Events timeline (sorted by date)
  - RSVP section (links to first event or main event)
  - Gallery preview (links to full gallery)
  - Theme-based styling (6 themes available)
- **Data Source:** Loads wedding by slug from Firestore

**`/invite/:slug` - Digital Invite Preview**
- **Component:** `InvitePreview.jsx`
- **Access:** Public
- **Purpose:** Beautiful invite card that can be shared
- **Features:**
  - Displays couple names, date, city
  - Share buttons (WhatsApp, copy link)
  - Link to wedding website
- **Data Source:** Loads wedding by slug

**`/event/:eventId` - Event Details & RSVP**
- **Component:** `EventDetails.jsx`
- **Access:** Public (guests can RSVP without login)
- **Purpose:** Individual event page with RSVP form
- **Features:**
  - Event details (date, time, location, dress code)
  - Google Maps link (if address provided)
  - RSVP form (name, email, plus-one checkbox)
  - RSVP status buttons (Yes/Maybe/No)
  - Checks for existing RSVP using `localStorage` guest ID
- **Data Source:** Loads event by ID, checks RSVPs by `eventId` and `guestId`

**`/gallery/:weddingId` - Photo Gallery**
- **Component:** `Gallery.jsx`
- **Access:** Public (anyone with the link)
- **Purpose:** Shared photo/video gallery
- **Features:**
  - Grid display of photos/videos
  - Upload functionality (requires authentication - but not enforced in UI)
  - Like/reaction system (increments counter)
  - Hover effects
- **Data Source:** Loads gallery items by `weddingId`

**`/find-my-photos/:weddingId` - AI Photo Finder**
- **Component:** `FindMyPhotos.jsx`
- **Access:** Public
- **Purpose:** AI-powered face recognition to find photos of a guest
- **Features:**
  - Upload selfie interface
  - Loading state (2-second mock delay)
  - Displays "matched" photos (currently returns first 10 photos as mock)
- **Status:** ⚠️ **UI ONLY - NO AI IMPLEMENTATION**
- **Data Source:** Loads all gallery photos (mock filtering)

#### Protected Routes (Authentication Required)

**`/create` - Create Wedding**
- **Component:** `CreateWedding.jsx`
- **Access:** Protected (redirects to `/login` if not authenticated)
- **Purpose:** Form to create a new wedding
- **Features:**
  - Partner 1 & 2 names (required)
  - Wedding date (required)
  - City (required)
  - Theme selection (6 options: classic, modern, rustic, beach, garden, minimal)
  - Custom slug input (lowercase, alphanumeric, hyphens only)
  - Auto-generate slug button
  - ⚠️ **NO SLUG UNIQUENESS VALIDATION** - Can create duplicate slugs
- **On Submit:** Creates wedding document, redirects to `/dashboard/:weddingId`

**`/dashboard/:weddingId?` - Dashboard**
- **Component:** `Dashboard.jsx`
- **Access:** Protected
- **Purpose:** Main dashboard showing wedding overview and stats
- **Features:**
  - Wedding selector dropdown (if user has multiple weddings)
  - Wedding header with couple names, date, city
  - Links to public website and invite
  - Stats cards:
    - Guest count (unique emails from RSVPs)
    - RSVP count (total RSVP documents)
    - Event count
    - Gallery count
  - Quick action cards:
    - Invite Guests
    - Manage Events
    - Contacts & People
    - Gallery
- **Data Source:** Loads user's weddings, then selected wedding data and stats

**`/dashboard/:weddingId/events` - Events Management**
- **Component:** `EventsManagement.jsx`
- **Access:** Protected
- **Purpose:** Create, edit, delete wedding events
- **Features:**
  - List of all events (sorted by date)
  - Add event form (inline)
  - Edit event (pre-fills form)
  - Delete event (with confirmation)
  - Event fields:
    - Name (required)
    - Description (optional)
    - Date (required)
    - Time (optional)
    - Location name (optional)
    - Full address (optional, for Google Maps)
    - Dress code (dropdown: Formal, Semi-Formal, Casual, Black Tie, Cocktail, Beach Casual)
  - View button (opens event details page in new tab)
- **Data Source:** Loads events by `weddingId`

**`/dashboard/:weddingId/contacts` - Contacts Management**
- **Component:** `ContactsManagement.jsx`
- **Access:** Protected
- **Purpose:** Manage collaborators and view guest list
- **Features:**
  - **Collaborators Section:**
    - List of collaborators (from `wedding.collaborators` array)
    - Add collaborator form (email, name, role: viewer/admin)
    - Edit role (viewer/admin)
    - Delete collaborator
    - Owner badge (cannot be removed)
  - **Guests Section:**
    - List of unique guests from RSVPs
    - Shows guest name, email, RSVP count
    - Read-only (no edit/delete)
- **Data Source:** Loads wedding data and RSVPs

**`/dashboard/:weddingId/invite` - Invite Guests**
- **Component:** `InviteGuests.jsx`
- **Access:** Protected
- **Purpose:** Send email and SMS invitations
- **Features:**
  - Single invite form (name, email, phone)
  - Checkboxes to send email/SMS
  - Bulk invite (textarea with one email/phone per line)
  - Sent invitations list (shows email/SMS status)
  - ⚠️ **Email sending requires EmailJS configuration**
  - ⚠️ **SMS sending is NOT IMPLEMENTED** (placeholder code only)
- **Data Source:** Loads invitations collection, saves to `invitations` collection

---

## 5. Authentication System

### Auth Providers Implemented

**1. Email/Password Authentication**
- **Sign Up:** `createUserWithEmailAndPassword()` in `AuthContext.jsx`
- **Sign In:** `signInWithEmailAndPassword()` in `AuthContext.jsx`
- **Password Requirements:** Minimum 6 characters (enforced in `Login.jsx` input)
- **Error Handling:** Catches errors and displays in UI

**2. Google Sign-In**
- **Method:** `signInWithRedirect()` (NOT popup - to avoid COOP issues)
- **Provider:** `GoogleAuthProvider` from Firebase Auth
- **Flow:**
  1. User clicks "Sign in with Google"
  2. Redirects to Google OAuth
  3. After authentication, redirects back to app
  4. `getRedirectResult()` checks for redirect result on app mount
  5. Sets user state if redirect result exists
- **Note:** Redirect method means user leaves the app temporarily

### Auth Flow

**Initial Load:**
1. `AuthProvider` mounts
2. `onAuthStateChanged()` listener starts
3. `loading` state is `true` until auth state is determined
4. Children render only when `loading` is `false`

**Sign In Flow:**
1. User enters email/password or clicks Google
2. Firebase Auth processes request
3. On success, `onAuthStateChanged` fires
4. `currentUser` state updates
5. User redirected to `/create` (from `Login.jsx`)

**Sign Out Flow:**
1. User clicks logout
2. `signOut(auth)` called
3. `onAuthStateChanged` fires with `null`
4. `currentUser` becomes `null`
5. Protected routes redirect to `/login`

### How Protected Routes Work

**Implementation:** `src/components/ProtectedRoute.jsx`

```jsx
export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return children
}
```

**Usage:** Wraps protected route components in `App.jsx`:
```jsx
<Route path="/create" element={<ProtectedRoute><CreateWedding /></ProtectedRoute>} />
```

**Limitations:**
- ⚠️ **NO ROLE-BASED ACCESS CONTROL** - Any authenticated user can access any protected route
- ⚠️ **NO WEDDING OWNERSHIP VERIFICATION** - Dashboard doesn't check if user owns the wedding
- ⚠️ **NO COLLABORATOR PERMISSION CHECKING** - Collaborators can't access protected routes even if added

### What Guests Can Do Without Auth

**Fully Functional (No Login Required):**
- ✅ View public wedding website (`/w/:slug`)
- ✅ View digital invite (`/invite/:slug`)
- ✅ View event details (`/event/:eventId`)
- ✅ Submit RSVP (name, email, plus-one)
- ✅ View gallery (`/gallery/:weddingId`)
- ✅ Upload photos to gallery (⚠️ **SECURITY ISSUE** - see Section 9)
- ✅ Use "Find My Photos" feature (UI only)

**Cannot Do:**
- ❌ Create weddings
- ❌ Edit wedding details
- ❌ Manage events
- ❌ Send invitations
- ❌ View dashboard
- ❌ Manage collaborators

### Limitations of Current Auth Setup

1. **No Email Verification**
   - Users can sign up with any email (even fake)
   - No email verification flow

2. **No Password Reset**
   - No "Forgot Password" functionality
   - Users must remember password or create new account

3. **No Account Management**
   - No profile page
   - No ability to change email/password
   - No account deletion

4. **No Session Management**
   - No "Remember Me" option
   - Sessions persist until explicit logout or browser clear

5. **No Multi-Device Sync**
   - Auth state is per-browser
   - No cross-device session management

6. **Google Redirect UX**
   - User leaves app during Google sign-in
   - Can be confusing for users

---

## 6. Wedding Data Model (CURRENT)

### What a "Wedding" Represents

A Wedding is the central entity in OneKnot. It represents:
- A couple's wedding event
- All associated data (events, RSVPs, gallery, invitations)
- A unique public URL via slug

### How Wedding Data is Stored

**Collection:** `weddings` in Firestore

**Document Structure:**
```javascript
{
  id: "firestore-document-id",  // Auto-generated
  partner1Name: "Alex",          // String, required
  partner2Name: "Sam",           // String, required
  weddingDate: Timestamp,        // Firestore Timestamp
  city: "New York",              // String, required
  theme: "modern",               // String: classic|modern|rustic|beach|garden|minimal
  slug: "alex-sam-2024",         // String, lowercase, alphanumeric + hyphens
  ownerId: "firebase-user-uid",  // String, Firebase Auth UID
  createdAt: Timestamp,          // Firestore serverTimestamp()
  updatedAt: Timestamp,           // Firestore serverTimestamp() (on updates)
  collaborators: [               // Array of collaborator objects
    {
      userId: "firebase-user-uid",  // String or null (if not yet accepted)
      email: "collab@example.com",  // String
      name: "John Doe",              // String
      role: "owner" | "admin" | "viewer",  // String
      invitedAt: Date                // JavaScript Date
    }
  ],
  story: "Optional story text"   // String, optional (not in create form but can be added)
}
```

### Fields Used

**Required Fields (from CreateWedding form):**
- `partner1Name` - First partner's name
- `partner2Name` - Second partner's name
- `weddingDate` - Wedding date (stored as Firestore Timestamp)
- `city` - Wedding city
- `theme` - Selected theme ID

**Auto-Generated Fields:**
- `id` - Firestore document ID
- `ownerId` - Current user's UID (from `AuthContext`)
- `createdAt` - Server timestamp
- `slug` - Either user-provided or auto-generated

**Optional Fields:**
- `story` - Couple's story (can be added via `updateWedding()` but no UI exists)
- `updatedAt` - Set on updates

**Collaborator Array:**
- Created automatically with owner as first collaborator
- Can be extended via `ContactsManagement.jsx`
- Structure defined but not fully utilized (see Section 7.9)

### How Slugs Are Handled

**Slug Generation:**
1. **Manual Input:** User can type custom slug in `CreateWedding.jsx`
   - Input sanitized: `toLowerCase().replace(/[^a-z0-9-]/g, '')`
   - Only allows lowercase letters, numbers, hyphens

2. **Auto-Generate Button:**
   - Format: `${partner1Name}-${partner2Name}-${last6DigitsOfTimestamp}`
   - Example: `alex-sam-123456`
   - Names are lowercased and spaces removed

3. **Fallback:** If no slug provided, uses same format as auto-generate in `handleSubmit`

**Slug Usage:**
- Used in public URLs: `/w/:slug` and `/invite/:slug`
- Queried in Firestore: `where('slug', '==', slug)`

**⚠️ CRITICAL ISSUES:**
1. **NO UNIQUENESS VALIDATION**
   - Multiple weddings can have the same slug
   - `getWeddingBySlug()` returns first match (could be wrong wedding)
   - No check before creating wedding

2. **NO SLUG RESERVATION**
   - No reserved words (e.g., "admin", "api", "dashboard")
   - Could conflict with future routes

3. **NO SLUG EDITING**
   - Once created, slug cannot be changed
   - No UI to update slug

### What Validation Exists

**Client-Side Validation (in `CreateWedding.jsx`):**
- ✅ Partner 1 name: Required (HTML5 `required`)
- ✅ Partner 2 name: Required (HTML5 `required`)
- ✅ Wedding date: Required (HTML5 `required`)
- ✅ City: Required (HTML5 `required`)
- ✅ Slug format: Enforced via input sanitization (lowercase, alphanumeric, hyphens)

**Server-Side Validation (Firestore Rules):**
- ✅ `ownerId` must match authenticated user on create
- ❌ No validation for required fields
- ❌ No validation for slug format
- ❌ No validation for slug uniqueness

**No Validation For:**
- ❌ Date format (relies on HTML5 date input)
- ❌ Name length/format
- ❌ City format
- ❌ Theme value (could be any string)
- ❌ Collaborator structure

### What Is Missing or Unsafe

**Missing Validations:**
1. **Slug Uniqueness** - Can create duplicate slugs
2. **Field Length Limits** - Names, city, slug can be extremely long
3. **Date Validation** - No check if date is in past/future
4. **Email Format in Collaborators** - No validation
5. **Role Validation** - Can set invalid role values

**Unsafe Practices:**
1. **Client-Side Slug Generation** - Should be server-validated
2. **No Input Sanitization** - XSS risk in text fields (though React escapes by default)
3. **No Rate Limiting** - Can spam create weddings
4. **No Data Migration** - Schema changes would break existing data

**Data Integrity Issues:**
1. **Orphaned Data** - If wedding deleted, events/RSVPs/gallery remain
2. **No Cascading Deletes** - Related data not cleaned up
3. **No Data Backup** - No export/import functionality

---

## 7. Feature-by-Feature Breakdown

### 7.1 Wedding Creation

**Location:** `src/pages/CreateWedding.jsx`

**What Inputs Exist:**
- Partner 1 Name (text input, required)
- Partner 2 Name (text input, required)
- Wedding Date (date input, required)
- City (text input, required)
- Theme (6 visual theme buttons: classic, modern, rustic, beach, garden, minimal)
- Slug (text input, optional, with "Generate" button)

**What Validation Exists:**
- HTML5 `required` attributes on name, date, city
- Slug format sanitization (lowercase, alphanumeric, hyphens only)
- No uniqueness check for slug
- No length limits
- No date range validation

**What Happens on Submit:**
1. Form prevents default submission
2. Sets loading state
3. Calls `createWedding()` from `WeddingContext`
4. `createWedding()` adds document to `weddings` collection with:
   - Form data
   - `ownerId: currentUser.uid`
   - `createdAt: serverTimestamp()`
   - `collaborators: [{ userId: currentUser.uid, role: 'owner', email: currentUser.email }]`
5. Returns wedding document ID
6. Navigates to `/dashboard/:weddingId`
7. Shows alert on error

**What Data is Stored:**
- All form fields (partner1Name, partner2Name, weddingDate, city, theme, slug)
- `ownerId` (current user's UID)
- `createdAt` (server timestamp)
- Initial collaborator (owner)

**Missing Features:**
- ❌ Slug uniqueness check
- ❌ Wedding story/description field
- ❌ Cover image upload
- ❌ Preview before creating
- ❌ Edit wedding details (no UI exists, though `updateWedding()` function exists)

### 7.2 Dashboard

**Location:** `src/pages/Dashboard.jsx`

**What Information is Shown:**
- Wedding selector dropdown (if user has multiple weddings)
- Wedding header: couple names, date, city
- Links to public website and invite
- Four stat cards:
  - Guest count (unique emails from RSVPs)
  - RSVP count (total RSVP documents)
  - Event count (events with matching `weddingId`)
  - Gallery count (gallery items with matching `weddingId`)
- Quick action cards: Invite Guests, Manage Events, Contacts & People, Gallery

**What Stats are Real vs Mocked:**
- ✅ **Guest Count:** Real - Queries RSVPs, extracts unique emails
- ✅ **RSVP Count:** Real - Counts RSVP documents
- ✅ **Event Count:** Real - Counts event documents
- ✅ **Gallery Count:** Real - Counts gallery documents

**What Actions are Possible:**
- Select different wedding (if multiple)
- Navigate to public website
- Navigate to invite preview
- Navigate to Invite Guests page
- Navigate to Events Management
- Navigate to Contacts Management
- Navigate to Gallery
- Create new wedding
- Logout

**Limitations:**
- ⚠️ **NO OWNERSHIP VERIFICATION** - Can access any wedding ID in URL (if you know it)
- ⚠️ **NO PERMISSION CHECKING** - Doesn't check if user is collaborator
- ⚠️ **Stats are Real-Time but Not Live** - Requires page refresh to update
- ⚠️ **No Wedding Settings/Edit** - No way to edit wedding details from dashboard
- ⚠️ **No Delete Wedding** - No way to delete a wedding
- ⚠️ **No Export Data** - Cannot export guest list, RSVPs, etc.

### 7.3 Public Wedding Website

**Location:** `src/pages/WeddingWebsite.jsx`

**Sections Implemented:**
1. **Hero Section**
   - Couple names (large heading)
   - Wedding date (formatted)
   - City
   - Theme-based gradient background

2. **Story Section**
   - "Our Story" heading
   - Story text (from `wedding.story` field, or default message if missing)
   - Centered layout

3. **Events Timeline**
   - "Events" heading
   - List of events (sorted by date ascending)
   - Each event shows:
     - Event name
     - Description
     - Date, time, location (if provided)
     - Dress code (if provided)
     - "View Details" button (links to `/event/:eventId`)

4. **RSVP Section**
   - "RSVP" heading
   - Call-to-action text
   - "RSVP Now" button (links to first event or `/event/main` if no events)

5. **Gallery Preview**
   - "Gallery" heading with camera icon
   - "View All Photos" button (links to `/gallery/:weddingId`)

6. **Footer**
   - "Made with ❤️ using OneKnot" message

**Data Sources:**
- Wedding data: Loaded via `getWeddingBySlug(slug)` from `WeddingContext`
- Events: Queried from Firestore `events` collection filtered by `weddingId`, ordered by `date`

**What Guests Can See:**
- ✅ All wedding information (names, date, city, story)
- ✅ All events (date, time, location, dress code, description)
- ✅ RSVP links
- ✅ Gallery preview link
- ✅ Theme-based styling

**Missing Sections or Polish Needed:**
- ❌ **No Cover Image** - Hero section is gradient only
- ❌ **No Photo Gallery Preview** - Just a link, no thumbnails
- ❌ **No Map Integration** - Location is text only (no embedded map)
- ❌ **No Countdown Timer** - Could show days until wedding
- ❌ **No Accommodations Section** - No hotel/travel info
- ❌ **No Registry/Gifts Section** - No gift registry links
- ❌ **No FAQ Section** - No common questions
- ❌ **No Contact Information** - No way to contact couple
- ❌ **No Social Media Links** - No Instagram/Twitter links
- ❌ **No Mobile Menu** - Navigation not optimized for mobile
- ❌ **No Print Styles** - Can't print invite nicely

### 7.4 Digital Invites

**Location:** `src/pages/InvitePreview.jsx`

**How Invites Work:**
- Public page accessible via `/invite/:slug`
- Loads wedding data by slug
- Displays beautiful invite card design
- Shows couple names, formatted date, city
- Includes share functionality

**How Links are Generated:**
- Invite URL: `${window.location.origin}/invite/${slug}`
- Website URL: `${window.location.origin}/w/${slug}`
- Generated client-side in component

**Sharing Capabilities:**
- ✅ **WhatsApp Share:** Opens WhatsApp with pre-filled message
  - Message: `"You're invited to {couple names}'s wedding! {inviteUrl}"`
- ✅ **Copy Link:** Copies invite URL to clipboard
  - Shows "Copied!" confirmation for 2 seconds
- ❌ **No Email Share** - No mailto: link
- ❌ **No Social Media Share** - No Facebook, Twitter, Instagram share buttons
- ❌ **No QR Code** - No QR code generation for easy sharing

**What is Static vs Dynamic:**
- **Dynamic:**
  - Couple names (from wedding data)
  - Date (formatted from wedding data)
  - City (from wedding data)
  - URLs (generated from current origin)
- **Static:**
  - Invite design/layout
  - Share button styles
  - Default message text

**Missing Features:**
- ❌ **No Custom Invite Design** - Same design for all weddings
- ❌ **No RSVP Link in Invite** - Must go to website to RSVP
- ❌ **No Event-Specific Invites** - All events share same invite
- ❌ **No Printable Version** - Can't print as physical invite
- ❌ **No Invite Customization** - Can't add custom message or image

### 7.5 Events

**Location:** `src/pages/EventsManagement.jsx` (management) and `src/pages/EventDetails.jsx` (public view)

**How Events are Stored:**
- **Collection:** `events` in Firestore
- **Document Structure:**
  ```javascript
  {
    id: "firestore-document-id",
    weddingId: "wedding-document-id",  // String, required
    name: "Ceremony",                   // String, required
    description: "Wedding ceremony...", // String, optional
    date: Timestamp,                    // Firestore Timestamp, required
    time: "4:00 PM",                    // String, optional
    location: "Venue Name",             // String, optional
    locationAddress: "123 Main St...",  // String, optional (for Google Maps)
    dressCode: "Formal",                // String, optional
    createdAt: Timestamp,               // Firestore serverTimestamp()
    updatedAt: Timestamp                // Firestore serverTimestamp()
  }
  ```

**How Events are Displayed:**
- **Management Page:** List view with edit/delete buttons
- **Public Website:** Timeline view in chronological order
- **Event Details Page:** Full event information with RSVP form

**RSVP Connection:**
- Events have `id` field
- RSVPs reference event via `eventId` field
- Event details page includes RSVP form
- ⚠️ **NO VALIDATION** - RSVP can reference non-existent event

**What CRUD Operations Exist:**
- ✅ **Create:** Add event form in `EventsManagement.jsx`
  - Validates: name (required), date (required)
  - Converts date string to Firestore Timestamp
- ✅ **Read:** 
  - List all events for wedding (management page)
  - Get single event by ID (event details page)
  - Query events by `weddingId` (public website)
- ✅ **Update:** Edit event form (pre-fills with existing data)
  - Updates `updatedAt` timestamp
- ✅ **Delete:** Delete button with confirmation dialog
  - ⚠️ **NO CASCADE** - Deleting event doesn't delete associated RSVPs

**What is Missing:**
- ❌ **No Event Images** - Can't add cover image to event
- ❌ **No Event Capacity** - No max guests limit
- ❌ **No Event Categories** - All events treated the same
- ❌ **No Recurring Events** - Can't create daily/weekly events
- ❌ **No Event Templates** - Must fill all fields manually
- ❌ **No Event Ordering** - Sorted by date only (can't manually order)
- ❌ **No Event Visibility Toggle** - All events are public
- ❌ **No Event RSVP Deadline** - No cutoff date for RSVPs
- ❌ **No Event Reminders** - No email/SMS reminders before event
- ❌ **No Event Analytics** - No stats on event views/RSVPs

### 7.6 RSVP System

**Location:** `src/pages/EventDetails.jsx` (RSVP form)

**Guest Flow:**
1. Guest visits `/event/:eventId`
2. Sees event details
3. Fills RSVP form (name, email, plus-one checkbox)
4. Clicks Yes/Maybe/No button
5. RSVP saved to Firestore
6. Success message shown
7. Guest can return and see their RSVP status

**Fields Collected:**
- `guestName` - Text input, required
- `guestEmail` - Email input, required
- `plusOne` - Checkbox, optional
- `status` - One of: "yes", "maybe", "no" (from button click)

**How Responses are Stored:**
- **Collection:** `rsvps` in Firestore
- **Document Structure:**
  ```javascript
  {
    id: "firestore-document-id",
    eventId: "event-document-id",      // String, required
    weddingId: "wedding-document-id",  // String, required
    guestName: "John Doe",              // String, required
    guestEmail: "john@example.com",     // String, required
    plusOne: true,                      // Boolean, optional
    status: "yes",                      // String: "yes"|"maybe"|"no"
    guestId: "guest_1234567890",        // String (from localStorage)
    submittedAt: Date                  // JavaScript Date
  }
  ```

**Guest Identification:**
- Uses `localStorage.getItem('guestId')` or generates new one
- Stores `guestId` in `localStorage` for persistence
- Uses `guestId` to check for existing RSVP
- ⚠️ **NOT SECURE** - `guestId` can be manipulated
- ⚠️ **NOT UNIQUE** - Multiple devices = multiple guest IDs

**Edge Cases Not Handled:**
1. **Duplicate RSVPs**
   - Checks by `eventId` + `guestId` (localStorage-based)
   - ⚠️ **Can create multiple RSVPs** if guest clears localStorage or uses different device
   - ⚠️ **No email-based deduplication** - Same email can RSVP multiple times

2. **RSVP Updates**
   - Can update RSVP if same `guestId` found
   - ⚠️ **No UI to change RSVP** - Must clear localStorage to re-RSVP

3. **Plus-One Handling**
   - Stored as boolean
   - ⚠️ **No plus-one name collection** - Doesn't ask for plus-one's name
   - ⚠️ **No plus-one count** - Can't specify number of guests

4. **RSVP Deadlines**
   - ⚠️ **No deadline enforcement** - Can RSVP after event date
   - ⚠️ **No "RSVP by" date** - Events don't have RSVP deadlines

5. **Email Validation**
   - Basic HTML5 email validation
   - ⚠️ **No email confirmation** - Doesn't verify email is real
   - ⚠️ **No duplicate email check** - Same email can RSVP for multiple events

6. **Missing Event**
   - ⚠️ **No validation** - Can create RSVP for non-existent event
   - ⚠️ **No error handling** - If event deleted, RSVP remains orphaned

**Missing Features:**
- ❌ **No RSVP Confirmation Email** - Guest doesn't receive confirmation
- ❌ **No RSVP Reminders** - No reminder emails before event
- ❌ **No Dietary Restrictions** - Can't specify food allergies/preferences
- ❌ **No Song Requests** - Can't request songs for reception
- ❌ **No Guest Comments** - Can't add message to RSVP
- ❌ **No RSVP Export** - Can't download RSVP list as CSV
- ❌ **No RSVP Analytics** - No charts/graphs of RSVP trends

### 7.7 Gallery

**Location:** `src/pages/Gallery.jsx`

**Upload Flow:**
1. User selects file (image or video)
2. File stored in `selectedFile` state
3. User clicks "Upload" button
4. File uploaded to Firebase Storage: `weddings/{weddingId}/{timestamp}_{filename}`
5. Download URL retrieved
6. Metadata saved to Firestore `gallery` collection
7. Gallery reloaded to show new photo

**Storage Structure:**
- **Firebase Storage Path:** `weddings/{weddingId}/{timestamp}_{filename}`
- **Firestore Document:**
  ```javascript
  {
    id: "firestore-document-id",
    weddingId: "wedding-document-id",  // String, required
    url: "https://storage.googleapis.com/...",  // String, download URL
    fileName: "photo.jpg",              // String
    uploadedAt: Date,                   // JavaScript Date
    likes: 0,                           // Number (incremented on like)
    type: "photo" | "video"             // String (detected from file.type)
  }
  ```

**Display Logic:**
- Grid layout (2 columns mobile, 3 tablet, 4 desktop)
- Photos: `<img>` tag with `object-cover`
- Videos: `<video>` tag with controls
- Hover effect shows like button
- Framer Motion animations on load

**Reactions/Likes:**
- Like button appears on hover
- Clicking like increments `likes` counter in Firestore
- Uses `increment(1)` Firestore function
- ⚠️ **NO USER TRACKING** - Can like same photo multiple times
- ⚠️ **NO DISLIKE** - Only like, no dislike option

**Performance Concerns:**
1. **No Image Optimization**
   - Original file size uploaded (no compression)
   - No thumbnail generation
   - Large images slow down page load

2. **No Pagination**
   - Loads all photos at once
   - Could be slow with hundreds of photos

3. **No Lazy Loading**
   - All images load immediately
   - No `loading="lazy"` attribute

4. **No CDN Optimization**
   - Direct Firebase Storage URLs
   - No image resizing/optimization service

5. **No Video Transcoding**
   - Videos uploaded as-is
   - Large video files could cause issues

**Missing Features:**
- ❌ **No Photo Albums** - All photos in one gallery (no event-based albums)
- ❌ **No Photo Captions** - Can't add descriptions to photos
- ❌ **No Photo Tags** - Can't tag people in photos
- ❌ **No Photo Deletion** - No way to delete photos (owner or uploader)
- ❌ **No Photo Moderation** - No way to report/remove inappropriate photos
- ❌ **No Photo Download** - Can't download individual photos
- ❌ **No Photo Slideshow** - No full-screen slideshow view
- ❌ **No Photo Sharing** - Can't share individual photos
- ❌ **No Upload Progress** - No progress bar during upload
- ❌ **No Multiple File Upload** - Can only upload one file at a time
- ❌ **No Upload Permissions** - Anyone with link can upload (⚠️ **SECURITY ISSUE**)

### 7.8 Find My Photos (AI Placeholder)

**Location:** `src/pages/FindMyPhotos.jsx`

**What UI Exists:**
- Upload selfie interface (circular dashed border)
- Loading state (spinner + "Finding your photos..." message)
- Results display (grid of matched photos)
- "No photos found" empty state
- "Upload different photo" button
- Developer note (yellow warning box)

**What is Mocked:**
- **Face Recognition:** Completely mocked
  - No AI service integration
  - No face detection
  - No face matching
- **Photo Matching:** Returns first 10 photos from gallery (hardcoded)
- **Processing Time:** 2-second setTimeout to simulate AI processing

**What is NOT Implemented:**
- ❌ **No AI Service Integration**
  - No AWS Rekognition
  - No Google Cloud Vision API
  - No Azure Face API
  - No custom ML model
- ❌ **No Backend Endpoint**
  - No `/api/find-photos` endpoint
  - No server-side processing
- ❌ **No Face Detection**
  - Doesn't extract faces from gallery photos
  - Doesn't store face embeddings
- ❌ **No Face Matching**
  - Doesn't compare selfie to gallery photos
  - Doesn't calculate similarity scores
- ❌ **No Privacy Handling**
  - Doesn't handle GDPR/privacy concerns
  - Doesn't delete selfie after processing
  - Doesn't inform users about data usage

**Clear TODOs for Real AI Integration:**
1. **Choose AI Service:**
   - AWS Rekognition (face comparison API)
   - Google Cloud Vision API (face detection)
   - Azure Face API (face verification)
   - Custom ML model (TensorFlow.js or backend)

2. **Backend Implementation:**
   - Create API endpoint: `POST /api/find-photos`
   - Accept selfie upload
   - Process all gallery photos (extract faces)
   - Match selfie to gallery faces
   - Return matched photo URLs

3. **Face Processing Pipeline:**
   - Upload selfie → Extract face embedding
   - For each gallery photo → Extract all faces
   - Compare selfie embedding to each face
   - Filter photos with similarity > threshold
   - Return filtered results

4. **Privacy & Performance:**
   - Delete selfie after processing
   - Cache face embeddings for gallery photos
   - Batch process gallery photos
   - Handle large galleries efficiently

5. **Error Handling:**
   - Handle no face detected in selfie
   - Handle low-quality images
   - Handle API rate limits
   - Handle service failures

**Current Behavior:**
- User uploads selfie → Shows loading → Returns first 10 gallery photos → Displays as "matched photos"
- **This is completely fake and should not be used in production.**

### 7.9 Collaboration & Roles

**Location:** `src/pages/ContactsManagement.jsx`

**What Roles Exist in Code:**
- `owner` - Wedding creator (cannot be removed, has full access)
- `admin` - Can edit wedding (intended, but not enforced)
- `viewer` - Read-only access (intended, but not enforced)

**What is Implemented:**
- ✅ **Data Structure:** `wedding.collaborators` array stores collaborator objects
- ✅ **Add Collaborator UI:** Form to add email, name, role
- ✅ **List Collaborators:** Shows all collaborators with role badges
- ✅ **Edit Role:** Dropdown to change role (viewer/admin)
- ✅ **Delete Collaborator:** Remove collaborator from array
- ✅ **Owner Protection:** Owner cannot be deleted

**What is Missing:**
- ❌ **No Invitation System**
  - Collaborators added by email only
  - No email sent to collaborator
  - No acceptance flow
  - Collaborator must already have account

- ❌ **No Permission Enforcement**
  - Protected routes don't check collaborator status
  - Any authenticated user can access any wedding dashboard
  - No role-based access control (RBAC)

- ❌ **No Collaborator Verification**
  - `userId` is `null` until collaborator "accepts" (but no acceptance flow exists)
  - No way to verify collaborator owns the email
  - No email confirmation

- ❌ **No Collaborator Notifications**
  - No email when added as collaborator
  - No notification when role changes
  - No way to notify collaborators of changes

- ❌ **No Collaborator Management**
  - Can't see which collaborators are active
  - Can't see when collaborator last accessed
  - No way to remove inactive collaborators

**Security Implications:**
1. **No Access Control**
   - Anyone who knows a wedding ID can access dashboard
   - Collaborator list is cosmetic only
   - No server-side permission checks

2. **No Email Verification**
   - Can add fake email addresses as collaborators
   - No way to verify collaborator identity

3. **No Invitation Flow**
   - Collaborators must manually find and access wedding
   - No secure invitation link
   - No expiration for invitations

4. **Role System Not Used**
   - Roles stored but never checked
   - Admin and viewer have same access as owner
   - No differentiation in UI or functionality

**What Needs to Be Built:**
1. **Permission Middleware**
   - Check if user is owner or collaborator before allowing access
   - Enforce role-based permissions (viewer = read-only, admin = edit, owner = full)

2. **Invitation System**
   - Send email to collaborator with invitation link
   - Collaborator clicks link → signs in → accepts invitation
   - Store `userId` when collaborator accepts

3. **Access Control in Routes**
   - Update `ProtectedRoute` to check wedding permissions
   - Create `WeddingProtectedRoute` component
   - Verify user has access to specific wedding

4. **Role-Based UI**
   - Hide edit buttons for viewers
   - Show different options based on role
   - Prevent viewers from deleting/editing

---

## 8. State Management

### Contexts Used

**1. AuthContext (`src/contexts/AuthContext.jsx`)**
- **Global State:**
  - `currentUser` - Firebase User object or `null`
  - `loading` - Boolean, true while auth state initializing
- **Methods:**
  - `signInWithGoogle()` - Initiates Google sign-in redirect
  - `signUp(email, password)` - Creates new account
  - `login(email, password)` - Signs in existing user
  - `logout()` - Signs out current user
- **Persistence:** Firebase Auth handles persistence (localStorage/sessionStorage)
- **Updates:** `onAuthStateChanged` listener updates state on auth changes

**2. WeddingContext (`src/contexts/WeddingContext.jsx`)**
- **Global State:**
  - `weddings` - Array of user's weddings
  - `currentWedding` - Currently selected wedding object or `null`
  - `loading` - Boolean (not consistently used)
- **Methods:**
  - `createWedding(weddingData)` - Creates new wedding
  - `getWeddingBySlug(slug)` - Gets wedding by slug (public)
  - `getWeddingById(weddingId)` - Gets wedding by ID
  - `getUserWeddings()` - Loads all weddings for current user
  - `updateWedding(weddingId, updates)` - Updates wedding document
  - `setCurrentWedding(wedding)` - Sets current wedding (manual)
- **Persistence:** Data stored in Firestore, loaded on mount
- **Updates:** Manual calls to `getUserWeddings()` (not real-time)

### What Global State Exists

**Authentication State:**
- Current user (Firebase User object)
- Auth loading state

**Wedding State:**
- List of user's weddings
- Currently selected wedding
- Wedding loading state

**No Global State For:**
- Events (loaded per-page)
- RSVPs (loaded per-page)
- Gallery (loaded per-page)
- Invitations (loaded per-page)
- UI state (modals, forms, etc.)

### Where State Leaks May Occur

1. **WeddingContext State Not Cleared**
   - `weddings` array persists after logout
   - `currentWedding` not cleared on logout
   - Could show stale data if user switches accounts

2. **No State Cleanup on Route Change**
   - Component state persists when navigating
   - Forms don't reset on navigation
   - Could cause confusion

3. **LocalStorage Guest ID**
   - `guestId` in `localStorage` never expires
   - Could cause issues if guest uses shared device
   - No way to clear guest ID

4. **No Cache Invalidation**
   - Wedding data cached in context
   - Doesn't refresh if wedding updated elsewhere
   - Could show outdated information

### Suggestions for Improvement

1. **Add State Cleanup**
   - Clear `weddings` and `currentWedding` on logout
   - Reset form state on navigation
   - Clear guest ID after wedding ends

2. **Implement Real-Time Updates**
   - Use Firestore `onSnapshot` listeners instead of `getDocs`
   - Auto-update state when data changes
   - Remove manual refresh calls

3. **Add Loading States**
   - Consistent loading indicators
   - Skeleton screens instead of spinners
   - Better UX during data fetches

4. **Implement Error Boundaries**
   - Catch and handle errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging

5. **Add State Persistence**
   - Persist `currentWedding` selection in localStorage
   - Remember user preferences
   - Restore state on page reload

6. **Consider State Management Library**
   - For complex state: Redux, Zustand, or Jotai
   - Better dev tools and debugging
   - More predictable state updates

---

## 9. Firebase Security & Risks

### What Rules Currently Exist

**Firestore Rules (`firestore.rules`):**

```javascript
// Weddings collection
match /weddings/{weddingId} {
  allow read: if true;  // ⚠️ PUBLIC READ
  allow create: if request.auth != null && 
                   request.resource.data.ownerId == request.auth.uid;
  allow update: if request.auth != null && 
                   resource.data.ownerId == request.auth.uid;
  allow delete: if request.auth != null && 
                   resource.data.ownerId == request.auth.uid;
}

// Events collection
match /events/{eventId} {
  allow read: if true;  // ⚠️ PUBLIC READ
  allow create: if request.auth != null;  // ⚠️ ANY AUTHENTICATED USER
  allow update: if request.auth != null;   // ⚠️ ANY AUTHENTICATED USER
  allow delete: if request.auth != null;   // ⚠️ ANY AUTHENTICATED USER
}

// RSVPs collection
match /rsvps/{rsvpId} {
  allow read: if request.auth != null;  // ⚠️ ANY AUTHENTICATED USER
  allow create: if true;  // ⚠️ PUBLIC CREATE
  allow update: if true;  // ⚠️ PUBLIC UPDATE
  allow delete: if request.auth != null;
}

// Gallery collection
match /gallery/{photoId} {
  allow read: if true;  // ⚠️ PUBLIC READ
  allow create: if request.auth != null;  // ⚠️ ANY AUTHENTICATED USER
  allow update: if request.auth != null;   // ⚠️ ANY AUTHENTICATED USER
  allow delete: if request.auth != null;  // ⚠️ ANY AUTHENTICATED USER
}

// Invitations collection
match /invitations/{invitationId} {
  allow read: if request.auth != null;  // ⚠️ ANY AUTHENTICATED USER
  allow create: if request.auth != null;
  allow update: if request.auth != null;
  allow delete: if request.auth != null;
}
```

**Storage Rules (`storage.rules`):**

```javascript
match /b/{bucket}/o {
  match /weddings/{weddingId}/{allPaths=**} {
    allow read: if true;  // ⚠️ PUBLIC READ
    allow write: if request.auth != null && 
                    firestore.exists(/databases/(default)/documents/weddings/$(weddingId)) &&
                    firestore.get(/databases/(default)/documents/weddings/$(weddingId)).data.ownerId == request.auth.uid;
  }
}
```

### What is Dangerously Open

**CRITICAL SECURITY ISSUES:**

1. **Public Wedding Data Read**
   - Anyone can read any wedding document
   - Can enumerate all weddings by guessing IDs
   - Can access private wedding information
   - **Risk:** Privacy violation, data scraping

2. **Public Events Read**
   - Anyone can read all events
   - Can see private events (e.g., bachelor party)
   - **Risk:** Privacy violation

3. **Public Gallery Read**
   - Anyone can read all gallery photos
   - Can access private photos
   - **Risk:** Privacy violation, photo theft

4. **Public Storage Read**
   - Anyone can read all uploaded files
   - Can access photos/videos directly via URL
   - **Risk:** Privacy violation, bandwidth abuse

5. **Any User Can Create Events**
   - Any authenticated user can create events for any wedding
   - No ownership or collaborator check
   - **Risk:** Spam, malicious content

6. **Any User Can Update Events**
   - Any authenticated user can modify any event
   - Can change dates, locations, etc.
   - **Risk:** Vandalism, data corruption

7. **Any User Can Delete Events**
   - Any authenticated user can delete any event
   - **Risk:** Data loss, service disruption

8. **Public RSVP Create/Update**
   - Anyone (even not authenticated) can create RSVPs
   - Can spam RSVPs for any wedding
   - Can update/delete other people's RSVPs
   - **Risk:** Spam, data corruption

9. **Any User Can Create Gallery Items**
   - Any authenticated user can add photos to any wedding
   - **Risk:** Spam, inappropriate content

10. **No Rate Limiting**
    - No limits on create/update/delete operations
    - Can spam database with requests
    - **Risk:** DoS, cost abuse

### What MUST be Secured Before Production

**Priority 1 - CRITICAL (Must Fix Immediately):**

1. **Restrict Wedding Reads**
   ```javascript
   allow read: if request.auth != null || 
                  resource.data.slug != null;  // Only allow read by slug (public website)
   ```
   - Or: Only allow read if user is owner/collaborator OR wedding has public slug

2. **Restrict Events to Wedding Owners/Collaborators**
   ```javascript
   allow create: if request.auth != null && 
                    get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.ownerId == request.auth.uid ||
                    request.auth.uid in get(/databases/$(database)/documents/weddings/$(resource.data.weddingId)).data.collaborators[].userId;
   ```
   - Check if user is owner or collaborator before allowing event operations

3. **Restrict Gallery to Wedding Owners/Collaborators**
   - Same as events - check ownership/collaboration
   - Or: Allow public read but restrict write to owners

4. **Restrict RSVP Updates**
   ```javascript
   allow update: if request.auth == null &&  // Guest can update
                    request.resource.data.guestId == resource.data.guestId;  // Only their own RSVP
   ```
   - Or: Use email-based verification for guest RSVP updates

5. **Add Rate Limiting**
   - Implement Cloud Functions with rate limiting
   - Or: Use Firebase App Check to prevent abuse

**Priority 2 - HIGH (Fix Before Launch):**

6. **Validate Data on Write**
   - Add field validation in rules
   - Check required fields exist
   - Validate field types and formats

7. **Add Slug Uniqueness Check**
   - Use Cloud Function to check uniqueness before create
   - Or: Use Firestore transaction to ensure uniqueness

8. **Restrict Storage Writes**
   - Current rule checks ownership (good)
   - But: Should also validate file types and sizes
   - Add virus scanning (via Cloud Functions)

9. **Add Collaborator Permission Checks**
   - Check collaborator role before allowing operations
   - Viewer = read-only, Admin = edit, Owner = full

10. **Add Data Validation**
    - Validate email formats
    - Validate date ranges
    - Validate string lengths

**Priority 3 - MEDIUM (Fix Soon):**

11. **Add Audit Logging**
    - Log all create/update/delete operations
    - Track who made changes
    - Store in separate `audit_logs` collection

12. **Add Data Encryption**
    - Encrypt sensitive fields (emails, phone numbers)
    - Use Firebase Encryption at Rest (if available)
    - Or: Client-side encryption before storing

13. **Add Backup & Recovery**
    - Regular Firestore backups
    - Storage backups
    - Disaster recovery plan

---

## 10. UX / Product Gaps

### Missing UX Flows

1. **Onboarding Flow**
   - ❌ No tutorial for new users
   - ❌ No guided setup after wedding creation
   - ❌ No tips or best practices

2. **Error Handling**
   - ❌ Generic error messages ("Failed to create wedding")
   - ❌ No retry mechanisms
   - ❌ No offline handling
   - ❌ No network error detection

3. **Loading States**
   - ⚠️ Basic spinners only
   - ❌ No skeleton screens
   - ❌ No progress indicators for uploads
   - ❌ No estimated time remaining

4. **Empty States**
   - ⚠️ Some empty states exist (gallery, events)
   - ❌ No helpful guidance in empty states
   - ❌ No suggested actions

5. **Confirmation Flows**
   - ⚠️ Delete confirmations exist (events)
   - ❌ No confirmation for wedding deletion
   - ❌ No "Are you sure?" for destructive actions
   - ❌ No undo functionality

6. **Search & Filter**
   - ❌ No search in gallery
   - ❌ No filter by event in gallery
   - ❌ No search in guest list
   - ❌ No date range filters

7. **Bulk Operations**
   - ⚠️ Bulk invite exists
   - ❌ No bulk RSVP management
   - ❌ No bulk photo operations
   - ❌ No bulk event operations

### Incomplete Screens

1. **Wedding Settings Page**
   - ❌ No page to edit wedding details
   - ❌ No way to change theme after creation
   - ❌ No way to update slug
   - ❌ No way to add/edit story

2. **Profile/Settings Page**
   - ❌ No user profile page
   - ❌ No account settings
   - ❌ No password change
   - ❌ No email change

3. **RSVP Management Page**
   - ❌ No dedicated page to view all RSVPs
   - ❌ No RSVP analytics/charts
   - ❌ No export RSVP list
   - ❌ No filter RSVPs by status

4. **Gallery Management Page**
   - ⚠️ Basic gallery exists
   - ❌ No photo organization (albums, tags)
   - ❌ No photo moderation
   - ❌ No bulk delete

5. **Notifications Page**
   - ❌ No in-app notifications
   - ❌ No notification center
   - ❌ No email notification preferences

### Confusing Interactions

1. **Google Sign-In Redirect**
   - User leaves app during sign-in
   - Can be confusing if they don't expect redirect
   - No clear indication of what's happening

2. **Wedding Selection**
   - If user has multiple weddings, must use dropdown
   - No clear indication of which wedding is selected
   - Can accidentally work on wrong wedding

3. **RSVP Flow**
   - Guest must find event page to RSVP
   - No direct RSVP link in invite
   - Confusing if multiple events exist

4. **Gallery Upload**
   - Upload button exists but no clear indication of who can upload
   - No feedback during upload
   - Can't see upload progress

5. **Collaborator Management**
   - Can add collaborator but no way to notify them
   - No clear indication of what collaborators can do
   - Roles exist but don't affect functionality

### Areas Needing Polish

1. **Mobile Responsiveness**
   - ⚠️ Basic responsive design exists
   - ❌ Some forms not optimized for mobile
   - ❌ Touch targets could be larger
   - ❌ No mobile-specific navigation

2. **Accessibility**
   - ❌ No ARIA labels
   - ❌ No keyboard navigation support
   - ❌ No screen reader optimization
   - ❌ Color contrast may not meet WCAG standards

3. **Performance**
   - ⚠️ Basic performance (Vite is fast)
   - ❌ No image optimization
   - ❌ No code splitting
   - ❌ No lazy loading

4. **Internationalization**
   - ❌ English only
   - ❌ No date format localization
   - ❌ No currency support
   - ❌ No timezone handling

5. **Error Messages**
   - ❌ Technical error messages shown to users
   - ❌ No user-friendly error descriptions
   - ❌ No help links or support contact

6. **Visual Design**
   - ⚠️ Basic design exists
   - ❌ No dark mode
   - ❌ Limited customization
   - ❌ No brand customization

---

## 11. Known Technical Debt

### Hacks

1. **Guest ID in localStorage**
   - Uses `localStorage` to track guests for RSVP
   - Not secure, can be manipulated
   - Should use session-based or email-based identification

2. **Slug Generation Client-Side**
   - Slug generated in browser
   - No server-side validation
   - Should be generated/validated server-side

3. **Date Handling**
   - Mix of Firestore Timestamp and JavaScript Date
   - Inconsistent conversion (`toDate?.()` checks)
   - Should standardize on one format

4. **Mock AI in Production Code**
   - `FindMyPhotos.jsx` has fake AI implementation
   - Returns first 10 photos as "matched"
   - Should be removed or clearly marked as placeholder

5. **EmailJS Silent Failures**
   - Email sending fails silently if not configured
   - No clear error to user
   - Should show configuration warning

### TODO Comments

**Found in Codebase:**
1. `src/config/firebase.js:7` - "TODO: Replace with your actual Firebase config"
2. `src/pages/InviteGuests.jsx:123` - "TODO: Integrate with Twilio or SMS service"
3. `src/pages/FindMyPhotos.jsx:14` - "TODO: Implement face recognition AI"
4. `src/pages/FindMyPhotos.jsx:26` - "TODO: Send selfie to AI service for face recognition"

**Additional TODOs (Not in Code):**
- Add slug uniqueness validation
- Implement collaborator invitation flow
- Add permission checking in routes
- Implement real-time updates
- Add error boundaries
- Add loading states consistently
- Implement password reset
- Add email verification

### Non-Scalable Decisions

1. **No Pagination**
   - Gallery loads all photos at once
   - Events list loads all events
   - RSVPs load all responses
   - Will break with large datasets

2. **No Caching Strategy**
   - Every page load queries Firestore
   - No client-side caching
   - Wastes reads and slows down app

3. **No Indexing Strategy**
   - Firestore queries may require composite indexes
   - No index creation documented
   - Queries may fail at scale

4. **Client-Side Data Processing**
   - Stats calculated in browser (guest count, etc.)
   - Should be pre-calculated or server-side
   - Slow with large datasets

5. **No Background Jobs**
   - All processing happens in user request
   - No async processing for heavy operations
   - Could timeout on large operations

### Temporary Implementations

1. **Email Sending**
   - Uses EmailJS (free tier limited)
   - Should migrate to proper email service (SendGrid, AWS SES)
   - No email queue or retry logic

2. **SMS Sending**
   - Completely unimplemented
   - Placeholder code only
   - Needs Twilio or similar service

3. **File Upload**
   - Direct to Firebase Storage
   - No virus scanning
   - No file type validation beyond HTML5
   - No size limits enforced

4. **Error Handling**
   - Basic try/catch with console.error
   - No error tracking (Sentry, etc.)
   - No error reporting to admins

5. **Analytics**
   - No user analytics
   - No event tracking
   - No conversion tracking
   - No performance monitoring

---

## 12. What This App CAN and CANNOT Do Today

### CAN DO

**Wedding Management:**
- ✅ Create a wedding with couple names, date, city, theme, slug
- ✅ View dashboard with wedding stats (guests, RSVPs, events, photos)
- ✅ Select between multiple weddings (if user has more than one)
- ✅ View public wedding website by slug
- ✅ View digital invite preview by slug

**Event Management:**
- ✅ Create events with name, description, date, time, location, dress code
- ✅ Edit existing events
- ✅ Delete events (with confirmation)
- ✅ View events in chronological timeline on public website
- ✅ View individual event details page

**RSVP System:**
- ✅ Guests can RSVP without creating account
- ✅ Collect guest name, email, plus-one preference
- ✅ Track RSVP status (Yes/Maybe/No)
- ✅ Show RSVP confirmation after submission
- ✅ Check for existing RSVP (via localStorage guest ID)

**Gallery:**
- ✅ Upload photos and videos to gallery
- ✅ View gallery in grid layout
- ✅ Like photos (increment counter)
- ✅ Display photos and videos with proper media tags

**Invitations:**
- ✅ Send email invitations via EmailJS (if configured)
- ✅ Bulk invite multiple guests (email/phone)
- ✅ View sent invitations list
- ✅ Share invite via WhatsApp
- ✅ Copy invite link to clipboard

**Collaboration (Data Structure Only):**
- ✅ Add collaborators by email
- ✅ Assign roles (owner, admin, viewer)
- ✅ View collaborators list
- ✅ Edit collaborator roles
- ✅ Delete collaborators (except owner)

**Authentication:**
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Sign in with Google (redirect method)
- ✅ Sign out
- ✅ Protected routes redirect to login if not authenticated

### CANNOT DO

**Wedding Management:**
- ❌ Edit wedding details after creation (no UI, though function exists)
- ❌ Delete wedding
- ❌ Change wedding slug
- ❌ Add cover image to wedding
- ❌ Customize wedding website beyond theme
- ❌ Verify slug uniqueness before creation

**Event Management:**
- ❌ Add images to events
- ❌ Set event capacity/guest limits
- ❌ Create recurring events
- ❌ Set RSVP deadlines for events
- ❌ Send event reminders
- ❌ Export event guest list

**RSVP System:**
- ❌ Send RSVP confirmation emails
- ❌ Send RSVP reminder emails
- ❌ Collect dietary restrictions
- ❌ Collect song requests
- ❌ Allow guests to add comments to RSVP
- ❌ Export RSVP list as CSV/Excel
- ❌ View RSVP analytics/charts
- ❌ Filter RSVPs by status
- ❌ Prevent duplicate RSVPs (email-based)
- ❌ Update RSVP after submission (no UI)

**Gallery:**
- ❌ Organize photos into albums
- ❌ Tag people in photos
- ❌ Add captions to photos
- ❌ Delete photos
- ❌ Moderate photos (report/remove inappropriate)
- ❌ Download photos
- ❌ View full-screen slideshow
- ❌ Filter photos by event
- ❌ Search photos
- ❌ Optimize images (compression, thumbnails)

**AI Features:**
- ❌ Find photos using face recognition (UI only, no AI)
- ❌ Any real AI functionality

**Invitations:**
- ❌ Send SMS invitations (placeholder only)
- ❌ Customize invite design
- ❌ Schedule invitation sending
- ❌ Track invitation opens/clicks
- ❌ Resend invitations
- ❌ Send reminder invitations

**Collaboration:**
- ❌ Send collaborator invitations via email
- ❌ Collaborators accept invitations
- ❌ Enforce collaborator permissions (roles don't work)
- ❌ Notify collaborators of changes
- ❌ View collaborator activity
- ❌ Remove inactive collaborators automatically

**User Management:**
- ❌ Reset password
- ❌ Change email address
- ❌ Change password
- ❌ Delete account
- ❌ View profile
- ❌ Email verification

**Security:**
- ❌ Enforce wedding ownership in routes
- ❌ Check collaborator permissions
- ❌ Rate limit API calls
- ❌ Validate all user inputs server-side
- ❌ Prevent unauthorized access to weddings

**Analytics & Reporting:**
- ❌ View wedding analytics
- ❌ Track website views
- ❌ Track RSVP conversion rates
- ❌ Export data (guests, RSVPs, etc.)
- ❌ Generate reports

**Other:**
- ❌ Multi-language support
- ❌ Dark mode
- ❌ Custom domains
- ❌ Email templates customization
- ❌ Payment processing (if needed for premium features)

---

## 13. Recommended Next Development Phases

### Phase 1 — Stabilization (CRITICAL - Before Any Launch)

**Timeline: 2-4 weeks**

**Security Fixes (MUST DO):**
1. **Fix Firestore Security Rules**
   - Restrict wedding reads (only by slug or owner/collaborator)
   - Restrict events to wedding owners/collaborators
   - Restrict gallery writes to owners/collaborators
   - Restrict RSVP updates to same guest
   - Add data validation in rules

2. **Fix Storage Security Rules**
   - Validate file types and sizes
   - Add virus scanning (Cloud Function)
   - Restrict uploads to owners/collaborators

3. **Add Permission Checking**
   - Create `WeddingProtectedRoute` component
   - Check user is owner/collaborator before allowing access
   - Enforce role-based permissions (viewer = read-only)

4. **Add Input Validation**
   - Server-side validation (Cloud Functions or rules)
   - Client-side validation improvements
   - Sanitize all user inputs

**Data Integrity:**
5. **Add Slug Uniqueness**
   - Check uniqueness before creating wedding
   - Use Firestore transaction or Cloud Function
   - Handle slug conflicts gracefully

6. **Add Cascading Deletes**
   - Delete related data when wedding deleted
   - Clean up events, RSVPs, gallery, invitations
   - Or: Soft delete with archive

**Error Handling:**
7. **Improve Error Messages**
   - User-friendly error messages
   - Help links or support contact
   - Retry mechanisms

8. **Add Error Tracking**
   - Integrate Sentry or similar
   - Log errors for debugging
   - Alert on critical errors

**Performance:**
9. **Add Pagination**
   - Paginate gallery (load 20-50 at a time)
   - Paginate events list
   - Paginate RSVPs

10. **Add Image Optimization**
    - Compress images before upload
    - Generate thumbnails
    - Use CDN for image delivery

**Testing:**
11. **Add Unit Tests**
    - Test context functions
    - Test utility functions
    - Test form validation

12. **Add Integration Tests**
    - Test authentication flow
    - Test wedding creation flow
    - Test RSVP flow

### Phase 2 — Feature Expansion (Post-Stabilization)

**Timeline: 4-8 weeks**

**Core Features:**
1. **Wedding Settings Page**
   - Edit wedding details
   - Change theme
   - Add/edit story
   - Upload cover image
   - Delete wedding (with confirmation)

2. **RSVP Management**
   - View all RSVPs in one place
   - Filter by status (Yes/Maybe/No)
   - Export RSVP list (CSV/Excel)
   - Send RSVP reminder emails
   - Collect dietary restrictions

3. **Gallery Improvements**
   - Organize into albums (by event)
   - Add captions to photos
   - Delete photos
   - Download photos
   - Full-screen slideshow
   - Search and filter

4. **Collaborator Invitations**
   - Send email invitations to collaborators
   - Collaborator acceptance flow
   - Permission enforcement based on roles
   - Notify collaborators of changes

5. **Email/SMS Improvements**
   - Proper email service (SendGrid/AWS SES)
   - SMS integration (Twilio)
   - Email templates customization
   - Track email opens/clicks
   - Schedule sending

**User Experience:**
6. **Onboarding Flow**
   - Tutorial for new users
   - Guided setup after wedding creation
   - Tips and best practices

7. **Better Empty States**
   - Helpful guidance
   - Suggested actions
   - Example content

8. **Loading States**
   - Skeleton screens
   - Progress indicators
   - Estimated time remaining

**Mobile Optimization:**
9. **Mobile-First Improvements**
   - Larger touch targets
   - Mobile-specific navigation
   - Optimized forms for mobile
   - Swipe gestures

### Phase 3 — AI & Scale (Future Enhancements)

**Timeline: 8-12 weeks**

**AI Features:**
1. **Real Face Recognition**
   - Integrate AWS Rekognition or similar
   - Backend API for face matching
   - Process gallery photos to extract faces
   - Match selfie to gallery faces
   - Return filtered results

2. **Photo Organization AI**
   - Auto-tag photos (people, events, locations)
   - Auto-organize into albums
   - Suggest best photos
   - Remove duplicates

**Scale Improvements:**
3. **Real-Time Updates**
   - Use Firestore `onSnapshot` listeners
   - Auto-update UI when data changes
   - Remove manual refresh calls

4. **Caching Strategy**
   - Client-side caching for frequently accessed data
   - Cache invalidation strategy
   - Reduce Firestore reads

5. **Background Jobs**
   - Cloud Functions for heavy operations
   - Email queue processing
   - Image processing
   - Analytics aggregation

**Advanced Features:**
6. **Analytics Dashboard**
   - Website views
   - RSVP conversion rates
   - Popular events
   - Guest engagement metrics

7. **Customization**
   - Custom themes
   - Custom domains
   - Brand colors
   - Custom email templates

8. **Internationalization**
   - Multi-language support
   - Date format localization
   - Timezone handling
   - Currency support

**Monetization (If Needed):**
9. **Premium Features**
   - Advanced analytics
   - Custom domains
   - Priority support
   - Unlimited photos
   - Advanced AI features

---

## FINAL NOTES

This document represents the **current state** of the OneKnot application as of the codebase analysis. It is intentionally verbose and detailed to serve as a complete reference for developers.

**Key Takeaways:**
- The application is a **functional prototype** with core features working
- **Security is a critical concern** - many rules are too permissive
- **Many features are partially implemented** - UI exists but functionality is incomplete
- **Technical debt exists** - hacks and temporary solutions need to be addressed
- **Not production-ready** - requires significant work before launch

**Next Steps for Developers:**
1. Read this document thoroughly
2. Review the codebase with this document as reference
3. Prioritize Phase 1 (Stabilization) tasks
4. Create detailed task breakdowns for each phase
5. Set up proper development workflow (testing, CI/CD, etc.)

**Questions or Updates:**
- This document should be updated as the codebase evolves
- Mark sections as outdated if they no longer reflect reality
- Add new sections as features are added
- Keep this as the single source of truth

---

**Document Version:** 1.0  
**Last Codebase Analysis:** Based on current repository state  
**Maintained By:** Development Team
