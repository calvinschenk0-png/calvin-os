import { useState, useEffect } from 'react'
import { Volume2, ChevronRight } from 'lucide-react'
import { VoiceInput } from './VoiceInput'

const PROMPTS = [
  "What are your top wins from today?",
  "What was your biggest challenge or frustration?",
  "What would you do differently?",
  "What are you most grateful for today?",
  "What's one thing to carry into tomorrow?",
]

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  window.speechSynthesis.speak(u)
}

export function GuidedQA({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(PROMPTS.length).fill(''))

  const question = PROMPTS[index]
  const answer = answers[index]
  const isLast = index === PROMPTS.length - 1

  function handleTranscript(text) {
    setAnswers(prev => {
      const next = [...prev]
      next[index] = (next[index] ? next[index] + ' ' : '') + text.trim()
      return next
    })
  }

  function handleNext() {
    if (isLast) {
      const formatted = PROMPTS.map((q, i) => `**${q}**\n${answers[i] || '—'}`).join('\n\n')
      onComplete(formatted)
    } else {
      setIndex(i => i + 1)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {index + 1} / {PROMPTS.length}
        </span>
        <button
          type="button"
          onClick={() => speak(question)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Read aloud"
        >
          <Volume2 size={13} strokeWidth={1.5} />
        </button>
      </div>

      <p className="text-base text-foreground mb-4 leading-relaxed">{question}</p>

      <textarea
        value={answer}
        onChange={e => setAnswers(prev => { const n = [...prev]; n[index] = e.target.value; return n })}
        placeholder="Answer here or use Dictate..."
        rows={4}
        className="w-full bg-muted border border-border text-sm text-foreground placeholder-muted-foreground p-3 outline-none focus:border-accent transition-colors duration-150 resize-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <VoiceInput onTranscript={handleTranscript} />
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground text-xs font-mono uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          {isLast ? 'Finish' : 'Next'}
          <ChevronRight size={13} strokeWidth={2} />
        </button>
      </div>

      <div className="flex gap-1 mt-4">
        {PROMPTS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-0.5 flex-1 transition-colors duration-150 ${i === index ? 'bg-accent' : i < index ? 'bg-foreground' : 'bg-border'}`}
          />
        ))}
      </div>
    </div>
  )
}
