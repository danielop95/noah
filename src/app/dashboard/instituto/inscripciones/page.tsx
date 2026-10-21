import PermissionGuard from '@/hocs/PermissionGuard'
import InscripcionesView from '@/views/instituto/inscripciones'
import { getPendingEnrollments } from '@/app/server/institutoActions'

export const metadata = { title: 'Inscripciones — Instituto Life' }

async function PageContent() {
  const pendingEnrollments = await getPendingEnrollments()

  return <InscripcionesView pendingEnrollments={pendingEnrollments} />
}

export default function InscripcionesPage() {
  return (
    <PermissionGuard permission='instituto.gestionar'>
      <PageContent />
    </PermissionGuard>
  )
}
