import PermissionGuard from '@/hocs/PermissionGuard'
import CursosView from '@/views/instituto/cursos'
import { getAllCourses } from '@/app/server/institutoActions'

export const metadata = { title: 'Cursos — Instituto Life' }

async function PageContent() {
  const courses = await getAllCourses()

  return <CursosView courses={courses} />
}

export default function CursosPage() {
  return (
    <PermissionGuard permission='instituto.ver'>
      <PageContent />
    </PermissionGuard>
  )
}
