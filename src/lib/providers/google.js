import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseAIProvider } from './base'

class GoogleProvider extends BaseAIProvider {
  constructor() {
    super()
    if (GoogleProvider.instance) {
      return GoogleProvider.instance
    }

    this.client = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY)

    GoogleProvider.instance = this
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
      const geminiModel = this.client.getGenerativeModel({
        model: model.value,
        tools: tools.length > 0 ? tools : undefined,
      })

      const chat = geminiModel.startChat({
        history: messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      })

      const stream = await chat.sendMessageStream(
        messages[messages.length - 1].content
      )
      return this.streamWithBuffer(this.createStream(stream))
    } catch (error) {
      console.error('Google Stream Error:', error)
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

          // Yield the tool call
          yield {
            text: `Using tool: ${currentToolCall.function.name}\nArguments: ${currentToolCall.function.arguments}\n`,
          }

          // Execute the tool and yield results
          try {
            const result = await this.executeTool(currentToolCall)
            yield {
              text: `Tool result: ${JSON.stringify(result, null, 2)}\n`,
            }
          } catch (error) {
            yield {
              text: `Tool error: ${error.message}\n`,
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

export const google = new GoogleProvider()
export default GoogleProvider
