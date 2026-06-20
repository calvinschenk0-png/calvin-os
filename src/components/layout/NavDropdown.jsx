import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export function NavDropdown({ items, isOpen, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, onClose])

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 mt-0 w-44 bg-card border border-border transition-all duration-150 ease-sharp z-50 ${
        isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-1 pointer-events-none'
      }`}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          onClick={onClose}
          className="block px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
