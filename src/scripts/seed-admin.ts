/**
 * Seed script to create the first admin user.
 * Run with: npx tsx src/scripts/seed-admin.ts
 */
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('DATABASE_URL or DIRECT_URL is required')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const email = 'admin@noah.app'
  const password = 'Admin2026!'
  const firstName = 'Admin'
  const lastName = 'Noah'

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    console.log(`Admin user already exists: ${email}`)
    await prisma.$disconnect()
    await pool.end()

    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role: 'admin',
      isActive: true
    }
  })

  console.log(`Admin user created successfully!`)
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${password}`)
  console.log(`  ID: ${user.id}`)

  await prisma.$disconnect()
  await pool.end()
}

main().catch(console.error)
