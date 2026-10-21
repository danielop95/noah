import { notFound, redirect } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import SolicitudFormView from '@/views/solicitudes/SolicitudFormView'
import { getSolicitudById, getMyContactDefaults } from '@/app/server/solicitudesActions'
import { getAreasForSelect } from '@/app/server/areasActions'

type Props = {
  params: Promise<{ id: string }>
}

const EditarSolicitudPage = async ({ params }: Props) => {
  const { id } = await params

  let solicitud

  try {
    solicitud = await getSolicitudById(id)
  } catch {
    notFound()
  }

  if (!solicitud.permissions.canEdit) {
    redirect(`/dashboard/solicitudes/${id}`)
  }

  const [areas, defaults] = await Promise.all([getAreasForSelect(), getMyContactDefaults()])

  return (
    <PermissionGuard permission='solicitudes.editarPropia'>
      <SolicitudFormView mode='edit' areas={areas} defaults={defaults} solicitud={solicitud} />
    </PermissionGuard>
  )
}

export default EditarSolicitudPage
