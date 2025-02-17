import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateChatTitle } from '@/lib/generateChatTitle'
import { Sparkles, Brain, Bot, Star, Lightbulb, Code } from 'lucide-react'
import { availableModels } from '@/lib/providers'
import { useFileStore } from './useFileStore'

const SYSTEM_FOLDERS = {
  PROMPTS: 'prompts',
  TOOLS: 'tools',
  AGENTS: 'agents',
}

const MODEL_METADATA = {
  openai: {
    icon: Sparkles,
    category: 'OpenAI',
  },
  anthropic: {
    icon: Brain,
    category: 'Anthropic',
  },
  mistral: {
    icon: Bot,
    category: 'Mistral AI',
  },
  deepseek: {
    icon: Code,
    category: 'DeepSeek',
  },
  cohere: {
    icon: Star,
    category: 'Cohere',
  },
  google: {
    icon: Lightbulb,
    category: 'Google AI',
  },
}

// Store only the model ID as initial state
const INITIAL_MODEL_ID = availableModels[0].value

const INITIAL_STATE = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  currentModelId: INITIAL_MODEL_ID,
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
    {
      id: SYSTEM_FOLDERS.TOOLS,
      name: 'Tools',
      conversations: [],
      isSystem: true,
    },
    {
      id: SYSTEM_FOLDERS.AGENTS,
      name: 'Agents',
      conversations: [],
      isSystem: true,
    },
  ],
  isPromptDialogOpen: false,
  editingPrompt: null,
}

// Helper to merge initial state with stored state
const mergeInitialState = persistedState => {
  if (!persistedState) return INITIAL_STATE

  // Ensure system folders exist
  const systemFolderIds = Object.values(SYSTEM_FOLDERS)
  const existingFolders = persistedState.folders || []

  const missingSystemFolders = INITIAL_STATE.folders.filter(
    folder => !existingFolders.some(f => f.id === folder.id)
  )

  return {
    ...INITIAL_STATE,
    ...persistedState,
    folders: [...(persistedState.folders || []), ...missingSystemFolders],
    conversations: persistedState.conversations || [],
    currentModelId: persistedState.currentModelId || INITIAL_MODEL_ID,
  }
}

