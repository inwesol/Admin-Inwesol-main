'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

export function ThemeMenuRadioGroup(): JSX.Element {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup
        value={mounted ? (theme ?? 'system') : 'system'}
        onValueChange={setTheme}
      >
        <DropdownMenuRadioItem value="light" className="cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark" className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system" className="cursor-pointer">
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>
  )
}
