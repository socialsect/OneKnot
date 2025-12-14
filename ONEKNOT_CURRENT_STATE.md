# OneKnot — Current Application State (Authoritative)

**Document Purpose:** Single source of truth for the current state of OneKnot application  
**Last Updated:** Based on codebase analysis  
**Language:** JavaScript only (no TypeScript)  
**Status:** Prototype / v0 - Not production ready

---

## 1. What OneKnot Is Today

### What Problem the App Currently Solves

OneKnot is a wedding management platform that provides a **single shareable link** (`/w/:slug`) where couples can:
- Create a public wedding website with their information
- Manage multiple wedding events (ceremony, reception, etc.)
- Collect RSVPs from guests without requiring them to create accounts
- Share a photo/video gallery where guests can upload memories
- Send digital invitations via email (when configured)

**Current Value Proposition:**
- Guests can RSVP without creating an account (lower friction)
- All wedding information in one place (easier for guests)
- Couples can manage events and track RSVPs in a simple dashboard
- Photo gallery allows crowd-sourced wedding memories

**What It Does NOT Solve Yet:**
- No AI face recognition (UI placeholder only)
- No SMS invitations (code exists but not functional)
- No collaborator permissions (data structure exists but not enforced)
- No email verification or password reset
- Limited security (many public read/write operations)

### Who Can Realistically Use It Today

**Couples (Wedding Creators):**
- ✅ Can create account (email/password or Google)
- ✅ Can create wedding with basic details
- ✅ Can manage events (create, edit, delete)
- ✅ Can view dashboard with stats
- ✅ Can send email invitations (if EmailJS configured)
- ⚠️ Cannot edit wedding details after creation (no UI)
- ⚠️ Cannot delete wedding (no UI)
- ⚠️ Cannot verify collaborator permissions work

**Guests (No Account Required):**
- ✅ Can view public wedding website
- ✅ Can view digital invite
- ✅ Can RSVP to events (name, email, plus-one)
- ✅ Can view gallery
- ✅ Can upload photos/videos to gallery
- ⚠️ Can upload without authentication (security risk)
- ⚠️ Cannot update RSVP after submission (no UI)

**Collaborators (Partially Implemented):**
- ⚠️ Can be added to wedding by email
- ❌ Cannot receive invitation email (not implemented)
- ❌ Cannot accept invitation (no flow)
- ❌ Cannot access dashboard (permissions not enforced)
- ❌ Roles (viewer/admin) don't affect access

### What Stage the Product Is In

**Status: PROTOTYPE / v0 / PARTIAL PRODUCT**

**Working End-to-End:**
- ✅ Wedding creation → Dashboard → Public website flow
- ✅ Event creation → Event details → RSVP submission
- ✅ Gallery upload → Gallery display → Like photos
- ✅ Email invitation sending (when EmailJS configured)

**Partially Working:**
- ⚠️ Email invitations (requires EmailJS setup, no error handling if not configured)
- ⚠️ Collaborator management (UI exists, permissions not enforced)
- ⚠️ Dashboard stats (real data but no real-time updates)

**Not Working / Placeholder:**
- ❌ AI face recognition (returns first 10 photos as mock)
- ❌ SMS invitations (placeholder code, no service integration)
- ❌ Password reset (no UI or flow)
- ❌ Email verification (no flow)
- ❌ Wedding editing (function exists, no UI)

**Critical Issues:**
- 🔴 Security rules too permissive (public reads, any user can create events)
- 🔴 No ownership verification in routes
- 🔴 No slug uniqueness validation
- 🔴 No input validation server-side
- 🔴 No rate limiting

**NOT PRODUCTION READY** - Requires security fixes, validation, and feature completion before launch.

---

## 2. Tech Stack (Actual, Not Intended)

### Frontend

**Core Framework:**
- **React 18.3.1** - UI library (JavaScript only, no TypeScript)
- **React DOM 18.3.1** - React rendering

**Build Tool:**
- **Vite 7.2.4** - Development server and build tool
  - Fast HMR (Hot Module Replacement)
  - ES modules
  - No TypeScript compilation

**Routing:**
- **React Router DOM 6.28.0** - Client-side routing
  - BrowserRouter (history API)
  - Route definitions in `src/App.jsx`
  - No route guards beyond `ProtectedRoute` component

**Styling:**
- **Tailwind CSS 3.4.13** - Utility-first CSS framework
  - Custom color palette (pink/purple theme)
  - Custom component classes in `src/index.css`:
    - `.btn-primary` - Pink background, white text, rounded-full
    - `.btn-secondary` - White background, pink border, pink text
    - `.input-field` - Form input styling with focus ring
  - PostCSS 8.4.47 for processing
  - Autoprefixer 10.4.20 for vendor prefixes

**Animation:**
- **Framer Motion 11.3.24** - Animation library
  - Used for page transitions
  - Component entrance animations
  - Hover effects

**Icons:**
- **Lucide React 0.561.0** - Primary icon library (most icons)
- **React Icons 5.5.0** - Secondary icon library (some icons)

**State Management:**
- **React Context API** - Built-in React state management
  - `AuthContext` - Authentication state
  - `WeddingContext` - Wedding data state
  - No external state management library (Redux, Zustand, etc.)

### Backend / Services

**Firebase Services (Active):**

1. **Firebase Authentication**
   - Email/Password authentication
   - Google Sign-In (redirect method, not popup)
   - Auth state persistence (handled by Firebase SDK)
   - No email verification flow
   - No password reset flow

2. **Cloud Firestore**
   - NoSQL document database
   - Collections used:
     - `weddings` - Wedding documents
     - `events` - Event documents
     - `rsvps` - RSVP responses
     - `gallery` - Photo/video metadata
     - `invitations` - Sent invitation records
   - Queries use `getDocs()` (not real-time listeners)
   - No subcollections (flat structure)

3. **Firebase Storage**
   - File storage for photos/videos
   - Storage path: `weddings/{weddingId}/{timestamp}_{filename}`
   - No image optimization
   - No file type validation beyond HTML5
   - No size limits enforced

**Third-Party Services:**

1. **EmailJS (@emailjs/browser 4.4.1)**
   - Email sending service
   - Requires configuration: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
   - Fails silently if not configured
   - Used for sending invitation emails

2. **No Backend Server**
   - No Node.js/Express backend
   - No API endpoints
   - All logic client-side
   - Firebase handles authentication and data storage

### Libraries in Active Use

**Production Dependencies:**
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `react-router-dom` ^6.28.0
- `firebase` ^10.14.1
- `framer-motion` ^11.3.24
- `lucide-react` ^0.561.0
- `react-icons` ^5.5.0
- `@emailjs/browser` ^4.4.1

**Development Dependencies:**
- `vite` ^7.2.4
- `@vitejs/plugin-react` ^4.3.1
- `tailwindcss` ^3.4.13
- `postcss` ^8.4.47
- `autoprefixer` ^10.4.20
- `@types/react` ^18.3.5 (for IDE support, not used in build)
- `@types/react-dom` ^18.3.0 (for IDE support, not used in build)

**Not Used:**
- No testing framework (Jest, Vitest, etc.)
- No linting tool (ESLint, etc.)
- No form validation library (Formik, React Hook Form, etc.)
- No HTTP client (axios, fetch wrapper, etc.) - uses Firebase SDK directly
- No date library (moment, date-fns, etc.) - uses native Date and Firestore Timestamp

---

## 3. Project & Folder Structure

### Root Directory

```
oneknot/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── CHANGELOG.md              # Development history
├── CURRENT_STATE.md          # Previous state documentation
├── DEPLOY_RULES.md           # Deployment documentation
├── DEPLOY_RULES_UPDATE.md    # Deployment updates
├── EMAILJS_FIX.md            # EmailJS troubleshooting
├── EMAIL_SMS_SETUP.md        # Email/SMS setup guide
├── EMAIL_SUBJECT_LINES.md   # Email subject line examples
├── EMAIL_TEMPLATE_SETUP.md  # EmailJS template configuration
├── email-template.html       # HTML email template
├── env.template              # Alternative env template
├── FIREBASE_SETUP.md         # Firebase setup instructions
├── firebase-config-template.txt # Firebase config template
├── firestore.rules           # Firestore security rules
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── postcss.config.js         # PostCSS configuration
├── QUICKSTART.md             # Quick start guide
├── README.md                 # Project README
├── storage.rules             # Firebase Storage security rules
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.js            # Vite build configuration
├── public/                    # Static assets
│   └── vite.svg              # Vite logo
└── src/                      # Source code
```

