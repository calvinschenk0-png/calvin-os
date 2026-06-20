const variants = {
  primary: 'bg-accent text-accent-foreground hover:opacity-90',
  secondary: 'bg-muted text-foreground border border-border hover:bg-border',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-150 ease-sharp ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
