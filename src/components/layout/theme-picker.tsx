import { IconChevronDown } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { themes, useTheme } from './theme-provider'
import type { Theme } from './theme-provider'

/** Three dots in the scheme's own hero, story and buy colours, whatever scheme is active. */
function Swatch({ theme }: { theme: Theme }) {
  return (
    <span data-theme-swatch={theme} className="flex shrink-0 *:not-first:-ml-1.5" aria-hidden>
      {['bg-[var(--hero)]', 'bg-[var(--story)]', 'bg-[var(--buy)]'].map((color) => (
        <span key={color} className={`size-4 rounded-full border-2 border-[var(--ledge)] ${color}`} />
      ))}
    </span>
  )
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  const current = themes.find((t) => t.value === theme) ?? themes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" aria-label={`Theme: ${current.label}`} />}>
        <Swatch theme={current.value} />
        <span className="hidden md:inline">{current.label}</span>
        <IconChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Pick a flavor!</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
            {themes.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="font-bold">
                <Swatch theme={option.value} />
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
