import { getProvider } from './providers'

export async function generateChatTitle(messages) {
  if (!messages || messages.length === 0) return 'New Chat'

  try {
    const prompt = [
      {
        role: 'system',
        content: `Generate a very brief, concise title (max 40 chars) for this chat conversation.
        If the conversation is about code:
        - Focus on the main programming concept or feature being discussed
        - Include the primary language/framework if relevant
        - For sandbox demos, prioritize the visual/interactive aspect
        
        Examples:
        - "React Button Animation Demo"
        - "CSS Grid Layout Helper"
        - "Vue State Management Pattern"
        
        Return only the title text, nothing else.`,
      },
      {
        role: 'user',
        content: `Generate a title for this chat:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`,
      },
    ]

    const provider = getProvider('openai')
    const stream = await provider.streamChatCompletion(prompt, {
      value: 'gpt-3.5-turbo',
    })

    let title = ''
    for await (const chunk of stream) {
      title += chunk
    }

    return title.trim().replace(/["']/g, '') // Remove quotes if present
  } catch (error) {
    console.error('Error generating chat title:', error)
    // Fallback to first message or default
    if (messages[0]?.content) {
      const firstMsg = messages[0].content
      // Check if it's a code-related message
      if (
        firstMsg.includes('```') ||
        firstMsg.includes('code') ||
        firstMsg.includes('function')
      ) {
        return 'Code Discussion: ' + firstMsg.slice(0, 30)
      }
      return firstMsg.slice(0, 40)
    }
    return 'New Chat'
  }
}
