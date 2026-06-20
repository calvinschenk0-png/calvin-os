import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './Shell'

test('renders child route content', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<div>page content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
  expect(screen.getByText('page content')).toBeInTheDocument()
})
