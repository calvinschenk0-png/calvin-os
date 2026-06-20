import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

export function Shell() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-0 md:pt-14 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
