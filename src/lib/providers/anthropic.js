import { BaseAIProvider } from './base'

class AnthropicProvider extends BaseAIProvider {
  constructor() {
    super()
    if (AnthropicProvider.instance) {
      return AnthropicProvider.instance
    }

    AnthropicProvider.instance = this
  }

  extractContent(chunk) {
    if (chunk.type === 'tool_call') {
      return JSON.stringify({
        type: 'tool_call',
        content: chunk.content,
      })
    }
    return chunk.text || ''
  }

  async streamChatCompletion(messages, model) {
    try {
      const tools = this.getTools(model)

      // Transform OpenAI-style tools to Anthropic format
      const transformedTools = tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        input_schema: {
          type: 'object',
          properties: tool.function.parameters.properties,
          required: tool.function.parameters.required || [],
        },
      }))

      // Extract system message and format remaining messages
      const systemMessage =
        messages.find(msg => msg.role === 'system')?.content || ''
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system')

      const response = await fetch('/api/anthropic/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: model.value,
          messages: nonSystemMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          system: systemMessage,
          stream: true,
          max_tokens: 4096,
          tools: transformedTools.length > 0 ? transformedTools : undefined,
        }),
      })

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
      console.error('Anthropic Stream Error:', error)
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
            const data = line.slice(6).trim()
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)

              // Handle different event types from Anthropic's streaming format
              switch (parsed.type) {
                case 'message_start':
                case 'content_block_start':
                case 'content_block_stop':
                case 'ping':
                  continue
                case 'content_block_delta':
                  if (
                    parsed.delta?.type === 'text_delta' &&
                    parsed.delta?.text
                  ) {
                    yield { text: parsed.delta.text }
                  }
                  break
                case 'message_delta':
                  if (parsed.delta?.text) {
                    yield { text: parsed.delta.text }
                  }
                  break
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

export const anthropic = new AnthropicProvider()
export default AnthropicProvider