### `/src` Directory Structure

**Entry Point:**
- `src/main.jsx` - React application entry point
  - Renders `<App />` with `React.StrictMode`
  - Imports global styles from `index.css`

**Main Application:**
- `src/App.jsx` - Root component
  - Defines all routes using React Router
  - Wraps app in `AuthProvider` and `WeddingProvider`
  - Route configuration (see Section 4)

**Configuration:**
- `src/config/firebase.js` - Firebase initialization
  - Reads config from environment variables
  - Exports `auth`, `db` (Firestore), `storage`
  - No Firebase Functions, Messaging, or Analytics

**Context Providers:**
- `src/contexts/AuthContext.jsx` - Authentication state management
  - Provides `useAuth()` hook
  - Manages `currentUser` state
  - Handles sign-in, sign-up, sign-out
  - Google redirect result handling

- `src/contexts/WeddingContext.jsx` - Wedding data management
  - Provides `useWedding()` hook
  - Manages `weddings` array and `currentWedding`
  - CRUD operations for weddings
  - Auto-loads user weddings on mount

**Components:**
- `src/components/ProtectedRoute.jsx` - Route guard
  - Checks if user is authenticated
  - Redirects to `/login` if not authenticated
  - No role-based or wedding-specific checks

**Pages (Route Components):**
- `src/pages/Home.jsx` - Landing page
- `src/pages/Login.jsx` - Authentication page
- `src/pages/CreateWedding.jsx` - Wedding creation form
- `src/pages/Dashboard.jsx` - Main dashboard
- `src/pages/WeddingWebsite.jsx` - Public wedding website
- `src/pages/InvitePreview.jsx` - Digital invite preview
- `src/pages/EventDetails.jsx` - Event page with RSVP
- `src/pages/EventsManagement.jsx` - Event CRUD interface
- `src/pages/ContactsManagement.jsx` - Collaborators and guests
- `src/pages/InviteGuests.jsx` - Send invitations
- `src/pages/Gallery.jsx` - Photo/video gallery
- `src/pages/FindMyPhotos.jsx` - AI placeholder page

**Styles:**
- `src/index.css` - Global styles
  - Tailwind imports (`@tailwind base/components/utilities`)
  - Custom component classes (`.btn-primary`, `.btn-secondary`, `.input-field`)
  - Base body styles

- `src/style.css` - (Unused or minimal - not imported)

### Key Files and Their Purpose

**`package.json`**
- Defines project metadata
- Lists all dependencies
- Scripts: `dev` (Vite dev server), `build` (production build), `preview` (preview build)

**`vite.config.js`**
- Vite configuration
- React plugin enabled
- No special build optimizations

**`tailwind.config.js`**
- Tailwind CSS configuration
- Content paths: `index.html`, `src/**/*.{js,jsx}`
- Custom color palette (pink theme)
- Custom font family (Inter)

**`firestore.rules`**
- Firestore security rules
- ⚠️ Many rules are too permissive (see Section 9)

**`storage.rules`**
- Firebase Storage security rules
- ⚠️ Public read access (see Section 9)

**`index.html`**
- HTML entry point
- Root div: `<div id="root"></div>`
- Script tag loads `src/main.jsx`

---

## 4. Routing Map

### Route Definitions (from `src/App.jsx`)

| Route Path | Component | Access | Purpose | Data Read/Write |
|------------|-----------|--------|---------|-----------------|
| `/` | `Home.jsx` | Public | Landing page with features | None |
| `/login` | `Login.jsx` | Public | Sign in/sign up page | Firebase Auth (write) |
| `/create` | `CreateWedding.jsx` | Protected | Create new wedding | Firestore `weddings` (write) |
| `/dashboard/:weddingId?` | `Dashboard.jsx` | Protected | Wedding dashboard with stats | Firestore `weddings`, `events`, `rsvps`, `gallery` (read) |
| `/dashboard/:weddingId/events` | `EventsManagement.jsx` | Protected | Manage events (CRUD) | Firestore `events` (read/write/delete) |
| `/dashboard/:weddingId/contacts` | `ContactsManagement.jsx` | Protected | Manage collaborators and view guests | Firestore `weddings`, `rsvps` (read/write) |
| `/dashboard/:weddingId/invite` | `InviteGuests.jsx` | Protected | Send email/SMS invitations | Firestore `invitations` (read/write), EmailJS (write) |
| `/w/:slug` | `WeddingWebsite.jsx` | Public | Public wedding website | Firestore `weddings`, `events` (read) |
| `/invite/:slug` | `InvitePreview.jsx` | Public | Digital invite preview | Firestore `weddings` (read) |
| `/event/:eventId` | `EventDetails.jsx` | Public | Event details with RSVP form | Firestore `events`, `rsvps` (read/write) |
| `/gallery/:weddingId` | `Gallery.jsx` | Public | Photo/video gallery | Firestore `gallery` (read), Firebase Storage (read/write) |
| `/find-my-photos/:weddingId` | `FindMyPhotos.jsx` | Public | AI face recognition (placeholder) | Firestore `gallery` (read) |

### Detailed Route Breakdown

#### `/` - Home Page
- **Access:** Public (anyone)
- **What It Does:**
  - Displays OneKnot branding and tagline
  - Shows feature highlights (Digital Invites, RSVP & Events, Shared Gallery)
  - "Get Started" button if not logged in
  - "Dashboard" link if logged in
- **Data:** None (static content)
- **Navigation:** Links to `/login` or `/dashboard`

#### `/login` - Authentication Page
- **Access:** Public
- **What It Does:**
  - Email/password sign-up form
  - Email/password sign-in form
  - Google Sign-In button (redirect method)
  - Toggle between sign-up and sign-in modes
  - Error message display
- **Data:** 
  - Reads: None
  - Writes: Firebase Auth (creates/authenticates user)
- **Navigation:** Redirects to `/create` on success

#### `/create` - Create Wedding
- **Access:** Protected (redirects to `/login` if not authenticated)
- **What It Does:**
  - Form to create new wedding:
    - Partner 1 name (required)
    - Partner 2 name (required)
    - Wedding date (required)
    - City (required)
    - Theme selection (6 options)
    - Custom slug input (optional, with generate button)
  - Validates required fields client-side
  - Generates slug if not provided
- **Data:**
  - Reads: `currentUser` from `AuthContext`
  - Writes: Firestore `weddings` collection (new document)
- **Navigation:** Redirects to `/dashboard/:weddingId` on success

#### `/dashboard/:weddingId?` - Dashboard
- **Access:** Protected
- **What It Does:**
  - Shows wedding selector if user has multiple weddings
  - Displays wedding header (names, date, city)
  - Shows stats cards:
    - Guest count (unique emails from RSVPs)
    - RSVP count (total RSVP documents)
    - Event count
    - Gallery count
  - Quick action cards (Invite Guests, Manage Events, Contacts, Gallery)
  - Links to public website and invite
