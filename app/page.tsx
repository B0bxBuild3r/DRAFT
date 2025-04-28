"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiCode,
  FiSave,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiStar,
  FiEdit,
  FiGithub,
  FiTwitter,
  FiShare2,
  FiMaximize,
} from "react-icons/fi"
import { useCompletion } from "ai/react"
import { useChat } from "ai/react"
import { supabase } from "../utils/supabaseClient"
import AnimatedBokehBackground from "./components/AnimatedBokehBackground"

// Define reusable style constants for consistency
const glassPanelStyle = "bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-3xl p-8";
const glassCardStyle = "bg-white/10 backdrop-blur-md border border-white/15 shadow-lg rounded-2xl p-6 transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-2xl hover:scale-[1.03] cursor-pointer";
const glassInputStyle = "bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 placeholder-gray-400 transition duration-200";
const primaryButtonStyle = "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg group hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryButtonStyle = "inline-flex items-center justify-center px-6 py-2 bg-white/10 backdrop-blur border border-white/20 shadow rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed";
const iconButtonStyle = "p-2 text-white/70 transition-colors duration-200 rounded-full hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50";

// Define interfaces
interface UserCreation { id: number; name: string; description: string; code: string; username: string; }
interface Rating { rating: number; user_id: string; game_id?: number; }
interface Message { role: "user" | "assistant"; content: string; }

