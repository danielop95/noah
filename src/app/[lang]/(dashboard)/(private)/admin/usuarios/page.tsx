// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import { i18n } from '@configs/i18n'

// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import UserList from '@/views/apps/user/list'

// Server Action Imports
import { getAllUsers } from '@/app/server/adminActions'

const UsersPage = async (props: { params: Promise<{ lang: string }> }) => {
  const params = await props.params
  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  const users = await getAllUsers()

  return (
    <AdminGuard locale={lang}>
      <UserList users={users} />
    </AdminGuard>
  )
}

export default UsersPage
