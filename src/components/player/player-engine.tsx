import { LiveVideoPlayer } from '@videojs/react/live-video'
import { HlsJsVideo } from '@videojs/react/media/hlsjs-video'
import { useEffect, useRef } from 'react'
import { LiveVideoSkin } from '@/components/videojs/live-video/skin'
import { toast } from '@/components/ui/toast'
import { markFailed, markOk, recordWatch } from '@/lib/streams/health'
import { usePlayerStore } from '@/stores/player'
import { usePreferences } from '@/stores/preferences'

/** How long a stream may go without any data before it counts as dead. */
const STALL_MS = 20_000

export function PlayerEngine() {
  const channel = usePlayerStore((s) => s.channel)
  const candidate = usePlayerStore((s) => s.candidates[s.index])
  const autoplay = usePreferences((s) => s.autoplay)
  const ref = useRef<HTMLVideoElement>(null)

  const url = candidate?.stream.url
  const src = candidate?.src

  useEffect(() => {
    const video = ref.current
    if (!video || !url || !channel) return
    const { setStatus, next } = usePlayerStore.getState()
    let loaded = false
    let failed = false

    const fail = (reason: string) => {
      if (failed) return
      failed = true
      void markFailed(url, reason)
      const hasNext = next(reason)
      toast.add({
        type: 'error',
        title: 'Stream failed',
        description: hasNext ? 'Trying the next stream for this channel…' : 'No other streams to try.',
      })
    }

    const stall = setTimeout(() => {
      if (!loaded && video.readyState < 2) fail('No data received')
    }, STALL_MS)
    const onLoaded = () => {
      loaded = true
    }
    const onPlaying = () => {
      loaded = true
      clearTimeout(stall)
      setStatus('playing')
      void markOk(url)
      void recordWatch(channel.id, url)
    }
    const onError = () => fail(video.error?.message || 'Playback error')

    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('playing', onPlaying, { once: true })
    video.addEventListener('error', onError)
    return () => {
      clearTimeout(stall)
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
    }
  }, [channel, url])

  if (!candidate) return null

  return (
    <LiveVideoPlayer>
      <LiveVideoSkin className="aspect-video w-full">
        <HlsJsVideo ref={ref} src={src} autoPlay={autoplay} playsInline preload="auto" />
      </LiveVideoSkin>
    </LiveVideoPlayer>
  )
}
