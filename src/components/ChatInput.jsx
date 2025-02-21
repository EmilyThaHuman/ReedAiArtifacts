import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Send,
  Paperclip,
  X,
  Image as ImageIcon,
  File,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

const styles = {
  container: cn(
    'flex flex-col gap-3',
    'p-4',
    'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50'
  ),
  inputWrapper: cn(
    'relative flex items-end gap-2',
    'w-full rounded-lg',
    'bg-card',
    'min-h-[64px]'
  ),
  textArea: cn(
    'flex-1',
    'min-h-[64px] py-4 px-4',
    'resize-none',
    'bg-transparent',
    'border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
    'placeholder:text-muted-foreground'
  ),
  buttonGroup: cn(
    'flex items-center gap-2 px-2',
    'h-[64px]',
    'border-l border-border/50'
  ),
  iconButton: cn(
    'inline-flex items-center justify-center',
    'w-9 h-9 rounded-md',
    'text-muted-foreground hover:text-foreground',
    'bg-transparent hover:bg-accent',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  filePreview: cn(
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3',
    'p-3 rounded-lg',
    'bg-card/50'
  ),
  previewItem: cn(
    'relative group',
    'flex flex-col gap-2',
    'p-3 rounded-lg',
    'bg-accent/50 hover:bg-accent/70',
    'transition-colors duration-200'
  ),
  removeButton: cn(
    'absolute -top-2 -right-2',
    'p-1.5 rounded-full',
    'bg-destructive/90 hover:bg-destructive text-destructive-foreground',
    'shadow-sm',
    'opacity-0 group-hover:opacity-100',
    'transition-all duration-200 ease-in-out',
    'z-10'
  ),
  previewImage: cn(
    'w-full aspect-square',
    'object-cover rounded-md',
    'bg-accent'
  ),
  fileInfo: cn('flex flex-col', 'text-sm'),
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
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={styles.filePreview}
          >
            {files.map((file, index) => (
              <FilePreviewItem
                key={`${file.name}-${index}`}
                file={file}
                onRemove={removeFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className='border-border/50'>
        <div className={styles.inputWrapper}>
          <Textarea
            ref={textAreaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={styles.textArea}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className={styles.iconButton}
              aria-label='Attach files'
            >
              <Paperclip className='w-4 h-4' />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type='button'
              onClick={handleSubmit}
              disabled={isLoading || (!message.trim() && files.length === 0)}
              className={cn(
                styles.iconButton,
                'text-primary hover:text-primary'
              )}
              aria-label='Send message'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Send className='w-4 h-4' />
              )}
            </motion.button>
          </div>
        </div>
      </Card>

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
