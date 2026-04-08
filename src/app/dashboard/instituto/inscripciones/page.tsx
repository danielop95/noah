import PermissionGuard from '@/hocs/PermissionGuard'
import InscripcionesView from '@/views/instituto/inscripciones'
import { getPendingEnrollments } from '@/app/server/institutoActions'

export const metadata = { title: 'Inscripciones — Instituto Life' }

const InscripcionesPage = async () => {
  const pendingEnrollments = await getPendingEnrollments()

  return (
    <PermissionGuard permission='instituto.gestionar'>
      <InscripcionesView pendingEnrollments={pendingEnrollments} />
    </PermissionGuard>
  )
}

export default InscripcionesPage
