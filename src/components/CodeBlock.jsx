import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Sandpack } from '@codesandbox/sandpack-react'
import {
  Code,
  Copy,
  Check,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Folder,
} from 'lucide-react'
import { nightOwl } from '@codesandbox/sandpack-themes'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import dedent from 'dedent'

const CUSTOM_DEPENDENCIES = {
  '@radix-ui/react-accordion': '^1.2.0',
  '@radix-ui/react-alert-dialog': '^1.1.1',
  '@radix-ui/react-aspect-ratio': '^1.1.0',
  '@radix-ui/react-avatar': '^1.1.0',
  '@radix-ui/react-checkbox': '^1.1.1',
  '@radix-ui/react-collapsible': '^1.1.0',
  '@radix-ui/react-dialog': '^1.1.1',
  '@radix-ui/react-dropdown-menu': '^2.1.1',
  '@radix-ui/react-hover-card': '^1.1.1',
  '@radix-ui/react-label': '^2.1.0',
  '@radix-ui/react-menubar': '^1.1.1',
  '@radix-ui/react-navigation-menu': '^1.2.0',
  '@radix-ui/react-popover': '^1.1.1',
  '@radix-ui/react-progress': '^1.1.0',
  '@radix-ui/react-radio-group': '^1.2.0',
  '@radix-ui/react-select': '^2.1.1',
  '@radix-ui/react-separator': '^1.1.0',
  '@radix-ui/react-slider': '^1.2.0',
  '@radix-ui/react-slot': '^1.1.0',
  '@radix-ui/react-switch': '^1.1.0',
  '@radix-ui/react-tabs': '^1.1.0',
  '@radix-ui/react-toast': '^1.2.1',
  '@radix-ui/react-toggle': '^1.1.0',
  '@radix-ui/react-toggle-group': '^1.1.0',
  '@radix-ui/react-tooltip': '^1.1.2',
  // '@radix-ui/react-textarea': '^1.1.0',
  'class-variance-authority': '^0.7.0',
  'tailwindcss-animate': '^1.0.7',
  'tailwind-merge': '^2.0.0',
  clsx: '^2.0.0',
  'lucide-react': '^0.292.0',
  'framer-motion': '^11.0.5',
  tailwindcss: '^3.3.0',
  postcss: '^8.4.31',
  autoprefixer: '^10.4.16',
  '@tailwindcss/forms': '^0.5.7',
  'react-resizable-panels': '^0.0.55',
}

const DEFAULT_FILES = {
  '/jsconfig.json': {
    code: `{
      "include": [
        "./**/*"
      ],
      "compilerOptions": {
        "strict": true,
        "esModuleInterop": true,
        "lib": [ "dom", "es2015" ],
        "jsx": "react-jsx",
        "baseUrl": "./",
        "paths": {
          "@/components/*": ["components/*"],
          "@/styles/*": ["styles/*"],
          "@/lib/*": ["lib/*"]
        }
      }
    }`,
  },
  '/styles/globals.css': {
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
}

const CUSTOM_FILES = {
  '/tailwind.config.js': {
    code: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`,
  },
  '/postcss.config.js': {
    code: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  },
  '/src/index.css': {
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  },
  '/src/index.js': {
    code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from '../App.js';

// Add dark class to html element
document.documentElement.classList.add('dark');

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },
  '/lib/utils.js': {
    code: `import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}`,
  },
}

export const CodeBlock = ({ language, code, index, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  // Extract base language from language:path format
  const baseLanguage = language.split(':')[0]
  const filePath = language.includes(':') ? language.split(':')[1] : null

  const lineCount = code.split('\n').length
  const canShowPreview =
    baseLanguage === 'javascript' && code.includes('import React')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      layout
      className='relative group rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm'
    >
      <div className='flex items-center justify-between p-2 border-b border-gray-700'>
        <div className='flex items-center gap-2'>
          {filePath ? (
            <Folder className='w-4 h-4 text-gray-400' />
          ) : (
            <Code className='w-4 h-4 text-gray-400' />
          )}
          <span className='text-sm text-gray-300'>
            {filePath || baseLanguage}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {canShowPreview && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className='p-1 text-gray-400 hover:text-gray-300 transition-colors'
              title={showPreview ? 'Show code' : 'Show preview'}
            >
              {showPreview ? (
                <Code className='w-4 h-4' />
              ) : (
                <PlayCircle className='w-4 h-4' />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className='p-1.5 hover:bg-gray-700 rounded-md transition-colors group relative'
            title='Copy code'
          >
            {copied ? (
              <Check className='w-4 h-4 text-green-400' />
            ) : (
              <Copy className='w-4 h-4 text-gray-400 group-hover:text-gray-300' />
            )}
          </button>
          {!showPreview && lineCount > 15 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-1.5 hover:bg-gray-700 rounded-md transition-colors group'
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className='w-4 h-4 text-gray-400 group-hover:text-gray-300' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-400 group-hover:text-gray-300' />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode='wait'>
        {showPreview ? (
          <motion.div
            key='preview'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='min-h-[500px]'
          >
            <Sandpack
              theme={nightOwl}
              template='react'
              files={{
                ...CUSTOM_FILES,
                ...DEFAULT_FILES,
                '/App.js': code
                  .replace(
                    `import './styles/globals.css'`,
                    `import './styles.css'`
                  )
                  .replace(
                    `import { cn } from '@/lib/utils'`,
                    `import { cn } from './lib/utils'`
                  ),
                '/src/index.js': {
                  code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from '../App.js';

// Add dark class to html element
document.documentElement.classList.add('dark');

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
                },
                '/src/styles.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}`,
                '/lib/utils.js': {
                  code: `import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}`,
                },
                '/tailwind.config.js': {
                  code: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{js,jsx}",  // This ensures all files are scanned
    "./src/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Your theme extensions...
    }
  },
  plugins: [require("tailwindcss-animate")],
  corePlugins: {
    preflight: true,
  },
}`,
                },
                '/postcss.config.js': {
                  code: `module.exports = { 
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
                },
                '/public/index.html': dedent`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `,
              }}
              customSetup={{
                dependencies: {
                  ...CUSTOM_DEPENDENCIES,
                  tailwindcss: '^3.3.0',
                  postcss: '^8.4.31',
                  autoprefixer: '^10.4.16',
                },
              }}
              options={{
                showNavigator: true,
                showLineNumbers: true,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: 500,
                showTabs: true,
                closableTabs: false,
                externalResources: [
                  'https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css',
                ],
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key='code'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              layout
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : lineCount > 15 ? '300px' : 'auto',
              }}
              className='relative overflow-hidden'
            >
              <SyntaxHighlighter
                language={baseLanguage.toLowerCase()}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                }}
                showLineNumbers
                wrapLongLines
              >
                {code}
              </SyntaxHighlighter>

              {!isExpanded && lineCount > 15 && (
                <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent' />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

CodeBlock.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onCopy: PropTypes.func.isRequired,
}

export default CodeBlock
