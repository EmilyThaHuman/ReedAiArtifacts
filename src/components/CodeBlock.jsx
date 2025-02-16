import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Code, Copy, Check, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { nightOwl } from '@codesandbox/sandpack-themes'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = ({ language, code, index, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isCopied, setCopied] = useState(false)
  const isJavaScript = language === 'javascript' || language === 'jsx'
  const lineCount = code.split('\n').length

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      layout
      className="relative my-4 rounded-lg overflow-hidden border border-gray-700 bg-gray-900"
    >
      {/* Header - Always visible */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">{language}</span>
          <span className="text-xs text-gray-500">{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors group relative"
            title="Copy code"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
            )}
          </button>
          {isJavaScript && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-1.5 hover:bg-gray-700 rounded-md transition-colors group
                ${showPreview ? 'bg-gray-700' : ''}`}
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              <PlayCircle className={`w-4 h-4 ${showPreview ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
            </button>
          )}
          {lineCount > 15 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors group"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={showPreview ? 'grid grid-cols-2 divide-x divide-gray-700' : 'block'}>
        {/* Code Section */}
        <motion.div
          layout
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : lineCount > 15 ? '300px' : 'auto',
          }}
          className="relative overflow-hidden"
        >
          <SyntaxHighlighter
            language={language.toLowerCase()}
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
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent" />
          )}
        </motion.div>

        {/* Preview Section */}
        <AnimatePresence>
          {showPreview && isJavaScript && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-[500px]"
            >
              <Sandpack
                theme={{
                  ...nightOwl,
                  colors: {
                    ...nightOwl.colors,
                    surface1: '#1a1b26',
                    surface2: '#1a1b26',
                  }
                }}
                template="react"
                files={{
                  '/App.js': code,
                }}
                options={{
                  showNavigator: true,
                  showLineNumbers: true,
                  showInlineErrors: true,
                  wrapContent: true,
                  editorHeight: 500,
                  classes: {
                    'sp-wrapper': 'custom-wrapper',
                    'sp-layout': 'custom-layout',
                    'sp-editor': 'custom-editor',
                  },
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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