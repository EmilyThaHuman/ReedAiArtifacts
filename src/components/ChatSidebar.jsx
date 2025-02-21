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
  ChevronLeft,
  HelpCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/store/useChatStore'
import { PromptDialog } from './PromptDialog'
import { NavUser } from './NavUser'
import { NavSecondary } from './NavSecondary'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Sidebar,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar'

// Styles organized by component
const styles = {
  // Main container styles
  container: {
    header: cn(
      'flex items-center justify-between',
      'p-4',
      'border-b border-sidebar-border'
    ),
    headerCollapsed: cn('flex-col items-center gap-2', 'py-4 px-2'),
    searchContainer: cn(
      'p-4 border-b border-sidebar-border',
      'transition-all duration-200'
    ),
    searchWrapper: cn('flex items-center gap-2', 'w-full'),
    searchWrapperCollapsed: cn('flex-col items-center gap-2'),
    conversationsList: cn('flex-1 overflow-hidden'),
  },
  // Button styles
  buttons: {
    newChat: cn(
      'flex items-center justify-center gap-2',
      'bg-sidebar-primary text-sidebar-primary-foreground',
      'hover:bg-sidebar-primary/90',
      'transition-all duration-200'
    ),
    newChatCollapsed: cn('w-10 h-10 p-0', 'rounded-md'),
    newChatExpanded: 'flex-1 px-4 py-2',
    toggle: cn(
      'absolute right-0 top-3 -mr-3 h-6 w-6',
      'flex items-center justify-center',
      'rounded-full border bg-background shadow-md',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-1',
      'transition-transform duration-100 active:translate-x-0.5'
    ),
  },
  // Folder styles
  folder: {
    header: cn(
      'flex items-center gap-2 p-2 rounded-md',
      'hover:bg-sidebar-accent/10',
      'cursor-pointer',
      'group'
    ),
    name: cn(
      'flex-1 text-sm font-medium',
      'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'
    ),
    actions: cn(
      'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
    ),
  },
  // Conversation styles
  conversation: {
    item: cn(
      'flex w-full items-center gap-2 p-2 rounded-md',
      'hover:bg-sidebar-accent/10',
      'cursor-pointer',
      'group',
      'transition-colors duration-200'
    ),
    selected: cn('bg-sidebar-accent/20 hover:bg-sidebar-accent/30'),
    actions: cn(
      'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
    ),
  },
}

const ConversationItem = ({
  conversation,
  selected,
  onSelect,
  onDelete,
  onRegenerateTitle,
  onDragStart,
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          styles.conversation.item,
          selected && styles.conversation.selected
        )}
        onClick={onSelect}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
        draggable
        onDragStart={onDragStart}
        role='option'
        aria-selected={selected}
        tabIndex={0}
      >
        <MessageSquare className='h-4 w-4 text-muted-foreground' />
        <span className='flex-1 text-sm truncate'>{conversation.title}</span>

        <div className={styles.conversation.actions}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={e => {
                  e.stopPropagation()
                  onRegenerateTitle()
                }}
                aria-label='Regenerate title'
              >
                <RefreshCw className='h-3 w-3' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerate Title</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-destructive'
                onClick={e => {
                  e.stopPropagation()
                  onDelete()
                }}
                aria-label='Delete chat'
              >
                <Trash2 className='h-3 w-3' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Chat</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

ConversationItem.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRegenerateTitle: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
}

