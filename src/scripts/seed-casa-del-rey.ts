import prisma from '../libs/prisma'

async function main() {
  console.log('Seeding Casa del Rey organization...')

  // Upsert organization
  const org = await prisma.organization.upsert({
    where: { slug: 'casadelrey' },
    update: {
      name: 'Casa del Rey',
      colors: { primary: '#1976d2', secondary: '#dc004e' }
    },
    create: {
      name: 'Casa del Rey',
      slug: 'casadelrey',
      colors: { primary: '#1976d2', secondary: '#dc004e' }
    }
  })

  console.log(`Organization created/updated: ${org.name} (${org.id})`)

  // Assign admin user to this organization
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@noah.app' }
  })

  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { organizationId: org.id }
    })

    console.log(`Admin user assigned to ${org.name}`)
  } else {
    console.log('Admin user (admin@noah.app) not found - skipping assignment')
  }

  // Assign all existing users without organization to Casa del Rey
  const updated = await prisma.user.updateMany({
    where: { organizationId: null },
    data: { organizationId: org.id }
  })

  if (updated.count > 0) {
    console.log(`${updated.count} users without organization assigned to ${org.name}`)
  }

  console.log('Seed complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
