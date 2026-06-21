import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { TaskList } from './TaskList'

const tasks = [
  { id: 't1', title: 'Review Q3', status: 'open', priority: 2 },
  { id: 't2', title: 'Send proposal', status: 'done', priority: 1 },
]

describe('TaskList', () => {
  it('renders task titles', () => {
    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)
    expect(screen.getByText('Review Q3')).toBeInTheDocument()
    expect(screen.getByText('Send proposal')).toBeInTheDocument()
  })

  it('shows empty message when no tasks', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} />)
    expect(screen.getByText('No tasks for today.')).toBeInTheDocument()
  })

  it('calls onToggle with id and status on click', async () => {
    const onToggle = vi.fn()
    render(<TaskList tasks={tasks} onToggle={onToggle} />)
    await userEvent.click(screen.getByText('Review Q3'))
    expect(onToggle).toHaveBeenCalledWith('t1', 'open')
  })

  it('applies line-through to done tasks', () => {
    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)
    const doneEl = screen.getByText('Send proposal')
    expect(doneEl.className).toMatch(/line-through/)
  })
})
