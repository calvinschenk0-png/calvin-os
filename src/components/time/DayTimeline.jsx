import { useEffect, useState, useMemo } from 'react'
import { useTimeBlocks } from '../../hooks/useTimeBlocks'
import { TimelineBlock } from './TimelineBlock'
import { BlockEnrichment } from './BlockEnrichment'
import { GapBlock } from './GapBlock'
import { computeGaps } from './utils'

export function DayTimeline({ date, categories }) {
  const { blocks, isLoading, seedFromCalendar, createBlock, updateBlock, deleteBlock } = useTimeBlocks(date)
  const [openBlockId, setOpenBlockId] = useState(null)

  useEffect(() => {
    seedFromCalendar()
    setOpenBlockId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const categoryMap = useMemo(() => {
    const m = {}
    categories.forEach(c => { m[c.id] = c })
    return m
  }, [categories])

  const gaps = useMemo(() => computeGaps(blocks, date), [blocks, date])

  const items = useMemo(() => {
    const merged = [
      ...blocks.map(b => ({ type: 'block', data: b, sortKey: b.started_at })),
      ...gaps.map(g => ({ type: 'gap', data: g, sortKey: g.start })),
    ]
    return merged.sort((a, b) => new Date(a.sortKey) - new Date(b.sortKey))
  }, [blocks, gaps])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading timeline…</p>
  }

  return (
    <div>
      {items.map(({ type, data }) =>
        type === 'block' ? (
          <div key={data.id}>
            <TimelineBlock
              block={data}
              category={categoryMap[data.primary_category_id]}
              isOpen={openBlockId === data.id}
              onClick={() => setOpenBlockId(openBlockId === data.id ? null : data.id)}
            />
            {openBlockId === data.id && (
              <BlockEnrichment
                block={data}
                categories={categories}
                onSave={async (updates) => {
                  await updateBlock(data.id, updates)
                  setOpenBlockId(null)
                }}
                onDelete={
                  !data.google_calendar_event_id
                    ? async () => {
                        await deleteBlock(data.id)
                        setOpenBlockId(null)
                      }
                    : undefined
                }
              />
            )}
          </div>
        ) : (
          <GapBlock key={data.id} gap={data} categories={categories} onAdd={createBlock} />
        )
      )}
    </div>
  )
}
