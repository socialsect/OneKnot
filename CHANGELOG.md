# OneKnot - Project Setup & Changes Documentation

## Overview
This document details all changes made during the initial setup of the OneKnot wedding platform application.

---

## Project Initialization

### 1. Vite + React Project Setup
- **Action**: Created Vite project with React template
- **Command**: `npm create vite@latest . -- --template react`
- **Result**: Base Vite project scaffolded

### 2. TypeScript Removal
- **Removed Files**:
  - `tsconfig.json` - TypeScript configuration
  - `src/counter.ts` - TypeScript example file
  - `src/typescript.svg` - TypeScript logo
  - `src/main.ts` - TypeScript entry point

### 3. JavaScript Conversion
- **Created**: `src/main.jsx` - JavaScript entry point
- **Updated**: `index.html` - Changed script reference from `.ts` to `.jsx`

---

## Dependencies Installed

### Production Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "firebase": "^10.13.2",
  "framer-motion": "^11.3.24"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.3.5",
  "@types/react-dom": "^18.3.0",
  "@vitejs/plugin-react": "^4.3.1",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.4.47",
  "tailwindcss": "^3.4.13",
  "vite": "^7.2.4"
}
```

---

## Files Created

### Configuration Files

#### `package.json`
- Removed TypeScript dependencies
- Added React, React Router, Firebase, Framer Motion
- Added Tailwind CSS and PostCSS
- Updated build scripts (removed TypeScript compilation)

#### `vite.config.js`
- Vite configuration with React plugin
- JavaScript-only setup

#### `tailwind.config.js`
- Tailwind CSS configuration
- Custom color palette (pink/purple theme)
- Extended theme for Gen Z aesthetic

#### `postcss.config.js`
- PostCSS configuration for Tailwind

#### `.gitignore`
- Standard Node.js ignores
- Environment variables
- Build outputs

#### `README.md`
- Comprehensive project documentation
- Setup instructions
- Feature list
- Firebase configuration guide

---

### Source Files

#### Core Application Files

**`src/main.jsx`**
- React application entry point
- Renders App component with React.StrictMode

**`src/App.jsx`**
- Main application component
- React Router setup with all routes
- Context providers (Auth, Wedding)
- Route definitions:
  - `/` - Home page
  - `/login` - Authentication
  - `/create` - Create wedding (protected)
  - `/dashboard/:weddingId?` - Dashboard (protected)
  - `/w/:slug` - Public wedding website
  - `/invite/:slug` - Digital invite preview
  - `/event/:eventId` - Event details
  - `/gallery/:weddingId` - Photo gallery
  - `/find-my-photos/:weddingId` - AI photo finder

**`src/index.css`**
- Tailwind CSS imports
- Custom utility classes (btn-primary, btn-secondary, input-field)
- Base styles

---

### Firebase Configuration

**`src/config/firebase.js`**
- Firebase app initialization
- Auth, Firestore, and Storage exports
- Environment variable-based configuration
- Placeholder values for development

---

### Context Providers

**`src/contexts/AuthContext.jsx`**
- Authentication state management
- Functions:
  - `signInWithGoogle()` - Google OAuth
  - `signUp(email, password)` - Email registration
  - `login(email, password)` - Email login
  - `logout()` - Sign out
- `currentUser` state
- Loading state management

**`src/contexts/WeddingContext.jsx`**
- Wedding data management
- Functions:
  - `createWedding(weddingData)` - Create new wedding
  - `getWeddingBySlug(slug)` - Get wedding by URL slug
  - `getWeddingById(weddingId)` - Get wedding by ID
  - `getUserWeddings()` - Get all user's weddings
  - `updateWedding(weddingId, updates)` - Update wedding
- State: `weddings`, `currentWedding`, `loading`

---

### Components

**`src/components/ProtectedRoute.jsx`**
- Route protection wrapper
- Redirects to login if not authenticated
- Uses AuthContext to check user status

---

### Pages

#### **`src/pages/Home.jsx`**
- Landing page with hero section
- Feature highlights
- Navigation to login/signup
- Framer Motion animations
- Gen Z aesthetic design

#### **`src/pages/Login.jsx`**
- Authentication page
- Email/password login and signup
- Google Sign In button
- Form validation
- Error handling
- Toggle between login/signup modes

#### **`src/pages/CreateWedding.jsx`**
- Wedding creation form
- Fields:
  - Partner 1 & 2 names
  - Wedding date
  - City
  - Theme selection (6 themes)
  - Custom slug generation
- Form validation
- Redirects to dashboard on success

#### **`src/pages/Dashboard.jsx`**
- Main dashboard for couples
- Features:
  - Wedding overview
  - Statistics (guests, RSVPs, events, photos)
  - Quick actions
  - Wedding selector (if multiple weddings)
  - Links to website and invite
- Real-time stats from Firestore

#### **`src/pages/WeddingWebsite.jsx`**
- Public wedding website (`/w/:slug`)
- Sections:
  - Hero with couple names
  - Story section
  - Events timeline
  - RSVP section
  - Gallery preview
- Responsive design
- Fetches wedding data by slug

#### **`src/pages/InvitePreview.jsx`**
- Digital invite preview page
- Beautiful invite design
- Share functionality:
  - WhatsApp sharing
  - Copy link to clipboard
- Displays wedding date, location, couple names

#### **`src/pages/EventDetails.jsx`**
- Individual event page
- Event information:
  - Date, time, location
  - Dress code
  - Description
  - Google Maps link
- RSVP functionality:
  - Yes/No/Maybe options
  - Guest name and email
  - Plus one option
  - No login required
- Saves RSVP to Firestore

#### **`src/pages/Gallery.jsx`**
- Photo/video gallery
- Features:
  - Upload photos/videos to Firebase Storage
  - Grid display
  - Like/reaction system
  - Support for images and videos
- Firebase Storage integration

#### **`src/pages/FindMyPhotos.jsx`**
- AI "Find My Photos" feature (UI placeholder)
- Features:
  - Selfie upload interface
  - Mock AI processing simulation
  - Displays "matched" photos
- TODO comments for real AI integration
- Developer notes for face recognition implementation

---

## Project Structure

```
oneknot/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── WeddingContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── CreateWedding.jsx
│   │   ├── Dashboard.jsx
│   │   ├── WeddingWebsite.jsx
│   │   ├── InvitePreview.jsx
│   │   ├── EventDetails.jsx
│   │   ├── Gallery.jsx
│   │   └── FindMyPhotos.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

