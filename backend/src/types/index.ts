//tipos base do sistema
// T = type
export interface ApiResponse <T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

//tipos para autenticação
export interface AuthUser {
    id: number
    email: string
    tipoUsuario: string
}

// extensão request do express

import { Request } from "express"

export interface AuthRequest extends Request {
    user?: AuthUser
}

//tipos de processos
export type ProcessoTipo = 'CONSTITUICAO'| 'ALTERACAO' | 'BAIXA'
export type ProcessoStatus = 'RASCUNHO' | 'ENVIADO' | 'EM_ANALISE' | 'PENDENTE_DOC' | 'CONCLUIDO' | 'CANCELADO'

export interface ProcessoBase {
    tipoProcesso: ProcessoTipo
    subtipo?: string
    status: ProcessoStatus
    dadosJson: Record<string,any>
    observacoes?: string    
}

//tipos especificos para cada processo
export interface ConstituicaoDAdos {
    razaoSocial: string
    nomeFantasia?: string //opcional ter nome fantasia
    areaUtilizada: number
    areaTotalEdificacao: number
    endereco: Endereco
    indiceIPTU: string
    capitalSocial: number
    regimeTributario: 'Simples Nacional' | 'Lucro Real' | 'Lucro presumido'
    objetivoSocial: string
    responsavelCNPJ: string
    socioAdministrador: string 
}


export interface BaixaDados {
    nomeEmpresa: string
    cnpj: string
    dataBaixa: string
    socios: 'Nada Recebem' | 'Recebem'
    valoresRecebidos?: string
}

export interface Endereco {
    cep: string //possivelmente vai ser mudado para string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
}

export * from './auth'
export * from './processos'