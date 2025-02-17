import React, { useRef, useEffect, useState } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { getProvider } from '@/lib/providers'
import { ChatMessage } from './ChatMessage'
import { ModelSelector } from './ModelSelector'
import ThinkingProcess from './ThinkingProcess'
import ChatInput from './ChatInput'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import ChatSidebar from './ChatSidebar'
import PropTypes from 'prop-types'
import { useFileStore } from '@/store/useFileStore'

const REASONING_PROMPT = `You are an expert assistant focused on clear reasoning and problem-solving. When responding:

1. Start each thought with "THINKING:" to explain your analysis
2. Share your step-by-step reasoning process
3. For code requests:
   - Include code examples in markdown code blocks with language and file path
   - Use \`\`\`javascript:path/to/file\`\` format for code blocks
4. End with "RESPONSE:" followed by your complete answer

Example format for code requests:
THINKING: First, analyzing the requirements...
THINKING: Considering the best implementation approach...
THINKING: Structuring the component for reusability...
RESPONSE: Here's the implementation:

\`\`\`javascript:src/components/Example.jsx
import React from 'react'
// ... code implementation
\`\`\`

Example format for general questions:
THINKING: Analyzing the key aspects...
THINKING: Considering relevant factors...
RESPONSE: [Your complete, well-structured answer]`

