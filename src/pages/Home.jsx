import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Calendar, Camera, ArrowRight, Clock, MessageSquare, Sparkles, CheckCircle, Share2, Settings, Users, MapPin, Mail, Phone, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="OneKnot Logo" 
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-pink-600">OneKnot</h1>
          </Link>
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
        className="container mx-auto px-4 py-16 md:py-24 text-center"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
        >
          Run Your Wedding<br />From One Link
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-800 mb-6 max-w-4xl mx-auto leading-relaxed font-medium"
        >
          OneKnot is a wedding command center.
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Share events, locations, dress codes, live updates, RSVPs, and photos — so you don't spend your wedding answering the same questions all day.
        </motion.p>
        
        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg px-10 py-4 rounded-full flex items-center gap-2 hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
            >
              Create Your Wedding Link
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-600">
              Takes 2 minutes • Free to start
            </p>
          </motion.div>
        )}
        
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/dashboard" 
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg px-10 py-4 rounded-full flex items-center gap-2 w-fit mx-auto hover:scale-105 transition-all shadow-xl"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                <Bell className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Live Guest Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                Send one update and everyone sees it. Share last-minute changes, locations, timings, and instructions without creating WhatsApp chaos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Clear Events, Zero Confusion</h3>
              <p className="text-gray-600 leading-relaxed">
                Guests see exactly what's happening today — time, location, dress code, and the latest updates — all from one link.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">All Wedding Photos, One Place</h3>
              <p className="text-gray-600 leading-relaxed">
                Let guests upload photos and videos during the wedding. No hunting through chats. No lost memories.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-white/50 rounded-3xl mx-4 md:mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            How OneKnot Works
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Create your wedding link",
              description: "Add your events, locations, and details once.",
              icon: Settings
            },
            {
              step: "2",
              title: "Share it with guests",
              description: "One link replaces dozens of messages and groups.",
              icon: Share2
            },
            {
              step: "3",
              title: "Update once, everyone knows",
              description: "Send live updates, manage RSVPs, and collect memories — without stress.",
              icon: Bell
            }
          ].map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col md:flex-row gap-6 mb-12 items-center"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-6 h-6 text-pink-600" />
                    <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Why Couples Use OneKnot Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Why Couples Use OneKnot
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-2xl shadow-lg"
          >
            <ul className="space-y-4">
              {[
                "No repeated calls or messages",
                "Guests always have the latest location",
                "Elders don't get confused",
                "Fewer family coordination issues",
                "Memories stay organised in one place"
              ].map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700 leading-relaxed">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Real Wedding Day Scenarios */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-white/50 rounded-3xl mx-4 md:mx-auto">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Real Wedding Day Scenarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how OneKnot handles the chaos that breaks other weddings
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                problem: "10 guests call asking where the reception is",
                solution: "You post one update with the location. Everyone sees it instantly. No calls.",
                icon: Phone
              },
              {
                problem: "Ceremony starts 30 minutes late",
                solution: "Update the time once. All guests get notified. No confusion.",
                icon: Clock
              },
              {
                problem: "Aunt needs directions to the venue",
                solution: "She opens your link. Map link is right there. No repeated explanations.",
                icon: MapPin
              },
              {
                problem: "Photos scattered across 5 WhatsApp groups",
                solution: "Everyone uploads to your gallery. All memories in one place.",
                icon: Camera
              }
            ].map((scenario, index) => {
              const Icon = scenario.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-600"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800 mb-2">{scenario.problem}</p>
                      <div className="flex items-start gap-3 mt-3 pt-3 border-t border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-gray-700 leading-relaxed">{scenario.solution}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              What You Get
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your wedding smoothly
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Public Wedding Website",
                description: "A beautiful page with your story, countdown, and all event details. Guests access it instantly.",
                icon: Calendar
              },
              {
                title: "Event Management",
                description: "Create multiple events with times, locations, dress codes, and FAQs. Everything organized.",
                icon: Settings
              },
              {
                title: "RSVP Tracking",
                description: "Guests RSVP without creating accounts. See who's coming, who's not, and track plus-ones.",
                icon: Users
              },
              {
                title: "Live Updates System",
                description: "Send instant alerts to all guests. Time changes, location updates, important announcements.",
                icon: Bell
              },
              {
                title: "Shared Photo Gallery",
                description: "Guests upload photos and videos. All memories in one place with reactions and pinned favorites.",
                icon: Camera
              },
              {
                title: "Memory Wall",
                description: "Guests leave messages and well wishes. A beautiful collection of love and support.",
                icon: MessageSquare
              },
              {
                title: "Digital Invitations",
                description: "Send beautiful email invites with direct RSVP links. No printing, no postage.",
                icon: Mail
              },
              {
                title: "Guest-Friendly Access",
                description: "No apps to download. No accounts to create. Just one link that works on any device.",
                icon: Share2
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Positioning Statement */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-800 leading-tight">
            OneKnot isn't a wedding website.<br />
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              It's a wedding control center.
            </span>
          </h2>
        </motion.div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Link 
              to="/login" 
              className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg px-10 py-4 rounded-full hover:scale-105 transition-all shadow-xl hover:shadow-2xl mb-4"
            >
              Create Your Wedding Link
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </Link>
            <p className="text-sm text-gray-600">
              Takes 2 minutes • Free to start
            </p>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="OneKnot Logo" 
                  className="h-8 w-8 object-contain"
                />
                <h3 className="text-2xl font-bold text-white">OneKnot</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your wedding command center. One link for everything.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                {!currentUser && (
                  <li>
                    <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                      Sign In
                    </Link>
                  </li>
                )}
                {!currentUser && (
                  <li>
                    <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                      Get Started
                    </Link>
                  </li>
                )}
                {currentUser && (
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Live Updates</li>
                <li>Event Management</li>
                <li>RSVP Tracking</li>
                <li>Photo Gallery</li>
                <li>Memory Wall</li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <p className="text-gray-400 leading-relaxed text-sm">
                OneKnot helps couples run their wedding from one link. No chaos. No confusion. Just control.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} OneKnot. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm">
                Made for couples who want their wedding day to run smoothly.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
