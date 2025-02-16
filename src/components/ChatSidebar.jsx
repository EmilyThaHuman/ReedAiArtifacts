import React from 'react'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/useChatStore'

export const ChatSidebar = () => {
  const {
    conversations = [],
    selectedConversation,
    createNewConversation,
    selectConversation,
  } = useChatStore()

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className='w-64 h-screen bg-gray-900 border-r border-gray-800 text-gray-100 p-4 flex flex-col'
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={createNewConversation}
        className='flex items-center gap-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 
          transition-colors mb-4 text-white font-medium'
      >
        <PlusCircle className='w-5 h-5' />
        New Chat
      </motion.button>

      <div className='flex-1 overflow-y-auto space-y-2'>
        {conversations.map(conversation => (
          <motion.button
            key={conversation.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectConversation(conversation.id)}
            className={`
              w-full flex items-center gap-2 p-2 rounded-lg transition-colors
              ${
                selectedConversation === conversation.id
                  ? 'bg-gray-800 text-blue-400'
                  : 'hover:bg-gray-800 text-gray-300'
              }
            `}
          >
            <MessageSquare className='w-5 h-5' />
            <span className='truncate'>{conversation.title || 'New Chat'}</span>
          </motion.button>
        ))}

        {conversations.length === 0 && (
          <div className='text-center py-4 text-gray-500 text-sm'>
            No conversations yet
          </div>
        )}
      </div>
    </motion.div>
  )
}

ChatSidebar.displayName = 'ChatSidebar'

export default ChatSidebar
