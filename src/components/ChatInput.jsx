import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'

export const ChatInput = ({ 
  onSubmit, 
  isLoading = false, 
  placeholder = 'Type your message...' 
}) => {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    try {
      await onSubmit(input.trim())
      setInput('')
    } catch (error) {
      console.error('Error submitting message:', error)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className="p-4 border-t border-gray-800 bg-gray-900"
    >
      <div className="relative flex gap-4 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="w-full p-3 pr-10 rounded-lg resize-none border border-gray-700 bg-gray-800 
              text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              disabled:opacity-50 min-h-[44px] max-h-[200px] overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 transparent'
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center 
              justify-center rounded-lg"
            >
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent 
                rounded-full animate-spin" 
              />
            </div>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-lg bg-blue-600 text-white disabled:opacity-50 
            disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {isLoading ? 'Sending message...' : 'Ready to send message'}
      </div>
    </form>
  )
}

ChatInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  placeholder: PropTypes.string
}

ChatInput.displayName = 'ChatInput'

export default ChatInput