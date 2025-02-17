import { CohereClient } from 'cohere-ai'
import { BaseAIProvider } from './base'

class CohereProvider extends BaseAIProvider {
  constructor() {
    super()
    if (CohereProvider.instance) {
      return CohereProvider.instance
    }

    this.client = new CohereClient({
      token: import.meta.env.VITE_COHERE_API_KEY,
    })

    CohereProvider.instance = this
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
      const stream = await this.client.chatStream({
        model: model.value,
        message: messages[messages.length - 1].content,
        chat_history: messages.slice(0, -1).map(msg => ({
          role: msg.role,
          message: msg.content,
        })),
        tools: tools.length > 0 ? tools : undefined,
      })

      return this.streamWithBuffer(this.createStream(stream))
    } catch (error) {
      console.error('Cohere Stream Error:', error)
      throw error
    }
  }

  async *createStream(stream) {
    let currentToolCall = null

    for await (const chunk of stream) {
      if (chunk.type === 'tool_call') {
        const toolCall = chunk.content
        if (!currentToolCall) {
          currentToolCall = {
            id: toolCall.id,
            index: 0,
            function: {
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
            },
          }

          // Execute the tool and yield results
          try {
            const result = await this.executeTool(currentToolCall)
            yield {
              text: result,
            }
          } catch (error) {
            yield {
              text: `Error executing tool: ${error.message}\n`,
            }
          }

          currentToolCall = null
        }
      } else if (chunk.text) {
        // Regular content
        yield chunk
      }
    }
  }
}

export const cohere = new CohereProvider()
export default CohereProvider
