import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useWedding } from '../contexts/WeddingContext'
import { UserPlus, Mail, User, Trash2, Edit2, X, Save, Crown, Shield, Eye } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactsManagement() {
  const { weddingId } = useParams()
  const { getWeddingById } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [collaborators, setCollaborators] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'viewer'
  })

  useEffect(() => {
    loadData()
  }, [weddingId])

  const loadData = async () => {
    try {
      if (weddingId) {
        const weddingData = await getWeddingById(weddingId)
        setWedding(weddingData)
        setCollaborators(weddingData?.collaborators || [])
      }

      // Load guests from RSVPs subcollection
      const rsvpsQuery = query(
        collection(db, 'weddings', weddingId, 'rsvps')
      )
      const rsvpsSnapshot = await getDocs(rsvpsQuery)
      const uniqueGuests = new Map()
      rsvpsSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.guestEmail) {
          if (!uniqueGuests.has(data.guestEmail)) {
            uniqueGuests.set(data.guestEmail, {
              email: data.guestEmail,
              name: data.guestName || 'Guest',
              rsvpCount: 0,
              messages: []
            })
          }
          uniqueGuests.get(data.guestEmail).rsvpCount++
          if (data.message && data.message.trim()) {
            uniqueGuests.get(data.guestEmail).messages.push({
              message: data.message,
              status: data.status,
              eventId: data.eventId
            })
          }
        }
      })
      setGuests(Array.from(uniqueGuests.values()))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCollaborator = async (e) => {
    e.preventDefault()
    try {
      const newCollaborator = {
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        role: formData.role,
        userId: null, // Will be set when they accept invitation
        invitedAt: new Date()
      }

      const updatedCollaborators = [...collaborators, newCollaborator]
      
      await updateDoc(doc(db, 'weddings', weddingId), {
        collaborators: updatedCollaborators
      })

      setCollaborators(updatedCollaborators)
      setFormData({ email: '', name: '', role: 'viewer' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding collaborator:', error)
      alert('Failed to add collaborator. Please try again.')
    }
  }

  const handleDeleteCollaborator = async (index) => {
    if (!confirm('Remove this collaborator?')) return

    try {
      const updated = collaborators.filter((_, i) => i !== index)
      await updateDoc(doc(db, 'weddings', weddingId), {
        collaborators: updated
      })
      setCollaborators(updated)
    } catch (error) {
      console.error('Error deleting collaborator:', error)
      alert('Failed to remove collaborator.')
    }
  }

  const handleUpdateRole = async (index, newRole) => {
    try {
      const updated = [...collaborators]
      updated[index].role = newRole
      await updateDoc(doc(db, 'weddings', weddingId), {
        collaborators: updated
      })
      setCollaborators(updated)
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />
      case 'admin': return <Shield className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
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
            <h1 className="text-4xl font-bold mb-2">Contacts & People</h1>
            {wedding && (
              <p className="text-gray-600">
                {wedding.partner1Name} & {wedding.partner2Name}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Collaborator
          </button>
        </div>

        {/* Add Collaborator Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Collaborator</h2>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ email: '', name: '', role: 'viewer' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCollaborator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="input-field"
                  placeholder="collaborator@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (optional)
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
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="input-field"
                >
                  <option value="viewer">Viewer (read-only)</option>
                  <option value="admin">Admin (can edit)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ email: '', name: '', role: 'viewer' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Add Collaborator
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Collaborators Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <User className="w-6 h-6" />
            Collaborators ({collaborators.length})
          </h2>
          {collaborators.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No collaborators yet. Add one to get started!</p>
          ) : (
            <div className="space-y-3">
              {collaborators.map((collab, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                      {getRoleIcon(collab.role)}
                    </div>
                    <div>
                      <p className="font-semibold">{collab.name || collab.email}</p>
                      <p className="text-sm text-gray-500">{collab.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {collab.role !== 'owner' && (
                      <>
                        <select
                          value={collab.role}
                          onChange={(e) => handleUpdateRole(index, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-3 py-1"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDeleteCollaborator(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {collab.role === 'owner' && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        Owner
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Guests Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Guests ({guests.length})
          </h2>
          {guests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">👥</div>
              <p className="text-gray-600 font-medium mb-2">No guests have RSVP'd yet</p>
              <p className="text-sm text-gray-500">Guests will appear here once they RSVP to events</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {guests.map((guest, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="w-5 h-5" />
                    </div>
                  <div className="flex-1">
                    <p className="font-semibold">{guest.name}</p>
                    <p className="text-sm text-gray-500">{guest.email}</p>
                    {guest.messages && guest.messages.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {guest.messages.map((msg, idx) => (
                          <p key={idx} className="text-xs text-gray-600 italic bg-gray-100 px-2 py-1 rounded">
                            "{msg.message}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 text-right">
                  <div>{guest.rsvpCount} RSVP{guest.rsvpCount !== 1 ? 's' : ''}</div>
                  {guest.messages && guest.messages.length > 0 && (
                    <div className="text-xs text-pink-600 mt-1">
                      {guest.messages.length} note{guest.messages.length !== 1 ? 's' : ''}
                    </div>
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


