import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useWedding } from '../contexts/WeddingContext'
import { Bell, Plus, X, Trash2, MapPin, Clock, MessageSquare, Copy, Check, Mail, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UpdatesManagement() {
  const { weddingId } = useParams()
  const { getWeddingById } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [events, setEvents] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    message: '',
    eventId: '', // Empty string = entire wedding, otherwise specific event
    mapLink: '',
    timeUpdate: ''
  })
  const [copiedId, setCopiedId] = useState(null)
  const [guests, setGuests] = useState([])
  const [sendingEmail, setSendingEmail] = useState(null)
  const [showEmailModal, setShowEmailModal] = useState(null)
  const [emailRecipients, setEmailRecipients] = useState([])

  useEffect(() => {
    loadData()
  }, [weddingId])

  const loadData = async () => {
    try {
      if (weddingId) {
        const weddingData = await getWeddingById(weddingId)
        setWedding(weddingData)
      }

      // Load events
      const eventsQuery = query(
        collection(db, 'weddings', weddingId, 'events'),
        orderBy('date', 'asc')
      )
      const eventsSnapshot = await getDocs(eventsQuery)
      const eventsList = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setEvents(eventsList)

      // Load updates
      const updatesQuery = query(
        collection(db, 'weddings', weddingId, 'updates'),
        orderBy('createdAt', 'desc')
      )
      const updatesSnapshot = await getDocs(updatesQuery)
      const updatesList = updatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUpdates(updatesList)

      // Load guests for email sending
      const guestsQuery = query(
        collection(db, 'weddings', weddingId, 'guests')
      )
      const guestsSnapshot = await getDocs(guestsQuery)
      const guestsList = guestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setGuests(guestsList)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.message.trim()) {
      alert('Please enter a message')
      return
    }

    try {
      await addDoc(collection(db, 'weddings', weddingId, 'updates'), {
        message: formData.message.trim(),
        eventId: formData.eventId || null, // null = entire wedding
        mapLink: formData.mapLink.trim() || null,
        timeUpdate: formData.timeUpdate.trim() || null,
        createdAt: serverTimestamp()
      })

      // Reset form
      setFormData({
        message: '',
        eventId: '',
        mapLink: '',
        timeUpdate: ''
      })
      setShowForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating update:', error)
      alert('Failed to create update. Please try again.')
    }
  }

  const handleDelete = async (updateId) => {
    if (!confirm('Are you sure you want to delete this update?')) return

    try {
      await deleteDoc(doc(db, 'weddings', weddingId, 'updates', updateId))
      loadData()
    } catch (error) {
      console.error('Error deleting update:', error)
      alert('Failed to delete update. Please try again.')
    }
  }

  const copyMessage = (update) => {
    let text = update.message
    if (update.timeUpdate) {
      text += `\n\n⏰ Time: ${update.timeUpdate}`
    }
    if (update.mapLink) {
      text += `\n\n📍 Location: ${update.mapLink}`
    }
    navigator.clipboard.writeText(text)
    setCopiedId(update.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shareWhatsApp = (update) => {
    let text = update.message
    if (update.timeUpdate) {
      text += `\n\n⏰ Time: ${update.timeUpdate}`
    }
    if (update.mapLink) {
      text += `\n\n📍 Location: ${update.mapLink}`
    }
    const url = `${window.location.origin}/w/${wedding.slug}`
    text += `\n\nView full details: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const copyLocation = (mapLink) => {
    navigator.clipboard.writeText(mapLink)
    setCopiedId('location')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getEventName = (eventId) => {
    if (!eventId) return 'Entire Wedding'
    const event = events.find(e => e.id === eventId)
    return event ? event.name : 'Unknown Event'
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

  const getEligibleRecipients = (update) => {
    return guests.filter(guest => {
      // Must have email
      if (!guest.email) return false
      
      // Must have consent
      if (!guest.emailConsent) return false
      
      // If update is event-specific, guest must be invited to that event
      if (update.eventId) {
        return guest.eventsInvitedTo && guest.eventsInvitedTo.includes(update.eventId)
      }
      
      // If update is for entire wedding, guest just needs consent
      return true
    })
  }

  const handleSendEmailClick = (update) => {
    const recipients = getEligibleRecipients(update)
    setEmailRecipients(recipients)
    setShowEmailModal(update.id)
  }

  const handleSendEmail = async (update) => {
    const recipients = getEligibleRecipients(update)
    
    if (recipients.length === 0) {
      alert('No eligible recipients found. Guests must have email addresses, consent to receive emails, and be invited to the relevant event (if event-specific).')
      setShowEmailModal(null)
      return
    }

    setSendingEmail(update.id)
    
    try {
      const event = update.eventId ? events.find(e => e.id === update.eventId) : null
      const websiteUrl = `${window.location.origin}/w/${wedding.slug}`
      
      const response = await fetch('/api/send-update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmails: recipients.map(g => g.email),
          weddingName: `${wedding.partner1Name} & ${wedding.partner2Name}`,
          updateMessage: update.message,
          eventName: event ? event.name : null,
          timeUpdate: update.timeUpdate || null,
          mapLink: update.mapLink || null,
          websiteUrl: websiteUrl,
          emailType: 'update'
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert(`Email sent successfully to ${result.sent} recipient${result.sent !== 1 ? 's' : ''}.${result.failed > 0 ? ` ${result.failed} failed.` : ''}`)
      } else {
        throw new Error(result.error || 'Failed to send emails')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send emails. Please check your Resend API configuration.')
    } finally {
      setSendingEmail(null)
      setShowEmailModal(null)
      setEmailRecipients([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading updates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link
              to={`/dashboard/${weddingId}`}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Guest Updates & Alerts</h1>
            {wedding && (
              <p className="text-gray-600">
                {wedding.partner1Name} & {wedding.partner2Name}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Update
          </button>
        </div>

        {/* Create Update Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Update</h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({
                    message: '',
                    eventId: '',
                    mapLink: '',
                    timeUpdate: ''
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="input-field"
                  rows={4}
                  placeholder="Important update for guests..."
                  required
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  For
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Entire Wedding</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time Update (optional)
                </label>
                <input
                  type="text"
                  value={formData.timeUpdate}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeUpdate: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., 'Event starts at 6:00 PM' or 'Delayed by 30 minutes'"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Google Maps Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.mapLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
                  className="input-field"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      message: '',
                      eventId: '',
                      mapLink: '',
                      timeUpdate: ''
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Post Update
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Updates List */}
        {updates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow p-12 text-center"
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No updates yet</h3>
            <p className="text-gray-600 mb-6">Create your first update to keep guests informed</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create Update
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => {
              const isLatest = index === 0
              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow p-6 ${isLatest ? 'ring-2 ring-pink-500' : ''}`}
                >
                  {isLatest && (
                    <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                      ⭐ Latest Update
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-pink-600" />
                        <span className="text-sm font-semibold text-gray-600">
                          {getEventName(update.eventId)}
                        </span>
                        <span className="text-xs text-gray-400">
                          • {formatTimeAgo(update.createdAt)}
                        </span>
                      </div>
                      <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {update.message}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete update"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {(update.timeUpdate || update.mapLink) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                      {update.timeUpdate && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-pink-600" />
                          <span className="font-medium">{update.timeUpdate}</span>
                        </div>
                      )}
                      {update.mapLink && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-pink-600" />
                          <a
                            href={update.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline break-all"
                          >
                            {update.mapLink}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Share Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => copyMessage(update)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                    >
                      {copiedId === update.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Message
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => shareWhatsApp(update)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Share WhatsApp
                    </button>
                    <button
                      onClick={() => handleSendEmailClick(update)}
                      disabled={sendingEmail === update.id}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingEmail === update.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Send Email
                        </>
                      )}
                    </button>
                    {update.mapLink && (
                      <button
                        onClick={() => copyLocation(update.mapLink)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm transition-colors"
                      >
                        {copiedId === 'location' ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            Copy Location
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Email Confirmation Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold mb-4">Send Update Email</h3>
              <p className="text-gray-600 mb-4">
                This will send an email to guests who have:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                <li>Provided an email address</li>
                <li>Consented to receive updates</li>
                <li>Been invited to the relevant event (if event-specific)</li>
              </ul>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-1">Recipients:</p>
                <p className="text-2xl font-bold text-pink-600">{emailRecipients.length}</p>
                {emailRecipients.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {emailRecipients.map(guest => (
                      <p key={guest.id} className="text-xs text-gray-600">{guest.name} ({guest.email})</p>
                    ))}
                  </div>
                )}
              </div>
              {emailRecipients.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-yellow-800">
                    No eligible recipients found. Make sure guests have email addresses and consent in the Guest Directory.
                  </p>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEmailModal(null)
                    setEmailRecipients([])
                  }}
                  className="btn-secondary flex-1"
                  disabled={sendingEmail === showEmailModal}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const update = updates.find(u => u.id === showEmailModal)
                    if (update) handleSendEmail(update)
                  }}
                  disabled={emailRecipients.length === 0 || sendingEmail === showEmailModal}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail === showEmailModal ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
