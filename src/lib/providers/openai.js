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
    console.log('Extracting content from chunk:', chunk)
    if (chunk.choices[0]?.delta?.tool_calls) {
      // Handle tool calls in the content
      const toolCallContent = JSON.stringify({
        type: 'tool_call',
        content: chunk.choices[0].delta.tool_calls,
      })
      console.log('Extracted tool call content:', toolCallContent)
      return toolCallContent
    }
    const content = chunk.choices[0]?.delta?.content || ''
    console.log('Extracted regular content:', content)
    return content
  }

  async streamChatCompletion(messages, model) {
    try {
      console.log('Starting stream chat completion with model:', model.value)
      const tools = this.getTools(model)
      const isReasoningModel = model.value.startsWith('o')

      console.log('Using tools:', tools.length > 0 ? tools : 'No tools')

      const stream = await this.client.chat.completions.create({
        model: model.value,
        messages,
        stream: true,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        ...(isReasoningModel && { reasoning_effort: 'medium' }),
      })

      console.log('Stream created successfully')
      return this.streamWithBuffer(this.createStream(stream))
    } catch (error) {
      console.error('OpenAI Stream Error:', error)
      throw error
    }
  }

  async *createStream(stream) {
    let currentToolCall = null
    console.log('Starting to process stream')

    try {
      for await (const chunk of stream) {
        console.log('Received chunk:', chunk)
        
        if (chunk.choices[0]?.delta?.tool_calls) {
          console.log('Processing tool call chunk')
          const toolCalls = chunk.choices[0].delta.tool_calls
          for (const toolCall of toolCalls) {
            if (toolCall.index === undefined) {
              console.log('Skipping tool call with undefined index')
              continue
            }

            if (!currentToolCall || currentToolCall.index !== toolCall.index) {
              if (currentToolCall) {
                console.log('Executing previous tool call:', currentToolCall)
                try {
                  const result = await this.executeTool(currentToolCall)
                  console.log('Tool execution result:', result)
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
                  console.error('Tool execution error:', error)
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
              console.log('Created new tool call:', currentToolCall)
            } else {
              if (toolCall.function?.name) {
                currentToolCall.function.name += toolCall.function.name
              }
              if (toolCall.function?.arguments) {
                currentToolCall.function.arguments += toolCall.function.arguments
              }
              console.log('Updated tool call:', currentToolCall)
            }
          }
        } else if (chunk.choices[0]?.delta?.content) {
          console.log('Yielding content chunk:', chunk.choices[0].delta.content)
          yield chunk
        }
      }

      if (currentToolCall) {
        console.log('Processing final tool call:', currentToolCall)
        try {
          const result = await this.executeTool(currentToolCall)
          console.log('Final tool execution result:', result)
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
          console.error('Final tool execution error:', error)
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
    } catch (error) {
      console.error('Stream processing error:', error)
      throw error
    }
  }
}

export const openai = new OpenAIProvider()
export default OpenAIProvider
