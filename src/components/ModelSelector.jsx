import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChatStore } from '@/store/useChatStore'
import {
  Sparkles,
  Cpu,
  Zap,
  Brain,
  Bot,
  Star,
  Lightbulb,
  Code,
  Wrench,
  Eye,
  Boxes,
} from 'lucide-react'
import PropTypes from 'prop-types'
import { availableModels } from '@/lib/providers'
import { cn } from '@/lib/utils'

const MODEL_METADATA = {
  openai: {
    icon: Sparkles,
    category: 'OpenAI',
  },
  anthropic: {
    icon: Brain,
    category: 'Anthropic',
  },
  mistral: {
    icon: Bot,
    category: 'Mistral AI',
  },
  deepseek: {
    icon: Code,
    category: 'DeepSeek',
  },
  cohere: {
    icon: Star,
    category: 'Cohere',
  },
  google: {
    icon: Lightbulb,
    category: 'Google AI',
  },
}

// Create a flat array of all models with their metadata
const ENHANCED_MODELS = availableModels.map(model => ({
  ...model,
  icon: MODEL_METADATA[model.provider]?.icon,
  category: MODEL_METADATA[model.provider]?.category,
}))

const FeatureIcon = ({ feature, icon: Icon, label }) => (
  <div
    className={cn(
      'flex items-center gap-1',
      feature ? 'text-green-400' : 'text-gray-500'
    )}
    title={feature ? `Supports ${label}` : `No ${label} support`}
  >
    <Icon className='w-3 h-3' />
  </div>
)

export const ModelSelector = ({ value, onChange }) => {
  const { currentModel, setCurrentModel } = useChatStore()

  const handleModelChange = value => {
    const model = ENHANCED_MODELS.find(m => m.value === value)
    setCurrentModel(model)
  }

  // Group models by category
  const groupedModels = ENHANCED_MODELS.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = []
    }
    acc[model.category].push(model)
    return acc
  }, {})

  const renderIcon = Icon => {
    if (!Icon) return null
    return <Icon className='w-4 h-4 text-blue-400' />
  }

  const formatContextLength = length => {
    if (length >= 1000000) return `${length / 1000000}M tokens`
    if (length >= 1000) return `${length / 1000}K tokens`
    return `${length} tokens`
  }

  return (
    <Select value={currentModel?.value} onValueChange={handleModelChange}>
      <SelectTrigger className='w-[280px] bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-750 focus:ring-blue-500'>
        <div className='flex items-center gap-2'>
          {currentModel?.icon && renderIcon(currentModel.icon)}
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
                    {renderIcon(model.icon)}
                    <span className='font-medium text-gray-100'>
                      {model.label}
                    </span>
                  </div>
                  <div className='flex items-center gap-4 ml-6'>
                    <span className='text-xs text-gray-400'>
                      {model.description}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 ml-6 mt-1'>
                    <FeatureIcon
                      feature={model.features.tools}
                      icon={Wrench}
                      label='Tool calling'
                    />
                    <FeatureIcon
                      feature={model.features.vision}
                      icon={Eye}
                      label='Vision'
                    />
                    <span className='text-xs text-gray-500 flex items-center gap-1'>
                      <Boxes className='w-3 h-3' />
                      {formatContextLength(model.features.contextLength)}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}

ModelSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

FeatureIcon.propTypes = {
  feature: PropTypes.bool.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
}

ModelSelector.displayName = 'ModelSelector'

export default ModelSelector
