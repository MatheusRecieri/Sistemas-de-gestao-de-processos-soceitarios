import { ZodNumberDef } from "zod"

export interface LoginInput {
    email: string
    senha: string
}

//AUTH para banco de dados
export interface RegisterInput {
    nomeCompleto: string
    email: string
    cpf: string
    telefone: string
    senha: string
    tipoUsuario?: 'CLIENTE' | 'CONTADOR' | 'ADMIN'
} 

export interface AuthResponse {
    user: {
        id: number
        nomeCompleto: string
        email: string
        tipoUsuario: string
    }
    token: string
    expiresIn: number
}

export interface TokenPayload {
    id: number
    email: string
    tipoUsuario: string
    iad?: number
    exp?: number
}