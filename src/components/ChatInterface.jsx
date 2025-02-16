import React, { useRef, useEffect } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { openai } from '@/lib/openai'
import { ChatMessage } from './ChatMessage'
import { ModelSelector } from './ModelSelector'
import { ThinkingProcess } from './ThinkingProcess'
import { ChatInput } from './ChatInput'

const SYSTEM_PROMPT = `You are an expert full-stack JavaScript developer specialized in React. When writing code:
1. Always write complete, self-contained components
2. Include all necessary imports
3. Use functional components with hooks
4. Add proper error handling and loading states
5. Follow React best practices and accessibility guidelines`

export const ChatInterface = () => {
  const messagesEndRef = useRef(null)
  
  const {
    messages,
    currentModel,
    isStreaming,
    addMessage,
    updateLastMessage,
    setIsStreaming,
  } = useChatStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (input) => {
    try {
      // Add user message
      const userMessage = { role: 'user', content: input }
      addMessage(userMessage)
      setIsStreaming(true)

      // Start with empty assistant message
      addMessage({ role: 'assistant', content: '' })
      let fullContent = ''

      // Get stream from OpenAI
      const stream = await openai.streamChatCompletion(
        [{ role: 'system', content: SYSTEM_PROMPT }, ...messages, userMessage],
        currentModel?.value || 'gpt-3.5-turbo'
      )

      // Process stream chunks
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          updateLastMessage(fullContent)
        }
      }
    } catch (error) {
      console.error('Chat Error:', error)
      addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      })
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-900 text-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Reed AI Chat</h1>
        <ModelSelector />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message} 
            isStreaming={isStreaming && index === messages.length - 1} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSubmit={handleSubmit}
        isLoading={isStreaming}
        placeholder={isStreaming ? "Waiting for response..." : "Type your message..."}
      />
    </div>
  )
}

ChatInterface.displayName = 'ChatInterface'

export default ChatInterface