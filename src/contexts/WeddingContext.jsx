import { createContext, useContext, useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'

const WeddingContext = createContext()

export function useWedding() {
  const context = useContext(WeddingContext)
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider')
  }
  return context
}

export function WeddingProvider({ children }) {
  const { currentUser } = useAuth()
  const [weddings, setWeddings] = useState([])
  const [currentWedding, setCurrentWedding] = useState(null)
  const [loading, setLoading] = useState(false)

  // Create a new wedding
  const createWedding = async (weddingData) => {
    try {
      const weddingRef = await addDoc(collection(db, 'weddings'), {
        ...weddingData,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        collaborators: [{
          userId: currentUser.uid,
          role: 'owner',
          email: currentUser.email
        }]
      })
      return weddingRef.id
    } catch (error) {
      console.error('Error creating wedding:', error)
      throw error
    }
  }

  // Get wedding by slug
  const getWeddingBySlug = async (slug) => {
    try {
      const q = query(collection(db, 'weddings'), where('slug', '==', slug))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting wedding by slug:', error)
      throw error
    }
  }

  // Get wedding by ID
  const getWeddingById = async (weddingId) => {
    try {
      const weddingRef = doc(db, 'weddings', weddingId)
      const weddingSnap = await getDoc(weddingRef)
      if (weddingSnap.exists()) {
        return { id: weddingSnap.id, ...weddingSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting wedding:', error)
      throw error
    }
  }

  // Get user's weddings
  const getUserWeddings = async () => {
    if (!currentUser) return []
    
    try {
      // Query without orderBy to avoid index requirement
      // We'll sort in JavaScript instead
      const q = query(
        collection(db, 'weddings'),
        where('ownerId', '==', currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      const weddingsList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort by createdAt if available (newest first)
          const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
          const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
          return bTime - aTime
        })
      
      setWeddings(weddingsList)
      return weddingsList
    } catch (error) {
      console.error('Error getting user weddings:', error)
      return []
    }
  }

  // Update wedding
  const updateWedding = async (weddingId, updates) => {
    try {
      const weddingRef = doc(db, 'weddings', weddingId)
      // Convert Date to Firestore Timestamp if weddingDate is being updated
      const processedUpdates = { ...updates }
      if (processedUpdates.weddingDate instanceof Date) {
        processedUpdates.weddingDate = Timestamp.fromDate(processedUpdates.weddingDate)
      }
      await updateDoc(weddingRef, {
        ...processedUpdates,
        updatedAt: serverTimestamp()
      })
      // Refresh current wedding if it's the one being updated
      if (currentWedding && currentWedding.id === weddingId) {
        const updated = await getWeddingById(weddingId)
        setCurrentWedding(updated)
      }
    } catch (error) {
      console.error('Error updating wedding:', error)
      throw error
    }
  }

  // Load user weddings on mount
  useEffect(() => {
    if (currentUser) {
      getUserWeddings()
    }
  }, [currentUser])

  const value = {
    weddings,
    currentWedding,
    setCurrentWedding,
    createWedding,
    getWeddingBySlug,
    getWeddingById,
    getUserWeddings,
    updateWedding,
    loading
  }

  return (
    <WeddingContext.Provider value={value}>
      {children}
    </WeddingContext.Provider>
  )
}

