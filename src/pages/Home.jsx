import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Calendar, Camera, ArrowRight, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-600">OneKnot</h1>
          <div className="flex gap-4">
            {currentUser ? (
              <Link to="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
                <Link to="/login" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-block mb-6"
        >
          <Heart className="w-16 h-16 text-pink-600 fill-pink-600 mx-auto" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Your Wedding, One Link
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Create a beautiful digital wedding experience. Invites, website, RSVP, gallery, and more—all in one place.
        </p>
        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/login" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 w-fit mx-auto hover:scale-105 transition-transform">
              Create Your Wedding Link
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <Mail className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Digital Invites</h3>
            <p className="text-gray-600">Beautiful, shareable invites that your guests will love</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <Calendar className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">RSVP & Events</h3>
            <p className="text-gray-600">Easy RSVP tracking and event management</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <Camera className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Shared Gallery</h3>
            <p className="text-gray-600">Collect and share all your wedding memories</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

