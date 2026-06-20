import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import Time from './pages/Time'
import Journal from './pages/Journal'
import CRM from './pages/CRM'
import Planning from './pages/Planning'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/time" element={<Time />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
