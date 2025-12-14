import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWedding } from '../contexts/WeddingContext'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, login, signUp, currentUser, loading: authLoading } = useAuth()
  const { getUserWeddings, weddings } = useWedding()
  const navigate = useNavigate()
  const hasRedirected = useRef(false)

  // Redirect after login - check if user has weddings
  useEffect(() => {
    const redirectAfterLogin = async () => {
      // Wait for auth to finish loading and user to be set
      if (!authLoading && currentUser && !hasRedirected.current) {
        hasRedirected.current = true
        // Clear the redirect flag
        sessionStorage.removeItem('googleSignInRedirect')
        
        try {
          // Wait a moment for contexts to be ready
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Get user's weddings - wait for it to complete
          const userWeddings = await getUserWeddings()
          
          // Additional small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 200))
          
          if (userWeddings && userWeddings.length > 0) {
            // User has weddings - redirect to dashboard
            console.log('Redirecting to dashboard:', userWeddings[0].id)
            navigate(`/dashboard/${userWeddings[0].id}`, { replace: true })
          } else {
            // No weddings - redirect to create page
            console.log('No weddings found, redirecting to create')
            navigate('/create', { replace: true })
          }
        } catch (err) {
          console.error('Error checking weddings:', err)
          // On error, default to create page
          navigate('/create', { replace: true })
        }
      }
    }
    
    redirectAfterLogin()
  }, [currentUser, authLoading, navigate, getUserWeddings])

  // Reset redirect flag if component unmounts or user changes
  useEffect(() => {
    return () => {
      // Reset on unmount to allow redirect on next mount
      if (!currentUser) {
        hasRedirected.current = false
      }
    }
  }, [currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        // New users go to create page - mark as redirected to prevent useEffect
        hasRedirected.current = true
        navigate('/create')
      } else {
        await login(email, password)
        // For existing users, let the useEffect handle the redirect
        // It will check for weddings and redirect appropriately
        // Don't set hasRedirected here - let useEffect handle it
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate')
      setLoading(false)
      // Reset redirect flag on error
      hasRedirected.current = false
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      // Store that we're initiating a redirect to prevent loops
      sessionStorage.setItem('googleSignInRedirect', 'true')
      // signInWithRedirect will redirect the page, so we don't navigate here
      await signInWithGoogle()
      // The redirect will happen, and getRedirectResult will handle it in AuthContext
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
      sessionStorage.removeItem('googleSignInRedirect')
    }
    // Don't set loading to false here - the redirect will happen
  }

  // Don't show login form if user is authenticated (redirect is in progress)
  if (!authLoading && currentUser && hasRedirected.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="OneKnot Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-3xl font-bold text-pink-600">OneKnot</span>
          </Link>
          <h2 className="text-2xl font-bold mt-4">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Start creating your wedding link' : 'Sign in to continue'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-full transition-colors duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <p className="text-center mt-6 text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-pink-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-pink-600 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  )
}