const SYSTEM_PROMPT = `You are an expert full-stack JavaScript developer specialized in React and Tailwind CSS. When writing code, follow these strict guidelines:

### Code Structure and Format
1. ALWAYS return complete, self-contained code in a SINGLE code block
2. Use \`\`\`javascript:path/to/file.jsx\`\`\` format for file path indication
3. Include ALL necessary imports at the top of the file
4. Export both named and default exports for components
5. Add displayName for components
6. NEVER include PropTypes - use JSDoc comments for props documentation only

### React Best Practices
1. Use functional components with hooks
2. Use JSDoc comments for props documentation (not PropTypes)
3. Follow React 18+ best practices
4. Implement proper error boundaries and loading states
5. Use proper memo/callback optimizations where needed
6. Ensure proper accessibility (ARIA labels, semantic HTML)

### Styling Guidelines
1. Use ONLY Tailwind's core utility classes - NO arbitrary values
   - CORRECT: 'h-64 w-full p-4 mt-6'
   - INCORRECT: 'h-[500px] w-[42rem] p-[15px] mt-[27px]'
2. Group Tailwind classes using the cn utility:
   \`\`\`javascript
   import { cn } from './lib/utils'
   
   const styles = {
     button: cn(
       'inline-flex items-center justify-center',
       'rounded-md text-sm font-medium',
       'bg-blue-500 text-white',
       'hover:bg-blue-600',
       'h-10 px-4 py-2',
       'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
       'disabled:opacity-50 disabled:pointer-events-none'
     )
   }
   \`\`\`
3. Always include responsive variants:
   - Mobile-first design
   - Use sm:, md:, lg:, xl: breakpoints
   - Include hover:, focus:, active: states

### Example Component Structure
\`\`\`javascript:src/components/ExampleComponent.jsx
import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const styles = {
  container: cn(
    'min-h-screen bg-gray-900',
    'p-4 md:p-6 lg:p-8',
    'overflow-hidden'
  ),
  wrapper: cn(
    'max-w-2xl mx-auto',
    'space-y-4 md:space-y-6'
  ),
  header: cn(
    'flex items-center justify-between',
    'p-4 rounded-lg',
    'bg-gray-800'
  ),
  title: cn(
    'text-xl font-semibold md:text-2xl',
    'text-white'
  ),
  button: cn(
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium',
    'bg-blue-500 text-white',
    'hover:bg-blue-600',
    'h-10 px-4 py-2',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none'
  ),
  dialogOverlay: cn(
    'fixed inset-0',
    'bg-black/50 backdrop-blur-sm'
  ),
  dialogContent: cn(
    'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'w-full max-w-md',
    'bg-gray-800 p-6 rounded-lg shadow-xl'
  )
}

/**
 * A example component demonstrating best practices
 * @param {Object} props
 * @param {string} props.title - The title to display
 */
const ExampleComponent = ({ title }) => {
  const [open, setOpen] = useState(false)
  
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button className={styles.button}>
                <Plus className="w-4 h-4" />
                Open Dialog
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogOverlay} />
              <Dialog.Content className={styles.dialogContent}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-white">Dialog Content</h2>
                  <Dialog.Close className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </header>
      </div>
    </div>
  )
}

ExampleComponent.displayName = 'ExampleComponent'

export { ExampleComponent }
export default ExampleComponent

### Available Dependencies (USE ONLY THESE - NO OTHER DEPENDENCIES)
1. Radix UI Components:
   - @radix-ui/react-accordion: ^1.2.0
   - @radix-ui/react-alert-dialog: ^1.1.1
   - @radix-ui/react-aspect-ratio: ^1.1.0
   - @radix-ui/react-avatar: ^1.1.0
   - @radix-ui/react-checkbox: ^1.1.1
   - @radix-ui/react-collapsible: ^1.1.0
   - @radix-ui/react-dialog: ^1.1.1
   - @radix-ui/react-dropdown-menu: ^2.1.1
   - @radix-ui/react-hover-card: ^1.1.1
   - @radix-ui/react-label: ^2.1.0
   - @radix-ui/react-menubar: ^1.1.1
   - @radix-ui/react-navigation-menu: ^1.2.0
   - @radix-ui/react-popover: ^1.1.1
   - @radix-ui/react-progress: ^1.1.0
   - @radix-ui/react-radio-group: ^1.2.0
   - @radix-ui/react-select: ^2.1.1
   - @radix-ui/react-separator: ^1.1.0
   - @radix-ui/react-slider: ^1.2.0
   - @radix-ui/react-slot: ^1.1.0
   - @radix-ui/react-switch: ^1.1.0
   - @radix-ui/react-tabs: ^1.1.0
   - @radix-ui/react-toast: ^1.2.1
   - @radix-ui/react-toggle: ^1.1.0
   - @radix-ui/react-toggle-group: ^1.1.0
   - @radix-ui/react-tooltip: ^1.1.2

2. Utility Libraries:
   - class-variance-authority: ^0.7.0
   - tailwindcss-animate: ^1.0.7
   - tailwind-merge: ^2.0.0
   - clsx: ^2.0.0
   - lucide-react: ^0.292.0
   - framer-motion: ^11.0.5

3. Core Dependencies:
   - tailwindcss: ^3.3.0
   - postcss: ^8.4.31
   - autoprefixer: ^10.4.16
   - @tailwindcss/forms: ^0.5.7
   - react-resizable-panels: ^0.0.55

Remember:
- NO arbitrary Tailwind values (never use square brackets [])
- Use Radix UI primitives directly (not shadcn/ui components)
- Include both named and default exports
- Use JSDoc for props documentation
- Use semantic HTML and proper ARIA attributes
- Mobile-first responsive design
- Implement proper error handling`

const styles = {
  container: cn(
    'flex h-screen w-full',
    'bg-gray-900 text-gray-100',
    'overflow-hidden'
  ),
  sidebarContainer: cn(
    'fixed inset-y-0 left-0 z-50',
    'w-64 md:w-64',
    'transform transition-transform duration-300 ease-in-out',
    'md:relative md:transform-none',
    'bg-gray-900 border-r border-gray-800'
  ),
  mainWrapper: cn(
    'flex flex-col flex-1',
    'w-full min-w-0',
    'md:pl-0' // Remove default padding
  ),
  main: cn('flex flex-col flex-1', 'w-full h-full', 'relative'),
  messagesContainer: cn(
    'flex-1 overflow-y-auto',
    'w-full',
    'px-4 py-4',
    'space-y-4',
    'sm:px-6 md:px-8'
  ),
  inputContainer: cn(
    'flex flex-col w-full',
    'p-4 border-t border-gray-800',
    'bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80',
    'sm:p-6 md:p-8'
  ),
  modelSelectorWrapper: cn(
    'flex items-center justify-between w-full',
    'p-4 border-b border-gray-800',
    'bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80'
  ),
  menuButton: cn(
    'p-2 rounded-md',
    'text-gray-400 hover:text-gray-300',
    'transition-colors duration-200',
    'md:hidden',
    'focus:outline-none focus:ring-2 focus:ring-blue-500'
  ),
}

