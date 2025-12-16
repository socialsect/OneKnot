import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWedding } from '../contexts/WeddingContext'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Heart, Copy, Check, Share2, ExternalLink, MessageSquare, Calendar, Camera, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function InvitePreview() {
  const { slug } = useParams()
  const { getWeddingBySlug } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadWedding()
  }, [slug])

  const loadWedding = async () => {
    try {
      const weddingData = await getWeddingBySlug(slug)
      setWedding(weddingData)

      if (weddingData) {
        // Load events for quick access
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
      }
    } catch (error) {
      console.error('Error loading wedding:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = `${window.location.origin}/w/${slug}`
  const inviteUrl = `${window.location.origin}/invite/${slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `You're invited to ${wedding?.partner1Name} & ${wedding?.partner2Name}'s wedding! ${inviteUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <Heart className="w-16 h-16 text-accent-primary mx-auto mb-4 animate-pulse fill-accent-primary" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invite...</p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Invite not found</h1>
        </div>
      </div>
    )
  }

  const weddingDate = wedding.weddingDate?.toDate?.() || new Date(wedding.weddingDate)

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-border p-8 md:p-12 max-w-2xl w-full"
      >
        {/* Invite Design */}
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 mx-auto mb-4 text-accent-primary fill-accent-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            You're Invited!
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-accent-primary mb-4">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h2>
          <div className="text-xl text-gray-600 mb-2">
            {weddingDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div className="text-lg text-gray-500">
            {wedding.city}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mb-8">
          <p className="text-center text-gray-700 mb-6">
            Join us as we celebrate our special day. We can't wait to share this moment with you!
          </p>
          
          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <Link
              to={`/w/${slug}`}
              className="block w-full btn-primary flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Wedding Website
            </Link>
            
            {events.length > 0 && (
              <Link
                to={`/event/${events[0].id}`}
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                RSVP Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Quick Links */}
          {wedding && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link
                to={`/gallery/${wedding.id}`}
                className="flex flex-col items-center justify-center p-4 bg-surface-secondary hover:bg-surface rounded-xl transition-all group"
              >
                <Camera className="w-6 h-6 text-accent-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-gray-700">View Gallery</span>
              </Link>
              <Link
                to={`/w/${slug}`}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all group"
              >
                <MessageSquare className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-gray-700">Memory Wall</span>
              </Link>
            </div>
          )}
        </div>

        {/* Share Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Share This Invite</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all hover:scale-105 shadow-md"
            >
              <MessageSquare className="w-5 h-5" />
              Share on WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all hover:scale-105 shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center break-all">{inviteUrl}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

