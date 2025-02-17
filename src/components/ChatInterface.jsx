import React, { useRef, useEffect } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { getProvider } from '@/lib/providers'
import { ChatMessage } from './ChatMessage'
import { ModelSelector } from './ModelSelector'
import ThinkingProcess from './ThinkingProcess'
import ChatInput from './ChatInput'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import ChatSidebar from './ChatSidebar'
import { useFileStore } from '@/store/useFileStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const REASONING_PROMPT = `You are an expert assistant focused on clear reasoning and problem-solving. When responding:

1. Start each thought with "THINKING:" to explain your analysis
2. Share your step-by-step reasoning process
3. For code requests:
   - Include code examples in markdown code blocks with language and file path
   - Use \`\`\`javascript:path/to/file\`\` format for code blocks
4. End with "RESPONSE:" followed by your complete answer

Example format for code requests:
THINKING: First, analyzing the requirements...
THINKING: Considering the best implementation approach...
THINKING: Structuring the component for reusability...
RESPONSE: Here's the implementation:

\`\`\`javascript:src/components/Example.jsx
import React from 'react'
// ... code implementation
\`\`\`

Example format for general questions:
THINKING: Analyzing the key aspects...
THINKING: Considering relevant factors...
RESPONSE: [Your complete, well-structured answer]`

