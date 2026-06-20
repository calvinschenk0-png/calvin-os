import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalendarHeader } from './CalendarHeader'

const base = {
  currentDate: new Date('2026-06-20'),
  view: 'week',
  isSyncing: false,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onToday: vi.fn(),
  onViewChange: vi.fn(),
  onSync: vi.fn(),
}

describe('CalendarHeader', () => {
  it('renders month and year', () => {
    render(<CalendarHeader {...base} />)
    expect(screen.getByText('JUN 2026')).toBeInTheDocument()
  })

  it('calls onPrev when previous arrow clicked', () => {
    render(<CalendarHeader {...base} />)
    fireEvent.click(screen.getByLabelText('Previous'))
    expect(base.onPrev).toHaveBeenCalled()
  })

  it('calls onNext when next arrow clicked', () => {
    render(<CalendarHeader {...base} />)
    fireEvent.click(screen.getByLabelText('Next'))
    expect(base.onNext).toHaveBeenCalled()
  })

  it('shows SYNCING text when isSyncing is true', () => {
    render(<CalendarHeader {...base} isSyncing={true} />)
    expect(screen.getByText('SYNCING')).toBeInTheDocument()
  })

  it('calls onViewChange with day when DAY clicked', () => {
    render(<CalendarHeader {...base} />)
    fireEvent.click(screen.getByText('DAY'))
    expect(base.onViewChange).toHaveBeenCalledWith('day')
  })

  it('active view tab has accent underline class', () => {
    render(<CalendarHeader {...base} view="week" />)
    const weekBtn = screen.getByText('WEEK')
    expect(weekBtn.className).toContain('border-accent')
  })
})
