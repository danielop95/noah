import { notFound, redirect } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import InformeFormView from '@/views/solicitudes/InformeFormView'
import { getSolicitudById } from '@/app/server/solicitudesActions'

type Props = {
  params: Promise<{ id: string }>
}

const InformePage = async ({ params }: Props) => {
  const { id } = await params

  let solicitud

  try {
    solicitud = await getSolicitudById(id)
  } catch {
    notFound()
  }

  const canCreate = solicitud.permissions.canCreateInforme
  const canEdit = solicitud.permissions.canEditInforme
  const isViewer = !!solicitud.informe && !canEdit

  if (!canCreate && !canEdit && !isViewer) {
    redirect(`/dashboard/solicitudes/${id}`)
  }

  const mode: 'create' | 'edit' | 'view' = canCreate ? 'create' : canEdit ? 'edit' : 'view'

  return (
    <PermissionGuard permission='solicitudes.ver'>
      <InformeFormView solicitud={solicitud} mode={mode} />
    </PermissionGuard>
  )
}

export default InformePage
