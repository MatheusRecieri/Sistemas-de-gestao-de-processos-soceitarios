import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@contabilidade.com' },
    update: {},
    create: {
      nomeCompleto: 'Administrador do Sistema',
      email: 'admin@contabilidade.com',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      senhaHash: adminPassword,
      tipoUsuario: 'ADMIN'
    }
  })

  console.log('✅ Seed concluído:')
  console.log(`   👤 Admin: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })