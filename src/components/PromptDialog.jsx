import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import PropTypes from 'prop-types'

export const PromptDialog = ({ isOpen, onClose, onSubmit, editingPrompt }) => {
  const [title, setTitle] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title)
      setSystemPrompt(editingPrompt.messages[0]?.content || '')
    } else {
      setTitle('')
      setSystemPrompt('')
    }
  }, [editingPrompt])

  const handleClose = useCallback(() => {
    setTitle('')
    setSystemPrompt('')
    onClose()
  }, [onClose])

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({
      ...(editingPrompt && { id: editingPrompt.id }),
      title,
      systemPrompt,
    })
    setTitle('')
    setSystemPrompt('')
  }

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
          onClick={handleBackdropClick}
          onKeyDown={e => {
            if (e.key === 'Escape') handleClose()
          }}
          role='presentation'
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-gray-900 rounded-lg p-6 w-full max-w-lg border border-gray-800'
          >
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <button
                onClick={handleClose}
                className='p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='prompt-title'
                    className='block text-sm font-medium text-gray-300 mb-1'
                  >
                    Prompt Title
                  </label>
                  <input
                    id='prompt-title'
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className='w-full p-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 
                      focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter a title for your prompt'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='system-prompt'
                    className='block text-sm font-medium text-gray-300 mb-1'
                  >
                    System Prompt
                  </label>
                  <textarea
                    id='system-prompt'
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    className='w-full p-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]'
                    placeholder='Enter your system prompt...'
                    required
                  />
                </div>

                <div className='flex justify-end gap-2 mt-6'>
                  <button
                    type='button'
                    onClick={handleClose}
                    className='px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700'
                  >
                    {editingPrompt ? 'Update Prompt' : 'Create Prompt'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

PromptDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingPrompt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
}
