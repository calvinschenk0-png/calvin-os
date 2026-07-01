import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GapBlock } from './GapBlock'

const gap = { id: 'gap-1', start: '2026-06-30T06:00:00', end: '2026-06-30T23:00:00' }
const categories = [{ id: 'c1', name: 'Deep Work', color: '#FF3D00' }]

describe('GapBlock', () => {
  it('defaults the new block to a 30-minute window starting at the gap start, not the whole gap', async () => {
    const onAdd = vi.fn().mockResolvedValue()
    render(<GapBlock gap={gap} categories={categories} onAdd={onAdd} />)

    fireEvent.click(screen.getByText(/ADD BLOCK/))
    fireEvent.change(screen.getByPlaceholderText('What were you doing?'), { target: { value: 'Focus time' } })
    fireEvent.click(screen.getByText('Add'))

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Focus time',
        started_at: '2026-06-30T06:00:00.000Z',
        ended_at: '2026-06-30T06:30:00.000Z',
      })
    )
  })

  it('respects a custom start/end time entered by the user', async () => {
    const onAdd = vi.fn().mockResolvedValue()
    render(<GapBlock gap={gap} categories={categories} onAdd={onAdd} />)

    fireEvent.click(screen.getByText(/ADD BLOCK/))
    fireEvent.change(screen.getByPlaceholderText('What were you doing?'), { target: { value: 'Gym' } })
    const timeInputs = document.querySelectorAll('input[type="time"]')
    fireEvent.change(timeInputs[0], { target: { value: '14:00' } })
    fireEvent.change(timeInputs[1], { target: { value: '15:00' } })
    fireEvent.click(screen.getByText('Add'))

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        started_at: '2026-06-30T14:00:00.000Z',
        ended_at: '2026-06-30T15:00:00.000Z',
      })
    )
  })

  it('does not submit if end time is before start time', () => {
    const onAdd = vi.fn()
    render(<GapBlock gap={gap} categories={categories} onAdd={onAdd} />)

    fireEvent.click(screen.getByText(/ADD BLOCK/))
    fireEvent.change(screen.getByPlaceholderText('What were you doing?'), { target: { value: 'Bad range' } })
    const timeInputs = document.querySelectorAll('input[type="time"]')
    fireEvent.change(timeInputs[0], { target: { value: '10:00' } })
    fireEvent.change(timeInputs[1], { target: { value: '09:00' } })
    fireEvent.click(screen.getByText('Add'))

    expect(onAdd).not.toHaveBeenCalled()
  })
})
