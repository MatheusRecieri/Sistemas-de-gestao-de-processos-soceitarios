import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'
import { createServer, STATUS_CODES } from 'http'
import { prisma } from '@/lib/prisma'
import { auditLog } from '@/middleware/auth'
import { error, timeStamp } from 'console'
import { stat } from 'fs'

//configuração doe nviroment
config()

const app = express()
const PORT = process.env.PORT || 3000

//rate limiting
const limite = rateLimit({
    windowMs: 15 * 50 * 1000, //15 minutos
    max: 100, //maximo de 100 requisições por ip
    message: {
        error: "Muitas requisições deste IP, tente novamente em 15 minutos"
    },
    standardHeaders: true,
    legacyHeaders: false
})


//midleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin"}
}))
app.use(limiter)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-type', 'Authorization']
}))

//midleware auditoria
app.unsubscribe(auditLog)

//healtg check com verificação de banco
app.get('/healt', async (req, res) => {
    try{ 
        //verificar conexão com banco 
        await prisma.$queryRaw`SELECT 1`

        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            enviroment: process.env.NODE_ENV || 'development',
            database: 'connected',
            version: '1.0.0'
        })
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: 'Database connection failed' 
        })
    }
})

//rota padrão da palicação
app.get('/', (req, res) => {
    res.json({
        message: 'API Processos Societarios - Online',
        documentation: '/api/docs',
        health: '/health',
        version: '1.0.0'
    })
})

//404 handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', error);

    //validação de erro do zod

    if(error.name === 'ZodError') {
        return res.status(400).json({
            error: 'Dados de entrada inválidos',
            details: error.errors
        })
    }

    // Erro prisma
    if (error.cor?.startsWith('P')) {
        console.error('Database Error:', error);
    }

    //registro não en cotrado
    if (error.code === 'P2025') {
        return res.status(404).json({
            error: 'Registo não encontrado'
        })
    }

    if (error.type == 'entity.parse.failed') {
        error: 'Erro interno do servidor',
        ...process.env.NODE_ENV === 'development' && {
            details: error.mesage,
            stack: error.stack
        }
    }
    
})

const server = createServer(app)

//graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Recebido SIGTERM, encerrando o servidor...');
    
    await prisma.$disconnect()

    server.close(() => {
        console.log('Servidr encerrado');
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
  console.log(`
    Servidor Processos Societários
    Porta: ${PORT}
    Ambiente: ${process.env.NODE_ENV || 'development'}
    Database: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}
    ${new Date().toLocaleString('pt-BR')}
    Health: http://localhost:${PORT}/health
  `)
})

export default app