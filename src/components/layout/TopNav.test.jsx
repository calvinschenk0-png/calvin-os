import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TopNav } from './TopNav'

function renderNav(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TopNav />
    </MemoryRouter>
  )
}

test('renders OS logo', () => {
  renderNav()
  expect(screen.getByText('OS')).toBeInTheDocument()
})

test('renders all nav labels', () => {
  renderNav()
  expect(screen.getByText('HOME')).toBeInTheDocument()
  expect(screen.getByText('CALENDAR')).toBeInTheDocument()
  expect(screen.getByText('TASKS')).toBeInTheDocument()
})

test('TASKS button toggles dropdown', () => {
  renderNav('/tasks')
  const tasksBtn = screen.getByRole('button', { name: /TASKS/i })
  fireEvent.click(tasksBtn)
  expect(screen.getByText('QUICK TASKS')).toBeInTheDocument()
})
