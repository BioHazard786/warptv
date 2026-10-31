import { useLayoutEffect, useRef } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { usePlayerStore } from '@/stores/player'

/**
 * Reserves the watch page's player area. The player itself lives in `PlayerHost` so it
 * survives navigation, this only tells the host where to draw it.
 */
export function PlayerSlot() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const { setSlot } = usePlayerStore.getState()
    let frame = 0
    let last = ''

    const update = () => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      const key = `${rect.left}|${rect.top}|${rect.width}|${rect.height}`
      if (key === last) return
      last = key
      setSlot({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    }
    // Scroll updates synchronously so the player doesn't trail the page, the frame
    // loop catches layout changes like the sidebar collapsing.
    const loop = () => {
      update()
      frame = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('scroll', update, { capture: true, passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update, { capture: true })
      setSlot(null)
    }
  }, [])

  return <AspectRatio ref={ref} ratio={16 / 9} className="w-full rounded-2xl bg-muted" />
}
