import PermissionGuard from '@/hocs/PermissionGuard'
import CursosView from '@/views/instituto/cursos'
import { getAllCourses } from '@/app/server/institutoActions'

export const metadata = {
  title: 'Cursos — Instituto Life'
}

const CursosPage = async () => {
  const courses = await getAllCourses()

  return (
    <PermissionGuard permission='instituto.crear'>
      <CursosView courses={courses} />
    </PermissionGuard>
  )
}

export default CursosPage
