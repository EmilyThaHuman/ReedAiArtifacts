import React, { useEffect, useState } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { useChatStore } from '@/store/useChatStore'

export const App = () => {
  const {
    conversations,
    selectedConversation,
    createNewConversation,
    selectConversation,
  } = useChatStore()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // If no conversation is selected and we have conversations, select the first one
    if (!selectedConversation && conversations.length > 0) {
      selectConversation(conversations[0].id)
    }
    // If we have no conversations, create a new one
    else if (conversations.length === 0) {
      createNewConversation()
    }
  }, [
    conversations,
    selectedConversation,
    createNewConversation,
    selectConversation,
  ])

  // Update effect to handle sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // 768px is md breakpoint
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }
    
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900'>
      <ChatInterface 
        isSidebarOpen={isSidebarOpen}
        onSidebarOpenChange={setIsSidebarOpen}
      />
    </div>
  )
}

App.displayName = 'App'

export default App
