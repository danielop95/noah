import { notFound } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import SolicitudDetailView from '@/views/solicitudes/SolicitudDetailView'
import { getSolicitudById } from '@/app/server/solicitudesActions'

type Props = {
  params: Promise<{ id: string }>
}

const SolicitudDetailPage = async ({ params }: Props) => {
  const { id } = await params

  let solicitud

  try {
    solicitud = await getSolicitudById(id)
  } catch {
    notFound()
  }

  return (
    <PermissionGuard permission='solicitudes.ver'>
      <SolicitudDetailView solicitud={solicitud} />
    </PermissionGuard>
  )
}

export default SolicitudDetailPage
