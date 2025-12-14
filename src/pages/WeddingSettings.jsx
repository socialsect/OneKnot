import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWedding } from '../contexts/WeddingContext'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase'
import { Settings, Save, X, Upload, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const themes = [
  { id: 'classic', name: 'Classic', color: 'bg-rose-200' },
  { id: 'modern', name: 'Modern', color: 'bg-pink-200' },
  { id: 'rustic', name: 'Rustic', color: 'bg-amber-200' },
  { id: 'beach', name: 'Beach', color: 'bg-blue-200' },
  { id: 'garden', name: 'Garden', color: 'bg-green-200' },
  { id: 'minimal', name: 'Minimal', color: 'bg-gray-200' },
]

export default function WeddingSettings() {
  const { weddingId } = useParams()
  const navigate = useNavigate()
  const { getWeddingById, updateWedding, getUserWeddings } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    weddingDate: '',
    city: '',
    theme: 'modern',
    story: '',
    coverImageUrl: ''
  })

  useEffect(() => {
    loadWedding()
  }, [weddingId])

  const loadWedding = async () => {
    try {
      const weddingData = await getWeddingById(weddingId)
      if (weddingData) {
        setWedding(weddingData)
        const weddingDate = weddingData.weddingDate?.toDate?.() || new Date(weddingData.weddingDate)
        const dateString = weddingDate.toISOString().split('T')[0]
        
        setFormData({
          partner1Name: weddingData.partner1Name || '',
          partner2Name: weddingData.partner2Name || '',
          weddingDate: dateString,
          city: weddingData.city || '',
          theme: weddingData.theme || 'modern',
          story: weddingData.story || '',
          coverImageUrl: weddingData.coverImageUrl || ''
        })
      }
    } catch (error) {
      console.error('Error loading wedding:', error)
      setError('Failed to load wedding details')
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

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploadingCover(true)
    setError('')

    try {
      // Delete old cover image if exists
      // Note: We need to extract the path from the full URL
      if (formData.coverImageUrl) {
        try {
          // Extract path from full URL (format: https://firebasestorage.googleapis.com/v0/b/.../o/weddings%2F...)
          const urlParts = formData.coverImageUrl.split('/o/')
          if (urlParts.length > 1) {
            const decodedPath = decodeURIComponent(urlParts[1].split('?')[0])
            const oldImageRef = ref(storage, decodedPath)
            await deleteObject(oldImageRef)
          }
        } catch (err) {
          console.error('Error deleting old image:', err)
          // Continue even if deletion fails
        }
      }

      // Upload new cover image
      const storageRef = ref(storage, `weddings/${weddingId}/cover_${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      setFormData(prev => ({ ...prev, coverImageUrl: downloadURL }))
    } catch (error) {
      console.error('Error uploading cover image:', error)
      setError('Failed to upload cover image. Please try again.')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleRemoveCoverImage = async () => {
    if (!formData.coverImageUrl) return

    try {
      // Extract path from full URL
      const urlParts = formData.coverImageUrl.split('/o/')
      if (urlParts.length > 1) {
        const decodedPath = decodeURIComponent(urlParts[1].split('?')[0])
        const imageRef = ref(storage, decodedPath)
        await deleteObject(imageRef)
      }
      setFormData(prev => ({ ...prev, coverImageUrl: '' }))
    } catch (error) {
      console.error('Error removing cover image:', error)
      setError('Failed to remove cover image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const updates = {
        partner1Name: formData.partner1Name,
        partner2Name: formData.partner2Name,
        weddingDate: new Date(formData.weddingDate),
        city: formData.city,
        theme: formData.theme,
        story: formData.story,
        coverImageUrl: formData.coverImageUrl
      }

      await updateWedding(weddingId, updates)
      await getUserWeddings() // Refresh weddings list
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        navigate(`/dashboard/${weddingId}`)
      }, 2000)
    } catch (error) {
      console.error('Error updating wedding:', error)
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wedding settings...</p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Wedding not found</h1>
          <Link to="/dashboard" className="text-pink-600 hover:underline">Back to Dashboard</Link>
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
            <Link
              to={`/dashboard/${weddingId}`}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-pink-600" />
            <h1 className="text-4xl font-bold">Wedding Settings</h1>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✓ Settings saved successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              {formData.coverImageUrl ? (
                <div className="relative">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg mb-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">No cover image</p>
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  disabled={uploadingCover}
                  className="hidden"
                />
                <div className="btn-secondary inline-flex items-center gap-2 mt-2">
                  <Upload className="w-4 h-4" />
                  {uploadingCover ? 'Uploading...' : formData.coverImageUrl ? 'Change Image' : 'Upload Cover Image'}
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-1">Recommended: 1920x1080px, max 5MB</p>
            </div>

            {/* Partner Names */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner 1 Name *
                </label>
                <input
                  type="text"
                  name="partner1Name"
                  value={formData.partner1Name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Alex"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner 2 Name *
                </label>
                <input
                  type="text"
                  name="partner2Name"
                  value={formData.partner2Name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Sam"
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wedding Date *
              </label>
              <input
                type="date"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="New York"
              />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.theme === theme.id
                        ? 'border-pink-600 ring-2 ring-pink-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-12 rounded ${theme.color} mb-2`}></div>
                    <p className="text-xs font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Story (optional)
              </label>
              <textarea
                name="story"
                value={formData.story}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Tell your guests about your love story..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link
                to={`/dashboard/${weddingId}`}
                className="btn-secondary flex-1"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || uploadingCover}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
