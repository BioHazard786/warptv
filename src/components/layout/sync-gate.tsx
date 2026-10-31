import { IconAlertTriangle, IconDeviceTv } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { initCatalog, startSync } from '@/lib/catalog/sync'
import { watchFavorites } from '@/stores/favorites'
import { useSyncStore } from '@/stores/sync'

/**
 * Loads the catalog from IndexedDB, and downloads it on the first visit. Everything under
 * it can assume the catalog exists.
 */
export function SyncGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { initialized, hasData, progress, stage, error } = useSyncStore()

  useEffect(() => {
    void initCatalog(queryClient)
    return watchFavorites()
  }, [queryClient])

  if (hasData) return children

  return (
    <Empty className="min-h-[60vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">{initialized ? <IconDeviceTv /> : <Spinner />}</EmptyMedia>
        <EmptyTitle>{initialized ? 'Getting your channels ready' : 'Loading'}</EmptyTitle>
        <EmptyDescription>
          {initialized &&
            'WarpTV saves the iptv-org catalog on this device, so browsing and search work instantly and offline afterwards. This only happens once.'}
        </EmptyDescription>
      </EmptyHeader>
      {initialized && (
        <EmptyContent className="max-w-sm">
          {error ? (
            <>
              <Alert variant="destructive">
                <IconAlertTriangle />
                <AlertTitle>Couldn't download the catalog</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => startSync(queryClient)}>Try again</Button>
            </>
          ) : (
            <Progress value={progress} className="w-full">
              <ProgressLabel className="shimmer">{stage}</ProgressLabel>
              <ProgressValue />
            </Progress>
          )}
        </EmptyContent>
      )}
    </Empty>
  )
}
