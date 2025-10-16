import { StorageEngine } from "multer"

export interface ProcessoCreateInput {
    tipoProcesso: 'CONSTITUICAO' | 'ALTERACAO' | 'BAIXA'
    subtipo?: string
    dadosJson?: Record<string, any>
    observacoes?: string
}

export interface ProcessoCreateInput {
    status?: 'RASCUNHO' | 'ENVIADO' | 'EM_ANALISE' | 'PENDENTE_DOC' | 'CONCLUIDO' | 'CANCELADO'
    dadosJson?: Record<string, any>
    observacoes?: string
    dataConclusao?: Date
}

export interface ProcessQuery {
    page?: number
    limit?: number
    tipoProcesso?: string
    status?: string
    usuarioId: number
    search?: string
    dataInicio?: string
    dataFim: string
}