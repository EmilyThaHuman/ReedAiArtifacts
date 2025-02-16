import React from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  LightbulbIcon,
} from 'lucide-react'

const ThoughtStep = ({ type, content, index }) => {
  const getStepIcon = () => {
    switch (type) {
      case 'analyze':
        return <BrainCircuit className='w-4 h-4 text-blue-400' />
      case 'reason':
        return <GitBranch className='w-4 h-4 text-purple-400' />
      case 'insight':
        return <LightbulbIcon className='w-4 h-4 text-yellow-400' />
      case 'verify':
        return <CheckCircle2 className='w-4 h-4 text-green-400' />
      case 'challenge':
        return <AlertCircle className='w-4 h-4 text-red-400' />
      default:
        return <BrainCircuit className='w-4 h-4 text-blue-400' />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className='flex items-start gap-3 group'
    >
      <div className='flex-shrink-0 mt-1'>{getStepIcon()}</div>
      <div className='flex-1 min-w-0'>
        <div className='text-sm text-gray-300'>{content}</div>
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

  // Categorize thoughts based on keywords and patterns
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
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='my-4 rounded-lg overflow-hidden'
        >
          <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-3 pb-2 border-b border-gray-700'>
              <BrainCircuit className='w-5 h-5 text-purple-400' />
              <h3 className='text-sm font-medium text-purple-400'>
                Reasoning Process {isComplete ? '(Complete)' : '(Thinking...)'}
              </h3>
            </div>

            <div className='space-y-3 relative'>
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
                  className='absolute -left-1 bottom-0 w-[2px] h-8 bg-gradient-to-b from-purple-500 to-transparent'
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    height: [24, 32, 24],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              )}
            </div>
          </div>
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
