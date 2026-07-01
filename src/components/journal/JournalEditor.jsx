import { useState } from 'react'
import { VoiceInput } from './VoiceInput'
import { MoodRating } from './MoodRating'
import { GuidedQA } from './GuidedQA'

export function JournalEditor({ date, entry, onSave, onCancel }) {
  const [mode, setMode] = useState('free')
  const [content, setContent] = useState(entry?.content || '')
  const [mood, setMood] = useState(entry?.mood || null)
  const [energy, setEnergy] = useState(entry?.energy || null)
  const [saving, setSaving] = useState(false)

  function handleTranscript(text) {
    setContent(prev => (prev ? prev + ' ' : '') + text.trim())
  }

  function handleGuidedComplete(formatted) {
    setContent(formatted)
    setMode('free')
  }

  async function handleSave() {
    setSaving(true)
    await onSave(date, { content, mood, energy })
    setSaving(false)
  }

  return (
    <div className="border border-border p-5">
      <div className="flex items-center gap-0 mb-5 border-b border-border">
        {['free', 'guided'].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-mono transition-colors duration-150 ${
              mode === m
                ? 'text-foreground border-b-2 border-accent -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m === 'free' ? 'Free Write' : 'Guided Q&A'}
          </button>
        ))}
      </div>

      {mode === 'free' ? (
        <div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind..."
            rows={8}
            className="w-full bg-transparent border-none text-sm text-foreground placeholder-muted-foreground outline-none resize-none leading-relaxed"
            autoFocus
          />
          <div className="mt-3">
            <VoiceInput onTranscript={handleTranscript} />
          </div>
        </div>
      ) : (
        <GuidedQA onComplete={handleGuidedComplete} />
      )}

      <div className="mt-6 pt-5 border-t border-border">
        <MoodRating
          mood={mood}
          energy={energy}
          onChange={({ mood: m, energy: e }) => { setMood(m); setEnergy(e) }}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || (!content.trim() && !mood && !energy)}
          className="px-5 py-2 bg-accent text-accent-foreground text-xs font-mono uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : entry ? 'Update' : 'Save Entry'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