---

## Features Implemented

### ✅ Authentication
- Google Sign In
- Email/Password authentication
- Protected routes
- Guest access (no login for RSVP)

### ✅ Wedding Management
- Create wedding with custom slug
- Theme selection
- Wedding data storage in Firestore
- Multiple weddings per user

### ✅ Dashboard
- Wedding overview
- Real-time statistics
- Quick navigation
- Multiple wedding support

### ✅ Public Wedding Website
- Accessible via `/w/:slug`
- Hero section
- Events timeline
- Story section
- RSVP integration
- Gallery preview

### ✅ Digital Invites
- Beautiful invite design
- Share via WhatsApp
- Copy link functionality
- Accessible via `/invite/:slug`

### ✅ Events
- Event details page
- Date, time, location
- Dress code
- Google Maps integration
- Event-specific RSVP

### ✅ RSVP System
- Yes/No/Maybe responses
- Guest information collection
- Plus one option
- No login required
- Firestore storage

### ✅ Gallery
- Photo/video upload to Firebase Storage
- Grid display
- Like/reaction system
- Event-wise organization

### ✅ AI Placeholders
- "Find My Photos" UI
- Selfie upload interface
- Mock AI processing
- TODO comments for real implementation

### 🔄 Collaboration (Structure Ready)
- Collaborator roles defined (owner, admin, viewer)
- Data structure in place
- UI implementation pending

---

## Styling & Design

### Tailwind CSS Setup
- Custom color palette (pink/purple theme)
- Utility classes:
  - `btn-primary` - Primary button style
  - `btn-secondary` - Secondary button style
  - `input-field` - Form input styling
- Mobile-first responsive design
- Gen Z aesthetic (modern, clean, minimal)

### Framer Motion
- Smooth page transitions
- Animated components
- Entrance animations
- Used across multiple pages

---

## Firebase Integration

### Collections Structure
- `weddings` - Wedding data
- `events` - Event information
- `rsvps` - RSVP responses
- `gallery` - Photo/video metadata

### Storage
- `weddings/{weddingId}/` - Photo/video storage paths

### Authentication
- Email/Password enabled
- Google OAuth enabled

---

## Environment Variables Required

Create `.env` file with:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Next Steps for Production

1. **Firebase Setup**
   - Create Firebase project
   - Enable Authentication (Email + Google)
   - Create Firestore database
   - Enable Storage
   - Add environment variables

2. **AI Integration** (Find My Photos)
   - Integrate face recognition API
   - Process gallery photos
   - Match faces with uploaded selfie
   - Return filtered results

3. **Event Management**
   - Create event management page
   - CRUD operations for events
   - Event editing interface

4. **Collaboration Features**
   - Add collaborator UI
   - Role management
   - Permission system

5. **Additional Features**
   - Email notifications
   - Guest list export
   - Analytics dashboard
   - Custom themes
   - Multiple language support

---

## Notes

- All code is in **JavaScript** (no TypeScript)
- Mobile-first responsive design
- Gen Z aesthetic throughout
- Clean, modern UI
- TODO comments mark future enhancements
- Mock data used where backend integration pending

---

## Installation Summary

```bash
# Dependencies installed
npm install

# Packages added:
- React ecosystem (react, react-dom, react-router-dom)
- Firebase (auth, firestore, storage)
- Framer Motion (animations)
- Tailwind CSS (styling)
- Vite plugins and tools
```

**Total**: 278 packages audited
**Vulnerabilities**: 10 moderate (can be addressed with `npm audit fix`)

---

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

*Documentation created: Initial project setup*
*Last updated: Project initialization complete*

