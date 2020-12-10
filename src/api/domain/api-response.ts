export interface ApiResponse {
    status: number,
    hasError: boolean,
    error?: string,
    data: any
}

export const ApiResponseBuilder = (status: number, data: any, hasError: boolean,  error?: string | null ): ApiResponse => {
    let response: ApiResponse = {
        status: status,
        hasError: hasError,
        data: data
    }
    
    if(hasError && error){        
        response.error = error
    }
    return response
}