import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WeddingProvider } from './contexts/WeddingContext'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateWedding from './pages/CreateWedding'
import Dashboard from './pages/Dashboard'
import WeddingWebsite from './pages/WeddingWebsite'
import InvitePreview from './pages/InvitePreview'
import EventDetails from './pages/EventDetails'
import EventsManagement from './pages/EventsManagement'
import ContactsManagement from './pages/ContactsManagement'
import InviteGuests from './pages/InviteGuests'
import Gallery from './pages/Gallery'
import FindMyPhotos from './pages/FindMyPhotos'
import WeddingSettings from './pages/WeddingSettings'
import UpdatesManagement from './pages/UpdatesManagement'
import GuestsManagement from './pages/GuestsManagement'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <WeddingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create" element={<ProtectedRoute><CreateWedding /></ProtectedRoute>} />
            <Route path="/dashboard/:weddingId?" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/:weddingId/events" element={<ProtectedRoute><EventsManagement /></ProtectedRoute>} />
            <Route path="/dashboard/:weddingId/contacts" element={<ProtectedRoute><ContactsManagement /></ProtectedRoute>} />
            <Route path="/dashboard/:weddingId/invite" element={<ProtectedRoute><InviteGuests /></ProtectedRoute>} />
            <Route path="/dashboard/:weddingId/settings" element={<ProtectedRoute><WeddingSettings /></ProtectedRoute>} />
            <Route path="/dashboard/:weddingId/updates" element={<ProtectedRoute><UpdatesManagement /></ProtectedRoute>} />
            <Route path="/dashboard/:weddingId/guests" element={<ProtectedRoute><GuestsManagement /></ProtectedRoute>} />
            <Route path="/w/:slug" element={<WeddingWebsite />} />
            <Route path="/invite/:slug" element={<InvitePreview />} />
            <Route path="/event/:eventId" element={<EventDetails />} />
            <Route path="/gallery/:weddingId" element={<Gallery />} />
            <Route path="/find-my-photos/:weddingId" element={<FindMyPhotos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </WeddingProvider>
    </AuthProvider>
  )
}

export default App

