import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { NavDropdown } from './NavDropdown'

const items = [
  { label: 'QUICK TASKS', path: '/tasks' },
  { label: 'HABITS', path: '/tasks' },
]

function renderDropdown(isOpen, onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <NavDropdown items={items} isOpen={isOpen} onClose={onClose} />
    </MemoryRouter>
  )
}

test('renders all items', () => {
  renderDropdown(true)
  expect(screen.getByText('QUICK TASKS')).toBeInTheDocument()
  expect(screen.getByText('HABITS')).toBeInTheDocument()
})

test('has opacity-0 class when closed', () => {
  const { container } = renderDropdown(false)
  expect(container.firstChild).toHaveClass('opacity-0')
})

test('has opacity-100 class when open', () => {
  const { container } = renderDropdown(true)
  expect(container.firstChild).toHaveClass('opacity-100')
})

test('calls onClose on outside mousedown', () => {
  const onClose = vi.fn()
  renderDropdown(true, onClose)
  fireEvent.mouseDown(document.body)
  expect(onClose).toHaveBeenCalledTimes(1)
})
