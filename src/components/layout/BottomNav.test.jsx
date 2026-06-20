import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from './BottomNav'

function renderNav(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>
  )
}

test('renders primary tabs', () => {
  renderNav()
  expect(screen.getByText('HOME')).toBeInTheDocument()
  expect(screen.getByText('TASKS')).toBeInTheDocument()
  expect(screen.getByText('CALENDAR')).toBeInTheDocument()
  expect(screen.getByText('JOURNAL')).toBeInTheDocument()
  expect(screen.getByText('MORE')).toBeInTheDocument()
})

test('More tray is hidden by default', () => {
  renderNav()
  expect(screen.queryByText('TIME')).not.toBeInTheDocument()
})

test('More tray shows on More click', () => {
  renderNav()
  fireEvent.click(screen.getByText('MORE'))
  expect(screen.getByText('TIME')).toBeInTheDocument()
  expect(screen.getByText('CRM')).toBeInTheDocument()
  expect(screen.getByText('PLANNING')).toBeInTheDocument()
  expect(screen.getByText('SETTINGS')).toBeInTheDocument()
})

test('More tray closes after navigating', () => {
  renderNav()
  fireEvent.click(screen.getByText('MORE'))
  fireEvent.click(screen.getByText('TIME'))
  expect(screen.queryByText('CRM')).not.toBeInTheDocument()
})
