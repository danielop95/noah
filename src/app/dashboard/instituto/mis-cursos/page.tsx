import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/libs/auth'
import MisCursosView from '@/views/instituto/mis-cursos'
import { getEnrollmentsByUser, getAllCourses } from '@/app/server/institutoActions'

export const metadata = { title: 'Mis Cursos — Instituto Life' }

const MisCursosPage = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [myEnrollments, courses] = await Promise.all([
    getEnrollmentsByUser(session.user.id),
    getAllCourses()
  ])

  return <MisCursosView myEnrollments={myEnrollments} courses={courses} userId={session.user.id} />
}

export default MisCursosPage
