import { Prisma, PrismaClient } from '@prisma/client'

//previne múltiplas instâncias do Prisma client em desenvolvimento
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

//tipos uteis para re-exportação
export type { Prisma } from "@prisma/client"