import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useWedding } from '../contexts/WeddingContext'
import { UserPlus, X, Edit2, Trash2, Search, Filter, Mail, MailCheck, MailX } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GuestsManagement() {
  const { weddingId } = useParams()
  const { getWeddingById } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [events, setEvents] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventsInvitedTo: [],
    emailConsent: false
  })

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

      // Load guests
      const guestsQuery = query(
        collection(db, 'weddings', weddingId, 'guests'),
        orderBy('name', 'asc')
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
    if (!formData.name.trim()) {
      alert('Please enter a name')
      return
    }

    try {
      const guestData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        eventsInvitedTo: formData.eventsInvitedTo,
        emailConsent: formData.emailConsent,
        createdAt: editingGuest ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      if (editingGuest) {
        await updateDoc(doc(db, 'weddings', weddingId, 'guests', editingGuest.id), guestData)
      } else {
        await addDoc(collection(db, 'weddings', weddingId, 'guests'), guestData)
      }

      resetForm()
      loadData()
    } catch (error) {
      console.error('Error saving guest:', error)
      alert('Failed to save guest. Please try again.')
    }
  }

  const handleDelete = async (guestId) => {
    if (!confirm('Are you sure you want to delete this guest?')) return

    try {
      await deleteDoc(doc(db, 'weddings', weddingId, 'guests', guestId))
      loadData()
    } catch (error) {
      console.error('Error deleting guest:', error)
      alert('Failed to delete guest. Please try again.')
    }
  }

  const handleEdit = (guest) => {
    setEditingGuest(guest)
    setFormData({
      name: guest.name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      eventsInvitedTo: guest.eventsInvitedTo || [],
      emailConsent: guest.emailConsent || false
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      eventsInvitedTo: [],
      emailConsent: false
    })
    setEditingGuest(null)
    setShowForm(false)
  }

  const toggleEventInvite = (eventId) => {
    setFormData(prev => ({
      ...prev,
      eventsInvitedTo: prev.eventsInvitedTo.includes(eventId)
        ? prev.eventsInvitedTo.filter(id => id !== eventId)
        : [...prev.eventsInvitedTo, eventId]
    }))
  }

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = !searchQuery || 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesEvent = !eventFilter || 
      guest.eventsInvitedTo?.includes(eventFilter)
    
    return matchesSearch && matchesEvent
  })

  const getEventNames = (eventIds) => {
    if (!eventIds || eventIds.length === 0) return 'No events'
    return eventIds.map(id => {
      const event = events.find(e => e.id === id)
      return event ? event.name : 'Unknown'
    }).join(', ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guests...</p>
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
            <h1 className="text-4xl font-bold mb-2">Guest Directory</h1>
            {wedding && (
              <p className="text-gray-600">
                {wedding.partner1Name} & {wedding.partner2Name}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Manage your guest list and email preferences. Guests with email consent will receive important updates.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Guest
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="input-field pl-10"
            >
              <option value="">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingGuest ? 'Edit Guest' : 'Add Guest'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="John Doe"
                  required
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
                  placeholder="john@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used to send important wedding updates and RSVP confirmations
                </p>
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
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invited to Events
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {events.length === 0 ? (
                    <p className="text-sm text-gray-500">No events created yet</p>
                  ) : (
                    events.map(event => (
                      <label key={event.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.eventsInvitedTo.includes(event.id)}
                          onChange={() => toggleEventInvite(event.id)}
                          className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm">{event.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="emailConsent"
                  checked={formData.emailConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailConsent: e.target.checked }))}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 mt-0.5"
                />
                <label htmlFor="emailConsent" className="text-sm text-gray-700 cursor-pointer">
                  I agree to receive wedding-related updates via email
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingGuest ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Guests List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {filteredGuests.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">
                {guests.length === 0 
                  ? 'No guests added yet. Add your first guest to get started.'
                  : 'No guests match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuests.map(guest => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{guest.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{guest.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {getEventNames(guest.eventsInvitedTo)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {guest.email && guest.emailConsent ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <MailCheck className="w-4 h-4" />
                            <span className="text-xs">Yes</span>
                          </span>
                        ) : guest.email ? (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <MailX className="w-4 h-4" />
                            <span className="text-xs">No</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(guest)}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Total guests: {guests.length} | Showing: {filteredGuests.length}</p>
        </div>
      </div>
    </div>
  )
}

