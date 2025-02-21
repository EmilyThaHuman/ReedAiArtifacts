import React from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  LightbulbIcon,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

const iconVariants = {
  analyze: {
    icon: BrainCircuit,
    className: 'text-blue-500 dark:text-blue-400',
  },
  reason: {
    icon: GitBranch,
    className: 'text-purple-500 dark:text-purple-400',
  },
  insight: {
    icon: LightbulbIcon,
    className: 'text-yellow-500 dark:text-yellow-400',
  },
  verify: {
    icon: CheckCircle2,
    className: 'text-green-500 dark:text-green-400',
  },
  challenge: {
    icon: AlertCircle,
    className: 'text-red-500 dark:text-red-400',
  },
}

const ThoughtStep = ({ type, content, index }) => {
  const { icon: Icon, className } = iconVariants[type] || iconVariants.analyze

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.2,
        ease: 'easeOut',
      }}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg p-2',
        'hover:bg-accent/50',
        'transition-colors duration-200'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 mt-1 transition-transform duration-200 group-hover:scale-110',
          className
        )}
      >
        <Icon className='h-4 w-4' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200'>
          {content}
        </div>
      </div>
    </motion.div>
  )
}

ThoughtStep.propTypes = {
  type: PropTypes.oneOf(['analyze', 'reason', 'insight', 'verify', 'challenge'])
    .isRequired,
  content: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
}

const ThinkingProcess = ({
  thoughts = [],
  isVisible = true,
  isComplete = false,
}) => {
  if (!thoughts || thoughts.length === 0) return null

  const categorizeThought = thought => {
    if (!thought) return 'reason'

    const lowerThought = thought.toLowerCase()
    if (
      lowerThought.includes('analyze') ||
      lowerThought.includes('examining') ||
      lowerThought.includes('looking at')
    ) {
      return 'analyze'
    } else if (
      lowerThought.includes('however') ||
      lowerThought.includes('but') ||
      lowerThought.includes('challenge')
    ) {
      return 'challenge'
    } else if (
      lowerThought.includes('therefore') ||
      lowerThought.includes('conclude') ||
      lowerThought.includes('verify')
    ) {
      return 'verify'
    } else if (
      lowerThought.includes('could') ||
      lowerThought.includes('might') ||
      lowerThought.includes('consider')
    ) {
      return 'reason'
    } else if (
      lowerThought.includes('insight') ||
      lowerThought.includes('notice') ||
      lowerThought.includes('realize')
    ) {
      return 'insight'
    }
    return 'reason'
  }

  return (
    <AnimatePresence>
      {isVisible && thoughts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: 20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className='my-4'
        >
          <Card
            className={cn(
              'backdrop-blur-sm',
              'border-border/50',
              'overflow-hidden'
            )}
          >
            <div className='flex items-center gap-3 border-b border-border/50 p-4'>
              <div className='relative'>
                <BrainCircuit className='h-5 w-5 text-primary' />
                {!isComplete && (
                  <motion.div
                    className='absolute inset-0 rounded-full'
                    animate={{
                      boxShadow: [
                        '0 0 0 0px rgba(var(--primary) / 0.2)',
                        '0 0 0 4px rgba(var(--primary) / 0)',
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                )}
              </div>
              <div className='flex items-center gap-2'>
                <h3 className='text-sm font-medium'>Reasoning Process</h3>
                {!isComplete ? (
                  <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-1.5 text-xs text-primary'>
                    <CheckCircle2 className='h-3 w-3' />
                    <span>Complete</span>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-1 p-4 relative'>
              {thoughts.map((thought, index) => (
                <ThoughtStep
                  key={`${thought?.slice?.(0, 20) || 'thought'}-${index}`}
                  type={categorizeThought(thought)}
                  content={thought || ''}
                  index={index}
                />
              ))}

              {!isComplete && (
                <motion.div
                  className='absolute -left-0.5 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent'
                  animate={{
                    height: [24, 32, 24],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

ThinkingProcess.propTypes = {
  thoughts: PropTypes.arrayOf(PropTypes.string),
  isVisible: PropTypes.bool,
  isComplete: PropTypes.bool,
}

ThinkingProcess.defaultProps = {
  thoughts: [],
  isVisible: true,
  isComplete: false,
}

export default ThinkingProcess
