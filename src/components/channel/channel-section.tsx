import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { ChannelRow } from '@/lib/catalog/types'
import { ChannelCard } from './channel-card'

export function ChannelSection({
  title,
  channels,
  action,
}: {
  title: string
  channels: ChannelRow[]
  action?: ReactNode
}) {
  if (channels.length === 0) return null
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {action}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </section>
  )
}

export function ViewAll({ to }: { to: '/favorites' | '/history' }) {
  return (
    <Button variant="ghost" size="sm" nativeButton={false} render={<Link to={to} />}>
      View all
    </Button>
  )
}
