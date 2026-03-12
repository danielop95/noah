// Next Imports
import { Outfit } from 'next/font/google'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import Providers from '@components/Providers'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'
import { getLocaleFromCookie } from '@/utils/getDictionary'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit'
})

export const metadata = {
  title: 'Noah - Casa del Rey',
  description: 'Sistema de gestion eclesiástica de Casa del Rey.'
}

const RootLayout = async ({ children }: ChildrenType) => {
  const locale = await getLocaleFromCookie()
  const direction = i18n.langDirection[locale]
  const systemMode = await getSystemMode()

  return (
    <html id='__next' lang={locale} dir={direction} className={outfit.variable} suppressHydrationWarning>
      <body className={`${outfit.className} flex is-full min-bs-full flex-auto flex-col`}>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <Providers direction={direction} initialLocale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
