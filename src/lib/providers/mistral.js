import MistralClient from '@mistralai/mistralai'
import { BaseAIProvider } from './base'

class MistralProvider extends BaseAIProvider {
  constructor() {
    super()
    if (MistralProvider.instance) {
      return MistralProvider.instance
    }

    this.client = new MistralClient(import.meta.env.VITE_MISTRAL_API_KEY)

    MistralProvider.instance = this
  }

  extractContent(chunk) {
    if (chunk.type === 'tool_call') {
      return JSON.stringify({
        type: 'tool_call',
        content: chunk.content,
      })
    }
    return chunk.choices[0]?.delta?.content || ''
  }

  async streamChatCompletion(messages, model) {
    try {
      const tools = this.getTools(model)

      // Format messages to ensure proper handling of system prompts
      const formattedMessages = messages.map(msg => {
        // For system messages, ensure they're properly formatted
        if (msg.role === 'system') {
          return {
            role: 'system',
            content: msg.content,
          }
        }
        // For user/assistant messages, include any additional properties
        return {
          role: msg.role,
          content: msg.content,
          ...(msg.name && { name: msg.name }),
          ...(msg.function_call && { function_call: msg.function_call }),
        }
      })

      const stream = await this.client.chatStream({
        model: model.value,
        messages: formattedMessages,
        tools: tools.length > 0 ? tools : undefined,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4096,
      })

      return this.streamWithBuffer(this.createStream(stream))
    } catch (error) {
      console.error('Mistral Stream Error:', error)
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
              choices: [
                {
                  delta: {
                    content: result,
                  },
                },
              ],
            }
          } catch (error) {
            yield {
              choices: [
                {
                  delta: {
                    content: `Error executing tool: ${error.message}\n`,
                  },
                },
              ],
            }
          }

          currentToolCall = null
        }
      } else if (chunk.choices[0]?.delta?.content) {
        // Regular content
        yield chunk
      }
    }
  }
}

export const mistral = new MistralProvider()
export default MistralProvider
