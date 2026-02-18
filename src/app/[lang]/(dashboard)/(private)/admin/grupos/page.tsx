// Type Imports
import type { Locale } from '@configs/i18n'
import { i18n } from '@configs/i18n'

// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import GruposView from '@/views/admin/grupos'

// Server Action Imports
import { getAllGroups, getNetworksForGroups } from '@/app/server/groupActions'

export const metadata = {
  title: 'Grupos - Noah',
  description: 'Gestiona los grupos de tu iglesia'
}

const GruposPage = async (props: { params: Promise<{ lang: string }> }) => {
  const params = await props.params

  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  const [groups, networks] = await Promise.all([getAllGroups(), getNetworksForGroups()])

  return (
    <AdminGuard locale={lang}>
      <GruposView groups={groups} networks={networks} />
    </AdminGuard>
  )
}

export default GruposPage
