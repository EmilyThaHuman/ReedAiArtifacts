import React, { useRef, useEffect, useState } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { openai } from '@/lib/openai'
import { ChatMessage } from './ChatMessage'
import { ModelSelector } from './ModelSelector'
import ThinkingProcess from './ThinkingProcess'
import ChatInput from './ChatInput'

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

const SYSTEM_PROMPT = `You are an expert full-stack JavaScript developer specialized in React. When writing code:

1. Always write complete, self-contained components
2. Include all necessary imports, but for sandbox previews:
   - Do NOT include 'prop-types' imports as they're not needed in the preview
   - Use inline PropTypes for documentation only
   - Keep only React and essential UI-related imports
3. Use functional components with hooks
4. Add proper error handling and loading states
5. Follow React best practices and accessibility guidelines
6. Always provide code in markdown code blocks with proper language and file path tags
7. Use \`\`\`javascript:path/to/file\`\` format for code blocks
8. For component previews:
   - Remove PropTypes imports and declarations
   - Keep only essential imports (React, styles)
   - Focus on the core component functionality

Example component format:
\`\`\`javascript:src/components/Example.jsx
import React, { useState } from 'react'
// Note: PropTypes are shown here for documentation but should be removed in preview
// import PropTypes from 'prop-types' - Do not include in preview code

const Example = ({ text }) => {
  // Component implementation
}

// PropTypes shown for documentation
// Example.propTypes = {
//   text: PropTypes.string.isRequired
// }

export default Example
\`\`\``

export const ChatInterface = () => {
  const messagesEndRef = useRef(null)
  const responseBuffer = useRef('')

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

  const handleSubmit = async input => {
    const userMessage = { role: 'user', content: input }
    addMessage(userMessage)
    setIsStreaming(true)
    responseBuffer.current = ''

    if (currentModel?.isReasoning) {
      setIsThinking(true)
      clearThoughts()
    }

    try {
      const allMessages = [
        {
          role: 'system',
          content: currentModel?.isReasoning ? REASONING_PROMPT : SYSTEM_PROMPT,
        },
        ...messages,
        userMessage,
      ]

      const stream = await openai.streamChatCompletion(
        allMessages,
        currentModel
      )

      addMessage({ role: 'assistant', content: '' })

      for await (const chunk of stream) {
        if (currentModel?.isReasoning) {
          // Process thinking steps
          const thoughtContent = processThinkingStep(chunk)

          // Process response
          const responseContent = processResponseStep(chunk)

          if (responseContent) {
            responseBuffer.current += responseContent
            updateLastMessage(responseBuffer.current)
          }
        } else {
          responseBuffer.current += chunk
          updateLastMessage(responseBuffer.current)
        }
      }
    } catch (error) {
      console.error('Error in chat completion:', error)
      addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      })
    } finally {
      setIsStreaming(false)
      setIsThinking(false)
      responseBuffer.current = ''
    }
  }

  return (
    <div className='flex-1 flex flex-col h-screen bg-gray-900 text-gray-100'>
      <div className='flex items-center justify-between p-4 border-b border-gray-800'>
        <h1 className='text-xl font-semibold'>Reed AI Chat</h1>
        <ModelSelector />
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.role}-${index}`}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1}
          />
        ))}
        {currentModel?.isReasoning && thoughts && thoughts.length > 0 && (
          <ThinkingProcess
            thoughts={thoughts}
            isVisible={isThinking}
            isComplete={!isStreaming && thoughts.length > 0}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isStreaming}
        placeholder={
          isStreaming ? 'Waiting for response...' : 'Type your message...'
        }
      />
    </div>
  )
}

ChatInterface.displayName = 'ChatInterface'

export default ChatInterface
