import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useWedding } from '../contexts/WeddingContext'
import { motion } from 'framer-motion'

export default function EventsManagement() {
  const { weddingId } = useParams()
  const navigate = useNavigate()
  const { getWeddingById } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    locationAddress: '',
    dressCode: '',
    faqs: []
  })

  useEffect(() => {
    loadData()
  }, [weddingId])

  const loadData = async () => {
    try {
      // Load wedding
      if (weddingId) {
        const weddingData = await getWeddingById(weddingId)
        setWedding(weddingData)
      }

      // Load events from subcollection
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
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const eventData = {
        ...formData,
        date: Timestamp.fromDate(new Date(formData.date)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      if (editingEvent) {
        // Update existing event
        await updateDoc(doc(db, 'weddings', weddingId, 'events', editingEvent.id), {
          ...eventData,
          updatedAt: serverTimestamp()
        })
      } else {
        // Create new event in subcollection
        await addDoc(collection(db, 'weddings', weddingId, 'events'), eventData)
      }

      // Reset form and reload
      setFormData({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        locationAddress: '',
        dressCode: ''
      })
      setShowForm(false)
      setEditingEvent(null)
      loadData()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    const eventDate = event.date?.toDate?.() || new Date(event.date)
    const dateString = eventDate.toISOString().split('T')[0]
    
    setFormData({
      name: event.name || '',
      description: event.description || '',
      date: dateString,
      time: event.time || '',
      location: event.location || '',
      locationAddress: event.locationAddress || '',
      dressCode: event.dressCode || '',
      faqs: event.faqs || []
    })
    setShowForm(true)
  }

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteDoc(doc(db, 'weddings', weddingId, 'events', eventId))
      loadData()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
    setFormData({
      name: '',
      description: '',
      date: '',
      time: '',
      location: '',
      locationAddress: '',
      dressCode: '',
      faqs: []
    })
  }

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }))
  }

  const updateFAQ = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }))
  }

  const removeFAQ = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
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
              <Link
                to={`/dashboard/${weddingId}`}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Events</h1>
            {wedding && (
              <p className="text-gray-600">
                {wedding.partner1Name} & {wedding.partner2Name}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setEditingEvent(null)
              setShowForm(true)
            }}
            className="btn-primary"
          >
            + Add Event
          </button>
        </div>

        {/* Event Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Ceremony, Reception, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input-field"
                  placeholder="Event description..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Venue name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address (for Google Maps)
                </label>
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dress Code
                </label>
                <select
                  name="dressCode"
                  value={formData.dressCode}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select dress code</option>
                  <option value="Formal">Formal</option>
                  <option value="Semi-Formal">Semi-Formal</option>
                  <option value="Casual">Casual</option>
                  <option value="Black Tie">Black Tie</option>
                  <option value="Cocktail">Cocktail</option>
                  <option value="Beach Casual">Beach Casual</option>
                </select>
              </div>

              {/* FAQs Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    FAQs (Frequently Asked Questions)
                  </label>
                  <button
                    type="button"
                    onClick={addFAQ}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    + Add FAQ
                  </button>
                </div>
                {formData.faqs.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No FAQs added yet</p>
                ) : (
                  <div className="space-y-4">
                    {formData.faqs.map((faq, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-gray-600">FAQ #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeFAQ(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                            className="input-field text-sm"
                            placeholder="Question (e.g., What time should I arrive?)"
                          />
                        </div>
                        <div>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                            className="input-field text-sm"
                            rows={2}
                            placeholder="Answer..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow p-12 text-center"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create Event
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const eventDate = event.date?.toDate?.() || new Date(event.date)
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
                      {event.description && (
                        <p className="text-gray-600 mb-3">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📅 {eventDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</span>
                        {event.time && <span>🕐 {event.time}</span>}
                        {event.location && <span>📍 {event.location}</span>}
                        {event.dressCode && (
                          <span>👗 {event.dressCode}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/event/${event.id}`}
                        target="_blank"
                        className="btn-secondary text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(event)}
                        className="btn-secondary text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


