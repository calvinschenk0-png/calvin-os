import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { HabitList } from './HabitList'

const habits = [
  { id: 'h1', name: 'Gym', sort_order: 1 },
  { id: 'h2', name: 'Read', sort_order: 2 },
]
const logs = { h1: true, h2: false }

describe('HabitList', () => {
  it('renders habit names', () => {
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Gym')).toBeInTheDocument()
    expect(screen.getByText('Read')).toBeInTheDocument()
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const onToggle = vi.fn()
    render(<HabitList habits={habits} logs={logs} onToggle={onToggle} onAdd={vi.fn()} onDelete={vi.fn()} />)
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0])
    expect(onToggle).toHaveBeenCalledWith('h1')
  })

  it('shows add input when + button clicked', async () => {
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByLabelText('Add habit'))
    expect(screen.getByPlaceholderText('Habit name...')).toBeInTheDocument()
  })

  it('calls onAdd and hides input on Enter', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={onAdd} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByLabelText('Add habit'))
    await userEvent.type(screen.getByPlaceholderText('Habit name...'), 'Stretch{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Stretch')
    expect(screen.queryByPlaceholderText('Habit name...')).not.toBeInTheDocument()
  })

  it('calls onDelete when × button clicked', async () => {
    const onDelete = vi.fn()
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={onDelete} />)
    const deleteButtons = screen.getAllByRole('button', { name: /Remove/ })
    await userEvent.click(deleteButtons[0])
    expect(onDelete).toHaveBeenCalledWith('h1')
  })
})
