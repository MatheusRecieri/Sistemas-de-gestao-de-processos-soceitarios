import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "@/types";

// cabeçalho de respostas do servidor
export class ApiResponseHandler {
    static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
        const response: ApiResponse<T> = {
            success: true,
            data,
            message
        }

        return res.status(statusCode).json(response)
    }

    static error(res: Response, message: string, statusCode: number = 400, error?: any): Response {
        const response: ApiResponse = {
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error?.message : undefined
        }

        return res.status(statusCode).json(response)
    }

    static paginated<T>(
        res: Response,
        data: T[],
        pagination: PaginatedResponse<T>['pagination'],
        message?: string
    ): Response {
        const response: PaginatedResponse<T> = {
            success: true,
            data,
            pagination,
            message
        }
        return res.status(200).json(response)
    }

    static created<T>(res: Response, data: T, message?: string): Response {
        return this.success(res, data, message, 201)
    }

    static notfound(res: Response, message: string = 'Recurso não encontrado'): Response {
        return this.error(res, message, 404)
    }

    static unauthorized(res: Response, message: string = 'Não autorizado!'): Response {
        return this.error(res, message, 401)
    }

    static forbidden(res: Response, mesage: string = 'Acesso negado'): Response {
        return this.error(res, 'Erro interno do servidor', 500, this.error)
    }

}