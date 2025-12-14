import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWedding } from '../contexts/WeddingContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Users, CheckCircle, Calendar, Camera, LogOut, Plus, Settings, ExternalLink, Mail, Copy, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { weddingId } = useParams()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { weddings, getWeddingById, getUserWeddings } = useWedding()
  const [currentWedding, setCurrentWedding] = useState(null)
  const [stats, setStats] = useState({
    guestCount: 0,
    rsvpCount: 0,
    eventCount: 0,
    galleryCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      // Load weddings first
      await getUserWeddings()
      
      // Get the updated weddings list from context after loading
      // We need to wait a tick for the context to update, or use the result directly
      // For now, use the weddings from context which should be updated
      
      if (weddingId) {
        const wedding = await getWeddingById(weddingId)
        setCurrentWedding(wedding)
        
        // Load stats from subcollections
        const eventsQuery = query(collection(db, 'weddings', weddingId, 'events'))
        const eventsSnapshot = await getDocs(eventsQuery)
        const eventCount = eventsSnapshot.size

        const rsvpsQuery = query(collection(db, 'weddings', weddingId, 'rsvps'))
        const rsvpsSnapshot = await getDocs(rsvpsQuery)
        const rsvpCount = rsvpsSnapshot.size

        // Get unique guest count
        const uniqueGuests = new Set()
        rsvpsSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.guestEmail) uniqueGuests.add(data.guestEmail)
        })

        const galleryQuery = query(collection(db, 'weddings', weddingId, 'gallery'))
        const gallerySnapshot = await getDocs(galleryQuery)
        const galleryCount = gallerySnapshot.size

        setStats({
          guestCount: uniqueGuests.size,
          rsvpCount,
          eventCount,
          galleryCount
        })
      } else {
        // No weddingId - check if we should auto-select
        // Use a separate effect for auto-navigation to avoid loops
        setCurrentWedding(null)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Separate effect for auto-navigation when no weddingId but weddings exist
  useEffect(() => {
    if (!weddingId && weddings.length > 0) {
      navigate(`/dashboard/${weddings[0].id}`, { replace: true })
    }
  }, [weddingId, weddings.length, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="OneKnot Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-2xl font-bold text-pink-600">OneKnot</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/create" className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Wedding
              </Link>
              <button onClick={logout} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {weddings.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">No weddings yet</h2>
            <p className="text-gray-600 mb-8">Create your first wedding link to get started</p>
            <Link to="/create" className="btn-primary">
              Create Wedding
            </Link>
          </div>
        ) : (
          <>
            {/* Wedding Selector - Always show if there are weddings */}
            {weddings.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {weddings.length > 1 ? 'Select a wedding' : 'Your wedding'}
                </label>
                <select
                  value={weddingId || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      navigate(`/dashboard/${e.target.value}`)
                    }
                  }}
                  className="input-field max-w-xs"
                >
                  {weddings.length > 1 && <option value="">Select a wedding</option>}
                  {weddings.map(wedding => (
                    <option key={wedding.id} value={wedding.id}>
                      {wedding.partner1Name} & {wedding.partner2Name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentWedding ? (
              <>
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                  <h1 className="text-4xl font-bold mb-2">
                    {currentWedding.partner1Name} & {currentWedding.partner2Name}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {new Date(currentWedding.weddingDate?.toDate?.() || currentWedding.weddingDate).toLocaleDateString()} • {currentWedding.city}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={`/w/${currentWedding.slug}`}
                      target="_blank"
                      className="btn-secondary flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Website
                    </Link>
                    <Link
                      to={`/invite/${currentWedding.slug}`}
                      target="_blank"
                      className="btn-secondary flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Invite
                    </Link>
                    <Link
                      to={`/dashboard/${weddingId}/settings`}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Your wedding link:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border text-sm break-all">
                        {window.location.origin}/w/{currentWedding.slug}
                      </code>
                      <button
                        onClick={(e) => {
                          navigator.clipboard.writeText(`${window.location.origin}/w/${currentWedding.slug}`)
                          // Show toast-like feedback
                          const btn = e.currentTarget
                          const originalHTML = btn.innerHTML
                          btn.innerHTML = '<span class="text-green-600">✓ Copied!</span>'
                          btn.classList.add('bg-green-50')
                          setTimeout(() => {
                            btn.innerHTML = originalHTML
                            btn.classList.remove('bg-green-50')
                          }, 2000)
                        }}
                        className="btn-secondary text-sm whitespace-nowrap"
                      >
                        <Copy className="w-4 h-4 inline mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow p-6"
                  >
                    <Users className="w-8 h-8 text-pink-600 mb-2" />
                    <div className="text-3xl font-bold text-pink-600">{stats.guestCount}</div>
                    <div className="text-gray-600">Guests</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow p-6"
                  >
                    <CheckCircle className="w-8 h-8 text-pink-600 mb-2" />
                    <div className="text-3xl font-bold text-pink-600">{stats.rsvpCount}</div>
                    <div className="text-gray-600">RSVPs</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow p-6"
                  >
                    <Calendar className="w-8 h-8 text-pink-600 mb-2" />
                    <div className="text-3xl font-bold text-pink-600">{stats.eventCount}</div>
                    <div className="text-gray-600">Events</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow p-6"
                  >
                    <Camera className="w-8 h-8 text-pink-600 mb-2" />
                    <div className="text-3xl font-bold text-pink-600">{stats.galleryCount}</div>
                    <div className="text-gray-600">Photos</div>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Link
                    to={`/dashboard/${weddingId}/invite`}
                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group"
                  >
                    <Mail className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">Invite Guests</h3>
                    <p className="text-gray-600">Send email & SMS invitations</p>
                  </Link>

                  <Link
                    to={`/dashboard/${weddingId}/events`}
                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group"
                  >
                    <Calendar className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">Manage Events</h3>
                    <p className="text-gray-600">Add and edit wedding events</p>
                  </Link>

                  <Link
                    to={`/dashboard/${weddingId}/contacts`}
                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group"
                  >
                    <Users className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">Contacts & People</h3>
                    <p className="text-gray-600">Manage collaborators and guests</p>
                  </Link>

                  <Link
                    to={`/gallery/${weddingId}`}
                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group"
                  >
                    <Camera className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">Gallery</h3>
                    <p className="text-gray-600">View and manage photos</p>
                  </Link>

                  <Link
                    to={`/dashboard/${weddingId}/updates`}
                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group"
                  >
                    <Bell className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">Guest Updates</h3>
                    <p className="text-gray-600">Send alerts & live updates</p>
                  </Link>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-xl shadow"
              >
                <div className="text-6xl mb-4">💒</div>
                <h2 className="text-2xl font-bold mb-4">Select a wedding</h2>
                {weddings.length > 0 ? (
                  <p className="text-gray-600">Choose a wedding from the dropdown above</p>
                ) : (
                  <p className="text-gray-600">No wedding selected</p>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

