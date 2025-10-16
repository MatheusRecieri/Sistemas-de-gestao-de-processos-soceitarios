import { optional, Schema, unknown, z } from 'zod'

//schemas de validação com zod

export const registerSchema = z.object({
    nomeCompleto: z.string().min(1, 'Nome completo é obrigatorio'). max(255),
    email: z.string().email('Email inválido').max(255),
    cpf: z.string().min(11, 'CPF debe ter 11 dígitos').max(14, 'CPF muito longo'),
    telefone: z.string().min(10, 'Telefone inválido').max(20),
    snha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100),
    tipoUsuario: z.enum(['CLIENTE', 'CONTADOR', 'ADMIN']).default('CLIENTE')
})

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    senha: z.string().min(1, 'Senha é obrigatoria')
})

export const processoCreateSchema = z.object({
    tipoProcesso: z.enum(['CONSTITUICAO', 'ALTERACAO', 'BAIXA']),
    subtipo: z.string().optional(),
    dadosJson: z.record(z.any()),
    observacoes: z.string().optional()
})

export const processoUpdateSchema = z.object({
    status: z.enum(['RASCUNHO', 'ENVIADO', 'EM_ANALISE', 'PENDENTE_DOC', 'CONCLUIDO', 'CANCELADO']).optional(),
    dadosJson: z.record(z.any()).optional(),
    observacoes: z.string().optional(),
    dataConclusao: z.string().datetime().optional()
})

//validação cep usando viaCEP
export const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido')

//validação de cpf (formato basico)
export const cpfSchema = z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido')

//validação de CNPJ (formato basico)
export const cnpjSchema = z.string().regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'CNPJ inválido')

//função de validação generica
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    return schema.parse(data)
}

//middleware de validação para Express
export const validateRequest = (schema: z.ZodSchema) => {
    return (req: any, res: any, next: any) => {
        try {
            req.body = validateData(schema, req.body)
            next()
        } catch(error) {
            if(error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados de entrada inválidos',
                    errors: error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                })
            }
            next(error)
        }
    }
}