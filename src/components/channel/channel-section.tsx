import { IconArrowRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Band, BandHeading } from '@/components/layout/band'
import type { BandTone } from '@/components/layout/band'
import { Button } from '@/components/ui/button'
import type { ChannelRow } from '@/lib/catalog/types'
import { ChannelCard } from './channel-card'

/** A band of game cards with a short heading. Renders nothing when there's nothing to show. */
export function ChannelSection({
  title,
  tone,
  channels,
  action,
  children,
}: {
  title: string
  tone: BandTone
  channels: ChannelRow[]
  action?: ReactNode
  children?: ReactNode
}) {
  if (channels.length === 0) return null
  return (
    <Band tone={tone}>
      <BandHeading title={title} action={action}>
        {children}
      </BandHeading>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </Band>
  )
}

export function ViewAll({ to }: { to: '/favorites' | '/history' }) {
  return (
    <Button size="lg" nativeButton={false} render={<Link to={to} />}>
      See them all <IconArrowRight data-icon="inline-end" />
    </Button>
  )
}
