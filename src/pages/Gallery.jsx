import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, increment, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useWedding } from '../contexts/WeddingContext'
import { Trash2, Heart, Upload, X, Pin, PinOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Gallery() {
  const { weddingId } = useParams()
  const { currentUser } = useAuth()
  const { getWeddingById } = useWedding()
  const [wedding, setWedding] = useState(null)
  const [photos, setPhotos] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [weddingId])

  const loadData = async () => {
    try {
      // Load wedding to check ownership
      const weddingData = await getWeddingById(weddingId)
      setWedding(weddingData)

      // Load gallery
      const galleryQuery = query(
        collection(db, 'weddings', weddingId, 'gallery')
      )
      const gallerySnapshot = await getDocs(galleryQuery)
      const photosList = gallerySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure reactions structure exists
          reactions: doc.data().reactions || {
            heart: [],
            laugh: [],
            cry: []
          }
        }))
        .sort((a, b) => {
          // Pinned items first
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          // Then sort by uploadedAt (newest first)
          const aTime = a.uploadedAt?.toMillis?.() || 
                       a.uploadedAt?.seconds * 1000 || 
                       new Date(a.uploadedAt).getTime() || 0
          const bTime = b.uploadedAt?.toMillis?.() || 
                       b.uploadedAt?.seconds * 1000 || 
                       new Date(b.uploadedAt).getTime() || 0
          return bTime - aTime
        })
      setPhotos(photosList)
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const isOwner = () => {
    return currentUser && wedding && wedding.ownerId === currentUser.uid
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    const filesToUpload = [...selectedFiles]
    setSelectedFiles([])
    
    // Create upload tasks for all files
    const uploadTasks = filesToUpload.map((file, index) => ({
      id: `upload_${Date.now()}_${index}`,
      file,
      progress: 0,
      status: 'uploading', // uploading, success, error
      error: null
    }))

    setUploadingFiles(uploadTasks)

    // Upload each file
    for (let i = 0; i < uploadTasks.length; i++) {
      const task = uploadTasks[i]
      try {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `weddings/${weddingId}/${Date.now()}_${i}_${task.file.name}`)
        
        // Simulate progress (Firebase doesn't provide upload progress in web SDK easily)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(t => 
            t.id === task.id ? { ...t, progress: Math.min(t.progress + 10, 90) } : t
          ))
        }, 200)

        await uploadBytes(storageRef, task.file)
        clearInterval(progressInterval)
        
        const downloadURL = await getDownloadURL(storageRef)

        // Save to Firestore subcollection
        await addDoc(collection(db, 'weddings', weddingId, 'gallery'), {
          url: downloadURL,
          fileName: task.file.name,
          uploadedAt: serverTimestamp(),
          reactions: {
            heart: [],
            laugh: [],
            cry: []
          },
          pinned: false,
          type: task.file.type.startsWith('video/') ? 'video' : 'photo'
        })

        // Mark as success
        setUploadingFiles(prev => prev.map(t => 
          t.id === task.id ? { ...t, progress: 100, status: 'success' } : t
        ))

        // Reload gallery after a short delay
        setTimeout(() => {
          loadData()
        }, 500)
      } catch (error) {
        console.error('Error uploading file:', error)
        setUploadingFiles(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'error', error: error.message } : t
        ))
      }
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploadingFiles([])
      document.getElementById('file-input').value = ''
    }, 3000)
  }

  const handleDelete = async (photoId, photoUrl) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    setDeletingId(photoId)
    try {
      // Delete from Storage
      // Extract path from full URL
      try {
        const urlParts = photoUrl.split('/o/')
        if (urlParts.length > 1) {
          const decodedPath = decodeURIComponent(urlParts[1].split('?')[0])
          const imageRef = ref(storage, decodedPath)
          await deleteObject(imageRef)
        }
      } catch (error) {
        console.error('Error deleting from storage:', error)
        // Continue even if storage delete fails
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'weddings', weddingId, 'gallery', photoId))
      
      // Remove from local state
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getGuestId = () => {
    let guestId = localStorage.getItem('galleryGuestId')
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('galleryGuestId', guestId)
    }
    return guestId
  }

  const handleReaction = async (photoId, reactionType) => {
    try {
      const photo = photos.find(p => p.id === photoId)
      if (!photo) return

      const guestId = getGuestId()
      const currentReactions = photo.reactions || { heart: [], laugh: [], cry: [] }
      const reactionArray = currentReactions[reactionType] || []
      
      // Toggle reaction
      const hasReacted = reactionArray.includes(guestId)
      const updatedReactions = {
        ...currentReactions,
        [reactionType]: hasReacted
          ? reactionArray.filter(id => id !== guestId)
          : [...reactionArray, guestId]
      }

      const photoRef = doc(db, 'weddings', weddingId, 'gallery', photoId)
      await updateDoc(photoRef, {
        reactions: updatedReactions
      })
      
      // Update local state immediately
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, reactions: updatedReactions } : p
      ))
    } catch (error) {
      console.error('Error reacting to photo:', error)
    }
  }

  const handlePinToggle = async (photoId, currentPinned) => {
    if (!isOwner()) return
    
    try {
      const photoRef = doc(db, 'weddings', weddingId, 'gallery', photoId)
      await updateDoc(photoRef, {
        pinned: !currentPinned
      })
      loadData()
    } catch (error) {
      console.error('Error pinning photo:', error)
      alert('Failed to pin/unpin photo. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Gallery</h1>
          <Link to={`/w/${weddingId}`} className="text-pink-600 hover:underline">
            ← Back to Website
          </Link>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Photos & Videos
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="cursor-pointer flex-1">
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                      : 'Click to select files (multiple files supported)'}
                  </p>
                </div>
              </label>
              {selectedFiles.length > 0 && (
                <button
                  onClick={() => setSelectedFiles([])}
                  className="btn-secondary whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadingFiles.length > 0}
                className="btn-primary whitespace-nowrap flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploadingFiles.length > 0 ? 'Uploading...' : 'Upload'}
              </button>
            </div>

            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
              <div className="space-y-2">
                {uploadingFiles.map(task => (
                  <div key={task.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate">{task.file.name}</span>
                      <span className="text-gray-500">
                        {task.status === 'success' ? '✓ Done' : 
                         task.status === 'error' ? '✗ Error' : 
                         `${task.progress}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          task.status === 'success' ? 'bg-green-500' :
                          task.status === 'error' ? 'bg-red-500' :
                          'bg-pink-600'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    {task.error && (
                      <p className="text-xs text-red-600">{task.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {photos.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-xl"
          >
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold mb-2">No photos yet</h3>
            <p className="text-gray-600 mb-6">Be the first to upload memories from the wedding!</p>
            <p className="text-sm text-gray-500">Share your favorite moments with everyone</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
                className="relative group bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition-all"
              >
                {photo.type === 'video' ? (
                  <video
                    src={photo.url}
                    className="w-full h-64 object-cover"
                    controls
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={photo.url}
                    alt={photo.fileName}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                  />
                )}
                {/* Pinned Badge */}
                {photo.pinned && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex flex-col items-center justify-center gap-2">
                  {/* Reaction Buttons */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full transition-opacity">
                    <button
                      onClick={() => handleReaction(photo.id, 'heart')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all hover:scale-110 ${
                        (photo.reactions?.heart || []).includes(getGuestId()) 
                          ? 'bg-pink-100 text-pink-600' 
                          : 'hover:bg-gray-100'
                      }`}
                      title="❤️ Love"
                    >
                      <span className="text-lg">❤️</span>
                      <span className="text-xs font-semibold">
                        {(photo.reactions?.heart || []).length || ''}
                      </span>
                    </button>
                    <button
                      onClick={() => handleReaction(photo.id, 'laugh')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all hover:scale-110 ${
                        (photo.reactions?.laugh || []).includes(getGuestId()) 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'hover:bg-gray-100'
                      }`}
                      title="😂 Laugh"
                    >
                      <span className="text-lg">😂</span>
                      <span className="text-xs font-semibold">
                        {(photo.reactions?.laugh || []).length || ''}
                      </span>
                    </button>
                    <button
                      onClick={() => handleReaction(photo.id, 'cry')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all hover:scale-110 ${
                        (photo.reactions?.cry || []).includes(getGuestId()) 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'hover:bg-gray-100'
                      }`}
                      title="🥹 Tears of joy"
                    >
                      <span className="text-lg">🥹</span>
                      <span className="text-xs font-semibold">
                        {(photo.reactions?.cry || []).length || ''}
                      </span>
                    </button>
                  </div>
                  
                  {/* Admin Actions */}
                  {isOwner() && (
                    <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 flex gap-2 transition-opacity">
                      <button
                        onClick={() => handlePinToggle(photo.id, photo.pinned)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                        title={photo.pinned ? "Unpin photo" : "Pin photo"}
                      >
                        {photo.pinned ? (
                          <PinOff className="w-4 h-4" />
                        ) : (
                          <Pin className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id, photo.url)}
                        disabled={deletingId === photo.id}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                        title="Delete photo"
                      >
                        {deletingId === photo.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


