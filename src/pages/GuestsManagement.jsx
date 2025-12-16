import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, writeBatch } from 'firebase/firestore'
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

  // Bulk import state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRows, setImportRows] = useState([])
  const [importParsing, setImportParsing] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSubmitting, setImportSubmitting] = useState(false)
  const [lastImportBatch, setLastImportBatch] = useState(null)

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

  // Helpers for bulk import
  const normalizeKey = (email, phone) => {
    const e = (email || '').trim().toLowerCase()
    const p = (phone || '').replace(/\s+/g, '')
    if (!e && !p) return ''
    return `${e}|${p}`
  }

  const handleDownloadSampleCsv = () => {
    const header = 'name,email,phone,events,consent\n'
    const sampleRow = 'John Doe,john@example.com,+1234567890,Reception|Ceremony,yes\n'
    const blob = new Blob([header + sampleRow], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'oneknot-guests-sample.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const buildImportRow = ({ id, name, email, phone, eventsText, consentRaw }) => {
    const trimmedName = name ? name.trim() : ''
    const trimmedEmail = email ? email.trim() : ''
    const trimmedPhone = phone ? phone.trim() : ''

    const errors = []

    // Map events by name to ids, or use selected event filter when empty
    let eventsInvitedTo = []
    if (eventsText && eventsText.trim()) {
      const names = eventsText.split('|').map(v => v.trim()).filter(Boolean)
      names.forEach(eventName => {
        const match = events.find(e => (e.name || '').toLowerCase() === eventName.toLowerCase())
        if (match) {
          eventsInvitedTo.push(match.id)
        } else {
          errors.push(`Event not found: ${eventName}`)
        }
      })
    } else if (eventFilter) {
      // Auto-assign selected event when events column is empty
      eventsInvitedTo = [eventFilter]
    }

    let emailConsent = false
    if (consentRaw === 'yes' || consentRaw === 'y' || consentRaw === 'true') {
      emailConsent = true
    }

    return {
      id,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      eventsText: eventsText || '',
      eventsInvitedTo,
      emailConsent,
      errors
    }
  }

  const parseCsvText = (text) => {
    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0)

    if (lines.length === 0) {
      return []
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const getIndex = (name) => headers.indexOf(name)

    const idxName = getIndex('name')
    const idxEmail = getIndex('email')
    const idxPhone = getIndex('phone')
    const idxEvents = getIndex('events')
    const idxConsent = getIndex('consent')

    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i]
      if (!raw) continue
      const cols = raw.split(',')

      const name = idxName >= 0 ? cols[idxName] || '' : ''
      const email = idxEmail >= 0 ? cols[idxEmail] || '' : ''
      const phone = idxPhone >= 0 ? cols[idxPhone] || '' : ''
      const eventsText = idxEvents >= 0 ? cols[idxEvents] || '' : ''
      const consentRaw = idxConsent >= 0 && cols[idxConsent] ? cols[idxConsent].trim().toLowerCase() : ''

      rows.push(
        buildImportRow({
          id: i,
          name,
          email,
          phone,
          eventsText,
          consentRaw
        })
      )
    }

    return rows
  }

  const handleCsvFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportParsing(true)
    setImportError('')

    try {
      const text = await file.text()
      const rows = parseCsvText(text)

      if (!rows.length) {
        setImportError('No valid rows found in CSV file.')
        setImportRows([])
      } else {
        setImportRows(rows)
      }
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setImportError('Failed to parse CSV file. Please check the format.')
      setImportRows([])
    } finally {
      setImportParsing(false)
    }
  }

  const handleImportRowChange = (rowId, field, value) => {
    setImportRows(prev =>
      prev.map(row => {
        if (row.id !== rowId) return row

        const updated = {
          ...row,
          [field]: value
        }

        // Rebuild row to recalculate events mapping and errors
        return buildImportRow({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          eventsText: updated.eventsText,
          consentRaw: updated.emailConsent ? 'yes' : 'no'
        })
      })
    )
  }

  const handleImportRowDelete = (rowId) => {
    setImportRows(prev => prev.filter(row => row.id !== rowId))
  }

  const handleConfirmImport = async () => {
    if (!weddingId) return

    if (!importRows.length) {
      alert('No rows to import. Please upload a CSV file first.')
      return
    }

    setImportSubmitting(true)

    try {
      const batch = writeBatch(db)

      // Existing guests map for duplicates
      const existingMap = new Map()
      guests.forEach(g => {
        const key = normalizeKey(g.email, g.phone)
        if (key) existingMap.set(key, true)
      })

      let successCount = 0
      let skippedMissingName = 0
      let skippedErrors = 0
      let skippedDuplicates = 0

      const usedKeys = new Set()

      const newGuestIds = []

      importRows.forEach(row => {
        const { name, email, phone, eventsInvitedTo, emailConsent, errors } = row

        if (!name || !name.trim()) {
          skippedMissingName++
          return
        }

        if (errors && errors.length > 0) {
          skippedErrors++
          return
        }

        const key = normalizeKey(email, phone)
        if (key) {
          if (existingMap.has(key) || usedKeys.has(key)) {
            skippedDuplicates++
            return
          }
          usedKeys.add(key)
        }

        const guestRef = doc(collection(db, 'weddings', weddingId, 'guests'))
        batch.set(guestRef, {
          name: name.trim(),
          email: email && email.trim() ? email.trim() : null,
          phone: phone && phone.trim() ? phone.trim() : null,
          eventsInvitedTo: eventsInvitedTo || [],
          emailConsent: !!emailConsent,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        newGuestIds.push(guestRef.id)
        successCount++
      })

      if (successCount === 0) {
        alert('No guests were imported. Please fix errors or duplicates and try again.')
        setImportSubmitting(false)
        return
      }

      await batch.commit()
      await loadData()

      setLastImportBatch({
        weddingId,
        guestIds: newGuestIds,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30000
      })

      alert(
        `Imported ${successCount} guest${successCount !== 1 ? 's' : ''}.` +
          (skippedMissingName ? ` Skipped ${skippedMissingName} without name.` : '') +
          (skippedErrors ? ` Skipped ${skippedErrors} with validation errors.` : '') +
          (skippedDuplicates ? ` Skipped ${skippedDuplicates} duplicates by email/phone.` : '')
      )

      setShowImportModal(false)
      setImportRows([])
      setImportError('')
    } catch (error) {
      console.error('Error importing guests:', error)
      alert('Failed to import guests. Please try again.')
    } finally {
      setImportSubmitting(false)
    }
  }

  const handleUndoImport = async () => {
    if (!lastImportBatch) return

    const now = Date.now()
    if (now > lastImportBatch.expiresAt) {
      alert('Undo window has expired. New guests will remain in the directory.')
      setLastImportBatch(null)
      return
    }

    try {
      const batch = writeBatch(db)
      lastImportBatch.guestIds.forEach(id => {
        const ref = doc(db, 'weddings', lastImportBatch.weddingId, 'guests', id)
        batch.delete(ref)
      })

      await batch.commit()
      await loadData()

      alert(`Undid import of ${lastImportBatch.guestIds.length} guest${lastImportBatch.guestIds.length !== 1 ? 's' : ''}.`)
    } catch (error) {
      console.error('Error undoing import:', error)
      alert('Failed to undo import. Please check guest list manually.')
    } finally {
      setLastImportBatch(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="bg-surface shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="OneKnot Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-2xl font-bold text-accent-primary">OneKnot</span>
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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <span className="font-medium">Import Guests</span>
            </button>
            <button
              onClick={() => {
                setEditingGuest(null)
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  eventsInvitedTo: eventFilter ? [eventFilter] : [],
                  emailConsent: false
                })
                setShowForm(true)
              }}
              className="btn-primary flex items-center gap-2"
              type="button"
            >
              <UserPlus className="w-5 h-5" />
              Add Guest
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-surface rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
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
            className="bg-surface rounded-xl shadow-lg p-6 mb-8"
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
                          className="w-4 h-4 text-accent-primary rounded focus:ring-pink-500"
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
                  className="w-5 h-5 text-accent-primary rounded focus:ring-pink-500 mt-0.5"
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
        <div className="bg-surface rounded-xl shadow overflow-hidden">
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
                <thead className="bg-bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Events</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Consent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                  {/* Quick Add Row */}
                  <tr className="bg-bg-primary border-t border-gray-200">
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        placeholder="Quick add name"
                        className="input-field text-xs py-1"
                        value={formData.quickName || ''}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            quickName: e.target.value
                          }))
                        }
                      />
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400">Email (use full form)</span>
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="input-field text-xs py-1"
                        value={formData.quickPhone || ''}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            quickPhone: e.target.value
                          }))
                        }
                      />
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="text-[10px] text-gray-500">
                        Auto-assigns selected event
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell" />
                    <td className="px-6 py-3 text-right">
                      <button
                        type="button"
                        className="btn-primary text-xs px-3 py-1"
                        onClick={async () => {
                          const name = (formData.quickName || '').trim()
                          const phone = (formData.quickPhone || '').trim()

                          if (!name) {
                            alert('Please enter a name')
                            return
                          }

                          try {
                            const quickGuest = {
                              name,
                              email: null,
                              phone: phone || null,
                              eventsInvitedTo: eventFilter ? [eventFilter] : [],
                              emailConsent: false,
                              createdAt: serverTimestamp(),
                              updatedAt: serverTimestamp()
                            }

                            await addDoc(collection(db, 'weddings', weddingId, 'guests'), quickGuest)
                            setFormData(prev => ({
                              ...prev,
                              quickName: '',
                              quickPhone: ''
                            }))
                            loadData()
                          } catch (error) {
                            console.error('Error adding quick guest:', error)
                            alert('Failed to add guest. Please try again.')
                          }
                        }}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-gray-200">
                  {filteredGuests.map(guest => (
                    <tr key={guest.id} className="hover:bg-bg-primary">
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
                            className="text-accent-primary hover:text-pink-900"
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

      {/* Import Guests Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold">Import Guests from CSV</h2>
                <p className="text-sm text-gray-500">
                  Upload a CSV file to quickly add many guests at once. No data is saved until you confirm the import.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportRows([])
                  setImportError('')
                }}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-2 border-b border-gray-200 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">1. Download sample CSV</h3>
                <p className="text-xs text-gray-500 mb-2">
                  Use the sample file as a starting point to avoid formatting issues.
                </p>
                <button
                  onClick={handleDownloadSampleCsv}
                  className="btn-secondary text-sm"
                  type="button"
                >
                  Download sample CSV
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">2. Upload completed CSV</h3>
                <p className="text-xs text-gray-500 mb-2">
                  Required column: name. Optional: email, phone, events, consent.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="block w-full text-sm text-gray-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-pink-50 file:text-pink-700
                             hover:file:bg-pink-100"
                />
                {importParsing && (
                  <p className="text-xs text-gray-500 mt-1">Parsing CSV file...</p>
                )}
                {importError && (
                  <p className="text-xs text-red-600 mt-1">{importError}</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">3. Review and edit before import</h3>
              {importRows.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No rows loaded yet. Upload a CSV file to see a preview here.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-72 overflow-y-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-bg-primary">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Events</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Consent</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-gray-200">
                        {importRows.map(row => {
                          const hasName = row.name && row.name.trim()
                          const hasErrors = row.errors && row.errors.length > 0
                          let rowClass = ''
                          if (!hasName) {
                            rowClass = 'bg-yellow-50'
                          } else if (hasErrors) {
                            rowClass = 'bg-red-50'
                          } else {
                            rowClass = 'bg-green-50'
                          }

                          return (
                          <tr key={row.id} className={rowClass}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) => handleImportRowChange(row.id, 'name', e.target.value)}
                                className="input-field text-xs py-1"
                                placeholder="Full name"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="email"
                                value={row.email}
                                onChange={(e) => handleImportRowChange(row.id, 'email', e.target.value)}
                                className="input-field text-xs py-1"
                                placeholder="Email"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="tel"
                                value={row.phone}
                                onChange={(e) => handleImportRowChange(row.id, 'phone', e.target.value)}
                                className="input-field text-xs py-1"
                                placeholder="Phone"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.eventsText || ''}
                                onChange={(e) => handleImportRowChange(row.id, 'eventsText', e.target.value)}
                                className="input-field text-xs py-1"
                                placeholder="Reception|Ceremony"
                              />
                              <p className="text-[10px] text-gray-400 mt-1">
                                Match event names exactly, separated by |
                              </p>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={row.emailConsent ? 'yes' : 'no'}
                                onChange={(e) =>
                                  handleImportRowChange(row.id, 'emailConsent', e.target.value === 'yes')
                                }
                                className="input-field text-xs py-1"
                              >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              {row.errors && row.errors.length > 0 ? (
                                <ul className="text-[10px] text-red-600 space-y-0.5">
                                  {row.errors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                  ))}
                                </ul>
                              ) : (
                                row.name && row.name.trim() ? (
                                  <span className="text-[10px] text-green-600">Ready</span>
                                ) : (
                                  <span className="text-[10px] text-yellow-700">Missing name</span>
                                )
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => handleImportRowDelete(row.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                                type="button"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 py-2 bg-bg-primary text-xs text-gray-600 flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                    <span>
                      Total rows: {importRows.length}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-green-700">
                        Ready: {importRows.filter(r => r.name && r.name.trim() && (!r.errors || r.errors.length === 0)).length}
                      </span>
                      <span className="text-yellow-700">
                        Incomplete (missing name): {importRows.filter(r => !r.name || !r.name.trim()).length}
                      </span>
                      <span className="text-red-700">
                        Invalid (errors): {importRows.filter(r => r.name && r.name.trim() && r.errors && r.errors.length > 0).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row gap-3 md:justify-end">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportRows([])
                  setImportError('')
                }}
                className="btn-secondary md:w-auto w-full"
                type="button"
                disabled={importSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="btn-primary md:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={importSubmitting || importRows.length === 0}
              >
                {importSubmitting ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Undo import banner */}
      {lastImportBatch && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center px-4 pointer-events-none">
          <div className="bg-surface shadow-lg rounded-full px-4 py-2 text-sm flex items-center gap-3 pointer-events-auto border border-gray-200">
            <span>
              Imported {lastImportBatch.guestIds.length} guest{lastImportBatch.guestIds.length !== 1 ? 's' : ''}. Undo available for a short time.
            </span>
            <button
              type="button"
              onClick={handleUndoImport}
              className="btn-secondary text-xs px-3 py-1"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

