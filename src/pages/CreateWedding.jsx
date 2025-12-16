import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWedding } from '../contexts/WeddingContext'
import { motion } from 'framer-motion'

const themes = [
  { id: 'classic', name: 'Classic', color: 'bg-rose-200' },
  { id: 'modern', name: 'Modern', color: 'bg-surface-secondary' },
  { id: 'rustic', name: 'Rustic', color: 'bg-amber-200' },
  { id: 'beach', name: 'Beach', color: 'bg-blue-200' },
  { id: 'garden', name: 'Garden', color: 'bg-green-200' },
  { id: 'minimal', name: 'Minimal', color: 'bg-gray-200' },
]

export default function CreateWedding() {
  const navigate = useNavigate()
  const { createWedding } = useWedding()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    weddingDate: '',
    city: '',
    theme: 'modern',
    slug: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateSlug = () => {
    const name1 = formData.partner1Name.toLowerCase().replace(/\s+/g, '')
    const name2 = formData.partner2Name.toLowerCase().replace(/\s+/g, '')
    const slug = `${name1}-${name2}-${Date.now().toString().slice(-6)}`
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const weddingId = await createWedding({
        ...formData,
        slug: formData.slug || `${formData.partner1Name.toLowerCase()}-${formData.partner2Name.toLowerCase()}-${Date.now()}`
      })
      navigate(`/dashboard/${weddingId}`)
    } catch (error) {
      console.error('Error creating wedding:', error)
      alert('Failed to create wedding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border p-8"
        >
          <h1 className="text-3xl font-bold mb-2">Create Your Wedding</h1>
          <p className="text-gray-600 mb-8">Let's set up your OneKnot wedding link</p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                        ? 'border-accent-primary ring-2 ring-accent-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-12 rounded ${theme.color} mb-2`}></div>
                    <p className="text-xs font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Wedding Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                  <span className="text-gray-500">oneknot.app/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      // Only allow lowercase letters, numbers, and hyphens
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      setFormData(prev => ({ ...prev, slug: value }))
                    }}
                    className="flex-1 bg-transparent outline-none"
                    placeholder="alex-sam-2024"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="btn-secondary whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Wedding'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

