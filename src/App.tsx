import { motion } from 'motion/react'

function App() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-6xl font-semibold"
      >
        Alex Walters
      </motion.h1>
    </main>
  )
}

export default App
