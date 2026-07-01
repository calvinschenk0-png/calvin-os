import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export function VoiceInput({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    return () => { recognitionRef.current?.stop() }
  }, [])

  if (!SpeechRecognition) {
    return (
      <span className="text-xs font-mono text-muted-foreground">
        Voice not supported in this browser
      </span>
    )
  }

  function start() {
    const r = new SpeechRecognition()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'

    r.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) finalText += t
        else interimText += t
      }
      if (finalText) onTranscript(finalText)
      setInterim(interimText)
    }

    r.onend = () => {
      setIsListening(false)
      setInterim('')
    }

    r.onerror = (e) => {
      if (e.error !== 'aborted') console.error('SpeechRecognition:', e.error)
      setIsListening(false)
      setInterim('')
    }

    recognitionRef.current = r
    r.start()
    setIsListening(true)
  }

  function stop() {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterim('')
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={isListening ? stop : start}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-mono uppercase tracking-widest transition-colors duration-150 ${
          isListening
            ? 'border-accent text-accent'
            : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {isListening
          ? <MicOff size={13} strokeWidth={1.5} />
          : <Mic size={13} strokeWidth={1.5} />
        }
        {isListening ? 'Stop' : 'Dictate'}
      </button>
      {interim && (
        <span className="text-xs text-muted-foreground italic truncate max-w-xs">
          {interim}
        </span>
      )}
    </div>
  )
}
