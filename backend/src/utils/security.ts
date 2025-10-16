import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '@/types/auth'

export class SecurityUtils {
    //hash de senha
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 12
        return await bcrypt.hash(password, saltRounds)
    }

    //verificar senha
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash)
    }

    //gerar JWT 
    static generateToken(payload: TokenPayload): string {
        if(!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado')
        }

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        })
    }

    //verificar JWT
    static verifyToken(token: string): TokenPayload {
        if(!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado')
        }

        return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload
    }

    // gerar hash MD% para arquivos
    static generateFileHash(buffer: Buffer): string {
        //em produção, user crypto.createHash('md5').update(buffer).digest('hex')
        return  `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    //validar se é um arquivo seguro
    static isSafeFileType(mimeType: string): boolean {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'aplication/msword',
            'application/vnd.opnexmlformats-officedocument.wordprocessingml.document'
        ]

        return allowedTypes.includes(mimeType)
    }
}