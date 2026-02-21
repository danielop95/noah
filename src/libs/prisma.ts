import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ ERROR: DATABASE_URL is not defined in Vercel Environment Variables')
    }
  }

  try {
    const pool = new Pool({
      connectionString: connectionString || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    })

    const adapter = new PrismaPg(pool)

    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('❌ Failed to initialize Prisma Client:', error)
    return new PrismaClient() // Fallback a cliente estándar para evitar crashes totales
  }
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
