import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWedding } from '../contexts/WeddingContext'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, getDocs, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Calendar, Clock, MapPin, Shirt, Heart, Camera, ArrowRight, Copy, Check, Share2, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

const themeStyles = {
  classic: {
    hero: 'from-rose-100 to-rose-200',
    accent: 'text-rose-600',
    button: 'bg-rose-600 hover:bg-rose-700',
    card: 'bg-rose-50'
  },
  modern: {
    hero: 'from-pink-100 to-purple-100',
    accent: 'text-pink-600',
    button: 'bg-pink-600 hover:bg-pink-700',
    card: 'bg-pink-50'
  },
  rustic: {
    hero: 'from-amber-100 to-orange-100',
    accent: 'text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
    card: 'bg-amber-50'
  },
  beach: {
    hero: 'from-blue-100 to-cyan-100',
    accent: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    card: 'bg-blue-50'
  },
  garden: {
    hero: 'from-green-100 to-emerald-100',
    accent: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700',
    card: 'bg-green-50'
  },
  minimal: {
    hero: 'from-gray-100 to-gray-200',
    accent: 'text-gray-700',
    button: 'bg-gray-700 hover:bg-gray-800',
    card: 'bg-gray-50'
  }
}

export default function WeddingWebsite() {
  const { slug } = useParams()
  const { getWeddingBySlug } = useWedding()
  const { currentUser } = useAuth()
  const [wedding, setWedding] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [galleryPreview, setGalleryPreview] = useState([])
  const [memories, setMemories] = useState([])
  const [newMemory, setNewMemory] = useState({ name: '', message: '' })
  const [submittingMemory, setSubmittingMemory] = useState(false)
  const [updates, setUpdates] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [weddingRsvp, setWeddingRsvp] = useState({
    guestName: '',
    guestEmail: '',
    phoneNumber: '',
    plusOne: false,
    message: ''
  })
  const [weddingRsvpSubmitted, setWeddingRsvpSubmitted] = useState(false)

  useEffect(() => {
    loadWedding()
  }, [slug])

  const loadWedding = async () => {
    try {
      const weddingData = await getWeddingBySlug(slug)
      setWedding(weddingData)

      if (weddingData) {
        // Load events
        const eventsQuery = query(
          collection(db, 'weddings', weddingData.id, 'events'),
          orderBy('date', 'asc')
        )
        const eventsSnapshot = await getDocs(eventsQuery)
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setEvents(eventsList)

        // Load gallery preview (first 6 photos)
        // Note: uploadedAt is Date, so we sort in JavaScript
        const galleryQuery = query(
          collection(db, 'weddings', weddingData.id, 'gallery')
        )
        const gallerySnapshot = await getDocs(galleryQuery)
        const galleryList = gallerySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => {
            // Handle both Timestamp and Date formats
            const aTime = a.uploadedAt?.toMillis?.() || 
                         a.uploadedAt?.seconds * 1000 || 
                         new Date(a.uploadedAt).getTime() || 0
            const bTime = b.uploadedAt?.toMillis?.() || 
                         b.uploadedAt?.seconds * 1000 || 
                         new Date(b.uploadedAt).getTime() || 0
            return bTime - aTime
          })
          .slice(0, 6)
        setGalleryPreview(galleryList)

        // Load memories
        const memoriesQuery = query(
          collection(db, 'weddings', weddingData.id, 'memories'),
          orderBy('createdAt', 'desc')
        )
        const memoriesSnapshot = await getDocs(memoriesQuery)
        const memoriesList = memoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          reactions: doc.data().reactions || { heart: [], laugh: [], cry: [] }
        }))
        setMemories(memoriesList)

        // Load updates
        const updatesQuery = query(
          collection(db, 'weddings', weddingData.id, 'updates'),
          orderBy('createdAt', 'desc')
        )
        const updatesSnapshot = await getDocs(updatesQuery)
        const updatesList = updatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUpdates(updatesList)
      }
    } catch (error) {
      console.error('Error loading wedding:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGuestId = () => {
    let guestId = localStorage.getItem('memoryGuestId')
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('memoryGuestId', guestId)
    }
    return guestId
  }

  const handleSubmitMemory = async (e) => {
    e.preventDefault()
    if (!newMemory.name.trim() || !newMemory.message.trim()) return

    setSubmittingMemory(true)
    try {
      await addDoc(collection(db, 'weddings', wedding.id, 'memories'), {
        name: newMemory.name.trim(),
        message: newMemory.message.trim(),
        createdAt: serverTimestamp(),
        reactions: {
          heart: [],
          laugh: [],
          cry: []
        }
      })
      setNewMemory({ name: '', message: '' })
      loadWedding()
    } catch (error) {
      console.error('Error submitting memory:', error)
      alert('Failed to submit memory. Please try again.')
    } finally {
      setSubmittingMemory(false)
    }
  }

  const handleMemoryReaction = async (memoryId, reactionType) => {
    try {
      const memory = memories.find(m => m.id === memoryId)
      if (!memory) return

      const guestId = getGuestId()
      const currentReactions = memory.reactions || { heart: [], laugh: [], cry: [] }
      const reactionArray = currentReactions[reactionType] || []
      
      const hasReacted = reactionArray.includes(guestId)
      const updatedReactions = {
        ...currentReactions,
        [reactionType]: hasReacted
          ? reactionArray.filter(id => id !== guestId)
          : [...reactionArray, guestId]
      }

      const memoryRef = doc(db, 'weddings', wedding.id, 'memories', memoryId)
      await updateDoc(memoryRef, {
        reactions: updatedReactions
      })
      
      setMemories(prev => prev.map(m => 
        m.id === memoryId ? { ...m, reactions: updatedReactions } : m
      ))
    } catch (error) {
      console.error('Error reacting to memory:', error)
    }
  }

  const handleDeleteMemory = async (memoryId) => {
    if (!confirm('Are you sure you want to delete this memory?')) return
    
    try {
      await deleteDoc(doc(db, 'weddings', wedding.id, 'memories', memoryId))
      setMemories(prev => prev.filter(m => m.id !== memoryId))
    } catch (error) {
      console.error('Error deleting memory:', error)
      alert('Failed to delete memory. Please try again.')
    }
  }

  const isOwner = () => {
    return currentUser && wedding && wedding.ownerId === currentUser.uid
  }

  const handleWeddingRSVP = async (status) => {
    if (!wedding) return
    if (!weddingRsvp.guestName.trim() || !weddingRsvp.guestEmail.trim()) {
      alert('Please enter your name and email')
      return
    }

    try {
      const guestId = localStorage.getItem('weddingGuestId') || `guest_${Date.now()}`
      localStorage.setItem('weddingGuestId', guestId)

      await addDoc(collection(db, 'weddings', wedding.id, 'rsvps'), {
        status,
        guestName: weddingRsvp.guestName.trim(),
        guestEmail: weddingRsvp.guestEmail.trim(),
        phoneNumber: weddingRsvp.phoneNumber.trim(),
        plusOne: weddingRsvp.plusOne,
        guestId,
        message: weddingRsvp.message.trim(),
        submittedAt: new Date()
      })

      setWeddingRsvp(prev => ({ ...prev, status }))
      setWeddingRsvpSubmitted(true)

      // Send RSVP confirmation email if email provided
      if (weddingRsvp.guestEmail && weddingRsvp.guestEmail.trim()) {
        try {
          const websiteUrl = `${window.location.origin}/w/${wedding.slug}`
          const weddingName = `${wedding.partner1Name} & ${wedding.partner2Name}`
          
          await fetch('/api/send-update-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipientEmails: [weddingRsvp.guestEmail.trim()],
              weddingName: weddingName,
              updateMessage: status,
              eventName: null,
              timeUpdate: null,
              mapLink: null,
              websiteUrl: websiteUrl,
              emailType: 'rsvp-confirmation'
            })
          })
        } catch (error) {
          console.error('Error sending RSVP confirmation email:', error)
          // Don't show error to user - RSVP was successful
        }
      }
    } catch (error) {
      console.error('Error submitting wedding RSVP:', error)
      alert('Failed to submit RSVP. Please try again.')
    }
  }

  useEffect(() => {
    // Keep countdown hook order stable; reset when wedding changes
    if (!wedding) {
      setCountdown(null)
      return
    }

    const weddingDate = wedding.weddingDate?.toDate?.() || new Date(wedding.weddingDate)

    const calculateCountdown = () => {
      const now = new Date()
      const diff = weddingDate - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds, isPast: diff < 0 })
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)

    return () => clearInterval(interval)
  }, [wedding])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-600 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wedding website...</p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Wedding not found</h1>
          <Link to="/" className="text-pink-600 hover:underline">Go home</Link>
        </div>
      </div>
    )
  }

  const weddingDate = wedding.weddingDate?.toDate?.() || new Date(wedding.weddingDate)
  const theme = wedding.theme || 'modern'
  const styles = themeStyles[theme] || themeStyles.modern

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `Check out ${wedding.partner1Name} & ${wedding.partner2Name}'s wedding website! ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now'
    const now = new Date()
    const then = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-gradient-to-br ${styles.hero} py-20 px-4 text-center relative overflow-hidden`}
      >
        {wedding.coverImageUrl && (
          <div className="absolute inset-0">
            <img
              src={wedding.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="max-w-4xl mx-auto relative z-10">
          <Heart className="w-16 h-16 mx-auto mb-6 text-white opacity-90 drop-shadow-lg" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gray-800 drop-shadow-sm">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h1>
          <p className="text-2xl text-gray-700 mb-2 font-semibold">
            {weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xl text-gray-600 mb-6">{wedding.city}</p>
          
          {/* Countdown */}
          {countdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 mb-4 shadow-lg"
            >
              {countdown.isPast ? (
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700 mb-1">🎉 We're Married! 🎉</p>
                  <p className="text-sm text-gray-600">
                    {Math.abs(countdown.days)} day{Math.abs(countdown.days) !== 1 ? 's' : ''} ago
                  </p>
                </div>
              ) : countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 ? (
                <p className="text-lg font-semibold text-pink-600">🎉 Today's the day! 🎉</p>
              ) : countdown.days === 0 ? (
                <div className="text-center">
                  <p className="text-lg font-semibold text-pink-600 mb-1">Today!</p>
                  <p className="text-sm text-gray-600">
                    {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                  </p>
                </div>
              ) : countdown.days === 1 ? (
                <p className="text-lg font-semibold text-gray-800">Tomorrow! 🎉</p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{countdown.days}</div>
                    <div className="text-xs text-gray-600">days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{countdown.hours}</div>
                    <div className="text-xs text-gray-600">hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{countdown.minutes}</div>
                    <div className="text-xs text-gray-600">mins</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Share buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={copyLink}
              className="bg-white/90 hover:bg-white text-gray-700 font-semibold py-2 px-4 rounded-full transition-all flex items-center gap-2 shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
            <button
              onClick={shareWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition-all flex items-center gap-2 shadow-md"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick RSVP Section - Prominent */}
      {events.length > 0 ? (
        <section className="py-12 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                We'd Love to See You There!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Please let us know if you can make it
              </p>
              <Link
                to={`/event/${events[0].id}`}
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 shadow-lg text-lg"
              >
                ✓ RSVP Now
              </Link>
              {events.length > 1 && (
                <p className="text-sm text-gray-500 mt-4">
                  Or <Link to="#events" className="text-green-600 hover:underline">view all events</Link> to RSVP to specific ones
                </p>
              )}
            </motion.div>
          </div>
        </section>
      ) : (
        // Fallback RSVP if no individual events are configured
        <section className="py-12 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-800">
                RSVP to Our Wedding
              </h2>
              <p className="text-lg text-gray-600 mb-8 text-center">
                Let us know if you can join us for the celebration
              </p>

              {weddingRsvpSubmitted ? (
                <div className="text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    Thank you for your RSVP!
                  </h3>
                  <p className="text-gray-700">
                    We've recorded your response and can't wait to celebrate with you.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={weddingRsvp.guestName}
                      onChange={(e) => setWeddingRsvp(prev => ({ ...prev, guestName: e.target.value }))}
                      className="input-field"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      value={weddingRsvp.guestEmail}
                      onChange={(e) => setWeddingRsvp(prev => ({ ...prev, guestEmail: e.target.value }))}
                      className="input-field"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone / WhatsApp (optional)
                    </label>
                    <input
                      type="tel"
                      value={weddingRsvp.phoneNumber}
                      onChange={(e) => setWeddingRsvp(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="input-field"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="weddingPlusOne"
                      checked={weddingRsvp.plusOne}
                      onChange={(e) => setWeddingRsvp(prev => ({ ...prev, plusOne: e.target.checked }))}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <label htmlFor="weddingPlusOne" className="text-gray-700">
                      I'm bringing a plus one
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (optional)
                    </label>
                    <textarea
                      value={weddingRsvp.message}
                      onChange={(e) => setWeddingRsvp(prev => ({ ...prev, message: e.target.value }))}
                      className="input-field"
                      rows={3}
                      placeholder="Excited to celebrate with you! 🎉"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {weddingRsvp.message.length}/200 characters
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => handleWeddingRSVP('yes')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                    >
                      ✓ Yes, I'll be there!
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWeddingRSVP('maybe')}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                    >
                      ? Maybe
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWeddingRSVP('no')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                    >
                      ✗ Can't make it
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Latest Updates Section */}
      {updates.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Bell className="w-6 h-6 text-orange-600" />
                <h2 className="text-3xl font-bold text-gray-800">Latest Updates</h2>
              </div>
              
              {updates.slice(0, 3).map((update, index) => {
                const isLatest = index === 0
                const createdAt = update.createdAt?.toDate?.() || new Date(update.createdAt)
                const timeAgo = formatTimeAgo(createdAt)
                
                return (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl shadow-lg p-6 mb-4 ${isLatest ? 'ring-4 ring-orange-400' : ''}`}
                  >
                    {isLatest && (
                      <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-3">
                        ⭐ LATEST UPDATE
                      </div>
                    )}
                    <p className="text-xl text-gray-800 mb-3 whitespace-pre-wrap leading-relaxed">
                      {update.message}
                    </p>
                    {(update.timeUpdate || update.mapLink) && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                        {update.timeUpdate && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold">{update.timeUpdate}</span>
                          </div>
                        )}
                        {update.mapLink && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <a
                              href={update.mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:underline font-semibold break-all"
                            >
                              View Location on Maps
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">Updated {timeAgo}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Today's Events Section */}
      {(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEvents = events.filter(event => {
          const eventDate = event.date?.toDate?.() || new Date(event.date)
          eventDate.setHours(0, 0, 0, 0)
          return eventDate.getTime() === today.getTime()
        })
        
        if (todayEvents.length > 0) {
          return (
            <section className="py-12 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                    <Calendar className="w-8 h-8" />
                    Today's Events
                  </h2>
                  <div className="space-y-4">
                    {todayEvents.map((event, index) => {
                      const eventDate = event.date?.toDate?.() || new Date(event.date)
                      const eventUpdates = updates.filter(u => u.eventId === event.id)
                      const latestEventUpdate = eventUpdates[0]
                      
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl shadow-lg p-6"
                        >
                          {latestEventUpdate && (
                            <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mb-4 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <Bell className="w-5 h-5 text-orange-600" />
                                <span className="font-bold text-orange-800">Important Update</span>
                              </div>
                              <p className="text-gray-800 mb-2">{latestEventUpdate.message}</p>
                              {latestEventUpdate.timeUpdate && (
                                <p className="text-sm text-gray-700">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {latestEventUpdate.timeUpdate}
                                </p>
                              )}
                              {latestEventUpdate.mapLink && (
                                <a
                                  href={latestEventUpdate.mapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:underline text-sm flex items-center gap-1 mt-1"
                                >
                                  <MapPin className="w-4 h-4" />
                                  View Location
                                </a>
                              )}
                            </div>
                          )}
                          <h3 className="text-2xl font-bold mb-3">{event.name}</h3>
                          {event.description && (
                            <p className="text-gray-700 mb-4">{event.description}</p>
                          )}
                          <div className="space-y-2 mb-4">
                            {event.time && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-5 h-5 text-pink-600" />
                                <span className="font-semibold">{event.time}</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="w-5 h-5 text-pink-600" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.dressCode && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Shirt className="w-5 h-5 text-pink-600" />
                                <span><strong>Dress Code:</strong> {event.dressCode}</span>
                              </div>
                            )}
                          </div>
                          <Link
                            to={`/event/${event.id}`}
                            className={`${styles.button} text-white font-semibold py-3 px-6 rounded-full transition-all hover:scale-105 inline-flex items-center gap-2`}
                          >
                            RSVP & Full Details
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </div>
            </section>
          )
        }
        return null
      })()}

      {/* Story Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold mb-8 text-center">Our Story</h2>
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <p className="text-lg md:text-xl text-gray-700 text-center leading-relaxed">
              {wedding.story || `We're so excited to celebrate our special day with you! Join us as we tie the knot and begin our journey together.`}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Events Timeline */}
      {events.length > 0 && (
        <section id="events" className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Events</h2>
            <div className="space-y-6">
              {events.map((event, index) => {
                const eventDate = event.date?.toDate?.() || new Date(event.date)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold mb-3 text-gray-800">{event.name}</h3>
                        {event.description && (
                          <p className="text-gray-700 mb-4 leading-relaxed">{event.description}</p>
                        )}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-5 h-5 text-pink-600" />
                            <span className="font-medium">
                              {eventDate.toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-5 h-5 text-pink-600" />
                              <span className="font-medium">{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-5 h-5 text-pink-600" />
                              <span className="font-medium">{event.location}</span>
                            </div>
                          )}
                          {event.dressCode && (
                            <div className="flex items-center gap-2 text-gray-700 mt-3">
                              <Shirt className="w-5 h-5 text-pink-600" />
                              <span className="font-semibold">Dress Code:</span>
                              <span>{event.dressCode}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/event/${event.id}`}
                        className={`${styles.button} text-white font-semibold py-3 px-8 rounded-full transition-all hover:scale-105 whitespace-nowrap flex items-center gap-2 shadow-lg`}
                      >
                        RSVP & Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold mb-8 text-center">RSVP</h2>
          <div className={`${styles.card} rounded-2xl p-8 md:p-12 text-center shadow-lg`}>
            <p className="text-xl mb-2 font-semibold">We'd love to celebrate with you!</p>
            <p className="text-gray-600 mb-8">Let us know if you can make it</p>
            {events.length > 0 ? (
              <Link
                to={`/event/${events[0].id}`}
                className={`${styles.button} text-white font-semibold py-4 px-10 rounded-full transition-all hover:scale-105 inline-flex items-center gap-2 shadow-lg text-lg`}
              >
                RSVP Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <p className="text-gray-500">Events will be added soon</p>
            )}
          </div>
        </motion.div>
      </section>

      {/* Gallery Preview */}
      {galleryPreview.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
              <Camera className="w-8 h-8" />
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {galleryPreview.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  {photo.type === 'video' ? (
                    <video
                      src={photo.url}
                      className="w-full h-48 object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={photo.url}
                      alt="Gallery preview"
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
                </motion.div>
              ))}
            </div>
            <Link
              to={`/gallery/${wedding.id}`}
              className="btn-secondary block text-center w-fit mx-auto"
            >
              View All Photos ({galleryPreview.length}+)
            </Link>
          </div>
        </section>
      )}

      {/* Memory Wall */}
      <section className="py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8" />
              Memory Wall
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Share your favorite memories and well wishes
            </p>

            {/* Add Memory Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <form onSubmit={handleSubmitMemory} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newMemory.name}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Your name"
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <textarea
                    value={newMemory.message}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, message: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Share a memory or wish..."
                    required
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newMemory.message.length}/300</p>
                </div>
                <button
                  type="submit"
                  disabled={submittingMemory}
                  className={`${styles.button} text-white font-semibold py-3 px-8 rounded-full transition-all w-full disabled:opacity-50`}
                >
                  {submittingMemory ? 'Posting...' : 'Post Memory'}
                </button>
              </form>
            </motion.div>

            {/* Memories List */}
            {memories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow p-12 text-center"
              >
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-2xl font-bold mb-2">No memories yet</h3>
                <p className="text-gray-600">Be the first to share a memory!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {memories.map((memory, index) => {
                  const createdAt = memory.createdAt?.toDate?.() || new Date(memory.createdAt)
                  return (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{memory.name}</p>
                          <p className="text-xs text-gray-500">
                            {createdAt.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {isOwner() && (
                          <button
                            onClick={() => handleDeleteMemory(memory.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title="Delete memory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">{memory.message}</p>
                      
                      {/* Reactions */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleMemoryReaction(memory.id, 'heart')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all hover:scale-110 ${
                            (memory.reactions?.heart || []).includes(getGuestId()) 
                              ? 'bg-pink-100 text-pink-600' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span>❤️</span>
                          <span className="text-xs font-semibold">
                            {(memory.reactions?.heart || []).length || ''}
                          </span>
                        </button>
                        <button
                          onClick={() => handleMemoryReaction(memory.id, 'laugh')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all hover:scale-110 ${
                            (memory.reactions?.laugh || []).includes(getGuestId()) 
                              ? 'bg-yellow-100 text-yellow-600' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span>😂</span>
                          <span className="text-xs font-semibold">
                            {(memory.reactions?.laugh || []).length || ''}
                          </span>
                        </button>
                        <button
                          onClick={() => handleMemoryReaction(memory.id, 'cry')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all hover:scale-110 ${
                            (memory.reactions?.cry || []).includes(getGuestId()) 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span>🥹</span>
                          <span className="text-xs font-semibold">
                            {(memory.reactions?.cry || []).length || ''}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600">
        <p className="flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-pink-600 fill-pink-600" /> using OneKnot
        </p>
      </footer>
    </div>
  )
}

