import { Request, Response, NextFunction } from 'express'
import { SecurityUtils } from '@/utils/security'
import { AuthRequest } from '@/types'
import { TokenPayload } from '@/types/auth'
import { ApiResponseHandler } from '@/utils/response'

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] //Bearer token

    if(!token) {
        return ApiResponseHandler.unauthorized(res, 'Token de acesso necessário')
    }

    try {
        const decoded = SecurityUtils.verifyToken(token)
        req.user = decoded
        next()
    } catch (error) {
        return ApiResponseHandler.unauthorized(res, 'Token inválido ou expirado')
    }

}

export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if(!req.user) {
            return ApiResponseHandler.unauthorized(res, 'Autenticação necessária')
        }

        if (!allowedRoles.includes(req.user.tipoUsuario)) {
            return ApiResponseHandler.forbidden(res, 'Permissões insuficientes')
        }

        next()
    }
}

//middleware para log de auditoria
export const auditLog = (req: AuthRequest, res: Response, next: NextFunction) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        console.log(`[AUDIT] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms -User: ${req.user?.id || 'anonymous'}`);
    })

    next()
}