const SYSTEM_PROMPT = `
You are an expert full-stack JavaScript developer specialized in React and Tailwind CSS. When writing code, follow these strict guidelines:

### Code Structure and Format
1. ALWAYS return complete, self-contained code in a SINGLE code block
2. Use \`\`\`javascript:path/to/file.jsx\`\`\` format for file path indication
3. Include ALL necessary imports at the top of the file
4. Export both named and default exports for components
5. Add displayName for components
6. NEVER include PropTypes - use JSDoc comments for props documentation only
7. For navigation/router UI components (navbar, sidebar, breadcrumbs, etc.):
   - Provide ONLY the UI implementation without routing logic
   - Use onClick handlers and isActive props instead of router hooks
   - Example for links:
     - Use: onClick={() => console.log('Navigate to: /path')}
     - Instead of: useNavigate() or <Link to="/path">
   - Let the user integrate their preferred routing solution

### React Best Practices
1. Use functional components with hooks
2. Use JSDoc comments for props documentation (not PropTypes)
3. Follow React 18+ best practices
4. Implement proper error boundaries and loading states
5. Use proper memo/callback optimizations where needed
6. Ensure proper accessibility (ARIA labels, semantic HTML)

### Mobile & Responsive Design Requirements
1. ALWAYS implement mobile-first design approach
2. Ensure ALL components are fully responsive across ALL screen sizes
3. Use Tailwind's responsive breakpoints consistently:
   - Default (mobile): < 640px
   - sm: >= 640px
   - md: >= 768px
   - lg: >= 1024px
   - xl: >= 1280px
   - 2xl: >= 1536px
4. Test and optimize touch interactions for mobile:
   - Appropriate tap target sizes (min 44px)
   - Touch-friendly spacing
   - Swipe gestures where appropriate
5. Consider mobile performance:
   - Optimize images and assets
   - Minimize JS bundle size
   - Implement lazy loading
6. Handle mobile-specific features:
   - Device orientation changes
   - Virtual keyboard adjustments
   - Safe areas and notches

### Styling Guidelines
1. Use ONLY Tailwind's core utility classes - NO arbitrary values
   - CORRECT: 'h-64 w-full p-4 mt-6'
   - INCORRECT: 'h-[500px] w-[42rem] p-[15px] mt-[27px]'
2. Group Tailwind classes using the cn utility:
   \`\`\`javascript
   import { cn } from './lib/utils'
   
   const styles = {
     button: cn(
       'inline-flex items-center justify-center',
       'rounded-md text-sm font-medium',
       'bg-blue-500 text-white',
       'hover:bg-blue-600',
       'h-10 px-4 py-2',
       'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
       'disabled:opacity-50 disabled:pointer-events-none'
     )
   }
   \`\`\`
3. Always include responsive variants:
   - Mobile-first design
   - Use sm:, md:, lg:, xl: breakpoints
   - Include hover:, focus:, active: states

### Available Dependencies (USE ONLY THESE - NO OTHER DEPENDENCIES)
1. Core Dependencies:
   - react (latest stable)
   - react-dom
   - tailwindcss: ^3.3.0
   - postcss: ^8.4.31
   - autoprefixer: ^10.4.16
   - @tailwindcss/forms: ^0.5.7

2. UI Component Libraries:
   - @radix-ui/react-accordion: ^1.2.0
   - @radix-ui/react-alert-dialog: ^1.1.1
   - @radix-ui/react-aspect-ratio: ^1.1.0
   - @radix-ui/react-avatar: ^1.1.0
   - @radix-ui/react-checkbox: ^1.1.1
   - @radix-ui/react-collapsible: ^1.1.0
   - @radix-ui/react-dialog: ^1.1.1
   - @radix-ui/react-dropdown-menu: ^2.1.1
   - @radix-ui/react-hover-card: ^1.1.1
   - @radix-ui/react-label: ^2.1.0
   - @radix-ui/react-menubar: ^1.1.1
   - @radix-ui/react-navigation-menu: ^1.2.0
   - @radix-ui/react-popover: ^1.1.1
   - @radix-ui/react-progress: ^1.1.0
   - @radix-ui/react-radio-group: ^1.2.0
   - @radix-ui/react-select: ^2.1.1
   - @radix-ui/react-separator: ^1.1.0
   - @radix-ui/react-slider: ^1.2.0
   - @radix-ui/react-slot: ^1.1.0
   - @radix-ui/react-switch: ^1.1.0
   - @radix-ui/react-tabs: ^1.1.0
   - @radix-ui/react-toast: ^1.2.1
   - @radix-ui/react-toggle: ^1.1.0
   - @radix-ui/react-toggle-group: ^1.1.0
   - @radix-ui/react-tooltip: ^1.1.2
   - react-resizable-panels: ^0.0.55

3. Utility Libraries:
   - class-variance-authority: ^0.7.0
   - tailwindcss-animate: ^1.0.7
   - tailwind-merge: ^2.0.0
   - clsx: ^2.0.0
   - lucide-react: ^0.292.0
   - framer-motion: ^11.0.5
   - lodash: latest
   - mathjs: latest
   - papaparse: latest
   - date-fns: latest
   - axios: latest

4. Payment Integration:
   - @stripe/react-stripe-js: ^2.5.0
   - @stripe/stripe-js: ^3.0.0

### Implementation Constraints
1. Browser Environment:
   - Browser-safe APIs only (no Node.js specific features)
   - No direct file system access
   - No direct database connections
   - No environment variables
   - Limited access to browser APIs

2. External Resources:
   - External CDN resources must be from https://cdnjs.cloudflare.com only
   - No custom fonts (use system fonts or Google Fonts via CDN)
   - Images must use placeholder API

3. Build and Bundle:
   - No custom webpack/vite configurations
   - No TypeScript (JS only)
   - No CSS-in-JS libraries
   - No CSS Modules

4. Styling Restrictions:
   - Only core Tailwind utilities (no JIT)
   - No arbitrary values in Tailwind classes
   - No global CSS (use Tailwind only)
   - No CSS custom properties

### Example Component Structure
\`\`\`javascript:src/components/DashboardPage.jsx
import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tabs from '@radix-ui/react-tabs'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import * as HoverCard from '@radix-ui/react-hover-card'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  Plus,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Chart,
  List,
  Grid,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

const styles = {
  // Layout
  page: cn(
    'min-h-screen bg-gray-50 dark:bg-gray-900',
    'flex flex-col'
  ),
  main: cn(
    'flex-1 w-full',
    'px-4 py-2 sm:px-6 lg:px-8'
  ),
  section: cn(
    'w-full max-w-7xl mx-auto',
    'py-4 sm:py-6 lg:py-8'
  ),

  // Navigation
  navbar: cn(
    'w-full bg-white dark:bg-gray-800',
    'border-b border-gray-200 dark:border-gray-700',
    'px-4 sm:px-6 lg:px-8'
  ),
  navContent: cn(
    'flex items-center justify-between',
    'h-16 mx-auto max-w-7xl'
  ),
  logo: cn(
    'flex items-center flex-shrink-0',
    'text-xl font-semibold text-gray-900 dark:text-white'
  ),
  navLinks: cn(
    'hidden md:flex md:items-center md:space-x-8'
  ),
  navLink: cn(
    'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
    'px-3 py-2 text-sm font-medium',
    'rounded-md',
    'transition-colors duration-200'
  ),
  navLinkActive: cn(
    'text-blue-600 dark:text-blue-400',
    'font-semibold'
  ),
  mobileMenuButton: cn(
    'md:hidden',
    'inline-flex items-center justify-center',
    'p-2 rounded-md',
    'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300',
    'focus:outline-none focus:ring-2 focus:ring-blue-500'
  ),

  // Header Section
  header: cn(
    'flex flex-col sm:flex-row items-start sm:items-center justify-between',
    'gap-4 sm:gap-6',
    'w-full'
  ),
  headerTitle: cn(
    'flex flex-col',
    'space-y-1'
  ),
  headerActions: cn(
    'flex flex-col sm:flex-row items-stretch sm:items-center',
    'gap-3 sm:gap-4',
    'w-full sm:w-auto'
  ),

  // Content Cards
  card: cn(
    'bg-white dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'rounded-lg shadow-sm',
    'overflow-hidden'
  ),
  cardHeader: cn(
    'flex items-center justify-between',
    'px-4 py-3 sm:px-6',
    'border-b border-gray-200 dark:border-gray-700',
    'bg-gray-50 dark:bg-gray-800/50'
  ),
  cardTitle: cn(
    'text-base sm:text-lg font-semibold',
    'text-gray-900 dark:text-white'
  ),
  cardContent: cn(
    'px-4 py-4 sm:px-6',
    'space-y-4'
  ),

  // Interactive Elements
  button: cn(
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'transition-colors duration-200',
    'min-h-[44px] px-4 py-2' // Mobile-friendly touch target
  ),
  primaryButton: cn(
    'bg-blue-600 hover:bg-blue-700',
    'text-white',
    'border border-transparent',
    'focus:ring-blue-500'
  ),
  secondaryButton: cn(
    'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700',
    'text-gray-700 dark:text-gray-200',
    'border border-gray-300 dark:border-gray-600',
    'focus:ring-blue-500'
  ),
  iconButton: cn(
    'inline-flex items-center justify-center',
    'w-10 h-10 rounded-full',
    'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'transition-colors duration-200'
  ),

  // Dropdown Menus
  dropdownContent: cn(
    'z-10 min-w-[200px]',
    'bg-white dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'rounded-md shadow-lg',
    'py-1',
    'origin-top-right',
    'focus:outline-none'
  ),
  dropdownItem: cn(
    'group flex items-center gap-2',
    'w-full px-4 py-2',
    'text-sm text-gray-700 dark:text-gray-200',
    'hover:bg-gray-100 dark:hover:bg-gray-700',
    'focus:bg-gray-100 dark:focus:bg-gray-700',
    'transition-colors duration-200',
    'cursor-pointer'
  ),

  // Tabs
  tabsList: cn(
    'flex space-x-1',
    'border-b border-gray-200 dark:border-gray-700'
  ),
  tabsTrigger: cn(
    'px-3 py-2',
    'text-sm font-medium',
    'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
    'border-b-2 border-transparent',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'data-[state=active]:border-blue-500 data-[state=active]:text-blue-600',
    'transition-colors duration-200'
  ),
  tabsContent: cn(
    'py-4',
    'focus:outline-none'
  ),

  // Data Grid
  table: cn(
    'min-w-full divide-y divide-gray-200 dark:divide-gray-700'
  ),
  thead: cn(
    'bg-gray-50 dark:bg-gray-800/50'
  ),
  th: cn(
    'px-4 py-3 sm:px-6',
    'text-left text-xs font-medium',
    'text-gray-500 dark:text-gray-400',
    'uppercase tracking-wider'
  ),
  td: cn(
    'px-4 py-3 sm:px-6',
    'whitespace-nowrap',
    'text-sm text-gray-900 dark:text-gray-200'
  ),
  tr: cn(
    'hover:bg-gray-50 dark:hover:bg-gray-800',
    'transition-colors duration-200'
  ),

  // Forms
  formGroup: cn(
    'space-y-2'
  ),
  label: cn(
    'block text-sm font-medium',
    'text-gray-700 dark:text-gray-300'
  ),
  input: cn(
    'block w-full',
    'rounded-md',
    'border border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-700',
    'text-gray-900 dark:text-gray-100',
    'px-4 py-2',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'focus:border-blue-500 focus:ring-blue-500',
    'disabled:opacity-50',
    'transition-colors duration-200'
  ),

  // Overlays
  overlay: cn(
    'fixed inset-0',
    'bg-black/50 backdrop-blur-sm',
    'z-40'
  ),
  modal: cn(
    'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'w-[calc(100%-2rem)] sm:w-full max-w-lg',
    'bg-white dark:bg-gray-800',
    'rounded-lg shadow-xl',
    'z-50'
  ),
  modalHeader: cn(
    'flex items-center justify-between',
    'px-4 py-3 sm:px-6',
    'border-b border-gray-200 dark:border-gray-700'
  ),
  modalContent: cn(
    'px-4 py-4 sm:px-6',
    'max-h-[calc(100vh-200px)]',
    'overflow-y-auto'
  )
}

/**
 * Example dashboard page demonstrating component composition and responsive design
 * @param {Object} props
 * @param {string} props.username - The current user's name
 * @param {Object[]} props.data - The dashboard data
 */
const DashboardPage = ({ username = 'John Doe', data = [] }) => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedView, setSelectedView] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Handlers
  const handleSearch = (e) => setSearchQuery(e.target.value)
  const handleViewChange = (view) => setSelectedView(view)
  const handleTabChange = (tab) => setActiveTab(tab)
  const handleCreateNew = () => setCreateDialogOpen(true)
  const handleLogout = () => console.log('Navigate to: /logout')

  return (
    <div className={styles.page}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
                  <div className={styles.navContent}>
            {/* Left: Logo & Desktop Navigation */}
            <div className="flex items-center gap-8">
              <div className={styles.logo}>
                Dashboard
              </div>
              <NavigationMenu.Root className={styles.navLinks}>
                <NavigationMenu.List className="flex space-x-4">
                  <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={cn(styles.navLink, styles.navLinkActive)}>
                      Overview
                    </NavigationMenu.Trigger>
                  </NavigationMenu.Item>
                  <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={styles.navLink}>
                      Analytics
                    </NavigationMenu.Trigger>
                  </NavigationMenu.Item>
                  <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={styles.navLink}>
                      Reports
                    </NavigationMenu.Trigger>
                  </NavigationMenu.Item>
                </NavigationMenu.List>
              </NavigationMenu.Root>
            </div>

            {/* Right: Search, Notifications, Profile */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className={cn(styles.input, 'pl-10 pr-4 py-2')}
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {/* Notifications */}
              <HoverCard.Root>
                <HoverCard.Trigger asChild>
                  <button className={styles.iconButton}>
                    <Bell className="h-5 w-5" />
                  </button>
                </HoverCard.Trigger>
                <HoverCard.Portal>
                  <HoverCard.Content className={styles.card} sideOffset={5}>
                    <div className="p-4">
                      <h3 className="text-sm font-medium">Notifications</h3>
                      <div className="mt-2 text-sm text-gray-500">No new notifications</div>
                    </div>
                  </HoverCard.Content>
                </HoverCard.Portal>
              </HoverCard.Root>

              {/* Profile Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className={cn(styles.button, styles.secondaryButton, 'gap-2')}>
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className={styles.dropdownContent} align="end">
                    <DropdownMenu.Item className={styles.dropdownItem}>
                      <User className="h-4 w-4" />
                      Profile
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.dropdownItem}>
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="my-1 border-t border-gray-200 dark:border-gray-700" />
                    <DropdownMenu.Item className={styles.dropdownItem} onSelect={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Mobile Menu Button */}
              <button
                className={styles.mobileMenuButton}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header Section */}
        <div className={styles.section}>
          <header className={styles.header}>
            <div className={styles.headerTitle}>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Welcome back, {username}
              </p>
            </div>
            <div className={styles.headerActions}>
              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  className={cn(
                    styles.button,
                    'rounded-none rounded-l-lg border-r border-gray-200 dark:border-gray-700',
                    selectedView === 'grid' && 'bg-gray-100 dark:bg-gray-800'
                  )}
                  onClick={() => handleViewChange('grid')}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  className={cn(
                    styles.button,
                    'rounded-none rounded-r-lg',
                    selectedView === 'list' && 'bg-gray-100 dark:bg-gray-800'
                  )}
                  onClick={() => handleViewChange('list')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Button */}
              <button className={cn(styles.button, styles.secondaryButton)}>
                <Filter className="h-4 w-4" />
                Filter
              </button>

              {/* Create Button */}
              <button
                className={cn(styles.button, styles.primaryButton)}
                onClick={handleCreateNew}
              >
                <Plus className="h-4 w-4" />
                Create New
              </button>
            </div>
          </header>

          {/* Tabs Section */}
          <div className="mt-6">
            <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
              <Tabs.List className={styles.tabsList}>
                <Tabs.Trigger value="overview" className={styles.tabsTrigger}>
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger value="analytics" className={styles.tabsTrigger}>
                  Analytics
                </Tabs.Trigger>
                <Tabs.Trigger value="reports" className={styles.tabsTrigger}>
                  Reports
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="overview" className={styles.tabsContent}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Example Cards */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={styles.card}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Card {i + 1}</h3>
                        <button className={styles.iconButton}>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <div className={styles.cardContent}>
                        <p className="text-gray-500 dark:text-gray-400">
                          Example card content demonstrating layout and styling.
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="analytics" className={styles.tabsContent}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Analytics Overview</h3>
                  </div>
                  <div className={styles.cardContent}>
                    <p className="text-gray-500 dark:text-gray-400">
                      Analytics content would go here.
                    </p>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="reports" className={styles.tabsContent}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Reports</h3>
                  </div>
                  <div className={styles.cardContent}>
                    <table className={styles.table}>
                      <thead className={styles.thead}>
                        <tr>
                          <th className={styles.th}>Name</th>
                          <th className={styles.th}>Status</th>
                          <th className={styles.th}>Date</th>
                          <th className={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className={styles.tr}>
                            <td className={styles.td}>Report {i + 1}</td>
                            <td className={styles.td}>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className={styles.td}>{new Date().toLocaleDateString()}</td>
                            <td className={styles.td}>
                              <button className={cn(styles.button, styles.secondaryButton, 'py-1')}>
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      </main>

      {/* Create Dialog */}
      <Dialog.Root open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.modal}>
            <div className={styles.modalHeader}>
              <Dialog.Title className={styles.cardTitle}>
                Create New Item
              </Dialog.Title>
              <Dialog.Close className={styles.iconButton}>
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            <div className={styles.modalContent}>
              <form className="space-y-4">
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={styles.input}
                    placeholder="Enter name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.label}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    className={cn(styles.input, 'min-h-[100px]')}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className={cn(styles.button, styles.secondaryButton)}
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={cn(styles.button, styles.primaryButton)}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

DashboardPage.displayName = 'DashboardPage'

export { DashboardPage }
export default DashboardPage
\`\`\`

Remember:
- ALWAYS return complete, self-contained code in a single code block
- NO arbitrary Tailwind values (never use square brackets [])
- Use Radix UI primitives directly (not shadcn/ui components)
- Include both named and default exports
- Use JSDoc for props documentation
- Use semantic HTML and proper ARIA attributes
- Mobile-first responsive design
- Implement proper error handling
- All icons should be from lucide-react
`

