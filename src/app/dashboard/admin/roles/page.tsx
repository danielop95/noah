// Component Imports
import PermissionGuard from '@/hocs/PermissionGuard'
import RolesView from '@/views/admin/roles'

// Server Action Imports
import { getAllRoles, getAllPermissions } from '@/app/server/roleActions'

export const metadata = {
  title: 'Roles y Permisos - Casa del Rey',
  description: 'Gestiona los roles y permisos de tu organizacion'
}

const RolesPage = async () => {
  const [roles, permissions] = await Promise.all([getAllRoles(), getAllPermissions()])

  return (
    <PermissionGuard permission='roles.ver'>
      <RolesView roles={roles} permissions={permissions} />
    </PermissionGuard>
  )
}

export default RolesPage
