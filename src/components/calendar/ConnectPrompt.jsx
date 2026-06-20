export function ConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl tracking-[-0.04em] text-foreground mb-2">
          CALENDAR
        </h2>
        <p className="text-sm text-muted-foreground">
          Link your Google Calendar to see your events here.
        </p>
      </div>
      <a
        href="/api/auth/google"
        className="px-6 py-2.5 bg-accent text-accent-foreground text-sm font-medium tracking-wide transition-opacity duration-150 hover:opacity-90"
      >
        Connect Google Calendar
      </a>
    </div>
  )
}
