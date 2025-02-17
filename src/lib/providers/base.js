import { tools, toolImplementations } from '../tools'

export class BaseAIProvider {
  constructor() {
    if (this.constructor === BaseAIProvider) {
      throw new Error(
        'BaseAIProvider is an abstract class and cannot be instantiated directly'
      )
    }
  }

  async *streamWithBuffer(stream) {
    let buffer = ''

    for await (const chunk of stream) {
      const content = this.extractContent(chunk)

      // If it's a tool call result, yield it directly without buffering
      if (typeof content === 'string' && content.startsWith('### Tool Call')) {
        yield content
        continue
      }

      buffer += content

      // If we find any complete markers, yield them
      if (buffer.includes('THINKING:') || buffer.includes('RESPONSE:')) {
        const parts = buffer.split(/(?=THINKING:|RESPONSE:)/)
        // Keep the last incomplete part in the buffer
        buffer = parts.pop() || ''
        // Yield all complete parts
        for (const part of parts) {
          yield part
        }
      }
    }

    // Yield any remaining content
    if (buffer) {
      yield buffer
    }
  }

  extractContent(chunk) {
    throw new Error('extractContent must be implemented by subclasses')
  }

  async streamChatCompletion(messages, model) {
    throw new Error('streamChatCompletion must be implemented by subclasses')
  }

  // Get available tools for the model
  getTools(model) {
    if (model.features?.tools) {
      return tools
    }
    return []
  }

  // Execute a tool call
  async executeTool(toolCall) {
    const implementation = toolImplementations[toolCall.function.name]
    if (!implementation) {
      throw new Error(
        `No implementation found for tool: ${toolCall.function.name}`
      )
    }

    try {
      const params = JSON.parse(toolCall.function.arguments)
      const result = await implementation(params)

      // Format the result in markdown
      let markdownResult = '### Tool Call\n'
      markdownResult += `**Tool**: \`${toolCall.function.name}\`\n\n`
      markdownResult +=
        '**Arguments**:\n```json\n' +
        JSON.stringify(params, null, 2) +
        '\n```\n\n'
      markdownResult += '**Results**:\n'

      if (result.provider === 'brave' || result.provider === 'serper') {
        // Format web search results with proper line breaks and indentation
        markdownResult += result.results
          .map(
            (r, i) =>
              `${i + 1}. [${r.title}](${r.link})\n   ${r.snippet.replace(/\s+/g, ' ').trim()}`
          )
          .join('\n\n')
      } else {
        markdownResult +=
          '```json\n' + JSON.stringify(result, null, 2) + '\n```\n'
      }

      return markdownResult
    } catch (error) {
      console.error(`Error executing tool ${toolCall.function.name}:`, error)
      throw error
    }
  }
}
