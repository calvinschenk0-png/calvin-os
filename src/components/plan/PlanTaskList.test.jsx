import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PlanTaskList } from './PlanTaskList'

vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const tasks = [
  { id: 't1', title: 'Review Q3', status: 'open', priority: 2 },
  { id: 't2', title: 'Send proposal', status: 'open', priority: 1 },
]

describe('PlanTaskList', () => {
  it('renders task titles', () => {
    render(<PlanTaskList tasks={tasks} isLoading={false} />)
    expect(screen.getByText('Review Q3')).toBeInTheDocument()
    expect(screen.getByText('Send proposal')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<PlanTaskList tasks={[]} isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no unassigned tasks', () => {
    render(<PlanTaskList tasks={[]} isLoading={false} />)
    expect(screen.getByText(/all tasks assigned/i)).toBeInTheDocument()
  })
})
