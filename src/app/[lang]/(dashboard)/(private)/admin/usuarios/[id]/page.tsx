// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import { i18n } from '@configs/i18n'

// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import UserView from '@/views/apps/user/view'

// Server Action Imports
import { getUserById } from '@/app/server/adminActions'

const UserViewPage = async (props: { params: Promise<{ lang: string; id: string }> }) => {
  const params = await props.params
  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  const user = await getUserById(params.id)

  return (
    <AdminGuard locale={lang}>
      <UserView user={user} />
    </AdminGuard>
  )
}

export default UserViewPage
