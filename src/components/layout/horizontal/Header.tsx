'use client'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'

// Component Imports
import Navigation from './Navigation'
import NavbarContent from './NavbarContent'
import Navbar from '@layouts/components/horizontal/Navbar'
import LayoutHeader from '@layouts/components/horizontal/Header'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

type HeaderProps = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  userHierarchy?: number
}

const Header = ({ dictionary, userHierarchy }: HeaderProps) => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <>
      <LayoutHeader>
        <Navbar>
          <NavbarContent />
        </Navbar>
        {!isBreakpointReached && <Navigation dictionary={dictionary} userHierarchy={userHierarchy} />}
      </LayoutHeader>
      {isBreakpointReached && <Navigation dictionary={dictionary} userHierarchy={userHierarchy} />}
    </>
  )
}

export default Header
