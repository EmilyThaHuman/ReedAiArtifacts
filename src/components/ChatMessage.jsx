import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  User,
  Bot,
  Image as ImageIcon,
  File,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { CodeBlock } from './CodeBlock'
import { cn } from '@/lib/utils'
import { useFileStore } from '@/store/useFileStore'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const styles = {
  message: cn(
    'flex gap-4',
    'p-6',
    'transition-colors duration-200',
    'rounded-2xl'
  ),
  userMessage: cn('bg-primary/5 border border-primary/10', 'flex-row-reverse'),
  assistantMessage: cn('bg-muted/30 border border-border/50'),
  avatar: cn(
    'flex-shrink-0',
    'w-8 h-8',
    'ring-2 ring-border ring-offset-2 ring-offset-background',
    'rounded-full overflow-hidden',
    'transition-all duration-200'
  ),
  content: cn(
    'flex-1 min-w-0',
    'space-y-2',
    'prose prose-neutral dark:prose-invert max-w-none',
    'prose-p:leading-relaxed prose-p:break-words',
    'prose-pre:p-0 prose-pre:bg-transparent',
    'prose-headings:text-foreground',
    'prose-a:text-primary hover:prose-a:text-primary/80',
    'prose-strong:text-primary-foreground',
    'prose-code:text-primary-foreground prose-code:bg-primary/10 prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5',
    'prose-blockquote:border-l-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:rounded-r-lg'
  ),
  filePreview: cn(
    'grid gap-4',
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'mt-4'
  ),
  previewItem: cn(
    'group relative',
    'overflow-hidden rounded-xl',
    'bg-card hover:bg-card/80',
    'transition-all duration-200 ease-in-out',
    'border border-border/50',
    'shadow-sm hover:shadow-md'
  ),
  previewImage: cn(
    'aspect-square w-full',
    'object-cover',
    'cursor-zoom-in',
    'transition-all duration-300 ease-out',
    'group-hover:scale-105'
  ),
  fileInfo: cn(
    'absolute inset-x-0 bottom-0',
    'p-3',
    'bg-gradient-to-t from-black/80 to-transparent',
    'text-white',
    'rounded-b-xl'
  ),
  fileName: cn('font-medium truncate'),
  fileSize: cn('text-sm opacity-80'),
  downloadButton: cn(
    'absolute top-2 right-2',
    'opacity-0 group-hover:opacity-100',
    'transition-opacity duration-200'
  ),
  loadingContainer: cn(
    'flex items-center justify-center',
    'h-8 w-20',
    'rounded-full',
    'bg-primary/10'
  ),
  loadingDot: cn('w-2 h-2 rounded-full', 'bg-primary'),
}

const LoadingAnimation = () => {
  const dotVariants = {
    initial: { y: 0, opacity: 0.5 },
    animate: { y: [-4, 0], opacity: [1, 0.5] },
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  }

  return (
    <motion.div
      className={styles.loadingContainer}
      variants={containerVariants}
      initial='initial'
      animate='animate'
    >
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={styles.loadingDot}
          variants={dotVariants}
          animate='animate'
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}

const FilePreview = ({ fileId }) => {
  const file = useFileStore(state => state.getFile(fileId))
  const metadata = useFileStore(state => state.getFileMetadata(fileId))
  const [fileUrl, setFileUrl] = useState(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  if (!file || !metadata || !fileUrl) return null

  const isImage = metadata.type.startsWith('image/')
  const fileSize = (metadata.size / 1024 / 1024).toFixed(2)

  return (
    <Card className={styles.previewItem}>
      {isImage ? (
        <>
          <Button
            variant='ghost'
            className={cn(styles.previewImage, 'w-full h-full p-0')}
            onClick={() => window.open(fileUrl, '_blank')}
            aria-label={`View ${metadata.name} in full size`}
          >
            <img
              src={fileUrl}
              alt={metadata.name}
              className='w-full h-full object-cover'
            />
          </Button>
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>{metadata.name}</div>
            <div className={styles.fileSize}>{fileSize} MB</div>
          </div>
        </>
      ) : (
        <div className='p-4 flex items-start gap-3'>
          <File className='w-8 h-8 text-primary' />
          <div className='flex-1 min-w-0'>
            <div className={styles.fileName}>{metadata.name}</div>
            <div className={styles.fileSize}>{fileSize} MB</div>
          </div>
        </div>
      )}
      <Button
        variant='secondary'
        size='sm'
        className={styles.downloadButton}
        asChild
      >
        <a href={fileUrl} download={metadata.name}>
          <ExternalLink className='w-4 h-4 mr-1' />
          Download
        </a>
      </Button>
    </Card>
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
      return (
        <div className='space-y-2'>
          <p>{message.content}</p>
          <LoadingAnimation />
        </div>
      )
    }

    const parts = message.content.split(/(```[^`]+```)/g)
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
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
            isCopied={copiedIndex === index}
          />
        )
      }
      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ node, children, ...props }) => (
              <h1
                className='scroll-m-20 text-4xl font-bold tracking-tight'
                {...props}
              >
                {children}
              </h1>
            ),
            h2: ({ node, children, ...props }) => (
              <h2
                className='scroll-m-20 text-3xl font-semibold tracking-tight'
                {...props}
              >
                {children}
              </h2>
            ),
            h3: ({ node, children, ...props }) => (
              <h3
                className='scroll-m-20 text-2xl font-semibold tracking-tight'
                {...props}
              >
                {children}
              </h3>
            ),
            h4: ({ node, children, ...props }) => (
              <h4
                className='scroll-m-20 text-xl font-semibold tracking-tight'
                {...props}
              >
                {children}
              </h4>
            ),
            a: ({ node, children, href, ...props }) => (
              <a
                className='text-primary hover:text-primary/80 underline underline-offset-4'
                target='_blank'
                rel='noopener noreferrer'
                href={href}
                {...props}
              >
                {children}
              </a>
            ),
            pre: ({ node, children, ...props }) => (
              <pre
                className='relative rounded-lg border bg-muted p-4'
                {...props}
              >
                {children}
              </pre>
            ),
            code: ({ node, inline, children, ...props }) => {
              if (inline) {
                return (
                  <code
                    className='rounded bg-muted px-1.5 py-0.5 font-mono text-sm'
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return <code {...props}>{children}</code>
            },
            blockquote: ({ node, children, ...props }) => (
              <blockquote
                className='mt-6 border-l-4 border-primary/50 pl-6 italic text-muted-foreground'
                {...props}
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {part}
        </ReactMarkdown>
      )
    })
  }

  return (
    <div
      className={cn(
        styles.message,
        isUser ? styles.userMessage : styles.assistantMessage
      )}
    >
      <Avatar className={styles.avatar}>
        <AvatarFallback>
          {isUser ? <User className='w-4 h-4' /> : <Bot className='w-4 h-4' />}
        </AvatarFallback>
      </Avatar>
      <div className={styles.content}>
        {renderContent()}
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
