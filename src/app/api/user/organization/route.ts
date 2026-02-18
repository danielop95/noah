import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { organizationId } = session.user

    if (!organizationId) {
      return NextResponse.json({ organization: null })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error fetching user organization:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
