import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFileStore = create(
  persist(
    (set, get) => ({
      // Map of file IDs to their data
      files: {},
      
      // Add a new file to the store
      addFile: async (file) => {
        const fileId = crypto.randomUUID()
        
        // Create a copy of the file to ensure we have a proper File object
        const fileData = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          // Store file as blob to ensure it can be used later
          blob: await file.arrayBuffer().then(buffer => new Blob([buffer], { type: file.type })),
          uploadedAt: new Date().toISOString(),
        }
        
        set(state => ({
          files: {
            ...state.files,
            [fileId]: fileData,
          },
        }))
        
        return fileId
      },
      
      // Add multiple files at once
      addFiles: async (files) => {
        const fileIds = await Promise.all(
          Array.from(files).map(file => get().addFile(file))
        )
        return fileIds
      },
      
      // Remove a file from the store
      removeFile: (fileId) => {
        set(state => {
          const { [fileId]: removed, ...rest } = state.files
          return { files: rest }
        })
      },
      
      // Get a file by ID
      getFile: (fileId) => {
        const fileData = get().files[fileId]
        if (!fileData) return null
        
        // Create a new File object from the stored blob
        return new File([fileData.blob], fileData.name, {
          type: fileData.type,
          lastModified: new Date(fileData.uploadedAt).getTime(),
        })
      },
      
      // Get file metadata by ID
      getFileMetadata: (fileId) => {
        const fileData = get().files[fileId]
        if (!fileData) return null
        
        return {
          id: fileData.id,
          name: fileData.name,
          type: fileData.type,
          size: fileData.size,
          uploadedAt: fileData.uploadedAt,
        }
      },
      
      // Clear all files
      clearFiles: () => {
        set({ files: {} })
      },
    }),
    {
      name: 'file-storage',
      partialize: (state) => ({
        files: {}, // Don't persist files across sessions
      }),
    }
  )
)

// Initialize the file store on the window object
if (typeof window !== 'undefined') {
  window.fileStore = {
    getFile: useFileStore.getState().getFile,
    getFileMetadata: useFileStore.getState().getFileMetadata,
    addFile: useFileStore.getState().addFile,
    removeFile: useFileStore.getState().removeFile,
    clearFiles: useFileStore.getState().clearFiles,
  }

  // Subscribe to state changes to keep window.fileStore in sync
  useFileStore.subscribe(state => {
    window.fileStore = {
      getFile: state.getFile,
      getFileMetadata: state.getFileMetadata,
      addFile: state.addFile,
      removeFile: state.removeFile,
      clearFiles: state.clearFiles,
    }
  })
} 