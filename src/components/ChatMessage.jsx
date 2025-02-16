import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCircle, Bot } from 'lucide-react'
import CodeBlock from './CodeBlock'

const extractCodeBlocks = content => {
  const blocks = content.split('```')
  return blocks.reduce((acc, block, index) => {
    if (index % 2 === 1) {
      const firstLineBreak = block.indexOf('\n')
      const language = block.slice(0, firstLineBreak).trim()
      const code = block.slice(firstLineBreak + 1).trim()
      acc.push({ language, code })
    }
    return acc
  }, [])
}

const ChatMessage = ({ message, isStreaming = false }) => {
  const [copiedIndex, setCopiedIndex] = useState(null)
  const codeBlocks = extractCodeBlocks(message.content)
  const hasCode = codeBlocks.length > 0
  const uniqueKey = `${message.role}-${message.content.length}-${Date.now()}`

  const handleCopy = async (code, index) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderContent = () => {
    if (!hasCode) {
      return (
        <ReactMarkdown
          className='prose dark:prose-invert max-w-none prose-pre:hidden'
          components={{
            a: ({ node, children, ...props }) => (
              <a
                {...props}
                className='text-blue-400 hover:text-blue-500 transition-colors'
                target='_blank'
                rel='noopener noreferrer'
              >
                {children}
              </a>
            ),
            ul: ({ node, ...props }) => (
              <ul {...props} className='list-disc pl-4 space-y-2' />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} className='list-decimal pl-4 space-y-2' />
            ),
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code
                  {...props}
                  className='px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-200 text-sm'
                />
              ) : (
                <code {...props} />
              ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      )
    }

    const blocks = message.content.split('```')
    return blocks
      .map((block, index) => {
        if (index % 2 === 0) {
          return (
            block && (
              <ReactMarkdown
                key={`text-${index}-${block.length}`}
                className='prose dark:prose-invert max-w-none prose-pre:hidden'
                components={{
                  a: ({ node, children, ...props }) => (
                    <a
                      {...props}
                      className='text-blue-400 hover:text-blue-500 transition-colors'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ node, ...props }) => (
                    <ul {...props} className='list-disc pl-4 space-y-2' />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol {...props} className='list-decimal pl-4 space-y-2' />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        {...props}
                        className='px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-200 text-sm'
                      />
                    ) : (
                      <code {...props} />
                    ),
                }}
              >
                {block}
              </ReactMarkdown>
            )
          )
        }
        const codeBlock = codeBlocks[Math.floor(index / 2)]
        return (
          codeBlock && (
            <CodeBlock
              key={`code-${index}-${codeBlock.code.length}`}
              language={codeBlock.language}
              code={codeBlock.code}
              index={Math.floor(index / 2)}
              onCopy={code => handleCopy(code, Math.floor(index / 2))}
            />
          )
        )
      })
      .filter(Boolean)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 p-4 border-b border-gray-800 ${
        isStreaming ? 'animate-pulse' : ''
      }`}
    >
      <div className='flex-shrink-0'>
        {message.role === 'user' ? (
          <UserCircle className='w-8 h-8 text-blue-400' />
        ) : (
          <Bot className='w-8 h-8 text-green-400' />
        )}
      </div>
      <div className='flex-1'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={uniqueKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='space-y-4'
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  isStreaming: PropTypes.bool,
}

export { ChatMessage }
export default ChatMessage
