import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ChannelRow } from '@/lib/catalog/types'
import { ChannelCard } from './channel-card'
import { ChannelListItem } from './channel-list-item'

const GAP = 12
const CARD_MIN_WIDTH = 200
const CARD_HEIGHT = 176
const ROW_HEIGHT = 64

/** Renders thousands of channels by only mounting the rows near the viewport. */
export function ChannelGrid({
  channels,
  view,
}: {
  channels: ChannelRow[]
  view: 'grid' | 'list'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [offset, setOffset] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      setWidth(element.clientWidth)
      setOffset(element.getBoundingClientRect().top + window.scrollY)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const columns =
    view === 'list' ? 1 : Math.max(1, Math.floor((width + GAP) / (CARD_MIN_WIDTH + GAP)))
  const rowCount = Math.ceil(channels.length / columns)
  const rowSize = (view === 'list' ? ROW_HEIGHT : CARD_HEIGHT) + GAP

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowSize,
    overscan: 4,
    scrollMargin: offset,
  })

  return (
    <div ref={ref}>
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            className="absolute inset-x-0 top-0 grid"
            style={{
              height: rowSize - GAP,
              transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
              gap: GAP,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {channels.slice(row.index * columns, row.index * columns + columns).map((channel) =>
              view === 'list' ? (
                <ChannelListItem key={channel.id} channel={channel} />
              ) : (
                <ChannelCard key={channel.id} channel={channel} />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
