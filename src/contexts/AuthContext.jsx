import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Google Sign In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      // Use redirect instead of popup to avoid COOP issues
      // This will redirect the entire page to Google, then back to the app
      await signInWithRedirect(auth, provider)
      // The redirect will happen immediately, so this code won't execute
    } catch (error) {
      console.error('Google sign in error:', error)
      // Convert Firebase error codes to user-friendly messages
      let errorMessage = 'Failed to sign in with Google. Please try again.'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      throw new Error(errorMessage)
    }
  }

  // Email Sign Up
  const signUp = async (email, password, displayName = null) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      // Convert Firebase error codes to user-friendly messages
      let errorMessage = 'Failed to create account. Please try again.'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.'
      } else if (error.message) {
        errorMessage = error.message
      }
      throw new Error(errorMessage)
    }
  }

  // Email Sign In
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Login error:', error)
      // Convert Firebase error codes to user-friendly messages
      let errorMessage = 'Failed to sign in. Please try again.'
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.'
      } else if (error.message) {
        errorMessage = error.message
      }
      throw new Error(errorMessage)
    }
  }

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  useEffect(() => {
    let isMounted = true

    console.log('[AuthContext] Initializing auth state listener...')

    // Check for redirect result on mount (for Google sign-in)
    // This is called first to catch redirect results immediately
    getRedirectResult(auth)
      .then((result) => {
        console.log('[AuthContext] getRedirectResult:', result ? 'User found' : 'No redirect result')
        if (result && isMounted) {
          // User signed in via redirect - onAuthStateChanged will also fire
          console.log('[AuthContext] Redirect result found:', result.user?.email)
        }
      })
      .catch((error) => {
        console.error('[AuthContext] Redirect result error:', error)
        // Continue - onAuthStateChanged will handle the auth state
      })

    // This listener will fire for all auth state changes (including redirect results)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[AuthContext] onAuthStateChanged fired:', user ? `User: ${user.email}` : 'No user')
      if (isMounted) {
        setCurrentUser(user)
        setLoading(false)
        console.log('[AuthContext] Auth state updated - currentUser:', user ? user.email : 'null', 'loading: false')
      }
    })

    return () => {
      console.log('[AuthContext] Cleaning up auth listener')
      isMounted = false
      unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signUp,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

