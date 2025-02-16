import React from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'

export const ThinkingProcess = ({ thoughts, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && thoughts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-2"
        >
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-purple-400">Reasoning Process</h3>
          </div>
          <div className="space-y-2">
            {thoughts.map((thought, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-6 text-gray-500 text-sm">
                  {index + 1}.
                </div>
                <div className="flex-1">
                  <div className="text-gray-300 text-sm">{thought}</div>
                  {index < thoughts.length - 1 && (
                    <div className="h-4 w-px bg-gray-700 ml-3 my-1" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

ThinkingProcess.propTypes = {
  thoughts: PropTypes.arrayOf(PropTypes.string).isRequired,
  isVisible: PropTypes.bool.isRequired
}

ThinkingProcess.defaultProps = {
  isVisible: true
}

ThinkingProcess.displayName = 'ThinkingProcess'

export default ThinkingProcess