import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChatStore } from '@/store/useChatStore'
import { Sparkles, Cpu, Zap } from 'lucide-react'

const AVAILABLE_MODELS = [
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Multimodal model for text, images, and audio',
    isReasoning: false,
    icon: Sparkles,
    category: 'Vision & Audio',
  },
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    description: 'Cost-effective version of GPT-4o',
    isReasoning: false,
    icon: Sparkles,
    category: 'Vision & Audio',
  },
  {
    value: 'o1',
    label: 'o1',
    description: 'Enhanced reasoning and problem-solving',
    isReasoning: true,
    icon: Cpu,
    category: 'Reasoning',
  },
  {
    value: 'o1-mini',
    label: 'o1 Mini',
    description: 'Faster variant of o1',
    isReasoning: true,
    icon: Cpu,
    category: 'Reasoning',
  },
  {
    value: 'o3-mini',
    label: 'o3 Mini',
    description: 'Latest reasoning model with efficiency focus',
    isReasoning: true,
    icon: Cpu,
    category: 'Reasoning',
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective chat model',
    isReasoning: false,
    icon: Zap,
    category: 'Chat',
  },
]

export const ModelSelector = () => {
  const { currentModel, setCurrentModel } = useChatStore()

  const handleModelChange = value => {
    const model = AVAILABLE_MODELS.find(m => m.value === value)
    setCurrentModel(model)
  }

  // Group models by category
  const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = []
    }
    acc[model.category].push(model)
    return acc
  }, {})

  return (
    <Select value={currentModel?.value} onValueChange={handleModelChange}>
      <SelectTrigger className='w-[280px] bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-750 focus:ring-blue-500'>
        <div className='flex items-center gap-2'>
          {currentModel?.icon && (
            <currentModel.icon className='w-4 h-4 text-blue-400' />
          )}
          <SelectValue placeholder='Select a model' className='text-gray-100' />
        </div>
      </SelectTrigger>
      <SelectContent className='max-h-[400px] bg-gray-800 border-gray-700'>
        {Object.entries(groupedModels).map(([category, models]) => (
          <div key={category}>
            <div className='px-2 py-1.5 text-xs font-semibold text-gray-400 bg-gray-900'>
              {category}
            </div>
            {models.map(model => (
              <SelectItem
                key={model.value}
                value={model.value}
                className='py-3 px-2 focus:bg-gray-700 hover:bg-gray-700 cursor-pointer data-[state=checked]:bg-gray-700'
              >
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <model.icon className='w-4 h-4 text-blue-400' />
                    <span className='font-medium text-gray-100'>
                      {model.label}
                    </span>
                    {model.isReasoning && (
                      <span className='px-1.5 py-0.5 text-xs bg-purple-900 text-purple-200 rounded'>
                        Reasoning
                      </span>
                    )}
                  </div>
                  <span className='text-xs text-gray-400 ml-6'>
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}

ModelSelector.displayName = 'ModelSelector'

export default ModelSelector