const styles = {
  container: cn(
    'flex h-screen w-full',
    'bg-gray-900 text-gray-100',
    'overflow-hidden'
  ),
  sidebarContainer: cn(
    'fixed inset-y-0 left-0 z-50',
    'w-64 md:w-64',
    'transform transition-transform duration-300 ease-in-out',
    'md:relative md:transform-none',
    'bg-gray-900 border-r border-gray-800'
  ),
  mainWrapper: cn(
    'flex flex-col flex-1',
    'w-full min-w-0',
    'md:pl-0' // Remove default padding
  ),
  main: cn('flex flex-col flex-1', 'w-full h-full', 'relative'),
  messagesContainer: cn(
    'flex-1 overflow-y-auto',
    'w-full',
    'px-4 py-4',
    'space-y-4',
    'sm:px-6 md:px-8'
  ),
  inputContainer: cn(
    'flex flex-col w-full',
    'p-4 border-t border-gray-800',
    'bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80',
    'sm:p-6 md:p-8'
  ),
  modelSelectorWrapper: cn(
    'flex items-center justify-between w-full',
    'p-4 border-b border-gray-800',
    'bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80'
  ),
  menuButton: cn(
    'p-2 rounded-md',
    'text-gray-400 hover:text-gray-300',
    'transition-colors duration-200',
    'md:hidden',
    'focus:outline-none focus:ring-2 focus:ring-blue-500'
  ),
}

