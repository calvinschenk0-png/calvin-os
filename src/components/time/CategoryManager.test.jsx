import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CategoryManager } from './CategoryManager'

const categories = [
  { id: 'c1', name: 'Deep Work', color: '#FF3D00' },
  { id: 'c2', name: 'Transit', color: '#6B7280' },
]

describe('CategoryManager', () => {
  it('renders categories passed in via props, not from its own fetch', () => {
    render(<CategoryManager categories={categories} isLoading={false} addCategory={vi.fn()} deleteCategory={vi.fn()} />)
    expect(screen.getByText('Deep Work')).toBeInTheDocument()
    expect(screen.getByText('Transit')).toBeInTheDocument()
  })

  it('reflects a category list update from the parent immediately (no independent state)', () => {
    const { rerender } = render(
      <CategoryManager categories={categories} isLoading={false} addCategory={vi.fn()} deleteCategory={vi.fn()} />
    )
    expect(screen.queryByText('Work')).not.toBeInTheDocument()

    const updated = [...categories, { id: 'c3', name: 'Work', color: '#4A9EFF' }]
    rerender(<CategoryManager categories={updated} isLoading={false} addCategory={vi.fn()} deleteCategory={vi.fn()} />)
    expect(screen.getByText('Work')).toBeInTheDocument()

    const afterRemove = updated.filter(c => c.name !== 'Transit')
    rerender(<CategoryManager categories={afterRemove} isLoading={false} addCategory={vi.fn()} deleteCategory={vi.fn()} />)
    expect(screen.queryByText('Transit')).not.toBeInTheDocument()
  })

  it('calls the addCategory prop with trimmed name and selected color', () => {
    const addCategory = vi.fn().mockResolvedValue()
    render(<CategoryManager categories={categories} isLoading={false} addCategory={addCategory} deleteCategory={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('New category'), { target: { value: '  Work  ' } })
    fireEvent.click(screen.getByText('Add'))

    expect(addCategory).toHaveBeenCalledWith('Work', '#FF3D00')
  })

  it('calls the deleteCategory prop with the category id', () => {
    const deleteCategory = vi.fn()
    render(<CategoryManager categories={categories} isLoading={false} addCategory={vi.fn()} deleteCategory={deleteCategory} />)

    fireEvent.click(screen.getAllByText('Remove')[1])

    expect(deleteCategory).toHaveBeenCalledWith('c2')
  })
})
