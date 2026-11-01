import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BandTone = 'hero' | 'story' | 'club' | 'shop' | 'specs' | 'pop'

/**
 * A full-bleed flat colour band. Bands butt against each other with no rule between them,
 * the colour change is the divider, and every component inside picks up the band's ink and
 * button colours through `data-band`. The sticky header repaints to whichever band is under it.
 */
export function Band({
  tone,
  className,
  children,
}: {
  tone: BandTone
  className?: string
  children: ReactNode
}) {
  return (
    <section data-band={tone} className="bg-background px-4 py-12 text-foreground md:px-10 md:py-20">
      <div className={cn('mx-auto flex w-full max-w-6xl flex-col gap-8', className)}>{children}</div>
    </section>
  )
}

/** A band's heading: 2–3 words, 800 weight, ending in a full stop. */
export function BandHeading({
  title,
  children,
  action,
  as: Heading = 'h2',
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading className="text-display text-balance">{title}</Heading>
        {action}
      </div>
      {children && <p className="max-w-3xl text-blurb text-pretty [&_b]:font-bold">{children}</p>}
    </div>
  )
}
