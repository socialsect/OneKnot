import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useWedding } from '../contexts/WeddingContext'
import { Mail, MessageSquare, UserPlus, X, Send, Users, Phone, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'

export default function InviteGuests() {
  const { weddingId } = useParams()
  const { getWeddingById } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sendEmail: true,
    sendSMS: false
  })
  const [bulkInvites, setBulkInvites] = useState('')

  useEffect(() => {
    loadData()
    // Initialize EmailJS (you'll need to add your public key)
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your-public-key')
  }, [weddingId])

  const loadData = async () => {
    try {
      if (weddingId) {
        const weddingData = await getWeddingById(weddingId)
        setWedding(weddingData)
      }

      // Load sent invitations from subcollection
      const invitesQuery = query(
        collection(db, 'weddings', weddingId, 'invitations')
      )
      const invitesSnapshot = await getDocs(invitesQuery)
      const invitesList = invitesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setInvitations(invitesList)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendEmailInvite = async (guestData) => {
    try {
      // Validate email
      if (!guestData.email || !guestData.email.includes('@')) {
        console.error('Invalid email address:', guestData.email)
        return false
      }

      const inviteUrl = `${window.location.origin}/invite/${wedding.slug}`
      const websiteUrl = `${window.location.origin}/w/${wedding.slug}`

      // Get first event for direct RSVP link
      let rsvpUrl = websiteUrl
      try {
        const eventsQuery = query(
          collection(db, 'weddings', weddingId, 'events'),
          orderBy('date', 'asc')
        )
        const eventsSnapshot = await getDocs(eventsQuery)
        if (!eventsSnapshot.empty) {
          const firstEvent = eventsSnapshot.docs[0]
          rsvpUrl = `${window.location.origin}/event/${firstEvent.id}`
        }
      } catch (error) {
        console.error('Error loading events for RSVP link:', error)
      }

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

      if (!serviceId || !templateId || !publicKey || serviceId === 'your-service-id') {
        console.warn('EmailJS not configured. Skipping email send.')
        return false
      }

      // Template parameters - IMPORTANT: Parameter names must match your EmailJS template
      // The "to_email" parameter MUST be configured in your EmailJS service as "To Email" field
      const templateParams = {
        to_name: guestData.name || guestData.email.split('@')[0],
        to_email: guestData.email, // This MUST match the "To Email" field in EmailJS service
        couple_names: `${wedding.partner1Name} & ${wedding.partner2Name}`,
        wedding_date: new Date(wedding.weddingDate?.toDate?.() || wedding.weddingDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        wedding_city: wedding.city || '',
        invite_url: inviteUrl,
        website_url: websiteUrl,
        rsvp_url: rsvpUrl,
        reply_to: wedding.ownerEmail || 'noreply@oneknot.app'
      }

      console.log('Sending email to:', guestData.email)
      console.log('Template params:', { ...templateParams, to_email: '***hidden***' })

      // Send via EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      )

      console.log('Email sent successfully:', response)
      return true
    } catch (error) {
      console.error('Email send error:', error)
      console.error('Error details:', {
        status: error.status,
        text: error.text,
        email: guestData.email
      })
      
      // Don't throw - allow invitation to be saved even if email fails
      return false
    }
  }

  const sendSMSInvite = async (guestData) => {
    try {
      // TODO: Integrate with Twilio or SMS service
      // For now, this is a placeholder
      // You'll need to set up a backend endpoint or use Twilio directly
      
      const inviteUrl = `${window.location.origin}/invite/${wedding.slug}`
      const message = `You're invited to ${wedding.partner1Name} & ${wedding.partner2Name}'s wedding! ${inviteUrl}`

      // Example: Call your backend API or Twilio
      // await fetch('/api/send-sms', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     to: guestData.phone,
      //     message: message
      //   })
      // })

      // For now, we'll just log it
      console.log('SMS would be sent to:', guestData.phone, message)
      
      // Return true for now (remove this when implementing real SMS)
      return true
    } catch (error) {
      console.error('SMS send error:', error)
      throw error
    }
  }

  const handleSendInvite = async (e) => {
    e.preventDefault()
    if (!formData.email && !formData.phone) {
      alert('Please provide either email or phone number')
      return
    }

    setSending(true)
    try {
      const inviteData = {
        guestName: formData.name,
        guestEmail: formData.email || null,
        guestPhone: formData.phone || null,
        sentAt: new Date(),
        emailSent: false,
        smsSent: false
      }

      // Send email if requested
      if (formData.sendEmail && formData.email) {
        try {
          const emailSent = await sendEmailInvite({
            name: formData.name || formData.email.split('@')[0],
            email: formData.email
          })
          inviteData.emailSent = emailSent
        } catch (error) {
          console.error('Failed to send email:', error)
          inviteData.emailSent = false
        }
      }

      // Send SMS if requested
      if (formData.sendSMS && formData.phone) {
        try {
          await sendSMSInvite({
            name: formData.name || formData.phone,
            phone: formData.phone
          })
          inviteData.smsSent = true
        } catch (error) {
          console.error('Failed to send SMS:', error)
        }
      }

      // Save invitation to Firestore subcollection
      await addDoc(collection(db, 'weddings', weddingId, 'invitations'), inviteData)

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        sendEmail: true,
        sendSMS: false
      })
      setShowForm(false)

      // Reload invitations
      loadData()

      alert('Invitation sent successfully!')
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleBulkInvite = async () => {
    if (!bulkInvites.trim()) {
      alert('Please enter email addresses or phone numbers')
      return
    }

    const lines = bulkInvites.split('\n').filter(line => line.trim())
    if (lines.length === 0) {
      alert('Please enter at least one email or phone number')
      return
    }

    setSending(true)
    let successCount = 0
    let failCount = 0

    for (const line of lines) {
      const trimmed = line.trim()
      const isEmail = trimmed.includes('@')
      const isPhone = /^\+?[\d\s-()]+$/.test(trimmed.replace(/\s/g, ''))

      if (!isEmail && !isPhone) {
        failCount++
        continue
      }

      try {
        const inviteData = {
          guestName: trimmed.split('@')[0] || trimmed,
          guestEmail: isEmail ? trimmed : null,
          guestPhone: isPhone ? trimmed : null,
          sentAt: new Date(),
          emailSent: false,
          smsSent: false
        }

        if (isEmail && inviteData.guestEmail) {
          try {
            const emailSent = await sendEmailInvite({
              name: inviteData.guestName,
              email: inviteData.guestEmail
            })
            inviteData.emailSent = emailSent
          } catch (error) {
            console.error('Failed to send email:', error)
            inviteData.emailSent = false
          }
        }

        if (isPhone) {
          try {
            await sendSMSInvite({
              name: inviteData.guestName,
              phone: inviteData.guestPhone
            })
            inviteData.smsSent = true
          } catch (error) {
            console.error('Failed to send SMS:', error)
          }
        }

        await addDoc(collection(db, 'weddings', weddingId, 'invitations'), inviteData)
        successCount++
      } catch (error) {
        console.error('Error sending invitation:', error)
        failCount++
      }
    }

    setBulkInvites('')
    setSending(false)
    alert(`Sent ${successCount} invitation(s). ${failCount} failed.`)
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitations...</p>
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
            <h1 className="text-4xl font-bold mb-2">Invite Guests</h1>
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
            <UserPlus className="w-5 h-5" />
            Invite Guest
          </button>
        </div>

        {/* Single Invite Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Send Invitation</h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    sendEmail: true,
                    sendSMS: false
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name (optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="guest@example.com"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <label htmlFor="sendEmail" className="text-sm text-gray-700 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Send email invitation
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                  placeholder="+1234567890"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="sendSMS"
                    checked={formData.sendSMS}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendSMS: e.target.checked }))}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <label htmlFor="sendSMS" className="text-sm text-gray-700 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Send SMS invitation
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      sendEmail: true,
                      sendSMS: false
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || (!formData.email && !formData.phone)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Bulk Invite */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Bulk Invite
          </h2>
          <p className="text-gray-600 mb-4">
            Enter email addresses or phone numbers (one per line). They will receive invitations automatically.
          </p>
          <textarea
            value={bulkInvites}
            onChange={(e) => setBulkInvites(e.target.value)}
            rows={6}
            className="input-field w-full"
            placeholder="guest1@example.com&#10;guest2@example.com&#10;+1234567890&#10;..."
          />
          <button
            onClick={handleBulkInvite}
            disabled={sending || !bulkInvites.trim()}
            className="btn-primary mt-4 flex items-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Bulk Invitations
              </>
            )}
          </button>
        </div>

        {/* Sent Invitations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Sent Invitations ({invitations.length})
          </h2>
          {invitations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">✉️</div>
              <p className="text-gray-600 font-medium mb-2">No invitations sent yet</p>
              <p className="text-sm text-gray-500">Start inviting guests to your wedding!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{invite.guestName || 'Guest'}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        {invite.guestEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {invite.guestEmail}
                          </span>
                        )}
                        {invite.guestPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {invite.guestPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invite.emailSent && (
                      <span className="text-green-600 flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Email
                      </span>
                    )}
                    {invite.smsSent && (
                      <span className="text-blue-600 flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        SMS
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

