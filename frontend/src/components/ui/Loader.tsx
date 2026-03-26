// Loader.jsx
import { motion } from 'framer-motion'

export function Loader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
      <p className="text-sm text-ink-400">{message}</p>
    </div>
  )
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card border-red-500/30 bg-red-500/5 text-red-400 text-sm py-4 px-5">
      ⚠ {message}
    </div>
  )
}
