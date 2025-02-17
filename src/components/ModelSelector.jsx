import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
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
  Check,
  Microscope,
} from 'lucide-react'
import PropTypes from 'prop-types'
import { availableModels } from '@/lib/providers'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MODEL_METADATA = {
  openai: {
    icon: Sparkles,
    category: 'OpenAI',
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
  },
  anthropic: {
    icon: Brain,
    category: 'Anthropic',
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-500/10 dark:bg-purple-400/10',
  },
  mistral: {
    icon: Bot,
    category: 'Mistral AI',
    color: 'text-teal-500 dark:text-teal-400',
    bgColor: 'bg-teal-500/10 dark:bg-teal-400/10',
  },
  deepseek: {
    icon: Code,
    category: 'DeepSeek',
    color: 'text-indigo-500 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10 dark:bg-indigo-400/10',
  },
  cohere: {
    icon: Star,
    category: 'Cohere',
    color: 'text-yellow-500 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/10 dark:bg-yellow-400/10',
  },
  google: {
    icon: Lightbulb,
    category: 'Google AI',
    color: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-500/10 dark:bg-green-400/10',
  },
}

// Create a flat array of all models with their metadata
const ENHANCED_MODELS = availableModels.map(model => ({
  ...model,
  icon: model.value.startsWith('o')
    ? Microscope
    : MODEL_METADATA[model.provider]?.icon,
  category: MODEL_METADATA[model.provider]?.category,
  color: MODEL_METADATA[model.provider]?.color,
  bgColor: MODEL_METADATA[model.provider]?.bgColor,
}))

const FeatureIcon = ({ feature, icon: Icon, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div
        className={cn(
          'flex items-center gap-1 rounded-full p-1 transition-colors duration-200',
          feature
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground bg-muted'
        )}
      >
        <Icon className='h-3 w-3' />
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p className='text-xs'>
        {feature ? `Supports ${label}` : `No ${label} support`}
      </p>
    </TooltipContent>
  </Tooltip>
)

FeatureIcon.propTypes = {
  feature: PropTypes.bool.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
}

export const ModelSelector = () => {
  const { currentModel, setCurrentModel, currentModelId } = useChatStore()

  const handleModelChange = value => {
    const model = ENHANCED_MODELS.find(m => m.value === value)
    if (model) {
      setCurrentModel(model)
    }
  }

  const renderIcon = (Icon, color) => {
    if (!Icon) return null
    return <Icon className={cn('h-4 w-4', color)} />
  }

  const formatContextLength = length => {
    if (length >= 1000000) return `${length / 1000000}M tokens`
    if (length >= 1000) return `${length / 1000}K tokens`
    return `${length} tokens`
  }

  const isReasoningModel = model => model.value.startsWith('o')

  return (
    <Select value={currentModel?.value} onValueChange={handleModelChange}>
      <SelectTrigger
        className={cn(
          'w-[280px] gap-2 transition-colors duration-200',
          'bg-card hover:bg-accent',
          'border-border/50 hover:border-border',
          currentModel?.bgColor
        )}
      >
        <SelectValue placeholder='Select a model'>
          <div className='flex items-center gap-2'>
            {currentModel?.icon &&
              renderIcon(currentModel.icon, currentModel.color)}
            <span className='font-medium'>{currentModelId}</span>
            {/* {currentModelId} */}
            {isReasoningModel(currentModel) && (
              <Badge variant='secondary' className='ml-1 text-xs'>
                Reasoning
              </Badge>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className='max-h-[400px] p-0'>
        <ScrollArea className='h-[400px]'>
          {Object.entries(MODEL_METADATA).map(
            ([provider, { category, color, bgColor }]) => {
              const providerModels = ENHANCED_MODELS.filter(
                m => m.provider === provider
              )
              if (providerModels.length === 0) return null

              return (
                <SelectGroup key={provider}>
                  <SelectLabel
                    className={cn(
                      'sticky top-0 z-10',
                      'px-3 py-2',
                      'font-medium text-xs uppercase tracking-wider',
                      'border-b border-border/50',
                      bgColor
                    )}
                  >
                    <span className={color}>{category}</span>
                  </SelectLabel>
                  {providerModels.map(model => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className={cn(
                        'relative py-3 px-3',
                        'cursor-pointer',
                        'focus:bg-accent',
                        'data-[state=checked]:bg-accent',
                        'transition-colors duration-200'
                      )}
                    >
                      <div className='flex flex-col gap-1.5 pr-6'>
                        <div className='flex items-center gap-2'>
                          {renderIcon(model.icon, model.color)}
                          <span className='font-medium'>{model.label}</span>
                          {isReasoningModel(model) && (
                            <Badge variant='secondary' className='text-xs'>
                              Reasoning
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-4 ml-6'>
                          <span className='text-xs text-muted-foreground'>
                            {model.description}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 ml-6'>
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
                          <Badge
                            variant='secondary'
                            className='h-5 gap-1 rounded-full px-2 text-xs font-normal'
                          >
                            <Boxes className='h-3 w-3' />
                            <span>
                              {formatContextLength(
                                model.features.contextLength
                              )}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      {currentModel?.value === model.value && (
                        <div className='absolute right-3 top-3'>
                          <Check className='h-4 w-4 text-primary' />
                        </div>
                      )}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )
            }
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  )
}

ModelSelector.displayName = 'ModelSelector'

export default ModelSelector
