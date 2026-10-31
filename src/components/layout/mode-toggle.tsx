import { IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './theme-provider'

export function ModeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
      <IconSun className="dark:hidden" />
      <IconMoon className="hidden dark:block" />
    </Button>
  )
}
