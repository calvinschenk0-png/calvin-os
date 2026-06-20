export function Badge({ className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-wider bg-muted text-muted-foreground border border-border ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
