import React from 'react'
import { ChatInterface } from './components/ChatInterface'
import { useChatStore } from '@/store/useChatStore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ThemeProvider } from 'next-themes'

export const App = () => {
  const { conversations, createNewConversation } = useChatStore()

  // Create a new conversation if none exist
  React.useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation()
    }
  }, [conversations, createNewConversation])

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <TooltipProvider delayDuration={0}>
        <SidebarProvider defaultCollapsed={false}>
          <div className='flex h-screen bg-background'>
            <ChatInterface />
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

App.displayName = 'App'

export default App
