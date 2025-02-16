import React from 'react'
import { ChatInterface } from './components/ChatInterface'
import { ChatSidebar } from './components/ChatSidebar'

export const App = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <ChatSidebar />
      <ChatInterface />
    </div>
  )
}

App.displayName = 'App'

export default App