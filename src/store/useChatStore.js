import { create } from 'zustand'

const INITIAL_MODEL = {
  value: 'gpt-3.5-turbo',
  label: 'GPT-3.5 Turbo',
  description: 'Fast and cost-effective chat model'
}

export const useChatStore = create((set, get) => ({
  messages: [],
  currentModel: INITIAL_MODEL,
  isStreaming: false,
  conversations: [],
  selectedConversation: null,
  
  setCurrentModel: (model) => set({ currentModel: model }),
  setIsStreaming: (status) => set({ isStreaming: status }),
  
  addMessage: (message) => set((state) => {
    const newMessages = [...state.messages, message]
    // Also update the current conversation if one is selected
    if (state.selectedConversation) {
      const conversations = state.conversations.map(conv => 
        conv.id === state.selectedConversation
          ? { ...conv, messages: newMessages }
          : conv
      )
      return { messages: newMessages, conversations }
    }
    return { messages: newMessages }
  }),
  
  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages]
    if (messages.length > 0) {
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content
      }
      // Also update the current conversation if one is selected
      if (state.selectedConversation) {
        const conversations = state.conversations.map(conv => 
          conv.id === state.selectedConversation
            ? { ...conv, messages }
            : conv
        )
        return { messages, conversations }
      }
    }
    return { messages }
  }),
  
  createNewConversation: () => {
    const id = Date.now().toString()
    set((state) => ({
      conversations: [...state.conversations, {
        id,
        title: 'New Chat',
        messages: []
      }],
      selectedConversation: id,
      messages: []
    }))
  },
  
  selectConversation: (id) => {
    const state = get()
    const conversation = state.conversations.find(c => c.id === id)
    if (conversation) {
      set({
        selectedConversation: id,
        messages: conversation.messages
      })
    }
  },
  
  clearMessages: () => set({ messages: [] })
}))