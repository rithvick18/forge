import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, Sparkles, Minus, Maximize2 } from 'lucide-react'
import { useConfigStore } from '../../store/configStore'

interface Message {
  role: 'user' | 'ai'
  content: string
}

export default function Copilot() {
  const { selectedModel } = useConfigStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your Forge Copilot. I can help you analyze trends, generate insights, or navigate the platform. How can I assist you today?' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: messages.slice(-5),
          model_name: selectedModel
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'ai', content: data.response }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "I encountered an error connecting to my brain. Please check the backend connection." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 md:w-96 glass rounded-2xl mb-4 overflow-hidden flex flex-col shadow-2xl border-white/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Forge Copilot</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                      Powered by {selectedModel === 'mistral' ? 'Mistral Large' : 'Gemini Flash'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/5 rounded transition-colors">
                  {isMinimized ? <Maximize2 size={14} className="text-ink-400" /> : <Minus size={14} className="text-ink-400" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded transition-colors">
                  <X size={14} className="text-ink-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0"
                >
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="chat-bubble chat-bubble-ai animate-pulse flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" />
                      Thinking...
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-surface-container-low">
                  <div className="flex gap-2 relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask anything..."
                      className="flex-1 bg-ink-700 border border-ink-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors pr-10"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen)
          setIsMinimized(false)
        }}
        className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen ? 'bg-ink-800 text-primary' : 'bg-primary text-on-primary'
        }`}
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageSquare size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-primary pulse-dot" />
          </div>
        )}
      </motion.button>
    </div>
  )
}
