import OpenAI from 'openai'
import { BaseAIProvider } from './base'

class OpenAIProvider extends BaseAIProvider {
  constructor() {
    super()
    if (OpenAIProvider.instance) {
      return OpenAIProvider.instance
    }

    this.client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })

    OpenAIProvider.instance = this
  }

  extractContent(chunk) {
    if (chunk.choices[0]?.delta?.tool_calls) {
      // Handle tool calls in the content
      return JSON.stringify({
        type: 'tool_call',
        content: chunk.choices[0].delta.tool_calls,
      })
    }
    return chunk.choices[0]?.delta?.content || ''
  }

  async streamChatCompletion(messages, model) {
    try {
      const tools = this.getTools(model)
      const isReasoningModel = model.value.startsWith('o')

      const stream = await this.client.chat.completions.create({
        model: model.value,
        messages,
        stream: true,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        ...(isReasoningModel && { reasoning_effort: 'medium' }),
      })

      return this.streamWithBuffer(this.createStream(stream))
    } catch (error) {
      console.error('OpenAI Stream Error:', error)
      throw error
    }
  }

  async *createStream(stream) {
    let currentToolCall = null

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.tool_calls) {
        const toolCalls = chunk.choices[0].delta.tool_calls
        for (const toolCall of toolCalls) {
          if (toolCall.index === undefined) continue

          // Initialize or update the current tool call
          if (!currentToolCall || currentToolCall.index !== toolCall.index) {
            if (currentToolCall) {
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
            }

            currentToolCall = {
              id: toolCall.id,
              index: toolCall.index,
              function: {
                name: toolCall.function?.name || '',
                arguments: toolCall.function?.arguments || '',
              },
            }
          } else {
            // Append to the current tool call
            if (toolCall.function?.name) {
              currentToolCall.function.name += toolCall.function.name
            }
            if (toolCall.function?.arguments) {
              currentToolCall.function.arguments += toolCall.function.arguments
            }
          }
        }
      } else if (chunk.choices[0]?.delta?.content) {
        // Regular content
        yield chunk
      }
    }

    // Handle any remaining tool call
    if (currentToolCall) {
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
    }
  }
}

export const openai = new OpenAIProvider()
export default OpenAIProvider
