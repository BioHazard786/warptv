import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

export function ChannelLogo({
  name,
  src,
  className,
}: {
  name: string
  src: string | null
  className?: string
}) {
  return (
    <Avatar className={cn('size-12 rounded-lg after:rounded-lg', className)}>
      {src && (
        <AvatarImage
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="rounded-lg object-contain p-1"
        />
      )}
      <AvatarFallback className="rounded-lg font-pixel text-xs">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
