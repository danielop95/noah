import { redirect } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import SolicitudFormView from '@/views/solicitudes/SolicitudFormView'
import { getAreasForSelect } from '@/app/server/areasActions'
import { getMyContactDefaults } from '@/app/server/solicitudesActions'

export const metadata = {
  title: 'Nueva Solicitud - Noah'
}

const NuevaSolicitudPage = async () => {
  const [areas, defaults] = await Promise.all([
    getAreasForSelect().catch(() => []),
    getMyContactDefaults().catch(() => ({ cargoRol: null, telefonoContacto: null, emailContacto: null }))
  ])

  if (areas.length === 0) {
    redirect('/dashboard/solicitudes')
  }

  return (
    <PermissionGuard permission='solicitudes.crear'>
      <SolicitudFormView mode='create' areas={areas} defaults={defaults} />
    </PermissionGuard>
  )
}

export default NuevaSolicitudPage
