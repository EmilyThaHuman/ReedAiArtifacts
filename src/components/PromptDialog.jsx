import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export const PromptDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editingPrompt,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title)
      setSystemPrompt(editingPrompt.messages[0]?.content || '')
    } else {
      setTitle('')
      setSystemPrompt('')
    }
  }, [editingPrompt])

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({
      ...(editingPrompt && { id: editingPrompt.id }),
      title,
      systemPrompt,
    })
    setTitle('')
    setSystemPrompt('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-primary' />
            {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='prompt-title'>Prompt Title</Label>
              <Input
                id='prompt-title'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='Enter a title for your prompt'
                className='col-span-3'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='system-prompt'>System Prompt</Label>
              <Textarea
                id='system-prompt'
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                placeholder='Enter your system prompt...'
                className='col-span-3 min-h-[150px]'
                required
              />
            </div>
          </div>
          <DialogFooter>
            {editingPrompt && (
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setTitle('')
                  setSystemPrompt('')
                  onCancelEdit()
                }}
              >
                Cancel Edit
              </Button>
            )}
            <Button type='submit'>
              {editingPrompt ? 'Update Prompt' : 'Create Prompt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

PromptDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingPrompt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  onCancelEdit: PropTypes.func.isRequired,
}

export default PromptDialog
