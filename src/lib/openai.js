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

  async streamChatCompletion(messages, model) {
    try {
      const modelValue = typeof model === 'object' ? model.value : model

      console.log('Starting stream with model:', modelValue)

      const stream = await this.client.chat.completions.create({
        messages,
        model: modelValue,
        stream: true,
        temperature: 0.7,
        // max_tokens: 8000,
      })

      return stream
    } catch (error) {
      console.error('OpenAI Stream Error:', error)
      throw error
    }
  }
}

export const openai = new OpenAIInstance()