- **Data:**
  - Reads: 
    - Firestore `weddings` (user's weddings)
    - Firestore `events` (filtered by `weddingId`)
    - Firestore `rsvps` (filtered by `weddingId`)
    - Firestore `gallery` (filtered by `weddingId`)
  - Writes: None
- **Navigation:** Links to various dashboard sub-pages

#### `/dashboard/:weddingId/events` - Events Management
- **Access:** Protected
- **What It Does:**
  - Lists all events for wedding (sorted by date)
  - Add event form (inline, toggles on button click)
  - Edit event (pre-fills form with existing data)
  - Delete event (with confirmation dialog)
  - View event button (opens `/event/:eventId` in new tab)
- **Data:**
  - Reads: Firestore `events` (filtered by `weddingId`)
  - Writes: Firestore `events` (create, update, delete)
- **Navigation:** Back to dashboard

#### `/dashboard/:weddingId/contacts` - Contacts Management
- **Access:** Protected
- **What It Does:**
  - **Collaborators Section:**
    - Lists collaborators from `wedding.collaborators` array
    - Add collaborator form (email, name, role: viewer/admin)
    - Edit role dropdown
    - Delete collaborator (except owner)
  - **Guests Section:**
    - Lists unique guests from RSVPs (by email)
    - Shows guest name, email, RSVP count
    - Read-only (no edit/delete)
- **Data:**
  - Reads: Firestore `weddings`, `rsvps` (filtered by `weddingId`)
  - Writes: Firestore `weddings` (updates `collaborators` array)
- **Navigation:** Back to dashboard

#### `/dashboard/:weddingId/invite` - Invite Guests
- **Access:** Protected
- **What It Does:**
  - Single invite form (name, email, phone, send email/SMS checkboxes)
  - Bulk invite textarea (one email/phone per line)
  - Sent invitations list (shows email/SMS status)
  - Sends email via EmailJS (if configured)
  - SMS sending (placeholder, not functional)
- **Data:**
  - Reads: Firestore `invitations` (filtered by `weddingId`)
  - Writes: 
    - Firestore `invitations` (creates invitation record)
    - EmailJS API (sends email)
- **Navigation:** Back to dashboard

#### `/w/:slug` - Public Wedding Website
- **Access:** Public (anyone with link)
- **What It Does:**
  - Hero section with couple names, date, city
  - Story section (from `wedding.story` or default message)
  - Events timeline (sorted by date, shows all event details)
  - RSVP section (links to first event)
  - Gallery preview (links to full gallery)
  - Footer with OneKnot branding
  - Theme-based styling (6 themes)
- **Data:**
  - Reads: 
    - Firestore `weddings` (by slug)
    - Firestore `events` (filtered by `weddingId`, ordered by date)
  - Writes: None
- **Navigation:** Links to events, gallery, RSVP

#### `/invite/:slug` - Digital Invite Preview
- **Access:** Public
- **What It Does:**
  - Displays beautiful invite card design
  - Shows couple names, formatted date, city
  - "View Wedding Website" button
  - Share buttons:
    - WhatsApp share (opens WhatsApp with pre-filled message)
    - Copy link (copies invite URL to clipboard)
  - Displays invite URL
- **Data:**
  - Reads: Firestore `weddings` (by slug)
  - Writes: None
- **Navigation:** Links to `/w/:slug`

#### `/event/:eventId` - Event Details & RSVP
- **Access:** Public (guests can RSVP without login)
- **What It Does:**
  - Displays full event information:
    - Event name
    - Date (formatted)
    - Time (if provided)
    - Location name and address
    - Google Maps link (if address provided)
    - Dress code (if provided)
    - Description (if provided)
  - RSVP form:
    - Guest name (required)
    - Guest email (required)
    - Plus-one checkbox
    - Yes/Maybe/No buttons
  - Shows RSVP confirmation if already submitted
  - Checks for existing RSVP using `localStorage` guest ID
- **Data:**
  - Reads: 
    - Firestore `events` (by `eventId`)
    - Firestore `rsvps` (by `eventId` and `guestId` from localStorage)
  - Writes: Firestore `rsvps` (creates RSVP document)
- **Navigation:** None (standalone page)

#### `/gallery/:weddingId` - Photo Gallery
- **Access:** Public (anyone with link)
- **What It Does:**
  - Upload section (file input, upload button)
  - Gallery grid (2 cols mobile, 3 tablet, 4 desktop)
  - Displays photos (`<img>`) and videos (`<video>`)
  - Like button on hover (increments counter)
  - Empty state if no photos
- **Data:**
  - Reads: 
    - Firestore `gallery` (filtered by `weddingId`)
    - Firebase Storage (download URLs)
  - Writes: 
    - Firebase Storage (uploads files)
    - Firestore `gallery` (creates metadata, updates likes)
- **Navigation:** Link back to wedding website

#### `/find-my-photos/:weddingId` - AI Photo Finder (Placeholder)
- **Access:** Public
- **What It Does:**
  - Upload selfie interface (circular dashed border)
  - Loading state (2-second mock delay)
  - Displays "matched" photos (returns first 10 photos as mock)
  - "No photos found" empty state
  - Developer note (yellow warning box)
- **Data:**
  - Reads: Firestore `gallery` (filtered by `weddingId`)
  - Writes: None (selfie not stored)
- **Status:** ⚠️ **COMPLETELY MOCKED** - No AI implementation
- **Navigation:** Link to gallery

---

## 5. Authentication System

### Auth Methods Implemented

**1. Email/Password Authentication**
- **Sign Up:** `createUserWithEmailAndPassword()` in `AuthContext.jsx`
  - Requires email and password (minimum 6 characters)
  - Creates new Firebase Auth user
  - No email verification
  - No password strength requirements beyond length

- **Sign In:** `signInWithEmailAndPassword()` in `AuthContext.jsx`
  - Authenticates existing user
  - Error handling displays messages in UI

- **Password Reset:** ❌ **NOT IMPLEMENTED**
  - No "Forgot Password" link
  - No password reset flow
  - Users must remember password or create new account

**2. Google Sign-In**
- **Method:** `signInWithRedirect()` (NOT popup)
  - Uses redirect to avoid COOP (Cross-Origin-Opener-Policy) issues
  - User leaves app temporarily during authentication
  - Redirects back to app after Google authentication
  - `getRedirectResult()` checks for redirect result on app mount

- **Provider:** `GoogleAuthProvider` from Firebase Auth
- **No Popup Method:** Popup method not used (would be blocked by browsers)

### Guest vs Logged-In Behavior

**Guests (Not Authenticated):**
- ✅ Can view public wedding website (`/w/:slug`)
- ✅ Can view digital invite (`/invite/:slug`)
- ✅ Can view event details (`/event/:eventId`)
- ✅ Can submit RSVP (name, email, plus-one)
- ✅ Can view gallery (`/gallery/:weddingId`)
- ✅ Can upload photos to gallery (⚠️ **SECURITY RISK**)
- ✅ Can use "Find My Photos" (placeholder UI)
- ❌ Cannot create weddings
- ❌ Cannot access dashboard
- ❌ Cannot manage events
- ❌ Cannot send invitations

**Logged-In Users:**
- ✅ All guest capabilities
- ✅ Can create weddings
- ✅ Can access dashboard
- ✅ Can manage events (create, edit, delete)
- ✅ Can manage collaborators
- ✅ Can send invitations
- ✅ Can view sent invitations list
- ⚠️ Can access ANY wedding dashboard (no ownership check)
- ⚠️ Can create events for ANY wedding (no permission check)

### Protected Routes

**Implementation:** `src/components/ProtectedRoute.jsx`

```javascript
export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return children
}
```

**Protected Routes:**
- `/create` - Wedding creation
- `/dashboard/:weddingId?` - Dashboard
- `/dashboard/:weddingId/events` - Events management
- `/dashboard/:weddingId/contacts` - Contacts management
- `/dashboard/:weddingId/invite` - Invite guests

**Limitations:**
- ⚠️ **No Role-Based Access Control** - Any authenticated user can access any protected route
- ⚠️ **No Wedding Ownership Check** - Can access any wedding ID if you know it
- ⚠️ **No Collaborator Permission Check** - Collaborators can't access even if added
- ⚠️ **No Guest-Specific Routes** - All public routes accessible to everyone

### Current Limitations

1. **No Email Verification**
   - Users can sign up with fake emails
   - No email confirmation required
   - No way to verify email ownership

2. **No Password Reset**
   - Users who forget password must create new account
   - No recovery mechanism

3. **No Account Management**
   - No profile page
   - No way to change email
   - No way to change password
   - No account deletion

4. **No Session Management**
   - Sessions persist until explicit logout
   - No "Remember Me" option
   - No session timeout
   - No multi-device session sync

5. **Google Redirect UX**
   - User leaves app during sign-in
   - Can be confusing
   - No loading indicator during redirect

6. **No Social Auth Beyond Google**
   - Only Google and email/password
   - No Facebook, Apple, etc.

---

## 6. Core Data Models (As Implemented)

### Wedding

**Collection:** `weddings` in Firestore

**Document Structure:**
```javascript
{
  id: "firestore-document-id",           // Auto-generated document ID
  partner1Name: "Alex",                  // String, required
  partner2Name: "Sam",                   // String, required
  weddingDate: Timestamp,                // Firestore Timestamp (from date input)
  city: "New York",                      // String, required
  theme: "modern",                       // String: "classic"|"modern"|"rustic"|"beach"|"garden"|"minimal"
  slug: "alex-sam-123456",               // String, lowercase, alphanumeric + hyphens
  ownerId: "firebase-user-uid",          // String, Firebase Auth UID
  createdAt: Timestamp,                  // Firestore serverTimestamp()
  updatedAt: Timestamp,                  // Firestore serverTimestamp() (on updates)
  collaborators: [                        // Array of collaborator objects
    {
      userId: "firebase-user-uid" | null, // String or null (null if not yet accepted)
      email: "collab@example.com",        // String
      name: "John Doe",                   // String
      role: "owner" | "admin" | "viewer", // String
      invitedAt: Date                    // JavaScript Date (not Firestore Timestamp)
    }
  ],
  story: "Optional story text"           // String, optional (not in create form)
}
```

**Fields Used:**
- `partner1Name`, `partner2Name` - Couple names (from create form)
- `weddingDate` - Wedding date (converted to Firestore Timestamp)
- `city` - Wedding city
- `theme` - Selected theme ID
- `slug` - URL slug (user-provided or auto-generated)
- `ownerId` - Creator's Firebase Auth UID
- `createdAt` - Server timestamp on creation
- `updatedAt` - Server timestamp on updates
- `collaborators` - Array (initialized with owner, can be extended)
- `story` - Optional (can be added via `updateWedding()` but no UI)

**Known Issues:**
- ⚠️ **No Slug Uniqueness Validation** - Multiple weddings can have same slug
- ⚠️ **No Field Length Limits** - Names, city, slug can be extremely long
- ⚠️ **No Date Validation** - Can create wedding with past date
- ⚠️ **Collaborator `invitedAt` is Date, not Timestamp** - Inconsistent with other timestamps
- ⚠️ **No Slug Editing** - Once created, slug cannot be changed

### Event

**Collection:** `events` in Firestore

**Document Structure:**
```javascript
{
  id: "firestore-document-id",           // Auto-generated document ID
  weddingId: "wedding-document-id",      // String, required (references wedding)
  name: "Ceremony",                      // String, required
  description: "Wedding ceremony...",   // String, optional
  date: Timestamp,                       // Firestore Timestamp, required
  time: "4:00 PM",                       // String, optional
  location: "Venue Name",                // String, optional
  locationAddress: "123 Main St...",     // String, optional (for Google Maps)
  dressCode: "Formal",                   // String, optional
  createdAt: Timestamp,                  // Firestore serverTimestamp()
  updatedAt: Timestamp                   // Firestore serverTimestamp()
}
```

**Fields Used:**
- `weddingId` - References wedding document ID
- `name` - Event name (required)
- `description` - Event description (optional)
- `date` - Event date (converted to Firestore Timestamp)
- `time` - Event time as string (optional, format: "4:00 PM")
- `location` - Location name (optional)
- `locationAddress` - Full address for Google Maps (optional)
- `dressCode` - Dress code (optional, dropdown: Formal, Semi-Formal, Casual, Black Tie, Cocktail, Beach Casual)
- `createdAt`, `updatedAt` - Server timestamps

**Known Issues:**
- ⚠️ **No Validation** - Can create event with `weddingId` pointing to non-existent wedding
- ⚠️ **No Cascading Delete** - Deleting event doesn't delete associated RSVPs
- ⚠️ **Time Format Inconsistent** - Stored as string, no validation
- ⚠️ **No Event Ordering** - Sorted by date only, can't manually order
- ⚠️ **No Event Images** - Can't add cover image to event

### RSVP

**Collection:** `rsvps` in Firestore

**Document Structure:**
```javascript
{
  id: "firestore-document-id",           // Auto-generated document ID
  eventId: "event-document-id",         // String, required (references event)
  weddingId: "wedding-document-id",     // String, required (references wedding)
  guestName: "John Doe",                 // String, required
  guestEmail: "john@example.com",        // String, required
  plusOne: true,                         // Boolean, optional
  status: "yes" | "maybe" | "no",        // String, required
  guestId: "guest_1234567890",           // String (from localStorage)
  submittedAt: Date                     // JavaScript Date (not Firestore Timestamp)
}
```

**Fields Used:**
- `eventId` - References event document ID
- `weddingId` - References wedding document ID
- `guestName` - Guest's name (required)
- `guestEmail` - Guest's email (required)
- `plusOne` - Boolean indicating if bringing plus-one
- `status` - RSVP status (yes/maybe/no)
- `guestId` - Generated from localStorage (for duplicate detection)
- `submittedAt` - JavaScript Date (not Firestore Timestamp)

**Known Issues:**
- ⚠️ **No Email Validation** - Basic HTML5 validation only
- ⚠️ **No Duplicate Prevention** - Same email can RSVP multiple times
- ⚠️ **Guest ID from localStorage** - Not secure, can be manipulated
- ⚠️ **No Plus-One Name** - Doesn't collect plus-one's name
- ⚠️ **No Update Flow** - Can't change RSVP after submission (no UI)
- ⚠️ **submittedAt is Date, not Timestamp** - Inconsistent with other timestamps
- ⚠️ **No Validation** - Can create RSVP for non-existent event

### Gallery Item

**Collection:** `gallery` in Firestore

**Document Structure:**
```javascript
{
  id: "firestore-document-id",           // Auto-generated document ID
  weddingId: "wedding-document-id",      // String, required (references wedding)
  url: "https://storage.googleapis.com/...", // String, Firebase Storage download URL
  fileName: "photo.jpg",                 // String, original filename
  uploadedAt: Date,                      // JavaScript Date (not Firestore Timestamp)
  likes: 0,                              // Number, incremented on like
  type: "photo" | "video"                // String, detected from file.type
}
```

**Storage Path:** `weddings/{weddingId}/{timestamp}_{filename}` in Firebase Storage

**Fields Used:**
- `weddingId` - References wedding document ID
- `url` - Firebase Storage download URL
- `fileName` - Original filename
- `uploadedAt` - JavaScript Date (not Firestore Timestamp)
- `likes` - Number of likes (incremented with Firestore `increment()`)
- `type` - "photo" or "video" (detected from `file.type`)

**Known Issues:**
- ⚠️ **No Image Optimization** - Original file size uploaded
- ⚠️ **No Thumbnail Generation** - Full-size images loaded
- ⚠️ **No File Type Validation** - Only HTML5 `accept` attribute
- ⚠️ **No Size Limits** - Can upload very large files
- ⚠️ **No Uploader Tracking** - Can't see who uploaded photo
- ⚠️ **No Photo Deletion** - No way to delete photos
- ⚠️ **uploadedAt is Date, not Timestamp** - Inconsistent with other timestamps
- ⚠️ **No Album Organization** - All photos in one gallery

### User / Collaborator

**User (Firebase Auth):**
- Stored in Firebase Authentication (not Firestore)
- Fields: `uid`, `email`, `displayName`, `photoURL` (if Google sign-in)
- No custom user document in Firestore
- No profile page or user settings

**Collaborator (in Wedding Document):**
- Stored in `wedding.collaborators` array
- Structure:
  ```javascript
  {
    userId: "firebase-user-uid" | null,  // null if not yet accepted invitation
    email: "collab@example.com",         // String
    name: "John Doe",                     // String
    role: "owner" | "admin" | "viewer",   // String
    invitedAt: Date                       // JavaScript Date
  }
  ```

**Known Issues:**
- ⚠️ **No Invitation Flow** - Collaborators added but no email sent
- ⚠️ **No Acceptance Flow** - `userId` remains null
- ⚠️ **No Permission Enforcement** - Roles don't affect access
- ⚠️ **No Email Verification** - Can add fake email addresses
- ⚠️ **invitedAt is Date, not Timestamp** - Inconsistent

---

## 7. Feature-by-Feature Breakdown

### 7.1 Wedding Creation

**Location:** `src/pages/CreateWedding.jsx`

**What Exists:**
- Form with 6 input fields:
  - Partner 1 Name (text, required)
  - Partner 2 Name (text, required)
  - Wedding Date (date picker, required)
  - City (text, required)
  - Theme (6 visual theme buttons: classic, modern, rustic, beach, garden, minimal)
  - Slug (text, optional, with "Generate" button)
- Auto-generate slug button (format: `name1-name2-timestamp`)
- Slug format validation (lowercase, alphanumeric, hyphens only)
- Cancel and Create buttons

**What Works End-to-End:**
- ✅ Form submission creates wedding document in Firestore
- ✅ Wedding document includes all form fields
- ✅ `ownerId` automatically set to current user's UID
- ✅ Initial collaborator (owner) added to `collaborators` array
- ✅ Redirects to dashboard on success
- ✅ Error handling with alert on failure

**What Is Partial:**
- ⚠️ Slug generation works but no uniqueness check
- ⚠️ Theme selection works but no preview of how it looks
- ⚠️ Form validation is client-side only (HTML5 required attributes)

**What Is Missing:**
- ❌ No slug uniqueness validation (can create duplicate slugs)
- ❌ No field length limits (names, city can be extremely long)
- ❌ No date validation (can create wedding with past date)
- ❌ No wedding story/description field in form
- ❌ No cover image upload
- ❌ No preview before creating
- ❌ No way to edit wedding after creation (function exists, no UI)
- ❌ No way to delete wedding (no UI)

### 7.2 Dashboard

**Location:** `src/pages/Dashboard.jsx`

**What Exists:**
- Wedding selector dropdown (if user has multiple weddings)
- Wedding header (couple names, date, city)
- Links to public website and invite preview
- Four stat cards:
  - Guest count (unique emails from RSVPs)
  - RSVP count (total RSVP documents)
  - Event count (events with matching `weddingId`)
  - Gallery count (gallery items with matching `weddingId`)
- Four quick action cards:
  - Invite Guests
  - Manage Events
  - Contacts & People
  - Gallery
- "New Wedding" button
- Logout button

**What Works End-to-End:**
- ✅ Loads user's weddings on mount
- ✅ Displays selected wedding information
- ✅ Calculates real stats from Firestore queries
- ✅ Links to all dashboard sub-pages
- ✅ Links to public website and invite

**What Is Partial:**
- ⚠️ Stats are real but not live (requires page refresh)
- ⚠️ Wedding selection works but no visual indication of which is selected
- ⚠️ Empty state exists but no helpful guidance

**What Is Missing:**
- ❌ No ownership verification (can access any wedding ID if you know it)
- ❌ No permission checking (doesn't check if user is collaborator)
- ❌ No real-time updates (stats don't update automatically)
- ❌ No wedding settings/edit page
- ❌ No delete wedding option
- ❌ No export data (guest list, RSVPs, etc.)
- ❌ No analytics charts or graphs
- ❌ No recent activity feed

### 7.3 Public Wedding Website

**Location:** `src/pages/WeddingWebsite.jsx`

**What Exists:**
- Hero section with couple names, formatted date, city
- Story section (displays `wedding.story` or default message)
- Events timeline (sorted by date, shows all events)
- RSVP section (links to first event)
- Gallery preview (link to full gallery)
- Footer with OneKnot branding
- Theme-based styling (6 themes with different colors)

**What Works End-to-End:**
- ✅ Loads wedding by slug from Firestore
- ✅ Displays all wedding information
- ✅ Loads and displays events (sorted by date)
- ✅ Theme styling applies correctly
- ✅ Links to events, gallery work
- ✅ Error handling (shows "Wedding not found" if slug doesn't exist)

**What Is Partial:**
- ⚠️ Story section works but no way to add/edit story (no UI)
- ⚠️ Events display but no event images
- ⚠️ Gallery preview is just a link (no thumbnails)

**What Is Missing:**
- ❌ No cover image in hero section
- ❌ No photo gallery preview (thumbnails)
- ❌ No map integration (location is text only)
- ❌ No countdown timer
- ❌ No accommodations section
- ❌ No registry/gifts section
- ❌ No FAQ section
- ❌ No contact information
- ❌ No social media links
- ❌ No mobile menu optimization
- ❌ No print styles

### 7.4 Digital Invites

**Location:** `src/pages/InvitePreview.jsx`

**What Exists:**
- Beautiful invite card design
- Displays couple names, formatted date, city
- "View Wedding Website" button
- Share buttons:
  - WhatsApp share (opens WhatsApp with pre-filled message)
  - Copy link (copies invite URL to clipboard, shows "Copied!" confirmation)
- Displays invite URL in text box

**What Works End-to-End:**
- ✅ Loads wedding by slug
- ✅ Displays all wedding information
- ✅ WhatsApp share works (opens WhatsApp with message)
- ✅ Copy link works (copies to clipboard)
- ✅ Links to wedding website work

**What Is Partial:**
- ⚠️ Invite design is static (same for all weddings)
- ⚠️ Share functionality works but limited (only WhatsApp and copy)

**What Is Missing:**
- ❌ No custom invite design
- ❌ No RSVP link in invite (must go to website)
- ❌ No event-specific invites
- ❌ No printable version
- ❌ No email share (mailto: link)
- ❌ No social media share buttons (Facebook, Twitter, Instagram)
- ❌ No QR code generation
- ❌ No invite customization (can't add custom message or image)

### 7.5 Events

**Location:** `src/pages/EventsManagement.jsx` (management) and `src/pages/EventDetails.jsx` (public view)

**What Exists:**
- **Management Page:**
  - List of all events (sorted by date)
  - Add event form (inline, toggles on button click)
  - Edit event (pre-fills form with existing data)
  - Delete event (with confirmation dialog)
  - View event button (opens event details in new tab)
- **Event Details Page:**
  - Full event information display
  - Google Maps link (if address provided)
  - RSVP form (see Section 7.6)

**What Works End-to-End:**
- ✅ Create event (saves to Firestore)
- ✅ Read events (loads from Firestore, sorted by date)
- ✅ Update event (updates Firestore document)
- ✅ Delete event (deletes Firestore document)
- ✅ Event details page displays all information
- ✅ Google Maps link works (opens in new tab)

**What Is Partial:**
- ⚠️ Event form validation is client-side only
- ⚠️ Date conversion works but inconsistent (Timestamp vs Date)
- ⚠️ Time stored as string (no validation)

**What Is Missing:**
- ❌ No event images
- ❌ No event capacity/guest limits
- ❌ No event categories
- ❌ No recurring events
- ❌ No event templates
- ❌ No manual event ordering
- ❌ No event visibility toggle
- ❌ No RSVP deadline
- ❌ No event reminders
- ❌ No event analytics
- ❌ No cascading delete (RSVPs remain if event deleted)

### 7.6 RSVP System

**Location:** `src/pages/EventDetails.jsx`

**What Exists:**
- RSVP form on event details page:
  - Guest name input (required)
  - Guest email input (required)
  - Plus-one checkbox
  - Yes/Maybe/No buttons
- Checks for existing RSVP using `localStorage` guest ID
- Shows RSVP confirmation if already submitted
- Saves RSVP to Firestore `rsvps` collection

**What Works End-to-End:**
- ✅ Guest can RSVP without creating account
- ✅ RSVP saves to Firestore with all fields
- ✅ Confirmation message shows after submission
- ✅ Existing RSVP detection works (via localStorage)
- ✅ Can see RSVP status if already submitted

**What Is Partial:**
- ⚠️ Guest identification uses localStorage (not secure)
- ⚠️ Duplicate detection only works on same device/browser
- ⚠️ Plus-one checkbox exists but doesn't collect plus-one's name

**What Is Missing:**
- ❌ No RSVP confirmation email
- ❌ No RSVP reminder emails
- ❌ No dietary restrictions field
- ❌ No song requests field
- ❌ No guest comments field
- ❌ No RSVP export (CSV/Excel)
- ❌ No RSVP analytics/charts
- ❌ No filter RSVPs by status
- ❌ No update RSVP after submission (no UI)
- ❌ No email-based duplicate prevention
- ❌ No RSVP deadline enforcement
- ❌ No plus-one name collection

### 7.7 Gallery

**Location:** `src/pages/Gallery.jsx`

**What Exists:**
- Upload section (file input, upload button)
- Gallery grid (2 columns mobile, 3 tablet, 4 desktop)
- Displays photos (`<img>`) and videos (`<video>`)
- Like button on hover (increments counter)
- Empty state if no photos
- Framer Motion animations on load

**What Works End-to-End:**
- ✅ File upload to Firebase Storage
- ✅ Metadata saved to Firestore
- ✅ Gallery displays all photos/videos
- ✅ Like functionality works (increments counter in Firestore)
- ✅ Photos and videos display correctly
- ✅ Empty state shows when no photos

**What Is Partial:**
- ⚠️ Upload works but no progress indicator
- ⚠️ Like works but no user tracking (can like multiple times)
- ⚠️ Gallery loads all photos at once (no pagination)

**What Is Missing:**
- ❌ No image optimization (original file size)
- ❌ No thumbnail generation
- ❌ No photo albums (all photos in one gallery)
- ❌ No photo captions
- ❌ No photo tags
- ❌ No photo deletion
- ❌ No photo moderation
- ❌ No photo download
- ❌ No photo slideshow
- ❌ No photo sharing
- ❌ No upload progress bar
- ❌ No multiple file upload
- ❌ No upload permissions (anyone can upload)
- ❌ No file type validation beyond HTML5
- ❌ No file size limits

### 7.8 Find My Photos (AI Placeholder)

**Location:** `src/pages/FindMyPhotos.jsx`

**What Exists:**
- Upload selfie interface (circular dashed border)
- Loading state (spinner + "Finding your photos..." message)
- Results display (grid of "matched" photos)
- "No photos found" empty state
- "Upload different photo" button
- Developer note (yellow warning box explaining it's a placeholder)

**What Works End-to-End:**
- ✅ UI flow works (upload → loading → results)
- ✅ Selfie upload works (file selection)
- ✅ Loading state displays
- ✅ Results display (shows photos)

**What Is Partial:**
- ⚠️ Everything is mocked - no real AI

**What Is Missing:**
- ❌ **NO AI IMPLEMENTATION** - Completely fake
- ❌ No face recognition service (AWS Rekognition, Google Vision, etc.)
- ❌ No backend API endpoint
- ❌ No face detection
- ❌ No face matching
- ❌ No privacy handling (selfie not deleted after processing)
- ❌ Currently returns first 10 photos as "matched" (hardcoded)

**Current Behavior:**
- User uploads selfie → Shows 2-second loading → Returns first 10 gallery photos → Displays as "matched photos"
- **This is completely fake and should not be used in production.**

### 7.9 Collaboration & Roles

**Location:** `src/pages/ContactsManagement.jsx`

**What Exists:**
- **Collaborators Section:**
  - List of collaborators from `wedding.collaborators` array
  - Add collaborator form (email, name, role: viewer/admin)
  - Edit role dropdown (viewer/admin)
  - Delete collaborator button (except owner)
  - Owner badge (cannot be removed)
- **Guests Section:**
  - List of unique guests from RSVPs (by email)
  - Shows guest name, email, RSVP count
  - Read-only display

**What Works End-to-End:**
- ✅ Add collaborator (saves to `wedding.collaborators` array)
- ✅ List collaborators (displays from array)
- ✅ Edit role (updates role in array)
- ✅ Delete collaborator (removes from array)
- ✅ Owner protection (cannot delete owner)
- ✅ List guests (extracts from RSVPs)

**What Is Partial:**
- ⚠️ Data structure exists but permissions not enforced
- ⚠️ Roles exist but don't affect access

**What Is Missing:**
- ❌ **No Invitation System** - Collaborators added but no email sent
- ❌ **No Acceptance Flow** - `userId` remains null (no way to accept)
- ❌ **No Permission Enforcement** - Roles don't affect dashboard access
- ❌ **No Email Verification** - Can add fake email addresses
- ❌ **No Collaborator Notifications** - No email when added or role changes
- ❌ **No Access Control** - Collaborators can't access dashboard even if added
- ❌ **No Activity Tracking** - Can't see when collaborator last accessed

---

## 8. State Management

### Contexts Used

**1. AuthContext (`src/contexts/AuthContext.jsx`)**

**Global State:**
- `currentUser` - Firebase User object or `null`
- `loading` - Boolean, `true` while auth state initializing

**Methods Provided:**
- `signInWithGoogle()` - Initiates Google sign-in redirect
- `signUp(email, password)` - Creates new account
- `login(email, password)` - Signs in existing user
- `logout()` - Signs out current user

**Persistence:**
- Firebase Auth handles persistence (localStorage/sessionStorage)
- `onAuthStateChanged` listener updates state on auth changes
- State persists across page refreshes

**2. WeddingContext (`src/contexts/WeddingContext.jsx`)**

**Global State:**
- `weddings` - Array of user's weddings
- `currentWedding` - Currently selected wedding object or `null`
- `loading` - Boolean (not consistently used)

**Methods Provided:**
- `createWedding(weddingData)` - Creates new wedding
- `getWeddingBySlug(slug)` - Gets wedding by slug (public)
- `getWeddingById(weddingId)` - Gets wedding by ID
- `getUserWeddings()` - Loads all weddings for current user
- `updateWedding(weddingId, updates)` - Updates wedding document
- `setCurrentWedding(wedding)` - Sets current wedding (manual)

**Persistence:**
- Data stored in Firestore, loaded on mount
- `getUserWeddings()` called when `currentUser` changes
- State does NOT persist across refreshes (reloaded from Firestore)

### What Global State Exists

**Authentication State:**
- Current user (Firebase User object)
- Auth loading state

**Wedding State:**
- List of user's weddings
- Currently selected wedding

**No Global State For:**
- Events (loaded per-page)
- RSVPs (loaded per-page)
- Gallery (loaded per-page)
- Invitations (loaded per-page)
- UI state (modals, forms, etc.) - all local component state

### Where State Is Fragile or Duplicated

**Fragile State:**

1. **WeddingContext State Not Cleared on Logout**
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

**Duplicated State:**

1. **Wedding Data**
   - Loaded in `WeddingContext` (user's weddings)
   - Also loaded per-page (e.g., `Dashboard.jsx` loads selected wedding)
   - Could be out of sync

2. **Event Data**
   - Loaded in `EventsManagement.jsx`
   - Also loaded in `WeddingWebsite.jsx`
   - Also loaded in `EventDetails.jsx`
   - No shared state

3. **RSVP Data**
   - Loaded in `EventDetails.jsx`
   - Also loaded in `Dashboard.jsx` (for stats)
   - Also loaded in `ContactsManagement.jsx` (for guest list)
   - No shared state

---

## 9. Firebase Usage

### Auth Usage

**Services Used:**
- Firebase Authentication
- Email/Password provider
- Google Sign-In provider (redirect method)

**What Works:**
- ✅ User sign-up (email/password)
- ✅ User sign-in (email/password)
- ✅ Google sign-in (redirect)
- ✅ Sign-out
- ✅ Auth state persistence
- ✅ Auth state listener (`onAuthStateChanged`)

**What Doesn't Work:**
- ❌ Email verification (not implemented)
- ❌ Password reset (not implemented)
- ❌ Account deletion (not implemented)

**Security:**
- ⚠️ No email verification required
- ⚠️ No password strength requirements beyond length
- ⚠️ No rate limiting on auth attempts

### Firestore Usage

**Collections Used:**
- `weddings` - Wedding documents
- `events` - Event documents
- `rsvps` - RSVP responses
- `gallery` - Photo/video metadata
- `invitations` - Sent invitation records

**Query Patterns:**
- `getDocs()` with `where()` clauses (not real-time listeners)
- `getDoc()` for single documents
- `addDoc()` for creating documents
- `updateDoc()` for updating documents
- `deleteDoc()` for deleting documents
- `increment()` for like counter

**What Works:**
- ✅ CRUD operations on all collections
- ✅ Queries with filters (by `weddingId`, `eventId`, etc.)
- ✅ Server timestamps (`serverTimestamp()`)
- ✅ Field increments (`increment()`)

**What Doesn't Work:**
- ❌ No real-time listeners (`onSnapshot`) - data doesn't update automatically
- ❌ No transactions (slug uniqueness not guaranteed)
- ❌ No batch operations
- ❌ No subcollections (flat structure)

**Security Rules (Current State):**

**⚠️ CRITICAL ISSUES:**

1. **Weddings Collection:**
   ```javascript
   allow read: if true;  // ⚠️ PUBLIC READ - Anyone can read any wedding
   allow create: if request.auth != null && 
                   request.resource.data.ownerId == request.auth.uid;  // ✅ OK
   allow update: if request.auth != null && 
                   resource.data.ownerId == request.auth.uid;  // ✅ OK
   ```

2. **Events Collection:**
   ```javascript
   allow read: if true;  // ⚠️ PUBLIC READ
   allow create: if request.auth != null;  // ⚠️ ANY USER CAN CREATE
   allow update: if request.auth != null;  // ⚠️ ANY USER CAN UPDATE
   allow delete: if request.auth != null;  // ⚠️ ANY USER CAN DELETE
   ```

3. **RSVPs Collection:**
   ```javascript
   allow read: if request.auth != null;  // ⚠️ ANY AUTHENTICATED USER
   allow create: if true;  // ⚠️ PUBLIC CREATE - Anyone can create RSVPs
   allow update: if true;  // ⚠️ PUBLIC UPDATE - Anyone can update any RSVP
   ```

4. **Gallery Collection:**
   ```javascript
   allow read: if true;  // ⚠️ PUBLIC READ
   allow create: if request.auth != null;  // ⚠️ ANY USER CAN CREATE
   allow update: if request.auth != null;  // ⚠️ ANY USER CAN UPDATE
   ```

5. **Invitations Collection:**
   ```javascript
   allow read: if request.auth != null;  // ⚠️ ANY AUTHENTICATED USER
   allow create: if request.auth != null;  // ✅ OK (but should check ownership)
   ```

### Storage Usage

**Storage Paths:**
- `weddings/{weddingId}/{timestamp}_{filename}`

**Operations:**
- `uploadBytes()` - Upload files
- `getDownloadURL()` - Get download URLs

**What Works:**
- ✅ File upload to Storage
- ✅ Download URL retrieval
- ✅ File display in gallery

**What Doesn't Work:**
- ❌ No image optimization
- ❌ No thumbnail generation
- ❌ No file type validation (beyond HTML5)
- ❌ No size limits enforced
- ❌ No virus scanning

**Security Rules (Current State):**

```javascript
allow read: if true;  // ⚠️ PUBLIC READ - Anyone can read any file
allow write: if request.auth != null && 
                firestore.exists(/databases/(default)/documents/weddings/$(weddingId)) &&
                firestore.get(/databases/(default)/documents/weddings/$(weddingId)).data.ownerId == request.auth.uid;
// ✅ Write check is OK (only owner can write)
```

**⚠️ ISSUE:** Public read means anyone with a URL can access files (privacy risk).

### What Is Currently Unsafe or Incomplete

**Unsafe:**
1. 🔴 **Public Wedding Reads** - Anyone can read any wedding document
2. 🔴 **Public Event Reads** - Anyone can read all events
3. 🔴 **Public Gallery Reads** - Anyone can read all gallery metadata
4. 🔴 **Public Storage Reads** - Anyone can read all uploaded files
5. 🔴 **Any User Can Create Events** - No ownership check
6. 🔴 **Any User Can Update Events** - No ownership check
7. 🔴 **Public RSVP Create/Update** - Anyone can spam RSVPs
8. 🔴 **Any User Can Create Gallery Items** - No ownership check

**Incomplete:**
1. ⚠️ No data validation in rules
2. ⚠️ No rate limiting
3. ⚠️ No field length limits
4. ⚠️ No slug uniqueness enforcement
5. ⚠️ No cascading deletes
6. ⚠️ No audit logging

---

## 10. UX & Product Gaps

### Broken Flows

1. **Google Sign-In Redirect**
   - User leaves app during sign-in
   - No clear indication of what's happening
   - Can be confusing if they don't expect redirect

2. **Wedding Selection**
   - If user has multiple weddings, must use dropdown
   - No clear indication of which wedding is selected
   - Can accidentally work on wrong wedding

3. **RSVP Flow**
   - Guest must find event page to RSVP
   - No direct RSVP link in invite
   - Confusing if multiple events exist

4. **Collaborator Management**
   - Can add collaborator but no way to notify them
   - No clear indication of what collaborators can do
   - Roles exist but don't affect functionality

### Missing Screens

1. **Wedding Settings Page**
   - No page to edit wedding details
   - No way to change theme after creation
   - No way to update slug
   - No way to add/edit story

2. **Profile/Settings Page**
   - No user profile page
   - No account settings
   - No password change
   - No email change

3. **RSVP Management Page**
   - No dedicated page to view all RSVPs
   - No RSVP analytics/charts
   - No export RSVP list
   - No filter RSVPs by status

4. **Gallery Management Page**
   - Basic gallery exists but no management features
   - No photo organization (albums, tags)
   - No photo moderation
   - No bulk delete

5. **Notifications Page**
   - No in-app notifications
   - No notification center
   - No email notification preferences

### Rough Edges

1. **Error Handling**
   - Generic error messages ("Failed to create wedding")
   - No retry mechanisms
   - No offline handling
   - No network error detection

2. **Loading States**
   - Basic spinners only
   - No skeleton screens
   - No progress indicators for uploads
   - No estimated time remaining

3. **Empty States**
   - Some empty states exist (gallery, events)
   - No helpful guidance in empty states
   - No suggested actions

4. **Form Validation**
   - Client-side only (HTML5 required)
   - No server-side validation
   - No helpful error messages
   - No field-level validation feedback

5. **Mobile Responsiveness**
   - Basic responsive design exists
   - Some forms not optimized for mobile
   - Touch targets could be larger
   - No mobile-specific navigation

### Confusing Behavior

1. **Gallery Upload**
   - Upload button exists but no clear indication of who can upload
   - No feedback during upload
   - Can't see upload progress

2. **RSVP Updates**
   - Can't update RSVP after submission
   - Must clear localStorage to re-RSVP
   - No clear indication of how to change RSVP

3. **Collaborator Roles**
   - Roles exist but don't affect access
   - No clear indication of what each role can do
   - Can add collaborator but they can't access anything

4. **Wedding Editing**
   - Function exists (`updateWedding()`) but no UI
   - No way to edit wedding after creation
   - Confusing for users who want to update details

---

## 11. Technical Debt & TODOs

### Temporary Logic

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

### Mock Data

1. **Find My Photos**
   - Completely mocked AI results
   - Returns first 10 photos as "matched"
   - No real face recognition

2. **SMS Sending**
   - Placeholder code only
   - Logs to console but doesn't send
   - Returns `true` to simulate success

### Scalability Issues

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

### Security Risks

1. **Public Reads**
   - Anyone can read any wedding, event, gallery item
   - Privacy risk
   - Data scraping risk

2. **No Ownership Checks**
   - Can access any wedding dashboard if you know ID
   - Can create events for any wedding
   - Can upload photos to any wedding

3. **No Input Validation**
   - Client-side only
   - No server-side validation
   - Can submit malicious data

4. **No Rate Limiting**
   - Can spam create weddings, events, RSVPs
   - DoS risk
   - Cost abuse risk

5. **Guest ID Manipulation**
   - `localStorage` guest ID can be manipulated
   - Can create fake RSVPs
   - No email verification

### TODOs in Code

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
- Fix security rules
- Add input validation server-side

---

## 12. What OneKnot Can and Cannot Do Today

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

## 13. Safe Next Expansion Areas

### Which Features Can Be Added Without Refactoring

**Low-Risk Additions (Can Add Now):**

1. **Wedding Settings Page**
   - Can add new page/route
   - Uses existing `updateWedding()` function
   - No refactoring needed
   - Just need to create UI

2. **RSVP Management Page**
   - Can add new page/route
   - Uses existing Firestore queries
   - Can add filters and export functionality
   - No refactoring needed

3. **Photo Captions**
   - Can add field to gallery documents
   - Can add input field in upload form
   - Can display in gallery
   - No refactoring needed

4. **Event Images**
   - Can add field to event documents
   - Can add upload in event form
   - Can display on event details page
   - No refactoring needed

5. **RSVP Comments**
   - Can add field to RSVP documents
   - Can add textarea in RSVP form
   - Can display in RSVP list
   - No refactoring needed

6. **Dietary Restrictions**
   - Can add field to RSVP documents
   - Can add input in RSVP form
   - Can display in RSVP list
   - No refactoring needed

7. **Gallery Pagination**
   - Can add pagination to existing gallery
   - Uses existing Firestore queries with limits
   - No refactoring needed

8. **Email Templates Customization**
   - Can add fields to wedding documents
   - Can use in EmailJS template
   - No refactoring needed

**Medium-Risk Additions (Minor Refactoring):**

1. **Real-Time Updates**
   - Need to replace `getDocs()` with `onSnapshot()`
   - Need to handle unsubscribe
   - Minor refactoring in components

2. **Password Reset**
   - Need to add Firebase Auth password reset
   - Need to add UI flow
   - Minor refactoring in AuthContext

3. **Email Verification**
   - Need to add Firebase Auth email verification
   - Need to add UI flow
   - Minor refactoring in AuthContext

4. **Photo Albums**
   - Need to add `albumId` field to gallery documents
   - Need to add album management UI
   - Minor refactoring in gallery component

### Which Areas Need Cleanup Before Extension

**High-Priority Cleanup (Must Fix Before Adding Features):**

1. **Security Rules**
   - Must fix Firestore security rules
   - Must fix Storage security rules
   - Must add ownership checks
   - **Cannot add features safely until fixed**

2. **Permission System**
   - Must implement permission checking in routes
   - Must enforce collaborator roles
   - Must add ownership verification
   - **Cannot add collaboration features until fixed**

3. **Input Validation**
   - Must add server-side validation
   - Must add field length limits
   - Must add data type validation
   - **Cannot add features safely until fixed**

4. **Slug Uniqueness**
   - Must add uniqueness check
   - Must handle conflicts
   - **Cannot add wedding features safely until fixed**

**Medium-Priority Cleanup (Should Fix Soon):**

1. **State Management**
   - Should clear state on logout
   - Should add real-time updates
   - Should add cache invalidation
   - **Should fix before adding real-time features**

2. **Date Handling**
   - Should standardize on Firestore Timestamp
   - Should remove `toDate?.()` checks
   - **Should fix before adding date-based features**

3. **Error Handling**
   - Should add error boundaries
   - Should improve error messages
   - Should add retry mechanisms
   - **Should fix before adding complex features**

4. **Guest Identification**
   - Should replace localStorage with better method
   - Should add email-based verification
   - **Should fix before adding RSVP features**

**Low-Priority Cleanup (Can Fix Later):**

1. **Code Organization**
   - Can add more components
   - Can add utility functions
   - Can add constants file
   - **Can fix as needed**

2. **Performance**
   - Can add image optimization
   - Can add lazy loading
   - Can add code splitting
   - **Can fix as needed**

3. **Testing**
   - Can add unit tests
   - Can add integration tests
   - **Can add as needed**

---

## 14. Project Structure (Detailed)

### Complete File Tree

```
oneknot/
│
├── Configuration Files
│   ├── package.json                 # Dependencies and scripts
│   ├── package-lock.json            # Locked dependency versions
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── .gitignore                   # Git ignore rules
│   └── .env.example                 # Environment variables template
│
├── Firebase Configuration
│   ├── firestore.rules              # Firestore security rules
│   ├── storage.rules                # Firebase Storage security rules
│   └── firebase-config-template.txt # Firebase config template
│
├── Documentation
│   ├── README.md                    # Project README
│   ├── QUICKSTART.md                # Quick start guide
│   ├── FIREBASE_SETUP.md            # Firebase setup instructions
│   ├── EMAIL_SMS_SETUP.md           # Email/SMS setup guide
│   ├── EMAIL_TEMPLATE_SETUP.md     # EmailJS template configuration
│   ├── EMAILJS_FIX.md               # EmailJS troubleshooting
│   ├── EMAIL_SUBJECT_LINES.md       # Email subject line examples
│   ├── DEPLOY_RULES.md              # Deployment documentation
│   ├── DEPLOY_RULES_UPDATE.md       # Deployment updates
│   ├── CHANGELOG.md                 # Development history
│   └── CURRENT_STATE.md             # Previous state documentation
│
├── Static Assets
│   ├── index.html                   # HTML entry point
│   ├── public/
│   │   └── vite.svg                 # Vite logo
│   └── email-template.html          # HTML email template
│
└── Source Code (src/)
    │
    ├── Entry Points
    │   ├── main.jsx                 # React app entry point
    │   └── App.jsx                  # Main app component with routes
    │
    ├── Configuration
    │   └── config/
    │       └── firebase.js          # Firebase initialization
    │
    ├── Context Providers
    │   └── contexts/
    │       ├── AuthContext.jsx      # Authentication state management
    │       └── WeddingContext.jsx   # Wedding data management
    │
    ├── Components
    │   └── components/
    │       └── ProtectedRoute.jsx   # Route guard component
    │
    ├── Pages (Route Components)
    │   └── pages/
    │       ├── Home.jsx             # Landing page
    │       ├── Login.jsx            # Authentication page
    │       ├── CreateWedding.jsx    # Wedding creation form
    │       ├── Dashboard.jsx        # Main dashboard
    │       ├── WeddingWebsite.jsx   # Public wedding website
    │       ├── InvitePreview.jsx    # Digital invite preview
    │       ├── EventDetails.jsx     # Event page with RSVP
    │       ├── EventsManagement.jsx # Event CRUD interface
    │       ├── ContactsManagement.jsx # Collaborators and guests
    │       ├── InviteGuests.jsx     # Send invitations
    │       ├── Gallery.jsx          # Photo/video gallery
    │       └── FindMyPhotos.jsx     # AI placeholder page
    │
    └── Styles
        ├── index.css                # Global styles and Tailwind
        └── style.css               # (Unused or minimal)
```

### File Purposes

**Root Level:**
- `package.json` - Project metadata, dependencies, scripts
- `vite.config.js` - Vite build tool configuration
- `tailwind.config.js` - Tailwind CSS theme and content paths
- `postcss.config.js` - PostCSS processing configuration
- `index.html` - HTML entry point, root div for React
- `.gitignore` - Files to ignore in Git
- `.env.example` - Template for environment variables

**Firebase:**
- `firestore.rules` - Security rules for Firestore database
- `storage.rules` - Security rules for Firebase Storage
- `firebase-config-template.txt` - Template for Firebase config values

**Documentation:**
- `README.md` - Project overview and setup instructions
- `QUICKSTART.md` - Quick start guide for developers
- `FIREBASE_SETUP.md` - Detailed Firebase setup instructions
- `EMAIL_SMS_SETUP.md` - Email and SMS service setup
- `EMAIL_TEMPLATE_SETUP.md` - EmailJS template configuration
- `EMAILJS_FIX.md` - Troubleshooting EmailJS issues
- `EMAIL_SUBJECT_LINES.md` - Email subject line examples
- `DEPLOY_RULES.md` - Deployment rules and guidelines
- `DEPLOY_RULES_UPDATE.md` - Updates to deployment rules
- `CHANGELOG.md` - Development history and changes
- `CURRENT_STATE.md` - Previous state documentation

**Source Code:**

**Entry Points:**
- `src/main.jsx` - React application entry, renders `<App />` with StrictMode
- `src/App.jsx` - Root component, defines all routes, wraps in providers

**Configuration:**
- `src/config/firebase.js` - Firebase initialization, exports auth/db/storage

**Contexts:**
- `src/contexts/AuthContext.jsx` - Authentication state and methods
- `src/contexts/WeddingContext.jsx` - Wedding data state and CRUD operations

**Components:**
- `src/components/ProtectedRoute.jsx` - Route guard for authentication

**Pages:**
- `src/pages/Home.jsx` - Public landing page
- `src/pages/Login.jsx` - Authentication page (sign up/sign in)
- `src/pages/CreateWedding.jsx` - Wedding creation form
- `src/pages/Dashboard.jsx` - Main dashboard with stats
- `src/pages/WeddingWebsite.jsx` - Public wedding website
- `src/pages/InvitePreview.jsx` - Digital invite preview
- `src/pages/EventDetails.jsx` - Event details with RSVP form
- `src/pages/EventsManagement.jsx` - Event CRUD interface
- `src/pages/ContactsManagement.jsx` - Collaborators and guests management
- `src/pages/InviteGuests.jsx` - Send email/SMS invitations
- `src/pages/Gallery.jsx` - Photo/video gallery
- `src/pages/FindMyPhotos.jsx` - AI face recognition placeholder

**Styles:**
- `src/index.css` - Global styles, Tailwind imports, custom component classes
- `src/style.css` - (Unused or minimal)

### Import Dependencies

**Main Entry Flow:**
1. `index.html` → loads `src/main.jsx`
2. `main.jsx` → imports `App.jsx` and `index.css`
3. `App.jsx` → imports all page components and providers
4. Pages → import contexts, Firebase config, components

**Context Usage:**
- `AuthContext` used in: `App.jsx`, `Login.jsx`, `Dashboard.jsx`, `ProtectedRoute.jsx`
- `WeddingContext` used in: `App.jsx`, `CreateWedding.jsx`, `Dashboard.jsx`, `WeddingWebsite.jsx`, `InvitePreview.jsx`, `EventsManagement.jsx`, `ContactsManagement.jsx`, `InviteGuests.jsx`

**Firebase Usage:**
- `firebase.js` imported in: `AuthContext.jsx`, `WeddingContext.jsx`, all pages that use Firestore/Storage

**Component Usage:**
- `ProtectedRoute` used in: `App.jsx` (wraps protected routes)

---

**Document End**

This document represents the authoritative current state of the OneKnot application. It should be updated as the codebase evolves to maintain accuracy.