export const ChatSidebar = () => {
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

  const { collapsed, setCollapsed } = useSidebar()

  const [expandedFolders, setExpandedFolders] = useState({})
  const [draggedConversation, setDraggedConversation] = useState(null)
  const [editingFolderId, setEditingFolderId] = useState(null)
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

  const handleFolderNameEdit = (e, folderId) => {
    e.stopPropagation()
    setEditingFolderId(folderId)
  }

  const handleFolderNameSave = (folderId, newName) => {
    if (newName.trim()) {
      renameFolder(folderId, newName.trim())
    }
    setEditingFolderId(null)
  }

  const handleFolderNameKeyDown = (folderId, newName) => {
    if (newName.trim()) {
      renameFolder(folderId, newName.trim())
    }
    setEditingFolderId(null)
  }

  // Helper to get conversations not in any folder
  const unorganizedConversations = conversations.filter(
    conv => !folders.some(folder => folder.conversations.includes(conv.id))
  )

  const sidebarContent = (
    <TooltipProvider delayDuration={0}>
      {/* Header with New Chat and More Options */}
      <div
        className={cn(
          styles.container.header,
          collapsed && styles.container.headerCollapsed
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={createNewConversation}
              className={cn(
                styles.buttons.newChat,
                collapsed
                  ? styles.buttons.newChatCollapsed
                  : styles.buttons.newChatExpanded
              )}
              aria-label='New chat'
            >
              <PlusCircle className='h-5 w-5' />
              <span
                className={cn(
                  'hidden md:inline',
                  collapsed && 'hidden md:hidden'
                )}
              >
                New Chat
              </span>
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side='right'>New Chat</TooltipContent>}
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn('ml-2', collapsed && 'ml-0')}
                >
                  <MoreVertical className='h-5 w-5' />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side='right'>More Options</TooltipContent>
            )}
          </Tooltip>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => setPromptDialogOpen(true)}>
              <Sparkles className='h-4 w-4 mr-2' />
              New Prompt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search and New Folder */}
      <div className={styles.container.searchContainer}>
        <div
          className={cn(
            styles.container.searchWrapper,
            collapsed && styles.container.searchWrapperCollapsed
          )}
        >
          {!collapsed && (
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                type='text'
                placeholder='Search chats...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleCreateFolder}
                className={cn(
                  'h-9 w-9',
                  !collapsed && 'ml-2' // Add margin only when not collapsed
                )}
                aria-label='New folder'
              >
                <Folder className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? 'right' : 'top'}>
              New Folder
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className={styles.container.conversationsList}>
        <div className='p-2 space-y-2' role='listbox'>
          {/* Folders */}
          {folders.map(folder => (
            <div key={folder.id}>
              <div
                className={styles.folder.header}
                onClick={() => toggleFolder(folder.id)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, folder.id)}
                role='button'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleFolder(folder.id)
                  }
                }}
                aria-expanded={expandedFolders[folder.id]}
              >
                {expandedFolders[folder.id] ? (
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                )}

                {editingFolderId === folder.id ? (
                  <Input
                    ref={inputRef}
                    defaultValue={folder.name}
                    onBlur={e =>
                      handleFolderNameSave(folder.id, e.target.value)
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleFolderNameKeyDown(folder.id, e.target.value)
                      }
                    }}
                    className='h-7 py-1'
                    aria-label='Edit folder name'
                  />
                ) : (
                  <span
                    className={cn(styles.folder.name, collapsed && 'sr-only')}
                  >
                    {folder.name}
                  </span>
                )}

                {!collapsed && (
                  <div className={styles.folder.actions}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={e => {
                            e.stopPropagation()
                            handleFolderNameEdit(e, folder.id)
                          }}
                          aria-label='Rename folder'
                        >
                          <Pencil className='h-3 w-3' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Rename Folder</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-destructive'
                          onClick={e => {
                            e.stopPropagation()
                            deleteFolder(folder.id)
                          }}
                          aria-label='Delete folder'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Folder</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {expandedFolders[folder.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={cn('space-y-1', !collapsed && 'pl-4')}
                    role='group'
                    aria-label={`${folder.name} conversations`}
                  >
                    {folder.conversations.map(convId => {
                      const conversation = conversations.find(
                        c => c.id === convId
                      )
                      if (!conversation) return null

                      return (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          selected={
                            selectedConversation?.id === conversation.id
                          }
                          onSelect={() => selectConversation(conversation)}
                          onDelete={() => deleteConversation(conversation.id)}
                          onRegenerateTitle={() =>
                            regenerateTitle(conversation.id)
                          }
                          onDragStart={e => handleDragStart(e, conversation.id)}
                        />
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Unorganized Conversations */}
          {unorganizedConversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              selected={selectedConversation?.id === conversation.id}
              onSelect={() => selectConversation(conversation)}
              onDelete={() => deleteConversation(conversation.id)}
              onRegenerateTitle={() => regenerateTitle(conversation.id)}
              onDragStart={e => handleDragStart(e, conversation.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer with User Menu */}
      <SidebarFooter>
        <NavSecondary
          items={[
            {
              title: 'Support',
              url: 'https://support.example.com',
              icon: HelpCircle,
            },
            {
              title: 'Feedback',
              url: 'https://feedback.example.com',
              icon: MessageSquare,
            },
          ]}
        />
        <SidebarSeparator />
        <NavUser />
      </SidebarFooter>

      {/* Prompt Dialog */}
      <PromptDialog
        open={isPromptDialogOpen}
        onOpenChange={setPromptDialogOpen}
        onSubmit={editingPrompt ? editPrompt : createPrompt}
        editingPrompt={editingPrompt}
        onCancelEdit={() => setEditingPrompt(null)}
      />
    </TooltipProvider>
  )

  return (
    <Sidebar variant='floating' collapsible='icon'>
      {sidebarContent}
      <div className={styles.buttons.toggle}>
        <SidebarTrigger>
          {collapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <ChevronLeft className='h-4 w-4' />
          )}
        </SidebarTrigger>
      </div>
    </Sidebar>
  )
}

export default ChatSidebar
