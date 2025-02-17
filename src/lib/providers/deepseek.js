import { BaseAIProvider } from './base'

class DeepSeekProvider extends BaseAIProvider {
  constructor() {
    super()
    if (DeepSeekProvider.instance) {
      return DeepSeekProvider.instance
    }

    DeepSeekProvider.instance = this
  }

  extractContent(chunk) {
    return chunk.choices[0]?.delta?.content || ''
  }

  // Map our friendly model names to DeepSeek's actual model IDs
  getModelId(modelValue) {
    const modelMap = {
      'deepseek-chat-67b': 'deepseek-chat',
      'deepseek-coder-33b': 'deepseek-coder-33b-instruct',
      'deepseek-coder-6.7b': 'deepseek-coder-6.7b-instruct',
      'deepseek-r1-chat': 'deepseek-r1-chat',
    }
    return modelMap[modelValue] || modelValue
  }

  async streamChatCompletion(messages, model) {
    try {
      const response = await fetch(
        'https://api.deepseek.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: this.getModelId(model.value),
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(
          error?.error?.message || `HTTP error! status: ${response.status}`
        )
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      return this.streamWithBuffer(this.createStream(reader, decoder))
    } catch (error) {
      console.error('DeepSeek Stream Error:', error)
      throw error
    }
  }

  async *createStream(reader, decoder) {
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value)
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                yield {
                  choices: [
                    {
                      delta: {
                        content: content,
                      },
                    },
                  ],
                }
              }
            } catch (e) {
              console.error('Error parsing JSON:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

export const deepseek = new DeepSeekProvider()
export default DeepSeekProvider
