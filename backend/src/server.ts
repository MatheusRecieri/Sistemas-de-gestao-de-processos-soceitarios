import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'
import { createServer } from 'http'
import { prisma } from '@/lib/prisma.js'
// import { auditLog } from '@middleware/auth.ts'

// Configuração environment
config()

const app = express()
const PORT = process.env.PORT || 3000

// Rate Limiting
const limite = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(limite)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware de auditoria
// app.use(auditLog)

// Health Check com verificação do banco
app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com o banco
    await prisma.$queryRaw`SELECT 1`
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    })
  }
})

// Rota padrão
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Processos Societários - Online',
    documentation: '/api/docs',
    health: '/health',
    version: '1.0.0'
  })
})

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  })
})

// Error Handler global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error)
  
  // Erro de validação do Zod
  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      details: error.errors
    })
  }
  
  // Erro do Prisma
  if (error.code?.startsWith('P')) {
    console.error('Database Error:', error)
    
    // Violação de chave única
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Já existe um registro com esses dados'
      })
    }
    
    // Registro não encontrado
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro não encontrado'
      })
    }
  }
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON malformado'
    })
  }

  // Construir resposta de erro
  const errorResponse: any = {
    error: 'Erro interno do servidor'
  }

  // Adicionar detalhes apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = error.message
    errorResponse.stack = error.stack
  }

  res.status(500).json(errorResponse)
})

const server = createServer(app)

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...')
  
  // Fechar conexão com o banco
  await prisma.$disconnect()
  
  server.close(() => {
    console.log('✅ Servidor encerrado')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('✅ Servidor encerrado')
    process.exit(0)
  })
})

server.listen(PORT, () => {
  const databaseStatus = process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'
  const environment = process.env.NODE_ENV || 'development'
  
  console.log(`
🚀 Servidor Processos Societários
📍 Porta: ${PORT}
📊 Ambiente: ${environment}
🗄️  Database: ${databaseStatus}
🕐 ${new Date().toLocaleString('pt-BR')}
🔗 Health: http://localhost:${PORT}/health
  `)
})

export default app