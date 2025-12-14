import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { motion } from 'framer-motion'

export default function FindMyPhotos() {
  const { weddingId } = useParams()
  const [uploadedSelfie, setUploadedSelfie] = useState(false)
  const [selfieFile, setSelfieFile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)

  // TODO: Implement face recognition AI
  // This is a placeholder UI. In production, you would:
  // 1. Upload selfie to backend/AI service
  // 2. Use face recognition to match faces in gallery photos
  // 3. Return filtered photos containing the user's face
  const handleSelfieUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelfieFile(file)
      setUploadedSelfie(true)
      setLoading(true)

      // TODO: Send selfie to AI service for face recognition
      // const formData = new FormData()
      // formData.append('selfie', file)
      // const response = await fetch('/api/find-photos', {
      //   method: 'POST',
      //   body: formData
      // })
      // const matchedPhotos = await response.json()

      // Mock: Simulate AI processing
      setTimeout(async () => {
        try {
          // For now, just load all photos (mock behavior)
          const galleryQuery = query(
            collection(db, 'weddings', weddingId, 'gallery')
          )
          const gallerySnapshot = await getDocs(galleryQuery)
          const photosList = gallerySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .slice(0, 10) // Mock: return first 10 as "matched" photos

          setPhotos(photosList)
        } catch (error) {
          console.error('Error loading photos:', error)
        } finally {
          setLoading(false)
        }
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find My Photos</h1>
            <p className="text-lg text-gray-600">
              Upload a selfie and we'll find all photos of you from the wedding!
            </p>
          </div>

          {!uploadedSelfie ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <label className="cursor-pointer inline-block">
                  <div className="w-64 h-64 mx-auto border-4 border-dashed border-pink-300 rounded-full flex items-center justify-center hover:border-pink-500 transition-colors">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📸</div>
                      <p className="text-lg font-semibold text-gray-700">Upload Your Selfie</p>
                      <p className="text-sm text-gray-500 mt-2">Click to select</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSelfieUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                We use AI face recognition to find all photos containing your face. 
                Your selfie is only used for matching and is not stored.
              </p>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Finding your photos...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Our AI is scanning through all wedding photos
                  </p>
                </div>
              ) : (
                <>
                  {selfieFile && (
                    <div className="mb-6 text-center">
                      <img
                        src={URL.createObjectURL(selfieFile)}
                        alt="Your selfie"
                        className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-pink-300"
                      />
                      <button
                        onClick={() => {
                          setUploadedSelfie(false)
                          setPhotos([])
                          setSelfieFile(null)
                        }}
                        className="text-sm text-pink-600 hover:underline"
                      >
                        Upload different photo
                      </button>
                    </div>
                  )}

                  {photos.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">😔</div>
                      <p className="text-xl text-gray-600 mb-2">No photos found</p>
                      <p className="text-gray-500">
                        We couldn't find any photos matching your face. Try uploading a clearer selfie.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          Found {photos.length} photos of you!
                        </h2>
                        <p className="text-gray-600">
                          These photos were matched using AI face recognition
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                          <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group"
                          >
                            {photo.type === 'video' ? (
                              <video
                                src={photo.url}
                                className="w-full h-48 object-cover rounded-lg"
                                controls
                              />
                            ) : (
                              <img
                                src={photo.url}
                                alt="Matched photo"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <Link
              to={`/gallery/${weddingId}`}
              className="text-pink-600 hover:underline"
            >
              ← View All Photos
            </Link>
          </div>
        </motion.div>

        {/* TODO Comment for developers */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Developer Note:</strong> This is a placeholder UI. To implement face recognition:
            <br />
            1. Integrate with a face recognition API (e.g., AWS Rekognition, Google Cloud Vision, or Face API)
            <br />
            2. Upload selfie to backend service
            <br />
            3. Process all gallery photos to extract faces
            <br />
            4. Match faces and return filtered results
            <br />
            5. Consider privacy and data handling regulations
          </p>
        </div>
      </div>
    </div>
  )
}


