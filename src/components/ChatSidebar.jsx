import React, { useState, useEffect, useRef } from 'react'
import {
  PlusCircle,
  MessageSquare,
  Trash2,
  RefreshCw,
  Folder,
  ChevronDown,
  ChevronRight,
  Pencil,
  Search,
  MoreVertical,
  Sparkles,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/store/useChatStore'
import { PromptDialog } from './PromptDialog'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

const styles = {
  container: cn('flex flex-col h-full', 'bg-gray-900', 'text-gray-100'),
  header: cn(
    'flex items-center justify-between',
    'p-4 border-b border-gray-800'
  ),
  newChatButton: cn(
    'flex-1 flex items-center justify-center gap-2',
    'p-2 rounded-lg',
    'bg-blue-600 hover:bg-blue-700',
    'text-white font-medium',
    'transition-all duration-200'
  ),
  moreButton: cn(
    'p-2 ml-2 rounded-lg',
    'bg-gray-800 hover:bg-gray-700',
    'transition-colors'
  ),
  searchContainer: cn('p-4 border-b border-gray-800'),
  searchWrapper: cn('flex items-center gap-2'),
  searchInput: cn(
    'flex-1',
    'w-full p-2 pl-9',
    'bg-gray-800 rounded-lg',
    'text-gray-100 placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-blue-500'
  ),
  searchIcon: cn(
    'absolute left-3 top-1/2 -translate-y-1/2',
    'w-4 h-4 text-gray-500'
  ),
  newFolderButton: cn(
    'p-2 rounded-lg',
    'bg-gray-800 hover:bg-gray-700',
    'transition-colors'
  ),
  conversationsList: cn('flex-1 overflow-y-auto', 'px-2 py-2', 'space-y-1'),
  closeButton: cn(
    'absolute top-4 right-4',
    'p-2 rounded-lg',
    'text-gray-400 hover:text-gray-300',
    'transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    'md:hidden' // Hide on desktop
  ),
}

export const ChatSidebar = ({ onClose, isOpen }) => {
  const {
    conversations = [],
    folders = [],
    selectedConversation,
    createNewConversation,
    selectConversation,
    deleteConversation,
    regenerateTitle,
    createFolder,
    moveConversationToFolder,
    deleteFolder,
    renameFolder,
    isPromptDialogOpen,
    setPromptDialogOpen,
    createPrompt,
    editingPrompt,
    setEditingPrompt,
    editPrompt,
  } = useChatStore()

  const [expandedFolders, setExpandedFolders] = useState({})
  const [draggedConversation, setDraggedConversation] = useState(null)
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const inputRef = useRef(null)
  useEffect(() => {
    if (editingFolderId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingFolderId])

  const handleDragStart = (e, conversationId) => {
    setDraggedConversation(conversationId)
    e.dataTransfer.setData('text/plain', conversationId)
  }

  const handleDragOver = e => {
    e.preventDefault()
  }

  const handleDrop = (e, folderId) => {
    e.preventDefault()
    const conversationId = draggedConversation
    if (conversationId) {
      moveConversationToFolder(conversationId, folderId)
    }
    setDraggedConversation(null)
  }

  const toggleFolder = folderId => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const handleCreateFolder = () => {
    const name = `New Folder ${folders.length + 1}`
    createFolder(name)
  }

  const handleFolderNameEdit = (e, folderId, currentName) => {
    e.stopPropagation()
    setEditingFolderId(folderId)
  }

  const handleFolderNameSave = (folderId, newName) => {
    if (newName.trim()) {
      renameFolder(folderId, newName.trim())
    }
    setEditingFolderId(null)
  }

  const handleFolderNameKeyDown = (e, folderId, newName) => {
    if (e.key === 'Enter') {
      handleFolderNameSave(folderId, newName)
    } else if (e.key === 'Escape') {
      setEditingFolderId(null)
    }
  }

  // Helper to get conversations not in any folder
  const unorganizedConversations = conversations.filter(
    conv => !folders.some(folder => folder.conversations.includes(conv.id))
  )

  return (
    <div className={styles.container}>
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className={styles.closeButton}
        aria-label='Close sidebar'
      >
        <X className='w-5 h-5' />
      </button>

      {/* Header with New Chat and More Options */}
      <div className={styles.header}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={createNewConversation}
          className={styles.newChatButton}
        >
          <PlusCircle className='w-5 h-5' />
          New Chat
        </motion.button>

        <div className='relative'>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={styles.moreButton}
            title='More options'
          >
            <MoreVertical className='w-5 h-5' />
          </motion.button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'absolute right-0 mt-2 z-10',
                  'w-48 rounded-lg',
                  'bg-gray-800 shadow-lg',
                  'ring-1 ring-black ring-opacity-5'
                )}
              >
                <div className='py-1'>
                  <button
                    onClick={() => {
                      setPromptDialogOpen(true)
                      setIsDropdownOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-2',
                      'w-full px-4 py-2',
                      'text-sm text-gray-300',
                      'hover:bg-gray-700'
                    )}
                  >
                    <PlusCircle className='w-4 h-4' />
                    New Prompt
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search and New Folder */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <div className='relative flex-1'>
            <input
              type='text'
              placeholder='Search chats...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <Search className={styles.searchIcon} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateFolder}
            className={styles.newFolderButton}
            title='New Folder'
          >
            <Folder className='w-5 h-5' />
          </motion.button>
        </div>
      </div>

      {/* Conversations List */}
      <div className={styles.conversationsList}>
        {/* Folders */}
        {folders.map(folder => (
          <div
            key={folder.id}
            className='group'
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, folder.id)}
          >
            <div
              className={cn(
                'flex items-center gap-2',
                'p-2 rounded-lg',
                'hover:bg-gray-800',
                'cursor-pointer group w-full text-left'
              )}
              onClick={() => toggleFolder(folder.id)}
              role='button'
              aria-expanded={expandedFolders[folder.id]}
              tabIndex={0}
            >
              {expandedFolders[folder.id] ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
              <Folder className='w-5 h-5' />

              {editingFolderId === folder.id ? (
                <input
                  ref={inputRef}
                  type='text'
                  defaultValue={folder.name}
                  className={cn(
                    'flex-1',
                    'bg-gray-700 text-gray-100',
                    'px-2 py-1 rounded-md',
                    'outline-none'
                  )}
                  onClick={e => e.stopPropagation()}
                  onBlur={e => handleFolderNameSave(folder.id, e.target.value)}
                  onKeyDown={e =>
                    handleFolderNameKeyDown(e, folder.id, e.target.value)
                  }
                />
              ) : (
                <>
                  <span className='truncate flex-1'>{folder.name}</span>
                  <div
                    className={cn(
                      'flex items-center gap-2',
                      'opacity-0 group-hover:opacity-100',
                      'transition-opacity'
                    )}
                  >
                    <button
                      onClick={e =>
                        handleFolderNameEdit(e, folder.id, folder.name)
                      }
                      className={cn(
                        'p-1.5 rounded-md',
                        'hover:bg-gray-700',
                        'transition-all',
                        'text-gray-400 hover:text-blue-400'
                      )}
                      title='Edit folder name'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        deleteFolder(folder.id)
                      }}
                      className={cn(
                        'p-1.5 rounded-md',
                        'hover:bg-gray-700',
                        'transition-all',
                        'text-gray-400 hover:text-red-400'
                      )}
                      title='Delete folder'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Folder Contents */}
            <AnimatePresence>
              {expandedFolders[folder.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className='pl-6 space-y-1 overflow-hidden'
                >
                  {folder.conversations.map(convId => {
                    const conv = conversations.find(c => c.id === convId)
                    if (!conv) return null
                    return (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        selected={selectedConversation?.id === conv.id}
                        onSelect={() => selectConversation(conv.id)}
                        onDelete={() => deleteConversation(conv.id)}
                        onRegenerateTitle={() => regenerateTitle(conv.id)}
                        onDragStart={e => handleDragStart(e, conv.id)}
                      />
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Unorganized Conversations */}
        {unorganizedConversations.map(conv => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            selected={selectedConversation?.id === conv.id}
            onSelect={() => selectConversation(conv.id)}
            onDelete={() => deleteConversation(conv.id)}
            onRegenerateTitle={() => regenerateTitle(conv.id)}
            onDragStart={e => handleDragStart(e, conv.id)}
          />
        ))}
      </div>

      <PromptDialog
        isOpen={isPromptDialogOpen}
        onClose={() => {
          setPromptDialogOpen(false)
          setEditingPrompt(null)
        }}
        onSubmit={editingPrompt ? editPrompt : createPrompt}
        editingPrompt={editingPrompt}
      />
    </div>
  )
}

// Separate component for conversation items
const ConversationItem = ({
  conversation,
  selected,
  onSelect,
  onDelete,
  onRegenerateTitle,
  onDragStart,
}) => {
  const isPrompt = conversation.isPrompt
  const { setEditingPrompt } = useChatStore()

  const handleClick = () => {
    if (isPrompt) {
      setEditingPrompt(conversation)
    } else {
      onSelect()
    }
  }

  return (
    <motion.div
      className='group relative'
      draggable
      onDragStart={e => onDragStart(e, conversation.id)}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`
          w-full flex items-center gap-2 p-2 rounded-lg transition-colors
          ${selected ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800 text-gray-300'}
          ${isPrompt ? 'text-purple-400' : ''}
        `}
      >
        {isPrompt ? (
          <Sparkles className='w-5 h-5 flex-shrink-0' />
        ) : (
          <MessageSquare className='w-5 h-5 flex-shrink-0' />
        )}
        <span className='truncate'>{conversation.title || 'New Chat'}</span>
      </motion.button>

      <div className='absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
        {!isPrompt && (
          <button
            onClick={e => {
              e.stopPropagation()
              onRegenerateTitle(conversation.id)
            }}
            className='p-1.5 rounded-md hover:bg-gray-700 transition-all text-gray-400 hover:text-blue-400'
            title='Regenerate title'
          >
            <RefreshCw className='w-4 h-4' />
          </button>
        )}
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete(conversation.id)
          }}
          className='p-1.5 rounded-md hover:bg-gray-700 transition-all text-gray-400 hover:text-red-400'
          title='Delete chat'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>
    </motion.div>
  )
}

ConversationItem.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    isPrompt: PropTypes.bool,
  }).isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRegenerateTitle: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
}

ChatSidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
}

ChatSidebar.displayName = 'ChatSidebar'

export default ChatSidebar
