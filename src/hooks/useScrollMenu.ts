'use client'

import { useRef, useCallback, type RefObject, type UIEvent } from 'react'

// ScrollContainer can be:
// - HTMLElement (from PerfectScrollbar)
// - UIEvent (from native scroll)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScrollContainer = HTMLElement | UIEvent<HTMLElement> | any

/**
 * Hook for handling scroll shadow visibility in navigation menus
 * @param isBreakpointReached - Whether the breakpoint is reached (mobile view)
 * @returns Object with shadowRef and scrollMenu handler
 */
export function useScrollMenu(isBreakpointReached?: boolean): {
  shadowRef: RefObject<HTMLDivElement | null>
  scrollMenu: (container: ScrollContainer, isPerfectScrollbar: boolean) => void
} {
  const shadowRef = useRef<HTMLDivElement>(null)
  const breakpointReached = isBreakpointReached ?? false

  const scrollMenu = useCallback(
    (container: ScrollContainer, isPerfectScrollbar: boolean) => {
      // For native scroll events, get target from event. For PerfectScrollbar, use container directly
      const element = breakpointReached || !isPerfectScrollbar
        ? (container as UIEvent<HTMLElement>).target as HTMLElement
        : (container as HTMLElement)

      if (shadowRef.current && element?.scrollTop > 0) {
        if (!shadowRef.current.classList.contains('scrolled')) {
          shadowRef.current.classList.add('scrolled')
        }
      } else if (shadowRef.current) {
        shadowRef.current.classList.remove('scrolled')
      }
    },
    [breakpointReached]
  )

  return { shadowRef, scrollMenu }
}

export default useScrollMenu
