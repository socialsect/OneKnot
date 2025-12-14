# OneKnot - Your Wedding, One Link

A modern Gen Z wedding platform that creates a single wedding link containing digital invites, wedding website, events & timelines, RSVP, shared gallery, and AI-ready "Find My Photos" feature.

## Tech Stack

- **React** + **Vite** - Fast development and build
- **JavaScript** - No TypeScript (as per requirements)
- **Tailwind CSS** - Modern, utility-first styling
- **React Router** - Client-side routing
- **Firebase** - Authentication, Firestore, and Storage
- **Context API** - State management
- **Framer Motion** - Smooth animations

## Features

✅ **Authentication**
- Google Sign In
- Email/Password Sign In
- Guest access (no login required for RSVP)

✅ **Wedding Creation**
- Couple names
- Wedding date
- City
- Theme selection
- Custom slug generation

✅ **Dashboard**
- Wedding overview
- Event management
- Guest count
- RSVP statistics
- Gallery statistics

✅ **Public Wedding Website** (`/w/:slug`)
- Hero section
- Event timeline
- Locations with Google Maps links
- Dress codes
- RSVP section
- Gallery preview
- Couple story

✅ **Digital Invites** (`/invite/:slug`)
- Beautiful invite preview
- Share buttons (WhatsApp, copy link)

✅ **Events**
- CRUD operations
- Event details page
- Date, time, location, dress code

✅ **RSVP System**
- Yes / No / Maybe per event
- No login required
- Saves to Firestore

✅ **Shared Gallery**
- Event-wise albums
- Upload photos/videos to Firebase Storage
- Gallery grid display
- Likes/reactions

✅ **AI Placeholders** (UI Only)
- "Upload a selfie" interface
- "Photos of You" page with mock filtered data
- TODO comments for face recognition integration

✅ **Collaboration** (Structure Ready)
- Add collaborators
- Roles: owner, admin, viewer

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase config

4. Create a `.env` file (use `.env.example` as template):
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/       # Reusable components
├── contexts/         # React Context providers
├── config/          # Firebase configuration
├── pages/           # Page components
├── App.jsx          # Main app component with routes
├── main.jsx         # Entry point
└── index.css        # Global styles with Tailwind
```

## Firebase Collections

- `weddings` - Wedding data
- `events` - Wedding events
- `rsvps` - RSVP responses
- `gallery` - Photo/video metadata
- `collaborators` - Wedding collaborators (future)

## Development Notes

- **JavaScript Only**: All files use `.js` or `.jsx` extensions
- **No TypeScript**: TypeScript configs and types are excluded
- **Mobile-First**: Responsive design with Tailwind
- **Gen Z Aesthetic**: Modern, clean, minimal design
- **TODO Comments**: AI features and future improvements are marked

## Future Enhancements

- [ ] Real AI face recognition integration
- [ ] Email notifications
- [ ] Advanced collaboration features
- [ ] Custom themes and styling
- [ ] Analytics dashboard
- [ ] Export guest list
- [ ] Multiple language support

## License

MIT


