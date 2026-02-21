// Type Imports
import type { ChildrenType, Direction } from '@core/types'
import type { TenantBranding } from '@/services/organizationService'
import type { Locale } from '@configs/i18n'

// Context Imports
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import { TenantProvider } from '@/contexts/TenantContext'
import { LocaleProvider } from '@/contexts/LocaleContext'
import ThemeProvider from '@components/theme'
// Styled Component Imports
import AppReactToastify from '@/libs/styles/AppReactToastify'

// Util Imports
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
  tenantBranding?: TenantBranding | null
  initialLocale?: Locale
}

const Providers = async (props: Props) => {
  // Props
  const { children, direction, tenantBranding, initialLocale } = props

  // Extraer color primario del branding del tenant
  const tenantPrimaryColor = tenantBranding?.colors?.primary || null

  // Vars
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()

  return (
    <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
      <LocaleProvider initialLocale={initialLocale}>
        <TenantProvider tenant={tenantBranding || null}>
          <VerticalNavProvider>
            <SettingsProvider settingsCookie={settingsCookie} mode={mode} tenantPrimaryColor={tenantPrimaryColor}>
              <ThemeProvider direction={direction} systemMode={systemMode}>
                {children}
                <AppReactToastify direction={direction} hideProgressBar />
              </ThemeProvider>
            </SettingsProvider>
          </VerticalNavProvider>
        </TenantProvider>
      </LocaleProvider>
    </NextAuthProvider>
  )
}

export default Providers