export default function HomePage() {
  // Predefined list of featured draft IDs
  const featuredIds = [20, 21, 22] // change these to your desired IDs

  // Main state
  const [creations, setCreations] = useState<UserCreation[]>([])
  const [featuredCreations, setFeaturedCreations] = useState<UserCreation[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedGame, setSelectedGame] = useState<UserCreation | null>(null)
  const [showCode, setShowCode] = useState(true)
  const [saveName, setSaveName] = useState("")
  const [saveDescription, setSaveDescription] = useState("")
  const [username, setUsername] = useState("")
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [userRating, setUserRating] = useState(0)
  const [conversation, setConversation] = useState<Message[]>([])
  const [mode, setMode] = useState<"new" | "edit">("new")
  const [aiEngine] = useState<"classic" | "beta">("classic")
  const codeContainerRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const text = "$draft COMING SOON"

  // Classic AI hook using useCompletion (for the "classic" endpoint)
  const {
    completion: classicGameCode,
    setCompletion: setGameCode,
    input: prompt,
    handleInputChange: classicHandleInputChange,
    handleSubmit: classicHandleSubmit,
    isLoading: classicIsLoading,
    error,
  } = useCompletion({
    api: "/api/generate-code",
    body: { conversation },
  })

  // Beta AI hook using useChat (for the new BETA endpoint)
  const {
    messages,
    setMessages,
    input: betaInput,
    handleInputChange: betaHandleInputChange,
    handleSubmit: betaHandleSubmit,
    isLoading: betaIsLoading,
  } = useChat()

  // Derived variables based on selected AI engine.
  const inputVal = aiEngine === "classic" ? prompt : betaInput
  const handleInput = aiEngine === "classic" ? classicHandleInputChange : betaHandleInputChange
  const isLoading = aiEngine === "classic" ? classicIsLoading : betaIsLoading
  // For beta, assume the last message contains the generated game code.
  const finalGameCode =
    aiEngine === "classic"
      ? classicGameCode
      : messages && messages.length > 0
        ? messages[messages.length - 1].content
        : ""

  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight
    }
  }, [finalGameCode])

  // Fetch paginated recent creations
  useEffect(() => {
    fetchGames()
  }, [page])

  // Fetch featured draft (by predefined ids)
  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .in("id", featuredIds)
      if (error) {
        console.error("Error fetching featured drafts:", error)
      } else {
        setFeaturedCreations(data || [])
      }
    }
    fetchFeatured()
  }, [])

  // Check URL for a shared game (via ?gameId=...) and load it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gameId = params.get("gameId")
    if (gameId) {
      const fetchGameById = async () => {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .eq("id", Number(gameId))
          .single()
        if (error) {
          console.error("Error fetching game by id:", error)
        } else if (data) {
          handlePlayGame(data)
        }
      }
      fetchGameById()
    }
  }, [])

  const fetchGames = async () => {
    const { data, error, count } = await supabase
      .from("games")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * 6, page * 6 - 1)

    if (error) {
      console.error("Error fetching games:", error)
    } else {
      setCreations(data || [])
      setTotalPages(Math.ceil((count || 0) / 6))
    }
  }

  // Handle game generation, using different logic for classic vs. beta.
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (aiEngine === "classic") {
      const oldCode = JSON.parse(JSON.stringify({ code: classicGameCode }))
      setConversation((prev: Message[]) => {
        const newConvo: Message[] = [
          ...prev,
          { role: "user" as const, content: prompt },
          { role: "assistant" as const, content: oldCode.code },
        ]
        return newConvo.length > 5 ? newConvo.slice(-5) : newConvo
      })
      setGameCode("")
      setTimeout(() => {
        classicHandleSubmit(e)
        setMode("edit")
      }, 500)
    } else {
      setMessages(messages.slice(-2))
      betaHandleSubmit(e)
      setMode("edit")
    }
  }

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!finalGameCode || !saveName || !username) return

    const { error } = await supabase.from("games").insert({
      name: saveName,
      description: saveDescription,
      code: finalGameCode,
      username,
    })

    if (error) {
      console.error("Error saving game:", error)
    } else {
      setShowSaveForm(false)
      setSaveName("")
      setSaveDescription("")
      setUsername("")
      fetchGames()
    }
  }

  const handlePlayGame = async (game: UserCreation) => {
    setSelectedGame(game)
    setGameCode(game.code)
    // Reset conversation for classic mode.
    setConversation([{ role: "assistant", content: game.code }])
    setMode("edit")
    const { data: ratingsData } = await supabase
      .from("ratings")
      .select("*")
      .eq("game_id", game.id)
    setRatings(ratingsData || [])
    const { data: userRatingData } = await supabase.from("ratings").select("rating").eq("game_id", game.id).maybeSingle() // Assuming user can only rate once
    setUserRating(userRatingData?.rating || 0)
    setShowCode(false) // Reset code view when opening modal
  }

  const handleRate = async (rating: number) => {
    if (!selectedGame) return
    setUserRating(rating)

    const { error } = await supabase.from("ratings").upsert({
      game_id: selectedGame.id,
      rating,
    })

    if (error) {
      console.error("Error rating game:", error)
    } else {
      const { data: ratingsData } = await supabase
        .from("ratings")
        .select("*")
        .eq("game_id", selectedGame.id)
      setRatings(ratingsData || [])
    }
  }

  const getAverageRating = () => {
    if (!ratings.length) return 0
    return ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleShareGame = async () => {
    if (!selectedGame) return
    const shareUrl = `${window.location.origin}?gameId=${selectedGame.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert("Game link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white overflow-x-hidden font-sans">
      {/* Animated Glassmorphism Bokeh Background */}
      <AnimatedBokehBackground />

      {/* Main content container */}
      <div className="relative container mx-auto px-4 pt-24 pb-16 z-10">
        {/* Header */}
        <motion.header
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <img
            src="./banner.png"
            alt="draft Logo"
            className="w-64 md:w-96 mx-auto mb-4 cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => {
              window.location.href = "/"
            }}
          />

          <div className="flex flex-col items-center space-y-2 mt-1">
            {/* Social Icons */}
            <div className="flex justify-center space-x-3">
              <a href="https://x.com/createdotfun" target="_blank" rel="noopener noreferrer" className={iconButtonStyle} aria-label="draft on Twitter">
                <FiTwitter size={18} />
              </a>
              <a href="https://github.com/???/draft" target="_blank" rel="noopener noreferrer" className={iconButtonStyle} aria-label="draft on Github">
                <FiGithub size={18} />
              </a>
            </div>
            {/* Text */}
            <div className="text-xs text-white/60 cursor-pointer transition-colors hover:text-white/80" onClick={handleCopy}>
              {copied ? "Copied!" : text}
            </div>
          </div>
        </motion.header>

        {/* Prompt / Hero Section */}
        <motion.section
          className="max-w-3xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className={glassPanelStyle}>
            <form onSubmit={handleGenerate} className="space-y-4">
              <label htmlFor="game-prompt" className="sr-only">Game Prompt</label>
              <textarea
                id="game-prompt"
                value={inputVal}
                onChange={handleInput}
                placeholder={mode === "new" ? "Describe the game you want to draft... (e.g., a retro space shooter)" : "Describe changes to the game... (e.g., make the player ship faster)"}
                className={`${glassInputStyle} h-32 resize-none text-base md:text-lg`}
                aria-label="Game prompt input"
                required
              />
              <div className="flex justify-end pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading || !inputVal.trim()}
                  className={primaryButtonStyle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Building...
                    </span>
                  ) : (mode === "new" ? "draft Game" : "Modify Game")}
                </motion.button>
              </div>
            </form>

            {error && (
              <motion.div
                className="mt-4 text-center text-red-400 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {"Error generating game. Please try a different prompt or check the console."}
              </motion.div>
            )}

            {(isLoading || finalGameCode) && (
              <motion.div
                className="mt-8 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <button onClick={() => setShowCode(!showCode)} className={secondaryButtonStyle}>
                    <FiCode className="inline mr-2" size={18} />
                    {showCode ? "Hide Code" : "Show Code"}
                  </button>
                  {finalGameCode && !isLoading && (
                    <button onClick={() => setShowSaveForm(true)} className={secondaryButtonStyle}>
                      <FiSave className="inline mr-2" size={18} />
                      Save Game
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showCode && (
                    <motion.div
                      className="relative"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <pre
                        ref={codeContainerRef}
                        className="bg-black/50 p-4 rounded-xl text-sm overflow-auto max-h-60 md:max-h-80 font-mono border border-white/10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                        aria-label="Generated game code"
                      >
                        <code>{finalGameCode}</code>
                      </pre>
                      {isLoading && (
                        <div className="absolute bottom-3 right-3 flex items-center text-xs text-cyan-300">
                          <motion.div
                            className="w-2 h-2 bg-cyan-400 rounded-full mr-2"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                          />
                          Loading...
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isLoading && finalGameCode && (
                  <motion.div
                    className="relative w-full aspect-video md:h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/20"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <iframe
                      srcDoc={finalGameCode}
                      title="Generated Game Preview"
                      className="w-full h-full bg-white border-0"
                      sandbox="allow-scripts allow-same-origin"
                      aria-label="Generated game preview"
                    />
                    <div className="absolute top-3 right-3">
                      <motion.button
                        onClick={() => {
                          const blob = new Blob([finalGameCode], { type: "text/html" })
                          const url = URL.createObjectURL(blob)
                          window.open(url, "_blank")?.focus()
                          URL.revokeObjectURL(url)
                        }}
                        className={secondaryButtonStyle + " px-4 py-2 text-sm"}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Open game in full screen"
                      >
                        <FiMaximize className="inline mr-1.5" size={16} />
                        Full Screen
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Featured draft Section (Using Predefined IDs) */}
        <motion.section
          className="max-w-6xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Featured Creations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredCreations.map((creation, index) => (
              <motion.div
                key={creation.id}
                className={glassCardStyle}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => handlePlayGame(creation)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayGame(creation) }}
                role="button"
                aria-label={`Play game: ${creation.name}`}
              >
                <h3 className="text-xl font-semibold mb-2 text-white truncate">{creation.name || "Untitled Game"}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 h-10">{creation.description || "No description provided."}</p>
                <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-auto">
                  <span className="text-xs text-gray-400 truncate">by {creation.username || "Anonymous"}</span>
                  <span className={secondaryButtonStyle + " px-4 py-1 text-sm pointer-events-none"}>
                    Play
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Most Recent draft Section */}
        <motion.section
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600">
            Latest Creations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {creations.map((creation, index) => (
              <motion.div
                key={creation.id}
                className={glassCardStyle}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => handlePlayGame(creation)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayGame(creation) }}
                role="button"
                aria-label={`Play game: ${creation.name}`}
              >
                <h3 className="text-xl font-semibold mb-2 text-white truncate">{creation.name || "Untitled Game"}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 h-10">{creation.description || "No description provided."}</p>
                <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-auto">
                  <span className="text-xs text-gray-400 truncate">by {creation.username || "Anonymous"}</span>
                  <span className={secondaryButtonStyle + " px-4 py-1 text-sm pointer-events-none"}>
                    Play
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination for Most Recent Cards */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center mt-12 space-x-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={iconButtonStyle + " disabled:opacity-40 disabled:cursor-not-allowed"}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous page"
              >
                <FiChevronLeft size={24} />
              </motion.button>
              <span className="text-white/80 text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <motion.button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={iconButtonStyle + " disabled:opacity-40 disabled:cursor-not-allowed"}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next page"
              >
                <FiChevronRight size={24} />
              </motion.button>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Save Game Modal */}
      <AnimatePresence>
        {showSaveForm && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveForm(false)}
          >
            <motion.div
              className={`${glassPanelStyle} max-w-md w-full relative`}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Save Your Creation</h3>
                <button onClick={() => setShowSaveForm(false)} className={iconButtonStyle} aria-label="Close save modal">
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveGame} className="space-y-5">
                <div>
                  <label htmlFor="save-game-name" className="block text-sm font-medium text-white/80 mb-1">Name</label>
                  <input id="save-game-name" type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="My Awesome Game" className={glassInputStyle} required aria-label="Game Name" />
                </div>
                <div>
                  <label htmlFor="save-game-desc" className="block text-sm font-medium text-white/80 mb-1">Description</label>
                  <textarea id="save-game-desc" value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} placeholder="A short description..." className={`${glassInputStyle} h-24 resize-none`} aria-label="Game Description" />
                </div>
                <div>
                  <label htmlFor="save-username" className="block text-sm font-medium text-white/80 mb-1">Username</label>
                  <input id="save-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Name" className={glassInputStyle} required aria-label="Your Username" />
                </div>
                <motion.button type="submit" className={`${primaryButtonStyle} w-full justify-center`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Save Creation
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Details Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedGame(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`${glassPanelStyle} max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative`}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="pr-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{selectedGame.name}</h3>
                  <p className="text-sm text-gray-300">by {selectedGame.username}</p>
                </div>
                <button onClick={() => setSelectedGame(null)} className={`${iconButtonStyle} absolute top-6 right-6`} aria-label="Close game details">
                  <FiX size={24} />
                </button>
              </div>

              <div className="mb-6 border-b border-white/10 pb-6">
                <p className="text-gray-300 mb-4 text-base">{selectedGame.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/80 mr-2">Rate:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => handleRate(star)}
                      className={`text-2xl transition-colors duration-200 ${star <= userRating ? "text-yellow-400" : "text-gray-500 hover:text-yellow-500"}`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <FiStar className="fill-current" />
                    </motion.button>
                  ))}
                  {ratings.length > 0 && (
                    <span className="text-sm text-gray-400 ml-3">
                      Avg: {getAverageRating().toFixed(1)} ({ratings.length} rating{ratings.length > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <motion.button onClick={() => setShowCode(!showCode)} className={secondaryButtonStyle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <FiCode className="inline mr-2" size={18} />
                  {showCode ? "Hide Code" : "View Code"}
                </motion.button>
                <motion.button
                  onClick={() => {
                    setGameCode(selectedGame.code)
                    setSelectedGame(null)
                    setMode('edit')
                    setConversation([{ role: "assistant", content: selectedGame.code }])
                  }}
                  className={secondaryButtonStyle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit className="inline mr-2" size={18} />
                  Modify
                </motion.button>
                <motion.button onClick={handleShareGame} className={secondaryButtonStyle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <FiShare2 className="inline mr-2" size={18} />
                  Share
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (!selectedGame) return
                    const blob = new Blob([selectedGame.code], { type: "text/html" })
                    const url = URL.createObjectURL(blob)
                    window.open(url, "_blank")?.focus()
                    URL.revokeObjectURL(url)
                  }}
                  className={secondaryButtonStyle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiMaximize className="inline mr-2" size={18} />
                  Full Screen
                </motion.button>
              </div>

              <AnimatePresence>
                {showCode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: '1.5rem' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <pre className="bg-black/50 p-4 rounded-xl text-sm overflow-auto max-h-60 font-mono border border-white/10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      <code>{selectedGame.code}</code>
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative w-full aspect-video md:h-[500px] rounded-2xl overflow-hidden mt-6 border border-white/10 shadow-lg bg-black/20">
                <iframe
                  srcDoc={selectedGame.code}
                  title={selectedGame.name}
                  className="w-full h-full bg-white border-0"
                  sandbox="allow-scripts allow-same-origin"
                  aria-label={`${selectedGame.name} game preview`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}