import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateChatTitle } from '@/lib/generateChatTitle'
import { Sparkles } from 'lucide-react'
import { availableModels } from '@/lib/providers'
import { useFileStore } from './useFileStore'

const SYSTEM_FOLDERS = {
  PROMPTS: 'prompts',
}

const INITIAL_MODEL = {
  value: 'gpt-3.5-turbo',
  label: 'GPT-3.5 Turbo',
  description: 'Fast and cost-effective chat model',
  isReasoning: false,
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      selectedConversation: null,
      messages: [],
      currentModel: availableModels[0],
      isStreaming: false,
      isThinking: false,
      thoughts: [],
      folders: [
        {
          id: SYSTEM_FOLDERS.PROMPTS,
          name: 'Prompts',
          conversations: [],
          isSystem: true,
        },
      ],
      isPromptDialogOpen: false,
      editingPrompt: null,

      createNewConversation: () => {
        // First check if there's already an empty "New Chat"
        const existingNewChat = get().conversations.find(
          conv => conv.title === 'New Chat' && conv.messages.length === 0
        )

        // If we found an empty new chat, just select it
        if (existingNewChat) {
          set({
            selectedConversation: existingNewChat.id,
            messages: [],
          })
          return existingNewChat.id
        }

        // Otherwise create a new conversation
        const newConversation = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
        }

        set(state => ({
          conversations: [newConversation, ...state.conversations],
          selectedConversation: newConversation.id,
          messages: [],
        }))

        return newConversation.id
      },

      selectConversation: conversationId => {
        const conversation = get().conversations.find(
          c => c.id === conversationId
        )
        if (conversation) {
          set({
            selectedConversation: conversationId,
            messages: conversation.messages,
          })
        }
      },

      updateConversationTitle: (id, title) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === id ? { ...conv, title } : conv
          ),
        }))
      },

      deleteConversation: id =>
        set(state => {
          const newConversations = state.conversations.filter(c => c.id !== id)
          return {
            conversations: newConversations,
            selectedConversation: newConversations[0]?.id || null,
            messages: newConversations[0]?.messages || [],
          }
        }),

      setCurrentModel: model => set({ currentModel: model }),
      setIsStreaming: status => set({ isStreaming: status }),
      setIsThinking: status => set({ isIsThinking: status }),

      addThought: thought =>
        set(state => ({
          thoughts: [...state.thoughts, thought],
        })),

      clearThoughts: () => set({ thoughts: [] }),

      addMessage: async message => {
        if (message.files) {
          // Store files and get their IDs
          const fileStore = useFileStore.getState()
          const filePromises = Array.from(message.files).map(file =>
            fileStore.addFile(file)
          )

          const fileIds = await Promise.all(filePromises)
          set(state => ({
            messages: [
              ...state.messages,
              {
                ...message,
                files: fileIds,
              },
            ],
          }))
        } else {
          set(state => ({
            messages: [...state.messages, message],
          }))
        }

        // Generate title after 2 messages
        const currentConversation = get().conversations.find(
          c => c.id === get().selectedConversation
        )

        if (
          currentConversation?.messages.length === 2 &&
          currentConversation.title === 'New Chat'
        ) {
          try {
            const newTitle = await generateChatTitle(
              currentConversation.messages
            )
            get().updateConversationTitle(get().selectedConversation, newTitle)
          } catch (error) {
            console.error('Error generating chat title:', error)
          }
        }
      },

      updateLastMessage: content => {
        set(state => {
          const messages = [...state.messages]
          if (messages.length > 0) {
            messages[messages.length - 1].content = content
          }
          return { messages }
        })
      },

      clearMessages: () => {
        // Clean up file attachments
        const fileStore = useFileStore.getState()
        get().messages.forEach(message => {
          if (message.files) {
            message.files.forEach(fileId => fileStore.removeFile(fileId))
          }
        })
        set({ messages: [], thoughts: [] })
      },

      regenerateTitle: async conversationId => {
        const conversation = get().conversations.find(
          c => c.id === conversationId
        )
        if (conversation?.messages.length > 0) {
          const newTitle = await generateChatTitle(conversation.messages)
          get().updateConversationTitle(conversationId, newTitle)
        }
      },

      createFolder: name =>
        set(state => ({
          folders: [
            ...state.folders,
            {
              id: crypto.randomUUID(),
              name,
              conversations: [],
            },
          ],
        })),

      moveConversationToFolder: (conversationId, folderId) =>
        set(state => {
          const newFolders = [...state.folders]
          const newConversations = [...state.conversations]

          // Remove from old folder if it exists
          newFolders.forEach(folder => {
            folder.conversations = folder.conversations.filter(
              id => id !== conversationId
            )
          })

          // Add to new folder
          if (folderId) {
            const targetFolder = newFolders.find(f => f.id === folderId)
            if (targetFolder) {
              targetFolder.conversations.push(conversationId)
            }
          }

          return {
            folders: newFolders,
            conversations: newConversations,
          }
        }),

      deleteFolder: folderId =>
        set(state => ({
          folders: state.folders.filter(f => !f.isSystem && f.id !== folderId),
        })),

      renameFolder: (folderId, newName) =>
        set(state => ({
          folders: state.folders.map(f =>
            f.id === folderId ? { ...f, name: newName } : f
          ),
        })),

      createPrompt: promptData =>
        set(state => {
          const newPrompt = {
            id: crypto.randomUUID(),
            title: promptData.title,
            messages: [
              {
                role: 'system',
                content: promptData.systemPrompt,
              },
            ],
            createdAt: new Date().toISOString(),
            isPrompt: true,
          }

          const promptsFolder = state.folders.find(
            f => f.id === SYSTEM_FOLDERS.PROMPTS
          )
          const updatedFolders = state.folders.map(folder =>
            folder.id === SYSTEM_FOLDERS.PROMPTS
              ? {
                  ...folder,
                  conversations: [...folder.conversations, newPrompt.id],
                }
              : folder
          )

          return {
            conversations: [newPrompt, ...state.conversations],
            folders: updatedFolders,
            isPromptDialogOpen: false,
          }
        }),

      editPrompt: promptData =>
        set(state => {
          const updatedConversations = state.conversations.map(conv =>
            conv.id === promptData.id
              ? {
                  ...conv,
                  title: promptData.title,
                  messages: [
                    {
                      role: 'system',
                      content: promptData.systemPrompt,
                    },
                  ],
                }
              : conv
          )

          return {
            conversations: updatedConversations,
            isPromptDialogOpen: false,
            editingPrompt: null,
          }
        }),

      setEditingPrompt: prompt =>
        set({
          editingPrompt: prompt,
          isPromptDialogOpen: true,
        }),

      setPromptDialogOpen: isOpen => set({ isPromptDialogOpen: isOpen }),
    }),
    {
      name: 'chat-storage',
      partialize: state => ({
        conversations: state.conversations,
        currentModel: state.currentModel,
        folders: state.folders,
      }),
    }
  )
)
