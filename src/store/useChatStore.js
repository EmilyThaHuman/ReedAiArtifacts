import { create } from 'zustand'

const INITIAL_MODEL = {
  value: 'gpt-3.5-turbo',
  label: 'GPT-3.5 Turbo',
  description: 'Fast and cost-effective chat model',
  isReasoning: false
}

export const useChatStore = create((set) => ({
  messages: [],
  currentModel: INITIAL_MODEL,
  isStreaming: false,
  isThinking: false,
  thoughts: [],
  
  setCurrentModel: (model) => set({ currentModel: model }),
  setIsStreaming: (status) => set({ isStreaming: status }),
  setIsThinking: (status) => set({ isThinking: status }),
  
  addThought: (thought) => set(state => ({
    thoughts: [...state.thoughts, thought]
  })),

  clearThoughts: () => set({ thoughts: [] }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages]
    if (messages.length > 0) {
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content
      }
    }
    return { messages }
  }),
  
  clearMessages: () => set({ 
    messages: [],
    thoughts: []
  })
}))