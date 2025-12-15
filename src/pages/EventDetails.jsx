import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, addDoc, getDocs, updateDoc, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Bell, Clock, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function EventDetails() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [rsvp, setRsvp] = useState({ status: '', guestName: '', guestEmail: '', phoneNumber: '', plusOne: false, message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [existingRsvpId, setExistingRsvpId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [eventUpdates, setEventUpdates] = useState([])

  useEffect(() => {
    loadEvent()
  }, [eventId])

  useEffect(() => {
    if (event?.weddingId) {
      checkExistingRSVP(event.weddingId)
    }
  }, [event, eventId])

  const loadEvent = async () => {
    try {
      // Since we only have eventId, we need to find which wedding it belongs to
      // Query all weddings' events subcollections to find the event
      // Note: This is inefficient but necessary since route only has eventId
      // In production, consider changing route to include weddingId
      const weddingsQuery = query(collection(db, 'weddings'))
      const weddingsSnapshot = await getDocs(weddingsQuery)
      
      for (const weddingDoc of weddingsSnapshot.docs) {
        const eventRef = doc(db, 'weddings', weddingDoc.id, 'events', eventId)
        const eventSnap = await getDoc(eventRef)
        if (eventSnap.exists()) {
          const eventData = { 
            id: eventSnap.id, 
            weddingId: weddingDoc.id,
            ...eventSnap.data() 
          }
          setEvent(eventData)
          
          // Load event-specific updates
          const updatesQuery = query(
            collection(db, 'weddings', weddingDoc.id, 'updates'),
            where('eventId', '==', eventId),
            orderBy('createdAt', 'desc')
          )
          const updatesSnapshot = await getDocs(updatesQuery)
          const updatesList = updatesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setEventUpdates(updatesList)
          break
        }
      }
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkExistingRSVP = async (weddingId) => {
    if (!weddingId) return
    
    try {
      // Check if there's an existing RSVP (using localStorage as guest identifier)
      const guestId = localStorage.getItem('guestId') || `guest_${Date.now()}`
      localStorage.setItem('guestId', guestId)
      
      const rsvpsQuery = query(
        collection(db, 'weddings', weddingId, 'rsvps'),
        where('eventId', '==', eventId),
        where('guestId', '==', guestId)
      )
      const rsvpsSnapshot = await getDocs(rsvpsQuery)
      if (!rsvpsSnapshot.empty) {
        const existingRsvpDoc = rsvpsSnapshot.docs[0]
        const existingRsvp = existingRsvpDoc.data()
        setExistingRsvpId(existingRsvpDoc.id)
        setRsvp({
          status: existingRsvp.status,
          guestName: existingRsvp.guestName || '',
          guestEmail: existingRsvp.guestEmail || '',
          phoneNumber: existingRsvp.phoneNumber || '',
          plusOne: existingRsvp.plusOne || false,
          message: existingRsvp.message || ''
        })
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error checking RSVP:', error)
    }
  }

  const handleRSVP = async (status) => {
    if (!rsvp.guestName || !rsvp.guestEmail) {
      alert('Please enter your name and email')
      return
    }

    try {
      const guestId = localStorage.getItem('guestId') || `guest_${Date.now()}`
      localStorage.setItem('guestId', guestId)

      if (!event?.weddingId) {
        alert('Event not found. Please try again.')
        return
      }

      const rsvpData = {
        eventId,
        status,
        guestName: rsvp.guestName,
        guestEmail: rsvp.guestEmail,
        phoneNumber: rsvp.phoneNumber || '',
        plusOne: rsvp.plusOne,
        guestId,
        message: rsvp.message || '',
        updatedAt: new Date()
      }
      
      // Only add submittedAt for new RSVPs
      if (!existingRsvpId) {
        rsvpData.submittedAt = new Date()
      }

      if (existingRsvpId) {
        // Update existing RSVP
        await updateDoc(doc(db, 'weddings', event.weddingId, 'rsvps', existingRsvpId), rsvpData)
      } else {
        // Create new RSVP
        await addDoc(collection(db, 'weddings', event.weddingId, 'rsvps'), rsvpData)
      }

      setRsvp(prev => ({ ...prev, status }))
      setSubmitted(true)

      // Send RSVP confirmation email if email provided
      if (rsvp.guestEmail && rsvp.guestEmail.trim()) {
        try {
          // Load wedding data for email
          const weddingRef = doc(db, 'weddings', event.weddingId)
          const weddingSnap = await getDoc(weddingRef)
          const weddingData = weddingSnap.exists() ? { id: weddingSnap.id, ...weddingSnap.data() } : null
          
          if (weddingData) {
            const websiteUrl = `${window.location.origin}/w/${weddingData.slug}`
            const weddingName = `${weddingData.partner1Name} & ${weddingData.partner2Name}`
            
            await fetch('/api/send-update-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                recipientEmails: [rsvp.guestEmail.trim()],
                weddingName: weddingName,
                updateMessage: status,
                eventName: event.name,
                timeUpdate: null,
                mapLink: null,
                websiteUrl: websiteUrl,
                emailType: 'rsvp-confirmation'
              })
            })
          }
        } catch (error) {
          console.error('Error sending RSVP confirmation email:', error)
          // Don't show error to user - RSVP was successful
        }
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      alert('Failed to submit RSVP. Please try again.')
    }
  }

  const handleEditRSVP = () => {
    setSubmitted(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Event not found</h1>
          <Link to="/" className="text-pink-600 hover:underline">Go home</Link>
        </div>
      </div>
    )
  }

  const eventDate = event.date?.toDate?.() || new Date(event.date)

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.name}</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-2xl">📅</span>
              <span className="text-lg">
                {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            
            {event.time && (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🕐</span>
                <span className="text-lg">{event.time}</span>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">📍</span>
                <div>
                  <span className="text-lg">{event.location}</span>
                  {event.locationAddress && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(event.locationAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-pink-600 hover:underline text-sm mt-1"
                    >
                      View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {event.dressCode && (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">👗</span>
                <div>
                  <span className="font-semibold">Dress Code: </span>
                  <span className="text-lg">{event.dressCode}</span>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Event Updates Section */}
          {eventUpdates.length > 0 && (
            <div className="mb-8 border-t border-gray-200 pt-8">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold">Important Updates</h2>
              </div>
              <div className="space-y-4">
                {eventUpdates.map((update, index) => {
                  const createdAt = update.createdAt?.toDate?.() || new Date(update.createdAt)
                  const timeAgo = formatTimeAgo(createdAt)
                  const isLatest = index === 0
                  
                  return (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-orange-50 border-l-4 ${isLatest ? 'border-orange-500' : 'border-orange-300'} rounded-lg p-5`}
                    >
                      {isLatest && (
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-3">
                          ⭐ LATEST
                        </div>
                      )}
                      <p className="text-lg text-gray-800 mb-3 whitespace-pre-wrap leading-relaxed">
                        {update.message}
                      </p>
                      {(update.timeUpdate || update.mapLink) && (
                        <div className="bg-white rounded-lg p-3 space-y-2">
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
                      <p className="text-sm text-gray-500 mt-3">Updated {timeAgo}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* FAQs Section */}
          {event.faqs && event.faqs.length > 0 && (
            <div className="mb-8 border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {event.faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-5"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-start gap-2">
                      <span className="text-pink-600">Q:</span>
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-gray-700 ml-6 leading-relaxed">
                      <span className="text-pink-600 font-medium">A: </span>
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* RSVP Section */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-6">RSVP</h2>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Thank you for your RSVP!
                </h3>
                <div className="bg-white rounded-lg p-4 mb-4 inline-block">
                  <p className="text-green-700 font-semibold mb-1">Your Response:</p>
                  <p className="text-2xl font-bold text-green-800 capitalize">{rsvp.status}</p>
                </div>
                {rsvp.message && (
                  <div className="bg-white rounded-lg p-4 mb-4 max-w-md mx-auto">
                    <p className="text-sm text-gray-600 mb-1">Your message:</p>
                    <p className="text-gray-800 italic">"{rsvp.message}"</p>
                  </div>
                )}
                <p className="text-green-700 mb-4">
                  We're {rsvp.status === 'yes' ? 'excited' : rsvp.status === 'maybe' ? 'hopeful' : 'sorry'} to {rsvp.status === 'yes' ? 'celebrate with you' : rsvp.status === 'maybe' ? 'see you there' : 'miss you'}!
                </p>
                <button
                  onClick={handleEditRSVP}
                  className="text-green-700 hover:text-green-800 underline text-sm"
                >
                  Change my RSVP
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={rsvp.guestName}
                    onChange={(e) => setRsvp(prev => ({ ...prev, guestName: e.target.value }))}
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
                    value={rsvp.guestEmail}
                    onChange={(e) => setRsvp(prev => ({ ...prev, guestEmail: e.target.value }))}
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
                    value={rsvp.phoneNumber}
                    onChange={(e) => setRsvp(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="input-field"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="plusOne"
                    checked={rsvp.plusOne}
                    onChange={(e) => setRsvp(prev => ({ ...prev, plusOne: e.target.checked }))}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="plusOne" className="text-gray-700">
                    I'm bringing a plus one
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={rsvp.message}
                    onChange={(e) => setRsvp(prev => ({ ...prev, message: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Excited to celebrate with you! 🎉"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{rsvp.message.length}/200 characters</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleRSVP('yes')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                  >
                    ✓ Yes, I'll be there!
                  </button>
                  <button
                    onClick={() => handleRSVP('maybe')}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                  >
                    ? Maybe
                  </button>
                  <button
                    onClick={() => handleRSVP('no')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                  >
                    ✗ Can't make it
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

