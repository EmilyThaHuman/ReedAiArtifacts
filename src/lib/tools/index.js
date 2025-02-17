// Tool definitions for AI models
export const tools = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for current information using Brave Search and Serper',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to execute',
          },
          num_results: {
            type: 'integer',
            description: 'Number of search results to return',
            default: 5,
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_image',
      description: 'Analyze an image and provide a detailed description',
      parameters: {
        type: 'object',
        properties: {
          image_id: {
            type: 'string',
            description: 'The ID of the image to analyze',
          },
        },
        required: ['image_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'extract_text',
      description: 'Extract text from a document (PDF, DOC, TXT)',
      parameters: {
        type: 'object',
        properties: {
          file_id: {
            type: 'string',
            description: 'The ID of the file to extract text from',
          },
        },
        required: ['file_id'],
      },
    },
  },
]

// Helper function to clean HTML tags and entities
const cleanHtml = (text) => {
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .trim()
}

// Tool implementations
export const toolImplementations = {
  web_search: async (params) => {
    let braveError = null
    let serperError = null

    try {
      // Try Brave Search first
      console.log('Attempting Brave Search...')
      const braveResponse = await fetch('/api/brave-search?' + new URLSearchParams({
        q: params.query,
        count: params.num_results || 5,
      }))

      if (!braveResponse.ok) {
        const errorData = await braveResponse.json().catch(() => null)
        braveError = new Error(
          `Brave Search failed with status ${braveResponse.status}: ${
            errorData?.error || braveResponse.statusText
          }`
        )
        console.error('Brave Search error:', braveError)
      } else {
        const braveData = await braveResponse.json()
        if (braveData.web?.results) {
          console.log('Brave Search successful')
          return {
            provider: 'brave',
            results: braveData.web.results.map(result => ({
              title: cleanHtml(result.title),
              link: result.url,
              snippet: cleanHtml(result.description),
            })),
          }
        }
        braveError = new Error('Invalid response format from Brave Search')
        console.error('Brave Search error:', braveError)
      }

      // Fallback to Serper if Brave fails
      console.log('Attempting Serper fallback...')
      const serperResponse = await fetch('/api/serper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: params.query,
          num: params.num_results || 5,
        }),
      })

      if (!serperResponse.ok) {
        const errorData = await serperResponse.json().catch(() => null)
        serperError = new Error(
          `Serper failed with status ${serperResponse.status}: ${
            errorData?.error || serperResponse.statusText
          }`
        )
        console.error('Serper error:', serperError)
        throw serperError
      }

      const serperData = await serperResponse.json()
      if (serperData.organic) {
        console.log('Serper search successful')
        return {
          provider: 'serper',
          results: serperData.organic.map(result => ({
            title: cleanHtml(result.title),
            link: result.link,
            snippet: cleanHtml(result.snippet),
          })),
        }
      }

      throw new Error('Invalid response format from Serper')
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  },

  analyze_image: async (params) => {
    const fileStore = window.fileStore
    if (!fileStore) {
      throw new Error('File store not initialized')
    }

    const file = fileStore.getFile(params.image_id)
    if (!file) {
      throw new Error('Image not found')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image')
    }

    // For now, just return basic file info
    // In the future, we can integrate with vision APIs
    return {
      type: file.type,
      name: file.name,
      size: file.size,
      dimensions: 'Not available', // Could be added with image loading
      analysis: 'Image analysis not implemented yet',
    }
  },

  extract_text: async (params) => {
    const fileStore = window.fileStore
    if (!fileStore) {
      throw new Error('File store not initialized')
    }

    const file = fileStore.getFile(params.file_id)
    if (!file) {
      throw new Error('File not found')
    }

    // For now, just return basic file info
    // In the future, we can integrate with OCR/text extraction APIs
    return {
      type: file.type,
      name: file.name,
      size: file.size,
      text: 'Text extraction not implemented yet',
    }
  },
} 