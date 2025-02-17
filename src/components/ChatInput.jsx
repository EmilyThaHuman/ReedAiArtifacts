import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Send, Paperclip, X, Image as ImageIcon, File } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const styles = {
  container: cn(
    'flex flex-col gap-2',
    'p-4 border-t border-gray-800',
    'bg-gray-900'
  ),
  inputWrapper: cn(
    'flex items-end gap-2',
    'w-full rounded-lg',
    'bg-gray-800 text-gray-100'
  ),
  textArea: cn(
    'flex-1 p-3 pr-10',
    'bg-transparent',
    'resize-none outline-none',
    'placeholder:text-gray-500',
    'min-h-[44px] max-h-[200px]',
    'scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'
  ),
  buttonGroup: cn('flex items-center gap-2 p-2'),
  button: cn(
    'p-2 rounded-lg',
    'text-gray-400 hover:text-gray-100',
    'hover:bg-gray-700',
    'transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  filePreview: cn('flex flex-wrap gap-2', 'p-2 rounded-lg', 'bg-gray-800'),
  previewItem: cn(
    'relative group',
    'flex items-center gap-2',
    'p-2 rounded-lg',
    'bg-gray-700'
  ),
  removeButton: cn(
    'absolute -top-2 -right-2',
    'p-1 rounded-full',
    'bg-red-500 text-white',
    'opacity-0 group-hover:opacity-100',
    'transition-opacity'
  ),
  previewImage: cn('w-16 h-16', 'object-cover rounded'),
  fileInfo: cn('flex flex-col', 'text-sm'),
  downloadLink: cn(
    'flex items-center gap-1',
    'text-blue-400 hover:text-blue-300',
    'transition-colors'
  ),
}

const FilePreviewItem = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/')
  const fileUrl = URL.createObjectURL(file)

  useEffect(() => {
    return () => URL.revokeObjectURL(fileUrl)
  }, [fileUrl])

  return (
    <div className={styles.previewItem}>
      <button
        type='button'
        className={styles.removeButton}
        onClick={() => onRemove(file)}
        aria-label='Remove file'
      >
        <X className='w-3 h-3' />
      </button>

      {isImage ? (
        <>
          <img src={fileUrl} alt={file.name} className={styles.previewImage} />
          <div className={styles.fileInfo}>
            <span className='font-medium'>{file.name}</span>
            <span className='text-gray-400'>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </>
      ) : (
        <>
          <File className='w-8 h-8 text-blue-400' />
          <div className={styles.fileInfo}>
            <span className='font-medium'>{file.name}</span>
            <span className='text-gray-400'>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </>
      )}
    </div>
  )
}

FilePreviewItem.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
}

export const ChatInput = ({
  onSubmit,
  isLoading = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState([])
  const textAreaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleFileChange = e => {
    const newFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = fileToRemove => {
    setFiles(prev => prev.filter(file => file !== fileToRemove))
  }

  const handleSubmit = () => {
    if (!message.trim() && files.length === 0) return

    onSubmit({
      text: message.trim(),
      files,
    })

    setMessage('')
    setFiles([])
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={styles.container}>
      {files.length > 0 && (
        <div className={styles.filePreview}>
          {files.map((file, index) => (
            <FilePreviewItem
              key={`${file.name}-${index}`}
              file={file}
              onRemove={removeFile}
            />
          ))}
        </div>
      )}

      <div className={styles.inputWrapper}>
        <textarea
          ref={textAreaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={styles.textArea}
          rows={1}
        />

        <div className={styles.buttonGroup}>
          <input
            ref={fileInputRef}
            type='file'
            onChange={handleFileChange}
            className='hidden'
            multiple
            accept='image/*,.pdf,.doc,.docx,.txt'
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={styles.button}
            aria-label='Attach files'
          >
            <Paperclip className='w-5 h-5' />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type='button'
            onClick={handleSubmit}
            disabled={isLoading || (!message.trim() && files.length === 0)}
            className={styles.button}
            aria-label='Send message'
          >
            <Send className='w-5 h-5' />
          </motion.button>
        </div>
      </div>

      <div className='sr-only' role='status' aria-live='polite'>
        {isLoading ? 'Sending message...' : 'Ready to send message'}
      </div>
    </div>
  )
}

ChatInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  placeholder: PropTypes.string,
}

ChatInput.displayName = 'ChatInput'

export default ChatInput
