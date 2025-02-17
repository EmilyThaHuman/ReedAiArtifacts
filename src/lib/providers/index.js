import { openai } from './openai'
import { anthropic } from './anthropic'
import { mistral } from './mistral'
import { deepseek } from './deepseek'
import { cohere } from './cohere'
import { google } from './google'

export { openai } from './openai'
export { anthropic } from './anthropic'
export { mistral } from './mistral'
export { deepseek } from './deepseek'
export { cohere } from './cohere'
export { google } from './google'

// Available models for each provider
export const availableModels = [
  // OpenAI Models
  {
    value: 'gpt-4-0125-preview',
    label: 'GPT-4 Turbo (Latest)',
    provider: 'openai',
    description: 'Most capable model, updated with knowledge through 2024',
    features: {
      tools: true,
      vision: false,
      contextLength: 128000,
    },
  },
  {
    value: 'gpt-4-vision-preview',
    label: 'GPT-4 Vision',
    provider: 'openai',
    description: 'GPT-4 with image understanding capabilities',
    features: {
      tools: true,
      vision: true,
      contextLength: 128000,
    },
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    provider: 'openai',
    description: 'More reliable but slightly older than Turbo',
    features: {
      tools: true,
      vision: false,
      contextLength: 8192,
    },
  },
  {
    value: 'gpt-3.5-turbo-0125',
    label: 'GPT-3.5 Turbo (Latest)',
    provider: 'openai',
    description: 'Fast and cost-effective, updated version',
    features: {
      tools: true,
      vision: false,
      contextLength: 16385,
    },
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Standard GPT-3.5 model',
    features: {
      tools: true,
      vision: false,
      contextLength: 4096,
    },
  },

  // Anthropic Models
  {
    value: 'claude-3-opus-20240229',
    label: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most powerful Claude model, 200K context',
    features: {
      tools: true,
      vision: true,
      contextLength: 200000,
    },
  },
  {
    value: 'claude-3-sonnet-20240229',
    label: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Balanced performance, 200K context',
    features: {
      tools: true,
      vision: true,
      contextLength: 200000,
    },
  },
  {
    value: 'claude-3-haiku-20240307',
    label: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fastest Claude model, great for chat',
    features: {
      tools: true,
      vision: true,
      contextLength: 200000,
    },
  },
  {
    value: 'claude-2.1',
    label: 'Claude 2.1',
    provider: 'anthropic',
    description: 'Previous generation Claude',
    features: {
      tools: false,
      vision: false,
      contextLength: 100000,
    },
  },

  // Mistral Models
  {
    value: 'mistral-large-latest',
    label: 'Mistral Large',
    provider: 'mistral',
    description: 'Most powerful Mistral model',
    features: {
      tools: true,
      vision: false,
      contextLength: 32768,
    },
  },
  {
    value: 'mistral-medium-latest',
    label: 'Mistral Medium',
    provider: 'mistral',
    description: 'Balanced performance and efficiency',
    features: {
      tools: true,
      vision: false,
      contextLength: 32768,
    },
  },
  {
    value: 'mistral-small-latest',
    label: 'Mistral Small',
    provider: 'mistral',
    description: 'Fast and efficient',
    features: {
      tools: false,
      vision: false,
      contextLength: 32768,
    },
  },
  {
    value: 'mistral-tiny-latest',
    label: 'Mistral Tiny',
    provider: 'mistral',
    description: 'Fastest response times',
    features: {
      tools: false,
      vision: false,
      contextLength: 32768,
    },
  },

  // DeepSeek Models
  {
    value: 'deepseek-chat-67b',
    label: 'DeepSeek Chat 67B',
    provider: 'deepseek',
    description: 'Large chat model with broad capabilities',
    features: {
      tools: false,
      vision: false,
      contextLength: 16384,
    },
  },
  {
    value: 'deepseek-coder-33b',
    label: 'DeepSeek Coder 33B',
    provider: 'deepseek',
    description: 'Specialized for code generation',
    features: {
      tools: false,
      vision: false,
      contextLength: 16384,
    },
  },
  {
    value: 'deepseek-coder-6.7b',
    label: 'DeepSeek Coder 6.7B',
    provider: 'deepseek',
    description: 'Efficient code assistant',
    features: {
      tools: false,
      vision: false,
      contextLength: 16384,
    },
  },
  {
    value: 'deepseek-math-7b',
    label: 'DeepSeek Math 7B',
    provider: 'deepseek',
    description: 'Specialized for mathematical tasks',
    features: {
      tools: false,
      vision: false,
      contextLength: 8192,
    },
  },

  // Cohere Models
  {
    value: 'command-r',
    label: 'Command-R',
    provider: 'cohere',
    description: 'Most capable Cohere model',
    features: {
      tools: true,
      vision: false,
      contextLength: 128000,
    },
  },
  {
    value: 'command',
    label: 'Command',
    provider: 'cohere',
    description: 'Balanced performance',
    features: {
      tools: true,
      vision: false,
      contextLength: 128000,
    },
  },
  {
    value: 'command-light',
    label: 'Command Light',
    provider: 'cohere',
    description: 'Fast and efficient',
    features: {
      tools: false,
      vision: false,
      contextLength: 4096,
    },
  },
  {
    value: 'command-nightly',
    label: 'Command Nightly',
    provider: 'cohere',
    description: 'Latest experimental version',
    features: {
      tools: true,
      vision: false,
      contextLength: 128000,
    },
  },

  // Google Models
  {
    value: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Most advanced Gemini model, 1M token context',
    features: {
      tools: true,
      vision: true,
      contextLength: 1000000,
    },
  },
  {
    value: 'gemini-1.0-pro',
    label: 'Gemini 1.0 Pro',
    provider: 'google',
    description: 'Balanced performance',
    features: {
      tools: true,
      vision: false,
      contextLength: 32768,
    },
  },
  {
    value: 'gemini-1.0-pro-vision',
    label: 'Gemini Pro Vision',
    provider: 'google',
    description: 'Multimodal capabilities',
    features: {
      tools: true,
      vision: true,
      contextLength: 32768,
    },
  },
  {
    value: 'gemini-1.0-ultra',
    label: 'Gemini Ultra',
    provider: 'google',
    description: 'Most powerful Google model (limited preview)',
    features: {
      tools: true,
      vision: true,
      contextLength: 32768,
    },
  },
]

// Get provider instance by name
export function getProvider(providerName) {
  switch (providerName) {
    case 'openai':
      return openai
    case 'anthropic':
      return anthropic
    case 'mistral':
      return mistral
    case 'deepseek':
      return deepseek
    case 'cohere':
      return cohere
    case 'google':
      return google
    default:
      throw new Error(`Unknown provider: ${providerName}`)
  }
}
