import OpenAI from 'openai'

class OpenAIInstance {
  constructor() {
    if (OpenAIInstance.instance) {
      return OpenAIInstance.instance
    }

    this.client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })

    OpenAIInstance.instance = this
  }

  async *streamWithBuffer(stream) {
    let buffer = ''

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      buffer += content

      // If we find any complete markers, yield them
      if (buffer.includes('THINKING:') || buffer.includes('RESPONSE:')) {
        const parts = buffer.split(/(?=THINKING:|RESPONSE:)/)
        // Keep the last part (which might be incomplete) in the buffer
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

  async streamChatCompletion(messages, model) {
    try {
      // Only use the required parameters
      const stream = await this.client.chat.completions.create({
        model: model.value,
        messages,
        stream: true,
      })

      return this.streamWithBuffer(stream)
    } catch (error) {
      console.error('OpenAI Stream Error:', error)
      throw error
    }
  }
}

export const openai = new OpenAIInstance()
export default OpenAIInstance