export const ChatInterface = () => {
  const messagesEndRef = useRef(null)
  const {
    messages,
    currentModel,
    isThinking,
    addMessage: appendMessage,
    setIsThinking,
  } = useChatStore()
  const { files } = useFileStore()
  const { collapsed, setCollapsed } = useSidebar()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async ({ text, files }) => {
    if (!text.trim() && (!files || files.length === 0)) return

    const provider = getProvider(currentModel.provider)
    if (!provider) {
      console.error('No provider found for model:', currentModel)
      return
    }

    try {
      setIsThinking(true)
      appendMessage({
        role: 'user',
        content: text,
        files: files?.map(f => f.id) || [],
      })

      // Set the current model and system prompt on the provider
      provider.currentModel = currentModel
      provider.systemPrompt = SYSTEM_PROMPT

      const response = await provider.sendMessage(text, files)
      appendMessage(response)
    } catch (error) {
      console.error('Error sending message:', error)
      appendMessage({
        role: 'assistant',
        content:
          'Sorry, there was an error processing your request. Please try again.',
      })
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <ChatSidebar />

      <div className='flex flex-1 flex-col min-w-0'>
        {/* Header */}
        <header className='border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50'>
          <div className='flex h-16 items-center gap-4 px-4'>
            <div className='flex flex-1 items-center gap-4 overflow-hidden justify-end'>
              <ThemeToggle />
              <ModelSelector />
            </div>
          </div>
        </header>

        {/* Main chat area */}
        <div className='relative flex flex-1 flex-col overflow-hidden'>
          <ScrollArea className='flex-1 p-4'>
            <div className='mx-auto max-w-3xl space-y-4'>
              {messages.length === 0 ? (
                <Card className='p-8 text-center'>
                  <div className='mx-auto h-8 w-8 text-primary/80'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M12 3v17M3 12h18' />
                    </svg>
                  </div>
                  <h2 className='mt-4 text-lg font-semibold'>
                    Welcome to AI Chat
                  </h2>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Start a conversation with your AI assistant. Ask questions,
                    get help with coding, or discuss any topic you&apos;d like.
                  </p>
                </Card>
              ) : (
                messages.map((message, index) => (
                  <React.Fragment key={index}>
                    <ChatMessage message={message} />
                    {index < messages.length - 1 && (
                      <Separator className='my-4 opacity-30' />
                    )}
                  </React.Fragment>
                ))
              )}
              {isThinking && <ThinkingProcess />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className='border-t bg-card/50 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/50'>
            <div className='mx-auto max-w-3xl'>
              <ChatInput onSubmit={handleSubmit} files={files} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ChatInterface.displayName = 'ChatInterface'

export default ChatInterface
