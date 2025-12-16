import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="text-9xl font-bold text-accent-primary opacity-20">404</div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 mb-8"
        >
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/"
            className="bg-accent-primary hover:bg-accent-secondary text-white font-bold text-lg px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="bg-white text-accent-primary font-semibold text-lg px-8 py-4 rounded-full border-2 border-accent-primary hover:bg-surface-secondary transition-all shadow-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 bg-white rounded-2xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Search className="w-5 h-5 text-accent-primary" />
            Popular Pages
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="text-accent-primary hover:text-pink-700 hover:underline font-medium"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="text-accent-primary hover:text-pink-700 hover:underline font-medium"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