export const ChatInterface = ({ isSidebarOpen, onSidebarOpenChange }) => {
  const messagesEndRef = useRef(null)
  const responseBuffer = useRef('')
  const { uploadFile } = useFileStore()

  const {
    messages,
    currentModel,
    isStreaming,
    isThinking,
    thoughts,
    addMessage,
    updateLastMessage,
    setIsStreaming,
    setIsThinking,
    addThought,
    clearThoughts,
  } = useChatStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, thoughts])

  const processThinkingStep = content => {
    if (content.startsWith('THINKING:')) {
      const thought = content.replace('THINKING:', '').trim()
      if (thought) {
        addThought(thought)
      }
      return ''
    }
    return content
  }

  const processResponseStep = content => {
    if (content.includes('RESPONSE:')) {
      setIsThinking(false)
      return content.split('RESPONSE:')[1].trim()
    }
    return content
  }

  const handleSubmit = async ({ text, files }) => {
    if (!text.trim() && files.length === 0) return

    // Clear any existing thoughts
    clearThoughts()

    // Add user message
    addMessage({
      role: 'user',
      content: text,
      files:
        files.length > 0 ? await Promise.all(files.map(uploadFile)) : undefined,
    })

    setIsStreaming(true)
    setIsThinking(currentModel.isReasoning)

    try {
      const provider = getProvider(currentModel.provider)
      const stream = await provider.streamChatCompletion(
        [
          {
            role: 'system',
            content: currentModel.isReasoning
              ? REASONING_PROMPT
              : SYSTEM_PROMPT,
          },
          ...messages,
          { role: 'user', content: text },
        ],
        currentModel
      )

      // Add initial assistant message
      addMessage({
        role: 'assistant',
        content: '',
      })

      let accumulatedContent = ''

      for await (const chunk of stream) {
        // Process the chunk content
        const processedContent = processThinkingStep(chunk)
        if (processedContent) {
          accumulatedContent += processedContent
          const finalContent = processResponseStep(accumulatedContent)
          updateLastMessage(finalContent || accumulatedContent)
        }
      }

      // If we're still in thinking mode after the stream ends,
      // it means we never got a RESPONSE: marker, so just use the accumulated content
      if (isThinking) {
        setIsThinking(false)
        updateLastMessage(accumulatedContent)
      }
    } catch (error) {
      console.error('Error in chat:', error)
      addMessage({
        role: 'assistant',
        content: `Error: ${error.message}`,
      })
    } finally {
      setIsStreaming(false)
      setIsThinking(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside
        className={cn(
          styles.sidebarContainer,
          !isSidebarOpen && '-translate-x-full'
        )}
      >
        <ChatSidebar
          onClose={() => onSidebarOpenChange(false)}
          isOpen={isSidebarOpen}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className={cn('fixed inset-0 bg-black/50 z-40', 'md:hidden')}
          onClick={() => onSidebarOpenChange(false)}
          role='button'
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === 'Space') {
              onSidebarOpenChange(false)
            }
          }}
          aria-label='Close sidebar'
        />
      )}

      {/* Main content wrapper */}
      <div className={styles.mainWrapper}>
        <main className={styles.main}>
          <div className={styles.modelSelectorWrapper}>
            <button
              onClick={() => onSidebarOpenChange(true)}
              className={styles.menuButton}
              aria-label='Open sidebar'
            >
              <Menu className='w-6 h-6' />
            </button>
            <ModelSelector />
          </div>

          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isStreaming={isStreaming && index === messages.length - 1}
              />
            ))}
            {isThinking && <ThinkingProcess thoughts={thoughts} />}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <ChatInput onSubmit={handleSubmit} disabled={isStreaming} />
          </div>
        </main>
      </div>
    </div>
  )
}

ChatInterface.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  onSidebarOpenChange: PropTypes.func.isRequired,
}

ChatInterface.displayName = 'ChatInterface'

export default ChatInterface
