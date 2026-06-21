import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { QuickAddTask } from './QuickAddTask'

describe('QuickAddTask', () => {
  it('renders input placeholder', () => {
    render(<QuickAddTask onAdd={vi.fn()} />)
    expect(screen.getByPlaceholderText('Add a task for today...')).toBeInTheDocument()
  })

  it('calls onAdd with trimmed value on Enter', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<QuickAddTask onAdd={onAdd} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task for today...'), 'Review Q3{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Review Q3')
  })

  it('clears input after submission', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<QuickAddTask onAdd={onAdd} />)
    const input = screen.getByPlaceholderText('Add a task for today...')
    await userEvent.type(input, 'Review Q3{Enter}')
    expect(input).toHaveValue('')
  })

  it('does not call onAdd when input is empty', async () => {
    const onAdd = vi.fn()
    render(<QuickAddTask onAdd={onAdd} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task for today...'), '{Enter}')
    expect(onAdd).not.toHaveBeenCalled()
  })
})
