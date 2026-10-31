import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite, useFavorites } from '@/stores/favorites'

export function FavoriteButton({
  channelId,
  size = 'icon-sm',
  variant = 'ghost',
}: {
  channelId: string
  size?: 'icon-sm' | 'icon' | 'icon-lg'
  variant?: 'ghost' | 'outline'
}) {
  const isFavorite = useFavorites((s) => s.ids.has(channelId))

  return (
    <Button
      variant={variant}
      size={size}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
      onClick={() => void toggleFavorite(channelId)}
    >
      {isFavorite ? <IconHeartFilled className="text-destructive" /> : <IconHeart />}
    </Button>
  )
}
