export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-card border border-border p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
