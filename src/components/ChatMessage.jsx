import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { User, Bot, Image as ImageIcon, File, ExternalLink } from 'lucide-react'
import { CodeBlock } from './CodeBlock'
import { cn } from '@/lib/utils'
import { useFileStore } from '@/store/useFileStore'

const styles = {
  message: cn('flex gap-2 sm:gap-4', 'p-3 sm:p-4 rounded-lg', 'bg-gray-800'),
  avatar: cn(
    'flex-shrink-0',
    'flex items-center justify-center',
    'w-8 h-8 rounded-full',
    'bg-gray-700'
  ),
  content: cn(
    'flex-1 min-w-0',
    'space-y-2',
    'prose prose-invert max-w-none',
    'prose-p:leading-relaxed prose-p:break-words',
    'prose-pre:p-0 prose-pre:bg-transparent'
  ),
  filePreview: cn(
    'grid gap-3',
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'mt-3'
  ),
  previewItem: cn(
    'flex items-start gap-2',
    'p-2 rounded-lg',
    'bg-gray-700',
    'group'
  ),
  previewImage: cn(
    'aspect-square w-full max-w-[12rem]',
    'object-cover rounded',
    'cursor-pointer',
    'transition-transform duration-200',
    'group-hover:scale-[1.02]'
  ),
  fileInfo: cn('flex flex-col min-w-0', 'text-sm'),
  fileName: cn('font-medium truncate', 'text-gray-200'),
  fileSize: cn('text-gray-400'),
  downloadLink: cn(
    'flex items-center gap-1',
    'text-blue-400 hover:text-blue-300',
    'transition-colors mt-1'
  ),
}

const FilePreview = ({ fileId }) => {
  const file = useFileStore(state => state.getFile(fileId))
  const metadata = useFileStore(state => state.getFileMetadata(fileId))
  const [fileUrl, setFileUrl] = useState(null)

  useEffect(() => {
    if (file) {
      // Create a new blob URL when the file changes
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      return () => {
        // Clean up the blob URL when the component unmounts or file changes
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  if (!file || !metadata || !fileUrl) return null

  const isImage = metadata.type.startsWith('image/')

  return (
    <div className={styles.previewItem}>
      {isImage ? (
        <>
          <button
            type='button'
            onClick={() => window.open(fileUrl, '_blank')}
            className={styles.previewImage}
          >
            <img
              src={fileUrl}
              alt={metadata.name}
              className='w-full h-full object-cover'
            />
          </button>
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{metadata.name}</span>
            <span className={styles.fileSize}>
              {(metadata.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <a
              href={fileUrl}
              download={metadata.name}
              className={styles.downloadLink}
            >
              <ExternalLink className='w-4 h-4' />
              Download
            </a>
          </div>
        </>
      ) : (
        <>
          <File className='w-8 h-8 text-blue-400' />
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{metadata.name}</span>
            <span className={styles.fileSize}>
              {(metadata.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <a
              href={fileUrl}
              download={metadata.name}
              className={styles.downloadLink}
            >
              <ExternalLink className='w-4 h-4' />
              Download
            </a>
          </div>
        </>
      )}
    </div>
  )
}

FilePreview.propTypes = {
  fileId: PropTypes.string.isRequired,
}

export const ChatMessage = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user'
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderContent = () => {
    if (!message.content) return null

    if (isStreaming) {
      return <p>{message.content}</p>
    }

    // Split content into code blocks and text
    const parts = message.content.split(/(```[^`]+```)/g)
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const content = part.slice(3, -3)
        const firstNewline = content.indexOf('\n')
        const language = content.slice(0, firstNewline)
        const code = content.slice(firstNewline + 1)

        return (
          <CodeBlock
            key={index}
            language={language}
            code={code}
            index={index}
            onCopy={() => handleCopy(code, index)}
          />
        )
      }
      return <p key={index}>{part}</p>
    })
  }

  return (
    <div className={styles.message}>
      <div className={styles.avatar}>
        {isUser ? (
          <User className='w-5 h-5 text-gray-300' />
        ) : (
          <Bot className='w-5 h-5 text-blue-400' />
        )}
      </div>

      <div className={styles.content}>
        <div className='markdown-content'>{renderContent()}</div>

        {message.files?.length > 0 && (
          <div className={styles.filePreview}>
            {message.files.map(fileId => (
              <FilePreview key={fileId} fileId={fileId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    content: PropTypes.string,
    files: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isStreaming: PropTypes.bool,
}

ChatMessage.displayName = 'ChatMessage'

export default ChatMessage
