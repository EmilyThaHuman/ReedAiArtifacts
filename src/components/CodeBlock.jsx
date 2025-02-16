import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Sandpack } from '@codesandbox/sandpack-react'
import {
  Code,
  Copy,
  Check,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Folder,
} from 'lucide-react'
import { nightOwl } from '@codesandbox/sandpack-themes'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = ({ language, code, index, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  // Extract base language from language:path format
  const baseLanguage = language.split(':')[0]
  const filePath = language.includes(':') ? language.split(':')[1] : null

  const lineCount = code.split('\n').length
  const canShowPreview =
    baseLanguage === 'javascript' && code.includes('import React')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      layout
      className='relative group rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm'
    >
      <div className='flex items-center justify-between p-2 border-b border-gray-700'>
        <div className='flex items-center gap-2'>
          {filePath ? (
            <Folder className='w-4 h-4 text-gray-400' />
          ) : (
            <Code className='w-4 h-4 text-gray-400' />
          )}
          <span className='text-sm text-gray-300'>
            {filePath || baseLanguage}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {canShowPreview && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className='p-1 text-gray-400 hover:text-gray-300 transition-colors'
              title={showPreview ? 'Show code' : 'Show preview'}
            >
              {showPreview ? (
                <Code className='w-4 h-4' />
              ) : (
                <PlayCircle className='w-4 h-4' />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className='p-1.5 hover:bg-gray-700 rounded-md transition-colors group relative'
            title='Copy code'
          >
            {copied ? (
              <Check className='w-4 h-4 text-green-400' />
            ) : (
              <Copy className='w-4 h-4 text-gray-400 group-hover:text-gray-300' />
            )}
          </button>
          {!showPreview && lineCount > 15 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-1.5 hover:bg-gray-700 rounded-md transition-colors group'
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className='w-4 h-4 text-gray-400 group-hover:text-gray-300' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-400 group-hover:text-gray-300' />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode='wait'>
        {showPreview ? (
          <motion.div
            key='preview'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='min-h-[500px]'
          >
            <Sandpack
              theme={{
                ...nightOwl,
                colors: {
                  ...nightOwl.colors,
                  surface1: '#1a1b26',
                  surface2: '#1a1b26',
                },
              }}
              template='react'
              files={{
                '/App.js': code,
              }}
              options={{
                showNavigator: true,
                showLineNumbers: true,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: 500,
                showTabs: false,
                closableTabs: false,
                classes: {
                  'sp-wrapper': 'custom-wrapper',
                  'sp-layout': 'custom-layout',
                  'sp-editor': 'custom-editor',
                },
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key='code'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              layout
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : lineCount > 15 ? '300px' : 'auto',
              }}
              className='relative overflow-hidden'
            >
              <SyntaxHighlighter
                language={baseLanguage.toLowerCase()}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                }}
                showLineNumbers
                wrapLongLines
              >
                {code}
              </SyntaxHighlighter>

              {!isExpanded && lineCount > 15 && (
                <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent' />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

CodeBlock.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onCopy: PropTypes.func.isRequired,
}

export default CodeBlock
