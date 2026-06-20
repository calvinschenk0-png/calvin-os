import { useSearchParams } from 'react-router-dom'
import { useCalendar, getWeekDays } from '../hooks/useCalendar'
import { ConnectPrompt }  from '../components/calendar/ConnectPrompt'
import { CalendarHeader } from '../components/calendar/CalendarHeader'
import { WeekView }       from '../components/calendar/WeekView'
import { DayView }        from '../components/calendar/DayView'

export default function Calendar() {
  const [searchParams] = useSearchParams()
  const authError = searchParams.get('error')

  const {
    isConnected, events, isSyncing,
    view, setView,
    currentDate, setCurrentDate,
    sync, navigate,
  } = useCalendar()

  if (isConnected === null) {
    return (
      <div className="p-6 md:p-8">
        <p className="font-mono text-sm text-muted-foreground">LOADING...</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="p-6 md:p-8">
        {authError && (
          <p className="mb-4 text-sm text-muted-foreground border border-border px-3 py-2">
            Google access was denied. You can try again when ready.
          </p>
        )}
        <ConnectPrompt />
      </div>
    )
  }

  const weekDays = getWeekDays(currentDate)

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <h1 className="font-display font-bold text-3xl tracking-[-0.05em] text-foreground mb-4">
        CALENDAR
      </h1>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        isSyncing={isSyncing}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={() => setCurrentDate(new Date())}
        onViewChange={setView}
        onSync={sync}
      />
      <div className="overflow-x-auto">
        {view === 'week' ? (
          <WeekView days={weekDays} events={events} />
        ) : (
          <DayView date={currentDate} events={events} />
        )}
      </div>
    </div>
  )
}
