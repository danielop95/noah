// Type Imports
import type { Locale } from '@configs/i18n'
import { i18n } from '@configs/i18n'

// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import RedesView from '@/views/admin/redes'

// Server Action Imports
import { getAllNetworks, getOrganizationUsers } from '@/app/server/networkActions'

export const metadata = {
  title: 'Redes - Noah',
  description: 'Gestiona las redes de tu iglesia'
}

const RedesPage = async (props: { params: Promise<{ lang: string }> }) => {
  const params = await props.params

  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  const [networks, users] = await Promise.all([getAllNetworks(), getOrganizationUsers()])

  return (
    <AdminGuard locale={lang}>
      <RedesView networks={networks} users={users} />
    </AdminGuard>
  )
}

export default RedesPage
