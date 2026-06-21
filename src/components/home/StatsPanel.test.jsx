import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatsPanel } from './StatsPanel'

const stats = {
  tasksDoneThisWeek: 7,
  habitStreak: { hit: 3, total: 5 },
  hoursLoggedThisWeek: 22.5,
}

describe('StatsPanel', () => {
  it('renders task count', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders habit streak as X/Y days', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('3/5 days')).toBeInTheDocument()
  })

  it('renders hours with h suffix', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('22.5h')).toBeInTheDocument()
  })

  it('renders all three row labels', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('TASKS DONE')).toBeInTheDocument()
    expect(screen.getByText('HABITS STREAK')).toBeInTheDocument()
    expect(screen.getByText('HOURS LOGGED')).toBeInTheDocument()
  })
})