// Helper to get full model object from ID
const getModelFromId = modelId => {
  const model = availableModels.find(model => model.value === modelId)
  return model || availableModels[0]
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Add rehydration handler
      rehydrateStore: state => {
        console.log('Rehydrating state:', state)
        const mergedState = mergeInitialState(state)
        console.log('Merged state:', mergedState)

        // Ensure all folders have valid conversation arrays
        const rehydratedFolders = mergedState.folders.map(folder => ({
          ...folder,
          conversations: Array.isArray(folder.conversations)
            ? folder.conversations
            : [],
          isSystem: folder.id in SYSTEM_FOLDERS ? true : false,
        }))

        // Ensure all conversations exist and are valid
        const validConversations = mergedState.conversations.filter(
          conv => conv && conv.id
        )

        // Remove any references to non-existent conversations from folders
        const cleanedFolders = rehydratedFolders.map(folder => ({
          ...folder,
          conversations: folder.conversations.filter(convId =>
            validConversations.some(conv => conv.id === convId)
          ),
        }))

        const finalState = {
          ...mergedState,
          folders: cleanedFolders,
          conversations: validConversations,
        }
        console.log('Final rehydrated state:', finalState)
        set(finalState)
      },

      // Computed property to get the full model object
      get currentModel() {
        const model = getModelFromId(get().currentModelId)
        return {
          ...model,
          icon: MODEL_METADATA[model.provider]?.icon,
        }
      },

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
            messages: conversation.messages || [],
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
          const nextConversation = newConversations[0]
          return {
            conversations: newConversations,
            selectedConversation: nextConversation?.id || null,
            messages: nextConversation?.messages || [],
          }
        }),

      setCurrentModel: model => {
        if (!model?.value) {
          console.log('Invalid model:', model)
          return
        }

        // Ensure the model exists in availableModels
        const validModel = availableModels.find(m => m.value === model.value)
        if (!validModel) {
          console.log('Unknown model:', model)
          return
        }

        console.log('Setting model ID:', model.value)
        set(state => {
          console.log('Previous state:', state)
          return { currentModelId: model.value }
        })
      },
      setIsStreaming: status => set({ isStreaming: status }),
      setIsThinking: status => set({ isThinking: status }),

      addThought: thought =>
        set(state => ({
          thoughts: [...state.thoughts, thought],
        })),

      clearThoughts: () => set({ thoughts: [] }),

      addMessage: async message => {
        const currentState = get()
        const currentConversation = currentState.conversations.find(
          c => c.id === currentState.selectedConversation
        )

        if (!currentConversation) {
          console.error('No conversation selected')
          return
        }

        let updatedMessage = message

        if (message.files) {
          // Store files and get their IDs
          const fileStore = useFileStore.getState()
          const filePromises = Array.from(message.files).map(file =>
            fileStore.addFile(file)
          )

          const fileIds = await Promise.all(filePromises)
          updatedMessage = {
            ...message,
            files: fileIds,
          }
        }

        const updatedMessages = [...currentState.messages, updatedMessage]

        set(state => ({
          messages: updatedMessages,
          conversations: state.conversations.map(conv =>
            conv.id === currentState.selectedConversation
              ? { ...conv, messages: updatedMessages }
              : conv
          ),
        }))

        // Generate title after first user message or if still default title
        if (
          (currentConversation.title === 'New Chat' &&
            message.role === 'assistant') ||
          (currentConversation.messages.length === 0 && message.role === 'user')
        ) {
          try {
            const newTitle = await generateChatTitle(
              updatedMessages,
              currentState.currentModel
            )
            get().updateConversationTitle(
              currentState.selectedConversation,
              newTitle
            )
          } catch (error) {
            console.error('Error generating chat title:', error)
          }
        }
      },

      updateLastMessage: content => {
        set(state => {
          const updatedMessages = [...state.messages]
          if (updatedMessages.length > 0) {
            updatedMessages[updatedMessages.length - 1].content = content
          }

          return {
            messages: updatedMessages,
            conversations: state.conversations.map(conv =>
              conv.id === state.selectedConversation
                ? { ...conv, messages: updatedMessages }
                : conv
            ),
          }
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

        set(state => ({
          messages: [],
          thoughts: [],
          conversations: state.conversations.map(conv =>
            conv.id === state.selectedConversation
              ? { ...conv, messages: [] }
              : conv
          ),
        }))
      },

      regenerateTitle: async conversationId => {
        const state = get()
        const conversation = state.conversations.find(
          c => c.id === conversationId
        )
        if (conversation?.messages.length > 0) {
          try {
            const newTitle = await generateChatTitle(
              conversation.messages,
              state.currentModel
            )
            get().updateConversationTitle(conversationId, newTitle)
          } catch (error) {
            console.error('Error regenerating chat title:', error)
            // Keep existing title on error
          }
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
              isSystem: false,
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
      storage: {
        getItem: name => {
          const str = localStorage.getItem(name)
          console.log('Loading from storage:', name, str)
          return str
        },
        setItem: (name, value) => {
          console.log('Saving to storage:', name, value)
          localStorage.setItem(name, value)
        },
        removeItem: name => localStorage.removeItem(name),
      },
      partialize: state => {
        const partialState = {
          conversations: state.conversations || [],
          currentModelId: state.currentModelId || INITIAL_MODEL_ID,
          folders: (state.folders || []).map(folder => ({
            id: folder.id,
            name: folder.name,
            conversations: folder.conversations || [],
            isSystem: folder.id in SYSTEM_FOLDERS ? true : false,
          })),
        }
        console.log('Partializing state:', partialState)
        return partialState
      },
      version: 1,
      onRehydrateStorage: () => state => {
        console.log('onRehydrateStorage called with state:', state)
        if (state) {
          state.rehydrateStore(state)
        }
      },
      merge: (persistedState, currentState) => {
        console.log('Merging states:', { persistedState, currentState })
        const merged = mergeInitialState(persistedState)
        console.log('Merge result:', merged)
        return {
          ...currentState,
          ...merged,
        }
      },
    }
  )
)
