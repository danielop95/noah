// Next Imports
import type { Metadata } from 'next'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import { i18n } from '@configs/i18n'

// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import ConfiguracionView from '@/views/admin/Configuracion'

export const metadata: Metadata = {
  title: 'Configuracion - Noah',
  description: 'Configura tu iglesia en Noah'
}

type Props = {
  params: Promise<{ lang: string }>
}

const ConfiguracionPage = async ({ params }: Props) => {
  const { lang } = await params
  const locale: Locale = i18n.locales.includes(lang as Locale) ? (lang as Locale) : i18n.defaultLocale

  return (
    <AdminGuard locale={locale}>
      <ConfiguracionView />
    </AdminGuard>
  )
}

export default ConfiguracionPage
