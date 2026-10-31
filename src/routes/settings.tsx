import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import { db } from '@/lib/catalog/db'
import { startSync } from '@/lib/catalog/sync'
import { proxyAvailable } from '@/lib/streams/resolve'
import { exportUserData, importUserData } from '@/lib/user-data'
import { usePreferences } from '@/stores/preferences'
import { useSyncStore } from '@/stores/sync'

export const Route = createFileRoute('/settings')({
  head: () => ({ meta: [{ title: 'Settings · WarpTV' }] }),
  component: Settings,
})

function Settings() {
  const queryClient = useQueryClient()
  const { hideNsfw, autoplay, useProxy, set } = usePreferences()
  const syncing = useSyncStore((s) => s.syncing)
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="autoplay">Autoplay</FieldLabel>
                <FieldDescription>Start playing as soon as you open a channel.</FieldDescription>
              </FieldContent>
              <Switch id="autoplay" checked={autoplay} onCheckedChange={(autoplay) => set({ autoplay })} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="nsfw">Hide adult channels</FieldLabel>
                <FieldDescription>Removes 18+ channels from browsing and search.</FieldDescription>
              </FieldContent>
              <Switch id="nsfw" checked={hideNsfw} onCheckedChange={(hideNsfw) => set({ hideNsfw })} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="proxy">Use stream proxy</FieldLabel>
                <FieldDescription>
                  {proxyAvailable
                    ? 'Plays http streams and streams that need special headers through this site’s server.'
                    : 'Not available, this deployment has no server proxy.'}
                </FieldDescription>
              </FieldContent>
              <Switch
                id="proxy"
                checked={proxyAvailable && useProxy}
                disabled={!proxyAvailable}
                onCheckedChange={(useProxy) => set({ useProxy })}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>Everything is stored in this browser. Nothing is sent to a server.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={syncing}
            onClick={() => startSync(queryClient, { force: true })}
          >
            {syncing ? 'Syncing…' : 'Re-download catalog'}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await db.streamHealth.clear()
              toast.add({ type: 'success', title: 'Stream health reset' })
            }}
          >
            Reset stream health
          </Button>
          <Button variant="outline" onClick={() => void exportUserData()}>
            Export favorites &amp; history
          </Button>
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            Import
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              try {
                const { favorites, history } = await importUserData(file)
                toast.add({
                  type: 'success',
                  title: 'Imported',
                  description: `${favorites} favorites and ${history} history entries.`,
                })
              } catch (error) {
                toast.add({
                  type: 'error',
                  title: 'Import failed',
                  description: error instanceof Error ? error.message : 'Unknown error',
                })
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
