import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWedding } from '../contexts/WeddingContext'
import { motion } from 'framer-motion'

export default function Login() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const { signInWithGoogle, login, signUp, currentUser, loading: authLoading } = useAuth()
  const { getUserWeddings } = useWedding()
  const navigate = useNavigate()
  const hasRedirected = useRef(false)
  const isSigningUp = useRef(false)

  // Memoize the redirect handler to avoid dependency issues
  const handleRedirect = useCallback(async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[Login] Auth still loading, waiting...')
      return
    }
    
    // If user is logged in and we haven't redirected yet, redirect IMMEDIATELY
    if (currentUser && !hasRedirected.current) {
      console.log('[Login] User is logged in, starting redirect process...', {
        userId: currentUser.uid,
        email: currentUser.email,
        pathname: window.location.pathname,
        href: window.location.href
      })
      hasRedirected.current = true
      setRedirecting(true)
      
      // If this is a new signup, always go to create page
      if (isSigningUp.current) {
        console.log('[Login] New signup, redirecting to /create')
        isSigningUp.current = false
        window.location.replace('/create')
        return
      }
      
      // For existing users, try to get weddings quickly, but don't wait too long
      // Use a very short timeout to ensure redirect happens quickly
      try {
        console.log('[Login] Fetching user weddings (quick check)...')
        const userWeddings = await Promise.race([
          getUserWeddings(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
        ])
        
        console.log('[Login] User weddings fetched:', userWeddings?.length || 0, 'weddings')
        
        if (userWeddings && userWeddings.length > 0) {
          const targetUrl = `/dashboard/${userWeddings[0].id}`
          console.log('[Login] Redirecting to dashboard:', targetUrl)
          window.location.replace(targetUrl)
          return
        }
      } catch (err) {
        console.log('[Login] Could not fetch weddings quickly, redirecting to /create:', err.message)
      }
      
      // Default: redirect to /create (will check for weddings there)
      console.log('[Login] Redirecting to /create')
      window.location.replace('/create')
    }
  }, [currentUser, authLoading, getUserWeddings])

  // Check for Google redirect completion on mount
  useEffect(() => {
    // Check if we have auth-related query params (from Google redirect)
    const urlParams = new URLSearchParams(window.location.search)
    const hasAuthParams = urlParams.has('apiKey') || urlParams.has('authType') || window.location.hash.includes('auth')
    
    if (hasAuthParams) {
      console.log('[Login] Detected auth redirect params in URL, waiting for auth state...')
      // Clean up URL params after a moment
      setTimeout(() => {
        if (window.location.search || window.location.hash) {
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, '', cleanUrl)
        }
      }, 100)
    }
  }, [])

  // Handle redirect when auth state changes - this is critical for Google sign-in
  useEffect(() => {
    console.log('[Login] useEffect triggered - currentUser:', currentUser ? currentUser.email : 'null', 'authLoading:', authLoading, 'hasRedirected:', hasRedirected.current, 'pathname:', window.location.pathname)
    
    // If user is authenticated and we haven't redirected yet, redirect immediately
    // This handles the case after Google sign-in redirect
    if (currentUser && !authLoading && !hasRedirected.current) {
      console.log('[Login] User authenticated, triggering redirect immediately')
      handleRedirect()
    }
  }, [currentUser, authLoading, handleRedirect])

  // AGGRESSIVE FALLBACK: If user is authenticated but still on login page after 500ms, force redirect
  useEffect(() => {
    if (currentUser && !authLoading) {
      const fallbackTimer = setTimeout(() => {
        // Check if we're still on login page
        if (window.location.pathname === '/login' || window.location.pathname.startsWith('/login')) {
          console.log('[Login] FALLBACK: Still on login page after 500ms, forcing redirect to /create')
          window.location.replace('/create')
        }
      }, 500)
      
      return () => clearTimeout(fallbackTimer)
    }
  }, [currentUser, authLoading])

  // Reset hasRedirected when user logs out (component stays mounted)
  useEffect(() => {
    if (!currentUser && !authLoading) {
      console.log('[Login] User logged out, resetting redirect flag')
      hasRedirected.current = false
      setRedirecting(false)
    }
  }, [currentUser, authLoading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Validate name for signup
        if (!name.trim()) {
          setError('Please enter your name')
          setLoading(false)
          return
        }
        // Mark that we're signing up
        isSigningUp.current = true
        await signUp(email, password, name.trim())
        // Don't navigate here - let the useEffect handle it after currentUser updates
        // The auth state change will trigger the redirect
      } else {
        await login(email, password)
        // Don't navigate here - let the useEffect handle it after currentUser updates
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate')
      setLoading(false)
      isSigningUp.current = false
    }
  }


  // IMMEDIATELY show loading/redirecting state if user is authenticated
  // Don't even render the form if user is logged in
  if (currentUser || authLoading || redirecting) {
    console.log('[Login] Rendering redirecting screen - currentUser:', currentUser ? currentUser.email : 'null', 'authLoading:', authLoading, 'redirecting:', redirecting)
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-primary border-t-transparent mx-auto"></div>
          <p className="mt-6 text-accent-primary text-xl font-semibold">Redirecting...</p>
        </div>
      </div>
    )
  }

  console.log('[Login] Rendering login form')

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/logo.png" 
              alt="OneKnot Logo" 
              className="h-12 w-12 object-contain"
            />
            <span className="text-4xl font-bold text-accent-primary">OneKnot</span>
          </Link>
          <h2 className="text-3xl font-bold mt-6 text-text-primary">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-text-secondary mt-3 text-lg">
            {isSignUp ? 'Join OneKnot and start planning your perfect wedding' : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        {error && (
          <div className="bg-alert/10 border border-alert text-alert px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-base font-semibold text-text-primary mb-3">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="input-field"
                placeholder="John Doe"
                minLength={2}
              />
            </div>
          )}
          
          <div>
            <label className="block text-base font-semibold text-text-primary mb-3">
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
            <label className="block text-base font-semibold text-text-primary mb-3">
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
            {isSignUp && (
              <p className="text-sm text-text-secondary mt-2">
                Must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="text-center mt-8 text-text-secondary text-base">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                setIsSignUp(false)
                setName('')
                setEmail('')
                setPassword('')
                setError('')
              }}
                className="text-accent-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(true)
                  setName('')
                  setEmail('')
                  setPassword('')
                  setError('')
                }}
                className="text-accent-primary font-semibold hover:underline"
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


